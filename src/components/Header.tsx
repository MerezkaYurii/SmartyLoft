'use client';



import { useDictionary } from '../hooks/useDictionary';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';




export default function Header() {
    // получаем t из пропсов



    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-gray-400/80 shadow-sm dark:bg-gray-900/70 dark:text-white transition-colors duration-500 ">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex  items-center justify-between h-[70px] ">
                <Link href="/" className="flex items-center ">
                    <svg className="w-40 h-auto dark:hidden">
                        <use href="/spriteSL.svg#icon-Logo-smartyloft" />
                    </svg>
                    <svg className="w-40 h-auto hidden dark:block">
                        <use href="/spriteSL.svg#icon-Logo-smartyloft-white" />
                    </svg>
                </Link>

                <Link href="/contacts" className="flex items-center font-bold  text-black dark:text-white">
                    Contacts
                </Link>

                <ThemeToggle />
                <LanguageSwitcher />
            </div>
        </header>
    );
}
