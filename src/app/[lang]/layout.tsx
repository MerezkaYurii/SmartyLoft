import type { Metadata } from 'next';
import { i18n, Locale } from '../../i18n-config';
import '../globals.css';
import Header from '../../components/Header';
import { getDictionary } from '../../lib/get-dictionary';
import Footer from '@/src/components/Footer';
import StoreProvider from '@/src/redax/StoreProvider';
import DictionaryInitializer from '@/src/redax/DictionaryInitializer';
import Image from 'next/image';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Smartyloft',
  description: 'A Smartyloft page',
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col">
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
              <main className="grow pt-[70px]">{children}</main>

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
