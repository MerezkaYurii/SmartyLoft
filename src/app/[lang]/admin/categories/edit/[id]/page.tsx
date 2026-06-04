'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ILocalizedText {
  ua: string;
  pl: string;
  en: string;
  lt: string;
}

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const par = useParams();
  const lang = (par?.lang as string) || 'ua';
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState<ILocalizedText>({
    ua: '',
    pl: '',
    en: '',
    lt: '',
  });
  const [imageUrl, setImageUrl] = useState<string>('');

  // Загружаем текущие данные категории при старте страницы
  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');

        const categories = (await response.json()) as Array<{
          _id: string;
          title: ILocalizedText;
          imageUrl: string;
        }>;

        const currentCategory = categories.find((cat) => cat._id === id);

        if (!currentCategory) {
          throw new Error('Категорія не знайдена / Категория не найдена');
        }

        setTitle({
          ua: currentCategory.title.ua || '',
          pl: currentCategory.title.pl || '',
          en: currentCategory.title.en || '',
          lt: currentCategory.title.lt || '',
        });
        setImageUrl(currentCategory.imageUrl || '');
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [id]);

  const handleLanguageChange = (lang: keyof ILocalizedText, value: string) => {
    setTitle((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!title.ua.trim()) {
      setError('Назва (UA) є обовʼязковою / Название (UA) обязательно');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      router.push('/admin/categories');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 dark:text-white">Завантаження... / Загрузка...</div>
    );

  return (
    <div className="p-6 max-w-2xl mx-auto dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-normal">
          Editing a category / Редагування категорії
        </h1>
        <Link
          href={`/${lang}/admin/categories`}
          className="text-sm text-gray-900 hover:underline  hover:text-gray-700 dark:text-gray-200 dark:hover:text-white  whitespace-nowrap text-left"
        >
          ← Back / Назад
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Назва (UA) *</label>
          <input
            type="text"
            value={title.ua}
            onChange={(e) => handleLanguageChange('ua', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name (EN)</label>
          <input
            type="text"
            value={title.en}
            onChange={(e) => handleLanguageChange('en', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nazwa (PL)</label>
          <input
            type="text"
            value={title.pl}
            onChange={(e) => handleLanguageChange('pl', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Pavadinimas (LT)
          </label>
          <input
            type="text"
            value={title.lt}
            onChange={(e) => handleLanguageChange('lt', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <hr className="border-gray-200 dark:border-gray-800 my-4" />

        <div>
          <label className="block text-sm font-medium mb-1">
            Link to the picture / Посилання на картинку
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 rounded transition-colors"
            disabled={saving}
          >
            Cancel / Скасувати
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            disabled={saving}
          >
            {saving ? 'Saving / Збереження...' : 'Save / Зберегти'}
          </button>
        </div>
      </form>
    </div>
  );
}
