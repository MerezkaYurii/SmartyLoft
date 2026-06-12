import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { initMongoConnection } from '@/src/lib/mongoose';
import QuickOrder from '@/src/DataBase/models/QuickOrder';
import Product from '@/src/DataBase/models/Product';
import mongoose from 'mongoose';

// Интерфейс для сырого документа из коллекции QuickOrder
interface IRawOrder {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  comment?: string;
  config?: {
    productId?: string | mongoose.Types.ObjectId | object;
  };
  locale: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized / Неавторизований' },
        { status: 401 },
      );
    }

    await initMongoConnection();

    const orders = (await QuickOrder.find({})
      .sort({ createdAt: -1 })
      .lean()) as unknown as IRawOrder[];

    const fullOrders = await Promise.all(
      orders.map(async (order) => {
        let productData = null;
        const rawProductId = order.config?.productId;

        if (rawProductId) {
          // Очищаем строку от возможных пробелов по краям
          const stringId = (
            typeof rawProductId === 'object'
              ? rawProductId.toString()
              : rawProductId
          ).trim();

          if (mongoose.Types.ObjectId.isValid(stringId)) {
            const objId = new mongoose.Types.ObjectId(stringId);

            productData = await Product.findById(objId)
              .select('title images price sizes description')
              .lean();

            // ЛОГ ДЛЯ ПРОВЕРКИ В ТЕРМИНАЛЕ
            console.log(
              `[ORDER ${order._id}] Searching product: "${stringId}". Found:`,
              productData ? 'YES' : 'NO',
            );
          } else {
            console.log(
              `[ORDER ${order._id}] ID is not valid ObjectId: "${stringId}"`,
            );
          }
        }

        return {
          ...order,
          product: productData,
        };
      }),
    );

    return NextResponse.json(fullOrders, { status: 200 });
  } catch (error: unknown) {
    console.error('API_ADMIN_ORDERS_GET_ERROR:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal Server Error: ${msg}` },
      { status: 500 },
    );
  }
}
export async function PUT(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized / Неавторизований' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status / Відсутні необхідні поля' },
        { status: 400 },
      );
    }

    await initMongoConnection();

    const updatedOrder = await QuickOrder.findByIdAndUpdate(
      orderId,
      { status: status },
      { new: true },
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found / Замовлення не знайдено' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error('API_ADMIN_ORDERS_PUT_ERROR:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal Server Error: ${msg}` },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized / Неавторизований' },
        { status: 401 },
      );
    }

    // Извлекаем id из параметров строки запроса (?id=...)
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: 'Invalid or missing Order ID / Некоректний ID замовлення' },
        { status: 400 },
      );
    }

    await initMongoConnection();

    const deletedOrder = await QuickOrder.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return NextResponse.json(
        { error: 'Order not found / Замовлення не знайдено' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('API_ADMIN_ORDERS_DELETE_ERROR:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal Server Error: ${msg}` },
      { status: 500 },
    );
  }
}
