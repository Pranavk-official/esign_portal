import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // DEV: Auth completely disabled
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/portal/:path*',
    '/login',
  ],
};
