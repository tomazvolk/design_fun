/*
 * Compiles src/data/source/*.mjs into public/graph.json, the one file the app loads.
 * Rules follow the PRD's "Rules for the shipped graph": one canonical name per ingredient, three node
 * types (ingredient, cuisine, dish), undirected edges stored once with the higher tier, every edge tiered,
 * hubs marked, 15 fixed categories, seasons as a set or "all".
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vegetables from "../src/data/source/vegetables.mjs";
import fruits from "../src/data/source/fruits.mjs";
import herbs from "../src/data/source/herbs-spices.mjs";
import proteins from "../src/data/source/proteins.mjs";
import dairy from "../src/data/source/dairy-grains-nuts.mjs";
import pantryA from "../src/data/source/pantry-a.mjs";
import pantryB from "../src/data/source/pantry-b.mjs";
import { ALIASES, DISHES, DROP, EXTRA, COMBOS, REASONS } from "../src/data/source/meta.mjs";
import descA from "../src/data/source/descriptions-a.mjs";
import descB from "../src/data/source/descriptions-b.mjs";
import descC from "../src/data/source/descriptions-c.mjs";
import slDescA from "../src/data/i18n/sl-descriptions-a.mjs";
import slDescB from "../src/data/i18n/sl-descriptions-b.mjs";
import slDescC from "../src/data/i18n/sl-descriptions-c.mjs";
import slNames from "../src/data/i18n/sl-names.mjs";
import * as slTerms from "../src/data/i18n/sl-terms.mjs";

const DESCRIPTIONS = { ...descA, ...descB, ...descC };
import { queryFor, pickFor } from "../src/data/source/photo-queries.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const CATEGORIES = ["herb", "spice", "vegetable", "fruit", "protein", "seafood", "dairy", "grain", "nut", "oil", "acid", "sweetener", "alcohol", "condiment", "other"];
export const CUISINES = [
  { id: "italian", name: "Italian" },
  { id: "french", name: "French" },
  { id: "mediterranean", name: "Mediterranean" },
  { id: "middle-eastern", name: "Middle Eastern" },
  { id: "indian", name: "Indian" },
  { id: "east-asian", name: "Chinese & Japanese" },
  { id: "se-asian", name: "Southeast Asian" },
  { id: "latin", name: "Mexican & Latin" },
];
const TASTES = ["sweet", "sour", "salty", "bitter", "hot", "astringent"];
const SEASONS = ["spring", "summer", "autumn", "winter"];
const HUB_COUNT = 30;

const raw = { ...vegetables, ...fruits, ...herbs, ...proteins, ...dairy, ...pantryA, ...pantryB, ...EXTRA };

function parseTaste(str) {
  const scores = Object.fromEntries(TASTES.map((t) => [t, 0]));
  let implicit = 0;
  for (const tok of (str || "").split(/\s+/).filter(Boolean)) {
    const [word, n] = tok.split(":");
    if (!TASTES.includes(word)) throw new Error(`unknown taste word "${word}"`);
    if (n !== undefined) scores[word] = Number(n);
    else { scores[word] = implicit === 0 ? 3 : 2; implicit++; }
  }
  return scores;
}
function parseScale(v) {
  if (typeof v === "number") return { v, lo: v, hi: v };
  const [lo, hi] = String(v).split("-").map(Number);
  return { v: (lo + hi) / 2, lo, hi };
}
function parseSeason(str) {
  const toks = String(str).split(/\s+/).filter(Boolean);
  if (toks.includes("all") || toks.length === 0) return "all";
  const set = SEASONS.filter((s) => toks.includes(s));
  return set.length === 4 ? "all" : set;
}
const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const humanize = (s) => s.replace(/-/g, " ");

// Pass 1: ingredients and dish nodes.
const ingredients = [];
const byId = new Map();
const dishes = new Map(); // id -> name
function dishNode(id) {
  const name = DISHES[id] ?? humanize(id);
  if (!dishes.has(id)) dishes.set(id, name);
  return id;
}
for (const [id, src] of Object.entries(raw)) {
  if (!CATEGORIES.includes(src.cat)) throw new Error(`${id}: bad category ${src.cat}`);
  const ing = {
    id, name: src.name, aliases: src.aliases ?? [], cat: src.cat,
    taste: parseTaste(src.taste), weight: parseScale(src.weight), volume: parseScale(src.volume),
    season: parseSeason(src.season), techniques: (src.techniques || "").split(/\s+/).filter(Boolean),
    cuisines: src.cuisines ?? {}, chips: src.chips ?? [],
    dishes: (src.dishes || "").split(/\s+/).filter(Boolean).filter((d) => d !== "everything").map(dishNode),
    art: src.art ?? null, hub: false, degree: 0,
    description: DESCRIPTIONS[id] ?? null,
    photo: null,
  };
  for (const c of Object.keys(ing.cuisines)) if (!CUISINES.some((g) => g.id === c)) throw new Error(`${id}: bad cuisine ${c}`);
  ingredients.push(ing);
  byId.set(id, ing);
}

// Photos from Pexels (scripts/fetch-photos.mjs): the chosen result per ingredient, without the alternatives.
const photosPath = join(root, "src", "data", "photos.json");
const PHOTOS = existsSync(photosPath) ? JSON.parse(readFileSync(photosPath, "utf8")) : {};
let withPhoto = 0;
// Hand-drawn art in public/art/<id>.(webp|png|svg) wins over photos and the built-in line drawings.
let withArt = 0;
for (const ing of ingredients) {
  const file = ["webp", "png", "svg"].map((ext) => `${ing.id}.${ext}`).find((f) => existsSync(join(root, "public", "art", f)));
  ing.image = file ? `art/${file}` : null;
  if (file) withArt++;
}
for (const ing of ingredients) {
  const e = PHOTOS[ing.id];
  if (!e || e.none || !e.alts?.length) continue;
  const chosen = e.query === queryFor(ing.id, ing.name) ? e.alts[pickFor(ing.id)] ?? e.alts[0] : e.alts[0];
  const { dl: _dl, ...shipped } = chosen;
  ing.photo = { provider: "pexels", ...shipped };
  withPhoto++;
}

// Pass 2: edges.
const edges = new Map(); // "a|b" sorted -> { a, b, tier, listed: number }
const unknown = new Map();
let disagreements = 0;
let dishMentions = 0;
const aliasIndex = new Map();
for (const ing of ingredients) for (const a of ing.aliases) aliasIndex.set(slug(a), ing.id);
function resolve(tok) {
  if (byId.has(tok)) return { kind: "ingredient", id: tok };
  if (ALIASES[tok] && byId.has(ALIASES[tok])) return { kind: "ingredient", id: ALIASES[tok] };
  if (aliasIndex.has(tok)) return { kind: "ingredient", id: aliasIndex.get(tok) };
  if (DISHES[tok]) return { kind: "dish", id: tok };
  if (DROP.has(tok)) return { kind: "drop" };
  return { kind: "unknown" };
}
for (const [id, src] of Object.entries(raw)) {
  for (const tok of (src.pairs || "").split(/\s+/).filter(Boolean)) {
    const m = tok.match(/^(.+?):([1-4])$/);
    if (!m) throw new Error(`${id}: bad pair token "${tok}"`);
    const [, name, t] = m;
    const r = resolve(name);
    if (r.kind === "unknown") { unknown.set(name, (unknown.get(name) ?? 0) + 1); continue; }
    if (r.kind === "drop") continue;
    if (r.kind === "dish") { dishMentions++; const ing = byId.get(id); if (!ing.dishes.includes(r.id)) ing.dishes.push(dishNode(r.id)); continue; }
    if (r.id === id) continue;
    const [a, b] = [id, r.id].sort();
    const key = `${a}|${b}`;
    const tier = Number(t);
    const e = edges.get(key);
    if (!e) edges.set(key, { a, b, tier, listed: 1 });
    else { if (e.tier !== tier) disagreements++; e.tier = Math.max(e.tier, tier); e.listed++; }
  }
}

// Adjacency, degree, hubs.
const adj = new Map(ingredients.map((i) => [i.id, new Set()]));
for (const e of edges.values()) { adj.get(e.a).add(e.b); adj.get(e.b).add(e.a); }
for (const ing of ingredients) ing.degree = adj.get(ing.id).size;
const hubs = [...ingredients].sort((x, y) => y.degree - x.degree).slice(0, HUB_COUNT).map((i) => i.id);
for (const id of hubs) byId.get(id).hub = true;

// Shared-partner count and reason type per edge.
function reasonType(a, b, tier) {
  if (tier >= 3) return "classic";
  const ta = byId.get(a).taste, tb = byId.get(b).taste;
  const shared = TASTES.find((t) => ta[t] >= 2 && tb[t] >= 2);
  if (shared) return `shared-${shared}`;
  const contrast = (ta.sweet >= 2 && (tb.sour >= 2 || tb.salty >= 2 || tb.bitter >= 2)) || (tb.sweet >= 2 && (ta.sour >= 2 || ta.salty >= 2 || ta.bitter >= 2));
  if (contrast) return "contrast";
  const ca = byId.get(a).cuisines, cb = byId.get(b).cuisines;
  const cuisine = Object.keys(ca).find((c) => ca[c] >= 2 && cb[c] >= 2);
  if (cuisine) return `cuisine-${cuisine}`;
  return "works";
}
const index = new Map(ingredients.map((i, n) => [i.id, n]));
const edgeRows = [];
for (const e of edges.values()) {
  let shared = 0;
  const sa = adj.get(e.a), sb = adj.get(e.b);
  const [small, big] = sa.size < sb.size ? [sa, sb] : [sb, sa];
  for (const x of small) if (big.has(x)) shared++;
  const reason = REASONS[`${e.a}|${e.b}`] ?? REASONS[`${e.b}|${e.a}`] ?? null;
  edgeRows.push([index.get(e.a), index.get(e.b), e.tier, shared, reasonType(e.a, e.b, e.tier), reason]);
}

// Combos: drop any that reference an unknown ingredient, report them.
const badCombos = [];
const combos = COMBOS.map((c) => ({ ingredients: c.ingredients.map((x) => (byId.has(x) ? x : ALIASES[x])), origin: c.origin }))
  .filter((c) => { const ok = c.ingredients.every((x) => x && byId.has(x)); if (!ok) badCombos.push(c); return ok; });

const graph = {
  version: "2026.10.20",
  generated: new Date().toISOString(),
  categories: CATEGORIES,
  cuisines: CUISINES,
  tastes: TASTES,
  hubs,
  ingredients,
  dishes: [...dishes].map(([id, name]) => ({ id, name })),
  edges: edgeRows,
  combos,
};
mkdirSync(join(root, "public"), { recursive: true });
const json = JSON.stringify(graph);
writeFileSync(join(root, "public", "graph.json"), json);

// Translations: one overlay file per language, applied in the browser on top of graph.json.
function overlay({ names, descriptions, terms }) {
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const word = (w) => terms.ORIGIN_WORDS[w] ?? (terms.CHIPS[w] ? cap1(terms.CHIPS[w]) : null);
  const origins = {};
  for (const c of combos) {
    const parts = c.origin.split(" · ");
    const out = parts.map((p, i) => word(p) ?? (i === 0 ? null : p));
    if (out[0] == null) throw new Error(`no translation for combo origin "${c.origin}"`);
    origins[c.origin] = cap1(out.join(" · "));
  }
  const chips = {};
  for (const ing of ingredients) for (const ch of ing.chips) { if (!terms.CHIPS[ch]) throw new Error(`no translation for region "${ch}"`); chips[ch] = cap1(terms.CHIPS[ch]); }
  const techniques = {};
  for (const ing of ingredients) for (const tq of ing.techniques) { if (!terms.TECHNIQUES[tq]) throw new Error(`no translation for technique "${tq}"`); techniques[tq] = terms.TECHNIQUES[tq]; }
  const dishNames = {};
  for (const [id] of dishes) { if (!terms.DISHES[id]) throw new Error(`no translation for dish "${id}"`); dishNames[id] = terms.DISHES[id]; }
  for (const ing of ingredients) {
    if (!names[ing.id]) throw new Error(`no translated name for "${ing.id}"`);
    if (ing.description && !descriptions[ing.id]) throw new Error(`no translated description for "${ing.id}"`);
  }
  const reasons = {};
  for (const [k, v] of Object.entries(terms.REASONS)) reasons[k.split("|").sort().join("|")] = v;
  for (const c of CUISINES) if (!terms.CUISINES[c.id]) throw new Error(`no translation for cuisine "${c.id}"`);
  return { names, descriptions, dishes: dishNames, cuisines: Object.fromEntries(Object.entries(terms.CUISINES).map(([k, v]) => [k, cap1(v)])), chips, techniques, origins, reasons };
}
mkdirSync(join(root, "public", "i18n"), { recursive: true });
writeFileSync(join(root, "public", "i18n", "sl.json"), JSON.stringify(overlay({ names: slNames, descriptions: { ...slDescA, ...slDescB, ...slDescC }, terms: slTerms })));

// Report.
const tiers = [0, 0, 0, 0, 0];
for (const e of edges.values()) tiers[e.tier]++;
const sparse = ingredients.filter((i) => i.degree < 6).map((i) => `${i.id}(${i.degree})`);
console.log(`graph.json: ${ingredients.length} ingredients, ${edges.size} edges, ${dishes.size} dishes, ${combos.length} combos, ${(json.length / 1024).toFixed(0)} KB`);
console.log(`tiers: works ${tiers[1]}, recommended ${tiers[2]}, highly ${tiers[3]}, holy grail ${tiers[4]}; two-way listings with different tiers: ${disagreements}; dish mentions folded in: ${dishMentions}`);
console.log(`photos: ${withPhoto}, hand-drawn art: ${withArt} of ${ingredients.length} ingredients`);
console.log(`hubs: ${hubs.slice(0, 10).map((h) => `${h}(${byId.get(h).degree})`).join(" ")} …`);
const undescribed = ingredients.filter((i) => !i.description).map((i) => i.id);
if (undescribed.length) console.log(`no description: ${undescribed.join(" ")}`);
if (sparse.length) console.log(`sparse (<6 partners): ${sparse.join(" ")}`);
if (badCombos.length) console.log(`combos dropped: ${badCombos.map((c) => c.ingredients.join("+")).join(", ")}`);
if (unknown.size) console.log(`unknown tokens dropped: ${[...unknown].sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k}×${v}`).join(" ")}`);
