import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/students',
  '/teachers',
  '/classes',
  '/schedules',
  '/curriculum',
  '/settings',
  '/finance',
  '/grades',
  '/attendance',
  '/profile',
  '/student',
  '/teacher',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    const login = request.nextUrl.clone();
    login.pathname = '/auth/login';
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/students',
    '/students/:path*',
    '/teachers',
    '/teachers/:path*',
    '/classes',
    '/classes/:path*',
    '/schedules',
    '/schedules/:path*',
    '/curriculum',
    '/curriculum/:path*',
    '/settings',
    '/settings/:path*',
    '/finance',
    '/finance/:path*',
    '/grades',
    '/grades/:path*',
    '/attendance',
    '/attendance/:path*',
    '/profile',
    '/profile/:path*',
    '/student/:path*',
    '/teacher/:path*',
  ],
};
