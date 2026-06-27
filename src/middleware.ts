import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Проверяем локаль (если нет — добавляем defaultLocale)
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  let currentPath = pathname;
  if (pathnameIsMissingLocale) {
    currentPath = `/${i18n.defaultLocale}${pathname}`;
  }

  // 2. ЗАЩИТА АДМИНКИ (проверяем уже с учетом локали)
  // Теперь путь всегда начинается с /ua/admin, /en/admin и т.д.
  if (currentPath.includes('/admin')) {
    // Исключаем страницу логина и API
    if (
      !currentPath.includes('/admin/login') &&
      !currentPath.includes('/api/admin/auth')
    ) {
      const session = request.cookies.get('admin_session')?.value;
      if (!session) {
        return NextResponse.redirect(
          new URL(`/${i18n.defaultLocale}/admin/login`, request.url),
        );
      }
    }
  }

  // Если был rewrite — выполняем его
  if (pathnameIsMissingLocale) {
    return NextResponse.rewrite(new URL(currentPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Исключаем статику, API и изображения
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
