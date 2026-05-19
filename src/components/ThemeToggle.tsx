'use client';
import { useEffect, useState } from 'react';

import { useDictionary } from '../hooks/useDictionary';

type Theme = 'light' | 'dark';

export default function ThemeSwitcher() {
    const dict = useDictionary();

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

    // Синхронизируем класс темы с тегом <html>. Тут нет вызова setState.
    useEffect(() => {
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
    if (!dict) return null;
    return (
        <button
            onClick={toggleTheme}
            style={{
                paddingLeft: '5px',
                paddingRight: '5px',
                paddingTop: '2px',
                paddingBottom: '3px',
            }}
            className="flex items-center gap-1  bg-[#0f3995] text-white rounded-full border border-[#0f3995] hover:bg-[#0f3995] transition-colors duration-300"
        >
            <svg className="w-5 h-5 fill-current text-whitetransition-colors duration-500">
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
