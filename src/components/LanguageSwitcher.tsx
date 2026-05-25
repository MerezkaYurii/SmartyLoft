/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Locale } from '../i18n-config'; // Проверив структуру, импортируем тип отсюда
import { useEffect, useRef, useState } from 'react';
import { useDictionary } from '../hooks/useDictionary';

export default function LanguageSwitcher() {
  const dict = useDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = (pathname?.split('/')[1] || 'en') as Locale;

  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return '/';

    const segments = pathname.split('/');
    const knownLocales: Locale[] = ['en', 'pl', 'lt', 'ua'];
    const hasLocale = knownLocales.includes(segments[1] as Locale);

    if (hasLocale) {
      segments[1] = locale;
      return segments.join('/');
    } else {
      return `/${locale}${pathname === '/' ? '' : pathname}`;
    }
  };

  const changeLanguage = (lang: Locale) => {
    setIsOpen(false);
    localStorage.setItem('lang', lang);

    // В App Router мы просто пушим новый сформированный URL-строку
    const newPath = redirectedPathname(lang);
    router.push(newPath);
  };

  // Слушатель клика снаружи для закрытия меню
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  if (!dict) return null;
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          paddingLeft: '5px',
          paddingRight: '5px',
          paddingTop: '2px',
          paddingBottom: '3px',
        }}
        className="flex items-center gap-1  bg-[#0f3995] text-white rounded-full border border-[#0f3995] hover:bg-[#0f3995]/80  transition-colors duration-300"
      >
        <svg
          className="w-5 h-5 fill-white stroke-none "
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <use href="/spriteSL.svg#icon-sphere" />
        </svg>

        <span className="font-regular text-sm">{dict.header.language}</span>

        <svg
          className={`w-3 h-3 fill-white stroke-none transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <use href="/spriteSL.svg#icon-checkmark" />
        </svg>
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-500 rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {[
            { code: 'en', label: 'En English' },
            { code: 'pl', label: 'Pl Polski' },
            { code: 'lt', label: 'Lt Lietuvių' },
            { code: 'ua', label: 'Ua Українська' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code as Locale)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 ${
                currentLocale === lang.code
                  ? 'bg-gray-300 font-semibold dark:bg-gray-800'
                  : ''
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
