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
      </div>
    </header>
  );
}
