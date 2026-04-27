const CACHE_NAME = 'porsh-v20';
const STATIC_CACHE = 'porsh-static-v20';
const ASSET_CACHE = 'porsh-assets-v20';
const IMAGE_CACHE = 'porsh-images-v20';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/porsh-pwa-icon.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      console.log('[SW] Pre-caching static app shell');
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (e) {
          console.warn('[SW] Failed to cache initial asset:', url);
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
          keys.filter(key => !key.includes('porsh-v20'))
              .map(key => caches.delete(key))
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests unless they are fonts/images
  if (url.origin !== self.location.origin) {
    if (event.request.destination === 'font' || (event.request.destination === 'image' && url.hostname.includes('cloudinary'))) {
      // Stale-While-Revalidate for external assets
      event.respondWith(
        caches.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const cacheName = event.request.destination === 'font' ? ASSET_CACHE : IMAGE_CACHE;
              caches.open(cacheName).then(cache => cache.put(event.request, networkResponse.clone()));
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        })
      );
    }
    return;
  }

  // Navigation: Network-First with Cache Fallback (App Shell)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put('/', clone));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(STATIC_CACHE);
          const cachedRes = await cache.match('/', { ignoreSearch: true });
          return cachedRes || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Static Assets (Hashed JS/CSS from Vite): Cache-First
  const isStaticAsset = url.pathname.includes('/assets/') || url.pathname.match(/\.(woff2?|css|js)$/);
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(ASSET_CACHE).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Standard Images/Icons: Stale-While-Revalidate
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(IMAGE_CACHE).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network-First
  event.respondWith(
    fetch(event.request).catch(async () => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
