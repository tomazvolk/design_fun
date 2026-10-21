"use client";

import { useCallback, useRef, useState } from "react";
import type { Ingredient } from "@/lib/types";
import { arcPath, labelPlacement, wobblyCircle, type WheelLayout } from "@/lib/rings";
import { CATEGORY_SHORT, CATEGORY_TINT } from "@/lib/labels";
import { ArtGlyph } from "./illustrations";

const DISC = { small: 11, medium: 14, large: 18 } as const;
const GLYPH = { small: 15, medium: 19, large: 25 } as const;

type Props = {
  layout: WheelLayout;
  anchors: Ingredient[];
  onTap: (id: string) => void;
  onDoubleTap: (id: string) => void;
  onPlus: (ring: 0 | 1 | 2) => void;
  onCentre: () => void;
};

/**
 * The Flavour Wheel. Pastel wedges by category behind three pencil rings; every partner is its line drawing
 * on a tinted disc; the hub carries the anchors drawn large. Nodes keep their identity across layouts, so when
 * an anchor is added or removed each drawing glides to its new ring and wedge (the one authored motion).
 * Pinch to zoom, drag to pan, tap for the card, double-tap to add as an anchor.
 */
export function RingMap({ layout, anchors, onTap, onDoubleTap, onPlus, onCentre }: Props) {
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ start: { x: number; y: number; k: number }; mid: { x: number; y: number }; dist: number; moved: boolean } | null>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);
  const tapTimer = useRef<number | null>(null);
  const size = layout.size;
  const half = size / 2;

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const mid = pts.length > 1 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0];
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { start: { ...view }, mid, dist, moved: gesture.current?.moved ?? false };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length === 1) {
      const dx = pts[0].x - g.mid.x, dy = pts[0].y - g.mid.y;
      if (!g.moved && Math.hypot(dx, dy) > 6) { g.moved = true; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); }
      if (g.moved) setView({ x: g.start.x + dx, y: g.start.y + dy, k: g.start.k });
    } else {
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const k = Math.min(3, Math.max(0.6, g.start.k * (dist / Math.max(1, g.dist))));
      if (!g.moved) { g.moved = true; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); }
      setView({ x: g.start.x + (mid.x - g.mid.x), y: g.start.y + (mid.y - g.mid.y), k });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) { const moved = gesture.current?.moved; gesture.current = null; setDragging(false); if (moved) lastTap.current = null; }
    else { const pts = [...pointers.current.values()]; gesture.current = { start: { ...view }, mid: pts[0], dist: 0, moved: true }; }
  };
  const onWheel = (e: React.WheelEvent) => { const k = Math.min(3, Math.max(0.6, view.k * (e.deltaY < 0 ? 1.1 : 0.9))); setView((v) => ({ ...v, k })); };

  const tapNode = useCallback((id: string) => {
    if (gesture.current?.moved) return;
    const now = Date.now();
    if (lastTap.current && lastTap.current.id === id && now - lastTap.current.t < 320) {
      if (tapTimer.current) window.clearTimeout(tapTimer.current);
      tapTimer.current = null; lastTap.current = null;
      onDoubleTap(id);
      return;
    }
    lastTap.current = { id, t: now };
    if (tapTimer.current) window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => { tapTimer.current = null; onTap(id); }, 280);
  }, [onTap, onDoubleTap]);

  const hubR = layout.hub;
  const multi = anchors.length > 1;
  const hubSlots = anchors.slice(0, 5).map((a, i, arr) => {
    if (arr.length === 1) return { a, x: 0, y: -6, s: 64 };
    const ang = -Math.PI / 2 + (i / arr.length) * Math.PI * 2;
    const r = arr.length === 2 ? 20 : 26;
    return { a, x: Math.cos(ang) * r, y: Math.sin(ang) * r - 4, s: arr.length === 2 ? 34 : 26 };
  });

  return (
    <svg
      viewBox={`${-half} ${-half} ${size} ${size}`}
      className="h-full w-full touch-none select-none"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel}
      role="group" aria-label="Pairing wheel"
    >
      <g style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transition: dragging ? "none" : "transform 160ms ease" }}>
        {/* wedges: category tints, inner edge at the hub, outer edge past the last ring */}
        {layout.wedges.map((w) => (
          <path key={w.cat} d={arcPath(hubR + 8, layout.rim, w.start, w.end)} fill={CATEGORY_TINT[w.cat]} fillOpacity={w.count > 0 ? 0.55 : 0.25} stroke="var(--paper)" strokeWidth={2} />
        ))}
        {/* category names along the rim */}
        <defs>
          {layout.wedges.map((w) => {
            const r = layout.rim + 12;
            const p = (a: number) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
            const mid = (w.start + w.end) / 2;
            const flip = Math.sin(mid) > 0.15; // bottom half reads the other way
            const a1 = flip ? w.end : w.start, a2 = flip ? w.start : w.end;
            return <path key={w.cat} id={`rim-${w.cat}`} d={`M ${p(a1)} A ${r} ${r} 0 ${Math.abs(w.end - w.start) > Math.PI ? 1 : 0} ${flip ? 0 : 1} ${p(a2)}`} fill="none" />;
          })}
        </defs>
        {layout.wedges.filter((w) => w.count > 0 && w.end - w.start > 0.22).map((w) => (
          <text key={w.cat} className="wedge-label" dy={Math.sin((w.start + w.end) / 2) > 0.15 ? -4 : 9}>
            <textPath href={`#rim-${w.cat}`} startOffset="50%" textAnchor="middle">{CATEGORY_SHORT[w.cat]}</textPath>
          </text>
        ))}
        {/* pencil rings */}
        {layout.rings.map((ring, i) => (
          <path key={ring.index} d={wobblyCircle(ring.radius, i + 1)} fill="none" stroke="var(--ink)" strokeOpacity={0.28} strokeWidth={1.1} strokeDasharray={i === 0 ? undefined : "3 4"} />
        ))}
        {/* hub: the anchors, drawn */}
        <g className="cursor-pointer" onClick={() => { if (!gesture.current?.moved) onCentre(); }} role="button" aria-label={multi ? `${anchors.length} anchors` : anchors[0]?.name}>
          <circle r={hubR + 3} fill="var(--card)" stroke="var(--ink)" strokeWidth={1.4} />
          <path d={wobblyCircle(hubR - 5, 9, 1)} fill="none" stroke="var(--ink)" strokeOpacity={0.35} strokeWidth={1} />
          <g className="text-ink">
            {hubSlots.map((s) => <ArtGlyph key={s.a.id} art={s.a.art} cat={s.a.cat} x={s.x} y={s.y} size={s.s} strokeWidth={s.s > 40 ? 2.2 : 2.6} />)}
          </g>
          <text y={multi ? hubR - 14 : hubR - 16} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--ink)" fontFamily="var(--font-sans)">
            {multi ? `${anchors.length} anchors` : anchors[0] ? (anchors[0].name.length > 13 ? anchors[0].name.slice(0, 12) + "…" : anchors[0].name) : ""}
          </text>
        </g>
        {/* partners: drawings on tinted discs, keyed by id so they glide between layouts */}
        {layout.nodes.map((n) => {
          const r = DISC[n.partner.size];
          // Dense rings (more than 14 nodes) take radial labels, read outward like the rim names, so neighbours never overlap.
          const radial = layout.rings[n.ring].nodes.length > 14;
          const left = Math.cos(n.angle) < 0;
          const p = radial ? { anchor: (left ? "end" : "start") as "start" | "end", dx: left ? -(r + 5) : r + 5, dy: 4 } : labelPlacement(n.angle, r);
          const deg = (n.angle * 180) / Math.PI + (radial && left ? 180 : 0);
          const id = n.partner.ing.id;
          return (
            <g key={id} className="glide cursor-pointer" style={{ transform: `translate(${n.x}px, ${n.y}px)`, opacity: n.faded ? 0.32 : 1 }} onClick={() => tapNode(id)} role="button" aria-label={`${n.partner.ing.name}${n.faded ? ", pairs with some anchors" : ""}`}>
              <circle r={r + 12} fill="transparent" />
              <circle r={r} fill={CATEGORY_TINT[n.partner.ing.cat]} stroke="var(--ink)" strokeWidth={n.partner.size === "large" ? 1.4 : 1} />
              <g className="text-ink"><ArtGlyph art={n.partner.ing.art} cat={n.partner.ing.cat} size={GLYPH[n.partner.size]} strokeWidth={2.8} /></g>
              <text x={p.dx} y={p.dy} textAnchor={p.anchor} transform={radial ? `rotate(${deg})` : undefined} fontSize={11} fontWeight={n.partner.size === "small" ? 500 : 700} fill="var(--ink)" fontFamily="var(--font-sans)" paintOrder="stroke" stroke="var(--paper)" strokeWidth={3.5} strokeLinejoin="round" strokeOpacity={0.9}>
                {n.partner.ing.name}
              </text>
            </g>
          );
        })}
        {layout.rings.map((ring) => ring.plus && (
          <g key={`plus-${ring.index}`} className="cursor-pointer" style={{ transform: `translate(${ring.plus.x}px, ${ring.plus.y}px)` }} onClick={() => { if (!gesture.current?.moved) onPlus(ring.index); }} role="button" aria-label={`${ring.overflow} more in this ring`}>
            <rect x={-20} y={-11} width={40} height={22} rx={11} fill="var(--card)" stroke="var(--ink)" strokeWidth={1.2} />
            <text y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">+{ring.overflow}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
