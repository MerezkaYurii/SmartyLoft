import { getEnvVar } from '@/src/utils/getEnvVar';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    const adminLogin = getEnvVar('ADMIN_LOGIN');
    const adminPassword = getEnvVar('ADMIN_PASSWORD');

    // Проверяем, заданы ли переменные окружения
    if (!adminLogin || !adminPassword) {
      return NextResponse.json(
        { error: 'Конфигурация авторизации отсутствует на сервере' },
        { status: 500 },
      );
    }

    // Сверяем введенные данные
    if (login === adminLogin && password === adminPassword) {
      const response = NextResponse.json({ success: true });

      // Записываем защищенную куку на 7 дней
      response.cookies.set('admin_session', 'true', {
        httpOnly: true, // Защита от кражи куки через JS (XSS)
        secure: process.env.NODE_ENV === 'production', // Только по HTTPS в продакшене
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Неверный логин или пароль' },
      { status: 401 },
    );
  } catch (error) {
    console.error('ОШИБКА АВТОРИЗАЦИИ:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 },
    );
  }
}
