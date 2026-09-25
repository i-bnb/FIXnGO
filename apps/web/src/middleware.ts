import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['admin'],
  ACCOUNTANT: ['admin'],
  DISPATCHER: ['admin'],
  OPERATIONS_MANAGER: ['admin'],
  STOREKEEPER: ['admin'],
  TECHNICIAN: ['tech'],
  CUSTOMER: ['app'],
};

const ROLE_HOMES: Record<string, string> = {
  SUPER_ADMIN: 'admin',
  ACCOUNTANT: 'admin',
  DISPATCHER: 'admin',
  OPERATIONS_MANAGER: 'admin',
  STOREKEEPER: 'admin',
  TECHNICIAN: 'tech',
  CUSTOMER: 'app',
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let intl handle routing first
  const response = intlMiddleware(request);

  // Extract locale and path segment
  // e.g. /en/admin/finance -> locale = en, segment = admin
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] && ['en', 'ar'].includes(segments[0]) ? segments[0] : 'en';
  const portal = segments[1]; // 'admin' | 'tech' | 'app' | 'auth'

  // Legacy redirect: if user navigates to old /auth/signin, redirect to appropriate login or home
  if (portal === 'auth' && segments[2] === 'signin') {
    const roleParam = request.nextUrl.searchParams.get('role');
    const returnUrlParam = request.nextUrl.searchParams.get('returnUrl') || request.nextUrl.searchParams.get('callbackUrl');
    let target = `/${locale}`;
    if (roleParam === 'admin') target = `/${locale}/login/admin`;
    else if (roleParam === 'technician') target = `/${locale}/login/technician`;
    else if (roleParam === 'customer') target = `/${locale}/login/customer`;
    const redirectUrl = new URL(target, request.url);
    if (returnUrlParam) redirectUrl.searchParams.set('returnUrl', returnUrlParam);
    return NextResponse.redirect(redirectUrl);
  }

  // Route protection for authenticated portals
  if (portal === 'admin' || portal === 'tech' || portal === 'app') {
    const sessionCookie = request.cookies.get('fixngo_session')?.value;
    const allowedPortals = sessionCookie ? ROLE_PERMISSIONS[sessionCookie] : null;

    // 1. Unauthenticated -> redirect to dedicated portal login page
    if (!sessionCookie) {
      let loginPath = `/${locale}/login/customer`;
      if (portal === 'admin') loginPath = `/${locale}/login/admin`;
      if (portal === 'tech') loginPath = `/${locale}/login/technician`;

      const signInUrl = new URL(loginPath, request.url);
      signInUrl.searchParams.set('returnUrl', pathname);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 2. Authenticated but unauthorized for this portal -> redirect to user's OWN home portal
    if (!allowedPortals || !allowedPortals.includes(portal)) {
      const homePortal = ROLE_HOMES[sessionCookie] || 'app';
      const homeUrl = new URL(`/${locale}/${homePortal}`, request.url);
      homeUrl.searchParams.set('denied', 'true');
      return NextResponse.redirect(homeUrl);
    }

    // 3. User is authorized -> disable client/proxy page caching so Back button cannot leak data after logout
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Security Headers Hardening
  const headers = response.headers;

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.onrender.com",
    "connect-src 'self' http://localhost:4000 ws://localhost:4000 https://*.onrender.com wss://*.onrender.com https://*.vercel.app https://api.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  headers.set('Content-Security-Policy', cspDirectives);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-site');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|uploads|favicon\\.ico|robots\\.txt|.*\\..*).*)'],
};
