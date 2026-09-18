import mongoose, { Schema, Document } from 'mongoose';

export interface IMoodLog extends Document {
  patientId: string;
  mood: 'happy' | 'good' | 'okay' | 'worried' | 'sad';
  createdAt: Date;
}

const MoodLogSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    mood: { type: String, required: true, enum: ['happy', 'good', 'okay', 'worried', 'sad'] }
  },
  { timestamps: true }
);

export default mongoose.model<IMoodLog>('MoodLog', MoodLogSchema);
