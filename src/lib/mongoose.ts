import mongoose from 'mongoose';
import { getEnvVar } from '../utils/getEnvVar';


// 1. Описываем интерфейс для нашего кэша
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}


// 2. Безопасно расширяем глобальный объект Node.js через глобальный интерфейс
declare global {
  
  var mongooseCache: MongooseCache | undefined;
}

// 3. Инициализируем кэш без использования any
let cached = globalThis.mongooseCache;

if (!cached) {
  cached = globalThis.mongooseCache = { conn: null, promise: null };
}
export const initMongoConnection = async (): Promise<typeof mongoose> => {
  // 1. Если подключение уже есть — просто возвращаем его (не подключаемся заново)
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Если это первый запуск — собираем строку и подключаемся
  if (!cached.promise) {
    try {
    
      const password = getEnvVar('MONGODB_PASSWORD');
      const url = getEnvVar('MONGODB_URL');
      const name = getEnvVar('MONGODB_DB');
      
      const uri = `mongodb+srv://smartyloft:${password}@${url}/${name}?retryWrites=true&w=majority&appName=smartyloft`;







      cached.promise = mongoose.connect(uri, { bufferCommands: false }).then((m) => {
        console.log(`🟢 Connected to MongoDB database: ${name} at cluster: ${url}`);
        console.log('Successfully connection to database');
        return m;
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log('❌ MongoDB connection error:', error.message);
      } else {
        console.error('❌ Unknown error during MongoDB connection');
      }
      cached.promise = null;
      throw error;
    }
  }

  cached.conn = await cached.promise;
  return cached.conn;
};