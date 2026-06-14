'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface IRates {
  _id: string;
  pln: number;
  uah: number;
  usd: number;
  createdAt: string;
  updatedAt: string;
}

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
    title?: Record<string, string>;
    images?: string[];
    price: string;
    size?: string[];
    description?: Record<string, string>;
  } | null;
  rates?: {
    usd: number;
    uah: number;
    pln: number;
  };
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const currentLocale = (params?.locale as string) || 'en';

  const [order, setOrder] = useState<IOrder | null>(null);
  const [activeRates, setActiveRates] = useState<{
    usd: number;
    uah: number;
    pln: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchData = async () => {
      try {
        // 1. Загружаем заказы
        const orderResponse = await fetch('/api/orders', { cache: 'no-store' });

        if (!orderResponse.ok) {
          const errorData = (await orderResponse.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(errorData.error || 'Failed to fetch orders');
        }

        const ordersData = (await orderResponse
          .json()
          .catch(() => [])) as IOrder[];

        const foundOrder = ordersData.find(
          (item: IOrder) => item._id?.toString() === orderId.toString(),
        );

        if (!foundOrder) {
          toast.error('Order not found / Замовлення не знайдено');
          router.push('/admin/orders');
          return;
        }

        setOrder(foundOrder);

        // 2. Если в заказе УЖЕ есть сохраненные курсы — берём их и выходим
        if (foundOrder.rates) {
          setActiveRates(foundOrder.rates);
          return;
        }

        // 3. Если курсов в заказе нет — берём объект напрямую из твоего API курсов
        const ratesResponse = await fetch('/api/currencyRate', {
          cache: 'no-store',
        });
        if (ratesResponse.ok) {
          const dbRates = (await ratesResponse.json().catch(() => null)) as {
            usd: number;
            uah: number;
            pln: number;
          } | null;

          if (dbRates && dbRates.usd && dbRates.uah && dbRates.pln) {
            // Сразу выводим курсы на экран
            setActiveRates(dbRates);

            // Отправляем на сервер и ПРИ УСПЕХЕ обновляем стейт заказа на клиенте
            const updateResponse = await fetch('/api/orders', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: foundOrder._id, rates: dbRates }),
            });

            if (updateResponse.ok) {
              console.log('Курсы успешно зафиксированы в документе заказа');
              // Обновляем состояние, чтобы компонент перерендерился с новыми курсами в заказе
              setOrder((prev) => (prev ? { ...prev, rates: dbRates } : null));
            }
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        toast.error(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
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

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
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

  const productTitle =
    order.product?.title?.[currentLocale] ||
    order.product?.title?.['ua'] ||
    order.product?.title?.['en'] ||
    '—';

  const productDesc =
    order.product?.description?.[currentLocale] ||
    order.product?.description?.['ua'] ||
    order.product?.description?.['en'] ||
    '';

  const productImage = order.product?.images?.[0] || null;

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen bg-[#1F2020]/80 text-gray-100 mb-20">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/admin/orders')}
          className="mb-6 text-sm text-gray-200 hover:text-white hover:underline transition-colors flex items-center gap-2"
        >
          ← Back to Orders / Назад до списку
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="space-y-6">
            <div className="bg-[#2A2B2B] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-medium tracking-wider mb-2 text-white  border-gray-200">
                Customer Info / Клієнт
              </h2>
              <div className="space-y-3 text-sm">
                <div className="pt-2 border-t border-gray-700">
                  <span className="text-white text-smtext-gray-200 block text-sm">
                    Order ID Link / Ссылка на идентификатор заказа
                  </span>
                  <span className="text-sm font-mono text-gray-200 block select-all break-all">
                    {order._id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-200 block text-sm">
                    Name / Tracking Name
                  </span>
                  <span className="text-base font-medium text-white">
                    {order.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-200 block text-sm">
                    Phone / Телефон
                  </span>
                  <span className="text-base font-medium text-white">
                    {order.phone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-200 block text-sm">
                    Email / Пошта
                  </span>
                  <span className="text-base font-medium text-white">
                    {order.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-200 block text-sm">
                    Order Language / Мова замовлення
                  </span>
                  <span className="text-xs bg-[#1F2020] px-2 py-1 rounded border border-gray-700 text-amber-400 font-mono uppercase inline-block mt-0.5">
                    {order.locale || 'en'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-200 block text-sm">
                    Date / Дата замовлення
                  </span>
                  <span className="text-white">
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
              <h2 className="text-xl font-medium tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
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
              <h2 className="text-xl font-medium tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
                Status / Статус
              </h2>
              <select
                disabled={isUpdating}
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium tracking-wider bg-[#1F2020] border focus:outline-none cursor-pointer transition-colors ${
                  order.status === 'pending'
                    ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
                    : order.status === 'completed' || order.status === 'paid'
                      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                      : 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                }`}
              >
                <option value="pending">Pending / В очікуванні</option>
                <option value="paid">Paid / Оплачено</option>
                <option value="completed">Completed / Виконано</option>
                <option value="cancelled">Cancelled / Скасовано</option>
              </select>
            </div>

            {/* ИНФОРМАЦИЯ О ТОВАРЕ */}
            <div className="bg-[#2A2B2B] p-6 rounded-2xl border border-gray-700 shadow-xl">
              <h2 className="text-xl font-medium tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
                Product Info / Товар
              </h2>
              {order.product ? (
                <div className="space-y-4">
                  {productImage && (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-600 bg-[#1F2020]">
                      <Image
                        src={productImage}
                        alt="Product image"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-white text-sm block">
                        Title / Назва
                      </span>
                      <span className="font-medium text-gray-200 text-base">
                        {productTitle}
                      </span>
                    </div>

                    <div>
                      <span className="text-white text-sm block">
                        Price base EUR / Ціна базовая EUR
                      </span>
                      <span className="text-base text-emerald-400 font-medium">
                        {order.product.price} €
                      </span>
                    </div>

                    {/* БЛОК КУРСОВ ВАЛЮТ */}
                    <div className="p-3 bg-[#1F2020] rounded-xl border border-gray-700 space-y-2">
                      <span className="text-sm text-white block font-medium tracking-wide ">
                        Fixed Order Rates / Курси на момент замовлення:
                      </span>
                      {activeRates ? (
                        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                          <div className="bg-[#2A2B2B] p-2 rounded-lg border border-gray-700">
                            <div className="text-gray-200 mb-0.5">USD</div>
                            <div className="text-white font-medium text-sm">
                              {activeRates.usd}
                            </div>
                          </div>
                          <div className="bg-[#2A2B2B] p-2 rounded-lg border border-gray-700">
                            <div className="text-gray-200 mb-0.5">UAH</div>
                            <div className="text-white font-medium text-sm">
                              {activeRates.uah}
                            </div>
                          </div>
                          <div className="bg-[#2A2B2B] p-2 rounded-lg border border-gray-700">
                            <div className="text-gray-200 mb-0.5">PLN</div>
                            <div className="text-white font-medium text-sm">
                              {activeRates.pln}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400 italic block">
                          Loading rates... / Завантаження курсів...
                        </span>
                      )}
                    </div>

                    {/* Вывод размеров */}
                    <div>
                      <span className="text-white text-sm block mb-1.5">
                        Sizes / Розміри
                      </span>
                      {order.product.size && order.product.size.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {order.product.size.map((s, idx) => (
                            <div
                              key={idx}
                              className="text-sm font-medium bg-[#1F2020] px-3 py-2 rounded-xl border border-gray-700 text-white "
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400 italic">
                          Old order (placed before sizes were added to the
                          database) <br />
                          Старе замовлення (розміщено до додавання розмірів до
                          бази даних)
                        </div>
                      )}
                    </div>

                    {productDesc && (
                      <div>
                        <span className="text-white text-sm block">
                          Description / Опис
                        </span>
                        <p className="text-sm text-gray-100 whitespace-pre-wrap">
                          {productDesc}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-white text-sm block font-mono">
                        Product ID Link /Посилання на ідентифікатор продукту
                      </span>
                      <span className="text-sm  text-gray-100 block select-all break-all">
                        {order.product._id}
                      </span>
                    </div>
                  </div>
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
