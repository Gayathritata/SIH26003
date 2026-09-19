import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  clientSessionId?: string;
  userId: string;
  patientId: string;
  gameType: string;
  difficulty: number;
  totalPairs: number;
  attempts: number;
  correctMatches: number;
  incorrectAttempts: number;
  accuracy: number;
  completionTime: number;
  completionRate: number;
  score: number;
  startedAt?: Date;
  completedAt?: Date;
  reactionTime?: number;
  mistakes?: number;
  duration?: number;
  mood?: string;
  aiRecommendedDifficulty?: number;
  aiConfidence?: number;
  aiReason?: string;
  createdAt: Date;
}

const GameSessionSchema: Schema = new Schema(
  {
    clientSessionId: { type: String, sparse: true, index: true },
    userId: { type: String, required: true, index: true },
    patientId: { type: String, index: true },
    gameType: { type: String, required: true, default: 'memory_match' },
    difficulty: { type: Number, required: true, default: 1 },
    totalPairs: { type: Number, default: 3 },
    attempts: { type: Number, default: 0 },
    correctMatches: { type: Number, default: 0 },
    incorrectAttempts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    completionTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 100 },
    score: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now },
    reactionTime: { type: Number, default: 0 },
    mistakes: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    mood: { type: String, default: 'good' },
    aiRecommendedDifficulty: { type: Number, default: 1 },
    aiConfidence: { type: Number, default: 1.0 },
    aiReason: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IGameSession>('GameSession', GameSessionSchema);
