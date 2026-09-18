import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  patientId: string;
  alertType: 'performance_change' | 'reminder_incomplete' | 'low_activity';
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
}

const AlertSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    alertType: { type: String, required: true, enum: ['performance_change', 'reminder_incomplete', 'low_activity'] },
    message: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['active', 'acknowledged', 'resolved'], default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model<IAlert>('Alert', AlertSchema);
