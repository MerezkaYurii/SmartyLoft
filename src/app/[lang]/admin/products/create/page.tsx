'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreateProductPage() {
  const router = useRouter();

  // Стейты для полей товара
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');

  // Массив ссылок на загруженные медиафайлы (картинки и видео)
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
          alert(`Ошибка при загрузке файла: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      alert('Произошла ошибка при отправке файлов на сервер');
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
    if (!title || !price) return alert('Название и цена обязательны!');

    setSaving(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: Number(price),
          sku,
          images: mediaUrls, // Отправляем весь массив ссылок (картинки + видео)
        }),
      });

      if (res.ok) {
        alert('Товар успешно создан!');
        router.push('/admin/products'); // Возвращаемся к списку товаров
      } else {
        const errData = await res.json();
        alert(`Ошибка сохранения: ${errData.error}`);
      }
    } catch (error) {
      console.error('Ошибка при создании товара:', error);
      alert('Не удалось сохранить товар');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-950 dark:text-white">
        Добавление нового товара
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800"
      >
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-950 dark:text-white">
            Название товара *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-950 dark:text-white">
              Цена (грн) *
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white "
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-950 dark:text-white">
              Артикул (SKU)
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Загрузчик галереи */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-950 dark:text-white ">
            Галерея товара (Фото и Видео)
          </label>
          <input
            type="file"
            multiple // Позволяет выбирать много файлов за раз
            accept="image/*,video/mp4"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-950 file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-50"
          />
          {uploading && (
            <p className="text-xs text-blue-500 mt-1">
              Загрузка файлов в облако...
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
                    title="Удалить"
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
          className="w-full py-3 bg-green-900 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          {saving ? 'Сохранение товара...' : 'Создать товар'}
        </button>
      </form>
    </div>
  );
}
