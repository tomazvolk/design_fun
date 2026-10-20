import type { Bridge, Category, Combo, Cuisine, Edge, Filters, GraphJson, Ingredient, Partner, PartnerResult, SearchResult, Season, Tier } from "./types";
import { CATEGORY_ORDER, SEASONS } from "./labels";

export const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/['’]/g, "").trim();

/**
 * The pairing graph held in memory: ~300 nodes and ~12,000 undirected edges with adjacency maps,
 * so every query the UI needs (F1 search, F3 partners, F7 bridges) is a few map lookups.
 */
export class PairingGraph {
  readonly version: string;
  readonly ingredients: Ingredient[];
  readonly cuisines: Cuisine[];
  readonly combos: Combo[];
  readonly hubs: Set<string>;
  readonly byId = new Map<string, Ingredient>();
  readonly dishes = new Map<string, string>();
  readonly adj = new Map<string, Map<string, Edge>>();
  private searchIndex: { key: string; result: SearchResult }[] = [];

  constructor(json: GraphJson) {
    this.version = json.version;
    this.ingredients = json.ingredients;
    this.cuisines = json.cuisines;
    this.combos = json.combos;
    this.hubs = new Set(json.hubs);
    for (const d of json.dishes) this.dishes.set(d.id, d.name);
    for (const ing of this.ingredients) {
      this.byId.set(ing.id, ing);
      this.adj.set(ing.id, new Map());
    }
    for (const [ai, bi, tier, shared, reasonType, reason] of json.edges) {
      const a = this.ingredients[ai].id, b = this.ingredients[bi].id;
      const edge: Edge = { a, b, tier, shared, reasonType, reason };
      this.adj.get(a)!.set(b, edge);
      this.adj.get(b)!.set(a, edge);
    }
    for (const ing of this.ingredients) {
      this.searchIndex.push({ key: normalize(ing.name), result: { kind: "ingredient", id: ing.id, name: ing.name, cat: ing.cat } });
      for (const alias of ing.aliases) this.searchIndex.push({ key: normalize(alias), result: { kind: "ingredient", id: ing.id, name: ing.name, via: alias, cat: ing.cat } });
    }
    for (const c of this.cuisines) this.searchIndex.push({ key: normalize(c.name), result: { kind: "cuisine", id: c.id, name: c.name } });
    for (const [id, name] of this.dishes) this.searchIndex.push({ key: normalize(name), result: { kind: "dish", id, name } });
  }

  get(id: string): Ingredient | undefined { return this.byId.get(id); }
  edge(a: string, b: string): Edge | undefined { return this.adj.get(a)?.get(b); }
  partnersOf(id: string): Edge[] { return [...(this.adj.get(id)?.values() ?? [])]; }

  /** F1: prefix first, then substring; case and accent insensitive; ingredients before cuisines and dishes; max 8. */
  search(query: string, limit = 8): SearchResult[] {
    const q = normalize(query);
    if (!q) return [];
    const seen = new Set<string>();
    const rank = (kind: SearchResult["kind"]) => (kind === "ingredient" ? 0 : kind === "cuisine" ? 1 : 2);
    const pick = (test: (key: string) => boolean) =>
      this.searchIndex
        .filter((e) => test(e.key))
        .sort((x, y) => rank(x.result.kind) - rank(y.result.kind) || (("via" in x.result && x.result.via) ? 1 : 0) - (("via" in y.result && y.result.via) ? 1 : 0) || x.key.length - y.key.length)
        .map((e) => e.result)
        .filter((r) => { const k = `${r.kind}:${r.id}`; if (seen.has(k)) return false; seen.add(k); return true; });
    const prefix = pick((k) => k.startsWith(q));
    const words = pick((k) => k.split(/[\s-]/).some((w) => w.startsWith(q)));
    const sub = pick((k) => k.includes(q));
    return [...prefix, ...words, ...sub].slice(0, limit);
  }

  /** The three closest ingredient names for the "no match" state. */
  closest(query: string, n = 3): Ingredient[] {
    const q = normalize(query);
    const scored = this.ingredients.map((ing) => ({ ing, d: levenshtein(q, normalize(ing.name)) }));
    scored.sort((x, y) => x.d - y.d || x.ing.name.length - y.ing.name.length);
    return scored.slice(0, n).map((s) => s.ing);
  }

  /** F3 + F5: partners of the anchor set with filters applied; F7 bridges when the intersection is empty. */
  partners(anchorIds: string[], filters: Filters): PartnerResult {
    const anchors = anchorIds.map((id) => this.byId.get(id)).filter((x): x is Ingredient => !!x);
    const anchorSet = new Set(anchors.map((a) => a.id));
    const full: Partner[] = [], partial: Partner[] = [];
    let filteredOut = 0;
    if (anchors.length === 0) return { anchors, full, partial, bridges: [], filteredOut };

    const candidates = new Map<string, Record<string, Edge>>();
    for (const a of anchors) {
      for (const [id, edge] of this.adj.get(a.id)!) {
        if (anchorSet.has(id)) continue;
        const rec = candidates.get(id) ?? {};
        rec[a.id] = edge;
        candidates.set(id, rec);
      }
    }
    const allowed = this.filterPredicate(filters);
    for (const [id, edges] of candidates) {
      const ing = this.byId.get(id)!;
      const present = Object.values(edges);
      const isFull = present.length === anchors.length;
      if (!allowed(ing)) { if (isFull) filteredOut++; continue; }
      const partner: Partner = {
        ing,
        tier: Math.min(...present.map((e) => e.tier)) as Tier,
        shared: present.reduce((s, e) => s + e.shared, 0),
        edges,
        missing: anchors.filter((a) => !edges[a.id]).map((a) => a.id),
        size: "small",
      };
      (isFull ? full : partial).push(partner);
    }
    // F4 node size: top 10% of shared-partner count for this anchor set is large, the next 30% medium.
    const ranked = [...full].sort((x, y) => y.shared - x.shared);
    ranked.forEach((p, i) => {
      const pct = i / Math.max(1, ranked.length);
      p.size = pct < 0.1 ? "large" : pct < 0.4 ? "medium" : "small";
    });
    const byOrder = (x: Partner, y: Partner) => y.tier - x.tier || CATEGORY_ORDER.indexOf(x.ing.cat) - CATEGORY_ORDER.indexOf(y.ing.cat) || y.shared - x.shared || x.ing.name.localeCompare(y.ing.name);
    full.sort(byOrder);
    partial.sort(byOrder);
    const bridges = full.length === 0 && anchors.length >= 2 ? this.bridges(anchors, allowed) : [];
    return { anchors, full, partial, bridges, filteredOut };
  }

  /** F7: two-hop bridges. X pairs with some anchors directly and reaches the rest through one partner Y. */
  private bridges(anchors: Ingredient[], allowed: (i: Ingredient) => boolean): Bridge[] {
    const anchorSet = new Set(anchors.map((a) => a.id));
    const out: Bridge[] = [];
    const touched = new Set<string>();
    for (const a of anchors) for (const id of this.adj.get(a.id)!.keys()) if (!anchorSet.has(id)) touched.add(id);
    for (const id of touched) {
      const ing = this.byId.get(id)!;
      if (!allowed(ing)) continue;
      let score = 0;
      const via: Bridge["via"] = {};
      let ok = true;
      for (const a of anchors) {
        const direct = this.adj.get(id)!.get(a.id);
        if (direct) { score += direct.tier; continue; }
        let best: { through: Ingredient; tiers: number } | null = null;
        for (const [yId, e1] of this.adj.get(id)!) {
          if (anchorSet.has(yId)) continue;
          const e2 = this.adj.get(yId)!.get(a.id);
          if (!e2) continue;
          const tiers = e1.tier + e2.tier;
          if (!best || tiers > best.tiers) best = { through: this.byId.get(yId)!, tiers };
        }
        if (!best) { ok = false; break; }
        via[a.id] = best;
        score += best.tiers / 2;
      }
      if (ok && Object.keys(via).length > 0) out.push({ ing, via, score });
    }
    out.sort((x, y) => y.score - x.score || x.ing.name.localeCompare(y.ing.name));
    return out.slice(0, 6);
  }

  private filterPredicate(f: Filters): (ing: Ingredient) => boolean {
    const seasonAll = f.seasons.length === 0 || f.seasons.length === SEASONS.length;
    const seasons = new Set(f.seasons);
    const catAll = f.categories.length === 0 || f.categories.length === CATEGORY_ORDER.length;
    const cats = new Set<Category>(f.categories);
    return (ing) => {
      if (f.hideHubs && this.hubs.has(ing.id)) return false;
      if (!catAll && !cats.has(ing.cat)) return false;
      if (!seasonAll && ing.season !== "all" && !ing.season.some((s) => seasons.has(s))) return false;
      if (f.cuisine && !(ing.cuisines[f.cuisine] >= 1)) return false;
      return true;
    };
  }

  /** Ingredients in season for a month (0-11) in a hemisphere, strongest categories first. */
  inSeason(month: number, hemisphere: "north" | "south"): Ingredient[] {
    const season = seasonForMonth(month, hemisphere);
    return this.ingredients
      .filter((i) => i.season !== "all" && i.season.includes(season))
      .sort((x, y) => CATEGORY_ORDER.indexOf(x.cat) - CATEGORY_ORDER.indexOf(y.cat) || y.degree - x.degree);
  }

  combosFor(id: string): Combo[] { return this.combos.filter((c) => c.ingredients.includes(id)); }
  ingredientsForCuisine(cuisine: string): Ingredient[] {
    return this.ingredients.filter((i) => i.cuisines[cuisine] >= 2).sort((x, y) => (y.cuisines[cuisine] ?? 0) - (x.cuisines[cuisine] ?? 0) || y.degree - x.degree);
  }
  ingredientsForDish(dish: string): Ingredient[] {
    return this.ingredients.filter((i) => i.dishes.includes(dish)).sort((x, y) => y.degree - x.degree);
  }
}

export function seasonForMonth(month: number, hemisphere: "north" | "south"): Season {
  const m = hemisphere === "south" ? (month + 6) % 12 : month;
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

let loading: Promise<PairingGraph> | null = null;
/** Fetches graph.json once per page life; the service worker serves it from cache after the first visit. */
export function loadGraph(url: string): Promise<PairingGraph> {
  if (!loading) {
    loading = fetch(url).then(async (r) => {
      if (!r.ok) throw new Error(`graph ${r.status}`);
      return new PairingGraph((await r.json()) as GraphJson);
    });
    loading.catch(() => { loading = null; });
  }
  return loading;
}
