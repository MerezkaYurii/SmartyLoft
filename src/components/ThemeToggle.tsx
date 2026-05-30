'use client';
import { useEffect, useState } from 'react';
import { useDictionary } from '../hooks/useDictionary';

type Theme = 'light' | 'dark';

export default function ThemeSwitcher() {
  const dict = useDictionary();

  // Инициализируем тему.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      return savedTheme === 'dark' || (!savedTheme && prefersDark)
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  // Единственный эффект, который только синхронизирует тему с DOM (как и просит документация)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // ХИТРЫЙ ХАК: Если window еще не определен (мы на сервере) ИЛИ словарь еще не загрузился,
  // рендерим безопасную заглушку. Без всяких setMounted!
  if (typeof window === 'undefined' || !dict) {
    return (
      <button
        style={{ width: '110px', height: '32px' }}
        className="bg-[#0f3995] rounded-full opacity-50 cursor-not-allowed"
        disabled
      />
    );
  }

  // Этот код выполнится строго в браузере
  return (
    <button
      onClick={toggleTheme}
      style={{
        paddingLeft: '5px',
        paddingRight: '5px',
        paddingTop: '2px',
        paddingBottom: '3px',
      }}
      className="flex items-center gap-1 bg-[#0f3995] text-white rounded-full border border-[#0f3995] hover:bg-[#0f3995]/80 transition-colors duration-300"
    >
      <svg className="w-5 h-5 fill-current text-white transition-colors duration-500">
        {theme === 'light' ? (
          <use href="/spriteSL.svg#icon-moon-svgrepo-com" />
        ) : (
          <use href="/spriteSL.svg#icon-sun" />
        )}
      </svg>

      <span className="text-sm font-medium">
        {theme === 'light' ? dict.header.darkMode : dict.header.lightMode}
      </span>
    </button>
  );
}
