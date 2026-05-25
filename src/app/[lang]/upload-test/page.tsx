'use client';

import { useState } from 'react';

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Сначала выбери файл!');

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImageUrl(data.url);
        alert('Картинка успешно загружена в Cloudinary!');
      } else {
        alert(`Ошибкабэкенда: ${data.error}`);
      }
    } catch (error) {
      console.error('Ошибка отправки запроса:', error);
      alert('Произошла ошибка при отправке запроса на сервер');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-md text-center min-h-screen flex flex-col justify-center">
      <div className="bg-[#F5F3EF] dark:bg-[#2A2B2B] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Тест Cloudinary
        </h1>

        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 dark:file:bg-gray-100 dark:file:text-black dark:hover:file:bg-gray-200 cursor-pointer"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white font-medium rounded transition-colors"
          >
            {loading ? 'Загрузка...' : 'Загрузить в облако'}
          </button>
        </form>

        {imageUrl && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-900 border rounded-xl space-y-2">
            <p className="text-sm font-semibold text-green-600">
              Ссылка для базы данных:
            </p>
            <input
              type="text"
              readOnly
              value={imageUrl}
              className="w-full p-2 text-xs border rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <img
              src={imageUrl}
              alt="Загружено"
              className="mt-2 w-full h-auto rounded-lg max-h-48 object-cover mx-auto"
            />
          </div>
        )}
      </div>
    </main>
  );
}
