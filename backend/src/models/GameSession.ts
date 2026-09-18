import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  patientId: string; // firebaseUid
  gameType: 'memory' | 'pattern' | 'routine' | 'object_rec';
  difficulty: number;
  score: number;
  accuracy: number;
  reactionTime: number;
  mistakes: number;
  completionRate: number;
  duration: number;
  attempts: number;
  mood: string;
  aiRecommendedDifficulty: number;
  aiConfidence: number;
  aiReason?: string;
  createdAt: Date;
}

const GameSessionSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    gameType: { type: String, required: true, enum: ['memory', 'pattern', 'routine', 'object_rec'] },
    difficulty: { type: Number, required: true },
    score: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    reactionTime: { type: Number, required: true },
    mistakes: { type: Number, required: true },
    completionRate: { type: Number, default: 1.0 },
    duration: { type: Number, default: 45 },
    attempts: { type: Number, default: 1 },
    mood: { type: String, default: 'good' },
    aiRecommendedDifficulty: { type: Number, default: 2 },
    aiConfidence: { type: Number, default: 0.85 },
    aiReason: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IGameSession>('GameSession', GameSessionSchema);
