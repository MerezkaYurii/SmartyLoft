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
  // Стейт для активной языковой вкладки
  const [activeLang, setActiveLang] = useState<'ua' | 'pl' | 'en' | 'lt'>('ua');
  const [title, setTitle] = useState({ ua: '', pl: '', en: '', lt: '' });
  const [description, setDescription] = useState({
    ua: '',
    pl: '',
    en: '',
    lt: '',
  });
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  // Функции обновления текста для конкретного языка
  const handleTitleChange = (lang: string, value: string) => {
    setTitle((prev) => ({ ...prev, [lang]: value }));
  };

  const handleDescriptionChange = (lang: string, value: string) => {
    setDescription((prev) => ({ ...prev, [lang]: value }));
  };

  // Загружаем данные товара
  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const product = await res.json();
          if (product.title) {
            setTitle({
              ua: product.title.ua || '',
              pl: product.title.pl || '',
              en: product.title.en || '',
              lt: product.title.lt || '',
            });
          }

          if (product.description) {
            setDescription({
              ua: product.description.ua || '',
              pl: product.description.pl || '',
              en: product.description.en || '',
              lt: product.description.lt || '',
            });
          }
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
          alert(
            'Product not found in the database / Товар не знайдено у базі даних',
          );
          router.push(`/${lang}/admin/products`);
        }
      } catch (error) {
        console.error('Loading error / Помилка завантаження:', error);
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
        console.log(
          'Response from upload server / Відповідь від сервера завантаження:',
          data,
        );

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
          alert(
            'Files uploaded, but the server returned an unknown data format / Файли завантажені, але сервер повернув невідомий формат даних',
          );
        }
      } else {
        alert('Failed to upload new files / Не вдалося завантажити нові файли');
      }
    } catch (error) {
      console.error(
        'Error uploading fil`es / Помилка завантаження файлів:',
        error,
      );
      alert(
        'Error sending files to server / Помилка відправки файлів на сервер',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const sizeArray = [];
    if (height) sizeArray.push(`Висота: ${height}`);
    if (width) sizeArray.push(`Ширина: ${width}`);
    if (depth) sizeArray.push(`Глибина: ${depth}`);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: String(price),
          sku,
          images,
          size: sizeArray,
        }),
      });

      if (res.ok) {
        alert('Successfully updated / Успішно оновлено!');
        router.push(`/${lang}/admin/products`);
      } else {
        alert('Error saving / Помилка при збереженні');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <p className="text-center p-6 text-gray-500">
        Loading data / Завантаження даних...
      </p>
    );

  return (
    <div className="container mx-auto p-6 max-w-xl text-white pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium"> Editing / Редагування ({id})</h1>
        <Link
          href={`/${lang}/admin/products`}
          className="text-sm text-gray-300 hover:underline   hover:text-white   whitespace-nowrap  test-right"
        >
          ← Back / Назад
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-900 p-6 rounded-xl border border-gray-800"
      >
        {/* Поля ввода для выбранного языка */}
        {/* Переключатель языковых вкладок */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          {(['ua', 'pl', 'en', 'lt'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors uppercase ${
                activeLang === lang
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-gray-200 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product name / Назва товару (
              <span className="uppercase text-blue-500 font-bold">
                {activeLang}
              </span>
              )
            </label>
            <input
              type="text"
              required={activeLang === 'ua'}
              value={title[activeLang]}
              onChange={(e) => handleTitleChange(activeLang, e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              placeholder={`Product name / Назва мовою ${activeLang.toUpperCase()}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product description / Опис товару (
              <span className="uppercase text-blue-500 font-bold">
                {activeLang}
              </span>
              )
            </label>
            <textarea
              rows={5}
              required={activeLang === 'ua'}
              value={description[activeLang]}
              onChange={(e) =>
                handleDescriptionChange(activeLang, e.target.value)
              }
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              placeholder={`Product description / Опис мовою ${activeLang.toUpperCase()}`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price / Ціна</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Article (SKU) / Артикул
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
          />
        </div>

        {/* Габаритные размеры */}
        <div className="bg-gray-200 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
          <h3 className="text-sm font-medium  text-gray-900 dark:text-gray-200  tracking-wider mb-3">
            Dimensions (mm) / Габаритні розміри (мм)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-900 dark:text-gray-200 mb-1">
                Height (mm)
                <br />
                Висота (мм)
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
              <label className="block text-xs font-medium text-gray-900 dark:text-gray-200 mb-1">
                Width (mm)
                <br />
                Ширина (мм)
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
              <label className="block text-xs font-medium text-gray-900 dark:text-gray-200 mb-1">
                Depth (mm)
                <br />
                Глибина (мм)
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
          <label className="block text-sm font-medium mb-2text-gray-50 mb-4">
            Product Gallery (Photos and Videos) / Галерея товару (Фото та Відео)
          </label>

          {/* Кнопка добавления новых файлов */}
          <div className="mb-4">
            <label className="inline-block px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-md cursor-pointer transition-colors text-sm font-medium">
              {isUploading
                ? 'Loading / Завантаження...'
                : 'Add files / Додати файли'}
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
                      className="absolute top-1 right-1 z-10 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-500 transition-colors"
                      title="Delete / Видалити"
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
          className="w-full py-2 bg-green-800 rounded-md hover:bg-green-700 disabled:bg-gray-800 transition-colors mt-6 font-medium"
        >
          {isSaving
            ? 'Loading / Завантаження...'
            : 'Save changes / Зберегти зміни'}
        </button>
      </form>
    </div>
  );
}
