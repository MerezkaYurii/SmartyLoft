import Contacts from '@/src/components/Contacts';
import { getDictionary } from '@/src/lib/get-dictionary';

interface Props {
  params: Promise<{
    lang: 'en' | 'ua' | 'pl' | 'lt';
  }>;
}

const ContactsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <main className="flex flex-col items-center mt-10">
      <div className="container w-full max-w-7x bg-[#F9F6F0]/60 dark:bg-[#121313]/60">
        <Contacts lang={lang} dict={dict} />
      </div>
    </main>
  );
};

export default ContactsPage;
