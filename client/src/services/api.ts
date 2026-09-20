import axios from 'axios';
import { offlineService } from './offlineService';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultBackendUrl = isLocalhost ? 'http://localhost:5000' : 'https://mindmate-backend-dopt.onrender.com';
const metaEnv = (import.meta as any).env || {};

const API_BASE_URL = metaEnv.VITE_API_URL || metaEnv.VITE_API_BASE_URL || defaultBackendUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic authorization header using stored JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindmate_token');
  if (token) {
    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API 401 UNAUTHORIZED] Clearing token context.');
    }
    return Promise.reject(error);
  }
);

// Preferences API
export const fetchUserPreferencesApi = async () => {
  try {
    const res = await apiClient.get('/api/profile/preferences');
    return res.data;
  } catch (err: any) {
    try {
      const fallbackRes = await apiClient.get('/api/auth/preferences');
      return fallbackRes.data;
    } catch (fErr: any) {
      console.warn('[FETCH PREFERENCES WARNING]', fErr.message);
      return { success: false };
    }
  }
};

export const updateUserPreferencesApi = async (preferences: {
  preferredLanguage?: string;
  textSize?: 'normal' | 'large' | 'xlarge';
  highContrast?: boolean;
  voiceEnabled?: boolean;
}) => {
  try {
    const res = await apiClient.put('/api/profile/preferences', preferences);
    return res.data;
  } catch (err: any) {
    try {
      const fallbackRes = await apiClient.put('/api/auth/preferences', preferences);
      return fallbackRes.data;
    } catch (fErr: any) {
      console.warn('[UPDATE PREFERENCES WARNING]', fErr.message);
      return { success: false };
    }
  }
};

export const submitGameSession = async (sessionData: {
  gameType: string;
  difficulty: number;
  totalPairs?: number;
  attempts?: number;
  correctMatches?: number;
  incorrectAttempts?: number;
  accuracy: number;
  completionTime?: number;
  completionRate?: number;
  score: number;
  startedAt?: string;
  completedAt?: string;
  reactionTime?: number;
  mistakes?: number;
  mood?: string;
}) => {
  if (offlineService.isOffline()) {
    console.log('[API OFFLINE] Saving session to IndexedDB offline queue...');
    const offlineRecord = await offlineService.saveOfflineGameSession({
      ...sessionData,
      difficultySource: 'local_fallback',
    });
    return {
      offline: true,
      success: true,
      clientSessionId: offlineRecord.clientSessionId,
      message: 'Result saved locally on device. Waiting for connection to sync.',
    };
  }

  try {
    const response = await apiClient.post('/game-sessions', sessionData);
    return { offline: false, ...response.data };
  } catch (err: any) {
    try {
      const fbResponse = await apiClient.post('/games/sessions', sessionData);
      return { offline: false, ...fbResponse.data };
    } catch (fbErr: any) {
      console.warn('[API ERROR] Server request failed. Falling back to offline queue:', fbErr.message);
      const offlineRecord = await offlineService.saveOfflineGameSession({
        ...sessionData,
        difficultySource: 'local_fallback',
      });
      return {
        offline: true,
        success: true,
        clientSessionId: offlineRecord.clientSessionId,
        message: 'Network error. Session saved to offline queue.',
      };
    }
  }
};

export const fetchMyGameSessions = async () => {
  try {
    const response = await apiClient.get('/game-sessions/my-sessions');
    return response.data;
  } catch (err: any) {
    try {
      const fbResponse = await apiClient.get('/games/my-sessions');
      return fbResponse.data;
    } catch (fbErr: any) {
      console.warn('[FETCH GAME SESSIONS ERROR]', fbErr.message);
      return { success: false, sessions: [] };
    }
  }
};

export const fetchAiDifficultyRecommendation = async (gameType: string = 'memory_match') => {
  if (offlineService.isOffline()) {
    return {
      success: true,
      recommendedDifficulty: 'easy',
      numericDifficulty: 1,
      difficultySource: 'local_fallback',
      message: 'AI Fallback Adjustment (Local): Level set based on your recent accuracy.',
    };
  }

  try {
    const response = await apiClient.post('/ai/recommend-difficulty', { gameType });
    return {
      difficultySource: response.data?.engine_used?.includes('XGBoost') ? 'xgboost' : 'local_fallback',
      ...response.data,
    };
  } catch (err: any) {
    try {
      const fbResponse = await apiClient.post('/game-sessions/recommend-difficulty', { gameType });
      return {
        difficultySource: 'local_fallback',
        ...fbResponse.data,
      };
    } catch (fbErr: any) {
      console.warn('[AI DIFFICULTY RECOMMENDATION ERROR]', fbErr.message);
      return {
        success: false,
        recommendedDifficulty: 'easy',
        numericDifficulty: 1,
        difficultySource: 'local_fallback',
        message: 'AI Fallback Adjustment (Local): Continuing at Level 1.',
      };
    }
  }
};

// ==================== REMINDERS API ====================

export interface ReminderData {
  _id?: string;
  id?: string;
  userId?: string;
  patientId?: string;
  caregiverId?: string;
  title: string;
  description?: string;
  type: 'medicine' | 'hydration' | 'activity' | 'appointment' | 'general';
  date: string;
  time: string;
  repeat: 'none' | 'daily' | 'weekly';
  isActive: boolean;
  completed: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchRemindersApi = async (patientId?: string) => {
  if (offlineService.isOffline()) {
    const cached = offlineService.getCachedReminders();
    return { success: true, reminders: cached, offline: true };
  }

  try {
    const url = patientId ? `/api/reminders?patientId=${patientId}` : '/api/reminders';
    const response = await apiClient.get(url);
    if (response.data && Array.isArray(response.data.reminders)) {
      offlineService.cacheReminders(response.data.reminders);
    }
    return response.data;
  } catch (err: any) {
    console.error('[FETCH REMINDERS ERROR]', err?.response?.data || err.message);
    const cached = offlineService.getCachedReminders();
    return { success: true, reminders: cached, offline: true, error: err?.response?.data?.error || err.message };
  }
};

export const fetchReminderByIdApi = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/reminders/${id}`);
    return response.data;
  } catch (err: any) {
    console.error('[FETCH REMINDER BY ID ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const createReminderApi = async (reminder: Partial<ReminderData>) => {
  try {
    const response = await apiClient.post('/api/reminders', reminder);
    return response.data;
  } catch (err: any) {
    console.error('[CREATE REMINDER ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const updateReminderApi = async (id: string, updates: Partial<ReminderData>) => {
  try {
    const response = await apiClient.put(`/api/reminders/${id}`, updates);
    return response.data;
  } catch (err: any) {
    console.error('[UPDATE REMINDER ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const deleteReminderApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/api/reminders/${id}`);
    return response.data;
  } catch (err: any) {
    console.error('[DELETE REMINDER ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const toggleReminderCompleteApi = async (id: string, completed?: boolean) => {
  try {
    const response = await apiClient.patch(`/api/reminders/${id}/complete`, { completed });
    return response.data;
  } catch (err: any) {
    console.error('[TOGGLE REMINDER COMPLETE ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const toggleReminderActiveApi = async (id: string, isActive?: boolean) => {
  try {
    const response = await apiClient.patch(`/api/reminders/${id}/toggle`, { isActive });
    return response.data;
  } catch (err: any) {
    console.error('[TOGGLE REMINDER ACTIVE ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const fetchAvailableCaregiversApi = async () => {
  try {
    const response = await apiClient.get('/api/patients/available-caregivers');
    return response.data;
  } catch (err: any) {
    console.error('[FETCH AVAILABLE CAREGIVERS ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const selectCaregiverApi = async (caregiverId: string) => {
  try {
    const response = await apiClient.post('/api/patients/select-caregiver', { caregiverId });
    return response.data;
  } catch (err: any) {
    console.error('[SELECT CAREGIVER ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const fetchPatientMyProfileApi = async () => {
  try {
    const response = await apiClient.get('/api/patients/my-profile');
    return response.data;
  } catch (err: any) {
    console.error('[FETCH MY PROFILE ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const fetchCaregiverPatientsListApi = async () => {
  try {
    const response = await apiClient.get('/api/caregiver/patients-list');
    return response.data;
  } catch (err: any) {
    console.error('[FETCH CAREGIVER PATIENTS LIST ERROR]', err?.response?.data || err.message);
    return { success: false, error: err?.response?.data?.error || err.message };
  }
};

export const fetchMotivationalQuoteApi = async () => {
  try {
    const response = await apiClient.get('/api/patients/motivational-quote');
    return response.data;
  } catch (err: any) {
    return { success: true, quote: "Keep going! Every activity you complete is a step toward maintaining your daily routine." };
  }
};
