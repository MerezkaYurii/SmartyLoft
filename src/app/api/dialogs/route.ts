import { NextResponse } from 'next/server';

import { initMongoConnection } from '@/src/lib/mongoose';
import Dialog from '@/src/DataBase/models/Dialog';

export async function GET() {
  try {
    await initMongoConnection();

    // Сортируем по дате создания (новые вверху)
    const dialogs = await Dialog.find({}).sort({ createdAt: 1 });

    return NextResponse.json(dialogs, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching dialogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dialogs' },
      { status: 500 },
    );
  }
}

// POST-роут для создания нового диалога
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

    const newDialog = await Dialog.create({
      sessionId: title,
      messages: imageUrl || '',
    });

    return NextResponse.json(newDialog, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating dialog:', error);
    return NextResponse.json(
      { error: 'Failed to create dialog' },
      { status: 500 },
    );
  }
}
