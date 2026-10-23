/*
 * Writes out/sw.js after `next build`: precaches the exported app shell and the graph, so after the first
 * load everything in F1 to F7 works offline. Hashed _next/static files are cache-first, graph.json is
 * stale-while-revalidate (new graph picked up on next launch, PRD F10), pages are network-first.
 */
import { readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const BASE = "/pairing";

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
const files = walk(out).map((p) => relative(out, p).split("\\").join("/")).filter((p) => p !== "sw.js" && !p.endsWith(".map") && !p.endsWith(".DS_Store"));
const urls = files.map((p) => (p.endsWith("index.html") ? `${BASE}/${p.slice(0, -"index.html".length)}` : `${BASE}/${p}`));
const hash = createHash("sha1");
for (const f of files) hash.update(f).update(readFileSync(join(out, f)));
const version = hash.digest("hex").slice(0, 10);

const sw = `/* Pairing Explorer service worker, generated at build. Cache ${version}. */
const VERSION = ${JSON.stringify(version)};
const CACHE = "pairing-" + VERSION;
const BASE = ${JSON.stringify(BASE)};
const PRECACHE = ${JSON.stringify(urls)};
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
  if (url.pathname.startsWith(BASE + "/_next/static/")) return event.respondWith(cacheFirst(req));
  if (req.mode === "navigate") return event.respondWith(networkFirst(req, BASE + "/"));
  event.respondWith(networkFirst(req));
});
`;
writeFileSync(join(out, "sw.js"), sw);
console.log(`sw.js: cache ${version}, ${urls.length} precached urls`);
