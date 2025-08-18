const CACHE_NAME = 'quran-study-app-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-maskable.svg',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js',
  'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap',
  'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap'
];
const API_HOST = 'api.alquran.cloud';
const GSTATIC_HOST = 'fonts.gstatic.com';

// Install event: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache and caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(error => {
        console.error('Failed to cache static assets:', error);
      });
    })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients.
  );
});

// Fetch event: apply caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // We only want to cache GET requests.
  if (request.method !== 'GET') {
    return;
  }

  // Strategy for API calls (Stale-While-Revalidate)
  if (url.hostname === API_HOST) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            // If fetch is successful, update the cache
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
          // Return cached response immediately if available, otherwise wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy for Google Fonts files (Cache First, then Network and Cache)
  if (url.hostname === GSTATIC_HOST) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          return cachedResponse || fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // Strategy for App Shell and other assets (Cache First, then Network, with dynamic caching)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request).then(networkResponse => {
         return caches.open(CACHE_NAME).then(cache => {
             // Only cache successful responses for GET requests
             if (networkResponse.ok) {
                 cache.put(request, networkResponse.clone());
             }
             return networkResponse;
         });
      });
    })
  );
});