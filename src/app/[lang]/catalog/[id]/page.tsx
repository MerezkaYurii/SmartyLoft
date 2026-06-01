import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { initMongoConnection } from '@/src/lib/mongoose';
import Product from '@/src/DataBase/models/Product';

import { getDictionary } from '@/src/lib/get-dictionary';
import Category from '@/src/DataBase/models/Category';

interface Props {
  params: Promise<{
    lang: 'en' | 'ua' | 'pl' | 'lt';
    id: string;
  }>;
}

interface IMongoProduct {
  _id: { toString: () => string };
  title: Record<string, string | undefined>;
  description: Record<string, string | undefined>;
  price: string;
  sku?: string;
  images: string[];
  category: string;
}

export default async function CategoryPage({ params }: Props) {
  const { lang, id } = await params;

  // 1. Инициализируем БД и словарь
  const dict = await getDictionary(lang);
  await initMongoConnection();

  // 2. Ищем категорию в базе данных по ID
  const mongoCategory = (await Category.findById(id).lean()) as {
    _id: unknown;
    title: Record<string, string | undefined>;
    imageUrl: string;
  } | null;

  if (!mongoCategory) {
    notFound();
  }

  // Получаем локализованное имя категории для заголовка
  const categoryTitle =
    mongoCategory.title[lang] || mongoCategory.title['ua'] || '';

  // 3. Фильтруем товары в базе по совпадению поля category с ID страницы
  const mongoProducts = (await Product.find({
    category: id,
  }).lean()) as IMongoProduct[];

  const products = mongoProducts.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    sku: doc.sku,
    images: doc.images,
    category: doc.category,
  }));

  return (
    <section className="px-2 py-0.5 sm:px-4 sm:py-1 lg:px-6 lg:py-2 max-w-7xl mx-auto min-h-screen pt-[90px]">
      <div className="container mx-auto py-6 bg-[#EAE6DF] dark:bg-[#2A2B2B] rounded-2xl">
        {/* Хлебные крошки и заголовок */}
        <div className="pl-10 text-left mb-6">
          <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {dict.header.categories || 'Каталог'}
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl italic font-bold text-gray-900 dark:text-white mt-1">
            {categoryTitle}
          </h1>
          <div className="mt-2 h-1 w-16 bg-[#0f3995] rounded" />
        </div>

        {/* Проверка на наличие товаров */}
        {products.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            В этой категории пока нет товаров.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-300 dark:bg-gray-900 rounded-lg overflow-hidden border-3 border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                {/* Медиа (Фото/Видео) */}
                <div className="relative h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                  {(() => {
                    const fileSrc =
                      product.images && product.images.length > 0
                        ? product.images[0]
                        : '/photo1.jpg';

                    const isVideo = fileSrc.match(
                      /\.(mp4|webm|ogg|mov)($|\?)/i,
                    );

                    if (isVideo) {
                      return (
                        <video
                          src={fileSrc}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          muted
                          playsInline
                          autoPlay
                          loop
                          preload="metadata"
                        />
                      );
                    }

                    return (
                      <Image
                        src={fileSrc}
                        alt={product.title[lang] || product.title['ua'] || ''}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        unoptimized
                      />
                    );
                  })()}
                </div>

                {/* Контент */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-left">
                    {product.title[lang] || product.title['ua'] || ''}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-left flex-grow">
                    {product.description[lang] ||
                      product.description['ua'] ||
                      ''}
                  </p>

                  {/* Цена + Кнопка */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.price} грн
                    </span>

                    <Link
                      href={`/${lang}/products/${product.id}`}
                      className="px-4 py-2 bg-[#0f3995] border-[#0f3995] hover:bg-[#0f3995]/80 text-white text-sm font-medium rounded transition-colors duration-300"
                    >
                      {dict.ProductGrid.button}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
