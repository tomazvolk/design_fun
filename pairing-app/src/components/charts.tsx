"use client";

import type { Cuisine, Edge, Ingredient } from "@/lib/types";
import { CATEGORY_ORDER, TASTES, VOLUME_LABEL, WEIGHT_LABEL, cap } from "@/lib/labels";
import type { PairingGraph } from "@/lib/graph";

/*
 * Ingredient-page charts (PRD "Ingredient page in detail"). Same geometry family (hexagon, octagon, square,
 * arcs), stroke weight matching the line art, one accent for the ingredient's own shape, anchors as grey
 * outlines, axis labels always printed, and a text equivalent directly under every chart.
 */
const STROKE = "#141414";
const GRID = "#d9d6d0";
const ACCENT = "var(--accent)";
const ANCHOR = "#9a9792";

function polygon(values: number[], max: number, r: number, cx: number, cy: number): string {
  const n = values.length;
  return values.map((v, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (v / max) * r;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
}

function Radar({ axes, max, rings, series, size = 260, labelOffset = 14, margin = 44 }: { axes: string[]; max: number; rings: number; series: { values: number[]; kind: "self" | "anchor"; name: string }[]; size?: number; labelOffset?: number; margin?: number }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - margin;
  const n = axes.length;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[320px]" role="img" aria-hidden="true">
      {Array.from({ length: rings }, (_, i) => (
        <polygon key={i} points={polygon(Array(n).fill(((i + 1) / rings) * max), max, r, cx, cy)} fill="none" stroke={GRID} strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke={GRID} strokeWidth={1} />;
      })}
      {series.filter((s) => s.kind === "anchor").map((s, i) => (
        <polygon key={`a${i}`} points={polygon(s.values, max, r, cx, cy)} fill="none" stroke={ANCHOR} strokeWidth={1.5} strokeDasharray="4 3" />
      ))}
      {series.filter((s) => s.kind === "self").map((s, i) => (
        <polygon key={`s${i}`} points={polygon(s.values, max, r, cx, cy)} fill={ACCENT} fillOpacity={0.22} stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" />
      ))}
      {axes.map((label, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = cx + Math.cos(a) * (r + labelOffset), y = cy + Math.sin(a) * (r + labelOffset);
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return <text key={label} x={x} y={y + 4} textAnchor={anchor} fontSize={10.5} fill={STROKE} fontFamily="var(--font-sans)">{label}</text>;
      })}
    </svg>
  );
}

export function TasteHexagon({ ingredient, anchors }: { ingredient: Ingredient; anchors: Ingredient[] }) {
  const values = TASTES.map((t) => ingredient.taste[t]);
  const text = TASTES.filter((t) => ingredient.taste[t] > 0).map((t) => `${cap(t)} ${ingredient.taste[t]}`).join(" · ") || "No taste scores yet";
  return (
    <figure>
      <Radar axes={TASTES.map(cap)} max={3} rings={3} series={[...anchors.map((a) => ({ values: TASTES.map((t) => a.taste[t]), kind: "anchor" as const, name: a.name })), { values, kind: "self", name: ingredient.name }]} />
      <figcaption className="mt-1 text-center text-[0.8125rem] text-muted">{text}{anchors.length > 0 && <span> · dashed: {anchors.map((a) => a.name).join(", ")}</span>}</figcaption>
    </figure>
  );
}

export function CuisineOctagon({ ingredient, anchors, cuisines, onAxis }: { ingredient: Ingredient; anchors: Ingredient[]; cuisines: Cuisine[]; onAxis?: (cuisineId: string) => void }) {
  const values = cuisines.map((c) => ingredient.cuisines[c.id] ?? 0);
  const text = cuisines.filter((c) => (ingredient.cuisines[c.id] ?? 0) > 0).map((c) => `${c.name} ${ingredient.cuisines[c.id]}`).join(" · ") || "No cuisine edges";
  const size = 340, margin = 78, cx = size / 2, cy = size / 2, r = size / 2 - margin, n = cuisines.length;
  const short = (name: string) => name.replace("Chinese & Japanese", "Chinese, Japanese").replace("Mexican & Latin", "Mexican, Latin").replace("Southeast Asian", "SE Asian");
  return (
    <figure>
      <div className="relative">
        <Radar axes={cuisines.map((c) => short(c.name))} max={4} rings={4} size={size} margin={margin} labelOffset={12} series={[...anchors.map((a) => ({ values: cuisines.map((c) => a.cuisines[c.id] ?? 0), kind: "anchor" as const, name: a.name })), { values, kind: "self", name: ingredient.name }]} />
        {onAxis && (
          <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 mx-auto block w-full max-w-[320px]" aria-label="Filter the map by cuisine">
            {cuisines.map((c, i) => {
              const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
              return <circle key={c.id} cx={cx + Math.cos(a) * (r + 12)} cy={cy + Math.sin(a) * (r + 12)} r={26} fill="transparent" className="cursor-pointer" onClick={() => onAxis(c.id)} role="button" aria-label={`Show partners shared with ${c.name}`} />;
            })}
          </svg>
        )}
      </div>
      <figcaption className="mt-1 text-center text-[0.8125rem] text-muted">{text}</figcaption>
    </figure>
  );
}

export function CharacterSquare({ ingredient, anchors }: { ingredient: Ingredient; anchors: Ingredient[] }) {
  const size = 220, pad = 16, inner = size - pad * 2;
  const px = (v: number) => pad + ((v - 1) / 4) * inner;
  const py = (v: number) => size - pad - ((v - 1) / 4) * inner;
  const wide = (s: { lo: number; hi: number }) => s.hi - s.lo >= 2;
  const text = `${cap(WEIGHT_LABEL[Math.round(ingredient.weight.v)] ?? "")} weight · ${VOLUME_LABEL[Math.round(ingredient.volume.v)] ?? ""} volume`;
  return (
    <figure>
      <div className="mx-auto flex w-full max-w-[300px] items-stretch gap-1">
        <div className="flex w-5 shrink-0 items-center justify-center text-[0.75rem] text-muted" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>quiet → loud</div>
        <div className="min-w-0 flex-1">
        <svg viewBox={`0 0 ${size} ${size}`} className="block w-full" aria-hidden="true">
          <rect x={pad} y={pad} width={inner} height={inner} fill="#fff" stroke={GRID} />
          <line x1={size / 2} y1={pad} x2={size / 2} y2={size - pad} stroke={GRID} />
          <line x1={pad} y1={size / 2} x2={size - pad} y2={size / 2} stroke={GRID} />
          {anchors.map((a) => <circle key={a.id} cx={px(a.weight.v)} cy={py(a.volume.v)} r={6} fill={ANCHOR} fillOpacity={0.5} />)}
          {wide(ingredient.weight) || wide(ingredient.volume) ? (
            <line x1={px(ingredient.weight.lo)} y1={py(ingredient.volume.lo)} x2={px(ingredient.weight.hi)} y2={py(ingredient.volume.hi)} stroke={ACCENT} strokeWidth={10} strokeLinecap="round" strokeOpacity={0.8} />
          ) : (
            <circle cx={px(ingredient.weight.v)} cy={py(ingredient.volume.v)} r={8} fill={ACCENT} />
          )}
        </svg>
        <div className="mt-1 flex justify-between text-[0.75rem] text-muted"><span>light</span><span>weight</span><span>heavy</span></div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-[0.8125rem] text-muted">{text}{anchors.length > 0 && <span> · grey: {anchors.map((a) => a.name).join(", ")}</span>}</figcaption>
    </figure>
  );
}

/**
 * Three concentric half-circles: primary (tier 4 and 3), secondary (2), tertiary (1). Each arc carries one
 * line of names in category order, up to 8 and as many as fit the line; the rest collapse into "+N".
 */
export function PairingArcs({ ingredient, graph, onPick, onMore }: { ingredient: Ingredient; graph: PairingGraph; onPick: (id: string) => void; onMore: () => void }) {
  const edges = graph.partnersOf(ingredient.id);
  const other = (e: Edge) => (e.a === ingredient.id ? e.b : e.a);
  const byCat = (x: Edge, y: Edge) => CATEGORY_ORDER.indexOf(graph.get(other(x))!.cat) - CATEGORY_ORDER.indexOf(graph.get(other(y))!.cat) || y.shared - x.shared;
  const bands = [
    { label: "primary", edges: edges.filter((e) => e.tier >= 3).sort(byCat), chars: 30 },
    { label: "secondary", edges: edges.filter((e) => e.tier === 2).sort(byCat), chars: 44 },
    { label: "tertiary", edges: edges.filter((e) => e.tier === 1).sort(byCat), chars: 56 },
  ];
  const W = 360, H = 200, cx = W / 2, cy = H - 6;
  const radii = [58, 108, 158];
  return (
    <figure>
      <div className="relative mx-auto w-full max-w-[420px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden="true">
          {radii.map((r, i) => <path key={i} d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={i === 0 ? ACCENT : GRID} strokeWidth={i === 0 ? 2 : 1} />)}
          <text x={cx} y={cy - 10} textAnchor="middle" fontSize={9} fill={ANCHOR} fontFamily="var(--font-sans)" letterSpacing={1.4}>PRIMARY · SECONDARY · TERTIARY</text>
        </svg>
        {bands.map((band, bi) => {
          const shown: Edge[] = [];
          let used = 0;
          for (const e of band.edges) {
            const name = graph.get(other(e))!.name;
            if (shown.length >= 8 || used + name.length > band.chars) break;
            shown.push(e); used += name.length + 3;
          }
          const rest = band.edges.length - shown.length;
          const top = ((cy - radii[bi] - 17) / H) * 100;
          return (
            <div key={band.label} className="absolute inset-x-0 flex justify-center gap-x-1 whitespace-nowrap text-[0.75rem] leading-none" style={{ top: `${top}%` }} aria-label={`${band.label} pairings`}>
              {shown.map((e, i) => (
                <span key={e.a + e.b} className="flex items-center gap-1">
                  {i > 0 && <span className="text-faint">·</span>}
                  <button type="button" onClick={() => onPick(other(e))} className={bi === 0 ? "font-semibold" : "font-medium"}>{graph.get(other(e))!.name}</button>
                </span>
              ))}
              {rest > 0 && <span className="flex items-center gap-1">{shown.length > 0 && <span className="text-faint">·</span>}<button type="button" onClick={onMore} className="text-muted">+{rest}</button></span>}
              {band.edges.length === 0 && <span className="text-faint">none</span>}
            </div>
          );
        })}
      </div>
      <figcaption className="mt-1 text-center text-[0.8125rem] text-muted">
        {bands.map((b) => `${cap(b.label)} ${b.edges.length}`).join(" · ")}
        {edges.length > 24 && <> · <button type="button" className="underline underline-offset-2" onClick={onMore}>all {edges.length}</button></>}
      </figcaption>
    </figure>
  );
}
