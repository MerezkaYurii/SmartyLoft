
import enDictionary from "../dictionaries/en.json";


export const i18n = {
  defaultLocale: 'en',
  locales: ['en','ua', 'pl', 'lt'], // Английский, Украинский, Польский, Литовский
} as const;

export type Locale = (typeof i18n)['locales'][number];

export type Dictionary = typeof enDictionary;