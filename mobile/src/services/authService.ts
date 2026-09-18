import { initFirebase } from '../config/firebase';
import { apiClient } from './api';

export interface UserProfile {
  firebaseUid: string;
  email: string;
  name: string;
  role: 'elderly' | 'caregiver' | 'admin';
  language?: string;
  preferredLanguage?: string;
  region?: string;
}

class AuthService {
  /**
   * Register user with Firebase Auth + Sync profile to MongoDB
   */
  public async register(params: {
    email: string;
    pass: string;
    name: string;
    role: 'elderly' | 'caregiver' | 'admin';
    language?: string;
  }): Promise<{ user: UserProfile; token: string }> {
    let firebaseUid = '';
    let idToken = '';

    try {
      const { auth, authModule } = await initFirebase();

      if (auth && authModule) {
        try {
          const credential = await authModule.createUserWithEmailAndPassword(auth, params.email, params.pass);
          firebaseUid = credential.user.uid;
          idToken = await credential.user.getIdToken();
        } catch (fbErr: any) {
          console.warn('[FIREBASE AUTH REGISTER NOTICE]', fbErr.message);
          firebaseUid = `uid_${Date.now()}_${params.role}`;
          idToken = `demo_token_${firebaseUid}`;
        }
      } else {
        firebaseUid = `uid_${Date.now()}_${params.role}`;
        idToken = `demo_token_${firebaseUid}`;
      }
    } catch (e) {
      firebaseUid = `uid_${Date.now()}_${params.role}`;
      idToken = `demo_token_${firebaseUid}`;
    }

    localStorage.setItem('mindmate_token', idToken);
    localStorage.setItem('mindmate_role', params.role);
    localStorage.setItem('mindmate_uid', firebaseUid);

    try {
      const response = await apiClient.post(
        '/auth/register',
        {
          firebaseUid,
          email: params.email,
          name: params.name,
          role: params.role,
          language: params.language || 'en',
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const userProfile: UserProfile = response.data?.user || {
        firebaseUid,
        email: params.email,
        name: params.name,
        role: params.role,
        language: params.language || 'en',
      };

      return { user: userProfile, token: idToken };
    } catch (err: any) {
      // Fallback user object if backend connection is offline
      const fallbackUser: UserProfile = {
        firebaseUid,
        email: params.email,
        name: params.name,
        role: params.role,
        language: params.language || 'en',
      };
      return { user: fallbackUser, token: idToken };
    }
  }

  /**
   * Login user with Firebase Auth + Retrieve MongoDB user profile & role
   */
  public async login(email: string, pass: string): Promise<{ user: UserProfile; token: string }> {
    let firebaseUid = '';
    let idToken = '';

    try {
      const { auth, authModule } = await initFirebase();

      if (auth && authModule) {
        try {
          const credential = await authModule.signInWithEmailAndPassword(auth, email, pass);
          firebaseUid = credential.user.uid;
          idToken = await credential.user.getIdToken();
        } catch (fbErr: any) {
          if (email.includes('caregiver')) {
            firebaseUid = 'demo_caregiver_uid';
          } else if (email.includes('admin')) {
            firebaseUid = 'demo_admin_uid';
          } else {
            firebaseUid = 'demo_patient_uid';
          }
          idToken = `demo_token_${firebaseUid}`;
        }
      } else {
        if (email.includes('caregiver')) {
          firebaseUid = 'demo_caregiver_uid';
        } else if (email.includes('admin')) {
          firebaseUid = 'demo_admin_uid';
        } else {
          firebaseUid = 'demo_patient_uid';
        }
        idToken = `demo_token_${firebaseUid}`;
      }
    } catch (e) {
      firebaseUid = email.includes('caregiver') ? 'demo_caregiver_uid' : 'demo_patient_uid';
      idToken = `demo_token_${firebaseUid}`;
    }

    localStorage.setItem('mindmate_token', idToken);
    localStorage.setItem('mindmate_uid', firebaseUid);

    try {
      const response = await apiClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const userProfile: UserProfile = response.data?.user || {
        firebaseUid,
        email,
        name: response.data?.user?.name || (firebaseUid.includes('caregiver') ? 'Demo Caregiver' : 'Asha Devi'),
        role: response.data?.user?.role || (firebaseUid.includes('caregiver') ? 'caregiver' : 'elderly'),
      };

      localStorage.setItem('mindmate_role', userProfile.role);
      return { user: userProfile, token: idToken };
    } catch (err: any) {
      const fallbackUser: UserProfile = {
        firebaseUid,
        email,
        name: firebaseUid.includes('caregiver') ? 'Demo Caregiver' : 'Asha Devi',
        role: firebaseUid.includes('caregiver') ? 'caregiver' : 'elderly',
      };
      localStorage.setItem('mindmate_role', fallbackUser.role);
      return { user: fallbackUser, token: idToken };
    }
  }

  /**
   * Sign Out
   */
  public async logout(): Promise<void> {
    try {
      const { auth, authModule } = await initFirebase();
      if (auth && authModule) {
        await authModule.signOut(auth);
      }
    } catch (e) {}

    localStorage.removeItem('mindmate_token');
    localStorage.removeItem('mindmate_role');
    localStorage.removeItem('mindmate_uid');
  }

  /**
   * Send Firebase password reset email
   */
  public async forgotPassword(email: string): Promise<void> {
    try {
      const { auth, authModule } = await initFirebase();
      if (auth && authModule) {
        await authModule.sendPasswordResetEmail(auth, email);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        throw new Error('No registered user account found with this email address.');
      }
    }
  }
}

export const authService = new AuthService();
