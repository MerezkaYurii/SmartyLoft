import { NextResponse } from 'next/server';
import { initMongoConnection } from '@/src/lib/mongoose';
import CurrencyRate from '@/src/DataBase/models/CurrencyRate';

// GET: Получить текущие курсы
// GET: Получить текущие курсы
export async function GET() {
  try {
    await initMongoConnection();

    // Ищем запись и через .lean() получаем чистый JS-объект
    const mongoRates = await CurrencyRate.findOne().lean();

    // Формируем чистый объект данных для ответа
    const ratesData = mongoRates
      ? {
          uah: mongoRates.uah,
          pln: mongoRates.pln,
          usd: mongoRates.usd,
        }
      : {
          uah: 45,
          pln: 4.3,
          usd: 1.08,
        };

    return NextResponse.json(ratesData, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
// PUT: Обновить или создать курсы
export async function PUT(request: Request) {
  try {
    await initMongoConnection();
    const body = await request.json();

    const { uah, pln, usd } = body;

    // Валидация: проверяем, что пришли числа и они больше нуля
    if (!uah || !pln || !usd || isNaN(uah) || isNaN(pln) || isNaN(usd)) {
      return NextResponse.json(
        {
          error:
            'All rates must be valid numbers / Усі ставки мають бути дійсними числами.',
        },
        { status: 400 },
      );
    }

    // Обновляем единственную запись или создаем её, если базы пуста
    const updatedRates = await CurrencyRate.findOneAndUpdate(
      {},
      { uah: Number(uah), pln: Number(pln), usd: Number(usd) },
      { new: true, upsert: true },
    );

    return NextResponse.json(updatedRates, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
