/* Offline shell for the Warranty tracker PWA. Network first for our files, cache as fallback. */
const CACHE = 'warranty-next-3';
const ASSETS = ['./', './tokens.css', './style.css', './app.js', './favicon.svg', './manifest.webmanifest'];
const CACHEABLE_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (url.origin !== location.origin) {
    if (!CACHEABLE_HOSTS.includes(url.hostname)) return;
    /* Fonts: serve from cache, refresh in the background. */
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(e.request);
        const net = fetch(e.request)
          .then((r) => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; })
          .catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && !r.redirected) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./')))
  );
});
