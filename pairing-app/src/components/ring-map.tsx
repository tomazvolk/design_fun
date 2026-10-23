"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LocateFixedIcon, MinusIcon, PlusIcon } from "lucide-react";
import type { Ingredient } from "@/lib/types";
import { arcPath, LABEL_SIZE, wobblyCircle, type WheelLayout } from "@/lib/rings";
import { CATEGORY_TINT } from "@/lib/labels";
import { ArtGlyph } from "./illustrations";
import { photoUrl } from "@/lib/photo";

const GLYPH = { small: 20, medium: 24, large: 30 } as const;
const ZOOMS = [0.55, 0.75, 1, 1.3];
const RING_KEY = ["Classic", "Recommended", "Works"];

type Props = {
  layout: WheelLayout;
  anchors: Ingredient[];
  onTap: (id: string) => void;
  onDoubleTap: (id: string) => void;
  onCentre: () => void;
};

/**
 * The Flavour Wheel at full size inside a scroll area: the wheel is bigger than the screen and you scroll
 * to the family you care about. It opens centred on the anchors; zoom steps and a recentre button sit in
 * the corner. Partners keep their identity across layouts, so changing anchors glides each drawing to its
 * new place. Tap opens the card, double-tap adds the partner as an anchor.
 */
export function RingMap({ layout, anchors, onTap, onDoubleTap, onCentre }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [zoomIndex, setZoomIndex] = useState(2);
  const zoom = ZOOMS[zoomIndex];
  const px = Math.round(layout.size * zoom);
  const lastTap = useRef<{ id: string; t: number } | null>(null);
  const tapTimer = useRef<number | null>(null);
  const anchorKey = anchors.map((a) => a.id).join(",");

  const centre = useCallback((smooth = false) => {
    const el = box.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth - el.clientWidth) / 2, top: (el.scrollHeight - el.clientHeight) / 2, behavior: smooth ? "smooth" : "auto" });
  }, []);
  // Open on the hub, and return to it whenever the anchor set changes.
  useLayoutEffect(() => { centre(); }, [anchorKey, centre]);

  // Keep the point under the middle of the screen fixed when zooming.
  const prevPx = useRef(px);
  useEffect(() => {
    const el = box.current;
    if (!el || prevPx.current === px) return;
    const ratio = px / prevPx.current;
    const cx = el.scrollLeft + el.clientWidth / 2, cy = el.scrollTop + el.clientHeight / 2;
    el.scrollTo({ left: cx * ratio - el.clientWidth / 2, top: cy * ratio - el.clientHeight / 2 });
    prevPx.current = px;
  }, [px]);

  const tapNode = useCallback((id: string) => {
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

  const half = layout.size / 2;
  const hubR = layout.hub;
  const multi = anchors.length > 1;
  const hubSlots = anchors.slice(0, 5).map((a, i, arr) => {
    if (arr.length === 1) return { a, x: 0, y: -8, s: 72 };
    const ang = -Math.PI / 2 + (i / arr.length) * Math.PI * 2;
    const r = arr.length === 2 ? 22 : 28;
    return { a, x: Math.cos(ang) * r, y: Math.sin(ang) * r - 6, s: arr.length === 2 ? 38 : 28 };
  });

  return (
    <div className="relative h-full w-full">
      <div ref={box} className="no-scrollbar h-full w-full overflow-auto overscroll-contain" style={{ touchAction: "pan-x pan-y" }}>
        <svg width={px} height={px} viewBox={`${-half} ${-half} ${layout.size} ${layout.size}`} className="block select-none" role="group" aria-label="Pairing wheel" style={{ minWidth: px }}>
          {/* family wedges */}
          {layout.wedges.map((w) => (
            <path key={w.id} d={arcPath(hubR + 10, layout.rim, w.start, w.end)} fill={w.tint} fillOpacity={w.count > 0 ? 0.6 : 0.22} stroke="var(--paper)" strokeWidth={4} strokeLinejoin="round" />
          ))}
          {/* family names outside the rim, horizontal */}
          {layout.wedges.filter((w) => w.count > 0).map((w) => (
            <text key={w.id} x={w.labelPos.x} y={w.labelPos.y} textAnchor={w.labelPos.anchor} fontSize={12} fontWeight={700} letterSpacing={1.6} fill="var(--ink-2)" fontFamily="var(--font-sans)">
              {w.label.toUpperCase()}
            </text>
          ))}
          {/* rings and the ring key in the gap at 12 o'clock */}
          {layout.rings.map((ring, i) => (
            <path key={ring.index} d={wobblyCircle(ring.radius, i + 1, 1.4)} fill="none" stroke="var(--ink)" strokeOpacity={0.22} strokeWidth={1.2} />
          ))}
          {layout.rings.map((ring, i) => {
            const w = RING_KEY[i].length * 7 + 22;
            return (
              <g key={`k${i}`} transform={`translate(0 ${-ring.radius})`}>
                <rect x={-w / 2} y={-12} width={w} height={24} rx={12} fill="var(--card)" stroke="var(--ink)" strokeOpacity={0.25} />
                <text y={4} textAnchor="middle" fontSize={10.5} fontWeight={700} letterSpacing={1.2} fill="var(--ink)" fontFamily="var(--font-sans)">{RING_KEY[i].toUpperCase()}</text>
              </g>
            );
          })}
          {/* hub */}
          <g className="cursor-pointer" onClick={onCentre} role="button" aria-label={multi ? `${anchors.length} anchors: save or share` : `${anchors[0]?.name}: save or share`}>
            <circle r={hubR + 4} fill="var(--card)" stroke="var(--ink)" strokeWidth={1.6} />
            <g className="text-ink">{hubSlots.map((s) => <ArtGlyph key={s.a.id} art={s.a.art} cat={s.a.cat} x={s.x} y={s.y} size={s.s} strokeWidth={s.s > 40 ? 2.2 : 2.6} />)}</g>
            <text y={hubR - 14} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">
              {multi ? `${anchors.length} anchors` : anchors[0] ? (anchors[0].name.length > 14 ? anchors[0].name.slice(0, 13) + "…" : anchors[0].name) : ""}
            </text>
          </g>
          {/* partners */}
          {layout.nodes.map((n) => {
            const id = n.partner.ing.id;
            const bold = n.partner.size !== "small";
            return (
              <g key={id} className="glide cursor-pointer" style={{ transform: `translate(${n.x}px, ${n.y}px)`, opacity: n.faded ? 0.35 : 1 }} onClick={() => tapNode(id)} role="button" aria-label={`${n.partner.ing.name}${n.faded ? ", pairs with some anchors" : ""}`}>
                <circle r={n.r + 10} fill="transparent" />
                <circle r={n.r} fill={n.partner.ing.photo?.color ?? CATEGORY_TINT[n.partner.ing.cat]} />
                {n.partner.ing.photo ? (
                  <>
                    <clipPath id={`clip-${String(n.partner.ing.photo.id).replace(/[^\w-]/g, "")}`}><circle r={n.r} /></clipPath>
                    <image href={photoUrl(n.partner.ing.photo, n.r * 2)} x={-n.r} y={-n.r} width={n.r * 2} height={n.r * 2} preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${String(n.partner.ing.photo.id).replace(/[^\w-]/g, "")})`} />
                    <circle r={n.r - 1.5} fill="none" stroke={CATEGORY_TINT[n.partner.ing.cat]} strokeWidth={3} />
                  </>
                ) : (
                  <g className="text-ink"><ArtGlyph art={n.partner.ing.art} cat={n.partner.ing.cat} size={GLYPH[n.partner.size]} strokeWidth={2.6} /></g>
                )}
                <circle r={n.r} fill="none" stroke="var(--ink)" strokeWidth={n.partner.size === "large" ? 1.6 : 1.1} />
                <text x={n.label.x - n.x} y={n.label.y - n.y} textAnchor={n.label.anchor} fontSize={LABEL_SIZE} fontWeight={bold ? 700 : 500} fill="var(--ink)" fontFamily="var(--font-sans)" paintOrder="stroke" stroke="var(--paper)" strokeWidth={4} strokeLinejoin="round">
                  {n.partner.ing.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="absolute right-4 top-3 flex flex-col gap-2">
        <button type="button" className="fab size-10 [&_svg]:size-4" aria-label="Zoom in" disabled={zoomIndex === ZOOMS.length - 1} onClick={() => setZoomIndex((z) => Math.min(ZOOMS.length - 1, z + 1))}><PlusIcon /></button>
        <button type="button" className="fab size-10 [&_svg]:size-4" aria-label="Zoom out" disabled={zoomIndex === 0} onClick={() => setZoomIndex((z) => Math.max(0, z - 1))}><MinusIcon /></button>
        <button type="button" className="fab size-10 [&_svg]:size-4" aria-label="Back to the centre" onClick={() => centre(true)}><LocateFixedIcon /></button>
      </div>
    </div>
  );
}
