import { useState, useEffect } from 'react';
import { Locale } from '../i18n-config';

const DEFAULT_LOCALE: Locale = 'en';

export function useSettings() {
  // Lazy initialization
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    const saved = localStorage.getItem('locale') as Locale | null;
    return saved && ['en', 'ua', 'pl', 'lt'].includes(saved)
      ? saved
      : DEFAULT_LOCALE;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [isLoaded, setIsLoaded] = useState(true); // уже загружено при инициализации

  // Применяем тему к DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const changeLocale = (newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    setLocale(newLocale);
    window.location.reload();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    locale,
    theme,
    isLoaded,
    changeLocale,
    toggleTheme,
  };
}
