/*
 * Fetches one Pexels photo per ingredient and saves the links in src/data/photos.json.
 *
 *   pnpm photos              fetch what is missing or whose search changed (resumes where it stopped)
 *   pnpm photos --redo a,b   fetch these ingredients again
 *   pnpm photos --no-wait    stop at the hourly limit instead of waiting for it to reset
 *   pnpm photos:review       write photo-review.html from what is already saved (no key needed)
 *
 * The key is read from PEXELS_API_KEY or pairing-app/.env.local and is only sent to api.pexels.com. It is
 * never written to any file. Pexels allows about 200 requests an hour; 300 ingredients take two windows.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { queryFor, pickFor } from "../src/data/source/photo-queries.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src", "data", "photos.json");
const REVIEW = join(root, "photo-review.html");
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const listArg = (n) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1].split(",").map((s) => s.trim()).filter(Boolean) : []; };

const graphPath = join(root, "public", "graph.json");
if (!existsSync(graphPath)) { console.error("public/graph.json is missing. Run `pnpm build:graph` first."); process.exit(1); }
const ingredients = JSON.parse(readFileSync(graphPath, "utf8")).ingredients.map((i) => ({ id: i.id, name: i.name }));
const photos = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const save = () => writeFileSync(OUT, JSON.stringify(photos, null, 1) + "\n");

function writeReview() {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const thumb = (src) => `${src}?auto=compress&cs=tinysrgb&fit=crop&w=180&h=180`;
  const rows = ingredients.map(({ id, name }) => {
    const e = photos[id];
    const pick = pickFor(id);
    if (!e) return `<section><h2>${esc(name)} <small>${esc(id)}</small></h2><p class="miss">not fetched yet</p></section>`;
    if (e.none) return `<section><h2>${esc(name)} <small>${esc(id)}</small></h2><p class="miss">no results for “${esc(e.query)}”: set a different search in photo-queries.mjs</p></section>`;
    const stale = e.query !== queryFor(id, name);
    const alts = e.alts.map((a, n) => `<a href="${esc(a.url)}" target="_blank" class="${n === pick ? "on" : ""}"><img src="${esc(thumb(a.src))}" loading="lazy" alt=""><span>${n}</span></a>`).join("");
    return `<section><h2>${esc(name)} <small>${esc(id)} · “${esc(e.query)}”${stale ? " · search changed, run pnpm photos" : ""}</small></h2><div class="alts">${alts}</div></section>`;
  }).join("\n");
  const done = ingredients.filter(({ id }) => photos[id] && !photos[id].none).length;
  writeFileSync(REVIEW, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Photo review</title>
<style>body{font:15px/1.4 system-ui;margin:24px;background:#f3f1ea;color:#171614}header{max-width:760px}code{background:#fff;padding:1px 5px;border-radius:5px}
section{margin:22px 0;padding-top:12px;border-top:1px solid #ddd}h2{font-size:17px;margin:0 0 8px}small{font-weight:400;color:#7f7b73}
.alts{display:flex;gap:8px;flex-wrap:wrap}.alts a{position:relative;display:block;border-radius:12px;overflow:hidden;outline:3px solid transparent}
.alts a.on{outline-color:#171614}.alts img{display:block;width:120px;height:120px;object-fit:cover}.alts span{position:absolute;left:6px;top:6px;background:#171614;color:#fff;font-weight:700;font-size:12px;border-radius:99px;padding:1px 7px}.miss{color:#b83a2b}</style>
<header><h1>Ingredient photos</h1><p>${done} of ${ingredients.length} have a photo. The outlined photo is the one the app uses.</p>
<p>To use another one, add <code>id: { pick: N }</code> to <code>src/data/source/photo-queries.mjs</code> (N is the number on the photo). To search again, set new words, for example <code>sage: "sage leaves"</code>. Then run <code>pnpm photos</code> and <code>pnpm export</code>.</p></header>
${rows}`);
  console.log(`photo-review.html written (${done}/${ingredients.length} with photos). Open it in a browser.`);
}

if (flag("--review")) { writeReview(); process.exit(0); }

function loadKey() {
  if (process.env.PEXELS_API_KEY) return process.env.PEXELS_API_KEY.trim();
  const p = join(root, ".env.local");
  if (!existsSync(p)) return null;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*PEXELS_API_KEY\s*=\s*"?([^"\s#]+)"?/);
    if (m) return m[1];
  }
  return null;
}
const KEY = loadKey();
if (!KEY) {
  console.error("No Pexels key found. Add a line PEXELS_API_KEY=your-key to pairing-app/.env.local (see .env.example).");
  process.exit(1);
}

const redo = new Set(listArg("--redo"));
const queue = ingredients.filter(({ id, name }) => redo.has(id) || !photos[id] || photos[id].query !== queryFor(id, name));
if (queue.length === 0) { console.log("Every ingredient already has its photo. Nothing to fetch."); writeReview(); process.exit(0); }
console.log(`${queue.length} ingredients to fetch.`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pickFields = (p) => ({ id: p.id, src: p.src.original, w: p.width, h: p.height, by: p.photographer, byUrl: p.photographer_url, url: p.url, color: p.avg_color, alt: p.alt || "" });

let n = 0;
for (const { id, name } of queue) {
  const query = queryFor(id, name);
  let res;
  for (;;) {
    res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8`, { headers: { Authorization: KEY } });
    if (res.status !== 429) break;
    const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000 || Date.now() + 60 * 60 * 1000;
    if (flag("--no-wait")) { save(); console.log(`Hourly limit reached after ${n}. Run pnpm photos again after ${new Date(reset).toLocaleTimeString()}.`); writeReview(); process.exit(0); }
    console.log(`Hourly limit reached after ${n}. Waiting until ${new Date(reset).toLocaleTimeString()} (progress is saved; Ctrl-C is safe).`);
    await sleep(Math.max(5000, reset - Date.now() + 2000));
  }
  if (res.status === 401 || res.status === 403) { console.error("Pexels refused the key (HTTP " + res.status + "). Check PEXELS_API_KEY in .env.local."); process.exit(1); }
  if (!res.ok) { console.error(`  ${id}: HTTP ${res.status}, skipped`); continue; }
  const body = await res.json();
  const results = (body.photos ?? []).map(pickFields);
  photos[id] = results.length ? { query, alts: results } : { query, none: true };
  save();
  n++;
  const remaining = res.headers.get("x-ratelimit-remaining");
  console.log(`  ${String(n).padStart(3)}/${queue.length}  ${name.padEnd(22)} ${results.length ? `${results.length} results` : "no results"}${remaining ? `  (${remaining} left this hour)` : ""}`);
  await sleep(250);
}
console.log("Done. Run `pnpm export` to put the photos in the app.");
writeReview();
