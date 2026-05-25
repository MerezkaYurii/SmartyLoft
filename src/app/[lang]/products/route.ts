import { NextResponse } from "next/server";
import Product from "@/src/DataBase/models/Product";
import { initMongoConnection } from "@/src/lib/mongoose";


// Этот метод GET будет срабатывать при запросе на http://localhost:3000/api/products
export async function GET() {
  try {
    // 1. Подключаемся к базе данных
    await initMongoConnection();

    // 2. Тянем все товары из коллекции
    const products = await Product.find({});

    // 3. Возвращаем их в формате JSON
    return NextResponse.json(products, { status: 200 });
  } catch (error: unknown) {
    console.error("Ошибка API при получении товаров:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}







// Этот метод POST будет срабатывать, если мы отправим POST-запрос на /api/products
export async function POST() {
  try {
    await initMongoConnection();

    // Тестовые товары для SmartyLoft
    const dummyProducts = [
      {
        id: "smarty-loft-classic",
        title: "Стеллаж SmartyLoft Classic",
        description: "Стильный деревянный стеллаж с интегрированной LED-подсветкой для комнатных растений.",
        price: "4500",
        image: "/images/products/product-classic.jpg", // Ссылки на локальные картинки, пока нет Cloudinary
      },
      {
        id: "smarty-loft-wall",
        title: "Настенная полка Flora",
        description: "Компактная настенная полка с дополнительным освещением для суккулентов.",
        price: "2200",
        image: "/images/products/product-wall.jpg",
      }
    ];

    // Очищаем старые товары (если были) и вставляем новые
    await Product.deleteMany({});
    await Product.insertMany(dummyProducts);

    return NextResponse.json({ message: "База данных успешно наполнена товарами!" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Ошибка при заполнении БД:", error);
    return NextResponse.json({ message: "Ошибка сервера при POST" }, { status: 500 });
  }
}