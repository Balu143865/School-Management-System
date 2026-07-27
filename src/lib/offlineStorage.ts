import { useState, useEffect } from 'react';

const CACHE_PREFIX = 'gia_offline_cache_';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const offlineStorage = {
  set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to write to localStorage offline cache', e);
    }
  },

  get<T>(key: string): CacheEntry<T> | null {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!item) return null;
      return JSON.parse(item) as CacheEntry<T>;
    } catch (e) {
      console.warn('Failed to read from localStorage offline cache', e);
      return null;
    }
  },

  clear(key?: string): void {
    try {
      if (key) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      } else {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(k);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to clear offline cache', e);
    }
  }
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
