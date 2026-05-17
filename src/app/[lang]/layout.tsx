import type { Metadata } from 'next';
import { i18n, Locale } from '../../i18n-config';
import '../globals.css';
import Header from '../../components/Header';
import { getDictionary } from '../../lib/get-dictionary';

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
  params: Promise<{ lang: Locale }>; // Ожидаем params как Promise
}>) {
  // Извлекаем lang, дождавшись разрешения Promise
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <html lang={lang}>
      <body>
        <Header dict={dict} />
        <main>{children}</main>
      </body>
    </html>
  );
}