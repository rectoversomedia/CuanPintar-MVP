/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'cuanpintar-v1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests (they should always go to network)
  if (url.pathname.startsWith('/api/')) return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();

        // Cache successful responses
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }

          // Return nothing for other requests
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options: NotificationOptions = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    tag: data.tag || 'default',
    data: data.url || '/',
    actions: data.actions || [],
    vibrate: [100, 50, 100],
    requireInteraction: data.priority === 'high',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-conversions') {
    event.waitUntil(syncConversions());
  }
});

// Sync conversions when back online
async function syncConversions() {
  // Get pending conversions from IndexedDB
  const db = await openDB();
  const pending = await db.getAll('pendingConversions');

  for (const conversion of pending) {
    try {
      const response = await fetch('/api/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversion),
      });

      if (response.ok) {
        await db.delete('pendingConversions', conversion.id);
      }
    } catch (error) {
      console.error('Failed to sync conversion:', error);
    }
  }
}

// IndexedDB helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cuanpintar', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingConversions')) {
        db.createObjectStore('pendingConversions', { keyPath: 'id' });
      }
    };
  });
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

export {};
