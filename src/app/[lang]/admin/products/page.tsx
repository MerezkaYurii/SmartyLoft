'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  _id: string;
  title: string;
  price: number;
  sku?: string;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Загрузка товаров при старте страницы
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // 2. Функция удаления товара
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Товар успешно удален');
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        const errData = await res.json();
        alert(`Ошибка при удалении: ${errData.error}`);
      }
    } catch (error) {
      console.error('Ошибка запроса на удаление:', error);
      alert('Не удалось удалить товар');
    }
  };

  // Выносим экран загрузки на самый верх, убирая кашу из разметки ниже
  if (loading) {
    return <p className="text-center p-6 text-gray-500">Загрузка товаров...</p>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
          Управление товарами
        </h1>
        <Link
          href="/admin/products/create"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
        >
          + Добавить товар
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">Товаров пока нет.</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold border-b border-gray-200 dark:border-gray-800">
                <th className="p-4">Foto</th>
                <th className="p-4">Название</th>
                <th className="p-4">Артикул (SKU)</th>
                <th className="p-4">Цена</th>
                <th className="p-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-gray-100 text-sm">
              {products.map((product) => {
                // Исправлено: гарантируем, что src всегда строка, даже если картинок нет
                const imageSrc =
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : '/photo1.jpg';

                return (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4">
                      <div className="w-12 h-12 relative overflow-hidden rounded-md bg-gray-100">
                        {(() => {
                          // Определяем дефолтную заглушку, если файлов нет
                          const fileSrc =
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : '/photo1.jpg';

                          // Проверяем, является ли файл видеороликом (по расширению в ссылке)
                          const isVideo = fileSrc.match(
                            /\.(mp4|webm|ogg|mov)($|\?)/i,
                          );

                          if (isVideo) {
                            return (
                              <video
                                src={fileSrc}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            );
                          }

                          // Если это обычное изображение
                          return (
                            <Image
                              src={fileSrc}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              priority={false}
                            />
                          );
                        })()}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{product.title}</td>
                    <td className="p-4 text-gray-500">{product.sku || '—'}</td>
                    <td className="p-4 font-semibold">{product.price} грн</td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/edit/${product._id}`}
                        className="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium text-xs transition-colors"
                      >
                        Редактировать
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id, product.title)}
                        className="text-red-900 hover:text-red-600 font-medium transition-colors"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
