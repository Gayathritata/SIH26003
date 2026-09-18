import mongoose, { Schema, Document } from 'mongoose';

export interface IGameContent extends Document {
  gameType: string;
  region: string;
  language: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
  image?: string;
  audio?: string;
  difficulty: number;
  createdAt: Date;
}

const GameContentSchema: Schema = new Schema(
  {
    gameType: { type: String, required: true },
    region: { type: String, default: 'NorthEast_India' },
    language: { type: String, default: 'en' },
    category: { type: String, default: 'cultural_objects' },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    image: { type: String },
    audio: { type: String },
    difficulty: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export default mongoose.model<IGameContent>('GameContent', GameContentSchema);
