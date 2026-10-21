import type { Category, Partner, PartnerResult } from "./types";
import { CATEGORY_ORDER } from "./labels";
import { RING_CAP } from "./config";

/*
 * The Flavour Wheel layout. Categories are wedges in the fixed order around the hub (herbs at 12 o'clock,
 * clockwise); tiers are rings. A wedge's angular width follows how many partners it holds on this map, with a
 * sliver kept for empty categories so the order never changes. Within a wedge, a ring's partners are spread
 * evenly. F4 still holds: tier 4 and 3 inner, 2 middle, 1 outer, partials always outer and faded, 24 per ring
 * with the overflow collapsed into a "+N" tab at the ring's end.
 */
export type WheelNode = {
  partner: Partner;
  ring: 0 | 1 | 2;
  angle: number;
  x: number;
  y: number;
  faded: boolean;
};
export type Wedge = { cat: Category; start: number; end: number; count: number };
export type Ring = { index: 0 | 1 | 2; radius: number; nodes: WheelNode[]; overflow: number; plus: { x: number; y: number } | null };
export type WheelLayout = { rings: Ring[]; wedges: Wedge[]; nodes: WheelNode[]; size: number; hub: number; rim: number };

export const HUB_R = 72;
export const RING_RADII = [152, 228, 304];
export const RIM_R = 340;
const EMPTY_WEDGE = 0.035; // radians kept for a category with nothing on this map
const WEDGE_PAD = 0.05;
const MIN_ARC = 46;

export function layoutWheel(result: PartnerResult, cap = RING_CAP): WheelLayout {
  const buckets: { partner: Partner; faded: boolean }[][] = [[], [], []];
  for (const p of result.full) buckets[p.tier >= 3 ? 0 : p.tier === 2 ? 1 : 2].push({ partner: p, faded: false });
  for (const p of result.partial) buckets[2].push({ partner: p, faded: true });

  // Cap each ring by shared count (full matches before partials), then sort the shown set by category.
  const shown = buckets.map((items) => {
    const ranked = [...items].sort((x, y) => Number(x.faded) - Number(y.faded) || y.partner.shared - x.partner.shared);
    return { items: ranked.slice(0, cap), overflow: items.length - Math.min(items.length, cap) };
  });

  // Wedge widths from what each category needs on its densest ring: nodes want at least MIN_ARC pixels of
  // arc between them, and that arc costs more angle on the inner ring than on the outer one.
  const counts = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])) as Record<Category, number>;
  const need = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, 0])) as Record<Category, number>;
  shown.forEach((ring, ri) => {
    const perCat = new Map<Category, number>();
    for (const it of ring.items) { counts[it.partner.ing.cat]++; perCat.set(it.partner.ing.cat, (perCat.get(it.partner.ing.cat) ?? 0) + 1); }
    for (const [cat, n] of perCat) need[cat] = Math.max(need[cat], (n * MIN_ARC) / RING_RADII[ri] + WEDGE_PAD * 2);
  });
  const totalNeed = Object.values(need).reduce((a, b) => a + b, 0);
  const emptyCount = CATEGORY_ORDER.filter((c) => counts[c] === 0).length;
  const free = 2 * Math.PI - emptyCount * EMPTY_WEDGE;
  const wedges: Wedge[] = [];
  let cursor = -Math.PI / 2;
  for (const cat of CATEGORY_ORDER) {
    const width = counts[cat] === 0 ? EMPTY_WEDGE : totalNeed === 0 ? free / (CATEGORY_ORDER.length - emptyCount) : (need[cat] / totalNeed) * free;
    wedges.push({ cat, start: cursor, end: cursor + width, count: counts[cat] });
    cursor += width;
  }
  const wedgeOf = Object.fromEntries(wedges.map((w) => [w.cat, w])) as Record<Category, Wedge>;

  const rings: Ring[] = shown.map((ring, index) => {
    const radius = RING_RADII[index];
    const byCat = new Map<Category, { partner: Partner; faded: boolean }[]>();
    for (const it of ring.items) { const l = byCat.get(it.partner.ing.cat) ?? []; l.push(it); byCat.set(it.partner.ing.cat, l); }
    const nodes: WheelNode[] = [];
    for (const [cat, items] of byCat) {
      items.sort((x, y) => Number(x.faded) - Number(y.faded) || y.partner.shared - x.partner.shared);
      const w = wedgeOf[cat];
      const span = Math.max(0, w.end - w.start - WEDGE_PAD * 2);
      const n = items.length;
      items.forEach((it, i) => {
        const angle = n === 1 ? (w.start + w.end) / 2 : w.start + WEDGE_PAD + (span * (i + 0.5)) / n;
        nodes.push({ partner: it.partner, ring: index as 0 | 1 | 2, angle, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, faded: it.faded });
      });
    }
    nodes.sort((a, b) => a.angle - b.angle);
    const plusAngle = Math.PI / 2;
    const plus = ring.overflow > 0 ? { x: Math.cos(plusAngle) * (radius + 24), y: Math.sin(plusAngle) * (radius + 24) } : null;
    return { index: index as 0 | 1 | 2, radius, nodes, overflow: ring.overflow, plus };
  });
  return { rings, wedges, nodes: rings.flatMap((r) => r.nodes), size: (RIM_R + 36) * 2, hub: HUB_R, rim: RIM_R };
}

/** Where a node's label goes relative to its mark, reading outward from the hub. */
export function labelPlacement(angle: number, offset: number): { anchor: "start" | "middle" | "end"; dx: number; dy: number } {
  const c = Math.cos(angle), s = Math.sin(angle);
  if (Math.abs(c) < 0.18) return { anchor: "middle", dx: 0, dy: s < 0 ? -(offset + 4) : offset + 12 };
  const lift = Math.abs(c) < 0.55 ? (s < 0 ? -5 : 9) : 4;
  return c > 0 ? { anchor: "start", dx: offset + 4, dy: lift } : { anchor: "end", dx: -(offset + 4), dy: lift };
}

/** A slightly hand-drawn circle: the ring guides are pencil lines, not compass lines. */
export function wobblyCircle(r: number, seed = 1, wobble = 1.6, steps = 72): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const n = Math.sin(a * 3 + seed) * wobble + Math.cos(a * 7 + seed * 2) * (wobble * 0.5);
    const rr = r + n;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

export function arcPath(r1: number, r2: number, a1: number, a2: number): string {
  const large = a2 - a1 > Math.PI ? 1 : 0;
  const p = (r: number, a: number) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  return `M ${p(r1, a1)} L ${p(r2, a1)} A ${r2} ${r2} 0 ${large} 1 ${p(r2, a2)} L ${p(r1, a2)} A ${r1} ${r1} 0 ${large} 0 ${p(r1, a1)} Z`;
}
