import { sendTelegramMessage } from '@/src/lib/telegram';
import { getEnvVar } from '@/src/utils/getEnvVar';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Читаем данные формы как FormData (вместо JSON)
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const contact = formData.get('contact') as string;
    const message = formData.get('message') as string;

    // Достаем все файлы из ключа 'files'
    const fileFields = formData.getAll('files') as File[];

    // Валидация обязательных полей
    if (!name || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const user = getEnvVar('EMAIL_SERVER_USER');
    const pass = getEnvVar('EMAIL_SERVER_PASSWORD');
    const to = getEnvVar('EMAIL_SERVER_USER');

    if (!user || !pass || !to) {
      console.error(
        'Missing EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, or EMAIL_SERVER_USER environment variables.',
      );
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    // Настраиваем конфигурацию SMTP для Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    // Формируем массив вложений для nodemailer
    const attachments = [];

    for (const file of fileFields) {
      // Проверяем, что это действительно файл и он не пустой
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        attachments.push({
          filename: file.name,
          content: buffer,
        });
      }
    }

    // Отправляем письмо
    await transporter.sendMail({
      from: user,
      to: to,
      subject: `📩 Нова заявка з сайту SmartyLoft`,
      text: `
Name: ${name}
Contact: ${contact}

Message:
${message || 'Not specified'}
      `,
      attachments: attachments, // Добавляем файлы сюда
    });

    try {
      const tgMessage = `💬 *Нове повідомлення з форми!*
👤 *Name:* ${name}
📞 *Contact:* ${contact}
📝 *Message:* ${message || 'Not specified'}`;

      await sendTelegramMessage(tgMessage, 'message');
    } catch (tgError) {
      console.error('Telegram notification error in contact form:', tgError);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('NODEMAILER ERROR:', err);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
