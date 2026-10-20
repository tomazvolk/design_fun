"use client";

import { useCallback, useRef, useState } from "react";
import type { Ingredient } from "@/lib/types";
import { labelPlacement, type RingLayout } from "@/lib/rings";
import { Illustration } from "./illustrations";

const DOT = { small: 3.5, medium: 5.5, large: 8 } as const;
const FONT = { small: 11.5, medium: 12.5, large: 14 } as const;

type Props = {
  layout: RingLayout;
  anchors: Ingredient[];
  onTap: (id: string) => void;
  onDoubleTap: (id: string) => void;
  onPlus: (ring: 0 | 1 | 2) => void;
  onCentre: () => void;
};

/**
 * Screen 2: the ring map as SVG. Nodes are text labels with a small dot. Pinch to zoom, drag to pan,
 * single tap opens the card, double tap adds the node as an anchor. Rendering stays in SVG because a ring
 * never shows more than 25 nodes (PRD stack note); Canvas is the fallback, not the start.
 */
export function RingMap({ layout, anchors, onTap, onDoubleTap, onPlus, onCentre }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ start: { x: number; y: number; k: number }; mid: { x: number; y: number }; dist: number; moved: boolean } | null>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);
  const tapTimer = useRef<number | null>(null);
  const size = layout.size;
  const half = size / 2;

  const [dragging, setDragging] = useState(false);

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
      // Capture only once a drag is real: capturing on pointerdown would retarget the click and the node taps would never fire.
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
  const onWheel = (e: React.WheelEvent) => {
    const k = Math.min(3, Math.max(0.6, view.k * (e.deltaY < 0 ? 1.1 : 0.9)));
    setView((v) => ({ ...v, k }));
  };

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

  const centre = anchors[0];
  const multi = anchors.length > 1;
  return (
    <svg
      ref={svgRef}
      viewBox={`${-half} ${-half} ${size} ${size}`}
      className="h-full w-full touch-none select-none"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel}
      role="group" aria-label="Pairing map"
    >
      <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style={{ transition: dragging ? "none" : "transform 160ms ease" }}>
        {layout.rings.map((ring) => (
          <circle key={ring.index} r={ring.radius} fill="none" stroke="#d9d6d0" strokeWidth={1} />
        ))}
        {/* The anchor at the centre is drawn, not dotted. */}
        <g className="cursor-pointer" onClick={() => { if (!gesture.current?.moved) onCentre(); }} role="button" aria-label={multi ? `${anchors.length} anchors` : centre?.name}>
          <circle r={48} fill="#fff" stroke="#141414" strokeWidth={1.5} />
          {multi ? (
            <>
              <text y={-4} textAnchor="middle" fontSize={22} fontWeight={700} fontFamily="var(--font-display)" fill="#141414">{anchors.length}</text>
              <text y={14} textAnchor="middle" fontSize={10} letterSpacing={1.2} fill="#7d7a76" fontFamily="var(--font-sans)">ANCHORS</text>
            </>
          ) : centre ? (
            <>
              <foreignObject x={-30} y={-38} width={60} height={60}><div className="flex h-full w-full items-center justify-center text-ink"><Illustration art={centre.art} cat={centre.cat} size={56} strokeWidth={2.2} /></div></foreignObject>
              <text y={36} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#141414" fontFamily="var(--font-sans)">{centre.name.length > 14 ? centre.name.slice(0, 13) + "…" : centre.name}</text>
            </>
          ) : null}
        </g>
        {layout.rings.map((ring) => (
          <g key={ring.index}>
            {ring.nodes.map((n) => {
              // Dense rings (more than 14 nodes) get radial labels, read outward like spokes, so neighbours never overlap.
              const radial = ring.nodes.length > 14;
              const left = Math.cos(n.angle) < 0;
              const p = radial
                ? { anchor: (left ? "end" : "start") as "start" | "end", dx: left ? -(DOT[n.partner.size] + 5) : DOT[n.partner.size] + 5, dy: 4 }
                : labelPlacement(n.angle);
              const deg = (n.angle * 180) / Math.PI + (radial && left ? 180 : 0);
              const id = n.partner.ing.id;
              return (
                <g key={id} opacity={n.faded ? 0.3 : 1} className="cursor-pointer" onClick={() => tapNode(id)} role="button" aria-label={`${n.partner.ing.name}${n.faded ? ", pairs with some anchors" : ""}`}>
                  <circle cx={n.x} cy={n.y} r={DOT[n.partner.size] + 10} fill="transparent" />
                  <circle cx={n.x} cy={n.y} r={DOT[n.partner.size]} fill="#141414" />
                  <text x={n.x + p.dx} y={n.y + p.dy} textAnchor={p.anchor} transform={radial ? `rotate(${deg} ${n.x} ${n.y})` : undefined} fontSize={FONT[n.partner.size]} fontWeight={n.partner.size === "large" ? 700 : n.partner.size === "medium" ? 600 : 500} fill="#141414" fontFamily="var(--font-sans)" paintOrder="stroke" stroke="#f2f1ee" strokeWidth={4} strokeLinejoin="round">
                    {n.partner.ing.name}
                  </text>
                </g>
              );
            })}
            {ring.plus && (
              <g className="cursor-pointer" onClick={() => { if (!gesture.current?.moved) onPlus(ring.index); }} role="button" aria-label={`${ring.overflow} more in this ring`}>
                <circle cx={ring.plus.x} cy={ring.plus.y} r={14} fill="#f2f1ee" stroke="#141414" strokeWidth={1.2} />
                <text x={ring.plus.x} y={ring.plus.y + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="#141414" fontFamily="var(--font-sans)">+{ring.overflow}</text>
              </g>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}
