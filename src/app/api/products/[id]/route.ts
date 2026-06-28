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
      return NextResponse.json(
        { error: 'Product not found / Товар не знайдено' },
        { status: 404 },
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(
      'Error while loading product / Помилка при завантаженні товару:',
      error,
    );
    const msg =
      error instanceof Error ? error.message : 'Server error / Помилка сервера';
    return NextResponse.json(
      {
        error: `Failed to load product / Не вдалося завантажити товар: ${msg}`,
      },
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
        { error: "Title and price are required / Назва та ціна обов'язкові" },
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
        {
          error:
            'Product for update not found / Товар для оновлення не знайдено',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error(
      'Error while updating product / Помилка при оновленні товару:',
      error,
    );
    const msg =
      error instanceof Error ? error.message : 'Server error / Помилка сервера';
    return NextResponse.json(
      { error: `Failed to save changes / Не вдалося зберегти зміни: ${msg}` },
      { status: 500 },
    );
  }
}
