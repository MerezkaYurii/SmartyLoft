'use client';

import { usePathname } from 'next/navigation';
import { useDictionary } from '../hooks/useDictionary';
import LanguageSwitcher from './LanguageSwitcher';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import HeaderCategoriesDropdown from './HeaderCategoriesDropdown';

// Загружаем компонент динамически только на клиенте
const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => (
    // Заглушка, пока компонент грузится на клиенте
    <button
      style={{ width: '110px', height: '32px' }}
      className="bg-[#0f3995] rounded-full opacity-50 cursor-not-allowed"
      disabled
    >
      Loading...
    </button>
  ),
});

export default function Header() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';
  const dict = useDictionary();

  ////
  const isAuth = false;
  /////

  if (!dict) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-400/80 shadow-sm dark:bg-gray-900/70 dark:text-white transition-colors duration-500 ">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex  items-center justify-between h-[70px] ">
        <Link href={`/${currentLocale}`} className="flex items-center ">
          <svg className="w-40 h-auto dark:hidden">
            <use href="/spriteSL.svg#icon-Logo-smartyloft" />
          </svg>
          <svg className="w-40 h-auto hidden dark:block">
            <use href="/spriteSL.svg#icon-Logo-smartyloft-white" />
          </svg>
        </Link>

        <HeaderCategoriesDropdown
          currentLocale={currentLocale}
          buttonText={dict.header.categories}
        />

        <Link
          href={`/${currentLocale}/contacts`}
          className="flex items-center font-bold  text-black dark:text-white"
        >
          {dict.header.contacts}
        </Link>

        <ThemeToggle />
        <LanguageSwitcher />

        {/* --- НАЧАЛО БЛОКА АУТЕНТИФИКАЦИИ --- */}
        {!isAuth ? (
          <Link
            href={`/${currentLocale}/login`}
            className="flex items-center gap-1 font-bold text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>Войти</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </Link>
        ) : (
          /* ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН: Выводим аватарку и имя */
          <div className="flex items-center gap-2 cursor-pointer group relative">
            {/* Контейнер для круглой аватарки */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-200 flex items-center justify-between">
              {/* Пока нет картинки из БД, используем временную заглушку-иконку. 
        Позже заменим на <Image src={user.image} ... /> 
      */}
              <svg
                className="w-full h-full text-gray-500 p-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {/* Имя пользователя (пока хардкод для теста верстки) */}
            <span className="font-medium text-sm text-black dark:text-white hidden sm:block">
              Юрий Мережка
            </span>

            {/* Маленькая стрелочка вниз, как на твоем скриншоте */}
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>

            {/* ЗАГЛУШКА ПОД БУДУЩЕЕ МЕНЮ: 
      Оно будет появляться при наведении (благодаря классам group-hover:block)
    */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-50">
              <Link
                href={`/${currentLocale}/logout`}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Выйти из аккаунта
              </Link>
            </div>
          </div>
        )}
        {/* --- КОНЕЦ БЛОКА АУТЕНТИФИКАЦИИ --- */}
      </div>
    </header>
  );
}
