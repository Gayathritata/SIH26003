import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'elderly_user' | 'elderly' | 'caregiver' | 'admin';

export interface IUser extends Document {
  firebaseUid?: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  preferredLanguage: string;
  language?: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: false, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: false },
    role: {
      type: String,
      enum: ['elderly_user', 'elderly', 'caregiver', 'admin'],
      default: 'elderly_user',
    },
    preferredLanguage: { type: String, default: 'en' },
    language: { type: String, default: 'en' },
    region: { type: String, default: 'South_NER' },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);

