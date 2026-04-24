const CACHE_NAME = 'porsh-static-v6';
const DATA_CACHE_NAME = 'porsh-data-v2';

const urlsToCache = [
  '/',
  '/porsh',
  '/index.html',
  '/manifest.json',
  '/porsh-pwa-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching offline shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle navigation requests (SPA support)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if found
      if (response) return response;

      // Otherwise fetch and cache
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Cache fonts, icons, and static assets
          if (url.origin === self.location.origin && 
              (url.pathname.includes('/assets/') || 
               url.pathname.endsWith('.png') || 
               url.pathname.endsWith('.jpg') || 
               url.pathname.endsWith('.svg') || 
               url.pathname.endsWith('.woff2'))) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      });
    })
  );
});

// Handle messages (e.g. skipWaiting)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * FIREBASE MESSAGING COMPATIBILITY
 * If you use Firebase Messaging, you can import the script here:
 * importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
 * importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');
 */
