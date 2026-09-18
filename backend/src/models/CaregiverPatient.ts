import mongoose, { Schema, Document } from 'mongoose';

export interface ICaregiverPatient extends Document {
  caregiverId: string; // firebaseUid of caregiver
  patientId: string;   // firebaseUid of elderly patient
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

const CaregiverPatientSchema: Schema = new Schema(
  {
    caregiverId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    relationship: { type: String, default: 'Family Caregiver' }
  },
  { timestamps: true }
);

CaregiverPatientSchema.index({ caregiverId: 1, patientId: 1 }, { unique: true });

export default mongoose.model<ICaregiverPatient>('CaregiverPatient', CaregiverPatientSchema);

