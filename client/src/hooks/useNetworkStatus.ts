import { useState, useEffect, useCallback } from 'react';
import { offlineService } from '../services/offlineService';

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced';

export interface NetworkStatusResult {
  isOnline: boolean;
  isOffline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

export const useNetworkStatus = (): NetworkStatusResult => {
  const [isOnline, setIsOnline] = useState<boolean>(!offlineService.isOffline());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(offlineService.isOffline() ? 'offline' : 'online');
  const [pendingCount, setPendingCount] = useState<number>(0);

  const updateCounts = useCallback(async () => {
    try {
      const count = await offlineService.getPendingCount();
      setPendingCount(count);
      const offline = offlineService.isOffline();
      setIsOnline(!offline);
      if (offline) {
        setSyncStatus('offline');
      } else if (count > 0 && syncStatus !== 'syncing') {
        setSyncStatus('online');
      }
    } catch (e) {
      console.warn('[NETWORK STATUS HOOK ERROR]', e);
    }
  }, [syncStatus]);

  const syncNow = useCallback(async () => {
    if (offlineService.isOffline()) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      const result = await offlineService.syncPendingSessions();
      await updateCounts();
      if (result.success) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('online'), 3000);
      } else {
        setSyncStatus('online');
      }
    } catch (err) {
      console.warn('[SYNC NOW FAILED]', err);
      setSyncStatus('online');
    }
  }, [updateCounts]);

  useEffect(() => {
    updateCounts();

    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('online');
      // Trigger automatic background sync on network restoration
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      updateCounts();
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [updateCounts, syncNow]);

  return {
    isOnline,
    isOffline: !isOnline,
    syncStatus,
    pendingCount,
    syncNow,
  };
};
