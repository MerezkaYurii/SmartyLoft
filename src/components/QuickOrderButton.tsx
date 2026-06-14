'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useDictionary } from '../hooks/useDictionary';
import { toast } from 'react-hot-toast';

interface QuickOrderButtonProps {
  lang: string;
  productId: string;
  productTitle: string;
  buttonText?: string;
}

export default function QuickOrderButton({
  lang,
  productId,
  productTitle,
}: QuickOrderButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const dict = useDictionary();

  const [name, setName] = useState(session?.user?.name || '');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState(''); // Стейт для комментария
  const handleOrderClick = () => {
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/${lang}/login?callbackUrl=${callbackUrl}`);
    } else {
      if (!name && session?.user?.name) {
        setName(session.user.name);
      }
      setPhone('');
      setComment('');
      setIsOpen(true);
    }
  };

  if (!dict) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(
        dict.QuickOrderButton.errorFields || 'Please fill in all fields',
      );
      return;
    }

    if (phone.length < 7 || phone.length > 15) {
      toast.error(
        dict.QuickOrderButton.errorPhone ||
          'Phone number is too short or too long (should be 7 to 15 digits)',
      );
      return;
    }

    const formattedPhone = `+${phone}`;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/quick-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          name: name.trim(),
          phone: formattedPhone,
          comment: comment.trim(),
          productId,
          lang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Заменили на красивый toast.success
      toast.success(
        dict.QuickOrderButton.success || 'Order created successfully!',
      );
      setIsOpen(false);
      setPhone('');
      setComment('');

      // НАЧАЛО ИЗМЕНЕНИЙ: Если бэкенд вернул ссылку Stripe — перенаправляем на оплату
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      // Заменили на красивый toast.error
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOrderClick}
        className="w-full md:w-auto px-8 py-4 bg-[#0f3995] hover:bg-[#0f3995]/80 text-white font-semibold uppercase tracking-widest text-sm rounded-2xl transition-colors duration-300"
      >
        {dict.QuickOrderButton.title}
      </button>

      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="w-full max-w-md p-6 bg-[#EAE6DF] dark:bg-[#2A2B2B] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 relative text-gray-950 dark:text-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold uppercase tracking-wide mb-2">
              {dict.QuickOrderButton.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {dict.QuickOrderButton.productTitle} {productTitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1 text-gray-600 dark:text-gray-400">
                  {dict.QuickOrderButton.name}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2020] border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-[#0f3995] text-gray-900 dark:text-gray-100 transition-colors"
                  placeholder={dict.QuickOrderButton.name}
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1 text-gray-600 dark:text-gray-400">
                  {dict.QuickOrderButton.phone}
                </label>

                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-900 dark:text-gray-100 font-medium select-none pointer-events-none">
                    +
                  </span>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      const filtered = val.replace(/[^0-9]/g, '');
                      setPhone(filtered);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2020] border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-[#0f3995] text-gray-900 dark:text-gray-100 transition-colors"
                    placeholder="380"
                    required
                  />
                </div>
              </div>

              {/* НОВОЕ ПОЛЕ: Комментарий к быстрому заказу */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold mb-1 text-gray-600 dark:text-gray-400">
                  {dict.QuickOrderButton.comment || 'Comment'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F2020] border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-[#0f3995] text-gray-900 dark:text-gray-100 transition-colors resize-none"
                  placeholder={
                    dict.QuickOrderButton.phComment || 'Your wishes...'
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-950 dark:text-gray-50"
                >
                  {dict.QuickOrderButton.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white bg-[#0f3995] hover:bg-[#0f3995]/80 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? dict.QuickOrderButton.loading
                    : dict.QuickOrderButton.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
