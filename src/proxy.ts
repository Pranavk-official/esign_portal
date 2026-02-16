import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Server-Side Route Guard (Next.js 16 Proxy)
 *
 * Optimistic cookie-presence check — no JWT decryption.
 * This is the primary auth gate; client-side `useRequireAuth()` is the secondary guard.
 *
 * Rules:
 * 1. `/login` + has access_token cookie → redirect to `/` (root page routes to dashboard)
 * 2. `/admin/*`, `/portal/*` + no cookie → redirect to `/login`
 * 3. Everything else → pass through
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has("access_token");

  // Authenticated users should not see the login page
  if (pathname.startsWith("/login")) {
    if (hasToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes require a session cookie
  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
