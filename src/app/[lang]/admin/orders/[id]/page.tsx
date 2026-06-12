'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface IOrder {
  _id: string;
  name: string;
  phone: string;
  email: string;
  comment?: string;
  locale: string;
  status: string;
  createdAt: string;
  config?: {
    productId?: string;
  };
  product?: {
    _id: string;
    title: Record<string, string>;
    images?: string[];
    price: string;
    sizes?: Array<{
      width: number;
      height: number;
      depth: number;
      _id: string;
    }>;
    description?: Record<string, string>;
  } | null;
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const currentLocale = (params?.locale as string) || 'en';

  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch('/api/orders', { cache: 'no-store' });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch orders');
        }

        const data = await response.json();

        // Находим нужный заказ, сравнивая ID как строки через .toString() для безопасности
        const foundOrder = data.find(
          (item: IOrder) => item._id?.toString() === orderId.toString(),
        );

        // ЛОГ ДЛЯ БРАУЗЕРА (нажми F12 в браузере, чтобы увидеть)
        console.log('Found order object on client:', foundOrder);

        if (!foundOrder) {
          toast.error('Order not found / Замовлення не знайдено');
          router.push('/admin/orders');
          return;
        }

        setOrder(foundOrder);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        toast.error(`Error: ${err.message}`);
      }
      bits: {
        setIsLoading(false);
      }
    };

    void fetchOrderDetails();
  }, [orderId, router]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id, status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to update status');

      toast.success('Status updated / Статус оновлено');
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
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

  if (!order) return null;

  // Берем локализацию названия или фолбек на 'en'
  const productTitle =
    order.product?.title?.[currentLocale] ||
    order.product?.title?.['en'] ||
    null;
  const productImage = order.product?.images?.[0] || null;
  const productDesc =
    order.product?.description?.[currentLocale] ||
    order.product?.description?.['en'] ||
    '';

  return (
    <div className="min-h-screen bg-[#1F2020] text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/admin/orders')}
          className="mb-6 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Orders / Назад до списку
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#2A2B2B] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
                Customer Info / Клієнт
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400 block text-xs uppercase">
                    Name / Ім&apos;я
                  </span>
                  <span className="text-base font-medium text-gray-200">
                    {order.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase">
                    Phone / Телефон
                  </span>
                  <span className="text-base font-medium text-gray-200">
                    {order.phone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase">
                    Email / Пошта
                  </span>
                  <span className="text-base font-medium text-gray-200">
                    {order.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase">
                    Date / Дата замовлення
                  </span>
                  <span className="text-gray-300">
                    {new Date(order.createdAt).toLocaleString(currentLocale, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2B2B] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
                Comment / Коментар
              </h2>
              <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                {order.comment || '— No comment left / Коментар відсутній —'}
              </p>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="space-y-6">
            <div className="bg-[#2A2B2B] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
                Status / Статус
              </h2>
              <select
                disabled={isUpdating}
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#1F2020] border focus:outline-none cursor-pointer transition-colors ${
                  order.status === 'pending'
                    ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                    : order.status === 'completed' || order.status === 'paid'
                      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                      : 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                }`}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* ИНФОРМАЦИЯ О ТОВАРЕ */}
            <div className="bg-[#2A2B2B] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
                Product Info / Товар
              </h2>
              {order.product ? (
                <div className="space-y-4">
                  {productImage && (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-600 bg-[#1F2020]">
                      <Image
                        src={productImage}
                        alt={productTitle || 'Product'}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs uppercase block">
                        Title / Назва
                      </span>
                      <span className="font-semibold text-gray-200 text-base">
                        {productTitle || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 text-xs uppercase block">
                        Price / Ціна
                      </span>
                      <span className="text-base text-emerald-400 font-medium">
                        {order.product.price} €
                      </span>
                    </div>

                    {order.product.sizes && order.product.sizes.length > 0 && (
                      <div>
                        <span className="text-gray-400 text-xs uppercase block mb-1">
                          Sizes / Розміри (W×H×D)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {order.product.sizes.map((s) => (
                            <span
                              key={s._id}
                              className="text-xs bg-[#1F2020] px-2 py-1 rounded border border-gray-700 text-gray-300"
                            >
                              {s.width}×{s.height}×{s.depth} см
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {productDesc && (
                      <div>
                        <span className="text-gray-400 text-xs uppercase block">
                          Description / Опис
                        </span>
                        <p className="text-xs text-gray-400 line-clamp-3">
                          {productDesc}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-gray-500 text-xs uppercase block font-mono">
                        Product ID Link:
                      </span>
                      <span className="text-xs font-mono text-gray-400 block select-all break-all">
                        {order.product._id}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/admin/products/edit/${order.product?._id}`)
                    }
                    className="w-full text-center px-4 py-2.5 bg-[#3A3B3B] text-gray-200 hover:bg-[#4A4B4B] rounded-xl text-xs font-medium uppercase tracking-wider border border-gray-600 transition-colors mt-2"
                  >
                    Edit Product / Редагувати товар
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 italic">
                    Product data missing or deleted / Товар не знайдено або
                    видалено з БД
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase block font-mono">
                      Linked Product ID:
                    </span>
                    <div className="font-mono text-xs text-gray-400 bg-[#1F2020] p-2.5 rounded-lg border border-gray-700 break-all select-all mt-1">
                      {order.config?.productId || '—'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
