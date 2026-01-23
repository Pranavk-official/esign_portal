import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  // Allow public routes
  if (pathname.startsWith("/login")) {
    if (accessToken) {
      // Redirect to root if already authenticated
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) {
    if (!accessToken) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
