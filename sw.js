const CORE_CACHE_NAME = 'quran-study-app-core-v7'; // Version bumped to trigger update
const QURAN_DATA_CACHE_NAME = 'quran-app-data-v1';
const AUDIO_CACHE_PREFIX = 'quran-audio-';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap',
  'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap',
  // JS Dependencies from importmap
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client',
  'https://esm.sh/wavesurfer.js@7',
  'https://esm.sh/@google/genai',
  'https://esm.sh/framer-motion@^11.0.0',
  'https://esm.sh/react-use-measure',
  'https://esm.sh/focus-trap-react@^10.2.3'
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
        console.error('Failed to cache static assets during install:', error);
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
          const isActiveCoreCache = cacheName === CORE_CACHE_NAME;
          const isActiveDataCache = cacheName === QURAN_DATA_CACHE_NAME;
          const isActiveAudioCache = cacheName.startsWith(AUDIO_CACHE_PREFIX);
          
          // Delete any cache that is not one of our active caches
          if (!isActiveCoreCache && !isActiveDataCache && !isActiveAudioCache) {
            console.log('Deleting old/unused cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to find a response in any of the dynamic audio caches
async function getFromAudioCaches(request) {
  const cacheKeys = await caches.keys();
  for (const key of cacheKeys) {
    if (key.startsWith(AUDIO_CACHE_PREFIX)) {
      const cache = await caches.open(key);
      const match = await cache.match(request);
      if (match) return match;
    }
  }
  return null;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: Navigation requests (for SPA routing)
  // Network-first, falling back to the cached app shell (/index.html).
  // This is the key fix for the freezing issue when navigating offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        console.log('Fetch for navigation failed, serving /index.html from cache.');
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Strategy 2: Downloaded Content (audio & quran text) - Cache-first
  // Prioritize serving user-downloaded content from the cache.
  const isAudio = AUDIO_HOSTS.some(host => url.hostname.includes(host));
  if (isAudio) {
    event.respondWith(
      getFromAudioCaches(request).then(cachedResponse => {
        return cachedResponse || fetch(request); // Fallback to network if not in any audio cache
      })
    );
    return;
  }
  if (url.hostname === API_HOST && url.pathname.startsWith('/v1/surah')) {
    event.respondWith(
      caches.open(QURAN_DATA_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          return cachedResponse || fetch(request); // Fallback for surahs not in the text data cache
        });
      })
    );
    return;
  }

  // Strategy 3: App Shell Assets, Fonts & other APIs - Stale-while-revalidate
  // Serve from cache immediately for speed, then update the cache in the background.
  // Provides offline fallback if the item is already in the cache.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        // If the fetch is successful, update the cache.
        if (networkResponse.ok) {
          caches.open(CORE_CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(err => {
        // Network failed. The request will fail if there's no cached response.
        // This is acceptable as we've already returned the cachedResponse if it existed.
        console.warn(`Network request for ${request.url} failed.`);
      });

      // Return cached response immediately if available, otherwise wait for the network.
      return cachedResponse || fetchPromise;
    })
  );
});