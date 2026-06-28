// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { i18n } from './i18n-config';

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Проверяем, есть ли уже локаль в пути
//   const pathnameHasLocale = i18n.locales.some(
//     (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
//   );

//   // Если хочешь полностью отключить автоматический редирект — оставь только это:
//   // (ничего не делаем, просто пропускаем запрос)
//   if (
//     !pathnameHasLocale &&
//     !pathname.startsWith('/api') &&
//     !pathname.startsWith('/_next')
//   ) {
//     // return NextResponse.redirect(...)  ← закомментировали или удалили
//     console.log(`No locale redirect for: ${pathname}`); // для отладки
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// };
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
