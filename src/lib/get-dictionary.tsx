import 'server-only'; // Гарантирует, что эта функция выполняется только на сервере
import type { Locale } from '../i18n-config';

const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    pl: () => import('@/dictionaries/pl.json').then((module) => module.default),
    lt: () => import('@/dictionaries/lt.json').then((module) => module.default),
    ua: () => import('@/dictionaries/ua.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
    return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en();
};