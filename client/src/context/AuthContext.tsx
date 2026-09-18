import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, PatientProfile } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  patientProfile: PatientProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (params: {
    email: string;
    pass: string;
    name: string;
    role: 'elderly_user' | 'elderly' | 'caregiver' | 'admin';
    language?: string;
    age?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mindmate_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('mindmate_token');
    if (!savedToken) {
      setUser(null);
      setPatientProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authService.getMe();
      if (data.user) {
        setUser(data.user);
        setPatientProfile(data.patientProfile || null);
        setToken(savedToken);
      } else {
        setUser(null);
        setPatientProfile(null);
      }
    } catch (err) {
      console.warn('[AUTH CONTEXT] Failed to fetch current user session:', err);
      // Keep offline/demo state if user token was saved
      const savedRole = (localStorage.getItem('mindmate_role') || 'elderly_user') as any;
      setUser({
        email: 'user@mindmate-ner.org',
        name: savedRole === 'caregiver' ? 'Caregiver User' : 'Asha Devi',
        role: savedRole,
        preferredLanguage: 'en',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await authService.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      await refreshUser();
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
      await refreshUser();
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
