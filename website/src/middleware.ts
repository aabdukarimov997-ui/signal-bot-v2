import { NextRequest, NextResponse } from 'next/server';

// Admin subdomain'lar ro'yxati (admin.xxx.up.railway.app)
const ADMIN_SUBDOMAINS = ['admin'];

// To'liq admin domainlar (Railway avtomatik yaratgan)
const ADMIN_HOSTS = [
  'website-production-2b08.up.railway.app',
  'admin-',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Subdomain aniqlash: admin.xxx.up.railway.app
  const subdomain = hostname.split('.')[0]?.toLowerCase();

  const isAdminSubdomain =
    ADMIN_SUBDOMAINS.includes(subdomain) ||
    hostname.startsWith('admin-') ||
    ADMIN_HOSTS.some((h) => h === hostname || hostname.startsWith(h));

  // Admin subdomain -> /admin ga yo'naltirish
  if (isAdminSubdomain && !pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Asosiy sayt -> admin sahifasiga to'g'ridan-to'g'ri kirishni oldini olish emas
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|aaa-logo.png|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)'],
};
