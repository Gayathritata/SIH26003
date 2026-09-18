/**
 * Offline Sync Queue Engine for MINDMATE NER
 * Manages local queue storage, offline status simulation, and idempotent sync with Express backend.
 */

export interface SyncItem {
  localId: string;
  entityType: 'game_session' | 'reminder_status' | 'mood_log';
  payload: any;
  createdAt: string;
}

const STORAGE_KEY = 'mindmate_offline_queue';
const OFFLINE_MODE_KEY = 'mindmate_simulated_offline';

export class OfflineService {
  private isSimulatedOffline: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(OFFLINE_MODE_KEY);
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
      localStorage.setItem(OFFLINE_MODE_KEY, String(offline));
    }
  }

  public getQueue(): SyncItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  public enqueue(entityType: 'game_session' | 'reminder_status' | 'mood_log', payload: any): SyncItem {
    const item: SyncItem = {
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      entityType,
      payload,
      createdAt: new Date().toISOString(),
    };

    const queue = this.getQueue();
    queue.push(item);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
    return item;
  }

  public clearQueue(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  public async syncWithBackend(apiClient: any): Promise<{ success: boolean; syncedCount: number; message: string }> {
    const queue = this.getQueue();
    if (queue.length === 0) {
      return { success: true, syncedCount: 0, message: 'Queue is empty. All records are up to date.' };
    }

    try {
      const response = await apiClient.post('/sync', { items: queue });
      if (response.data && response.data.success) {
        const syncedCount = response.data.syncedCount || queue.length;
        this.clearQueue();
        return {
          success: true,
          syncedCount,
          message: `${syncedCount} records synchronized successfully.`,
        };
      } else {
        return { success: false, syncedCount: 0, message: 'Backend sync request returned an error.' };
      }
    } catch (err: any) {
      return {
        success: false,
        syncedCount: 0,
        message: `Sync failed: ${err.message || 'Network unreachable'}. Retaining local queue.`,
      };
    }
  }
}

export const offlineService = new OfflineService();
