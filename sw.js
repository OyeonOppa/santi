/**
 * SANTI Service Worker — Offline Fallback
 * Strategy:
 *   - /api/*       → network only (real-time state, cannot cache)
 *   - index.html   → network-first (always get latest, fallback to cache if offline)
 *   - everything else → cache-first (images, fonts, manifest, etc.)
 *
 * Bump CACHE version string whenever deploying to force cache refresh.
 */
const CACHE = 'santi-v3';
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

  // API calls — always network, never cache
  if (url.pathname.startsWith('/api/')) return;

  // index.html — network-first: always fetch latest, fallback to cache if offline
  const isHTML = url.pathname === '/' || url.pathname.endsWith('.html');
  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/')))
    );
    return;
  }

  // Everything else (manifest, images, sw itself) — cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (
          e.request.method === 'GET' &&
          res.status === 200 &&
          url.origin === self.location.origin
        ) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/'));
    })
  );
});
