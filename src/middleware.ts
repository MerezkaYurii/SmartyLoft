import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  // Пропускаем статику, api и файлы с расширениями
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
