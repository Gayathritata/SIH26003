import mongoose, { Schema, Document } from 'mongoose';

export interface IMotivationalQuote extends Document {
  quote: string;
  author?: string;
  category?: string;
  language?: string;
  createdAt: Date;
}

const MotivationalQuoteSchema: Schema = new Schema(
  {
    quote: { type: String, required: true },
    author: { type: String, default: 'MindMate Cognitive Care' },
    category: { type: String, default: 'daily_encouragement' },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

export default mongoose.model<IMotivationalQuote>('MotivationalQuote', MotivationalQuoteSchema);
