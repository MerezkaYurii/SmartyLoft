import { NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { initMongoConnection } from '@/src/lib/mongoose';
import QuickOrder from '@/src/DataBase/models/QuickOrder';
import Product from '@/src/DataBase/models/Product';
import CurrencyRate from '@/src/DataBase/models/CurrencyRate'; // ИМПОРТИРОВАЛИ МОДЕЛЬ КУРСОВ
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { getEnvVar } from '@/src/utils/getEnvVar';

const stripe = new Stripe(getEnvVar('STRIPE_SECRET_KEY') as string);

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized / Неавторизований' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, phone, productId, lang, comment } = body;

    if (!name || !phone || !productId) {
      return NextResponse.json(
        { error: 'Missing required fields / Відсутні обовʼязкові поля' },
        { status: 400 },
      );
    }

    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    const globalPhoneRegex = /^\+?\d{7,15}$/;

    if (!globalPhoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone format / Некоректний формат телефону' },
        { status: 400 },
      );
    }

    await initMongoConnection();

    const User =
      mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    const userInDb = await User.findOne({ email: session.user.email });

    if (!userInDb) {
      return NextResponse.json(
        { error: 'User not found / Користувача не знайдено' },
        { status: 404 },
      );
    }

    const targetProduct = await Product.findById(productId);
    if (!targetProduct) {
      return NextResponse.json(
        { error: 'Product not found / Товар не знайдено' },
        { status: 404 },
      );
    }

    const currentLocale = lang || 'en';

    // 1. ПОЛУЧАЕМ ЖИВЫЕ КУРСЫ ИЗ БАЗЫ ДАННЫХ (с дефолтным фолбеком, если база пуста)
    const mongoRates = await CurrencyRate.findOne().lean();
    const uahRate = mongoRates?.uah || 45;
    const plnRate = mongoRates?.pln || 4.3;
    const usdRate = mongoRates?.usd || 1.08;

    const basePriceInEur = parseFloat(targetProduct.price);

    let currency = 'eur';
    let finalPrice = basePriceInEur;

    // 2. ДИНАМИЧЕСКИЙ РАСЧЕТ ЦЕНЫ И ВАЛЮТЫ
    if (currentLocale === 'ua') {
      currency = 'uah';
      finalPrice = basePriceInEur * uahRate;
    } else if (currentLocale === 'pl') {
      currency = 'pln';
      finalPrice = basePriceInEur * plnRate;
    } else if (currentLocale === 'en') {
      currency = 'usd';
      finalPrice = basePriceInEur * usdRate;
    } else if (currentLocale === 'lt') {
      currency = 'eur';
      finalPrice = basePriceInEur; // Литва — базовая цена в евро
    }

    const priceInCents = Math.round(finalPrice * 100);
    const productTitle =
      targetProduct.title[currentLocale] ||
      targetProduct.title['en'] ||
      'Product';

    const configData = {
      productId: productId,
    };

    const newOrder = await QuickOrder.create({
      userId: userInDb._id,
      name: name.trim(),
      phone: phone.trim(),
      email: session.user.email,
      comment: comment ? comment.trim() : '',
      config: configData,
      locale: currentLocale,
      status: 'pending',
    });

    const siteUrl = getEnvVar('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000';

    // Переводим локаль для Stripe (для украинского нужна 'uk')
    const stripeLocale = currentLocale === 'ua' ? 'auto' : currentLocale;

    // 3. СОЗДАНИЕ СЕССИИ STRIPE С ГАРАНТИРОВАННОЙ ЛОКАЛЬЮ И METADATA
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      client_reference_id: newOrder._id.toString(),

      // КРИТИЧЕСКИ ВАЖНО ДЛЯ ВЕБХУКА: передаем ID заказа в metadata
      metadata: {
        orderId: newOrder._id.toString(),
      },

      // Локаль управляет языком интерфейса Stripe и отображением символов валют ($ / грн / zł)
      locale: stripeLocale as Stripe.Checkout.SessionCreateParams.Locale,

      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productTitle,
              images:
                targetProduct.images && targetProduct.images.length > 0
                  ? [targetProduct.images[0]]
                  : [],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/${currentLocale}/profile?success=true`,
      cancel_url: `${siteUrl}/${currentLocale}`,
    });

    return NextResponse.json(
      { success: true, orderId: newOrder._id, url: stripeSession.url },
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
