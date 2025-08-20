// A more robust and clearer service worker implementation

const CORE_CACHE_NAME = 'quran-study-app-core-v8'; // Bumped version
const QURAN_DATA_CACHE_NAME = 'quran-app-data-v1';
const AUDIO_CACHE_PREFIX = 'quran-audio-';

// All the assets that constitute the "app shell"
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

// Hosts for different types of content
const API_HOST = 'api.alquran.cloud';
const AUDIO_HOSTS = ['everyayah.com', 'cdn.islamic.network'];

// --- EVENT LISTENERS ---

self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CORE_CACHE_NAME).then(cache => {
      console.log('[SW] Caching core static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch(error => {
      console.error('[SW] Failed to cache static assets during install:', error);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Clean up old caches that are not the current ones
          const isCoreCache = cacheName === CORE_CACHE_NAME;
          const isDataCache = cacheName === QURAN_DATA_CACHE_NAME;
          const isAudioCache = cacheName.startsWith(AUDIO_CACHE_PREFIX);

          if (!isCoreCache && !isDataCache && !isAudioCache) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // --- ROUTING ---

  // 1. Navigation strategy (for SPA)
  // Network first, but fallback to the cached index.html for offline support.
  // This is crucial for the app to load when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        console.log('[SW] Navigation fetch failed. Serving app shell from cache.');
        return caches.match('/'); // Serve the root, which should be cached as /index.html
      })
    );
    return;
  }

  // 2. Data/Audio Caching Strategy (Cache First)
  // For downloaded Quran data and audio files, serve from cache if available.
  const isApiRequest = url.hostname === API_HOST;
  const isAudioRequest = AUDIO_HOSTS.some(host => url.hostname.includes(host));

  if (isApiRequest || isAudioRequest) {
    event.respondWith(
      // Custom cache-first logic that checks all relevant caches
      findInCaches(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request);
      })
    );
    return;
  }
  
  // 3. Static Assets Strategy (Stale-While-Revalidate)
  // For core app files, fonts, etc. Serve from cache for speed, update in background.
  event.respondWith(
    caches.open(CORE_CACHE_NAME).then(cache => {
      return cache.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        });
        
        // Return cached response immediately if available, otherwise wait for network.
        return cachedResponse || fetchPromise;
      });
    })
  );
});


// --- HELPER FUNCTIONS ---

/**
 * Searches for a request in all relevant caches (data, and all audio caches).
 * @param {Request} request The request to find.
 * @returns {Promise<Response|undefined>}
 */
async function findInCaches(request) {
  // Check the data cache first
  const dataCache = await caches.open(QURAN_DATA_CACHE_NAME);
  let match = await dataCache.match(request);
  if (match) return match;
  
  // Check all audio caches
  const cacheKeys = await caches.keys();
  const audioCacheNames = cacheKeys.filter(key => key.startsWith(AUDIO_CACHE_PREFIX));
  
  for (const cacheName of audioCacheNames) {
    const audioCache = await caches.open(cacheName);
    match = await audioCache.match(request);
    if (match) return match;
  }

  return undefined;
}
