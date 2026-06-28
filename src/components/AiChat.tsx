'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useDictionary } from '../hooks/useDictionary';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AiChat() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dict = useDictionary();

  const isProduction =
    typeof window !== 'undefined' &&
    window.location.origin === 'https://smarty-loft.vercel.app';

  const isAuth = status === 'authenticated';
  const userName =
    session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userText = message.trim();
    setMessage('');

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: userText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const webhookUrl = isProduction
      ? 'https://n8n-production-9f7d.up.railway.app/webhook/SmyrtLoftAI'
      : 'https://n8n-production-9f7d.up.railway.app/webhook-test/SmyrtLoftAI';

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text: userText,
          user: userName || 'Guest',
          isAuth,
        }),
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text:
          data.reply || 'I got your message! / Я отримав твоє повідомлення!',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Ошибка чата:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: 'Error connecting to server. Please try again. / Помилка підключення до сервера. Спробуйте ще раз.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!dict) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* КНОПКА-ИКОНКА ЧАТА */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#0f3995] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        >
          <svg
            className="w-7 h-7 animate-pulse group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* ОКНО ЧАТА */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] h-[450px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300">
          {/* Шапка чата */}
          <div className="bg-[#0f3995] text-white px-4 py-3.5 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
              <span className="font-medium tracking-wide text-sm">
                SmartyLoft AI
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-200 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Тело чата (История сообщений) */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/40 flex flex-col gap-3 justify-start">
            {/* Приветственное сообщение от ИИ */}
            <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm max-w-[85%] border border-gray-100 dark:border-gray-700/60 text-sm self-start">
              {isAuth ? (
                <p>
                  {dict.AiChat.greetings},{' '}
                  <strong className="text-[#0f3995] dark:text-blue-400">
                    {userName}
                  </strong>
                  ! {dict.AiChat.question}
                </p>
              ) : (
                <p>{dict.AiChat.authGreeting}</p>
              )}
            </div>

            {/* Вывод динамических сообщений (Дубликат удален) */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-2xl text-sm max-w-[85%] shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-[#0f3995] text-white self-end rounded-tr-none border-blue-800'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 self-start rounded-tl-none border-gray-100 dark:border-gray-700/60'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Форма ввода */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-gray-200 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex gap-2 items-center shrink-0"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={dict.AiChat.placeholder}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3995] dark:focus:ring-blue-500 transition-all placeholder:text-gray-800 dark:placeholder:text-gray-100"
            />
            <button
              type="submit"
              className="p-2 bg-[#0f3995] dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white rounded-xl transition-colors shadow-md"
            >
              <svg
                className="w-4 h-4 transform rotate-90"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
