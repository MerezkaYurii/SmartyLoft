import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ЗАЩИТА АДМИНКИ
  // Если пользователь пытается зайти в админку
  if (pathname.startsWith('/admin')) {
    // Но это НЕ страница логина и НЕ запрос к API авторизации
    if (pathname !== '/admin/login' && pathname !== '/api/admin/auth') {
      const session = request.cookies.get('admin_session')?.value;

      // Если куки нет — редиректим на страницу входа
      if (!session) {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Проверяем, отсутствует ли локаль в пути
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  if (pathnameIsMissingLocale) {
    const locale = i18n.defaultLocale;

    // Используем rewrite вместо redirect, чтобы Next.js плавно подменил роут на сервере
    return NextResponse.rewrite(new URL(`/${locale}${pathname}`, request.url));
  }
}

export const config = {
  // Игнорируем api, _next статику, favicon и любые файлы популярных форматов картинок
  matcher: [
    '/',
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
