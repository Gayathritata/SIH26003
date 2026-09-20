import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId | string;
  firebaseUid: string;
  age: number;
  preferredLanguage: string;
  selectedCaregiverId?: string;
  cognitiveLevel?: number;
  gameLevels?: {
    memory_match: number;
    pattern_recognition: number;
    daily_routine_recall: number;
    object_recognition: number;
  };
  emergencyContact?: {
    name: string;
    phone: string;
  };
  accessibilityPreferences?: {
    fontSize?: 'standard' | 'large' | 'extra_large';
    highContrast?: boolean;
    voiceEnabled?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PatientProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    firebaseUid: { type: String, required: false, index: true },
    age: { type: Number, default: 74 },
    preferredLanguage: { type: String, default: 'en' },
    selectedCaregiverId: { type: String, default: '' },
    cognitiveLevel: { type: Number, default: 1, min: 1, max: 100 },
    gameLevels: {
      memory_match: { type: Number, default: 1, min: 1, max: 100 },
      pattern_recognition: { type: Number, default: 1, min: 1, max: 100 },
      daily_routine_recall: { type: Number, default: 1, min: 1, max: 100 },
      object_recognition: { type: Number, default: 1, min: 1, max: 100 },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    accessibilityPreferences: {
      fontSize: { type: String, default: 'large' },
      highContrast: { type: Boolean, default: true },
      voiceEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPatientProfile>('PatientProfile', PatientProfileSchema);
