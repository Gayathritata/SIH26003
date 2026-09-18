import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import CaregiverPatient from '../models/CaregiverPatient';
import GameSession from '../models/GameSession';
import { calculatePatientAnalytics } from '../services/analyticsService';

export const getPatients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const firebaseUid = req.user?.firebaseUid;

    if (userRole === 'caregiver') {
      // Find assigned patients
      const mappings = await CaregiverPatient.find({ caregiverId: firebaseUid });
      const patientIds = mappings.map((m) => m.patientId);

      const patients = await User.find({ firebaseUid: { $in: patientIds } });
      const profiles = await PatientProfile.find({ firebaseUid: { $in: patientIds } });

      const combined = patients.map((p) => {
        const prof = profiles.find((pr) => pr.firebaseUid === p.firebaseUid);
        return {
          user: p,
          profile: prof,
        };
      });

      res.json({ success: true, count: combined.length, patients: combined });
    } else if (userRole === 'admin') {
      const patients = await User.find({ role: 'elderly' });
      res.json({ success: true, count: patients.length, patients });
    } else {
      // Elderly user returns themselves
      const user = await User.findOne({ firebaseUid });
      const profile = await PatientProfile.findOne({ firebaseUid });
      res.json({ success: true, patients: [{ user, profile }] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getPatientById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requesterRole = req.user?.role;
    const requesterUid = req.user?.firebaseUid;

    // Authorization check
    if (requesterRole === 'caregiver') {
      const link = await CaregiverPatient.findOne({ caregiverId: requesterUid, patientId: id });
      if (!link && requesterUid !== id) {
        res.status(403).json({ success: false, error: 'Forbidden. You are not assigned to this patient.' });
        return;
      }
    } else if ((requesterRole === 'elderly_user' || requesterRole === 'elderly') && requesterUid !== id) {
      res.status(403).json({ success: false, error: 'Forbidden. Elderly users can only view their own profile.' });
      return;
    }

    const patientUser = await User.findOne({ firebaseUid: id });
    const profile = await PatientProfile.findOne({ firebaseUid: id });

    if (!patientUser) {
      res.status(404).json({ success: false, error: 'Patient not found' });
      return;
    }

    res.json({ success: true, patient: patientUser, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getPatientAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const analytics = await calculatePatientAnalytics(id);
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getPatientSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sessions = await GameSession.find({ patientId: id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
