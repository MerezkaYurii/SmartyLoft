// i18n.d.ts (создайте этот файл)

// Объявляем модуль по конкретному пути,
// чтобы TypeScript знал о его существовании и типе экспорта по умолчанию.
declare module "../i18n-common.mjs" {
  // Определяем тип именованного экспорта
  export const i18nConfig: {
    i18n: {
      defaultLocale: string;
      locales: string[];
    };
    localePath: string;
  };
}
