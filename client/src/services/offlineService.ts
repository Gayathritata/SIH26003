import { apiClient } from './api';

export interface OfflineGameSessionRecord {
  clientSessionId: string;
  userId?: string;
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
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  difficultySource?: 'xgboost' | 'local_fallback' | 'last_known_recommendation';
}

const DB_NAME = 'mindmate_offline_db';
const DB_VERSION = 1;
const STORE_SESSIONS = 'game_sessions';
const STORE_REMINDERS = 'reminders_cache';
const OFFLINE_SIM_KEY = 'mindmate_simulated_offline';

class OfflineService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSimulatedOffline: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(OFFLINE_SIM_KEY);
      this.isSimulatedOffline = stored === 'true';
    }
  }

  public isOffline(): boolean {
    if (this.isSimulatedOffline) return true;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
    return false;
  }

  public setSimulatedOffline(offline: boolean): void {
    this.isSimulatedOffline = offline;
    if (typeof window !== 'undefined') {
      localStorage.setItem(OFFLINE_SIM_KEY, String(offline));
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          const sessionStore = db.createObjectStore(STORE_SESSIONS, { keyPath: 'clientSessionId' });
          sessionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_REMINDERS)) {
          db.createObjectStore(STORE_REMINDERS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  public generateClientSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `cs_${timestamp}_${random}`;
  }

  public async saveOfflineGameSession(session: Omit<OfflineGameSessionRecord, 'clientSessionId' | 'createdAt' | 'syncStatus'> & { clientSessionId?: string }): Promise<OfflineGameSessionRecord> {
    const clientSessionId = session.clientSessionId || this.generateClientSessionId();
    const record: OfflineGameSessionRecord = {
      ...session,
      clientSessionId,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_SESSIONS, 'readwrite');
        const store = tx.objectStore(STORE_SESSIONS);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[INDEXEDDB SAVE FALLBACK TO LOCALSTORAGE]', err);
      // Fallback to localStorage if IndexedDB fails
      const fallbackQueue = this.getLocalStorageQueue();
      fallbackQueue.push(record);
      localStorage.setItem('mindmate_fallback_queue', JSON.stringify(fallbackQueue));
    }

    return record;
  }

  private getLocalStorageQueue(): OfflineGameSessionRecord[] {
    try {
      const raw = localStorage.getItem('mindmate_fallback_queue');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  public async getPendingGameSessions(): Promise<OfflineGameSessionRecord[]> {
    try {
      const db = await this.getDB();
      const records = await new Promise<OfflineGameSessionRecord[]>((resolve, reject) => {
        const tx = db.transaction(STORE_SESSIONS, 'readonly');
        const store = tx.objectStore(STORE_SESSIONS);
        const index = store.index('syncStatus');
        const req = index.getAll('pending');
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      const fallbackRecords = this.getLocalStorageQueue().filter(r => r.syncStatus === 'pending');
      return [...records, ...fallbackRecords];
    } catch (err) {
      return this.getLocalStorageQueue().filter(r => r.syncStatus === 'pending');
    }
  }

  public async getPendingCount(): Promise<number> {
    const pending = await this.getPendingGameSessions();
    return pending.length;
  }

  public async syncPendingSessions(): Promise<{ success: boolean; synced: number; duplicates: number; failed: number }> {
    if (this.isOffline()) {
      return { success: false, synced: 0, duplicates: 0, failed: 0 };
    }

    const pending = await this.getPendingGameSessions();
    if (pending.length === 0) {
      return { success: true, synced: 0, duplicates: 0, failed: 0 };
    }

    try {
      const response = await apiClient.post('/api/sync/game-sessions', { sessions: pending });
      const data = response.data;

      if (data && data.success) {
        // Mark records as synced in IndexedDB
        const db = await this.getDB();
        const tx = db.transaction(STORE_SESSIONS, 'readwrite');
        const store = tx.objectStore(STORE_SESSIONS);

        for (const item of pending) {
          store.delete(item.clientSessionId);
        }

        // Clear fallback localStorage queue
        localStorage.removeItem('mindmate_fallback_queue');

        return {
          success: true,
          synced: data.synced || pending.length,
          duplicates: data.duplicates || 0,
          failed: data.failed || 0,
        };
      } else {
        return { success: false, synced: 0, duplicates: 0, failed: pending.length };
      }
    } catch (err: any) {
      // Secondary endpoint fallback to /sync
      try {
        const fbResponse = await apiClient.post('/sync', { items: pending.map(p => ({ entityType: 'game_session', payload: p, localId: p.clientSessionId })) });
        if (fbResponse.data && fbResponse.data.success) {
          const db = await this.getDB();
          const tx = db.transaction(STORE_SESSIONS, 'readwrite');
          const store = tx.objectStore(STORE_SESSIONS);

          for (const item of pending) {
            store.delete(item.clientSessionId);
          }
          localStorage.removeItem('mindmate_fallback_queue');

          return {
            success: true,
            synced: fbResponse.data.syncedCount || pending.length,
            duplicates: 0,
            failed: 0,
          };
        }
      } catch (fbErr) {}

      return { success: false, synced: 0, duplicates: 0, failed: pending.length };
    }
  }

  // Reminders local cache helper
  public cacheReminders(reminders: any[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('mindmate_cached_reminders', JSON.stringify(reminders));
    } catch (e) {}
  }

  public getCachedReminders(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('mindmate_cached_reminders');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}

export const offlineService = new OfflineService();
