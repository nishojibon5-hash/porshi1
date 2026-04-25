const CACHE_NAME = 'porsh-v17';
const STATIC_CACHE = 'porsh-static-v17';
const ASSET_CACHE = 'porsh-assets-v17';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/porsh-pwa-icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      // Use no-cors or ignore failures so one missing asset doesn't stop SW installation
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (e) {
          console.warn('[SW] Failed to cache asset:', url, e);
        }
      }
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => key !== STATIC_CACHE && key !== ASSET_CACHE)
              .map(key => caches.delete(key))
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-First for HTML navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cachedRes = await cache.match('/', { ignoreSearch: true });
        if (cachedRes) return cachedRes;
        return new Response('<h3>Porshi (Offline)</h3><p>Please check your internet connection.</p>', {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  const isAsset = url.pathname.includes('/assets/') || 
                  url.pathname.match(/\.(png|jpe?g|svg|woff2?|css|js)$/);

  // Cache-First only for static hashed assets and images
  if (isAsset) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseClone = networkResponse.clone();
          caches.open(ASSET_CACHE).then(cache => cache.put(event.request, responseClone));
          return networkResponse;
        }).catch(() => new Response(""));
      })
    );
    return;
  }

  // Network-First for everything else (like manifest.json, APIs, etc.)
  event.respondWith(
    fetch(event.request).then(networkResponse => {
      // We can update the STATIC_CACHE here with the fresh response
      if (networkResponse && networkResponse.status === 200) {
        const clone = networkResponse.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
      }
      return networkResponse;
    }).catch(async () => {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match(event.request, { ignoreSearch: true });
    })
  );
});

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
