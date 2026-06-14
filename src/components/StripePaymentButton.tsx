'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface StripePaymentButtonProps {
  orderId: string;
}

export default function StripePaymentButton({
  orderId,
}: StripePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePayment = async () => {
    if (!orderId) {
      toast.error('Missing Order ID / Відсутній ID замовлення');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      // Если бэкенд успешно создал сессию, Stripe возвращает готовый URL
      if (data.url) {
        window.location.href = data.url; // Перенаправляем пользователя на Stripe Checkout
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error('Payment initiation error:', err);
      toast.error(`Payment Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={() => {
        void handlePayment();
      }}
      disabled={isLoading}
      className="w-full py-3 px-6 text-sm font-semibold uppercase tracking-wider text-[#1F2020] bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-600 disabled:text-gray-400 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-[#1F2020] border-t-transparent rounded-full animate-spin"></span>
          Processing... / Обробка...
        </span>
      ) : (
        'Pay Now / Оплатити карткою'
      )}
    </button>
  );
}
