'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Описываем интерфейс категории в соответствии с нашей схемой
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

interface CatalogSectionsProps {
  lang?: string; // Пропс для определения текущего языка (дефолт 'ua')
}

export default function CatalogSections({ lang = 'ua' }: CatalogSectionsProps) {
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

  if (loading) {
    return (
      <div className="text-center py-10 dark:text-white">
        Загрузка категорий...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">Ошибка: {error}</div>
    );
  }

  return (
    <section className="px-2 py-0.5 sm:px-4 sm:py-1 lg:px-6 lg:py-2 ">
      <div className="container mx-auto py-2 bg-[#EAE6DF] dark:bg-[#2A2B2B] rounded-2xl ">
        {/* Заголовок секции */}
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl italic font-bold text-left pl-10 text-gray-900 dark:text-white ">
            Наши товары:
          </h2>
          <div className="mt-2 ml-10 h-1 w-16 bg-[#0f3995] rounded" />
        </div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
          {categories.map((category) => {
            // Безопасно достаем перевод, если его нет — берем 'ua' или пустую строку
            const categoryTitle =
              category.title[lang] || category.title['ua'] || '';

            return (
              <Link
                key={category._id}
                href={`/catalog/${category._id}`}
                className="group bg-gray-300 dark:bg-gray-900 rounded-lg overflow-hidden border-3 border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                {/* Контейнер для картинки с эффектом зума */}
                <div className="relative w-full pt-[75%] bg-gray-200 overflow-hidden">
                  <Image
                    src={category.imageUrl || '/placeholder.png'} // Фолбек, если картинки нет
                    alt={categoryTitle}
                    fill
                    sizes="(max-w-7xl) 33vw, 100vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>

                {/* Текстовый блок под картинкой */}
                <div className="p-4 flex items-center justify-between bg-gray-300 dark:bg-gray-900 border-t border-gray-50">
                  <span className="text-lg font-normal text-gray-800 dark:text-white group-hover:text-[#0f3995] transition-colors duration-300">
                    {categoryTitle}
                  </span>

                  {/* Круглая стрелочка перехода */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#0f3995] flex items-center justify-center transition-colors duration-300">
                    <svg
                      className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
