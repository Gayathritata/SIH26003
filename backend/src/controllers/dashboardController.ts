import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import CaregiverPatient from '../models/CaregiverPatient';
import Reminder from '../models/Reminder';
import Alert from '../models/Alert';
import { calculatePatientAnalytics } from '../services/analyticsService';

export const getDashboardOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const caregiverUid = req.user?.firebaseUid;
    const requestedPatientId = req.query.patientId as string;

    let targetPatientId = requestedPatientId;

    if (!targetPatientId) {
      const mapping = await CaregiverPatient.findOne({ caregiverId: caregiverUid });
      targetPatientId = mapping ? mapping.patientId : 'demo_patient_uid';
    }

    const patientUser = await User.findOne({ firebaseUid: targetPatientId });
    const profile = await PatientProfile.findOne({ firebaseUid: targetPatientId });
    const analytics = await calculatePatientAnalytics(targetPatientId);
    const reminders = await Reminder.find({ patientId: targetPatientId });
    const alerts = await Alert.find({ patientId: targetPatientId, status: 'active' });

    res.json({
      success: true,
      patient: {
        name: patientUser ? patientUser.name : 'Asha Devi',
        age: profile ? profile.age : 74,
        language: patientUser ? patientUser.language : 'en',
        region: patientUser ? patientUser.region : 'Assam_NER',
        firebaseUid: targetPatientId,
      },
      analytics,
      reminders,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
