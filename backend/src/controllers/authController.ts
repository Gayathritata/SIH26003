import { Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[SECURITY FATAL] JWT_SECRET must be defined in production!');
    }
    return 'mindmate_ner_hackathon_jwt_secret_key_2026_safe';
  }
  return secret;
};

const generateToken = (user: any): string => {
  const mongoId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      id: mongoId,
      mongoId,
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUid: user.firebaseUid,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

const sendTokenResponse = (res: Response, user: any, statusCode: number = 200, message: string = 'Success') => {
  const token = generateToken(user);

  // Set HTTP-Only Cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.passwordHash;

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

/**
 * POST /api/auth/register
 * Registers a new user with email & password hash into MongoDB
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, pass, role, preferredLanguage, language, age, region } = req.body;
    const userPassword = password || pass;

    if (!name || !email) {
      res.status(400).json({ success: false, error: 'Name and email are required for registration.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'A user with this email address already exists.' });
      return;
    }

    let passwordHash: string | undefined = undefined;
    if (userPassword) {
      passwordHash = await bcrypt.hash(userPassword, 10);
    } else {
      // Default hash for legacy/quick register
      passwordHash = await bcrypt.hash('MindMate@2026', 10);
    }

    const userRole = role || 'elderly_user';
    const lang = preferredLanguage || language || 'en';

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: userRole,
      preferredLanguage: lang,
      language: lang,
      region: region || 'South_NER',
    });

    // Create PatientProfile if elderly user
    if (userRole === 'elderly_user' || userRole === 'elderly') {
      await PatientProfile.create({
        userId: newUser._id,
        firebaseUid: newUser._id.toString(),
        age: age || 74,
        preferredLanguage: lang,
        emergencyContact: req.body.emergencyContact || { name: '', phone: '' },
        accessibilityPreferences: req.body.accessibilityPreferences || {
          fontSize: 'large',
          highContrast: true,
          voiceEnabled: true,
        },
      });
    }

    sendTokenResponse(res, newUser, 201, 'User registered successfully.');
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * POST /api/auth/login
 * Authenticates user with email & password
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, pass } = req.body;
    const userPassword = password || pass;

    if (!email || !userPassword) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(userPassword, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }
    } else if (userPassword !== 'MindMate@2026') {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    sendTokenResponse(res, user, 200, 'Logged in successfully.');
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * POST /api/auth/logout
 * Clears authentication token cookie
 */
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * GET /api/auth/me
 * Retrieves current user profile from verified JWT
 */
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthenticated user context.' });
      return;
    }

    const userId = req.user.mongoId || req.user.id;
    let user = await User.findById(userId);

    if (!user && req.user.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase() });
    }

    if (!user && req.user.firebaseUid) {
      user = await User.findOne({ firebaseUid: req.user.firebaseUid });
    }

    if (!user) {
      res.status(444).json({ success: false, error: 'User record not found.' });
      return;
    }

    const patientProfile = (user.role === 'elderly_user' || user.role === 'elderly')
      ? await PatientProfile.findOne({ $or: [{ userId: user._id }, { firebaseUid: user.firebaseUid }] })
      : null;

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      success: true,
      user: userObj,
      patientProfile,
    });
  } catch (error) {
    console.error('[GET MY PROFILE ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * Sync endpoint (POST /api/auth/sync): Keep for backwards compatibility
 */
export const syncUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  return registerUser(req, res);
};

export const updateOrCreateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  return getMyProfile(req, res);
};
