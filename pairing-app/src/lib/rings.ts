import type { Partner, PartnerResult } from "./types";
import { CATEGORY_ORDER, FAMILIES, familyOf } from "./labels";

/*
 * The Flavour Wheel, drawn at full size and scrolled rather than shrunk to fit.
 *
 * Seven families are wedges in a fixed order clockwise from 12 o'clock, with a gap at the top that carries the
 * ring key. Tiers are rings: 4 and 3 inner, 2 middle, 1 outer, partial matches outer and faded (F4). Every partner
 * is shown; the wheel grows instead of hiding any.
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
const MIN_ARC = 96;      // arc length between neighbouring nodes on one track
const TRACK = 64;        // distance between tracks inside a band
const BAND_GAP = 40;     // extra space between the classic, recommended and works bands
const FIRST = 150;       // radius of the first track
const GAP = 0.34;
const PAD = 0.03;
const EMPTY = 0.05;

export const textWidth = (s: string, bold: boolean) => s.length * (bold ? 7.7 : 7.1) + 2;
const hit = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const overlap = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/**
 * Every partner is shown. A tier with many partners becomes a band of concentric tracks instead of one huge ring,
 * so the wheel stays compact: each family fills its wedge track by track from the inside out.
 */
export function layoutWheel(result: PartnerResult, cap = Infinity): WheelLayout {
  const buckets: { partner: Partner; faded: boolean }[][] = [[], [], []];
  for (const p of result.full) buckets[p.tier >= 3 ? 0 : p.tier === 2 ? 1 : 2].push({ partner: p, faded: false });
  for (const p of result.partial) buckets[2].push({ partner: p, faded: true });
  const shown = buckets.map((items) => {
    const ranked = [...items].sort((x, y) => Number(x.faded) - Number(y.faded) || y.partner.shared - x.partner.shared);
    return { items: ranked.slice(0, cap), overflow: Math.max(0, items.length - Math.min(items.length, cap)) };
  });

  // Group by band and family.
  const groups = shown.map((ring) => {
    const m = new Map<string, { partner: Partner; faded: boolean }[]>();
    for (const it of ring.items) { const f = familyOf(it.partner.ing.cat).id; const l = m.get(f) ?? []; l.push(it); m.set(f, l); }
    for (const l of m.values()) l.sort((x, y) => Number(x.faded) - Number(y.faded) || CATEGORY_ORDER.indexOf(x.partner.ing.cat) - CATEGORY_ORDER.indexOf(y.partner.ing.cat) || y.partner.shared - x.partner.shared);
    return m;
  });

  // Wedge widths follow each family's total count, with a floor so a single partner still has room.
  const usable = 2 * Math.PI - GAP;
  const totals = FAMILIES.map((f) => groups.reduce((s, m) => s + (m.get(f.id)?.length ?? 0), 0));
  const emptyCount = totals.filter((t) => t === 0).length;
  const free = usable - emptyCount * EMPTY;
  const weight = totals.map((t) => (t === 0 ? 0 : Math.sqrt(t) + 1.5));
  const totalWeight = weight.reduce((a, b) => a + b, 0) || 1;
  const wedgeList: { id: string; label: string; tint: string; start: number; end: number; count: number }[] = [];
  let cursor = -Math.PI / 2 + GAP / 2;
  FAMILIES.forEach((f, i) => {
    const width = totals[i] === 0 ? EMPTY : (weight[i] / totalWeight) * free;
    wedgeList.push({ id: f.id, label: f.label, tint: f.tint, start: cursor, end: cursor + width, count: totals[i] });
    cursor += width;
  });
  const wedgeOf = Object.fromEntries(wedgeList.map((w) => [w.id, w]));

  // Fill tracks band by band.
  const nodes: WheelNode[] = [];
  const bandRadii: number[] = [];
  let r0 = FIRST;
  shown.forEach((_, bi) => {
    let maxTracks = 1;
    for (const [fid, items] of groups[bi]) {
      const w = wedgeOf[fid];
      const span = Math.max(0.05, w.end - w.start - PAD * 2);
      let placed = 0, k = 0;
      while (placed < items.length) {
        const r = r0 + k * TRACK;
        const cap = Math.max(1, Math.floor((span * r) / MIN_ARC));
        const take = items.slice(placed, placed + cap);
        // alternate tracks are offset by half a slot so neighbours on adjacent tracks don't line up
        const offset = k % 2 === 1 && take.length > 1 ? 0.5 : 0;
        take.forEach((it, i) => {
          const angle = w.start + PAD + (span * Math.min(take.length - 0.5, i + 0.5 + offset * (i < take.length - 1 ? 1 : 0) - offset * 0)) / Math.max(1, take.length) ;
          nodes.push({ partner: it.partner, ring: bi as 0 | 1 | 2, angle, x: Math.cos(angle) * r, y: Math.sin(angle) * r, r: DISC[it.partner.size], faded: it.faded, label: { x: 0, y: 0, anchor: "start", rect: { x: 0, y: 0, w: 0, h: 0 } } });
        });
        placed += take.length;
        k++;
      }
      maxTracks = Math.max(maxTracks, k);
    }
    const centre = r0 + ((maxTracks - 1) * TRACK) / 2;
    bandRadii.push(centre);
    r0 = r0 + (maxTracks - 1) * TRACK + TRACK + BAND_GAP;
  });
  const lastTrack = Math.max(FIRST, ...nodes.map((n) => Math.hypot(n.x, n.y)));
  const rim = lastTrack + 50;
  const wedges: Wedge[] = wedgeList.map((w) => {
    const mid = (w.start + w.end) / 2, c = Math.cos(mid), lr = rim + 20;
    return { ...w, labelPos: { x: Math.cos(mid) * lr, y: Math.sin(mid) * lr + 4, anchor: Math.abs(c) < 0.25 ? "middle" : c > 0 ? "start" : "end" } };
  });

  // Labels: greedy, biggest nodes first, avoiding every disc, the hub, the band keys and labels already placed.
  const placedRects: Rect[] = [{ x: -HUB_R - 4, y: -HUB_R - 4, w: HUB_R * 2 + 8, h: HUB_R * 2 + 8 }];
  for (const n of nodes) placedRects.push({ x: n.x - n.r - 2, y: n.y - n.r - 2, w: n.r * 2 + 4, h: n.r * 2 + 4 });
  for (const r of bandRadii) placedRects.push({ x: -55, y: -r - 12, w: 110, h: 24 });
  const H = LABEL_SIZE + 4;
  for (const n of [...nodes].sort((a, b) => b.r - a.r || a.ring - b.ring)) {
    const w = textWidth(n.partner.ing.name, n.partner.size !== "small");
    const out = Math.cos(n.angle) >= 0 ? 1 : -1;
    const side = (dir: number): WheelLabel => dir > 0
      ? { x: n.x + n.r + 6, y: n.y + 4.5, anchor: "start", rect: { x: n.x + n.r + 5, y: n.y - H / 2, w, h: H } }
      : { x: n.x - n.r - 6, y: n.y + 4.5, anchor: "end", rect: { x: n.x - n.r - 5 - w, y: n.y - H / 2, w, h: H } };
    const above: WheelLabel = { x: n.x, y: n.y - n.r - 6, anchor: "middle", rect: { x: n.x - w / 2, y: n.y - n.r - 6 - H + 3, w, h: H } };
    const below: WheelLabel = { x: n.x, y: n.y + n.r + 15, anchor: "middle", rect: { x: n.x - w / 2, y: n.y + n.r + 3, w, h: H } };
    const shift = (l: WheelLabel, dy: number): WheelLabel => ({ ...l, y: l.y + dy, rect: { ...l.rect, y: l.rect.y + dy } });
    const candidates = [side(out), Math.sin(n.angle) < 0 ? above : below, side(-out), Math.sin(n.angle) < 0 ? below : above,
      shift(side(out), -14), shift(side(out), 14), shift(side(-out), -14), shift(side(-out), 14)];
    const own = { x: n.x - n.r - 2, y: n.y - n.r - 2 };
    const others = placedRects.filter((p) => !(p.x === own.x && p.y === own.y));
    let best = candidates[0], bestCost = Infinity;
    for (const c of candidates) {
      const cost = others.reduce((s, p) => s + (hit(c.rect, p) ? overlap(c.rect, p) : 0), 0);
      if (cost < bestCost) { best = c; bestCost = cost; }
      if (cost === 0) break;
    }
    n.label = best;
    placedRects.push(best.rect);
  }
  nodes.sort((a, b) => a.ring - b.ring || a.angle - b.angle);

  const overflow = shown.reduce((s, r) => s + r.overflow, 0);
  const extent = Math.max(rim + 60, ...nodes.map((n) => Math.max(Math.abs(n.label.rect.x), Math.abs(n.label.rect.x + n.label.rect.w)) + 16), ...wedges.map((w) => Math.abs(w.labelPos.x) + w.label.length * 8 + 20));
  return {
    rings: shown.map((r, i) => ({ index: i as 0 | 1 | 2, radius: bandRadii[i], count: r.items.length, overflow: r.overflow })),
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
