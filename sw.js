const CORE_CACHE_NAME = 'quran-study-app-core-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js',
  'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap',
  'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap'
];
const API_HOST = 'api.alquran.cloud';
const GSTATIC_HOST = 'fonts.gstatic.com';
const AUDIO_HOSTS = [
  'everyayah.com',
  'cdn.islamic.network',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CORE_CACHE_NAME).then(cache => {
      console.log('Opened core cache and caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(error => {
        console.error('Failed to cache static assets:', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // This condition ensures we only delete old shell/core caches
          // and leaves dynamic data/audio caches alone.
          const isOldCoreCache = (cacheName.startsWith('quran-study-app-core-') || cacheName.startsWith('quran-study-app-v')) && cacheName !== CORE_CACHE_NAME;
          if (isOldCoreCache) {
            console.log('Deleting old core cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: For explicitly downloaded assets (audio & quran text data)
  // Use a Cache-First strategy. This makes offline mode work.
  const isAudio = AUDIO_HOSTS.includes(url.hostname);
  // Matches /v1/surah/ANY_NUMBER/ANY_EDITION (for both audio and text downloads)
  const isDownloadedApiData = url.hostname === API_HOST && url.pathname.match(/^\/v1\/surah\/\d+\/.+/);

  if (isAudio || isDownloadedApiData) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request);
      })
    );
    return;
  }

  // Strategy 2: For other API calls (lists, tafsir, search, etc.)
  // Use a Stale-While-Revalidate strategy with the core cache.
  if (url.hostname === API_HOST) {
    event.respondWith(
      caches.open(CORE_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy 3: For Google Fonts (Cache First, then Network and Cache)
  if (url.hostname === GSTATIC_HOST) {
    event.respondWith(
      caches.open(CORE_CACHE_NAME).then(cache => {
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
  
  // Strategy 4: For App Shell and all other assets (Cache First, then Network, with dynamic caching)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request).then(networkResponse => {
         return caches.open(CORE_CACHE_NAME).then(cache => {
             if (networkResponse.ok) {
                 cache.put(request, networkResponse.clone());
             }
             return networkResponse;
         });
      });
    })
  );
});