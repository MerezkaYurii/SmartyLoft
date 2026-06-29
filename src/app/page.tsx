// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://smarty-loft.vercel.app'),
  title: 'Smartyloft',
  openGraph: {
    title: 'Smartyloft',
    url: 'https://smarty-loft.vercel.app',
    siteName: 'Smartyloft',
    images: [
      {
        url: '/LogoSmartyloftBgWhite.jpg',
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
    images: ['/LogoSmartyloftBgWhite.jpg'],
  },
};

// Простой редирект на /en, чтобы пользователь сразу попадал в нужную языковую версию
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('');
}
