import { Request, Response, NextFunction } from 'express';
import { admin, isFirebaseInitialized } from '../config/firebase';
import User from '../models/User';
import CaregiverPatient from '../models/CaregiverPatient';

export interface AuthenticatedRequest extends Request {
  user?: {
    firebaseUid: string;
    email: string;
    name: string;
    role: 'elderly_user' | 'elderly' | 'caregiver' | 'admin';
    mongoId?: string;
  };
}

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized. Authorization header with Bearer token is required.' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    let firebaseUid = '';
    let email = '';
    let name = '';

    if (isFirebaseInitialized) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email || '';
      name = decodedToken.name || 'User';
    } else {
      // Token Verification Mode for Hackathon
      firebaseUid = token.replace('demo_token_', '');
      email = `${firebaseUid}@mindmate-ner.org`;
      name = firebaseUid.includes('caregiver') ? 'Demo Caregiver' : (firebaseUid.includes('admin') ? 'Admin User' : 'Asha Devi');
    }

    // Lookup user in MongoDB to attach role & metadata securely
    let dbUser = await User.findOne({ firebaseUid });
    if (!dbUser) {
      const defaultRole = firebaseUid.includes('caregiver') ? 'caregiver' : (firebaseUid.includes('admin') ? 'admin' : 'elderly_user');
      dbUser = await User.create({
        firebaseUid,
        email: email || `${firebaseUid}@mindmate-ner.org`,
        name: name || 'User',
        role: defaultRole,
        preferredLanguage: 'en',
        region: 'South_NER',
      });
    }

    req.user = {
      firebaseUid: dbUser.firebaseUid,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as any,
      mongoId: (dbUser._id as any).toString(),
    };

    next();
  } catch (error) {
    console.error('[AUTH ERROR] Token verification failed:', error);
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
};

export const requireRole = (...allowedRoles: Array<string | string[]>) => {
  const rolesArray = allowedRoles.flat();
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User context not authenticated.' });
      return;
    }

    // Map elderly_user and elderly as equivalent roles
    const userRole = req.user.role;
    const isAuthorized = rolesArray.some((role) => {
      if (role === 'elderly_user' || role === 'elderly') {
        return userRole === 'elderly_user' || userRole === 'elderly';
      }
      return role === userRole;
    });

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        error: `Access forbidden. Role '${req.user.role}' is not authorized for this resource.`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware ensuring a caregiver can only access patients assigned to them in CaregiverPatient
 */
export const requireCaregiverPatientAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthenticated user context.' });
    return;
  }

  // Admin has universal oversight access
  if (req.user.role === 'admin') {
    return next();
  }

  const patientIdParam = req.params.patientId || req.params.id || req.query.patientId;

  if (req.user.role === 'caregiver') {
    if (!patientIdParam) {
      return next();
    }

    const assignment = await CaregiverPatient.findOne({
      caregiverId: req.user.firebaseUid,
      patientId: patientIdParam,
    });

    if (!assignment && req.user.firebaseUid !== patientIdParam) {
      res.status(403).json({
        success: false,
        error: `Access forbidden. Patient '${patientIdParam}' is not assigned to caregiver '${req.user.firebaseUid}'.`,
      });
      return;
    }
  }

  if (req.user.role === 'elderly_user' || req.user.role === 'elderly') {
    if (patientIdParam && req.user.firebaseUid !== patientIdParam) {
      res.status(403).json({
        success: false,
        error: `Access forbidden. Elderly users can only access their own patient profile.`,
      });
      return;
    }
  }

  next();
};
