import { NextResponse } from 'next/server';
import { initMongoConnection } from '@/src/lib/mongoose';
import QuickOrder from '@/src/DataBase/models/QuickOrder';
import Product from '@/src/DataBase/models/Product';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface IOrderProduct {
  price: string;
  title?: Record<string, string>;
}

interface IPopulatedOrder {
  _id: mongoose.Types.ObjectId;
  config?: {
    productId?: string;
  };
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: 'Invalid or missing Order ID' },
        { status: 400 },
      );
    }

    await initMongoConnection();

    // Находим заказ
    const order = (await QuickOrder.findById(
      orderId,
    ).lean()) as IPopulatedOrder | null;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const productId = order.config?.productId;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Product ID missing in order' },
        { status: 400 },
      );
    }

    // Находим цену товара из базы данных для безопасности (чтобы клиент не подменил цену)
    const product = (await Product.findById(productId)
      .select('price title')
      .lean()) as IOrderProduct | null;
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Конвертируем цену в центы (Stripe принимает суммы в минимальных денежных единицах)
    const priceInCents = Math.round(parseFloat(product.price) * 100);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const productName =
      product.title?.['en'] || product.title?.['uk'] || 'SmartyLoft Product';

    // Создаем сессию оплаты Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: productName,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Передаем orderId в metadata, чтобы вебхук знал, какой заказ отмечать как оплаченный
      metadata: {
        orderId: orderId.toString(),
      },
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: unknown) {
    console.error('STRIPE_CHECKOUT_ERROR:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal Server Error: ${msg}` },
      { status: 500 },
    );
  }
}
