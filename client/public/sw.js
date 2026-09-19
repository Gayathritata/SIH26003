/**
 * MINDMATE NER - App Shell Service Worker
 * Provides offline static asset caching and App Shell fallback
 */

const CACHE_NAME = 'mindmate-ner-app-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install Event: Cache App Shell core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SERVICE WORKER] Caching App Shell static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SERVICE WORKER] Asset caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SERVICE WORKER] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-first with cache fallback for static assets & HTML navigation
self.addEventListener('fetch', (event) => {
  // Do not intercept API requests or non-GET requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful static responses dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed -> return cached version or index.html App Shell
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Network unavailable', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
