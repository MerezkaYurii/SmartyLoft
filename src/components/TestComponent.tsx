import Link from 'next/link';
import React from 'react';

const TestComponent = () => {
  return (
    <section id="contact" className="px-2 sm:px-4 lg:px-6 py-6">
      <div className="container mx-auto  py-10 text-center  bg-[#F5F3EF] dark:bg-[#F29175] rounded-2xl mb-[15px]">
        <h2 className="text-lg sm:text-xl md:text-2xl  font-bold mb-3 dark:text-white ">
          Test Component
        </h2>
        <Link
          href={`/${lang}/admin/products`}
          className="text-sm text-gray-900 hover:underline  hover:text-gray-700 dark:text-gray-200 dark:hover:text-white  whitespace-nowrap text-left"
        >
          ← Back / Назад
        </Link>
      </div>
    </section>
  );
};

export default TestComponent;
