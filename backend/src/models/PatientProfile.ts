import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId | string;
  firebaseUid: string;
  age: number;
  preferredLanguage: string;
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
    firebaseUid: { type: String, required: true, index: true },
    age: { type: Number, default: 74 },
    preferredLanguage: { type: String, default: 'en' },
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
