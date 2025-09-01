import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const QURAN_DATA_CACHE_NAME = 'quran-app-data-v1';
const AUDIO_CACHE_PREFIX = 'quran-audio-';

const API_HOST = 'api.alquran.cloud';
const AUDIO_HOSTS = ['everyayah.com', 'cdn.islamic.network'];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.skipWaiting();
clientsClaim();

self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          const isDataCache = cacheName === QURAN_DATA_CACHE_NAME;
          const isAudioCache = cacheName.startsWith(AUDIO_CACHE_PREFIX);
          const isWorkboxCache = /workbox/.test(cacheName);

          if (!isDataCache && !isAudioCache && !isWorkboxCache) {
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

  if (request.method !== 'GET') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        console.log('[SW] Navigation fetch failed. Serving app shell from cache.');
        return caches.match('/');
      })
    );
    return;
  }

  const isApiRequest = url.hostname === API_HOST;
  const isAudioRequest = AUDIO_HOSTS.some(host => url.hostname.includes(host));

  if (isApiRequest || isAudioRequest) {
    event.respondWith(
      findInCaches(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request);
      })
    );
    return;
  }
});

async function findInCaches(request) {
  const dataCache = await caches.open(QURAN_DATA_CACHE_NAME);
  let match = await dataCache.match(request);
  if (match) return match;
  
  const cacheKeys = await caches.keys();
  const audioCacheNames = cacheKeys.filter(key => key.startsWith(AUDIO_CACHE_PREFIX));
  
  for (const cacheName of audioCacheNames) {
    const audioCache = await caches.open(cacheName);
    match = await audioCache.match(request);
    if (match) return match;
  }

  return undefined;
}