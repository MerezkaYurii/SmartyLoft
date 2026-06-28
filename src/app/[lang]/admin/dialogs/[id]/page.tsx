'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface IMessage {
  type: string;
  data: {
    content: string;
  };
}

interface IDialog {
  _id: string;
  sessionId: string;
  messages: IMessage[];
  createdAt: string;
}

export default function AdminDialogsDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dialogId = params?.id as string;

  const [dialog, setDialog] = useState<IDialog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const cleanAiMessage = (content: string) => {
    try {
      // Проверяем, начинается ли текст с JSON
      if (content.startsWith('{"reply":')) {
        const parsed = JSON.parse(content);
        return parsed.reply || content;
      }
    } catch (e) {
      // Если это не JSON, возвращаем как есть
      return content;
    }
    return content;
  };
  useEffect(() => {
    if (!dialogId) return;

    const fetchDialog = async () => {
      try {
        const response = await fetch(`/api/dialogs/${dialogId}`, {
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Failed to fetch dialog');

        const data = await response.json();
        setDialog(data);
      } catch (error) {
        console.error(error);
        toast.error('Error loading dialog');
        router.push('/admin/dialogs'); // Исправлено на правильный путь
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDialog();
  }, [dialogId, router]);

  if (isLoading) {
    return <div className="p-4 text-center text-xs text-white">Loading...</div>;
  }

  if (!dialog) return null;

  return (
    <div className="container mx-auto p-4 max-w-3xl text-gray-100">
      <button
        onClick={() => router.push('/admin/dialogs')} // Исправлено на правильный путь
        className="mb-4 text-sm font-medium text-gray-800 dark:text-gray-100 p-2 rounded-lg hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
      >
        ← Back to list / Повернутися до списку
      </button>

      <div className="bg-[#2A2B2B] p-4 rounded-xl border border-gray-700 shadow-lg">
        <h1 className="text-xl font-medium mb-2">
          Session: {dialog.sessionId}
        </h1>
        <p className="text-[14px] text-gray-100 mb-4">
          Created: {new Date(dialog.createdAt).toLocaleString()}
        </p>

        <div className="space-y-2">
          {dialog.messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${msg.type === 'human' ? 'bg-blue-900/20 ml-4' : 'bg-gray-600/20 mr-4'}`}
            >
              <div className="text-[12px] font-normal text-gray-300 mb-0.5 uppercase ">
                {msg.type}
              </div>
              <p className="text-[14px] font-normal whitespace-pre-wrap">
                {cleanAiMessage(msg.data.content)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
