import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  userId: string;
  patientId?: string;
  caregiverId?: string;
  title: string;
  description?: string;
  type: 'medicine' | 'hydration' | 'activity' | 'appointment' | 'general';
  date?: string;
  time: string;
  scheduledTime?: string;
  repeat: 'none' | 'daily' | 'weekly';
  isActive: boolean;
  completed: boolean;
  completedAt?: Date;
  status: 'pending' | 'completed' | 'missed';
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    patientId: { type: String, index: true },
    caregiverId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      required: true,
      enum: ['medicine', 'hydration', 'activity', 'appointment', 'general'],
      default: 'general',
    },
    date: { type: String, default: '' },
    time: { type: String, required: true },
    scheduledTime: { type: String },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly'],
      default: 'none',
    },
    isActive: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
