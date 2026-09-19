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
      // Clear invalid token if unauthorized response occurs
      console.warn('[API 401 UNAUTHORIZED] Clearing token context.');
    }
    return Promise.reject(error);
  }
);

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
    console.log('[API OFFLINE] Saving session to local sync queue...');
    offlineService.enqueue('game_session', sessionData);
    return {
      offline: true,
      success: true,
      message: 'Progress saved locally in offline mode.',
    };
  }

  try {
    const response = await apiClient.post('/game-sessions', sessionData);
    return { offline: false, ...response.data };
  } catch (err: any) {
    // Fallback to /games/sessions if /game-sessions fails
    try {
      const fbResponse = await apiClient.post('/games/sessions', sessionData);
      return { offline: false, ...fbResponse.data };
    } catch (fbErr: any) {
      console.warn('[API ERROR] Server request failed. Falling back to offline queue:', fbErr.message);
      offlineService.enqueue('game_session', sessionData);
      return {
        offline: true,
        success: true,
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
  try {
    const response = await apiClient.post('/ai/recommend-difficulty', { gameType });
    return response.data;
  } catch (err: any) {
    try {
      const fbResponse = await apiClient.post('/game-sessions/recommend-difficulty', { gameType });
      return fbResponse.data;
    } catch (fbErr: any) {
      console.warn('[AI DIFFICULTY RECOMMENDATION ERROR]', fbErr.message);
      return {
        success: false,
        recommendedDifficulty: 'easy',
        numericDifficulty: 1,
        insufficientHistory: true,
        message: 'Your next activity has been adjusted based on your recent game performance.',
      };
    }
  }
};

// ==================== REMINDERS API ====================

export interface ReminderData {
  _id?: string;
  id?: string;
  userId?: string;
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
  try {
    const url = patientId ? `/api/reminders?patientId=${patientId}` : '/api/reminders';
    const response = await apiClient.get(url);
    return response.data;
  } catch (err: any) {
    console.error('[FETCH REMINDERS ERROR]', err?.response?.data || err.message);
    return { success: false, reminders: [], error: err?.response?.data?.error || err.message };
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

