'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  // За дефолтный файл берем первый элемент или пустую заглушку
  const fileList = images && images.length > 0 ? images : ['/photo1.jpg'];
  const [activeSrc, setActiveSrc] = useState(fileList[0]);

  // Функция проверки: видео это или картинка
  const checkIsVideo = (src: string) =>
    src.match(/\.(mp4|webm|ogg|mov)($|\?)/i);

  return (
    <div className="flex flex-col gap-4 w-full max-w-full overflow-hidden">
      {/* Главное окно просмотра.
        Используем aspect-square (1:1), чтобы высота зависела от ширины колонки.
        На десктопе md:aspect-[4/5] сделает его чуть вытянутым по вертикали (стиль лофт).
      */}
      <div className="relative isolate w-full aspect-square  bg-gray-100 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
        {checkIsVideo(activeSrc) ? (
          <video
            src={activeSrc}
            className="absolute inset-0 w-full h-full object-contain" // object-cover чтобы заполнить, object-contain чтобы без обрезки
            controls
            autoPlay
            muted
            playsInline
            key={activeSrc}
          />
        ) : (
          <Image
            src={activeSrc}
            alt={alt}
            fill
            className="object-contain" // object-cover чтобы заполнить без полей
            priority
            unoptimized
          />
        )}
      </div>

      {/* Линейка маленьких превью */}
      {fileList.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center md:justify-start pb-2">
          {fileList.map((src, index) => {
            const isVideo = checkIsVideo(src);
            const isActive = src === activeSrc;

            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSrc(src)}
                // flex-shrink-0 чтобы превью не сжимались
                className={`w-16 h-16 sm:w-20 sm:h-20  relative overflow-hidden rounded-xl border-2 bg-gray-800 flex items-center justify-center transition-all ${
                  isActive
                    ? 'border-blue-600 scale-95'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
                }`}
              >
                {isVideo ? (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <video
                      src={src}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-white px-1 rounded">
                      Video
                    </span>
                  </div>
                ) : (
                  <Image
                    src={src}
                    alt={`Превью ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
