import { apiClient } from './api';

export interface UserProfile {
  _id?: string;
  id?: string;
  firebaseUid?: string;
  email: string;
  name: string;
  role: 'elderly_user' | 'elderly' | 'caregiver' | 'admin';
  language?: string;
  preferredLanguage?: string;
  region?: string;
}

export interface PatientProfile {
  _id?: string;
  userId?: string;
  age?: number;
  preferredLanguage?: string;
  emergencyContact?: { name: string; phone: string };
  accessibilityPreferences?: {
    fontSize: string;
    highContrast: boolean;
    voiceEnabled: boolean;
  };
}

class AuthService {
  /**
   * Register user with JWT API
   */
  public async register(params: {
    email: string;
    pass: string;
    name: string;
    role: 'elderly_user' | 'elderly' | 'caregiver' | 'admin';
    language?: string;
    age?: number;
  }): Promise<{ user: UserProfile; token: string }> {
    try {
      const response = await apiClient.post('/api/auth/register', {
        email: params.email,
        password: params.pass,
        name: params.name,
        role: params.role,
        preferredLanguage: params.language || 'en',
        age: params.age || 74,
      });

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('mindmate_token', token);
      }
      if (user && user.role) {
        localStorage.setItem('mindmate_role', user.role);
      }

      return { user, token };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed.';
      throw new Error(errorMsg);
    }
  }

  /**
   * Login user with JWT API
   */
  public async login(email: string, pass: string): Promise<{ user: UserProfile; token: string }> {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password: pass,
      });

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('mindmate_token', token);
      }
      if (user && user.role) {
        localStorage.setItem('mindmate_role', user.role);
      }

      return { user, token };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed.';
      throw new Error(errorMsg);
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  public async getMe(): Promise<{ user: UserProfile; patientProfile?: PatientProfile | null }> {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to fetch user profile.');
    }
  }

  /**
   * Sign Out
   */
  public async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors during logout
    }

    localStorage.removeItem('mindmate_token');
    localStorage.removeItem('mindmate_role');
    localStorage.removeItem('mindmate_uid');
  }

  /**
   * Mock / Local password reset request
   */
  public async forgotPassword(email: string): Promise<void> {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    // Simple confirmation message for user password reset
    return Promise.resolve();
  }
}

export const authService = new AuthService();
