'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface ICategory {
  _id: string;
  title: {
    ua?: string;
    pl?: string;
    en?: string;
    lt?: string;
    [key: string]: string | undefined;
  };
}

interface HeaderCategoriesDropdownProps {
  currentLocale: string;
  buttonText: string;
}

export default function HeaderCategoriesDropdown({
  currentLocale,
  buttonText,
}: HeaderCategoriesDropdownProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Загрузка категорий из БД
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = (await response.json()) as ICategory[];
          setCategories(data);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Error loading header categories:', errorMessage);
      }
    }
    fetchCategories();
  }, []);

  // Клик вне дропдауна для закрытия
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 font-bold text-black dark:text-white hover:text-[#0f3995] dark:hover:text-[#3b82f6] transition-colors duration-300"
      >
        {buttonText}
        <svg
          className={`w-4 h-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden py-1 z-50">
          {categories.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Загрузка...
            </div>
          ) : (
            categories.map((category) => {
              const categoryTitle =
                category.title[currentLocale] || category.title['ua'] || '';
              return (
                <Link
                  key={category._id}
                  href={`/${currentLocale}/catalog/${category._id}`}
                  // href={`/${currentLocale}/categories/${category._id}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#0f3995] dark:hover:text-blue-400 transition-colors"
                >
                  {categoryTitle}
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
