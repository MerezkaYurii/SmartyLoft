'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Структура метаданных, если они пустые объекты
interface IMetadata {
  [key: string]: unknown;
}

interface IMessage {
  type: string;
  data: {
    content: string;
    additional_kwargs?: IMetadata;
    response_metadata?: IMetadata;
    tool_calls?: unknown[]; // Если структура tool_calls известна, можно типизировать строже
    invalid_tool_calls?: unknown[];
  };
}

interface IDialog {
  _id: string;
  sessionId: string;
  messages: IMessage[];
}

export default function DialogsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || 'ua';
  const [dialogs, setDialogs] = useState<IDialog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const formatDateFromId = (id: string) => {
    try {
      const timestamp = parseInt(id.substring(0, 8), 16) * 1000;
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'Date unknown / Дата невідома';
    }
  };

  const fetchDialogs = async () => {
    try {
      const response = await fetch('/api/dialogs', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to fetch dialogs');
      setDialogs(data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDialogs();
    };

    loadData().catch((err) => {
      console.error('Failed to load dialogs:', err);
    });
  }, []);

  // ФУНКЦИЯ УДАЛЕНИЯ ЗАКАЗА
  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this dialog? / Ви впевнені?'))
      return;

    try {
      const response = await fetch(`/api/dialogs?id=${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to delete dialog');

      toast.success('Dialog deleted / Діалог видалено');
      setDialogs((prev) => prev.filter((item) => item._id !== orderId));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1F2020] text-white">
        <p className="text-lg uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl mb-20">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/admin/products`}
          className="block text-center text-sm text-gray-900 hover:underline  hover:text-gray-700 dark:text-gray-200 dark:hover:text-white  whitespace-nowrap "
        >
          ← Back / Повернутися
        </Link>
        <h1 className="text-3xl font-medium  text-white tracking-wide mb-8 ">
          Dialogs / Діалоги
        </h1>

        {dialogs.length === 0 ? (
          <p className="text-gray-200 italic">
            No orders found / Замовлень не знайдено
          </p>
        ) : (
          <div className="overflow-x-auto bg-[#2A2B2B] rounded-2xl border border-gray-700 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151616] text-xs  tracking-wider font-semibold border-b border-gray-700 text-white">
                  <th className="p-4">Customer / Клієнт</th>

                  <th className="p-4">Date / Дата</th>
                  <th className="p-4 text-right">Actions / Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 text-sm">
                {dialogs.map((dialog) => {
                  return (
                    <tr
                      key={dialog._id}
                      className="hover:bg-[#323434] transition-colors"
                    >
                      {/* ИМЯ КЛИЕНТА */}
                      <td className="p-4 font-medium text-gray-200">
                        {dialog.sessionId}
                      </td>

                      {/* ДАТА */}
                      <td className="p-4 text-gray-400">
                        {formatDateFromId(dialog._id)}
                      </td>

                      {/* КНОПКИ ДЕЙСТВИЙ */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() =>
                            router.push(`/${lang}/admin/dialogs/${dialog._id}`)
                          }
                          className="px-3 py-1.5 text-xs font-medium  tracking-wider bg-[#3A3B3B] text-white rounded-lg hover:bg-[#4A4B4B] transition-colors border border-gray-600"
                        >
                          Reading the dialogue / Читати діалог
                        </button>
                        <button
                          onClick={() => handleDelete(dialog._id)}
                          className="px-3 py-1.5 text-xs font-medium  tracking-wider bg-transparent text-red-500 hover:text-red-600 rounded-lg transition-colors"
                        >
                          Delete / Видалити
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
    </div>
  );
}
