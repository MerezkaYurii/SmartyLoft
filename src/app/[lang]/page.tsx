import CatalogSections from '@/src/components/CatalogSections';
import CustomIdeaBlock from '@/src/components/CustomIdeaBlock';
import HomePageSlider from '@/src/components/HomePageSlider';
import ProductGrid from '@/src/components/ProductGrid';
import { getDictionary } from '@/src/lib/get-dictionary';

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
