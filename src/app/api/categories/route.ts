import { NextResponse } from 'next/server';

import { initMongoConnection } from '@/src/lib/mongoose';
import Category from '@/src/DataBase/models/Category';

export async function GET() {
  try {
    await initMongoConnection();

    // Сортируем по дате создания (новые вверху)
    const categories = await Category.find({}).sort({ createdAt: -1 });

    return NextResponse.json(categories, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}

// POST-роут для создания новой категории
export async function POST(request: Request) {
  try {
    await initMongoConnection();
    const body = await request.json();
    const { title, imageUrl } = body;

    // Валидация: проверяем, что передали хотя бы название
    if (!title || typeof title !== 'object') {
      return NextResponse.json(
        { error: 'Title object is required' },
        { status: 400 },
      );
    }

    const newCategory = await Category.create({
      title,
      imageUrl: imageUrl || '',
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 },
    );
  }
}
