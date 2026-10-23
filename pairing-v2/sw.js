/* Pairing Explorer service worker, generated at build. Cache d38149a24d. */
const VERSION = "d38149a24d";
const CACHE = "pairing-v2-" + VERSION;
const BASE = "/pairing-v2";
const PRECACHE = ["/pairing-v2/404/","/pairing-v2/404.html","/pairing-v2/__next.__PAGE__.txt","/pairing-v2/__next._full.txt","/pairing-v2/__next._tree.txt","/pairing-v2/_next/static/chunks/08qkxjwoohne3.js","/pairing-v2/_next/static/chunks/0cz1d0mv5g_q7.js","/pairing-v2/_next/static/chunks/0gne_24x0cnpr.js","/pairing-v2/_next/static/chunks/0mjb2x7avetkk.js","/pairing-v2/_next/static/chunks/0xc1am67marfd.js","/pairing-v2/_next/static/chunks/1etjl4u1-yovu.js","/pairing-v2/_next/static/chunks/1ivyxp4w7iu6l.css","/pairing-v2/_next/static/chunks/2_pa0dzi44-40.js","/pairing-v2/_next/static/chunks/2qb7-ni8mj7j_.js","/pairing-v2/_next/static/chunks/2xhjy54if052u.js","/pairing-v2/_next/static/chunks/3099qsojy_aiy.js","/pairing-v2/_next/static/chunks/34zln78fk1u5d.js","/pairing-v2/_next/static/chunks/37izdoaz060pq.js","/pairing-v2/_next/static/chunks/3dlqm4t3lwqe9.js","/pairing-v2/_next/static/chunks/3zn4q-rnqdnfg.js","/pairing-v2/_next/static/chunks/44kp22n207vx5.js","/pairing-v2/_next/static/chunks/turbopack-1wr2egzkakx5b.js","/pairing-v2/_next/static/jlcng92pbJ5YOFKFwzCoY/_buildManifest.js","/pairing-v2/_next/static/jlcng92pbJ5YOFKFwzCoY/_clientMiddlewareManifest.js","/pairing-v2/_next/static/jlcng92pbJ5YOFKFwzCoY/_ssgManifest.js","/pairing-v2/_next/static/media/07454f8ad8aaac57-s.p.2kjei9psvcorz.woff2","/pairing-v2/_next/static/media/116f49b013842575-s.p.43qce4v-sp3dx.woff2","/pairing-v2/_next/static/media/224e262ef877bfa4-s.1zkvd_innyig_.woff2","/pairing-v2/_next/static/media/7a4546d8114e54fa-s.18o8ati-4_x9g.woff2","/pairing-v2/_next/static/media/7f11d98043fdedc9-s.2c8-7nzo1jf9r.woff2","/pairing-v2/_next/static/media/8feca5bfbcc904f1-s.p.1xt3x57tcdmbv.woff2","/pairing-v2/_next/static/media/aaeb013c77132fba-s.p.1wh0qzzwls4_i.woff2","/pairing-v2/_next/static/media/b9e7b9c6ff7672ac-s.p.2jjgzj9abf9cy.woff2","/pairing-v2/_next/static/media/d8cb5ab3660140cd-s.p.2demiz2t05dx4.woff2","/pairing-v2/_next/static/media/e484ef06964e3fd1-s.3qz2g84exd0cl.woff2","/pairing-v2/_next/static/media/e6d00ff86ef9e699-s.1vcas2uk12q5a.woff2","/pairing-v2/_next/static/media/icon.37_f1q-xizisb.svg","/pairing-v2/_not-found/__next._full.txt","/pairing-v2/_not-found/__next._not-found.__PAGE__.txt","/pairing-v2/_not-found/__next._tree.txt","/pairing-v2/_not-found/","/pairing-v2/_not-found/index.txt","/pairing-v2/apple-touch-icon.png","/pairing-v2/chance/__next._full.txt","/pairing-v2/chance/__next._tree.txt","/pairing-v2/chance/__next.chance.__PAGE__.txt","/pairing-v2/chance/","/pairing-v2/chance/index.txt","/pairing-v2/graph.json","/pairing-v2/i18n/sl.json","/pairing-v2/icon-192.png","/pairing-v2/icon-512.png","/pairing-v2/icon-maskable-512.png","/pairing-v2/icon.svg","/pairing-v2/","/pairing-v2/index.txt","/pairing-v2/ingredient/__next._full.txt","/pairing-v2/ingredient/__next._tree.txt","/pairing-v2/ingredient/__next.ingredient.__PAGE__.txt","/pairing-v2/ingredient/","/pairing-v2/ingredient/index.txt","/pairing-v2/manifest.webmanifest","/pairing-v2/saved/__next._full.txt","/pairing-v2/saved/__next._tree.txt","/pairing-v2/saved/__next.saved.__PAGE__.txt","/pairing-v2/saved/","/pairing-v2/saved/index.txt","/pairing-v2/season/__next._full.txt","/pairing-v2/season/__next._tree.txt","/pairing-v2/season/__next.season.__PAGE__.txt","/pairing-v2/season/","/pairing-v2/season/index.txt"];
const GRAPH = BASE + "/graph.json";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("pairing-v2-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    if (fallbackUrl) {
      const fb = await cache.match(fallbackUrl);
      if (fb) return fb;
    }
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request).then((res) => { if (res.ok) cache.put(request, res.clone()); return res; }).catch(() => hit);
  return hit || refresh;
}

const PHOTOS = "photos-v1";
const PHOTO_MAX = 600;
async function photo(request) {
  const cache = await caches.open(PHOTOS);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === "opaque") {
    await cache.put(request, res.clone());
    const keys = await cache.keys();
    for (const k of keys.slice(0, Math.max(0, keys.length - PHOTO_MAX))) await cache.delete(k);
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "images.pexels.com" || url.hostname === "images.unsplash.com") return event.respondWith(photo(req));
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (url.pathname === GRAPH) return event.respondWith(staleWhileRevalidate(req));
  if (url.pathname.startsWith(BASE + "/art/")) return event.respondWith(photo(req));
  if (url.pathname.startsWith(BASE + "/_next/static/")) return event.respondWith(cacheFirst(req));
  if (req.mode === "navigate") return event.respondWith(networkFirst(req, BASE + "/"));
  event.respondWith(networkFirst(req));
});
