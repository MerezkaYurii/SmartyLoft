import Product from '@/src/DataBase/models/Product';
import { initMongoConnection } from '@/src/lib/mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initMongoConnection();
    const products = await Product.find({}).sort({ createdAt: -1 });
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

    const { title, price, sku, images, size } = await request.json();

    if (!title || !price) {
      return NextResponse.json(
        { error: 'Название и цена обязательны' },
        { status: 400 },
      );
    }

    // Создаем запись в MongoDB
    const newProduct = await Product.create({
      title,
      price: String(price),
      sku: sku || '',
      images: images || [],
      description: 'Временное описание',
      id: sku || String(Date.now()),
      size: size || [],
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при сохранении' },
      { status: 500 },
    );
  }
}

// 3. Удаление товара по его ID без использования any
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

    // Безопасно достаем сообщение об ошибке без any
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка сервера';

    return NextResponse.json(
      { error: `Ошибка сервера при удалении: ${errorMessage}` },
      { status: 500 },
    );
  }
}
