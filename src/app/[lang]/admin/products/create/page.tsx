'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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
export default function CreateProductPage() {
  const router = useRouter();
  const params = useParams(); // Получаем параметры из URL
  const lang = (params?.lang as string) || 'ua';
  // Стейт для выбора активной языковой вкладки в форме (по умолчанию 'ua')
  const [activeLang, setActiveLang] = useState<'ua' | 'pl' | 'en' | 'lt'>('ua');
  // Стейты для полей товара
  const [title, setTitle] = useState({ ua: '', pl: '', en: '', lt: '' });
  const [description, setDescription] = useState({
    ua: '',
    pl: '',
    en: '',
    lt: '',
  });
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');

  // 1. НОВЫЕ СТЕЙТЫ: Для категории (по умолчанию берем ID первой) и галочки новинки
  const [category, setCategory] = useState('');
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [categories, setCategories] = useState<ICategory[]>([]);
  // Массив ссылок на загруженные медиафайлы (картинки и видео)
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ШАГ 1: Загружаем реальные категории из базы данных
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = (await res.json()) as ICategory[];
          setCategories(data);
          // Автоматически выбираем первую категорию по умолчанию, если они есть
          if (data.length > 0) {
            setCategory(data[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Функции для удобного обновления конкретного языка
  const handleTitleChange = (lang: string, value: string) => {
    setTitle((prev) => ({ ...prev, [lang]: value }));
  };

  const handleDescriptionChange = (lang: string, value: string) => {
    setDescription((prev) => ({ ...prev, [lang]: value }));
  };

  // Обработчик загрузки файлов (можно выбрать один или несколько)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const files = Array.from(e.target.files);

    try {
      // Загружаем файлы по очереди (step by step)
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          // Добавляем новую ссылку в массив
          setMediaUrls((prev) => [...prev, data.url]);
        } else {
          alert(`Loading error / Помилка завантаження: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Loading error / Помилка завантаження:', error);
      alert(
        'An error occurred while sending files to the server / Помилка при відправці файлів на сервер',
      );
    } finally {
      setUploading(false);
    }
  };

  // Удаление файла из списка предпросмотра (до сохранения товара)
  const handleRemoveMedia = (indexToRemove: number) => {
    setMediaUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Сохранение всего товара в базу данных
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price)
      return alert('Name and price are required! / Назва та ціна обов`язкові!');
    const sizeArray = [];
    if (height) sizeArray.push(`Высота: ${height}`);
    if (width) sizeArray.push(`Ширина: ${width}`);
    if (depth) sizeArray.push(`Глубина: ${depth}`);
    setSaving(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: String(price),
          sku,
          images: mediaUrls, // Отправляем весь массив ссылок (картинки + видео)
          size: sizeArray,
          category, // 2. ОТПРАВЛЯЕМ ID КАТЕГОРИИ
          isNewProduct,
        }),
      });

      if (res.ok) {
        alert('Product created successfully! / Товар успішно створено!');
        router.push('/admin/products'); // Возвращаемся к списку товаров
      } else {
        const errData = await res.json();
        alert(`
Saving error: / Помилка збереження ${errData.error}`);
      }
    } catch (error) {
      console.error(
        'Error creating product / Помилка створення товару:',
        error,
      );
      alert('Failed to save item / Не вдалося зберегти товар');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-normal mb-6 text-gray-950 dark:text-white ">
        Adding a new product / Додавання нового товару
      </h1>
      <Link
        href={`/${lang}/admin/products`}
        className="text-sm text-gray-900 hover:underline  hover:text-gray-700 dark:text-gray-200 dark:hover:text-white  whitespace-nowrap text-left"
      >
        ← Back / Назад
      </Link>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800 mb-20"
      >
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Поля ввода для выбранного языка */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
              Product name / Назва товару (
              <span className="uppercase text-blue-500 font-bold">
                {activeLang}
              </span>
              )
            </label>
            <input
              type="text"
              required={activeLang === 'ua'} // Обязательно например только для основного языка
              value={title[activeLang]}
              onChange={(e) => handleTitleChange(activeLang, e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              placeholder={`Product name / Назва мовою ${activeLang.toUpperCase()}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-950 dark:text-white">
              Price EUR / Ціна EUR
              <p className="text-xs font-light text-gray-900 dark:text-gray-200">
                ! Here we specify the price in euros <br />! Тут ми вказуємо
                ціну в євро
              </p>
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white "
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-950 dark:text-white">
              Article (SKU) / Артикул
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
              placeholder="00000000"
            />
          </div>
        </div>

        {/* 3. БЛОК: Выбор категории и Галочка новинки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-950 dark:text-white">
              Category / Категорія
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.title[activeLang] || cat.title.ua || 'Без назви'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center pt-6 pl-2">
            <label className="relative flex items-center cursor-pointer select-none text-sm font-medium text-gray-950 dark:text-white gap-3">
              <input
                type="checkbox"
                checked={isNewProduct}
                onChange={(e) => setIsNewProduct(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-900"
              />
              <span>Our new product / Новинка на головній</span>
            </label>
          </div>
        </div>

        {/* Габаритные размеры */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Dimensions (mm) / Габаритні розміри (мм)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Height (mm)
                <br />
                Висота (мм)
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="500"
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Width (mm)
                <br />
                Ширина (мм)
              </label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="1000"
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Depth (mm)
                <br />
                Глибина (мм)
              </label>
              <input
                type="text"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="300 "
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Загрузчик галереи */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-950 dark:text-white">
            Product Gallery (Photos and Videos) / Галерея товару (Фото та Відео)
          </label>

          <div className="flex items-center gap-2">
            <label className="inline-block py-2 px-4 rounded-full text-sm font-semibold bg-blue-900 text-white hover:bg-blue-700 cursor-pointer transition-colors">
              Add files / Додати файли
              <input
                type="file"
                multiple
                accept="image/*,video/mp4"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          {uploading && (
            <p className="text-xs text-blue-500 mt-1">
              Uploading files to the cloud... / Завантаження файлів у хмару...
            </p>
          )}
        </div>

        {/* Блок предпросмотра загруженных файлов */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            {mediaUrls.map((url, index) => {
              const isVideo = url.endsWith('.mp4');
              return (
                <div
                  key={url}
                  className="relative group aspect-square border rounded-lg overflow-hidden bg-white dark:bg-gray-900"
                >
                  {isVideo ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={url}
                      alt="Превью"
                      fill
                      sizes="(max-width: 768px) 25vw, 150px"
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-90 hover:opacity-100 transition-opacity"
                    title="Delete / Видалити"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">
                    {isVideo ? 'Video' : `Фото ${index + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-2 bg-green-800 rounded-md hover:bg-green-700 disabled:bg-gray-800 transition-colors mt-2 font-medium text-white"
        >
          {saving
            ? 'Saving product... / Збереження товару...'
            : 'Create product / Створити товар'}
        </button>
      </form>
    </div>
  );
}
