import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICurrencyRate extends Document {
  uah: number; // Курс EUR -> UAH
  pln: number; // Курс EUR -> PLN
  usd: number; // Курс EUR -> USD
  updatedAt: Date;
}

const CurrencyRateSchema: Schema<ICurrencyRate> = new Schema(
  {
    uah: { type: Number, required: true, default: 45 },
    pln: { type: Number, required: true, default: 4.3 },
    usd: { type: Number, required: true, default: 1.08 },
  },
  { timestamps: true, versionKey: false },
);

// Защита от избыточного создания моделей при Hot Reload в Next.js
const CurrencyRate: Model<ICurrencyRate> =
  mongoose.models.CurrencyRate ||
  mongoose.model<ICurrencyRate>('CurrencyRate', CurrencyRateSchema);

export default CurrencyRate;
