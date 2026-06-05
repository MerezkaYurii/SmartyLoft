'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

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
  const params = useParams();
  const lang = (params?.lang as string) || 'ua';
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
        console.error(
          'Error loading products / Помилка завантаження продуктів:',
          error,
        );
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // 2. Функция удаления товара
  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this item? / Ви впевнені, що хочете видалити цей товар? "${title}"?`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Product deleted successfully / Товар успішно видалено');
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        const errData = await res.json();
        alert(
          `Error deleting product / Помилка при видаленні: ${errData.error}`,
        );
      }
    } catch (error) {
      console.error('Error deleting product / Помилка при видаленні:', error);
      alert('Error deleting product / Помилка при видаленні');
    }
  };

  // Выносим экран загрузки на самый верх, убирая кашу из разметки ниже
  if (loading) {
    return (
      <p className="text-center p-6 text-gray-500">
        Loading products / Завантаження товарів...
      </p>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link
        href={`/${lang}`}
        className="block text-center text-sm text-gray-900 hover:underline  hover:text-gray-700 dark:text-gray-200 dark:hover:text-white  whitespace-nowrap "
      >
        ← Back to Site / Повернутися на сайт
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl  font-light text-gray-950 dark:text-white">
          Product management <br /> Управління товарами
        </h1>
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/categories"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm  text-center transition-colors "
          >
            Categories / Категорії
          </Link>
          <Link
            href="/admin/products/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            + Add product / Додати товар
          </Link>
          <Link
            href="/admin/currency-rates"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm  text-center transition-colors "
          >
            Currency rates / Курси валют
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">
          No products yet. / Товарів ще немає.
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold border-b border-gray-200 dark:border-gray-800">
                <th className="p-4">
                  Photo <br /> Фото
                </th>
                <th className="p-4">
                  Name <br /> Назва
                </th>
                <th className="p-4">
                  Description <br /> Опис
                </th>
                <th className="p-4">
                  Article (SKU) <br /> Артикул
                </th>
                <th className="p-4">
                  Price <br /> Ціна
                </th>
                <th className="p-4 text-right">
                  Actions <br /> Дії
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-900 dark:text-gray-100 text-sm">
              {products.map((product) => {
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
                    <td className="p-4 font-medium">
                      {(product as unknown as { title: { ua?: string } }).title
                        ?.ua || 'Без названия'}
                    </td>
                    <td className="p-4 font-medium">
                      {(product as unknown as { description: { ua?: string } })
                        .description?.ua || ''}
                    </td>
                    <td className="p-4 text-gray-500">{product.sku || '—'}</td>
                    <td className="p-4 font-semibold">{product.price} грн</td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/products/edit/${product._id}`}
                        className="text-center inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded font-medium text-xs transition-colors"
                      >
                        Edit <br />
                        Редагувати
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id, product.title)}
                        className="text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Delete <br />
                        Видалити
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
