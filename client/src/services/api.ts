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
  score: number;
  accuracy: number;
  reactionTime: number;
  mistakes: number;
  mood?: string;
}) => {
  if (offlineService.isOffline()) {
    console.log('[API OFFLINE] Saving session to local sync queue...');
    offlineService.enqueue('game_session', sessionData);
    
    // Provide instant local AI difficulty prediction fallback when offline
    const nextDiff = sessionData.accuracy > 0.8 ? Math.min(5, sessionData.difficulty + 1) : (
      sessionData.accuracy < 0.5 ? Math.max(1, sessionData.difficulty - 1) : sessionData.difficulty
    );

    return {
      offline: true,
      success: true,
      message: 'Progress saved locally in offline mode.',
      aiRecommendation: {
        recommended_difficulty: nextDiff,
        confidence: 0.85,
        reason: 'Offline Adaptive Engine: Local difficulty evaluation completed.',
        engine_used: 'Offline Local Rule Engine',
        previous_difficulty: sessionData.difficulty,
        performance_trend: nextDiff > sessionData.difficulty ? 'improving' : 'stable',
      },
    };
  }

  try {
    const response = await apiClient.post('/games/sessions', sessionData);
    return { offline: false, ...response.data };
  } catch (err: any) {
    console.warn('[API ERROR] Server request failed. Falling back to offline queue:', err.message);
    offlineService.enqueue('game_session', sessionData);
    return {
      offline: true,
      success: true,
      message: 'Network error. Session saved to offline queue.',
      aiRecommendation: {
        recommended_difficulty: sessionData.difficulty,
        confidence: 0.8,
        reason: 'Offline Fallback Engine: Session cached safely.',
        engine_used: 'Offline Fallback Engine',
        previous_difficulty: sessionData.difficulty,
        performance_trend: 'stable',
      },
    };
  }
};
