import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = (process.env.PROTECTED_ROUTES || '')
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);

const routeRegex = protectedRoutes.length
  ? new RegExp(`^/(${protectedRoutes.join('|')})(/|$)`)
  : null;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (routeRegex?.test(pathname)) {
    const sessionToken =
      request.cookies.get('next-auth.session-token') ??
      request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
