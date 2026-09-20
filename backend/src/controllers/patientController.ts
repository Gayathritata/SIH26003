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

export const getAvailableCaregivers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const caregivers = await User.find({ role: 'caregiver' }).select('-passwordHash');
    res.json({ success: true, count: caregivers.length, caregivers });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const selectCaregiver = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.user?.mongoId || req.user?.id || req.user?.firebaseUid;
    const { caregiverId } = req.body;

    if (!patientId || !caregiverId) {
      res.status(400).json({ success: false, error: 'Caregiver ID is required.' });
      return;
    }

    let caregiverUser = await User.findById(caregiverId).catch(() => null);
    if (!caregiverUser) {
      caregiverUser = await User.findOne({ firebaseUid: caregiverId });
    }

    if (!caregiverUser) {
      res.status(404).json({ success: false, error: 'Selected caregiver not found.' });
      return;
    }

    const targetCaregiverUid = caregiverUser.firebaseUid || caregiverUser._id.toString();
    const targetPatientUid = patientId.toString();

    await CaregiverPatient.findOneAndUpdate(
      { patientId: targetPatientUid },
      { caregiverId: targetCaregiverUid, relationship: 'Assigned Caregiver' },
      { upsert: true, new: true }
    );

    await PatientProfile.findOneAndUpdate(
      { $or: [{ userId: patientId }, { firebaseUid: targetPatientUid }] },
      { selectedCaregiverId: targetCaregiverUid }
    );

    res.json({ success: true, message: 'Caregiver selected successfully.', caregiver: caregiverUser });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getPatientMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.mongoId || req.user?.id || req.user?.firebaseUid;
    let user: any = await User.findById(userId).select('-passwordHash').catch(() => null);
    if (!user) {
      user = await User.findOne({ firebaseUid: userId }).select('-passwordHash');
    }

    if (!user) {
      res.status(404).json({ success: false, error: 'Patient account not found' });
      return;
    }

    let profile = await PatientProfile.findOne({
      $or: [{ userId: user._id }, { firebaseUid: user.firebaseUid || user._id.toString() }],
    });

    if (!profile) {
      profile = await PatientProfile.create({
        userId: user._id,
        firebaseUid: user.firebaseUid || user._id.toString(),
        age: 74,
        preferredLanguage: user.preferredLanguage || 'en',
        gameLevels: {
          memory_match: 1,
          pattern_recognition: 1,
          daily_routine_recall: 1,
          object_recognition: 1,
        },
      });
    }

    let caregiver = null;
    const link = await CaregiverPatient.findOne({
      $or: [{ patientId: user.firebaseUid }, { patientId: user._id.toString() }],
    });
    if (link) {
      caregiver = await User.findOne({
        $or: [{ firebaseUid: link.caregiverId }, { _id: link.caregiverId }],
      }).select('-passwordHash');
    }

    res.json({
      success: true,
      user,
      profile,
      caregiver,
      gameLevels: profile.gameLevels || {
        memory_match: 1,
        pattern_recognition: 1,
        daily_routine_recall: 1,
        object_recognition: 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getMotivationalQuote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const quotes = [
      "Keep going! Every activity you complete is a step toward maintaining your daily routine.",
      "Great work today. Keep your mind engaged with small activities each day.",
      "You are making progress. Keep going at your own pace.",
      "Every small practice keeps your memory sharp and mind bright.",
      "Honoring your daily journey preserves your health and happiness."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json({ success: true, quote: randomQuote });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
