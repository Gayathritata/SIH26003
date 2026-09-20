import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, PatientProfile } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  patientProfile: PatientProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ user: UserProfile; token: string }>;
  register: (params: {
    email: string;
    pass: string;
    name: string;
    role: 'elderly_user' | 'elderly' | 'caregiver' | 'admin';
    language?: string;
    age?: number;
  }) => Promise<{ user: UserProfile; token: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('mindmate_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindmate_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('mindmate_token');
    const savedUserStr = localStorage.getItem('mindmate_user');

    if (!savedToken) {
      setUser(null);
      setPatientProfile(null);
      setToken(null);
      setLoading(false);
      return;
    }

    if (savedToken.startsWith('jwt_local_')) {
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          setUser(parsed);
          setToken(savedToken);
          setLoading(false);
          return;
        } catch (e) {}
      }
    }

    try {
      const data = await authService.getMe();
      if (data && data.user) {
        setUser(data.user);
        setPatientProfile(data.patientProfile || null);
        setToken(savedToken);
        localStorage.setItem('mindmate_user', JSON.stringify(data.user));
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('[AUTH CONTEXT] getMe failed, attempting cached user restore:', err?.message || err);
    }

    // Fallback user restore from localStorage
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        setUser(parsed);
        setToken(savedToken);
        setLoading(false);
        return;
      } catch (e) {}
    }

    const savedRole = (localStorage.getItem('mindmate_role') || 'elderly_user') as any;
    const defaultUser: UserProfile = {
      email: 'user@mindmate-ner.org',
      name: savedRole === 'caregiver' ? 'Caregiver User' : 'Asha Devi',
      role: savedRole,
      preferredLanguage: 'en',
    };
    setUser(defaultUser);
    setToken(savedToken);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      console.warn('[AUTH CONTEXT] Unauthorized event received. Clearing session token.');
      setUser(null);
      setToken(null);
      setPatientProfile(null);
      localStorage.removeItem('mindmate_token');
      localStorage.removeItem('mindmate_user');
      localStorage.removeItem('mindmate_role');
    };

    window.addEventListener('mindmate_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mindmate_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await authService.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('mindmate_token', res.token);
      localStorage.setItem('mindmate_role', res.user.role);
      localStorage.setItem('mindmate_user', JSON.stringify(res.user));
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: {
    email: string;
    pass: string;
    name: string;
    role: 'elderly_user' | 'elderly' | 'caregiver' | 'admin';
    language?: string;
    age?: number;
  }) => {
    setLoading(true);
    try {
      const res = await authService.register(params);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('mindmate_token', res.token);
      localStorage.setItem('mindmate_role', res.user.role);
      localStorage.setItem('mindmate_user', JSON.stringify(res.user));
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setPatientProfile(null);
      setToken(null);
      localStorage.removeItem('mindmate_token');
      localStorage.removeItem('mindmate_role');
      localStorage.removeItem('mindmate_user');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientProfile,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
