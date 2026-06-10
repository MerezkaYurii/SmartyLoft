import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { initMongoConnection } from '@/src/lib/mongoose';
import QuickOrder from '@/src/DataBase/models/QuickOrder';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    // 1. Проверяем авторизацию через Auth.js v5
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized / Неавторизований' },
        { status: 401 },
      );
    }

    // 2. Получаем данные из тела запроса
    const body = await req.json();
    const { name, phone, productId, lang } = body;

    if (!name || !phone || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields / Відсутні обовʼязкові поля' },
        { status: 400 },
      );
    }
    // Валидация регулярным выражением на бэкенде
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    const globalPhoneRegex = /^\+?\d{7,15}$/;

    if (!globalPhoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone format / Некоректний формат телефону' },
        { status: 400 },
      );
    }
    // 3. Подключаемся к базе данных
    await initMongoConnection();

    // Находим пользователя по email (Auth.js v5 обычно хранит id в session.user.id,
    // но поиск по email — самый надежный вариант)
    const User =
      mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    const userInDb = await User.findOne({ email: session.user.email });

    if (!userInDb) {
      return NextResponse.json(
        { error: 'User not found / Користувача не знайдено' },
        { status: 404 },
      );
    }

    // 4. Формируем конфигурацию заказа
    const configData = {
      productId: productId,
    };

    // 5. Создаем запись в базе данных
    const newOrder = await QuickOrder.create({
      userId: userInDb._id,
      name: name.trim(),
      phone: phone.trim(),
      email: session.user.email,
      config: configData,
      locale: lang || 'en',
      status: 'pending',
    });

    return NextResponse.json(
      { success: true, orderId: newOrder._id },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error('API_QUICK_ORDER_ERROR:', error);
    return NextResponse.json(
      { error: 'Internal Server Error / Помилка сервера' },
      { status: 500 },
    );
  }
}
