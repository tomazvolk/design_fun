"use client";

import type { Cuisine, Edge, Ingredient } from "@/lib/types";
import { CATEGORY_ORDER, CATEGORY_TINT, TASTES, VOLUME_LABEL, WEIGHT_LABEL, cap, scaleText } from "@/lib/labels";
import type { PairingGraph } from "@/lib/graph";
import { wobblyCircle } from "@/lib/rings";

/*
 * Ingredient-page charts in the wheel's grammar: pencil rings, the ingredient's own shape filled with its
 * category tint and outlined in ink, anchors as dashed grey outlines, axis names set around the rim, and a
 * text equivalent under every chart.
 */
const INK = "var(--ink)";
const PENCIL = "var(--pencil)";
const ANCHOR = "#8e8a81";

function polygon(values: number[], max: number, r: number): string {
  const n = values.length;
  return values.map((v, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (v / max) * r;
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
}

export function Radar({ axes, max, rings, series, tint, size = 280, margin = 60 }: { axes: string[]; max: number; rings: number; series: { values: number[]; kind: "self" | "anchor"; name: string }[]; tint: string; size?: number; margin?: number }) {
  const r = size / 2 - margin;
  const n = axes.length;
  return (
    <svg viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} className="mx-auto block w-full max-w-[380px]" aria-hidden="true">
      {Array.from({ length: rings }, (_, i) => (
        <path key={i} d={wobblyCircle(((i + 1) / rings) * r, i + 3, 0.9)} fill={i === rings - 1 ? "var(--card)" : "none"} stroke={INK} strokeOpacity={i === rings - 1 ? 0.35 : 0.18} strokeWidth={1} strokeDasharray={i === rings - 1 ? undefined : "2 4"} />
      ))}
      {axes.map((_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return <line key={i} x1={0} y1={0} x2={Math.cos(a) * r} y2={Math.sin(a) * r} stroke={PENCIL} strokeWidth={1} />;
      })}
      {series.filter((s) => s.kind === "anchor").map((s, i) => (
        <polygon key={`a${i}`} points={polygon(s.values, max, r)} fill="none" stroke={ANCHOR} strokeWidth={1.4} strokeDasharray="4 3" strokeLinejoin="round" />
      ))}
      {series.filter((s) => s.kind === "self").map((s, i) => (
        <polygon key={`s${i}`} points={polygon(s.values, max, r)} fill={tint} fillOpacity={0.85} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      ))}
      {series.filter((s) => s.kind === "self").map((s, i) => s.values.map((v, j) => {
        if (v <= 0) return null;
        const a = -Math.PI / 2 + (j * 2 * Math.PI) / n, rr = (v / max) * r;
        return <circle key={`${i}-${j}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={2.6} fill={INK} />;
      }))}
      {axes.map((label, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = Math.cos(a) * (r + 14), y = Math.sin(a) * (r + 14);
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return <text key={label} x={x} y={y + 3.5} textAnchor={anchor} fontSize={9} fontWeight={600} letterSpacing={1} fill="var(--ink-2)" fontFamily="var(--font-sans)">{label.toUpperCase()}</text>;
      })}
    </svg>
  );
}

const tintOf = (i: Ingredient) => CATEGORY_TINT[i.cat];

export function TasteHexagon({ ingredient, anchors }: { ingredient: Ingredient; anchors: Ingredient[] }) {
  const values = TASTES.map((t) => ingredient.taste[t]);
  const text = TASTES.filter((t) => ingredient.taste[t] > 0).map((t) => `${cap(t)} ${ingredient.taste[t]}`).join(" · ") || "No taste scores yet";
  return (
    <figure>
      <Radar axes={TASTES.map(cap)} max={3} rings={3} size={320} margin={84} tint={tintOf(ingredient)} series={[...anchors.map((a) => ({ values: TASTES.map((t) => a.taste[t]), kind: "anchor" as const, name: a.name })), { values, kind: "self", name: ingredient.name }]} />
      <figcaption className="mt-1 text-center text-[0.8125rem] text-muted">{text}{anchors.length > 0 && <span> · dashed: {anchors.map((a) => a.name).join(", ")}</span>}</figcaption>
    </figure>
  );
}

export function CuisineOctagon({ ingredient, anchors, cuisines, onAxis }: { ingredient: Ingredient; anchors: Ingredient[]; cuisines: Cuisine[]; onAxis?: (cuisineId: string) => void }) {
  const values = cuisines.map((c) => ingredient.cuisines[c.id] ?? 0);
  const text = cuisines.filter((c) => (ingredient.cuisines[c.id] ?? 0) > 0).map((c) => `${c.name} ${ingredient.cuisines[c.id]}`).join(" · ") || "No cuisine edges";
  const short = (name: string) => name.replace("Chinese & Japanese", "Chinese · Japanese").replace("Mexican & Latin", "Mexican · Latin").replace("Southeast Asian", "SE Asian");
  const size = 380, margin = 104, r = size / 2 - margin, n = cuisines.length;
  return (
    <figure>
      <div className="relative">
        <Radar axes={cuisines.map((c) => short(c.name))} max={4} rings={4} size={size} margin={margin} tint={tintOf(ingredient)} series={[...anchors.map((a) => ({ values: cuisines.map((c) => a.cuisines[c.id] ?? 0), kind: "anchor" as const, name: a.name })), { values, kind: "self", name: ingredient.name }]} />
        {onAxis && (
          <svg viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} className="absolute inset-0 mx-auto block w-full max-w-[380px]" aria-label="Filter the map by cuisine">
            {cuisines.map((c, i) => {
              const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
              return <circle key={c.id} cx={Math.cos(a) * (r + 14)} cy={Math.sin(a) * (r + 14)} r={26} fill="transparent" className="cursor-pointer" onClick={() => onAxis(c.id)} role="button" aria-label={`Show partners shared with ${c.name}`} />;
            })}
          </svg>
        )}
      </div>
      <figcaption className="mt-1 text-center text-[0.8125rem] text-muted">{text}</figcaption>
    </figure>
  );
}

function membership(scale: { lo: number; hi: number }, step: number): number {
  if (step >= scale.lo && step <= scale.hi) return 3;
  const d = Math.min(Math.abs(step - scale.lo), Math.abs(step - scale.hi));
  return d === 1 ? 1.5 : 0;
}
function ScaleRadar({ ingredient, anchors, pick, labels, what }: { ingredient: Ingredient; anchors: Ingredient[]; pick: (i: Ingredient) => { lo: number; hi: number }; labels: string[]; what: string }) {
  const steps = [1, 2, 3, 4, 5];
  const axes = steps.map((i) => cap(labels[i]));
  const own = pick(ingredient);
  const text = own.lo === own.hi ? cap(labels[own.lo]) : `${cap(labels[own.lo])} to ${labels[own.hi]}`;
  return (
    <figure>
      <Radar axes={axes} max={3} rings={3} size={280} margin={82} tint={tintOf(ingredient)} series={[...anchors.map((a) => ({ values: steps.map((i) => membership(pick(a), i)), kind: "anchor" as const, name: a.name })), { values: steps.map((i) => membership(own, i)), kind: "self", name: ingredient.name }]} />
      <figcaption className="mt-1 text-center text-[0.8125rem] text-muted">{text} {what}{anchors.length > 0 && <span> · dashed: {anchors.map((a) => `${a.name} ${scaleText(pick(a), labels)}`).join(", ")}</span>}</figcaption>
    </figure>
  );
}
export function HeavinessRadar({ ingredient, anchors }: { ingredient: Ingredient; anchors: Ingredient[] }) {
  return <ScaleRadar ingredient={ingredient} anchors={anchors} pick={(i) => i.weight} labels={WEIGHT_LABEL} what="weight" />;
}
export function VolumeRadar({ ingredient, anchors }: { ingredient: Ingredient; anchors: Ingredient[] }) {
  return <ScaleRadar ingredient={ingredient} anchors={anchors} pick={(i) => i.volume} labels={VOLUME_LABEL} what="volume" />;
}

/**
 * Pairings as a half wheel: three bands (primary, secondary, tertiary) with the partners' names set along the
 * arcs like the rim of the tasting wheel, each name a tap target; what does not fit collapses into "+N".
 */
export function PairingArcs({ ingredient, graph, onPick, onMore }: { ingredient: Ingredient; graph: PairingGraph; onPick: (id: string) => void; onMore: () => void }) {
  const edges = graph.partnersOf(ingredient.id);
  const other = (e: Edge) => (e.a === ingredient.id ? e.b : e.a);
  const byCat = (x: Edge, y: Edge) => CATEGORY_ORDER.indexOf(graph.get(other(x))!.cat) - CATEGORY_ORDER.indexOf(graph.get(other(y))!.cat) || y.shared - x.shared;
  const bands = [
    { label: "Primary", edges: edges.filter((e) => e.tier >= 3).sort(byCat), chars: 26 },
    { label: "Secondary", edges: edges.filter((e) => e.tier === 2).sort(byCat), chars: 44 },
    { label: "Tertiary", edges: edges.filter((e) => e.tier === 1).sort(byCat), chars: 62 },
  ];
  const W = 380, H = 215, cx = W / 2, cy = H - 10;
  const radii = [58, 108, 158];
  const arc = (r: number) => `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[440px]" role="img" aria-label={`Pairings of ${ingredient.name} on three arcs`}>
        <defs>{radii.map((r, i) => <path key={i} id={`arc-${ingredient.id}-${i}`} d={arc(r + 13)} />)}</defs>
        {radii.map((r, i) => (
          <path key={i} d={`${arc(r + 26)} L ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx - r} ${cy} Z`} fill={tintOf(ingredient)} fillOpacity={i === 0 ? 0.75 : i === 1 ? 0.45 : 0.22} stroke="var(--paper)" strokeWidth={2} />
        ))}
        {radii.map((r, i) => <path key={`l${i}`} d={arc(r)} fill="none" stroke={INK} strokeOpacity={i === 0 ? 0.55 : 0.3} strokeWidth={1} strokeDasharray={i === 0 ? undefined : "2 4"} />)}
        {bands.map((band, bi) => {
          const shown: Edge[] = [];
          let used = 0;
          for (const e of band.edges) {
            const name = graph.get(other(e))!.name;
            if (shown.length >= 8 || used + name.length > band.chars) break;
            shown.push(e); used += name.length + 3;
          }
          const rest = band.edges.length - shown.length;
          return (
            <text key={band.label} fontSize={bi === 0 ? 11.5 : 10.5} fontWeight={bi === 0 ? 700 : 500} fill={INK} fontFamily="var(--font-sans)" dy={4}>
              <textPath href={`#arc-${ingredient.id}-${bi}`} startOffset="50%" textAnchor="middle">
                {shown.map((e, i) => (
                  <tspan key={e.a + e.b}>
                    {i > 0 && <tspan fill={ANCHOR}> · </tspan>}
                    <tspan className="cursor-pointer" onClick={() => onPick(other(e))} role="button">{graph.get(other(e))!.name}</tspan>
                  </tspan>
                ))}
                {rest > 0 && <tspan className="cursor-pointer" fill="var(--muted)" onClick={onMore} role="button">{shown.length ? " · " : ""}+{rest}</tspan>}
                {band.edges.length === 0 && <tspan fill="var(--faint)">none</tspan>}
              </textPath>
            </text>
          );
        })}
        <text x={cx} y={cy - 16} textAnchor="middle" fontSize={9} fontWeight={600} letterSpacing={1.4} fill="var(--ink-2)" fontFamily="var(--font-sans)">PRIMARY</text>
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={8} fontWeight={600} letterSpacing={1.2} fill="var(--muted)" fontFamily="var(--font-sans)">SECONDARY · TERTIARY</text>
      </svg>
      <figcaption className="mt-1 text-center text-[0.8125rem] text-muted">
        {bands.map((b) => `${b.label} ${b.edges.length}`).join(" · ")}
        {edges.length > 24 && <> · <button type="button" className="underline underline-offset-2" onClick={onMore}>all {edges.length}</button></>}
      </figcaption>
    </figure>
  );
}
