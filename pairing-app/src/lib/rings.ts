import type { Partner, PartnerResult } from "./types";
import { CATEGORY_ORDER } from "./labels";
import { RING_CAP } from "./config";

export type RingNode = {
  partner: Partner;
  ring: 0 | 1 | 2;
  angle: number; // radians, -π/2 is 12 o'clock
  x: number;
  y: number;
  faded: boolean;
};
export type Ring = { index: 0 | 1 | 2; radius: number; nodes: RingNode[]; overflow: number; plus: { x: number; y: number } | null };
export type RingLayout = { rings: Ring[]; size: number };

export const RING_RADII = [100, 174, 248];
const SIX_OCLOCK = Math.PI / 2;

/**
 * F4 ring placement. Ring by shown tier: 4 and 3 inner, 2 middle, 1 outer; partial matches always outer and faded.
 * Within a ring, nodes are sorted by category in the fixed order then by shared count; capped at 24 with the
 * overflow collapsed into a "+N" node at 6 o'clock.
 */
export function layoutRings(result: PartnerResult, cap = RING_CAP): RingLayout {
  const buckets: { partner: Partner; faded: boolean }[][] = [[], [], []];
  for (const p of result.full) buckets[p.tier >= 3 ? 0 : p.tier === 2 ? 1 : 2].push({ partner: p, faded: false });
  for (const p of result.partial) buckets[2].push({ partner: p, faded: true });
  const rings = buckets.map((items, index) => {
    const radius = RING_RADII[index];
    // Full matches first, then partials; within each by shared count, so the cap keeps the strongest.
    const ranked = [...items].sort((x, y) => Number(x.faded) - Number(y.faded) || y.partner.shared - x.partner.shared);
    const shown = ranked.slice(0, cap);
    const overflow = items.length - shown.length;
    shown.sort((x, y) => Number(x.faded) - Number(y.faded) || CATEGORY_ORDER.indexOf(x.partner.ing.cat) - CATEGORY_ORDER.indexOf(y.partner.ing.cat) || y.partner.shared - x.partner.shared);
    const slots = shown.length + (overflow > 0 ? 1 : 0);
    const nodes: RingNode[] = [];
    let plus: Ring["plus"] = null;
    if (slots > 0) {
      const step = (2 * Math.PI) / slots;
      // The slot nearest 6 o'clock is reserved for the "+N" node.
      let plusSlot = -1;
      if (overflow > 0) {
        let best = Infinity;
        for (let s = 0; s < slots; s++) { const d = Math.abs(angleAt(s, step) - SIX_OCLOCK); if (d < best) { best = d; plusSlot = s; } }
      }
      let i = 0;
      for (let s = 0; s < slots; s++) {
        const angle = angleAt(s, step);
        const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
        if (s === plusSlot) { plus = { x, y }; continue; }
        const item = shown[i++];
        nodes.push({ partner: item.partner, ring: index as 0 | 1 | 2, angle, x, y, faded: item.faded });
      }
    }
    return { index: index as 0 | 1 | 2, radius, nodes, overflow, plus };
  });
  return { rings, size: (RING_RADII[2] + 84) * 2 };
}

function angleAt(slot: number, step: number): number { return -Math.PI / 2 + slot * step; }

/** Where a node's label goes relative to its dot, so text reads outward from the centre. */
export function labelPlacement(angle: number): { anchor: "start" | "middle" | "end"; dx: number; dy: number } {
  const c = Math.cos(angle), s = Math.sin(angle);
  // Labels read outward: right half starts after the dot, left half ends before it. Only the nodes
  // within a few degrees of 12 and 6 o'clock sit above or below, so neighbours never overlap.
  if (Math.abs(c) < 0.09) return { anchor: "middle", dx: 0, dy: s < 0 ? -10 : 18 };
  const lift = Math.abs(c) < 0.5 ? (s < 0 ? -6 : 10) : 4;
  return c > 0 ? { anchor: "start", dx: 9, dy: lift } : { anchor: "end", dx: -9, dy: lift };
}
