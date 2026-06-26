import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Интерфейсы для типизации
interface IMessage {
  type: string;
  data: {
    content: string;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
    tool_calls?: unknown[];
    invalid_tool_calls?: unknown[];
  };
}

export interface IDialog extends Document {
  sessionId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Схема Mongoose
const DialogSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    messages: [
      {
        type: { type: String, required: true },
        data: {
          content: { type: String, required: true },
          additional_kwargs: { type: Schema.Types.Mixed },
          response_metadata: { type: Schema.Types.Mixed },
          tool_calls: { type: [Schema.Types.Mixed] },
          invalid_tool_calls: { type: [Schema.Types.Mixed] },
        },
      },
    ],
  },
  {
    timestamps: true, // Это поле автоматически создаст createdAt и updatedAt
    versionKey: false,
    collection: 'n8n_chat_histories', // Важно: указываем имя существующей коллекции
  },
);

const Dialog: Model<IDialog> =
  mongoose.models.Dialog || mongoose.model<IDialog>('Dialog', DialogSchema);

export default Dialog;
