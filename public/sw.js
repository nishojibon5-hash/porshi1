const CACHE_NAME = 'porsh-v15';
const STATIC_CACHE = 'porsh-static-v15';
const ASSET_CACHE = 'porsh-assets-v5';
// Last Updated: 2026-04-25 10:25 AM (PRO RELEASE)

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/porsh-pwa-icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            // Explicitly delete ALL old porsh caches
            if (key !== STATIC_CACHE && key !== ASSET_CACHE) {
              console.log('[SW] Purging old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ONLY handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-First for main pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-First for static assets
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const isAsset = url.pathname.includes('/assets/') || 
                        url.pathname.endsWith('.png') || 
                        url.pathname.endsWith('.jpg') || 
                        url.pathname.endsWith('.svg') || 
                        url.pathname.endsWith('.woff2');

        if (isAsset) {
          const responseClone = networkResponse.clone();
          caches.open(ASSET_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
        }

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
