import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConstructorConfig {
  width: number;
  height: number;
  color: string;
  sectionsCount?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface IQuickOrder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  config: IConstructorConfig;
  status: 'pending' | 'completed' | 'canceled';
  locale: string;
  rates?: {
    usd: number;
    uah: number;
    pln: number;
  };
  createdAt: Date;
}

const QuickOrderSchema: Schema<IQuickOrder> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    comment: {
      type: String,
      default: '',
    },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'canceled'],
      default: 'pending',
    },
    locale: {
      type: String,
      default: 'en',
    },
    // Явно описываем вложенные поля вместо type: Object
    rates: {
      usd: { type: Number },
      uah: { type: Number },
      pln: { type: Number },
    },
  },
  { timestamps: true, versionKey: false },
);

// Сбрасываем старую закэшированную модель в dev-режиме, чтобы применились новые поля схемы
if (mongoose.models.QuickOrder) {
  delete mongoose.models.QuickOrder;
}

const QuickOrder: Model<IQuickOrder> = mongoose.model<IQuickOrder>(
  'QuickOrder',
  QuickOrderSchema,
);

export default QuickOrder;
