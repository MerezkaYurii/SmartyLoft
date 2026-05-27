import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Описываем интерфейс документа товара для TypeScript
export interface IProduct extends Document {
  id: string; // Оставляем строковый id, который мы используем в роутах
  title: string;
  description: string;
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
    id: { type: String },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: String, required: true },
    sku: { type: String, default: '' },
    images: { type: [String], default: [] },
    category: { type: String, default: '' },
    size: { type: [String], default: [] },
  },
  {
    timestamps: true, // Автоматически добавит поля createdAt и updatedAt
  },
);

// 3. Экспортируем модель.
// Проверяем mongoose.models.Product, чтобы не перезаписывать модель при Fast Refresh в Next.js
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
