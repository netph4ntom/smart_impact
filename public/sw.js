/**
 * AQUA MONITOR — Service Worker
 * Cache-first for app shell, network-first for API calls.
 */

const CACHE_NAME = 'aquamon-v1';
const SHELL_URLS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and Blynk API calls
  if (request.method !== 'GET') return;
  if (url.origin.includes('blynk') || url.pathname.includes('/external/')) return;

  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request)
        .then(res => {
          if (res.ok && res.type !== 'opaque') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
