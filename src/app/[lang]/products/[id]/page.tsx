import Product from '@/src/DataBase/models/Product';
import { initMongoConnection } from '@/src/lib/mongoose';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { lang, id } = await params;

  await initMongoConnection();
  const mongoProduct = await Product.findById(id).lean();

  if (!mongoProduct) {
    notFound();
  }
  const product = {
    id: mongoProduct._id.toString(), // Снова превращаем в строку для фронтенда
    title: mongoProduct.title,
    description: mongoProduct.description,
    price: mongoProduct.price,
    image: mongoProduct.image,
  };
  return (
    <main className="px-2 py-0.5 flex flex-col items-center :px-4 sm:py-1 lg:px-6 lg:py-2 ">
      <div className="container p-5 w-full max-w-7x bg-[#EAE6DF]/60  dark:bg-[#1F2020]/60">
        <div className="container mx-auto  py-10 text-center  bg-[#F5F3EF] dark:bg-[#2A2B2B] rounded-2xl ">
          {/* Кнопка назад */}
          <Link
            href={`/${lang}`}
            className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
          >
            ← Назад на главную
          </Link>

          {/* Двухколоночный лейаут в стиле лофт */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start pl-5 pr-5 ">
            {/* Левая колонка: Большое фото товара */}
            <div className="relative isolate w-full h-[400px] md:h-[500px] bg-gray-100 overflow-hidden dark:bg-gray-800 rounded-3xl  border border-gray-200 dark:border-gray-700">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Правая колонка: Информация */}
            <div className="flex flex-col h-full">
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4 text-gray-900 dark:text-gray-100 ">
                {product.title}
              </h1>

              <span className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 ">
                {product.price}
              </span>

              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-8">
                <h2 className="text-lg font-semibold uppercase mb-2 tracking-wide text-gray-900 dark:text-gray-100 ">
                  Описание
                </h2>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Заглушка кнопки заказа — на следующем шаге сделаем форму */}
              <button className="w-full md:w-auto px-8 py-4 bg-[#0f3995] hover:bg-[#0f3995]/80  text-white font-semibold uppercase tracking-widest text-sm rounded-2xl transition-colors duration-300">
                Купить в 1 клик
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
