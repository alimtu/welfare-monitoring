import { NextResponse } from 'next/server';

// CSR + localStorage only: middleware cannot enforce auth.
// Keep middleware as a no-op (or remove the file) to avoid incorrect redirects.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
