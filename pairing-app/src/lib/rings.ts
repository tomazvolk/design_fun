import type { Partner, PartnerResult } from "./types";
import { CATEGORY_ORDER, FAMILIES, familyOf } from "./labels";
import { RING_CAP } from "./config";

/*
 * The Flavour Wheel, drawn at full size and scrolled rather than shrunk to fit.
 *
 * Seven families are wedges in a fixed order clockwise from 12 o'clock, with a gap at the top that carries the
 * ring key. Tiers are rings: 4 and 3 inner, 2 middle, 1 outer, partial matches outer and faded (F4), 24 per ring.
 * Ring radii grow with how many partners a ring holds, so nodes keep at least MIN_ARC pixels between them; then
 * every label is placed greedily beside, opposite, above or below its node, wherever it collides with nothing.
 */
export type Rect = { x: number; y: number; w: number; h: number };
export type WheelLabel = { x: number; y: number; anchor: "start" | "middle" | "end"; rect: Rect };
export type WheelNode = { partner: Partner; ring: 0 | 1 | 2; angle: number; x: number; y: number; r: number; faded: boolean; label: WheelLabel };
export type Wedge = { id: string; label: string; tint: string; start: number; end: number; count: number; labelPos: { x: number; y: number; anchor: "start" | "middle" | "end" } };
export type Ring = { index: 0 | 1 | 2; radius: number; count: number; overflow: number };
export type WheelLayout = { rings: Ring[]; wedges: Wedge[]; nodes: WheelNode[]; size: number; hub: number; rim: number; gap: number; overflow: number };

export const HUB_R = 66;
export const DISC = { small: 15, medium: 18, large: 22 } as const;
export const LABEL_SIZE = 13;
const MIN_ARC = 78;
const RING_STEP = 112;
const BASE = [175, 175 + RING_STEP, 175 + RING_STEP * 2];
const GAP = 0.34;
const PAD = 0.035;
const EMPTY = 0.05;

export const textWidth = (s: string, bold: boolean) => s.length * (bold ? 7.7 : 7.1) + 2;
const hit = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const overlap = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

export function layoutWheel(result: PartnerResult, cap = RING_CAP): WheelLayout {
  const buckets: { partner: Partner; faded: boolean }[][] = [[], [], []];
  for (const p of result.full) buckets[p.tier >= 3 ? 0 : p.tier === 2 ? 1 : 2].push({ partner: p, faded: false });
  for (const p of result.partial) buckets[2].push({ partner: p, faded: true });
  const shown = buckets.map((items) => {
    const ranked = [...items].sort((x, y) => Number(x.faded) - Number(y.faded) || y.partner.shared - x.partner.shared);
    return { items: ranked.slice(0, cap), overflow: Math.max(0, items.length - cap) };
  });

  // Per ring and family counts.
  const counts = shown.map((ring) => {
    const m = new Map<string, number>();
    for (const it of ring.items) { const f = familyOf(it.partner.ing.cat).id; m.set(f, (m.get(f) ?? 0) + 1); }
    return m;
  });
  const usable = 2 * Math.PI - GAP;

  // Radii: big enough that every node gets MIN_ARC of arc, and at least RING_STEP apart.
  const radii = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const n = shown[i].items.length;
    const needed = (n * MIN_ARC) / (usable - FAMILIES.length * PAD * 2);
    radii[i] = Math.max(BASE[i], needed, i > 0 ? radii[i - 1] + RING_STEP : 0);
  }

  // Wedge widths: each family takes the angle its densest ring needs.
  const need = FAMILIES.map((f) => {
    let w = 0;
    for (let i = 0; i < 3; i++) { const n = counts[i].get(f.id) ?? 0; if (n) w = Math.max(w, (n * MIN_ARC) / radii[i] + PAD * 2); }
    return w;
  });
  const emptyCount = need.filter((w) => w === 0).length;
  const free = usable - emptyCount * EMPTY;
  const totalNeed = need.reduce((a, b) => a + b, 0) || 1;
  const rim = radii[2] + 46;
  const wedges: Wedge[] = [];
  let cursor = -Math.PI / 2 + GAP / 2;
  FAMILIES.forEach((f, i) => {
    const width = need[i] === 0 ? EMPTY : (need[i] / totalNeed) * free;
    const mid = cursor + width / 2;
    const c = Math.cos(mid);
    const lr = rim + 20;
    wedges.push({
      id: f.id, label: f.label, tint: f.tint, start: cursor, end: cursor + width,
      count: [0, 1, 2].reduce((s, r) => s + (counts[r].get(f.id) ?? 0), 0),
      labelPos: { x: Math.cos(mid) * lr, y: Math.sin(mid) * lr + 4, anchor: Math.abs(c) < 0.25 ? "middle" : c > 0 ? "start" : "end" },
    });
    cursor += width;
  });
  const wedgeOf = Object.fromEntries(wedges.map((w) => [w.id, w]));

  // Node positions: evenly through each family's wedge, in category order then shared count.
  const nodes: WheelNode[] = [];
  shown.forEach((ring, ri) => {
    const byFam = new Map<string, { partner: Partner; faded: boolean }[]>();
    for (const it of ring.items) { const f = familyOf(it.partner.ing.cat).id; const l = byFam.get(f) ?? []; l.push(it); byFam.set(f, l); }
    for (const [fid, items] of byFam) {
      items.sort((x, y) => Number(x.faded) - Number(y.faded) || CATEGORY_ORDER.indexOf(x.partner.ing.cat) - CATEGORY_ORDER.indexOf(y.partner.ing.cat) || y.partner.shared - x.partner.shared);
      const w = wedgeOf[fid];
      const span = Math.max(0, w.end - w.start - PAD * 2);
      items.forEach((it, i) => {
        const angle = w.start + PAD + (span * (i + 0.5)) / items.length;
        // stagger alternate nodes slightly in and out so neighbours' labels have more room
        const rr = radii[ri] + (items.length > 2 ? (i % 2 === 0 ? -10 : 10) : 0);
        nodes.push({ partner: it.partner, ring: ri as 0 | 1 | 2, angle, x: Math.cos(angle) * rr, y: Math.sin(angle) * rr, r: DISC[it.partner.size], faded: it.faded, label: { x: 0, y: 0, anchor: "start", rect: { x: 0, y: 0, w: 0, h: 0 } } });
      });
    }
  });

  // Labels: greedy, biggest nodes first, avoiding every disc, the hub, the ring key and labels already placed.
  const placed: Rect[] = [{ x: -HUB_R - 4, y: -HUB_R - 4, w: HUB_R * 2 + 8, h: HUB_R * 2 + 8 }];
  for (const n of nodes) placed.push({ x: n.x - n.r - 2, y: n.y - n.r - 2, w: n.r * 2 + 4, h: n.r * 2 + 4 });
  for (const r of radii) placed.push({ x: -50, y: -r - 12, w: 100, h: 24 });
  const order = [...nodes].sort((a, b) => b.r - a.r || a.ring - b.ring);
  const H = LABEL_SIZE + 4;
  for (const n of order) {
    const bold = n.partner.size !== "small";
    const w = textWidth(n.partner.ing.name, bold);
    const out = Math.cos(n.angle) >= 0 ? 1 : -1;
    const side = (dir: number): WheelLabel => dir > 0
      ? { x: n.x + n.r + 6, y: n.y + 4.5, anchor: "start", rect: { x: n.x + n.r + 5, y: n.y - H / 2, w, h: H } }
      : { x: n.x - n.r - 6, y: n.y + 4.5, anchor: "end", rect: { x: n.x - n.r - 5 - w, y: n.y - H / 2, w, h: H } };
    const above: WheelLabel = { x: n.x, y: n.y - n.r - 6, anchor: "middle", rect: { x: n.x - w / 2, y: n.y - n.r - 6 - H + 3, w, h: H } };
    const below: WheelLabel = { x: n.x, y: n.y + n.r + 15, anchor: "middle", rect: { x: n.x - w / 2, y: n.y + n.r + 3, w, h: H } };
    const radialOut = Math.sin(n.angle) < 0 ? above : below;
    const radialIn = Math.sin(n.angle) < 0 ? below : above;
    const candidates = [side(out), radialOut, side(-out), radialIn];
    const own = { x: n.x - n.r - 2, y: n.y - n.r - 2, w: n.r * 2 + 4, h: n.r * 2 + 4 };
    const others = placed.filter((p) => !(p.x === own.x && p.y === own.y && p.w === own.w));
    let best = candidates[0], bestCost = Infinity;
    for (const c of candidates) {
      const cost = others.reduce((s, p) => s + (hit(c.rect, p) ? overlap(c.rect, p) : 0), 0);
      if (cost < bestCost) { best = c; bestCost = cost; }
      if (cost === 0) break;
    }
    n.label = best;
    placed.push(best.rect);
  }
  nodes.sort((a, b) => a.ring - b.ring || a.angle - b.angle);

  const overflow = shown.reduce((s, r) => s + r.overflow, 0);
  const extent = Math.max(rim + 60, ...nodes.map((n) => Math.max(Math.abs(n.label.rect.x), Math.abs(n.label.rect.x + n.label.rect.w)) + 16), ...wedges.map((w) => Math.abs(w.labelPos.x) + w.label.length * 8 + 20));
  return {
    rings: shown.map((r, i) => ({ index: i as 0 | 1 | 2, radius: radii[i], count: r.items.length, overflow: r.overflow })),
    wedges, nodes, size: Math.ceil(extent) * 2, hub: HUB_R, rim, gap: GAP, overflow,
  };
}

/** A slightly hand-drawn circle: ring guides are pencil lines, not compass lines. */
export function wobblyCircle(r: number, seed = 1, wobble = 1.6, steps = 96): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const n = Math.sin(a * 3 + seed) * wobble + Math.cos(a * 7 + seed * 2) * (wobble * 0.5);
    pts.push(`${(Math.cos(a) * (r + n)).toFixed(1)},${(Math.sin(a) * (r + n)).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

export function arcPath(r1: number, r2: number, a1: number, a2: number): string {
  const large = a2 - a1 > Math.PI ? 1 : 0;
  const p = (r: number, a: number) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  return `M ${p(r1, a1)} L ${p(r2, a1)} A ${r2} ${r2} 0 ${large} 1 ${p(r2, a2)} L ${p(r1, a2)} A ${r1} ${r1} 0 ${large} 0 ${p(r1, a1)} Z`;
}
