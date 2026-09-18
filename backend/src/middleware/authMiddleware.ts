import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CaregiverPatient from '../models/CaregiverPatient';

export interface AuthenticatedUserPayload {
  id: string;
  mongoId: string;
  email: string;
  name: string;
  role: 'elderly_user' | 'elderly' | 'caregiver' | 'admin';
  firebaseUid?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

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

/**
 * JWT Authentication Middleware
 * Checks for token in HTTP-only cookie 'token' or Authorization 'Bearer <token>' header.
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined = undefined;

  // Check HTTP-only cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Fallback to Bearer token header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Access token is required.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthenticatedUserPayload;
    req.user = {
      id: decoded.id || decoded.mongoId,
      mongoId: decoded.mongoId || decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      firebaseUid: decoded.firebaseUid,
    };
    next();
  } catch (error) {
    console.error('[AUTH ERROR] JWT verification failed:', (error as Error).message);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
};

/**
 * Backwards compatible alias for verifyFirebaseToken
 */
export const verifyFirebaseToken = authenticateToken;

/**
 * Require specific user role(s)
 */
export const requireRole = (...allowedRoles: Array<string | string[]>) => {
  const rolesArray = allowedRoles.flat();
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User context not authenticated.' });
      return;
    }

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
        error: `Access forbidden. Role '${userRole}' is not authorized for this resource.`,
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

  const patientIdParam = req.params.patientId || req.params.id || (req.query.patientId as string);

  if (req.user.role === 'caregiver') {
    if (!patientIdParam) {
      return next();
    }

    const caregiverId = req.user.mongoId || req.user.firebaseUid || req.user.id;

    const assignment = await CaregiverPatient.findOne({
      $or: [
        { caregiverId: caregiverId, patientId: patientIdParam },
        { caregiverId: req.user.firebaseUid, patientId: patientIdParam },
      ],
    });

    if (!assignment && caregiverId !== patientIdParam && req.user.firebaseUid !== patientIdParam) {
      res.status(403).json({
        success: false,
        error: `Access forbidden. Patient '${patientIdParam}' is not assigned to caregiver '${caregiverId}'.`,
      });
      return;
    }
  }

  if (req.user.role === 'elderly_user' || req.user.role === 'elderly') {
    const elderlyId = req.user.mongoId || req.user.firebaseUid || req.user.id;
    if (patientIdParam && patientIdParam !== elderlyId && patientIdParam !== req.user.firebaseUid) {
      res.status(403).json({
        success: false,
        error: `Access forbidden. Elderly users can only access their own patient profile.`,
      });
      return;
    }
  }

  next();
};
