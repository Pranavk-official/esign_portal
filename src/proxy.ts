import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Auth Proxy (Next.js 16 — renamed from middleware.ts)
 *
 * Performs optimistic authentication checks by inspecting the presence of the
 * `access_token` HttpOnly cookie set by the backend after a successful OTP login.
 *
 * Security model:
 * - Cookie *presence* is checked here for fast, edge-side redirects.
 * - Cookie *validity* is verified by the backend on every actual API request.
 * - If the backend rejects the token (401), the Axios interceptor in client.ts
 *   attempts a refresh, then clears auth state and redirects to /login.
 *
 * This prevents:
 * - Unauthenticated access to /admin and /portal routes (redirect → /login)
 * - Authenticated users hitting /login again (redirect → /)
 *
 * What this does NOT do (intentionally):
 * - Verify JWT signature — that requires the backend secret and would leak it to
 *   the frontend build. The backend performs full JWT validation on every request.
 * - Role-based routing — that is handled client-side after the /users/me fetch,
 *   since roles are in the JWT payload and not safe to rely on here without
 *   signature verification.
 */

// Routes that require the user to be authenticated
// '/' is included so unauthenticated users are redirected immediately at the
// edge instead of seeing a loading spinner while page.tsx calls /users/me.
const PROTECTED_PREFIXES = ['/', '/admin', '/portal'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy API calls and Next.js internals — they manage their own auth
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has('access_token');

  // Redirect unauthenticated users away from protected routes
  // Use exact match for '/' to avoid catching everything else.
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    // Preserve original URL so after login we can redirect back
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico / public assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
