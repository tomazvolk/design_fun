"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListIcon, MapIcon, PlusIcon, SearchIcon, SlidersHorizontalIcon, XIcon, ShareIcon, BookmarkIcon } from "lucide-react";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { useExploreState, DEFAULT_FILTERS, exploreHref } from "@/lib/explore-state";
import { layoutWheel } from "@/lib/rings";
import { CATEGORY_LABEL, CATEGORY_ORDER, CATEGORY_SHORT, CATEGORY_TINT, SEASONS, TIER_LABEL, cap, reasonSentence, seasonText } from "@/lib/labels";
import { MAX_ANCHORS, NOTE_MAX } from "@/lib/config";
import type { Bridge, Category, Filters, Ingredient, Partner, PartnerResult, SearchResult } from "@/lib/types";
import { Chip, IconButton, SectionLabel, Sheet, useToast } from "./ui";
import { Mark } from "./illustrations";
import { RingMap } from "./ring-map";

/* ========================= Explore: search is home; with anchors, the map ========================= */
export function Explore() {
  const { anchors } = useExploreState();
  const { graph } = useStore();
  if (!graph) return <Loading />;
  return anchors.length === 0 ? <SearchHome /> : <MapScreen />;
}

function Loading() {
  return <div className="flex h-[70dvh] items-center justify-center text-muted" role="status">Loading the pairing map…</div>;
}

/* ========================= Screen 1: search ========================= */
export function SearchField({ autoFocus, onPick, placeholder = "Ingredient", excluded = [] }: { autoFocus?: boolean; onPick: (r: SearchResult) => void; placeholder?: string; excluded?: string[] }) {
  const { graph } = useStore();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  const results = useMemo(() => (graph && q.trim() ? graph.search(q).filter((r) => !(r.kind === "ingredient" && excluded.includes(r.id))) : []), [graph, q, excluded]);
  const closest = useMemo(() => (graph && q.trim().length > 1 && results.length === 0 ? graph.closest(q) : []), [graph, q, results.length]);
  return (
    <div>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-faint" />
        <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Search ingredients" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search"
          className="card h-14 w-full rounded-full pl-13 pr-12 text-[1.0625rem] outline-none transition-shadow focus:shadow-[0_1px_1px_rgba(23,22,20,0.04),0_14px_30px_-16px_rgba(23,22,20,0.35)]"
          onKeyDown={(e) => { if (e.key === "Enter" && results[0]) onPick(results[0]); }} />
        {q && <button type="button" aria-label="Clear" onClick={() => { setQ(""); ref.current?.focus(); }} className="absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted"><XIcon className="size-5" /></button>}
      </div>
      {q.trim() && (
        <ul className="card mt-3 overflow-hidden" role="listbox" aria-label="Matches">
          {results.map((r) => (
            <li key={`${r.kind}:${r.id}`}>
              <button type="button" role="option" aria-selected={false} onClick={() => { setQ(""); onPick(r); }} className="flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left hover:bg-paper-deep/60">
                {r.kind === "ingredient" ? <Mark art={graph?.get(r.id)?.art ?? null} cat={r.cat} size={36} /> : <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-paper-deep text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">{r.kind === "cuisine" ? "C" : "D"}</span>}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[1.0625rem] font-medium">{r.kind === "ingredient" && r.via ? <><span className="text-muted">{r.via}</span> → {r.name}</> : r.name}</span>
                </span>
                <span className="shrink-0 rounded-full bg-paper-deep px-2.5 py-1 text-[0.75rem] font-medium text-muted">{r.kind === "ingredient" ? CATEGORY_LABEL[r.cat] : r.kind}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-4 py-4 text-[0.9375rem] text-muted">
              No ingredient called ‘{q.trim()}’. Try a simpler name.
              {closest.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{closest.map((i) => <Chip key={i.id} size="sm" mark={<Mark art={i.art} cat={i.cat} size={26} />} onClick={() => { setQ(""); onPick({ kind: "ingredient", id: i.id, name: i.name, cat: i.cat }); }}>{i.name}</Chip>)}</div>}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function SearchHome() {
  const { graph, recents, pushRecent, hemisphere, onboarded } = useStore();
  const { setAnchors, filters, setFilters } = useExploreState();
  const [picked, setPicked] = useState<{ kind: "cuisine" | "dish"; id: string; name: string } | null>(null);
  const season = useMemo(() => (graph ? graph.inSeason(new Date().getMonth(), hemisphere).slice(0, 8) : []), [graph, hemisphere]);
  const pickedList = useMemo(() => (graph && picked && !picked.id.startsWith("cat:") ? (picked.kind === "cuisine" ? graph.ingredientsForCuisine(picked.id) : graph.ingredientsForDish(picked.id)).slice(0, 24) : []), [graph, picked]);
  const open = (id: string) => { pushRecent(id); setAnchors([id]); };
  const onPick = (r: SearchResult) => {
    if (r.kind === "ingredient") return open(r.id);
    // Cuisines and dishes can only be filters (F2): remember the cuisine filter and offer its ingredients to start from.
    if (r.kind === "cuisine") setFilters({ ...filters, cuisine: r.id });
    setPicked({ kind: r.kind, id: r.id, name: r.name });
  };
  if (!graph) return <Loading />;
  const byCat = (c: Category) => graph.ingredients.filter((i) => i.cat === c).sort((x, y) => y.degree - x.degree);
  return (
    <div className="px-4 pt-[calc(var(--safe-t)+20px)] md:px-8">
      <h1 className="t-display mb-5 text-[2.75rem]">What&rsquo;s in the pan?</h1>
      <SearchField autoFocus={onboarded} onPick={onPick} />
      {picked && !picked.id.startsWith("cat:") && (
        <section className="mt-8">
          <div className="flex items-center justify-between"><h2 className="t-title text-[1.375rem]">{picked.name}</h2><button type="button" aria-label="Clear" onClick={() => { setPicked(null); if (picked.kind === "cuisine") setFilters({ ...filters, cuisine: null }); }} className="inline-flex size-9 items-center justify-center rounded-full text-muted"><XIcon className="size-4" /></button></div>
          <p className="mt-1 text-[0.875rem] text-muted">{picked.kind === "cuisine" ? "Pick an ingredient to start from. The wheel will show only partners of this cuisine until you reset filters." : "Ingredients that work in it. Pick one to start from."}</p>
          <div className="mt-3 flex flex-wrap gap-2">{pickedList.map((i) => <Chip key={i.id} mark={<Mark art={i.art} cat={i.cat} size={30} />} onClick={() => open(i.id)}>{i.name}</Chip>)}</div>
        </section>
      )}
      {recents.length > 0 && (
        <section className="mt-8">
          <SectionLabel>Recent</SectionLabel>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">{recents.map((id) => graph.get(id)).filter((i): i is Ingredient => !!i).map((i) => <Chip key={i.id} mark={<Mark art={i.art} cat={i.cat} size={30} />} onClick={() => open(i.id)}>{i.name}</Chip>)}</div>
        </section>
      )}
      <section className="mt-8">
        <SectionLabel>In season now</SectionLabel>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
          {season.map((i) => (
            <button key={i.id} type="button" onClick={() => open(i.id)} className="card flex w-[116px] shrink-0 flex-col items-center gap-2 px-2 pt-4 pb-3 transition-transform active:scale-[0.97]">
              <Mark art={i.art} cat={i.cat} size={64} />
              <span className="t-title text-[1rem] leading-tight">{i.name}</span>
              <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-muted">{CATEGORY_SHORT[i.cat]}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <SectionLabel>By family</SectionLabel>
        <p className="mt-1 text-[0.875rem] text-muted">The wheel keeps these in this order, herbs at the top.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((c) => (
            <Chip key={c} size="sm" on={picked?.id === `cat:${c}`} mark={<span className="mark" style={{ width: 18, height: 18, ["--tint" as string]: CATEGORY_TINT[c] }} />} onClick={() => setPicked(picked?.id === `cat:${c}` ? null : { kind: "dish", id: `cat:${c}`, name: CATEGORY_SHORT[c] })}>{CATEGORY_SHORT[c]}</Chip>
          ))}
        </div>
        {picked?.id.startsWith("cat:") && (
          <div className="mt-3 flex flex-wrap gap-2">{byCat(picked.id.slice(4) as Category).map((i) => <Chip key={i.id} mark={<Mark art={i.art} cat={i.cat} size={30} />} onClick={() => open(i.id)}>{i.name}</Chip>)}</div>
        )}
      </section>
      <section className="card mt-10 flex items-center gap-4 p-5">
        <Mark art="fennel" cat="vegetable" size={72} />
        <div>
          <h2 className="t-title text-[1.25rem]">Try the main flow</h2>
          <p className="mt-1 text-[0.9375rem] text-muted">Fennel, then orange, then read why olives.</p>
          <button type="button" className="mt-2 text-[0.875rem] font-semibold underline underline-offset-4" onClick={() => { pushRecent("fennel"); setAnchors(["fennel"]); }}>Start with fennel</button>
        </div>
      </section>
    </div>
  );
}

/* ========================= Screen 2: map ========================= */
function MapScreen() {
  const { graph, pushRecent, saveCombination } = useStore();
  const { anchors: anchorIds, filters, setAnchors, setFilters, filterCount } = useExploreState();
  const router = useRouter();
  const toast = useToast();
  const [view, setView] = useState<"map" | "list">("map");
  const [card, setCard] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "filters" | "add" | "anchors">(null);
  const [saveFor, setSaveFor] = useState<string[] | null>(null);
  const [listRing, setListRing] = useState<number | null>(null);

  const result = useMemo<PartnerResult>(() => graph!.partners(anchorIds, filters), [graph, anchorIds, filters]);
  const layout = useMemo(() => layoutWheel(result), [result]);
  const anchors = result.anchors;

  const addAnchor = (id: string) => {
    if (anchorIds.includes(id)) return;
    if (anchorIds.length >= MAX_ANCHORS) { toast(`Up to ${MAX_ANCHORS} ingredients`); return; }
    pushRecent(id);
    setCard(null);
    setAnchors([...anchorIds, id]);
  };
  const removeAnchor = (id: string) => setAnchors(anchorIds.filter((a) => a !== id));
  const openList = (ring: number | null) => { setListRing(ring); setView("list"); };
  const share = async () => {
    const url = `${location.origin}${location.pathname}${location.search}`;
    try {
      if (navigator.share) await navigator.share({ title: `${anchors.map((a) => a.name).join(" + ")} · Pairing Explorer`, url });
      else { await navigator.clipboard.writeText(url); toast("Link copied"); }
    } catch { /* cancelled */ }
  };
  const doSave = async (ids: string[], note: string) => {
    const r = await saveCombination(ids, note);
    if (r.ok) toast("Saved", { label: "Open", onClick: () => router.push("/saved/") }); else toast(r.reason);
    setSaveFor(null);
  };
  const partnerFor = (id: string): Partner | undefined => result.full.find((p) => p.ing.id === id) ?? result.partial.find((p) => p.ing.id === id);
  const bridgeFor = (id: string): Bridge | undefined => result.bridges.find((b) => b.ing.id === id);

  return (
    <div className="flex h-[calc(100dvh-var(--nav-h)-var(--safe-b))] flex-col md:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar: anchor chips in the order added, each with ×, then + */}
        <div className="no-scrollbar flex shrink-0 items-center gap-2 overflow-x-auto px-4 pt-[calc(var(--safe-t)+12px)] pb-2" aria-label="Anchors">
          <Link href="/" aria-label="Back to search" className="fab size-10 shrink-0 [&_svg]:size-4"><SearchIcon /></Link>
          {anchors.map((a) => (
            <span key={a.id} className="chip chip-on gap-2 pr-1.5">
              <Mark art={a.art} cat={a.cat} size={30} />
              <Link href={`/ingredient/?id=${a.id}&a=${anchorIds.filter((x) => x !== a.id).join(",")}`} className="underline-offset-4 hover:underline">{a.name}</Link>
              <button type="button" aria-label={`Remove ${a.name}`} onClick={() => removeAnchor(a.id)} className="inline-flex size-7 items-center justify-center rounded-full bg-white/15"><XIcon className="size-4" /></button>
            </span>
          ))}
          <button type="button" aria-label="Add an ingredient" onClick={() => setSheet("add")} className="chip chip-plain w-11 justify-center px-0"><PlusIcon className="size-5" /></button>
        </div>

        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          {view === "map" ? (
            <>
              <RingMap layout={layout} anchors={anchors} onTap={(id) => setCard(id)} onDoubleTap={addAnchor} onCentre={() => setSheet("anchors")} />
              {layout.overflow > 0 && (
                <button type="button" onClick={() => openList(null)} className="chip chip-plain absolute bottom-4 left-1/2 h-10 -translate-x-1/2 text-[0.875rem]">+{layout.overflow} more in the list</button>
              )}
              <p className="pointer-events-none absolute left-4 top-2 rounded-full bg-paper/85 px-2 py-0.5 backdrop-blur-sm text-[0.6875rem] uppercase tracking-[0.14em] text-muted">{result.full.length} partner{result.full.length === 1 ? "" : "s"}{anchors.length > 1 ? " of all" : ""}{result.partial.length > 0 && anchors.length > 1 ? ` · ${result.partial.length} of some` : ""}</p>
              {result.full.length === 0 && result.partial.length === 0 && (
                <div className="absolute inset-x-4 top-4">
                  <EmptyNotice result={result} filters={filters} onReset={() => setFilters(DEFAULT_FILTERS)} onPick={(id) => setCard(id)} />
                </div>
              )}
              {result.full.length === 0 && (result.partial.length > 0) && anchors.length >= 2 && (
                <div className="absolute inset-x-4 top-4"><EmptyNotice result={result} filters={filters} onReset={() => setFilters(DEFAULT_FILTERS)} onPick={(id) => setCard(id)} /></div>
              )}
            </>
          ) : (
            <ListView result={result} initialRing={listRing} onTap={(id) => setCard(id)} onAdd={addAnchor} />
          )}
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between">
            <div className="pointer-events-auto flex gap-2">
              <IconButton label={view === "map" ? "List view" : "Map view"} onClick={() => (view === "map" ? openList(null) : setView("map"))}>{view === "map" ? <ListIcon /> : <MapIcon />}</IconButton>
            </div>
            <div className="pointer-events-auto flex gap-2">
              <IconButton label="Filters" badge={filterCount} onClick={() => setSheet("filters")}><SlidersHorizontalIcon /></IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: card on the right. Phone: bottom sheet. */}
      {card && (
        <IngredientCard id={card} partner={partnerFor(card)} bridge={bridgeFor(card)} anchors={anchors} onClose={() => setCard(null)} onAdd={() => addAnchor(card)} onSave={() => { setSaveFor([...anchorIds, card].filter((x, i, arr) => arr.indexOf(x) === i)); setCard(null); }} />
      )}
      <FiltersSheet open={sheet === "filters"} onClose={() => setSheet(null)} filters={filters} onChange={setFilters} />
      <Sheet open={sheet === "add"} onClose={() => setSheet(null)} title="Add an ingredient" height="full">
        <SearchField autoFocus excluded={anchorIds} onPick={(r) => { if (r.kind === "ingredient") { addAnchor(r.id); setSheet(null); } else if (r.kind === "cuisine") { setFilters({ ...filters, cuisine: r.id }); setSheet(null); toast(`Filtered to ${r.name}`); } else toast("Dishes can only be filters on the ingredient page"); }} />
      </Sheet>
      <Sheet open={sheet === "anchors"} onClose={() => setSheet(null)} title={anchors.map((a) => a.name).join(" + ")} height="auto">
        <p className="text-[0.9375rem] text-muted">{result.full.length} pair{result.full.length === 1 ? "" : "s"} with {anchors.length === 1 ? "it" : "all of them"}{result.partial.length > 0 && anchors.length > 1 ? `, ${result.partial.length} with some` : ""}.</p>
        <div className="mt-5 flex flex-col gap-3">
          <button type="button" className="btn-primary" onClick={() => { setSheet(null); setSaveFor([...anchorIds]); }}><BookmarkIcon className="size-5" /> Save combination</button>
          <button type="button" className="btn-secondary" onClick={share}><ShareIcon className="size-5" /> Share link</button>
        </div>
      </Sheet>
      <SaveSheet ids={saveFor} onClose={() => setSaveFor(null)} onSave={doSave} />
    </div>
  );
}

function EmptyNotice({ result, filters, onReset, onPick }: { result: PartnerResult; filters: Filters; onReset: () => void; onPick: (id: string) => void }) {
  const names = result.anchors.map((a) => a.name);
  const filtered = filters !== DEFAULT_FILTERS && (result.filteredOut > 0 || filters.hideHubs || filters.cuisine || filters.seasons.length < SEASONS.length || filters.categories.length < CATEGORY_ORDER.length);
  return (
    <div className="card anim-pop p-4">
      {result.anchors.length >= 2 ? (
        <>
          <p className="text-[0.9375rem] font-medium">Nothing pairs with all of these.{result.bridges.length > 0 && " These bridge them:"}</p>
          {result.bridges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">{result.bridges.map((b) => <Chip key={b.ing.id} size="sm" mark={<Mark art={b.ing.art} cat={b.ing.cat} size={26} />} onClick={() => onPick(b.ing.id)}>{b.ing.name}</Chip>)}</div>
          )}
          <p className="mt-2 text-[0.8125rem] text-muted">Bridges reach {names.slice(0, -1).join(", ")} and {names.at(-1)} in two hops. They are not full matches.</p>
        </>
      ) : (
        <p className="text-[0.9375rem] font-medium">No partners to show for {names[0]}.</p>
      )}
      {filtered && <button type="button" className="mt-3 text-[0.875rem] font-semibold underline underline-offset-4" onClick={onReset}>Reset filters</button>}
    </div>
  );
}

/* ========================= Screen 4: list view ========================= */
function ListView({ result, initialRing, onTap, onAdd }: { result: PartnerResult; initialRing: number | null; onTap: (id: string) => void; onAdd: (id: string) => void }) {
  const groups = [
    { key: "classic", label: "Classic", items: result.full.filter((p) => p.tier >= 3) },
    { key: "recommended", label: "Recommended", items: result.full.filter((p) => p.tier === 2) },
    { key: "works", label: "Works", items: result.full.filter((p) => p.tier === 1) },
    { key: "some", label: "Pairs with some", items: result.partial },
  ];
  const refs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    if (initialRing === null) return;
    const key = ["classic", "recommended", "works"][initialRing];
    refs.current[key]?.scrollIntoView({ block: "start" });
  }, [initialRing]);
  return (
    <div className="h-full overflow-y-auto px-4 pb-24" aria-label="Partners as a list">
      {groups.map((g) => g.items.length > 0 && (
        <section key={g.key} ref={(el) => { refs.current[g.key] = el; }} className="mt-4 scroll-mt-2">
          <SectionLabel muted className="mb-2">{g.label} · {g.items.length}</SectionLabel>
          <ul className="card overflow-hidden">
            {g.items.map((p) => <ListRow key={p.ing.id} partner={p} onTap={() => onTap(p.ing.id)} onAdd={() => onAdd(p.ing.id)} />)}
          </ul>
        </section>
      ))}
      {result.full.length === 0 && result.partial.length === 0 && <p className="mt-8 text-center text-muted">Nothing to list.</p>}
    </div>
  );
}

function ListRow({ partner, onTap, onAdd }: { partner: Partner; onTap: () => void; onAdd: () => void }) {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef(false);
  const bars = { small: 1, medium: 2, large: 3 }[partner.size];
  return (
    <li className="relative overflow-hidden border-b border-hairline last:border-0">
      <div className="absolute inset-y-0 left-0 flex w-24 items-center justify-center bg-ink text-white"><PlusIcon className="size-5" /></div>
      <button type="button" onClick={() => { if (Math.abs(dx) < 4) onTap(); }}
        onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; horizontal.current = false; }}
        onPointerMove={(e) => { if (!start.current) return; const ddx = e.clientX - start.current.x, ddy = e.clientY - start.current.y; if (!horizontal.current && Math.abs(ddx) > 8 && Math.abs(ddx) > Math.abs(ddy)) horizontal.current = true; if (horizontal.current) { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); setDx(Math.max(0, Math.min(120, ddx))); } }}
        onPointerUp={() => { if (dx > 80) onAdd(); setDx(0); start.current = null; }}
        onPointerCancel={() => { setDx(0); start.current = null; }}
        className={cn("row", partner.missing.length > 0 && "opacity-70")}
        style={{ transform: `translateX(${dx}px)`, transition: dx ? "none" : "transform 160ms ease", touchAction: "pan-y" }}>
        <Mark art={partner.ing.art} cat={partner.ing.cat} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[1.0625rem] font-medium">{partner.ing.name}</span>
          {partner.missing.length > 0 && <span className="block text-[0.75rem] text-muted">not with {partner.missing.join(", ")}</span>}
        </span>
        <span className="stamp stamp-ink">{TIER_LABEL[partner.tier]}</span>
        <span className="flex h-3 w-6 items-end gap-0.5" aria-label={`${partner.size} node`}>{[1, 2, 3].map((n) => <span key={n} className={cn("w-1.5 rounded-sm", n <= bars ? "bg-ink" : "bg-pencil")} style={{ height: `${n * 4}px` }} />)}</span>
      </button>
    </li>
  );
}

/* ========================= Screen 3: ingredient card ========================= */
function IngredientCard({ id, partner, bridge, anchors, onClose, onAdd, onSave }: { id: string; partner?: Partner; bridge?: Bridge; anchors: Ingredient[]; onClose: () => void; onAdd: () => void; onSave: () => void }) {
  const { graph } = useStore();
  const ing = graph!.get(id);
  if (!ing) return null;
  const tasteWords = (["sweet", "sour", "salty", "bitter", "hot", "astringent"] as const).filter((t) => ing.taste[t] >= 2);
  const worksIn = [...ing.dishes.map((d) => graph!.dishes.get(d) ?? d), ...Object.keys(ing.cuisines).map((c) => graph!.cuisines.find((x) => x.id === c)?.name ?? c)].slice(0, 8);
  const isAnchor = anchors.some((a) => a.id === id);
  return (
    <Sheet open onClose={onClose} labelledBy="card-title">
      <div className="flex items-start gap-4">
        <Mark art={ing.art} cat={ing.cat} size={72} />
        <div className="min-w-0 flex-1">
          <h2 id="card-title" className="t-title text-[1.875rem]">{ing.name}</h2>
          <p className="mt-1 text-[0.875rem] text-muted">{CATEGORY_LABEL[ing.cat]} · {seasonText(ing.season)}{ing.hub ? " · common" : ""}</p>
          {anchors.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{anchors.map((a) => { const e = partner?.edges[a.id] ?? graph!.edge(id, a.id); return <span key={a.id} className={cn("stamp", !e && "stamp-ink")}>{e ? `${TIER_LABEL[e.tier]} · ${a.name}` : `not with ${a.name}`}</span>; })}</div>}
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="-mr-2 -mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full"><XIcon className="size-5" /></button>
      </div>
      {(tasteWords.length > 0 || ing.weight.v || ing.volume.v) && (
        <div className="mt-4 flex flex-wrap gap-2 text-[0.875rem]">
          {tasteWords.map((t) => <span key={t} className="rounded-full bg-card px-3 py-1.5">{cap(t)}</span>)}
          <span className="rounded-full bg-card px-3 py-1.5">{["", "very light", "light", "medium", "heavy", "very heavy"][Math.round(ing.weight.v)]}</span>
          <span className="rounded-full bg-card px-3 py-1.5">{["", "very quiet", "quiet", "moderate", "loud", "very loud"][Math.round(ing.volume.v)]}</span>
        </div>
      )}
      {anchors.length > 0 && !isAnchor && (
        <section className="mt-5">
          <SectionLabel muted>Why it pairs</SectionLabel>
          <ul className="mt-2 flex flex-col gap-2 text-[0.9375rem] leading-relaxed">
            {anchors.map((a) => {
              const e = partner?.edges[a.id] ?? graph!.edge(id, a.id);
              if (e) return <li key={a.id}><span className="font-medium">{a.name}:</span> {e.reason ?? reasonSentence(e.reasonType, ing.name, a.name)}</li>;
              const via = bridge?.via[a.id];
              return <li key={a.id} className="text-muted"><span className="font-medium text-ink">{a.name}:</span> {via ? `no direct pairing; reaches it through ${via.through.name}.` : "no direct pairing."}</li>;
            })}
          </ul>
        </section>
      )}
      {worksIn.length > 0 && (
        <section className="mt-5">
          <SectionLabel muted>Works in</SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">{worksIn.map((w) => <span key={w} className="rounded-full bg-paper-deep px-3 py-1.5 text-[0.875rem] text-ink-2">{w}</span>)}</div>
        </section>
      )}
      <div className="mt-6 flex flex-col gap-3">
        {!isAnchor && <button type="button" className="btn-primary" onClick={onAdd}>Add as anchor</button>}
        <button type="button" className="btn-secondary" onClick={onSave}>{isAnchor ? "Save current anchors" : "Save with current anchors"}</button>
        <Link href={`/ingredient/?id=${ing.id}&a=${anchors.map((a) => a.id).filter((x) => x !== ing.id).join(",")}`} className="py-2 text-center text-[0.9375rem] font-semibold underline underline-offset-4">Full page</Link>
      </div>
    </Sheet>
  );
}

/* ========================= Screen 5: filters ========================= */
export function FiltersSheet({ open, onClose, filters, onChange }: { open: boolean; onClose: () => void; filters: Filters; onChange: (f: Filters) => void }) {
  const { graph } = useStore();
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const cuisine = filters.cuisine ? graph?.cuisines.find((c) => c.id === filters.cuisine)?.name : null;
  return (
    <Sheet open={open} onClose={onClose} title="Filters" height="full">
      <section className="mt-2">
        <SectionLabel muted>Season</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">{SEASONS.map((s) => <Chip key={s} on={filters.seasons.includes(s)} muted onClick={() => onChange({ ...filters, seasons: toggle(filters.seasons, s) })} pressed={filters.seasons.includes(s)}>{cap(s)}</Chip>)}</div>
      </section>
      <section className="mt-7">
        <div className="flex items-baseline justify-between"><SectionLabel muted>Category</SectionLabel><span className="text-[0.75rem] text-muted">hold for “only”</span></div>
        <div className="mt-3 flex flex-wrap gap-2">{CATEGORY_ORDER.map((c) => <Chip key={c} on={filters.categories.includes(c)} muted pressed={filters.categories.includes(c)} mark={<span className="mark" style={{ width: 18, height: 18, ["--tint" as string]: CATEGORY_TINT[c] }} />} onClick={() => onChange({ ...filters, categories: toggle(filters.categories, c) })} onLongPress={() => onChange({ ...filters, categories: [c] })}>{CATEGORY_LABEL[c as Category]}</Chip>)}</div>
      </section>
      {cuisine && (
        <section className="mt-7">
          <SectionLabel muted>Cuisine</SectionLabel>
          <div className="mt-3"><Chip on onClick={() => onChange({ ...filters, cuisine: null })}>{cuisine} <XIcon className="size-4" /></Chip></div>
        </section>
      )}
      <section className="mt-7">
        <label className="card flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
          <span><span className="block text-[1rem] font-medium">Hide common ingredients</span><span className="block text-[0.8125rem] text-muted">Suppresses the 30 biggest hubs so the unusual partners come forward.</span></span>
          <button type="button" role="switch" aria-checked={filters.hideHubs} onClick={() => onChange({ ...filters, hideHubs: !filters.hideHubs })} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", filters.hideHubs ? "bg-ink" : "bg-pencil")}><span className={cn("absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform", filters.hideHubs && "translate-x-5")} /></button>
        </label>
      </section>
      <div className="mt-8 flex flex-col gap-3">
        <button type="button" className="btn-primary" onClick={onClose}>Done</button>
        <button type="button" className="py-2 text-center text-[0.9375rem] font-semibold underline underline-offset-4" onClick={() => onChange(DEFAULT_FILTERS)}>Reset</button>
      </div>
    </Sheet>
  );
}

/* ========================= Save: one-field note ========================= */
export function SaveSheet({ ids, onClose, onSave }: { ids: string[] | null; onClose: () => void; onSave: (ids: string[], note: string) => void }) {
  if (!ids) return null;
  return <SaveSheetBody key={ids.join(",")} ids={ids} onClose={onClose} onSave={onSave} />;
}

function SaveSheetBody({ ids, onClose, onSave }: { ids: string[]; onClose: () => void; onSave: (ids: string[], note: string) => void }) {
  const { graph } = useStore();
  const [note, setNote] = useState("");
  const names = ids.map((id) => graph?.get(id)?.name ?? id);
  return (
    <Sheet open onClose={onClose} title="Save combination" height="auto">
      <p className="t-title text-[1.25rem]">{names.join(" + ")}</p>
      <input value={note} onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))} placeholder="A note, like “Sunday salad”" aria-label="Note" maxLength={NOTE_MAX} autoFocus enterKeyHint="done" onKeyDown={(e) => { if (e.key === "Enter") onSave(ids, note); }} className="card mt-4 h-14 w-full rounded-2xl px-4 text-[1.0625rem] outline-none" />
      <p className="mt-1 text-right text-[0.75rem] text-faint">{note.length}/{NOTE_MAX}</p>
      <button type="button" className="btn-primary mt-3 w-full" onClick={() => onSave(ids, note)}>Save</button>
    </Sheet>
  );
}

export { exploreHref };
