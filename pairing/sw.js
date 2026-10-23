/* Pairing Explorer service worker, generated at build. Cache a0aae0e31d. */
const VERSION = "a0aae0e31d";
const CACHE = "pairing-" + VERSION;
const BASE = "/pairing";
const PRECACHE = ["/pairing/404/","/pairing/404.html","/pairing/__next.__PAGE__.txt","/pairing/__next._full.txt","/pairing/__next._tree.txt","/pairing/_next/static/chunks/03uha8507kr8k.js","/pairing/_next/static/chunks/07zoqnd_uf6jc.js","/pairing/_next/static/chunks/0boucooz7tk6g.js","/pairing/_next/static/chunks/0cz1d0mv5g_q7.js","/pairing/_next/static/chunks/1orswt7f6ex5b.css","/pairing/_next/static/chunks/2_pa0dzi44-40.js","/pairing/_next/static/chunks/2e-s3dudzxqqk.js","/pairing/_next/static/chunks/2jzukcxm1tlqv.js","/pairing/_next/static/chunks/34zln78fk1u5d.js","/pairing/_next/static/chunks/3dlqm4t3lwqe9.js","/pairing/_next/static/chunks/3hukj-2g57xkx.js","/pairing/_next/static/chunks/3zn4q-rnqdnfg.js","/pairing/_next/static/chunks/408f25z4q7sn0.js","/pairing/_next/static/chunks/44ba4b-uf7ktt.js","/pairing/_next/static/chunks/turbopack-40vpgx3l_nb3e.js","/pairing/_next/static/iBb1Qw4rVNqv_ZW1fIU8H/_buildManifest.js","/pairing/_next/static/iBb1Qw4rVNqv_ZW1fIU8H/_clientMiddlewareManifest.js","/pairing/_next/static/iBb1Qw4rVNqv_ZW1fIU8H/_ssgManifest.js","/pairing/_next/static/media/1bffadaabf893a1e-s.p.3-6t-g6q0vh0a.woff2","/pairing/_next/static/media/2bbe8d2671613f1f-s.0k62hbripvv8p.woff2","/pairing/_next/static/media/2c55a0e60120577a-s.0-dom-5bn10r2.woff2","/pairing/_next/static/media/5476f68d60460930-s.2uwcyprjm3xu3.woff2","/pairing/_next/static/media/5baf1b65c11560cb-s.p.3r11t8qn1bk6_.woff2","/pairing/_next/static/media/83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2","/pairing/_next/static/media/9c72aa0f40e4eef8-s.1y4-pdgsjb-pw.woff2","/pairing/_next/static/media/ad66f9afd8947f86-s.3lvt2whj97whp.woff2","/pairing/_next/static/media/d0f5953821b08bc1-s.p.1sj2vuw194_rx.woff2","/pairing/_next/static/media/icon.37_f1q-xizisb.svg","/pairing/_not-found/__next._full.txt","/pairing/_not-found/__next._not-found.__PAGE__.txt","/pairing/_not-found/__next._tree.txt","/pairing/_not-found/","/pairing/_not-found/index.txt","/pairing/apple-touch-icon.png","/pairing/graph.json","/pairing/icon-192.png","/pairing/icon-512.png","/pairing/icon-maskable-512.png","/pairing/icon.svg","/pairing/","/pairing/index.txt","/pairing/ingredient/__next._full.txt","/pairing/ingredient/__next._tree.txt","/pairing/ingredient/__next.ingredient.__PAGE__.txt","/pairing/ingredient/","/pairing/ingredient/index.txt","/pairing/manifest.webmanifest","/pairing/saved/__next._full.txt","/pairing/saved/__next._tree.txt","/pairing/saved/__next.saved.__PAGE__.txt","/pairing/saved/","/pairing/saved/index.txt","/pairing/season/__next._full.txt","/pairing/season/__next._tree.txt","/pairing/season/__next.season.__PAGE__.txt","/pairing/season/","/pairing/season/index.txt"];
const GRAPH = BASE + "/graph.json";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("pairing-") && k !== CACHE).map((k) => caches.delete(k))))
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
