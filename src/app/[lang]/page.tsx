import CatalogSections from '@/src/components/CatalogSections';
import HomePageSlider from '@/src/components/HomePageSlider';
import ProductGrid from '@/src/components/ProductGrid';
import TestComponent from '@/src/components/TestComponent';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ua' | 'pl' | 'lt' }>;
}) {
  const { lang } = await params;
  return (
    <main className="flex flex-col items-center ">
      <div className="container w-full max-w-7x bg-[#EAE6DF]/60  dark:bg-[#1F2020]/60 mb-20 ">
        <HomePageSlider />
        <ProductGrid currentLocale={lang} />
        <CatalogSections />
        <TestComponent />
      </div>
    </main>
  );
}
