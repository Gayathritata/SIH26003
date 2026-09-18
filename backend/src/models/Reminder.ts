import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  patientId: string;
  type: 'medicine' | 'hydration' | 'activity' | 'appointment';
  title: string;
  description: string;
  scheduledTime: string; // e.g. "08:00 AM" or ISO string
  status: 'pending' | 'completed' | 'missed';
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['medicine', 'hydration', 'activity', 'appointment'] },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    scheduledTime: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
