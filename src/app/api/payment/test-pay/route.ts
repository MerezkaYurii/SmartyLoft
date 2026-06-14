import { NextResponse } from 'next/server';
import { initMongoConnection } from '@/src/lib/mongoose';
import QuickOrder from '@/src/DataBase/models/QuickOrder';

export async function GET(req: Request) {
  try {
    // Берем ID заказа из параметров строки: /api/payment/test-pay?orderId=ХХХ
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Provide orderId in query' },
        { status: 400 },
      );
    }

    await initMongoConnection();

    // Симулируем то, что должен сделать наш вебхук при успешной оплате
    const updatedOrder = await QuickOrder.findByIdAndUpdate(
      orderId,
      { status: 'paid' },
      { new: true },
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found in DB' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fake payment successful! Status updated to paid.',
      order: updatedOrder,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
