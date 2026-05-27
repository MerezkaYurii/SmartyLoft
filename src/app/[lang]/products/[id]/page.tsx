import ProductGallery from '@/src/components/ProductGallery';
import Product from '@/src/DataBase/models/Product';
import { getDictionary } from '@/src/lib/get-dictionary';
import { initMongoConnection } from '@/src/lib/mongoose';

import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    lang: 'en' | 'ua' | 'pl' | 'lt';
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  await initMongoConnection();
  const mongoProduct = await Product.findById(id).lean();

  if (!mongoProduct) {
    notFound();
  }
  const product = {
    id: mongoProduct._id.toString(),
    title: mongoProduct.title,
    description: mongoProduct.description,
    price: mongoProduct.price,
    images: mongoProduct.images,
  };
  return (
    <main className="min-h-screen flex flex-col items-center px-2 py-0.5 sm:px-4 sm:py-1 lg:px-6 lg:py-2">
      <div className="container p-5 w-full max-w-7x bg-[#EAE6DF]/60  dark:bg-[#1F2020]/60">
        <div className="container mx-auto  py-10 text-center  bg-[#EAE6DF] dark:bg-[#2A2B2B] rounded-2xl ">
          {/* Кнопка назад */}
          <Link
            href={`/${lang}`}
            className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
          >
            ← {dict.ProductPage.back}
          </Link>

          {/* Двухколоночный лейаут в стиле лофт */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start pl-5 pr-5 ">
            {/* Левая колонка: Большое фото товара */}
            <ProductGallery images={product.images} alt={product.title} />

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
                  {dict.ProductPage.description}
                </h2>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Заглушка кнопки заказа — на следующем шаге сделаем форму */}
              <button className="w-full md:w-auto px-8 py-4 bg-[#0f3995] hover:bg-[#0f3995]/80  text-white font-semibold uppercase tracking-widest text-sm rounded-2xl transition-colors duration-300">
                {dict.ProductPage.buy}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
