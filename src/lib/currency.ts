import { initMongoConnection } from './mongoose';
import CurrencyRate from '../DataBase/models/CurrencyRate';

// Типизируем доступные языки
type Locale = 'en' | 'ua' | 'pl' | 'lt';

/**
 * Функция для конвертации цены из EUR в целевую валюту в зависимости от языка
 * @param priceInEur — цена товара в евро (строка из базы данных)
 * @param lang — текущий язык страницы
 * @returns отформатированная строка (например, "4500 грн" или "$108")
 */
export async function formatPrice(
  priceInEur: string,
  lang: Locale,
): Promise<string> {
  if ((lang as string) === 'favicon.ico') return '';
  const numericPrice = Number(priceInEur);

  // Если цена в базе указана некорректно, возвращаем как есть
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return `${priceInEur} EUR`;
  }

  await initMongoConnection();
  const rates = await CurrencyRate.findOne().lean();

  // Дефолтные курсы на случай, если база пуста
  const uahRate = rates?.uah ?? 45;
  const plnRate = rates?.pln ?? 4.3;
  const usdRate = rates?.usd ?? 1.08;

  // Логика конвертации и форматирования под каждый язык
  switch (lang) {
    case 'ua': {
      const converted = Math.ceil(numericPrice * uahRate);
      return `${converted} грн`;
    }
    case 'pl': {
      const converted = Math.ceil(numericPrice * plnRate);
      return `${converted} zł`;
    }
    case 'en': {
      const converted = Math.ceil(numericPrice * usdRate);
      return `$${converted}`;
    }
    case 'lt': {
      // В Литве официальная валюта — Евро, выводим базовую цену
      return `${numericPrice} €`;
    }
    default:
      return `${numericPrice} €`;
  }
}
