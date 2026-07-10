/**
 * PWA Hooks and Utilities
 *
 * Service Worker registration, push notifications, and offline support
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// Check if PWA is supported
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Check if app is installed (standalone mode)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Subscribe to push notifications
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  publicVapidKey: string
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    console.log('Push subscription created');

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Check for updates
export async function checkForUpdates(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const update = await registration.update();

    if (update) {
      console.log('New version available');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Update check failed:', error);
    return false;
  }
}

// Apply update
export function applyUpdate(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}

// usePWA hook
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Initialize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check online status
    setIsOnline(navigator.onLine);
    setIsInstalled(isStandalone());

    // Register service worker
    registerServiceWorker().then((registration) => {
      setServiceWorker(registration);

      // Listen for updates
      if (registration) {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      }
    });
  }, []);

  // Online/offline listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply update
  const applyAppUpdate = useCallback(() => {
    applyUpdate();
  }, []);

  return {
    isOnline,
    isInstalled,
    isPWA: isPWA(),
    serviceWorker,
    updateAvailable,
    applyAppUpdate,
    registerServiceWorker,
    isStandalone: isStandalone(),
  };
}

// useOfflineStatus hook
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOperations, setPendingOperations] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when back online
      triggerBackgroundSync();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-conversions');
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  };

  const addPendingOperation = useCallback(() => {
    setPendingOperations((prev) => prev + 1);
  }, []);

  const removePendingOperation = useCallback(() => {
    setPendingOperations((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    isOnline,
    pendingOperations,
    addPendingOperation,
    removePendingOperation,
  };
}

// Store data offline
export async function storeOfflineData<T>(key: string, data: T): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cuanpintar', 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('offlineData', 'readwrite');
      const store = transaction.objectStore('offlineData');

      store.put({ key, data, timestamp: Date.now() });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

// Retrieve offline data
export async function getOfflineData<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cuanpintar', 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('offlineData')) {
        resolve(null);
        return;
      }

      const transaction = db.transaction('offlineData', 'readonly');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || null);
      };

      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}
