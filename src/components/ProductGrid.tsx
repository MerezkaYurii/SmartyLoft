import Link from 'next/link';

import Image from 'next/image';
import { initMongoConnection } from '../lib/mongoose';
import Product from '../DataBase/models/Product';

import { getDictionary } from '../lib/get-dictionary';

// 1. Описываем типы для пропсов, чтобы принимать язык от родительской страницы
interface ProductGridProps {
  currentLocale: 'en' | 'ua' | 'pl' | 'lt';
}
export default async function ProductGrid({ currentLocale }: ProductGridProps) {
  const dict = await getDictionary(currentLocale);
  await initMongoConnection();

  const mongoProducts = await Product.find({}).lean();

  const products = mongoProducts.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    sku: doc.sku,
    images: doc.images,
  }));

  return (
    <section className="px-2 py-0.5 sm:px-4 sm:py-1 lg:px-6 lg:py-2 ">
      <div className="container mx-auto  py-2 text-center  bg-[#f5f5ef] dark:bg-[#2A2B2B] rounded-2xl ">
        {/* Заголовок секции */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl  italic font-bold text-left pl-10 text-gray-900 dark:text-white  ">
          {dict.ProductGrid.title}
        </h2>

        {/* Сетка Grid: 1 колонка на мобилках, 2 на планшетах, 3 на ПК */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-300 dark:bg-gray-900 rounded-lg overflow-hidden border-3 border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Заглушка для фото товара */}
              <div className="relative h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                {(() => {
                  // Берем первое изображение/видео из массива или дефолтную заглушку
                  const fileSrc =
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : '/photo1.jpg';

                  // Проверяем, видео это или картинка
                  const isVideo = fileSrc.match(/\.(mp4|webm|ogg|mov)($|\?)/i);

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
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      priority={false} // Для главной лучше оставить false, чтобы не перегружать LCP, либо настраивать точечно
                    />
                  );
                })()}
              </div>

              {/* Контент карточки */}
              <div className="p-6 flex flex-col flex-grow: 1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow: 1">
                  {product.description}
                </p>

                {/* Нижняя часть: Цена + Кнопка */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.price}
                  </span>

                  <Link
                    href={`/${currentLocale}/products/${product.id}`}
                    className="px-4 py-2 bg-[#0f3995] border-[#0f3995] hover:bg-[#0f3995]/80 text-white text-sm font-medium rounded transition-colors duration-300"
                  >
                    {dict.ProductGrid.button}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
