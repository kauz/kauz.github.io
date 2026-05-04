const CACHE = 'apopov-dev-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(
    fetch('/cache-manifest.json')
      .then((r) => r.json())
      .then((urls) => caches.open(CACHE).then((cache) => cache.addAll([...urls])))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  // Network-first for navigation requests (HTML pages) so theme-restore script stays current.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE).then((cache) => cache.put(e.request, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(e.request);
          return cached ?? (await caches.match('/')) ?? Response.error();
        })
    );
    return;
  }

  // Cache-first for static assets (hashed filenames, images, etc.)
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(e.request);
      if (cached) return cached;
      try {
        const response = await fetch(e.request);
        if (response.ok) cache.put(e.request, response.clone());
        return response;
      } catch {
        return Response.error();
      }
    })
  );
});
