import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './lib/dbClient'; // Путь к нашему мосту базы данных
import nodemailer from 'nodemailer';
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Подключаем адаптер для MongoDB
  adapter: MongoDBAdapter(clientPromise),

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

        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Вход в SmartyLoft`, // Тема письма
          text: `Чтобы войти, перейдите по ссылке: ${url}`, // Текст для старых почтовых клиентов
          html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Добро пожаловать в SmartyLoft!</h2>
                <p style="color: #555; font-size: 16px;">Нажмите на кнопку ниже, чтобы войти в свой личный кабинет.</p>
                
                <a href="${url}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 25px 0; font-weight: bold;">
                  Войти на сайт
                </a>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #999; font-size: 12px;">Если вы не запрашивали это письмо, просто проигнорируйте его.</p>
              </div>
            </div>
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
