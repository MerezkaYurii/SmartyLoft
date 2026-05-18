import Contacts from '@/src/components/Contacts'
import { Locale } from '@/src/i18n-config';
import { getDictionary } from '@/src/lib/get-dictionary';


const ContactsPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    return (
        <main className="flex flex-col items-center mt-18">
            <div className="container w-full max-w-7x bg-red-200">

                <Contacts dict={dict} />
            </div>
        </main>
    )
}

export default ContactsPage