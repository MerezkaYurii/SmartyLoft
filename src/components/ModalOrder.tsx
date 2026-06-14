'use client';

import { useState } from 'react';
import { useDictionary } from '../hooks/useDictionary';
import { toast } from 'react-hot-toast'; // Импортируем тосты

interface ModalOrderProps {
  buttonLabel?: string;
}

export default function ModalOrder({ buttonLabel }: ModalOrderProps) {
  const dict = useDictionary();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });
  const [files, setFiles] = useState<File[]>([]); // Стейт для хранения выбранных файлов
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Обработчик выбора файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  // Удаление конкретного файла из списка перед отправкой
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Собираем данные через FormData, чтобы улетели и строки, и файлы
      const data = new FormData();
      data.append('name', formData.name);
      data.append('contact', formData.contact);
      data.append('message', formData.message);

      // Добавляем каждый файл в FormData
      files.forEach((file) => {
        data.append('files', file);
      });

      const res = await fetch('/api/send-mail', {
        method: 'POST',
        // ВАЖНО: Хедер Content-Type указывать НЕ надо, браузер сам выставит multipart/form-data
        body: data,
      });

      if (res.ok) {
        toast.success(dict?.ModalOrder?.success || 'Success!');
        setFormData({ name: '', contact: '', message: '' });
        setFiles([]);
        setIsOpen(false);
      } else {
        toast.error(dict?.ModalOrder?.error || 'Error sending message');
      }
    } catch {
      toast.error(dict?.ModalOrder?.error || 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    setFormData({ name: '', contact: '', message: '' });
    setFiles([]);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  if (!dict) return null;

  return (
    <>
      <button
        onClick={openModal}
        className="px-20 py-2 bg-[#0f3995] border-[#0f3995] hover:bg-[#0f3995]/80 text-white rounded-xl shadow-lg hover:opacity-80 transition duration-500 cursor-pointer"
      >
        {buttonLabel || dict.ModalOrder.cta}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#EAE6DF] dark:bg-[#2A2B2B] p-6 rounded-2xl max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-medium mb-4 text-center text-neutral-800 dark:text-neutral-100">
              {dict.ModalOrder.title}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder={dict.ModalOrder.phName}
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2020] border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-[#0f3995] text-gray-900 dark:text-gray-100 transition-colors"
              />
              <input
                type="text"
                name="contact"
                placeholder={dict.ModalOrder.phEmail}
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2020] border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-[#0f3995] text-gray-900 dark:text-gray-100 transition-colors"
              />
              <textarea
                name="message"
                placeholder={dict.ModalOrder.phTextarea}
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2020] border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-[#0f3995] text-gray-900 dark:text-gray-100 transition-colors"
              />

              {/* Поле выбора нескольких файлов */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {dict.ModalOrder.addFiles || 'Attach files'}
                </label>

                <div className="flex flex-col items-start">
                  {/* Скрываем стандартный инпут */}
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {/* Красивый кастомный лейбл, который выполняет роль кнопки */}
                  <label
                    htmlFor="file-upload"
                    className="inline-block py-2 px-4 rounded-xl text-sm font-medium bg-[#0f3995]/10 text-[#0f3995] dark:bg-white/10 dark:file:bg-white dark:text-white hover:bg-[#0f3995] cursor-pointer transition-colors"
                  >
                    {dict.ModalOrder.chooseFileBtn || 'Choose files...'}
                  </label>
                </div>

                {/* Список выбранных файлов с возможностью удаления */}
                {files.length > 0 && (
                  <ul className="text-xs space-y-1 max-h-24 overflow-y-auto pt-1 text-gray-700 dark:text-gray-300">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-white/50 dark:bg-black/20 px-2 py-1 rounded-lg"
                      >
                        <span className="truncate max-w-[80%]">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 font-bold ml-2"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-[#0f3995] hover:bg-[#0f3995]/80 text-white font-medium transition duration-500 disabled:opacity-50"
              >
                {loading ? dict.ModalOrder.loding : dict.ModalOrder.btn}
              </button>
            </form>

            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
