import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './lib/dbClient'; // Путь к нашему мосту базы данных

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
    }),
  ],

  // Кастомная страница логина
  pages: {
    signIn: '/login',
  },
});
