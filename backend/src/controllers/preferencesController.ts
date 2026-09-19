import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';

/**
 * GET /api/profile/preferences
 * Retrieve authenticated user's language and accessibility preferences
 */
export const getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthenticated user context.' });
      return;
    }

    const userId = req.user.mongoId || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User record not found.' });
      return;
    }

    const profile = await PatientProfile.findOne({
      $or: [{ userId: user._id }, { firebaseUid: user.firebaseUid }],
    });

    const preferredLanguage = user.preferredLanguage || profile?.preferredLanguage || 'en';
    const accessibility = profile?.accessibilityPreferences || {
      fontSize: 'large',
      highContrast: true,
      voiceEnabled: true,
    };

    res.json({
      success: true,
      preferences: {
        preferredLanguage,
        textSize: accessibility.fontSize === 'extra_large' ? 'xlarge' : (accessibility.fontSize === 'large' ? 'large' : 'normal'),
        highContrast: accessibility.highContrast !== false,
        voiceEnabled: accessibility.voiceEnabled !== false,
      },
    });
  } catch (error) {
    console.error('[GET PREFERENCES ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * PUT /api/profile/preferences
 * Update authenticated user's preferred language & accessibility settings
 */
export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthenticated user context.' });
      return;
    }

    const userId = req.user.mongoId || req.user.id;
    const { preferredLanguage, textSize, highContrast, voiceEnabled } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User record not found.' });
      return;
    }

    if (preferredLanguage) {
      user.preferredLanguage = preferredLanguage;
      user.language = preferredLanguage;
      await user.save();
    }

    let profile = await PatientProfile.findOne({
      $or: [{ userId: user._id }, { firebaseUid: user.firebaseUid }],
    });

    const mappedFontSize = textSize === 'xlarge' ? 'extra_large' : (textSize === 'large' ? 'large' : 'standard');

    if (!profile) {
      profile = await PatientProfile.create({
        userId: user._id,
        firebaseUid: user.firebaseUid || user._id.toString(),
        preferredLanguage: preferredLanguage || user.preferredLanguage || 'en',
        accessibilityPreferences: {
          fontSize: mappedFontSize,
          highContrast: highContrast !== undefined ? highContrast : true,
          voiceEnabled: voiceEnabled !== undefined ? voiceEnabled : true,
        },
      });
    } else {
      if (preferredLanguage) {
        profile.preferredLanguage = preferredLanguage;
      }
      profile.accessibilityPreferences = {
        fontSize: mappedFontSize,
        highContrast: highContrast !== undefined ? highContrast : profile.accessibilityPreferences?.highContrast ?? true,
        voiceEnabled: voiceEnabled !== undefined ? voiceEnabled : profile.accessibilityPreferences?.voiceEnabled ?? true,
      };
      await profile.save();
    }

    res.json({
      success: true,
      message: 'User preferences updated successfully.',
      preferences: {
        preferredLanguage: user.preferredLanguage,
        textSize: profile.accessibilityPreferences?.fontSize === 'extra_large' ? 'xlarge' : (profile.accessibilityPreferences?.fontSize === 'large' ? 'large' : 'normal'),
        highContrast: profile.accessibilityPreferences?.highContrast,
        voiceEnabled: profile.accessibilityPreferences?.voiceEnabled,
      },
    });
  } catch (error) {
    console.error('[UPDATE PREFERENCES ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
