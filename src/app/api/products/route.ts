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
    console.error('Ошибка при получении товаров:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных' },
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
        { error: 'Название и цена обязательны' },
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
    console.error('Ошибка при создании товара:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Ошибка сервера при сохранении: ${errorMessage}` },
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
        { error: 'ID товара не указан' },
        { status: 400 },
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'Товар с таким ID не найден' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Товар успешно удален' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка сервера';
    return NextResponse.json(
      { error: `Ошибка сервера при удалении: ${errorMessage}` },
      { status: 500 },
    );
  }
}
