import { NextResponse } from 'next/server';
import { initMongoConnection } from '@/src/lib/mongoose';
import QuickOrder from '@/src/DataBase/models/QuickOrder';
import Stripe from 'stripe';
import { getEnvVar } from '@/src/utils/getEnvVar';

export async function POST(req: Request) {
  try {
    // Инициализируем Stripe с секретным ключом из .env
    const stripeSecretKey = getEnvVar('STRIPE_SECRET_KEY') as string;

    // Секрет вебхука для проверки подписи
    const webhookSecret = getEnvVar('STRIPE_WEBHOOK_SECRET') as string;
    const stripe = new Stripe(stripeSecretKey);
    const body = await req.text(); // Для Stripe нужна сырая строка (raw text)
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    // Верифицируем подпись Stripe
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unknown signature error';
      console.error(
        `[STRIPE WEBHOOK ERROR] Signature verification failed: ${msg}`,
      );
      return NextResponse.json(
        { error: `Webhook Error: ${msg}` },
        { status: 400 },
      );
    }

    // Обрабатываем успешное событие оплаты
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Извлекаем ID нашего заказа из metadata сессии
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await initMongoConnection();

        // Обновляем статус заказа на "paid"
        const updatedOrder = await QuickOrder.findByIdAndUpdate(
          orderId,
          { status: 'paid' },
          { new: true },
        );

        if (updatedOrder) {
          console.log(
            `[STRIPE WEBHOOK] Order ${orderId} successfully marked as PAID.`,
          );
        } else {
          console.error(
            `[STRIPE WEBHOOK] Order ${orderId} not found in database.`,
          );
        }
      } else {
        console.error('[STRIPE WEBHOOK] No orderId found in session metadata.');
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('API_STRIPE_WEBHOOK_GENERAL_ERROR:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal Server Error: ${msg}` },
      { status: 500 },
    );
  }
}
