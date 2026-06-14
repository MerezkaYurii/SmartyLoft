'use client';
import React from 'react';
import { useDictionary } from '../hooks/useDictionary';
import ModalOrder from './ModalOrder';
import Image from 'next/image';
// Импортируем Swiper для React
import { Swiper, SwiperSlide } from 'swiper/react';
// Импортируем автоплей модуль для эффекта "бегущей ленты"
import { Autoplay, FreeMode } from 'swiper/modules';
// Импортируем стили Swiper
import 'swiper/css';
import 'swiper/css/free-mode';
import Link from 'next/link';

const galleryImages = [
  { id: 1, src: '/images/gallery-1.jpg', alt: 'Loft plant shelves' },
  { id: 2, src: '/images/gallery-2.jpg', alt: 'Custom industrial fittings' },
  { id: 3, src: '/images/gallery-3.jpg', alt: 'Unique door handle' },
  { id: 4, src: '/images/gallery-4.jpg', alt: 'Steel and wood table' },
  { id: 5, src: '/images/gallery-5.jpg', alt: 'Bespoke loft lamp' },
  { id: 6, src: '/images/gallery-6.jpg', alt: 'Industrial bar stools' },
  { id: 7, src: '/images/gallery-7.jpg', alt: 'Custom iron gate' },
  { id: 8, src: '/images/gallery-8.jpg', alt: 'Loft bookshelf' },
  { id: 9, src: '/images/gallery-9.jpg', alt: 'Metal clothes rack' },
  { id: 10, src: '/images/gallery-10.jpg', alt: 'Welded furniture part' },
];

const CustomIdeaBlock: React.FC<{ lang: string }> = ({ lang }) => {
  const dict = useDictionary();

  if (!dict) return null;
  return (
    <section className="px-2 py-0.5 sm:px-4 sm:py-1 lg:px-6 lg:py-2 ">
      <div className="container mx-auto py-2 bg-[#EAE6DF] dark:bg-[#2A2B2B] rounded-2xl px-2">
        {/* Заголовок секции */}
        <div>
          <h2 className="text-xl  sm:text-2xl lg:text-3xl  italic font-medium text-left pl-10 text-gray-900 dark:text-white ">
            {dict.CustomIdeaBlock.title}
          </h2>
          <div className="mt-2 ml-10 h-1 w-16 bg-[#0f3995] rounded" />
        </div>

        <p className="text-sm lg:text-xl  italic font-medium pl-10 pr-10 py-4 text-center text-gray-700 dark:text-gray-200 ">
          {dict.CustomIdeaBlock.text}
        </p>

        <Link
          href={`/${lang}/contacts`}
          className="text-lg text-green-600 hover:underline  hover:text-green-400   whitespace-nowrap text-center block mb-4"
        >
          ← {dict.CustomIdeaBlock.contacts}
        </Link>

        {/* --- ГАЛЕРЕЯ «БЕГУЩИЕ ФОТКИ» (Между текстом и кнопкой) --- */}
        <div className="gallery-running-tape mb-8 md:mb-12 border-y border-gray-200 dark:border-gray-700 bg-gray-300 dark:bg-black/10 p-4 ">
          <Swiper
            modules={[Autoplay, FreeMode]}
            // Эффект "бегущей" ленты: бесконечный цикл, свободный скролл, очень быстрая скорость
            loop={true}
            freeMode={true}
            speed={8000} // Время на один проход ленты в миллисекундах (медленно бегут)
            autoplay={{
              delay: 0, // Задержка перед началом следующего слайда (0 = непрерывное движение)
              disableOnInteraction: false, // Не останавливать при клике
            }}
            // Адаптивность количества фоток на экране
            breakpoints={{
              320: { slidesPerView: 3, spaceBetween: 10 }, // 3 фото на мобилке
              640: { slidesPerView: 4, spaceBetween: 15 }, // 4 на планшете
              1024: { slidesPerView: 5, spaceBetween: 20 }, // 5 на десктопе
              1280: { slidesPerView: 6, spaceBetween: 25 }, // 6 на большом экране
            }}
            className="w-full h-auto px-4"
          >
            {galleryImages.map((image) => (
              <SwiperSlide key={image.id} className="w-auto">
                {/* ИСПРАВЛЕНО: Добавили класс group к родительскому div */}
                <div className="group relative aspect-square w-full h-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg transition-transform hover:scale-105 hover:shadow-amber-500/30">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-w-768px) 33vw, (max-w-1200px) 20vw, 15vw"
                  />
                  {/* Полупрозрачный оверлей — теперь он станет полностью прозрачным при hover благодаря group */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="block mx-auto text-center mb-2  ">
          <ModalOrder buttonLabel={dict.CustomIdeaBlock.buttonText} />
        </div>
      </div>
    </section>
  );
};

export default CustomIdeaBlock;
