import { NextResponse } from 'next/server';

import { initMongoConnection } from '@/src/lib/mongoose';
import Product from '@/src/DataBase/models/Product';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 1. ПОЛУЧЕНИЕ ОДНОГО ТОВАРА (для загрузки в форму)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await initMongoConnection();

    // В Next.js 16 params — это Promise, поэтому используем await
    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении товара:', error);
    const msg = error instanceof Error ? error.message : 'Ошибка сервера';
    return NextResponse.json(
      { error: `Не удалось загрузить товар: ${msg}` },
      { status: 500 },
    );
  }
}

// 2. ОБНОВЛЕНИЕ ТОВАРА (сохранение изменений)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await initMongoConnection();
    await Product.collection.dropIndex('id_1').catch(() => {});
    const { id } = await params;

    const body = await request.json();

    // Достаем из тела запроса новые поля: category и isNewProduct
    const {
      title,
      price,
      sku,
      images,
      description,
      size,
      category,
      isNewProduct,
    } = body;

    if (!title || !price) {
      return NextResponse.json(
        { error: 'Название и цена обязательны' },
        { status: 400 },
      );
    }

    // Обновляем документ в MongoDB со всеми новыми полями
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title,
        price: String(price), // Приводим к строке, как и при создании товара
        sku: sku || '',
        images: Array.isArray(images) ? images : [],
        description,
        size: Array.isArray(size) ? size : [],
        category: category || '', // Обновляем ID категории
        isNewProduct: Boolean(isNewProduct), // Обновляем статус новинки
      },
      { new: true, runValidators: true }, // new: true вернет уже обновленный документ
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Товар для обновления не найден' },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Ошибка при更新лении товара:', error);
    const msg = error instanceof Error ? error.message : 'Ошибка сервера';
    return NextResponse.json(
      { error: `Не удалось сохранить изменения: ${msg}` },
      { status: 500 },
    );
  }
}
