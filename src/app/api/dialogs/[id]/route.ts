import { NextResponse } from 'next/server';
import { initMongoConnection } from '@/src/lib/mongoose';
import Dialog from '@/src/DataBase/models/Dialog';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 1. ПОЛУЧЕНИЕ ОДНОГО ДИАЛОГА (только просмотр)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await initMongoConnection();

    const { id } = await params;

    // Ищем диалог по его _id
    const dialog = await Dialog.findById(id).lean(); // .lean() ускоряет запрос, так как нам не нужны методы Mongoose

    if (!dialog) {
      return NextResponse.json(
        { error: 'Dialogue not found / Діалог не знайдено' },
        { status: 404 },
      );
    }

    return NextResponse.json(dialog, { status: 200 });
  } catch (error) {
    console.error(
      'Error while loading dialogue / Помилка при завантаженні діалогу:',
      error,
    );
    return NextResponse.json(
      { error: 'Error while loading dialogue / Не вдалося завантажити діалог' },
      { status: 500 },
    );
  }
}
