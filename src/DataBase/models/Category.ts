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
export interface ICategory extends Document {
  title: ILocalizedText;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Создаем схему Mongoose
const CategorySchema: Schema = new Schema(
  {
    title: {
      ua: { type: String, default: '' },
      pl: { type: String, default: '' },
      en: { type: String, default: '' },
      lt: { type: String, default: '' },
    },

    imageUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
