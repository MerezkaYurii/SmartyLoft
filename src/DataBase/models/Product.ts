import mongoose, { Schema, Document, Model } from 'mongoose';

// Создаем отдельный интерфейс для мультиязычных полей
interface ILocalizedText {
  ua?: string;
  pl?: string;
  en?: string;
  lt?: string;
  [key: string]: string | undefined; // На случай добавления других языков
}

// 1. Описываем интерфейс документа товара для TypeScript
export interface IProduct extends Document {
  title: ILocalizedText;
  description: ILocalizedText;
  price: string;
  images: string[];
  sku?: string;
  category?: string;
  size?: string[];
  createdAt: Date;
}

// 2. Создаем схему Mongoose
const ProductSchema: Schema = new Schema(
  {
    title: {
      ua: { type: String, default: '' },
      pl: { type: String, default: '' },
      en: { type: String, default: '' },
      lt: { type: String, default: '' },
    },
    description: {
      ua: { type: String, default: '' },
      pl: { type: String, default: '' },
      en: { type: String, default: '' },
      lt: { type: String, default: '' },
    },
    price: { type: String, required: true },
    sku: { type: String, default: '' },
    images: { type: [String], default: [] },
    category: { type: String, default: '' },
    size: { type: [String], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// 3. Экспортируем модель.
// Проверяем mongoose.models.Product, чтобы не перезаписывать модель при Fast Refresh в Next.js
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
