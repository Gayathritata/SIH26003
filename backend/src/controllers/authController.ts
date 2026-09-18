import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import CaregiverPatient from '../models/CaregiverPatient';

/**
 * Sync endpoint (POST /api/auth/sync):
 * Synchronizes a Firebase-authenticated user with MongoDB after Firebase Auth sign-up / sign-in.
 */
export const syncUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.firebaseUid || req.body.firebaseUid;
    const email = req.user?.email || req.body.email;
    const name = req.body.name || req.user?.name || 'User';
    const role = req.body.role || req.user?.role || 'elderly_user';
    const preferredLanguage = req.body.preferredLanguage || req.body.language || 'en';
    const age = req.body.age;

    if (!firebaseUid) {
      res.status(400).json({ success: false, error: 'Firebase UID is required for sync.' });
      return;
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email: email || `${firebaseUid}@mindmate-ner.org`,
        name,
        role,
        preferredLanguage,
        region: req.body.region || 'South_NER',
      });
    } else {
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (preferredLanguage) user.preferredLanguage = preferredLanguage;
      await user.save();
    }

    // Create Patient Profile if user role is elderly_user or elderly
    let patientProfile = null;
    if (user.role === 'elderly_user' || user.role === 'elderly') {
      patientProfile = await PatientProfile.findOne({ firebaseUid });
      if (!patientProfile) {
        patientProfile = await PatientProfile.create({
          userId: user._id,
          firebaseUid,
          age: age || 74,
          preferredLanguage: user.preferredLanguage || 'en',
          emergencyContact: req.body.emergencyContact || { name: '', phone: '' },
          accessibilityPreferences: req.body.accessibilityPreferences || {
            fontSize: 'large',
            highContrast: true,
            voiceEnabled: true,
          },
        });
      } else if (age) {
        patientProfile.age = age;
        await patientProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'User synchronized with MongoDB successfully.',
      user,
      patientProfile,
    });
  } catch (error) {
    console.error('[SYNC CONTROLLER ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * Register endpoint (backwards compatible alias for sync)
 */
export const registerUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  return syncUser(req, res);
};

export const updateOrCreateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  return syncUser(req, res);
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's MongoDB profile.
 */
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.firebaseUid;
    if (!firebaseUid) {
      res.status(401).json({ success: false, error: 'Unauthenticated user context.' });
      return;
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Auto-create user record if newly authenticated via Firebase Auth
      const defaultRole = firebaseUid.includes('caregiver') ? 'caregiver' : (firebaseUid.includes('admin') ? 'admin' : 'elderly_user');
      const defaultName = defaultRole === 'caregiver' ? 'Demo Caregiver' : (defaultRole === 'admin' ? 'Admin User' : 'Asha Devi');

      user = await User.create({
        firebaseUid,
        email: req.user?.email || `${firebaseUid}@mindmate-ner.org`,
        name: req.user?.name || defaultName,
        role: defaultRole,
        preferredLanguage: 'en',
        region: 'South_NER',
      });
    }

    const patientProfile = (user.role === 'elderly_user' || user.role === 'elderly') ? await PatientProfile.findOne({ firebaseUid }) : null;
    res.json({ success: true, user, patientProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

