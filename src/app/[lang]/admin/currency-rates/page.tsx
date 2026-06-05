'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface IRates {
  uah: number;
  pln: number;
  usd: number;
}

export default function CurrencyRatesPage() {
  const [rates, setRates] = useState<IRates>({ uah: 45, pln: 4.3, usd: 1.08 });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const params = useParams(); // Получаем параметры из URL
  const lang = (params?.lang as string) || 'ua';

  // Загружаем текущие курсы из базы
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('/api/currencyRate');
        if (res.ok) {
          const data = await res.json();
          setRates({
            uah: data.uah,
            pln: data.pln,
            usd: data.usd,
          });
        }
      } catch (error) {
        console.error('Error loading rates:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  const handleInputChange = (field: keyof IRates, value: string) => {
    setRates((prev) => ({
      ...prev,
      [field]: value === '' ? 0 : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/currencyRate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rates),
      });

      if (res.ok) {
        setMessage({
          text: 'Курси успішно оновлено! / Курсы успешно обновлены!',
          isError: false,
        });
      } else {
        const errData = await res.json();
        setMessage({
          text: errData.error || 'Помилка збереження / Ошибка сохранения',
          isError: true,
        });
      }
    } catch (error) {
      console.error('Network error during PUT:', error);
      setMessage({ text: 'Помилка мережі / Ошибка сети', isError: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center p-6 text-gray-500">
        Loading currency rates / Завантаження курсів валют...
      </p>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto dark:text-white">
      <Link
        href={`/${lang}/admin/products`}
        className=" block text-right text-sm text-gray-900 hover:underline  hover:text-gray-700 dark:text-gray-200 dark:hover:text-white  whitespace-nowrap "
      >
        ← Back / Назад
      </Link>
      <h1 className="text-2xl font-medium mb-3 text-gray-950 dark:text-white">
        Exchange rate management <br />
        Управління курсами валют (База: 1 EUR)
      </h1>
      <p className="text-[14px]">
        ! The price list is in Euros, and here we set the exchange rate
        coefficient.
        <br />! У прайсі вказується валюта євро, а тут ми ставимо коефіцієнт
        курсу валют.
      </p>
      {message && (
        <div
          className={`mb-4 p-3 rounded border ${
            message.isError
              ? 'bg-red-100 border-red-400 text-red-700'
              : 'bg-green-100 border-green-400 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            1 EUR → Українська гривня (UAH)
          </label>
          <input
            type="number"
            step="0.01"
            value={rates.uah || ''}
            onChange={(e) => handleInputChange('uah', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            1 EUR → Польський злотий (PLN)
          </label>
          <input
            type="number"
            step="0.01"
            value={rates.pln || ''}
            onChange={(e) => handleInputChange('pln', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            1 EUR → Долар США (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={rates.usd || ''}
            onChange={(e) => handleInputChange('usd', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
          disabled={saving}
        >
          {saving ? 'Saving / Збереження...' : 'Save courses / Зберегти курси'}
        </button>
      </form>
    </div>
  );
}
