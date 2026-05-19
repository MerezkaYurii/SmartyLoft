'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const slides = [
    {
        id: 1,
        image: '/photo1.jpg',
        title: 'Slide 1 Title',
    },
    {
        id: 2,
        image: '/photo2.jpg',
        title: 'Slide 2 Title',
    },
    {
        id: 3,
        image: '/photo3.jpg',
        title: 'Slide 3 Title',
    },

];

export default function HomePageSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    // Автоматическое переключение каждые 5 секунд
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <section className="px-2 sm:px-4 lg:px-6 py-2    w-full  ">

            <div className="container mx-auto aspect-[2/1] w-full overflow-hidden rounded-2xl relative bg-gray-200 dark:bg-gray-800 shadow-lg">

                {/* Слайды */}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* Замените src на свои реальные фото позже */}
                        <div className="relative h-full w-full">
                            <div className="absolute inset-0 bg-black/30 z-10" /> {/* Затемнение для текста */}
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                priority={index === 0}
                                className="object-cover"
                                sizes="100vw"
                            />
                        </div>
                    </div>
                ))}

                {/* Стрелка влево */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                {/* Стрелка вправо */}
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>

                {/* Индикаторы (точки) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 transition-all rounded-full ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section >
    );
}