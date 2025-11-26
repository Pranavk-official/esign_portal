import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Get the token from cookies
  // Note: We assume the cookie name is 'access_token'
  const token = request.cookies.get('access_token')?.value;

  // 2. Define protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isPortalRoute = pathname.startsWith('/portal');
  const isAuthRoute = pathname.startsWith('/login');

  // 3. Redirect logic
  
  // Case A: User is NOT logged in but tries to access protected route
  if (!token && (isAdminRoute || isPortalRoute)) {
    const loginUrl = new URL('/login', request.url);
    // loginUrl.searchParams.set('from', pathname); // Optional: Remember where they wanted to go
    return NextResponse.redirect(loginUrl);
  }

  // Case B: User IS logged in but tries to access login page
  if (token && isAuthRoute) {
    // We default to portal dashboard, but ideally we'd know their role.
    // Since middleware can't decode the JWT easily without external libs,
    // we might just let the client-side redirect handle the specific dashboard.
    // For now, let's redirect to a generic landing or let them proceed 
    // (client will redirect them if they are already auth'd).
    
    // Simplest: Let them go to login, client will redirect to dashboard
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/portal/:path*',
    '/login',
  ],
};
