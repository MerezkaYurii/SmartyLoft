import type { Metadata } from 'next';
import { i18n } from '../../i18n-config';
import '../globals.css';
import Header from '../../components/Header';
import { getDictionary } from '../../lib/get-dictionary';
import Footer from '@/src/components/Footer';
import StoreProvider from '@/src/redax/StoreProvider';
import DictionaryInitializer from '@/src/redax/DictionaryInitializer';
import Image from 'next/image';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Roboto } from 'next/font/google';
import AiChat from '@/src/components/AiChat';

export const metadata: Metadata = {
  metadataBase: new URL('https://smarty-loft.vercel.app'),
  title: 'Smartyloft',
  icons: {
    icon: 'https://smarty-loft.vercel.app/LogoSmartyloft.svg',
  },
  openGraph: {
    title: 'Smartyloft',
    url: 'https://smarty-loft.vercel.app',
    siteName: 'Smartyloft',
    images: [
      {
        url: 'https://smarty-loft.vercel.app/LogoSmartyloftBgWhite.jpg',
        width: 1200,
        height: 630,
        alt: 'Smartyloft preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smartyloft',
    images: ['https://smarty-loft.vercel.app/LogoSmartyloftBgWhite.jpg'],
  },
};

// 2. Настраиваем шрифт Roboto
const roboto = Roboto({
  subsets: ['latin', 'cyrillic'], // Включаем поддержку украинского языка
  weight: ['300', '400', '500', '700', '900'], // Веса: от легкого до супер-жирного
  variable: '--font-roboto', // Создаем CSS-переменную для Tailwind v4
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string; // Next.js требует string для динамических сегментов
  }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang;
  const allowedLocales = ['en', 'lt', 'ua', 'pl'];
  const currentLocale = allowedLocales.includes(lang)
    ? (lang as 'en' | 'lt' | 'ua' | 'pl')
    : 'en';
  const dict = await getDictionary(currentLocale);

  return (
    <html lang={currentLocale}>
      <body
        className={`${roboto.variable} ${roboto.className} min-h-screen flex flex-col antialiased`}
      >
        <StoreProvider>
          {/* 2. Обернули всё приложение в SessionProvider */}
          <SessionProvider>
            <DictionaryInitializer dictionary={dict} />

            <div className="fixed inset-0 z-0 pointer-events-none">
              {/* Светлая тема */}
              <div className="absolute inset-0 dark:hidden">
                <Image
                  src="/bgWiteThema.jpg"
                  alt="Light theme background"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover "
                />
              </div>
              {/* Темная тема */}
              <div className="absolute inset-0 hidden dark:block">
                <Image
                  src="/bgBlackThema.jpg"
                  alt="Dark theme background"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover "
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-col grow min-h-screen">
              <Header />
              <main className="grow pt-[70px]">
                {children}

                <AiChat />
                <Toaster position="top-center" reverseOrder={false} />
              </main>

              <footer className=" relative z-20 bg-white/70 dark:bg-black/70 backdrop-blur-sm">
                <Footer />
              </footer>
            </div>
          </SessionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
