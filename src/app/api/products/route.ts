import Product from '@/src/DataBase/models/Product';
import { initMongoConnection } from '@/src/lib/mongoose';
import { NextResponse } from 'next/server';

// 1. Получение товаров (с поддержкой фильтрации по категории)
export async function GET(request: Request) {
  try {
    await initMongoConnection();

    // Извлекаем id категории из параметров запроса (если он передан)
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');

    // Если передан categoryId, фильтруем по нему, иначе отдаем все товары
    const filter = categoryId ? { category: categoryId } : {};

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error(
      'Error when receiving goods / Помилка при отриманні товару:',
      error,
    );
    return NextResponse.json(
      { error: 'Error while loading data / Помилка при отриманні даних' },
      { status: 500 },
    );
  }
}

// 2. Создание нового товара из админки
export async function POST(request: Request) {
  try {
    await initMongoConnection();

    const {
      title,
      description,
      price,
      sku,
      images,
      size,
      category,
      isNewProduct,
    } = await request.json();

    if (!title || !price) {
      return NextResponse.json(
        { error: "Title and price are required / Назва та ціна обов'язкові" },
        { status: 400 },
      );
    }

    // Создаем запись в MongoDB со всеми полями
    const newProduct = await Product.create({
      title,
      price: String(price),
      sku: sku || '',
      images: images || [],
      description,
      size: size || [],
      category: category || '',
      isNewProduct: Boolean(isNewProduct),
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(
      'Error while creating product / Помилка при створенні товару:',
      error,
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error / Невідома помилка';
    return NextResponse.json(
      {
        error: `Server error while saving / Помилка сервера при збереженні: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}

// 3. Удаление товара по его ID
export async function DELETE(request: Request) {
  try {
    await initMongoConnection();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID not specified / ID товару не вказано' },
        { status: 400 },
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        {
          error:
            'Product with this ID not found / Товар з таким ID не знайдено',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Product successfully deleted / Товар успішно видалено' },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      'Error while deleting product / Помилка при видаленні товару:',
      error,
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error / Невідома помилка';
    return NextResponse.json(
      {
        error: `Server error while deleting / Помилка сервера при видаленні: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
