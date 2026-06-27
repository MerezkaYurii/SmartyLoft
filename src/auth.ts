import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './lib/dbClient'; // Путь к нашему мосту базы данных
import nodemailer from 'nodemailer';
import { MongoClient } from 'mongodb';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Подключаем адаптер для MongoDB
  adapter: MongoDBAdapter(clientPromise as unknown as Promise<MongoClient>),

  // Настраиваем способы входа
  providers: [
    // 1. Вход через Google
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    // 2. Вход по беспарольной Магической Ссылке (Magic Link)
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,

      async sendVerificationRequest({ identifier: email, url, provider }) {
        const transport = nodemailer.createTransport(provider.server);

        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        // Находим сохраненный язык, по умолчанию ставим 'en'
        const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

        let subject = `Sign in to SmartyLoft`;
        let title = `Welcome to SmartyLoft!`;
        let description = `Click the button below to sign in to your account.`;
        let buttonText = `Sign in`;
        let footerText = `If you did not request this email, you can safely ignore it.`;
        // Проверяем, есть ли префикс /ru/ или /en/ в путях редиректа внутри URL
        if (locale === 'lt') {
          subject = `Prisijungti prie „SmartyLoft“ `;
          title = `Sveiki atvykę į „SmartyLoft“!`;
          description = `Norėdami prisijungti prie asmeninės paskyros, spustelėkite žemiau esantį mygtuką.`;
          buttonText = `Prisijunkite prie svetainės `;
          footerText = `Jei neprašėte šio el. laiško, tiesiog ignoruokite jį.`;
        } else if (locale === 'ua') {
          subject = `Вхід в SmartyLoft`;
          title = `Ласкаво просимо до SmartyLoft!`;
          description = `Натисніть на кнопку нижче, щоб увійти в свій особистий кабінет.`;
          buttonText = `Увійти на сайт`;
          footerText = `Якщо ви не замовляли цей лист, просто проігноруйте його.`;
        } else if (locale === 'pl') {
          subject = `Zaloguj się do SmartyLoft`;
          title = `Witamy w SmartyLoft!`;
          description = `Kliknij poniższy przycisk, aby zalogować się na swoje konto.`;
          buttonText = `Zaloguj się`;
          footerText = `Jeśli nie prosiłeś o wysłanie tego e-maila, możesz go bezpiecznie zignorować.`;
        }

        // Автоматически определяем домен сайта (localhost или реальный домен на сервере)
        const host = url.startsWith('http://localhost')
          ? 'http://localhost:3000'
          : 'https://smartyloft.com'; // Замени на свой реальный домен, когда выкатишь на хостинг

        const bgImageUrl = `${host}/bgWiteThema.jpg`;

        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: subject,
          text: `${title} ${description}: ${url}`,
          html: `
         <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Arial, sans-serif;">
              <tr>
                <td align="center" valign="top" bgcolor="#f3f4f6" background="${bgImageUrl}" style="padding: 40px 10px; background-image: url('${bgImageUrl}'); background-repeat: repeat;">
                  
                  <div style="max-width: 600px; margin: 40px auto; background: rgba(255, 255, 255, 0.96); padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; text-align: center;">
                    <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; font-weight: bold;">${title}</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">${description}</p>
                    
                    <a href="${url}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                      ${buttonText}
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 35px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.4;">${footerText}</p>
                  </div>

                </td>
              </tr>
            </table>
          `,
        });
      },
    }),
  ],

  // Кастомная страница логина
  pages: {
    signIn: '/login',
  },
});
