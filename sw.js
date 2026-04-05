/**
 * SANTI Service Worker — Offline Fallback
 * Strategy:
 *   - /api/* → network only (real-time state, cannot cache)
 *   - everything else → cache-first, fallback to network
 */
const CACHE = 'santi-v1';
const PRECACHE = ['/', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls — always network, never cache (SSE also excluded)
  if (url.pathname.startsWith('/api/')) return;

  // Everything else — cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Only cache successful same-origin GET responses
        if (
          e.request.method === 'GET' &&
          res.status === 200 &&
          url.origin === self.location.origin
        ) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // If offline and not cached — return cached index.html as fallback
        return caches.match('/');
      });
    })
  );
});
