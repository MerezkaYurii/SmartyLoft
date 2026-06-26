'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

interface IOrder {
  _id: string;
  name: string;
  createdAt: string;
  product?: {
    title: Record<string, string>;
    images?: string[];
  } | null;
  config?: {
    productId?: string;
  };
}

export default function AdminOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const currentLocale = (params?.locale as string) || 'en';

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch orders');
      setOrders(data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchOrders();
    };

    loadData().catch((err) => {
      console.error('Failed to load orders:', err);
    });
  }, []);

  // ФУНКЦИЯ УДАЛЕНИЯ ЗАКАЗА
  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? / Ви впевнені?'))
      return;

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete order');

      toast.success('Order deleted / Замовлення видалено');
      setOrders((prev) => prev.filter((item) => item._id !== orderId));
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
          Orders / Замовлення
        </h1>

        {orders.length === 0 ? (
          <p className="text-white italic">
            No orders found / Замовлень не знайдено
          </p>
        ) : (
          <div className="overflow-x-auto bg-[#2A2B2B] rounded-2xl border border-gray-700 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151616] text-xs  tracking-wider font-semibold border-b border-gray-700 text-white">
                  <th className="p-4">Customer / Клієнт</th>
                  <th className="p-4">Product / Товар</th>
                  <th className="p-4">Date / Дата</th>
                  <th className="p-4 text-right">Actions / Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 text-sm">
                {orders.map((order) => {
                  const productTitle =
                    order.product?.title?.[currentLocale] ||
                    order.product?.title?.['en'] ||
                    null;
                  const productImage = order.product?.images?.[0] || null;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-[#323434] transition-colors"
                    >
                      {/* ИМЯ КЛИЕНТА */}
                      <td className="p-4 font-medium text-gray-200">
                        {order.name}
                      </td>

                      {/* ТОВАР */}
                      <td className="p-4">
                        {productTitle ? (
                          <div className="flex items-center gap-3">
                            {productImage && (
                              <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink- border border-gray-600">
                                <Image
                                  src={productImage}
                                  alt={productTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="font-medium">{productTitle}</div>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-gray-400">
                            ID: {order.config?.productId || '—'}
                          </span>
                        )}
                      </td>

                      {/* ДАТА */}
                      <td className="p-4 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString(
                          currentLocale,
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          },
                        )}
                      </td>

                      {/* КНОПКИ ДЕЙСТВИЙ */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() =>
                            router.push(
                              `/${currentLocale}/admin/orders/${order._id}`,
                            )
                          }
                          className="px-3 py-1.5 text-xs font-medium  tracking-wider bg-[#3A3B3B] text-white rounded-lg hover:bg-[#4A4B4B] transition-colors border border-gray-600"
                        >
                          Edit / Редагувати
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
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
