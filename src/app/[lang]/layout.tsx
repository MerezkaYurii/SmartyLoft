import type { Metadata } from 'next';
import { i18n, Locale } from '../../i18n-config';
import '../globals.css';
import Header from '../../components/Header';
import { getDictionary } from '../../lib/get-dictionary';
import Footer from '@/src/components/Footer';
import StoreProvider from '@/src/redax/StoreProvider';
import DictionaryInitializer from '@/src/redax/DictionaryInitializer';

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
          <DictionaryInitializer dictionary={dict} />

          <Header />
          <main className="grow pt-[70px]">{children}</main>

          <footer className=" relative z-20 bg-white/70 dark:bg-black/70 backdrop-blur-sm">
            <Footer dict={dict} />
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
