const CACHE = 'smart-dashboard-v5';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // ── Pass all cross-origin API / external requests straight through ──
  // (weather, news, jokes, hukamnama, fonts, etc. must always be live)
  if (url.origin !== location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  // ── Cache-first for same-origin static assets (HTML, CSS, JS, icons) ──
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const cached = await c.match(e.request);
      if (cached) return cached;
      try {
        const networkRes = await fetch(e.request);
        c.put(e.request, networkRes.clone());
        return networkRes;
      } catch (err) {
        return cached || Response.error();
      }
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
