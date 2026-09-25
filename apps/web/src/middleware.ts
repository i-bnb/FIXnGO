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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let intl handle routing first
  const response = intlMiddleware(request);

  // Extract locale and path segment
  // e.g. /en/admin/finance -> locale = en, segment = admin
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] && ['en', 'ar'].includes(segments[0]) ? segments[0] : 'en';
  const portal = segments[1]; // 'admin' | 'tech' | 'app' | 'auth'

  // Route protection for authenticated portals
  if (portal === 'admin' || portal === 'tech' || portal === 'app') {
    const sessionCookie = request.cookies.get('fixngo_session')?.value;
    const allowedPortals = sessionCookie ? ROLE_PERMISSIONS[sessionCookie] : null;

    if (!sessionCookie || !allowedPortals || !allowedPortals.includes(portal)) {
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      signInUrl.searchParams.set('returnUrl', pathname);
      signInUrl.searchParams.set('callbackUrl', pathname);
      if (portal === 'app') signInUrl.searchParams.set('role', 'customer');
      if (portal === 'tech') signInUrl.searchParams.set('role', 'technician');
      if (portal === 'admin') signInUrl.searchParams.set('role', 'admin');
      return NextResponse.redirect(signInUrl);
    }
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
