

import data from "../data/siteData.json";
import ModalOrder from "./ModalOrder";
import { Dictionary } from "../i18n-config";




export default function Contacts({ dict }: { dict: Dictionary }) {
    const dataContacts = data.dataContacts;
    const dataSocialLinks = data.dataSocialLinks;
    const mailTo = `mailto:${dataContacts.email}?subject=Заказ%20сайта`;
    return (
        <section id="contact" className="px-2 sm:px-4 lg:px-6 ">
            <div className="container mx-auto  py-10 text-center  bg-gray-400/80 dark:bg-gray-900/80 rounded-2xl mb-[15px]">
                <h2 className="text-lg sm:text-xl md:text-2xl  font-bold mb-3 dark:text-white ">
                    {dict.contacts.title}
                </h2>
                <h3 className="text-sm sm:text-base md:text-lg  font-medium mb-3 dark:text-white">
                    {dict.contacts.desc}
                </h3>
                <p className="text-sm sm:text-base md:text-lg mb-2 dark:text-white">
                    {dict.contacts.phone}:{" "}
                    <a href={`tel:${dataContacts.phone}`} className="underline">
                        {dataContacts.phone}
                    </a>
                </p>
                <p className="text-sm sm:text-base md:text-lg mb-3 dark:text-white">
                    {dict.contacts.email}:{" "}
                    <a href={mailTo} className="underline">
                        {dataContacts.email}
                    </a>
                </p>

                <div className="flex items-center gap-4 justify-center mb-4">
                    {dataSocialLinks.telegram && (
                        <a
                            href={dataSocialLinks.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="p-1 bg-[#0088cc] rounded-lg hover:opacity-80 transition duration-500">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white">
                                    <use href="/spriteSL.svg#icon-telegram-alt-svgrepo-com" />
                                </svg>
                            </button>
                        </a>
                    )}
                    {dataSocialLinks.linkedin && (
                        <a
                            href={dataSocialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="p-1 bg-[#0A66C2] rounded-lg hover:opacity-80 transition duration-500">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white">
                                    <use href="/spriteSL.svg#icon-linkedin-svgrepo-com" />
                                </svg>
                            </button>
                        </a>
                    )}
                    {dataSocialLinks.facebook && (
                        <a
                            href={dataSocialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="p-1 bg-[#1877F2] rounded-lg hover:opacity-80 transition  duration-500">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white">
                                    <use href="/spriteSL.svg#icon-facebook-svgrepo-com" />
                                </svg>
                            </button>
                        </a>
                    )}
                    {dataSocialLinks.viber && (
                        <a href={dataSocialLinks.viber} target="_blank" rel="noopener noreferrer">
                            <button className="p-1 bg-[#665CAC] rounded-lg hover:opacity-80 transition  duration-500">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white">
                                    <use href="/spriteSL.svg#icon-viber-svgrepo-com" />
                                </svg>
                            </button>
                        </a>
                    )}
                    {dataSocialLinks.instagram && (
                        <a
                            href={dataSocialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="p-1 bg-[#E1306C] rounded-lg hover:opacity-80 transition  duration-500">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white">
                                    <use href="/spriteSL.svg#icon-instagram-svgrepo-com" />
                                </svg>
                            </button>
                        </a>
                    )}
                    {dataSocialLinks.whatsapp && (
                        <a
                            href={dataSocialLinks.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="p-1 bg-[#25D366] rounded-lg hover:opacity-80 transition  duration-500">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white">
                                    <use href="/spriteSL.svg#icon-whatsapp-svgrepo-com" />
                                </svg>
                            </button>
                        </a>
                    )}
                </div>


                <ModalOrder dict={dict} buttonLabel={dict.contacts.button} />
            </div>
        </section>
    );
}
