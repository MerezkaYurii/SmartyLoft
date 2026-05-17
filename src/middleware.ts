import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Проверяем, есть ли уже локаль в URL (например, /pl/about)
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Если локали нет в пути — перенаправляем на дефолтную
  if (pathnameIsMissingLocale) {
    const locale = i18n.defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }
}

export const config = {
  // Игнорируем API, статику (_next) и картинки
 matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sprite.svg|[\\w-]+\\.\\w+).*)',
  ],
};