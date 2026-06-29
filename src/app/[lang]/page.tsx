import CatalogSections from '@/src/components/CatalogSections';
import CustomIdeaBlock from '@/src/components/CustomIdeaBlock';
import HomePageSlider from '@/src/components/HomePageSlider';
import ProductGrid from '@/src/components/ProductGrid';
import { getDictionary } from '@/src/lib/get-dictionary';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  return {
    metadataBase: new URL('https://smarty-loft.vercel.app'),
    title: 'Smartyloft',
    openGraph: {
      title: 'Smartyloft',
      url: `https://smarty-loft.vercel.app/`, // Всегда показываем чистый URL
      images: [{ url: '/LogoSmartyloftBgWhite.jpg' }], // Относительный путь!
      locale: lang === 'ua' ? 'uk_UA' : 'en_US',
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ua' | 'pl' | 'lt' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <main className="flex flex-col items-center ">
      <div className="container w-full max-w-7x bg-[#EAE6DF]/60  dark:bg-[#1F2020]/60 mb-20 ">
        <HomePageSlider />
        <ProductGrid currentLocale={lang} />
        <CatalogSections
          lang={lang}
          name={dict.CatalogSections.name}
          loadingText={dict.CatalogSections.loading || 'Завантаження...'}
          errorText={dict.CatalogSections.error || 'Помилка'}
        />
        <CustomIdeaBlock lang={lang} />
      </div>
    </main>
  );
}
