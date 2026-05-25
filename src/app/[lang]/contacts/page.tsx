import Contacts from '@/src/components/Contacts'



const ContactsPage = () => {

    return (
        <main className="flex flex-col items-center ">
            <div className="container w-full max-w-7x bg-[#F9F6F0]/60 dark:bg-[#121313]/60">

                <Contacts />
            </div>
        </main>
    )
}

export default ContactsPage