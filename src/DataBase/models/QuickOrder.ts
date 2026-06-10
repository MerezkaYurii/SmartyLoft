import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConstructorConfig {
  width: number;
  height: number;
  color: string;
  sectionsCount?: number;
  // Сюда можно будет дописывать любые другие параметры мебели по мере развития конструктора
  [key: string]: string | number | boolean | undefined;
}

export interface IQuickOrder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  config: IConstructorConfig; // Тут будут храниться размеры, секции, цвет и т.д.
  status: 'pending' | 'completed' | 'canceled';
  locale: string; // Запоминаем язык, с которого пришел заказ
  createdAt: Date;
}

const QuickOrderSchema: Schema<IQuickOrder> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Ссылка на модель пользователей NextAuth
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    }, // Гибкое поле для любых параметров конструктора
    status: {
      type: String,
      enum: ['pending', 'completed', 'canceled'],
      default: 'pending',
    },
    locale: {
      type: String,
      default: 'en',
    },
  },
  { timestamps: true, versionKey: false },
);

// Защита от избыточного создания моделей при Hot Reload в Next.js
const QuickOrder: Model<IQuickOrder> =
  mongoose.models.QuickOrder ||
  mongoose.model<IQuickOrder>('QuickOrder', QuickOrderSchema);

export default QuickOrder;
