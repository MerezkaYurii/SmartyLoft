export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  slug: string;
}

export const productsData: Product[] = [
  {
    id: "1",
    title: "SmartyLoft Classic",
    description: "Напольный стеллаж для растений ",
    price: "120 €",
    image: "/images/flowerShelf.jpg",
    slug: "smartyloft-classic"
  },
  {
    id: "2",
    title: "SmartyLoft Wall Mini",
    description: "Напольный стеллаж для растений высокий",
    price: "150 €",
    image: "/images/highFlowerShelf.jpg",
    slug: "smartyloft-wall-mini"
  },
  {
    id: "3",
    title: "SmartyLoft Eco Light",
    description: " теллаж для микроволновки ",
    price: "45 €",
    image: "/images/microwaveShelf.jpg",
    slug: "smartyloft-eco-light"
  },
  {
    id: "4",
    title: "SmartyLoft Classic",
    description: "Напольный стеллаж для растений ",
    price: "120 €",
    image: "/images/flowerShelf.jpg",
    slug: "smartyloft-classic"
  },
  {
    id: "5",
    title: "SmartyLoft Wall Mini",
    description: "Напольный стеллаж для растений высокий",
    price: "150 €",
    image: "/images/highFlowerShelf.jpg",
    slug: "smartyloft-wall-mini"
  },
  {
    id: "6",
    title: "SmartyLoft Eco Light",
    description: " теллаж для микроволновки ",
    price: "45 €",
    image: "/images/microwaveShelf.jpg",
    slug: "smartyloft-eco-light"
  }
];