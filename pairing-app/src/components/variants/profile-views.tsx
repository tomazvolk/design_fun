"use client";

import { useState } from "react";
import { cn } from "cn";
import type { Combination, Combo, Cuisine, Edge, Ingredient, Tier } from "@/lib/types";
import type { PairingGraph } from "@/lib/graph";
import { CATEGORY_LABEL, CATEGORY_TINT, TASTES, TIER_LABEL, VOLUME_LABEL, WEIGHT_LABEL, cap, familyOf } from "@/lib/labels";
import { Illustration, Mark } from "../illustrations";
import { photoUrl } from "@/lib/photo";
import { CuisineOctagon, HeavinessRadar, PairingArcs, Radar, TasteHexagon, VolumeRadar } from "../charts";
import { Chip } from "../ui";
import { HBar, Pips, ScaleTrack } from "./shared";

export type ProfileProps = {
  ing: Ingredient;
  anchors: Ingredient[];
  graph: PairingGraph;
  combos: Combo[];
  mine: Combination[];
  artist: string;
  onPair: (id: string) => void;
  onMore: () => void;
  onCuisine: (id: string) => void;
  onCombo: (ids: string[]) => void;
  onHoldCombo: (ids: string[]) => void;
};

/* ---------- shared pieces ---------- */
const tint = (i: Ingredient) => CATEGORY_TINT[i.cat];
const seasonLine = (i: Ingredient) => (i.season === "all" ? "All year" : i.season.map(cap).join(", "));
function tiers(ing: Ingredient, graph: PairingGraph) {
  const edges = graph.partnersOf(ing.id);
  const other = (e: Edge) => graph.get(e.a === ing.id ? e.b : e.a)!;
  const sort = (x: Edge, y: Edge) => y.tier - x.tier || y.shared - x.shared;
  return [
    { label: "Classic", items: edges.filter((e) => e.tier >= 3).sort(sort).map(other) },
    { label: "Recommended", items: edges.filter((e) => e.tier === 2).sort(sort).map(other) },
    { label: "Works", items: edges.filter((e) => e.tier === 1).sort(sort).map(other) },
  ];
}
function cuisineRows(ing: Ingredient, cuisines: Cuisine[]) {
  return cuisines.map((c) => ({ c, v: ing.cuisines[c.id] ?? 0 })).sort((a, b) => b.v - a.v);
}
function AnchorStamps({ ing, anchors, graph }: { ing: Ingredient; anchors: Ingredient[]; graph: PairingGraph }) {
  if (!anchors.length) return null;
  return <div className="flex flex-wrap gap-1.5">{anchors.map((a) => { const e = graph.edge(ing.id, a.id); return <span key={a.id} className={e ? "stamp" : "stamp stamp-ink"}>{e ? `${TIER_LABEL[e.tier]} · ${a.name}` : `not with ${a.name}`}</span>; })}</div>;
}
function Facts({ ing, graph }: { ing: Ingredient; graph: PairingGraph }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[0.9375rem]">
      {ing.aliases.length > 0 && <><dt className="t-label-muted pt-0.5">Also</dt><dd>{ing.aliases.join(", ")}</dd></>}
      <dt className="t-label-muted pt-0.5">Season</dt><dd>{seasonLine(ing)}</dd>
      {ing.techniques.length > 0 && <><dt className="t-label-muted pt-0.5">Cook</dt><dd>{ing.techniques.join(", ")}</dd></>}
      {ing.dishes.length > 0 && <><dt className="t-label-muted pt-0.5">Works in</dt><dd>{ing.dishes.map((d) => graph.dishes.get(d) ?? d).join(", ")}</dd></>}
    </dl>
  );
}
function PartnerChips({ items, onPair, max = 10 }: { items: Ingredient[]; onPair: (id: string) => void; max?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, max).map((p) => <Chip key={p.id} size="sm" mark={<Mark art={p.art} cat={p.cat} photo={p.photo} size={26} />} onClick={() => onPair(p.id)}>{p.name}</Chip>)}
      {items.length > max && <span className="self-center text-[0.8125rem] text-muted">+{items.length - max}</span>}
    </div>
  );
}
function ComboList({ ing, graph, combos, mine, onCombo, onHoldCombo }: ProfileProps) {
  if (!combos.length && !mine.length) return <p className="text-[0.9375rem] text-muted">No established trios recorded for {ing.name} yet.</p>;
  const card = (ids: string[], origin: string, key: string, yours?: boolean) => (
    <li key={key}>
      <Chip className="card h-auto w-full flex-col items-start gap-2.5 rounded-[20px] px-4 py-4 whitespace-normal" onClick={() => onCombo(ids)} onLongPress={yours ? undefined : () => onHoldCombo(ids)}>
        <span className="flex flex-wrap items-center gap-1.5">
          {ids.map((id, i) => { const x = graph.get(id); return <span key={id} className="flex items-center gap-1.5">{i > 0 && <span className="text-faint">+</span>}{x && <Mark art={x.art} cat={x.cat} photo={x.photo} size={28} />}<span className="text-[0.9375rem] font-medium">{x?.name ?? id}</span></span>; })}
        </span>
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{yours ? `Yours${origin ? ` · ${origin}` : ""}` : origin}</span>
      </Chip>
    </li>
  );
  return <ul className="flex flex-col gap-3">{mine.map((c) => card(c.anchors, c.note, c.id, true))}{combos.map((c, i) => card(c.ingredients, c.origin, `c${i}`))}</ul>;
}
const H2 = ({ children, className }: { children: React.ReactNode; className?: string }) => <h2 className={cn("t-title text-[1.375rem]", className)}>{children}</h2>;

/* ---------- 1. Bento ---------- */
export function BentoProfile(props: ProfileProps) {
  const { ing, anchors, graph, onPair, onMore, onCuisine } = props;
  const t = tiers(ing, graph);
  return (
    <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-6">
      <section className="relative overflow-hidden rounded-[28px] p-6 md:col-span-6" style={{ background: tint(ing) }}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          {ing.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl(ing.photo, 420, 420)} alt={ing.photo.alt || ing.name} width={210} height={210} className="aspect-square w-full max-w-[260px] shrink-0 rounded-[22px] object-cover shadow-[0_14px_30px_-18px_rgba(23,22,20,0.6)] md:w-[210px]" style={{ background: ing.photo.color }} />
          ) : (
            <Illustration art={ing.art} cat={ing.cat} size={150} strokeWidth={1.3} className="shrink-0 text-ink" />
          )}
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-2">{CATEGORY_LABEL[ing.cat]} · {seasonLine(ing)}</p>
            <h1 className="t-display mt-1 text-[3rem]">{ing.name}</h1>
            {ing.description && <p className="mt-3 max-w-[60ch] text-[1.0625rem] leading-relaxed">{ing.description}</p>}
            <div className="mt-3"><AnchorStamps ing={ing} anchors={anchors} graph={graph} /></div>
          </div>
        </div>
        <p className="mt-4 text-[0.6875rem] text-ink-2/80">
          {ing.photo ? <>Photo by <a href={ing.photo.byUrl} target="_blank" rel="noopener noreferrer" className="underline">{ing.photo.by}</a> on <a href={ing.photo.url} target="_blank" rel="noopener noreferrer" className="underline">Pexels</a></> : <>Artwork by {props.artist}</>}
        </p>
      </section>
      <section className="card p-5 md:col-span-3"><H2>Taste</H2><TasteHexagon ingredient={ing} anchors={anchors} /></section>
      <section className="card p-5 md:col-span-3"><H2>Cuisine</H2><CuisineOctagon ingredient={ing} anchors={anchors} cuisines={graph.cuisines} onAxis={onCuisine} /></section>
      <section className="card p-5 md:col-span-2">
        <H2>Heaviness</H2>
        <div className="mt-4"><ScaleTrack lo={ing.weight.lo} hi={ing.weight.hi} labels={["Very light", "Very heavy"]} tint={tint(ing)} anchors={anchors.map((a) => ({ name: a.name, lo: a.weight.lo, hi: a.weight.hi }))} /></div>
        <H2 className="mt-6">Volume</H2>
        <div className="mt-4"><ScaleTrack lo={ing.volume.lo} hi={ing.volume.hi} labels={["Very quiet", "Very loud"]} tint={tint(ing)} anchors={anchors.map((a) => ({ name: a.name, lo: a.volume.lo, hi: a.volume.hi }))} /></div>
      </section>
      <section className="card p-5 md:col-span-4"><H2>Facts</H2><div className="mt-3"><Facts ing={ing} graph={graph} /></div></section>
      <section className="card p-5 md:col-span-6">
        <div className="flex items-baseline justify-between"><H2>Pairs with</H2><button type="button" onClick={onMore} className="text-[0.875rem] font-semibold underline">Open the map</button></div>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {t.map((g) => <div key={g.label}><p className="t-label-muted mb-2">{g.label} · {g.items.length}</p><PartnerChips items={g.items} onPair={onPair} max={8} /></div>)}
        </div>
      </section>
      <section className="md:col-span-6"><H2 className="mb-3">Proven combos</H2><ComboList {...props} /></section>
    </div>
  );
}

/* ---------- 2. Tabs ---------- */
const TABS = ["Overview", "Taste", "Cuisine", "Pairings", "Combos"];
export function TabsProfile(props: ProfileProps) {
  const { ing, anchors, graph, onPair, onMore, onCuisine } = props;
  const [tab, setTab] = useState(0);
  const t = tiers(ing, graph);
  return (
    <div className="px-4">
      <section className="flex items-center gap-4">
        <Mark art={ing.art} cat={ing.cat} photo={ing.photo} size={96} />
        <div className="min-w-0">
          <h1 className="t-display text-[2.5rem]">{ing.name}</h1>
          <p className="mt-1 text-[0.875rem] text-muted">{CATEGORY_LABEL[ing.cat]} · {seasonLine(ing)}</p>
        </div>
      </section>
      <div className="mt-3"><AnchorStamps ing={ing} anchors={anchors} graph={graph} /></div>
      <div className="no-scrollbar sticky top-[calc(var(--safe-t)+56px)] z-10 -mx-4 mt-5 flex gap-1 overflow-x-auto bg-paper/95 px-4 py-2 backdrop-blur-md" role="tablist">
        {TABS.map((l, i) => <button key={l} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={cn("h-10 shrink-0 rounded-full px-4 text-[0.875rem] font-semibold", tab === i ? "bg-ink text-white" : "bg-card text-ink-2")}>{l}</button>)}
      </div>
      <div key={tab} className="anim-fade mt-3">
        {tab === 0 && (
          <div className="flex flex-col gap-4">
            {ing.description && <p className="t-title text-[1.375rem] leading-snug">{ing.description}</p>}
            <div className="card p-5"><Facts ing={ing} graph={graph} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="card p-4"><p className="t-label-muted text-center">Heaviness</p><HeavinessRadar ingredient={ing} anchors={anchors} /></div>
              <div className="card p-4"><p className="t-label-muted text-center">Volume</p><VolumeRadar ingredient={ing} anchors={anchors} /></div>
            </div>
          </div>
        )}
        {tab === 1 && <div className="card p-5"><TasteHexagon ingredient={ing} anchors={anchors} /><div className="mt-4 flex flex-col gap-2">{TASTES.map((x) => <HBar key={x} label={cap(x)} value={ing.taste[x]} max={3} tint={tint(ing)} />)}</div></div>}
        {tab === 2 && <div className="card p-5"><CuisineOctagon ingredient={ing} anchors={anchors} cuisines={graph.cuisines} onAxis={onCuisine} /><div className="mt-4 flex flex-col gap-2">{cuisineRows(ing, graph.cuisines).map(({ c, v }) => <HBar key={c.id} label={c.name} value={v} max={4} tint={tint(ing)} suffix={v ? TIER_LABEL[v as Tier] : "—"} />)}</div></div>}
        {tab === 3 && <div className="flex flex-col gap-4"><div className="card p-4"><PairingArcs ingredient={ing} graph={graph} onPick={onPair} onMore={onMore} /></div>{t.map((g) => <div key={g.label} className="card p-4"><p className="t-label-muted mb-3">{g.label} · {g.items.length}</p><PartnerChips items={g.items} onPair={onPair} max={16} /></div>)}</div>}
        {tab === 4 && <ComboList {...props} />}
      </div>
    </div>
  );
}

/* ---------- 3. Bars: one column, every chart a bar or track ---------- */
export function BarsProfile(props: ProfileProps) {
  const { ing, anchors, graph, onPair } = props;
  const t = tiers(ing, graph);
  return (
    <div className="mx-auto max-w-[680px] px-5">
      <section className="flex items-end justify-between gap-4 border-b-2 border-ink pb-5">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">{CATEGORY_LABEL[ing.cat]} · {seasonLine(ing)}</p>
          <h1 className="t-display mt-1 text-[3.25rem]">{ing.name}</h1>
        </div>
        <Mark art={ing.art} cat={ing.cat} photo={ing.photo} size={88} />
      </section>
      <div className="mt-3"><AnchorStamps ing={ing} anchors={anchors} graph={graph} /></div>
      {ing.description && <p className="mt-5 text-[1.125rem] leading-relaxed">{ing.description}</p>}
      <section className="mt-8"><H2>Taste</H2><div className="mt-3 flex flex-col gap-2.5">{TASTES.map((x) => <HBar key={x} label={cap(x)} value={ing.taste[x]} max={3} tint={tint(ing)} />)}</div></section>
      <section className="mt-8"><H2>Character</H2>
        <p className="t-label-muted mt-3">Heaviness</p><ScaleTrack lo={ing.weight.lo} hi={ing.weight.hi} labels={[WEIGHT_LABEL[1], WEIGHT_LABEL[5]]} tint={tint(ing)} anchors={anchors.map((a) => ({ name: a.name, lo: a.weight.lo, hi: a.weight.hi }))} />
        <p className="t-label-muted mt-4">Volume</p><ScaleTrack lo={ing.volume.lo} hi={ing.volume.hi} labels={[VOLUME_LABEL[1], VOLUME_LABEL[5]]} tint={tint(ing)} anchors={anchors.map((a) => ({ name: a.name, lo: a.volume.lo, hi: a.volume.hi }))} />
      </section>
      <section className="mt-8"><H2>Cuisines</H2><div className="mt-3 flex flex-col gap-2.5">{cuisineRows(ing, graph.cuisines).map(({ c, v }) => <HBar key={c.id} label={c.name} value={v} max={4} tint={tint(ing)} suffix={v ? TIER_LABEL[v as Tier] : "—"} />)}</div></section>
      <section className="mt-8"><H2>Pairs with</H2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {t.map((g) => (
            <div key={g.label}>
              <p className="t-label-muted border-b border-hairline pb-2">{g.label} · {g.items.length}</p>
              <ul className="mt-2 flex flex-col">{g.items.slice(0, 8).map((p) => <li key={p.id}><button type="button" onClick={() => onPair(p.id)} className="flex w-full items-center gap-2 py-1.5 text-left text-[0.9375rem] hover:underline"><span className="size-2.5 rounded-full border border-ink/30" style={{ background: CATEGORY_TINT[p.cat] }} />{p.name}</button></li>)}</ul>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8"><H2 className="mb-3">Proven combos</H2><ComboList {...props} /></section>
      <section className="mt-8 border-t border-hairline pt-5"><Facts ing={ing} graph={graph} /></section>
    </div>
  );
}

/* ---------- 4. Radar studio: one big radar with a lens switch ---------- */
const LENSES = ["Taste", "Cuisine", "Heaviness", "Volume"] as const;
export function StudioProfile(props: ProfileProps) {
  const { ing, anchors, graph, onPair } = props;
  const [lens, setLens] = useState<(typeof LENSES)[number]>("Taste");
  const [compare, setCompare] = useState<string[]>(anchors.map((a) => a.id));
  const shown = anchors.filter((a) => compare.includes(a.id));
  const short = (n: string) => n.replace("Chinese & Japanese", "Chinese").replace("Mexican & Latin", "Mexican").replace("Southeast Asian", "SE Asian").replace("Middle Eastern", "Mid. Eastern");
  const member = (s: { lo: number; hi: number }, step: number) => (step >= s.lo && step <= s.hi ? 3 : Math.min(Math.abs(step - s.lo), Math.abs(step - s.hi)) === 1 ? 1.5 : 0);
  const spec = lens === "Taste" ? { axes: TASTES.map(cap), max: 3, rings: 3, of: (i: Ingredient) => TASTES.map((x) => i.taste[x]) }
    : lens === "Cuisine" ? { axes: graph.cuisines.map((c) => short(c.name)), max: 4, rings: 4, of: (i: Ingredient) => graph.cuisines.map((c) => i.cuisines[c.id] ?? 0) }
    : lens === "Heaviness" ? { axes: [1, 2, 3, 4, 5].map((n) => cap(WEIGHT_LABEL[n])), max: 3, rings: 3, of: (i: Ingredient) => [1, 2, 3, 4, 5].map((n) => member(i.weight, n)) }
    : { axes: [1, 2, 3, 4, 5].map((n) => cap(VOLUME_LABEL[n])), max: 3, rings: 3, of: (i: Ingredient) => [1, 2, 3, 4, 5].map((n) => member(i.volume, n)) };
  const t = tiers(ing, graph);
  return (
    <div className="px-4">
      <section className="flex items-center gap-4">
        <Mark art={ing.art} cat={ing.cat} photo={ing.photo} size={84} />
        <div><h1 className="t-display text-[2.5rem]">{ing.name}</h1><p className="text-[0.875rem] text-muted">{CATEGORY_LABEL[ing.cat]} · {seasonLine(ing)}</p></div>
      </section>
      {ing.description && <p className="mt-4 text-[1.0625rem] leading-relaxed">{ing.description}</p>}
      <section className="card mt-5 overflow-hidden">
        <div className="grid grid-cols-4 gap-1 bg-paper-deep p-1.5">
          {LENSES.map((l) => <button key={l} type="button" onClick={() => setLens(l)} className={cn("h-10 rounded-full text-[0.8125rem] font-semibold", lens === l ? "bg-ink text-white" : "text-ink-2")}>{l}</button>)}
        </div>
        <div key={lens} className="anim-pop px-2 py-4">
          <Radar axes={spec.axes} max={spec.max} rings={spec.rings} size={400} margin={lens === "Cuisine" ? 104 : 92} tint={tint(ing)} series={[...shown.map((a) => ({ values: spec.of(a), kind: "anchor" as const, name: a.name })), { values: spec.of(ing), kind: "self" as const, name: ing.name }]} />
        </div>
        {anchors.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3">
            <span className="t-label-muted mr-1">Compare</span>
            {anchors.map((a) => <Chip key={a.id} size="sm" on={compare.includes(a.id)} mark={<Mark art={a.art} cat={a.cat} photo={a.photo} size={24} />} onClick={() => setCompare((c) => (c.includes(a.id) ? c.filter((x) => x !== a.id) : [...c, a.id]))}>{a.name}</Chip>)}
          </div>
        )}
      </section>
      <section className="mt-6">
        <H2>Pairs with</H2>
        {t.map((g) => (
          <div key={g.label} className="mt-3 flex items-center gap-3">
            <span className="t-label-muted w-[104px] shrink-0">{g.label}</span>
            <div className="no-scrollbar flex -space-x-2 overflow-x-auto py-1">
              {g.items.slice(0, 14).map((p) => <button key={p.id} type="button" onClick={() => onPair(p.id)} title={p.name} aria-label={p.name} className="transition-transform hover:z-10 hover:-translate-y-0.5"><Mark art={p.art} cat={p.cat} photo={p.photo} size={40} ring /></button>)}
            </div>
            <span className="tnum shrink-0 text-[0.8125rem] text-muted">{g.items.length}</span>
          </div>
        ))}
      </section>
      <section className="mt-8"><H2 className="mb-3">Proven combos</H2><ComboList {...props} /></section>
      <section className="card mt-6 p-5"><Facts ing={ing} graph={graph} /></section>
    </div>
  );
}

/* ---------- 5. Card: a trading-card profile with pip stats ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 border-b border-hairline py-2 last:border-0"><span className="text-[0.875rem] text-ink-2">{label}</span>{children}</div>;
}
export function CardProfile(props: ProfileProps) {
  const { ing, anchors, graph, onPair } = props;
  const t = tiers(ing, graph);
  const fam = familyOf(ing.cat);
  return (
    <div className="px-4">
      <article className="mx-auto max-w-[440px] overflow-hidden rounded-[30px] border-[1.5px] border-ink bg-card shadow-[0_24px_50px_-28px_rgba(23,22,20,0.55)]">
        <header className="relative px-5 pt-5 pb-4" style={{ background: tint(ing) }}>
          <div className="flex items-start justify-between">
            <span className="rounded-full border-[1.5px] border-ink bg-card px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">{fam.label}</span>
            <span className="tnum text-[0.75rem] font-semibold text-ink-2">{ing.degree} partners</span>
          </div>
          <div className="flex justify-center py-2"><Illustration art={ing.art} cat={ing.cat} size={170} strokeWidth={1.3} className="text-ink" /></div>
          <h1 className="t-display text-center text-[2.5rem]">{ing.name}</h1>
          <p className="text-center text-[0.8125rem] text-ink-2">{seasonLine(ing)}</p>
        </header>
        <div className="px-5 py-4">
          {ing.description && <p className="border-b border-hairline pb-4 text-[0.9375rem] leading-relaxed text-ink-2">{ing.description}</p>}
          <p className="t-label-muted mt-4">Taste</p>
          {TASTES.map((x) => <Row key={x} label={cap(x)}><Pips value={ing.taste[x]} max={3} tint={tint(ing)} /></Row>)}
          <p className="t-label-muted mt-4">Character</p>
          <Row label={`Heaviness · ${WEIGHT_LABEL[Math.round(ing.weight.v)]}`}><Pips value={ing.weight.v} max={5} tint={tint(ing)} /></Row>
          <Row label={`Volume · ${VOLUME_LABEL[Math.round(ing.volume.v)]}`}><Pips value={ing.volume.v} max={5} tint={tint(ing)} /></Row>
          <p className="t-label-muted mt-4">Cuisines</p>
          {cuisineRows(ing, graph.cuisines).filter((r) => r.v > 0).map(({ c, v }) => <Row key={c.id} label={c.name}><Pips value={v} max={4} tint={tint(ing)} /></Row>)}
          {Object.keys(ing.cuisines).length === 0 && <p className="py-2 text-[0.875rem] text-muted">No cuisine links</p>}
          <p className="t-label-muted mt-4">Best with</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {t[0].items.slice(0, 8).map((p) => <button key={p.id} type="button" onClick={() => onPair(p.id)} className="flex flex-col items-center gap-1"><Mark art={p.art} cat={p.cat} photo={p.photo} size={48} /><span className="line-clamp-1 text-[0.75rem] font-semibold">{p.name}</span></button>)}
          </div>
          {anchors.length > 0 && <div className="mt-4 border-t border-hairline pt-3"><AnchorStamps ing={ing} anchors={anchors} graph={graph} /></div>}
        </div>
        <footer className="flex items-center justify-between border-t-[1.5px] border-ink px-5 py-2.5 text-[0.6875rem] text-ink-2">
          <span>Artwork by {props.artist}</span>
          <span>{CATEGORY_LABEL[ing.cat]}</span>
        </footer>
      </article>
      <section className="mx-auto mt-6 max-w-[440px]">
        {t.slice(1).map((g) => <div key={g.label} className="mt-4"><p className="t-label-muted mb-2">{g.label} · {g.items.length}</p><PartnerChips items={g.items} onPair={onPair} max={10} /></div>)}
        <H2 className="mt-8 mb-3">Proven combos</H2><ComboList {...props} />
        <div className="card mt-6 p-5"><Facts ing={ing} graph={graph} /></div>
      </section>
    </div>
  );
}
