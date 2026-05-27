'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { lang, id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');

  // Загружаем данные товара
  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const product = await res.json();
          setTitle(product.title);
          setPrice(String(product.price));
          setSku(product.sku || '');
          setImages(product.images || []);

          // Парсим размеры из строки "Высота: 50 см, Ширина: 100 см, Глубина: 30 см"
          if (product.size && Array.isArray(product.size)) {
            const sizeString = product.size.join(', ');
            const heightMatch = sizeString.match(/Высота:\s*([^,]+)/);
            const widthMatch = sizeString.match(/Ширина:\s*([^,]+)/);
            const depthMatch = sizeString.match(/Глубина:\s*([^,]+)/);

            if (heightMatch) setHeight(heightMatch[1].trim());
            if (widthMatch) setWidth(widthMatch[1].trim());
            if (depthMatch) setDepth(depthMatch[1].trim());
          }
        } else {
          alert('Товар не найден в базе данных');
          router.push(`/${lang}/admin/products`);
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, lang, router]);

  // Удаление медиафайла из локального стейта формы
  const handleDeleteImage = (indexToDelete: number) => {
    setImages(images.filter((_, index) => index !== indexToDelete));
  };

  // Загрузка новых файлов на Cloudinary через твой API-роут загрузки
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    // Добавляем все выбранные файлы в formData
    Array.from(e.target.files).forEach((file) => {
      formData.append('file', file);
    });

    try {
      // Проверь этот путь, он должен совпадать с твоим роутом загрузки (например, /api/upload)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Ответ от сервера загрузки:', data);

        // 1. Если сервер возвращает массив напрямую в data.urls
        if (data.urls && Array.isArray(data.urls)) {
          setImages((prev) => [...prev, ...data.urls]);
        }
        // 2. Если сервер возвращает массив прямо в корне ответа data
        else if (Array.isArray(data)) {
          setImages((prev) => [...prev, ...data]);
        }
        // 3. Если сервер вернул одну строку (один файл) в data.url
        else if (data.url && typeof data.url === 'string') {
          setImages((prev) => [...prev, data.url]);
        }
        // 4. Если сервер вернул массив под ключом images
        else if (data.images && Array.isArray(data.images)) {
          setImages((prev) => [...prev, ...data.images]);
        } else {
          alert('Файлы загружены, но сервер вернул неизвестный формат данных');
        }
      } else {
        alert('Не удалось загрузить новые файлы');
      }
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      alert('Ошибка при отправке файлов на сервер');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const sizeArray = [];
    if (height) sizeArray.push(`Высота: ${height}`);
    if (width) sizeArray.push(`Ширина: ${width}`);
    if (depth) sizeArray.push(`Глубина: ${depth}`);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price: Number(price), sku, images }),
      });

      if (res.ok) {
        alert('Успешно обновлено!');
        router.push(`/${lang}/admin/products`);
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return <p className="text-center p-6 text-gray-500">Загрузка данных...</p>;

  return (
    <div className="container mx-auto p-6 max-w-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Редактирование ({id})</h1>
        <Link
          href={`/${lang}/admin/products`}
          className="text-sm text-gray-400 hover:underline"
        >
          Назад
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-900 p-6 rounded-xl border border-gray-800"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Цена</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Артикул</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>

        {/* Габаритные размеры */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Габаритные размеры (например: 50 см)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Высота
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="50 см"
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Ширина
              </label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="100 см"
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Глубина
              </label>
              <input
                type="text"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="30 см"
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Галерея товара */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Галерея товара (Фото и Видео)
          </label>

          {/* Кнопка добавления новых файлов */}
          <div className="mb-4">
            <label className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md cursor-pointer transition-colors text-sm font-medium">
              {isUploading ? 'Загрузка...' : 'Добавить файлы'}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Сетка текущих медиафайлов с кнопкой удаления */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => {
                const isVideo = img.match(/\.(mp4|webm|ogg|mov)($|\?)/i);

                return (
                  <div
                    key={index}
                    className="w-20 h-20 relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center group"
                  >
                    {/* Кнопка "Удалить" (Крестик) */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="absolute top-1 right-1 z-10 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-500 transition-colors"
                      title="Удалить"
                    >
                      ×
                    </button>

                    {isVideo ? (
                      <video
                        src={img}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={img}
                        alt={`Медиа ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="w-full py-2 bg-green-700 rounded-md hover:bg-green-600 disabled:bg-gray-800 transition-colors mt-6 font-medium"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}
