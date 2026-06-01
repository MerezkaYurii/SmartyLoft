'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface ICategory {
  _id: string;
  title: {
    ua?: string;
    pl?: string;
    en?: string;
    lt?: string;
    [key: string]: string | undefined;
  };
  imageUrl: string;
}

export default function AdminCategoriesPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'ua';

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = (await response.json()) as ICategory[];
        setCategories(data);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Ошибка при удалении: ${errorMessage}`);
    }
  };

  if (loading) return <div className="p-6 dark:text-white">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-500">Ошибка: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление категориями</h1>
        <Link
          href={`/${lang}/admin/categories/create`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          + Добавить категорию
        </Link>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold">
              <th className="p-4">Фото</th>
              <th className="p-4">Название ({lang.toUpperCase()})</th>
              <th className="p-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category) => (
              <tr
                key={category._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-200">
                    <Image
                      src={category.imageUrl || '/placeholder.png'}
                      alt="Category"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="p-4 font-medium">
                  {category.title[lang] ||
                    category.title['ua'] ||
                    'Без названия'}
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link
                    href={`/${lang}/admin/categories/edit/${category._id}`}
                    className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-medium"
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium ml-4"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Категорий пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
