"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { exploreHref } from "@/lib/explore-state";
import { CATEGORY_LABEL, TIER_LABEL, cap } from "@/lib/labels";
import type { Ingredient } from "@/lib/types";
import { Chip, SectionLabel, useToast } from "./ui";
import { Illustration, Mark } from "./illustrations";
import { CATEGORY_TINT } from "@/lib/labels";
import { CuisineOctagon, HeavinessRadar, PairingArcs, TasteHexagon, VolumeRadar } from "./charts";
import { SaveSheet } from "./explore";

const ARTIST = "Line & Leaf Studio";

/** The ingredient page: header, four radars (heaviness, volume, taste, cuisine), pairings arcs and proven combos. */
export function IngredientPage() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { graph, saved, saveCombination, pushRecent } = useStore();
  const id = params.get("id") ?? "";
  const anchorKey = params.get("a") ?? "";
  const anchorIds = anchorKey.split(",").filter((x) => x && x !== id);
  const [saveFor, setSaveFor] = useState<string[] | null>(null);
  const ing = graph?.get(id);
  const anchors = useMemo(() => anchorKey.split(",").filter((x) => x && x !== id).map((a) => graph?.get(a)).filter((x): x is Ingredient => !!x), [graph, anchorKey, id]);
  const combos = useMemo(() => (graph && ing ? graph.combosFor(ing.id) : []), [graph, ing]);
  const mine = useMemo(() => saved.filter((c) => c.anchors.includes(id)), [saved, id]);

  if (!graph) return <div className="flex h-[70dvh] items-center justify-center text-muted">Loading…</div>;
  if (!ing) return <div className="px-6 pt-20 text-center"><p className="t-title text-[1.5rem]">No such ingredient.</p><Link href="/" className="mt-4 inline-block underline underline-offset-4">Back to search</Link></div>;

  const openMap = (ids: string[]) => { pushRecent(ing.id); router.push(exploreHref(ids)); };
  const chips = ing.chips;

  return (
    <div className="pb-[calc(var(--safe-b)+96px)]">
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-paper/92 px-3 pt-[calc(var(--safe-t)+8px)] pb-2 backdrop-blur-md">
        <button type="button" aria-label="Back" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} className="fab size-10 [&_svg]:size-4"><ArrowLeftIcon /></button>
        {anchors.length > 0 && <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">{anchors.map((a) => <span key={a.id} className="chip h-8 gap-1.5 pr-3 pl-1 text-[0.8125rem]"><Mark art={a.art} cat={a.cat} size={22} />{a.name}</span>)}</div>}
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-10 md:px-8">
        <div className="px-5 md:px-0">
          {/* 1. Header */}
          <header className="relative overflow-hidden rounded-[28px] px-5 pt-6 pb-5" style={{ background: CATEGORY_TINT[ing.cat] }}>
            <div className="flex items-end gap-4">
              <Illustration art={ing.art} cat={ing.cat} size={128} strokeWidth={1.4} className="shrink-0 text-ink" />
              <div className="min-w-0 pb-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-2">{CATEGORY_LABEL[ing.cat]} · {ing.season === "all" ? "all year" : ing.season.join(", ")}</p>
                <h1 className="t-display mt-1 text-[2.5rem]">{ing.name}</h1>
              </div>
            </div>
            {anchors.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{anchors.map((a) => { const e = graph.edge(ing.id, a.id); return <span key={a.id} className={e ? "stamp" : "stamp stamp-ink"}>{e ? `${TIER_LABEL[e.tier]} · ${a.name}` : `not with ${a.name}`}</span>; })}</div>}
            <p className="mt-3 text-[0.6875rem] text-ink-2/70">Artwork by {ARTIST}</p>
          </header>
          {ing.description && <p className="t-title mt-6 text-[1.375rem] leading-snug text-ink">{ing.description}</p>}
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 border-t border-hairline pt-4 text-[0.9375rem]">
            {ing.aliases.length > 0 && <><dt className="t-label-muted pt-0.5">Also</dt><dd>{ing.aliases.join(", ")}</dd></>}
            <dt className="t-label-muted pt-0.5">Season</dt><dd>{ing.season === "all" ? "All year" : ing.season.map(cap).join(", ")}</dd>
            {ing.techniques.length > 0 && <><dt className="t-label-muted pt-0.5">Cook</dt><dd>{ing.techniques.join(", ")}</dd></>}
            {Object.keys(ing.cuisines).length > 0 && <><dt className="t-label-muted pt-0.5">Cuisines</dt><dd className="flex flex-wrap gap-1.5">{Object.entries(ing.cuisines).sort((a, b) => b[1] - a[1]).map(([c, t]) => <span key={c} className="rounded-full bg-card px-2.5 py-0.5 text-[0.8125rem] shadow-[0_1px_1px_rgba(23,22,20,0.05)]">{graph.cuisines.find((x) => x.id === c)?.name ?? c} <span className="text-muted">· {TIER_LABEL[t as 1 | 2 | 3 | 4].toLowerCase()}</span></span>)}{ing.chips.map((c) => <span key={c} className="rounded-full border border-hairline px-2.5 py-0.5 text-[0.8125rem] text-muted">{c}</span>)}</dd></>}
            {ing.dishes.length > 0 && <><dt className="t-label-muted pt-0.5">Works in</dt><dd>{ing.dishes.map((d) => graph.dishes.get(d) ?? d).join(", ")}</dd></>}
            {ing.hub && <><dt className="t-label-muted pt-0.5">Note</dt><dd>One of the 30 most common partners; hidden by the “hide common” filter.</dd></>}
          </dl>

          {/* 2 and 3. Heaviness and volume, one radar each */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section>
              <SectionLabel>Heaviness</SectionLabel>
              <div className="card mt-3 p-3"><HeavinessRadar ingredient={ing} anchors={anchors} /></div>
            </section>
            <section>
              <SectionLabel>Volume</SectionLabel>
              <div className="card mt-3 p-3"><VolumeRadar ingredient={ing} anchors={anchors} /></div>
            </section>
          </div>

          {/* 4. Taste */}
          <section className="mt-8">
            <SectionLabel>Taste</SectionLabel>
            <div className="card mt-3 p-4"><TasteHexagon ingredient={ing} anchors={anchors} /></div>
          </section>
        </div>

        <div className="px-5 md:px-0">
          {/* 5. Cuisine fit */}
          <section className="mt-8 md:mt-0">
            <SectionLabel>Cuisine fit</SectionLabel>
            <div className="card mt-3 p-4">
              <CuisineOctagon ingredient={ing} anchors={anchors} cuisines={graph.cuisines} onAxis={(c) => { if (!(ing.cuisines[c] >= 1)) { toast(`${ing.name} has no ${graph.cuisines.find((x) => x.id === c)?.name} edge`); return; } pushRecent(ing.id); router.push(exploreHref([ing.id, ...anchorIds], { seasons: ["spring", "summer", "autumn", "winter"], categories: [], hideHubs: false, cuisine: c })); }} />
              {chips.length > 0 && <div className="mt-3 flex flex-wrap justify-center gap-2">{chips.map((c) => <span key={c} className="rounded-full bg-paper-deep px-3 py-1 text-[0.8125rem] text-ink-2">{c}</span>)}</div>}
              <p className="mt-2 text-center text-[0.75rem] text-faint">Tap an axis to see partners shared with that cuisine.</p>
            </div>
          </section>

          {/* 6. Pairings */}
          <section className="mt-8">
            <SectionLabel>Pairings</SectionLabel>
            <div className="card mt-3 p-4">
              <PairingArcs ingredient={ing} graph={graph} onPick={(other) => openMap([ing.id, other])} onMore={() => openMap([ing.id])} />
              <p className="mt-2 text-center text-[0.75rem] text-faint">Tap a name to open the map with both as anchors.</p>
            </div>
          </section>

          {/* 7. Proven combos */}
          <section className="mt-8">
            <SectionLabel>Proven combos</SectionLabel>
            {combos.length === 0 && mine.length === 0 && <p className="mt-3 text-[0.9375rem] text-muted">No established trios recorded for {ing.name} yet.</p>}
            <ul className="mt-3 flex flex-col gap-3">
              {mine.map((c) => (
                <li key={c.id}>
                  <ComboCard ids={c.anchors} origin={c.note || "yours"} yours onOpen={() => openMap(c.anchors)} />
                </li>
              ))}
              {combos.map((c, i) => (
                <li key={i}>
                  <ComboCard ids={c.ingredients} origin={c.origin} onOpen={() => openMap(c.ingredients)} onHold={() => setSaveFor(c.ingredients)} />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[0.75rem] text-faint">Tap to open on the map. Hold to save as a combination.</p>
          </section>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-paper via-paper/90 to-transparent px-5 pb-[calc(var(--safe-b)+16px)] pt-6 md:left-auto md:right-6 md:w-[360px] md:rounded-none md:bg-none">
        <button type="button" className="btn-primary w-full" onClick={() => openMap([ing.id, ...anchorIds])}>{anchors.length > 0 ? "Back to the map" : "Explore from here"}</button>
      </div>
      <SaveSheet ids={saveFor} onClose={() => setSaveFor(null)} onSave={async (ids, note) => { const r = await saveCombination(ids, note); toast(r.ok ? "Saved" : r.reason); setSaveFor(null); }} />
    </div>
  );
}

function ComboCard({ ids, origin, yours, onOpen, onHold }: { ids: string[]; origin: string; yours?: boolean; onOpen: () => void; onHold?: () => void }) {
  const { graph } = useStore();
  return (
    <Chip className="card h-auto w-full flex-col items-start gap-2.5 rounded-[20px] px-4 py-4 whitespace-normal" onClick={onOpen} onLongPress={onHold}>
      <span className="flex flex-wrap items-center gap-1.5">
        {ids.map((id, i) => {
          const ing = graph?.get(id);
          return (
            <span key={id} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-faint">+</span>}
              {ing && <Mark art={ing.art} cat={ing.cat} size={30} />}
              <span className="text-[0.9375rem] font-medium">{ing?.name ?? id}</span>
            </span>
          );
        })}
      </span>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{yours ? `Yours${origin !== "yours" ? ` · ${origin}` : ""}` : origin}</span>
    </Chip>
  );
}
