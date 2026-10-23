"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, ListIcon, MapIcon, MenuIcon, PlusIcon, SearchIcon, SlidersHorizontalIcon, XIcon, ShareIcon } from "lucide-react";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { useExploreState, DEFAULT_FILTERS, exploreHref, profileHref } from "@/lib/explore-state";
import { layoutWheel } from "@/lib/rings";
import { CATEGORY_LABEL, CATEGORY_ORDER, CATEGORY_SHORT, CATEGORY_TINT, FAMILIES, SEASONS, TIER_LABEL, reasonSentence, seasonName, seasonText, tasteName, VOLUME_LABEL, WEIGHT_LABEL } from "@/lib/labels";
import { list, locale, t, tn } from "@/lib/i18n";
import { BASE_PATH, MAX_ANCHORS } from "@/lib/config";
import { photoUrl } from "@/lib/photo";
import type { Bridge, Category, Filters, Ingredient, Partner, PartnerResult, SearchResult } from "@/lib/types";
import { Chip, IconButton, SectionLabel, Sheet, useToast } from "./ui";
import { Illustration, Mark } from "./illustrations";
import { Glow, LoadingCard, Ring } from "./mood";
import { MenuSheet } from "./menu";
import { useSaveFlow } from "./save-flow";
import { RingMap } from "./ring-map";
import { BubblesView, CompareView, GridView, RankedView, RowsView } from "./variants/pairing-views";
import { useVariant, VariantBar } from "./variants/shared";

const PAIRING_VERSIONS = ["Rows", "Grid", "Ranked", "Bubbles", "Compare", "Wheel"];
const versionLabels = () => PAIRING_VERSIONS.map((v) => t(v));

/* ========================= Explore: search is home; with anchors, the map ========================= */
export function Explore() {
  const { anchors } = useExploreState();
  const { graph } = useStore();
  if (!graph) return <Loading />;
  return anchors.length === 0 ? <SearchHome /> : <MapScreen />;
}

function Loading() {
  return <div className="flex h-[70dvh] items-center justify-center px-6" role="status"><LoadingCard line={t("Loading the pairing map…")} className="w-full max-w-[320px]" /></div>;
}

/* ========================= Screen 1: search ========================= */
/** The search input and its matches. In a layer it fills the height: the input stays put, the matches scroll under it. */
export function SearchField({ autoFocus, onPick, placeholder, excluded = [], cats, layer, idle, children }: { autoFocus?: boolean; onPick: (r: SearchResult) => void; placeholder?: string; excluded?: string[]; cats?: Category[] | null; layer?: boolean; idle?: React.ReactNode; children?: React.ReactNode }) {
  const { graph } = useStore();
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus({ preventScroll: true }); }, [autoFocus]);
  const results = useMemo(() => {
    if (!graph) return [];
    if (!q.trim()) return cats ? graph.ingredients.filter((i) => cats.includes(i.cat) && !excluded.includes(i.id)).sort((x, y) => y.degree - x.degree).slice(0, 40).map((i): SearchResult => ({ kind: "ingredient", id: i.id, name: i.name, cat: i.cat })) : [];
    return graph.search(q, cats ? 40 : 8).filter((r) => !(r.kind === "ingredient" && excluded.includes(r.id))).filter((r) => !cats || (r.kind === "ingredient" && cats.includes(r.cat)));
  }, [graph, q, excluded, cats]);
  const closest = useMemo(() => (graph && q.trim().length > 1 && results.length === 0 ? graph.closest(q, 6).filter((i) => !cats || cats.includes(i.cat)).slice(0, 3) : []), [graph, q, results.length, cats]);
  const showList = !!(q.trim() || cats);
  return (
    <div className={cn(layer && "flex min-h-0 flex-1 flex-col")}>
      <div className={cn("relative", layer && "shrink-0")}>
        <SearchIcon className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-faint" strokeWidth={1.6} />
        <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder ?? t("Ingredient")} aria-label={t("Search ingredients")} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search"
          className={cn("h-14 w-full rounded-[10px] pl-13 pr-12 text-[1.125rem] text-ink outline-none transition-shadow duration-300 focus:shadow-[inset_0_0_0_1.5px_var(--circle)]", layer ? "bg-white" : "bg-paper")}
          onKeyDown={(e) => { if (e.key === "Enter" && results[0]) onPick(results[0]); }} />
        {q && <button type="button" aria-label={t("Clear")} onClick={() => { setQ(""); ref.current?.focus(); }} className="absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted"><XIcon className="size-5" /></button>}
      </div>
      <div className={cn(layer && "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10")}>
        {showList && (
          <ul className="mt-3 flex flex-col" role="listbox" aria-label={t("Matches")}>
            {results.map((r) => (
              <li key={`${r.kind}:${r.id}`}>
                <button type="button" role="option" aria-selected={false} onClick={() => { setQ(""); onPick(r); }} className="flex min-h-15 w-full items-center gap-3 border-b border-hairline px-1 py-2 text-left transition-colors duration-300 hover:bg-white/60">
                  {r.kind === "ingredient" ? <Mark art={graph?.get(r.id)?.art ?? null} cat={r.cat} photo={graph?.get(r.id)?.photo} image={graph?.get(r.id)?.image} size={42} /> : <Ring size={42} width={2} color="var(--pencil)" />}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="t-title truncate text-[1.25rem]">{r.kind === "ingredient" && r.via ? <><span className="text-muted">{r.via}</span> → {r.name}</> : r.name}</span>
                  </span>
                  <span className="t-label-muted shrink-0">{r.kind === "ingredient" ? CATEGORY_SHORT[r.cat] : r.kind === "cuisine" ? t("cuisine") : t("dish")}</span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-1 py-6 text-center">
                <p className="t-title t-italic text-[1.375rem] text-ink-2">{t("No ingredient called ‘{q}’. Try a simpler name.", { q: q.trim() })}</p>
                {closest.length > 0 && <div className="mt-4 flex flex-wrap justify-center gap-2">{closest.map((i) => <Chip key={i.id} size="sm" mark={<Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={28} />} onClick={() => { setQ(""); onPick({ kind: "ingredient", id: i.id, name: i.name, cat: i.cat }); }}>{i.name}</Chip>)}</div>}
              </li>
            )}
          </ul>
        )}
        {!showList && idle}
        {children}
      </div>
    </div>
  );
}

/**
 * Search as a full-screen layer, pinned to the top and opaque, so the keyboard and the screen behind never overlap it.
 * A filter chip row (families) sits over the field. Cuisines and dishes list their ingredients.
 */
function SearchLayer({ open, ...props }: { open: boolean; onClose: () => void; onOpen: (id: string) => void; title: string; placeholder: string; family?: string | null; excluded?: string[]; onCuisine?: (id: string, name: string) => void }) {
  if (!open) return null;
  return <SearchLayerBody {...props} />;
}

function SearchLayerBody({ onClose, onOpen, title, placeholder, family: initialFamily = null, excluded, onCuisine }: { onClose: () => void; onOpen: (id: string) => void; title: string; placeholder: string; family?: string | null; excluded?: string[]; onCuisine?: (id: string, name: string) => void }) {
  const { graph, recents } = useStore();
  const { filters, setFilters } = useExploreState();
  const [family, setFamily] = useState<string | null>(initialFamily);
  const [picked, setPicked] = useState<{ kind: "cuisine" | "dish"; id: string; name: string } | null>(null);
  const pickedList = useMemo(() => (graph && picked ? (picked.kind === "cuisine" ? graph.ingredientsForCuisine(picked.id) : graph.ingredientsForDish(picked.id)).slice(0, 24) : []), [graph, picked]);
  const cats = family ? FAMILIES.find((f) => f.id === family)?.cats ?? null : null;
  const chips = useRef<HTMLDivElement>(null);
  useEffect(() => { chips.current?.querySelector("[aria-pressed=true]")?.scrollIntoView({ inline: "center", block: "nearest" }); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  const onPick = (r: SearchResult) => {
    if (r.kind === "ingredient") { onOpen(r.id); return; }
    if (r.kind === "cuisine" && onCuisine) { onCuisine(r.id, r.name); return; }
    // Cuisines and dishes can only be filters (F2): remember the cuisine filter and offer its ingredients to start from.
    if (r.kind === "cuisine") setFilters({ ...filters, cuisine: r.id });
    setPicked({ kind: r.kind, id: r.id, name: r.name });
  };
  const recent = recents.map((id) => graph?.get(id)).filter((i): i is Ingredient => !!i && !excluded?.includes(i.id)).slice(0, 8);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper anim-fade" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col px-4 pt-[calc(var(--safe-t)+8px)]">
        <div className="grid shrink-0 grid-cols-[48px_1fr_48px] items-center">
          <button type="button" aria-label={t("Close")} onClick={onClose} className="-ml-2 inline-flex size-12 items-center justify-center rounded-full text-ink-2"><ChevronDownIcon className="size-6" strokeWidth={1.6} /></button>
          <h2 className="truncate text-center text-[1.0625rem] text-ink">{title}</h2>
          <span />
        </div>
        <div ref={chips} className="no-scrollbar -mx-4 flex shrink-0 gap-2 overflow-x-auto px-4 pt-2 pb-4" role="group" aria-label={t("By family")}>
          {FAMILIES.map((f) => (
            <Chip key={f.id} size="sm" muted on={family === f.id} pressed={family === f.id} mark={<span className="mark" style={{ width: 16, height: 16, ["--tint" as string]: f.tint }} />} onClick={() => setFamily(family === f.id ? null : f.id)}>{f.label}</Chip>
          ))}
        </div>
        <SearchField layer autoFocus={!family} onPick={onPick} placeholder={placeholder} cats={cats} excluded={excluded}
          idle={recent.length > 0 && (
            <section className="mt-6">
              <SectionLabel muted>{t("Recent")}</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">{recent.map((i) => <Chip key={i.id} mark={<Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={30} />} onClick={() => onOpen(i.id)}>{i.name}</Chip>)}</div>
            </section>
          )}>
          {picked && (
            <section className="mt-8">
              <div className="flex items-center justify-between"><h2 className="t-title text-[1.625rem]">{picked.name}</h2><button type="button" aria-label={t("Clear")} onClick={() => { setPicked(null); if (picked.kind === "cuisine") setFilters({ ...filters, cuisine: null }); }} className="inline-flex size-9 items-center justify-center rounded-full text-muted"><XIcon className="size-4" /></button></div>
              <p className="mt-1 text-[0.9375rem] text-muted">{picked.kind === "cuisine" ? t("Pick an ingredient to start from. The wheel will show only partners of this cuisine until you reset filters.") : t("Ingredients that work in it. Pick one to start from.")}</p>
              <div className="mt-4 flex flex-wrap gap-2">{pickedList.map((i) => <Chip key={i.id} mark={<Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={30} />} onClick={() => onOpen(i.id)}>{i.name}</Chip>)}</div>
            </section>
          )}
        </SearchField>
      </div>
    </div>
  );
}

/** An ingredient card: the drawing on a pale tinted gradient, caption below. */
function IngredientTile({ ing, i, onOpen, className }: { ing: Ingredient; i: number; onOpen: () => void; className?: string }) {
  return (
    <button type="button" onClick={onOpen} className={cn("rise-in group block text-left", className)} style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
      <span className="card relative flex aspect-[4/5] items-center justify-center overflow-hidden" style={{ background: `radial-gradient(120% 90% at 50% 30%, #fff 0%, color-mix(in srgb, ${CATEGORY_TINT[ing.cat]} 70%, #fff) 100%)` }}>
        {ing.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${BASE_PATH}/${ing.image}`} alt="" loading="lazy" decoding="async" className="w-[78%] object-contain drop-shadow-[0_10px_12px_rgba(20,24,40,0.14)] transition-transform duration-[400ms] group-active:scale-[0.98]" />
        ) : ing.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl(ing.photo, 320, 400)} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" style={{ background: ing.photo.color }} />
        ) : (
          <Illustration art={ing.art} cat={ing.cat} size={80} strokeWidth={1.4} className="text-ink-2" />
        )}
      </span>
      <span className="caption mt-2 block px-1">{ing.name}</span>
    </button>
  );
}

/** A section heading on Explore: tracked label, optional link on the right. */
function Heading({ label, more }: { label: string; more?: React.ReactNode }) {
  return <div className="mb-3 flex items-baseline justify-between gap-3"><SectionLabel muted>{label}</SectionLabel>{more}</div>;
}

/** A horizontal shelf that bleeds to the screen edges. */
function Shelf({ children, label }: { children: React.ReactNode; label: string }) {
  return <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:-mx-8 md:px-8" role="list" aria-label={label}>{children}</div>;
}

/* Explore: a headline and search, then ways in — recent, in season, by family, classic pairs, proven combos. */
function SearchHome() {
  const { graph, recents, pushRecent, hemisphere } = useStore();
  const { setAnchors } = useExploreState();
  const [sheet, setSheet] = useState<null | "search" | "menu">(null);
  const [family, setFamily] = useState<string | null>(null);
  const router = useRouter();
  const open = (id: string) => { pushRecent(id); setSheet(null); router.push(profileHref(id)); };
  const month = new Date().getMonth();
  const monthName = new Intl.DateTimeFormat(locale(), { month: "long" }).format(new Date());
  const search = (f: string | null = null) => { setFamily(f); setSheet("search"); };

  const data = useMemo(() => {
    if (!graph) return null;
    const recent = recents.map((id) => graph.get(id)).filter((i): i is Ingredient => !!i).slice(0, 10);
    const season = graph.inSeason(month, hemisphere).sort((x, y) => Number(!!y.image) - Number(!!x.image) || y.degree - x.degree).slice(0, 12);
    const families = FAMILIES.map((f) => {
      const items = graph.ingredients.filter((i) => f.cats.includes(i.cat)).sort((x, y) => Number(!!y.image) - Number(!!x.image) || y.degree - x.degree);
      return { ...f, count: items.length, top: items.slice(0, 3) };
    });
    // Classic pairs: the strongest pairing for each of this season's ingredients, said as a sentence.
    const seen = new Set<string>();
    const pairs: { a: Ingredient; b: Ingredient; text: string }[] = [];
    for (const a of season) {
      const e = graph.partnersOf(a.id).filter((x) => x.tier >= 3).sort((x, y) => y.shared - x.shared)[0];
      if (!e) continue;
      const b = graph.get(e.a === a.id ? e.b : e.a)!;
      const key = [a.id, b.id].sort().join("+");
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ a, b, text: e.reason ?? reasonSentence(e.reasonType, a.name, b.name) });
      if (pairs.length >= 5) break;
    }
    const combos = season.map((i) => graph.combosFor(i.id)[0]).filter(Boolean).filter((c, n, arr) => arr.indexOf(c) === n).slice(0, 6)
      .map((c) => ({ combo: c, items: c.ingredients.map((id) => graph.get(id)).filter((x): x is Ingredient => !!x) }));
    return { recent, season, families, pairs, combos };
  }, [graph, recents, hemisphere, month]);

  if (!graph || !data) return <Loading />;
  const fennel = graph.get("fennel");
  return (
    <div className="relative px-4 pt-[calc(var(--safe-t)+18px)] md:px-8">
      <Glow variant="halo" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="t-label t-accent">{t("What {month} brings to the table.", { month: monthName }).replace(/\.$/, "")}</p>
          <h1 className="t-display mt-2 text-[2.625rem]">{t("What’s in the pan?")}</h1>
        </div>
        <button type="button" aria-label={t("Menu")} onClick={() => setSheet("menu")} className="-mr-2 inline-flex size-12 shrink-0 items-center justify-center text-pencil"><MenuIcon className="size-6" strokeWidth={1.6} /></button>
      </div>
      <button type="button" onClick={() => search()} className="card relative mt-5 flex h-14 w-full items-center gap-3 px-5 text-left text-[1.125rem] text-faint">
        <SearchIcon className="size-5 shrink-0" strokeWidth={1.6} />{t("Ingredient, cuisine or dish")}
      </button>

      {data.recent.length > 0 && (
        <section className="relative mt-7">
          <Heading label={t("Recent")} />
          <Shelf label={t("Recent")}>{data.recent.map((i) => <Chip key={i.id} className="shrink-0" mark={<Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={30} />} onClick={() => open(i.id)}>{i.name}</Chip>)}</Shelf>
        </section>
      )}

      <section className="relative mt-8">
        <Heading label={t("In season now")} more={<Link href="/season/" className="btn-link">{t("See all")}</Link>} />
        <Shelf label={t("In season now")}>{data.season.map((x, i) => <IngredientTile key={x.id} ing={x} i={i} onOpen={() => open(x.id)} className="w-[132px] shrink-0 snap-start" />)}</Shelf>
      </section>

      <section className="relative mt-8">
        <Heading label={t("By family")} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.families.map((f, n) => (
            <button key={f.id} type="button" onClick={() => search(f.id)} className={cn("card rise-in flex flex-col items-start gap-3 px-4 pt-4 pb-4 text-left transition-transform duration-300 active:scale-[0.98]", n === data.families.length - 1 && n % 2 === 0 && "col-span-2 md:col-span-1")}>
              <span className="flex -space-x-3">{f.top.map((i) => <span key={i.id} className="rounded-full ring-2 ring-white"><Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={40} /></span>)}</span>
              <span className="flex w-full items-center gap-2">
                <Ring size={12} width={2} color={f.tint} />
                <span className="t-title min-w-0 flex-1 truncate text-[1.1875rem] leading-tight">{f.label}</span>
              </span>
              <span className="-mt-2 text-[0.8125rem] text-muted">{tn(f.count, "{n} ingredient", "{n} ingredients")}</span>
            </button>
          ))}
        </div>
      </section>

      {data.pairs.length > 0 && (
        <section className="relative mt-8">
          <Heading label={t("Classic pairs")} />
          <Shelf label={t("Classic pairs")}>
            {data.pairs.map((q) => (
              <button key={q.a.id + q.b.id} type="button" onClick={() => { pushRecent(q.a.id); router.push(profileHref(q.b.id, [q.a.id])); }} className="card flex w-[264px] shrink-0 snap-start flex-col px-5 pt-4 pb-5 text-left">
                <span className="flex items-center gap-1.5"><Mark art={q.a.art} cat={q.a.cat} photo={q.a.photo} image={q.a.image} size={36} /><span className="text-faint">+</span><Mark art={q.b.art} cat={q.b.cat} photo={q.b.photo} image={q.b.image} size={36} /></span>
                <span className="t-title mt-3 line-clamp-4 block text-[1.1875rem] leading-snug text-ink">{q.text}</span>
                <span className="mt-auto pt-3 text-[0.875rem] text-muted">{q.a.name} + {q.b.name}</span>
              </button>
            ))}
          </Shelf>
        </section>
      )}

      {data.combos.length > 0 && (
        <section className="relative mt-8">
          <Heading label={t("Proven combos")} />
          <Shelf label={t("Proven combos")}>
            {data.combos.map(({ combo, items }) => (
              <button key={combo.ingredients.join("+")} type="button" onClick={() => setAnchors(combo.ingredients)} className="flex w-[200px] shrink-0 snap-start flex-col text-left">
                <span className="card flex items-center justify-center gap-1 px-3 py-6">
                  {items.slice(0, 3).map((x, n) => <span key={x.id} className="flex items-center gap-1">{n > 0 && <span className="text-[0.875rem] font-light text-faint">+</span>}<Mark art={x.art} cat={x.cat} photo={x.photo} image={x.image} size={44} /></span>)}
                </span>
                <span className="caption mt-2 block px-1">{combo.origin || items.map((x) => x.name).join(" + ")}</span>
              </button>
            ))}
          </Shelf>
        </section>
      )}

      {fennel && (
        <section className="card relative mt-8 mb-6 flex items-center gap-4 p-5">
          <Mark art={fennel.art} cat={fennel.cat} size={64} image={fennel.image} photo={fennel.photo} />
          <div className="min-w-0">
            <h2 className="t-title text-[1.25rem]">{t("Try the main flow")}</h2>
            <p className="mt-1 text-[0.9375rem] text-muted">{t("Fennel, then orange, then read why olives.")}</p>
            <button type="button" className="btn-link mt-2" onClick={() => { pushRecent("fennel"); setAnchors(["fennel"]); }}>→ {t("Start with fennel")}</button>
          </div>
        </section>
      )}

      <SearchLayer open={sheet === "search"} family={family} onClose={() => setSheet(null)} onOpen={open} title={t("Search")} placeholder={t("Ingredient, cuisine or dish")} />
      <MenuSheet open={sheet === "menu"} onClose={() => setSheet(null)} />
    </div>
  );
}

/* ========================= Screen 2: map ========================= */
function MapScreen() {
  const { graph, pushRecent } = useStore();
  const { save } = useSaveFlow();
  const { anchors: anchorIds, filters, setAnchors, setFilters, filterCount } = useExploreState();
  const router = useRouter();
  const toast = useToast();
  const [view, setView] = useState<"map" | "list">("map");
  const [card, setCard] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "filters" | "add" | "anchors">(null);
  const [listRing, setListRing] = useState<number | null>(null);
  const [version, setVersion] = useVariant("pe:pairing-version", PAIRING_VERSIONS.length);

  const result = useMemo<PartnerResult>(() => graph!.partners(anchorIds, filters), [graph, anchorIds, filters]);
  const layout = useMemo(() => layoutWheel(result), [result]);
  const anchors = result.anchors;

  const addAnchor = (id: string) => {
    if (anchorIds.includes(id)) return;
    if (anchorIds.length >= MAX_ANCHORS) { toast(t("Up to {n} ingredients", { n: MAX_ANCHORS })); return; }
    pushRecent(id);
    setCard(null);
    setAnchors([...anchorIds, id]);
  };
  const openProfile = (id: string) => { pushRecent(id); router.push(profileHref(id, anchorIds)); };
  const removeAnchor = (id: string) => setAnchors(anchorIds.filter((a) => a !== id));
  const openList = (ring: number | null) => { setListRing(ring); setView("list"); };
  const share = async () => {
    const url = `${location.origin}${location.pathname}${location.search}`;
    try {
      if (navigator.share) await navigator.share({ title: `${anchors.map((a) => a.name).join(" + ")} · Pairing Explorer`, url });
      else { await navigator.clipboard.writeText(url); toast(t("Link copied")); }
    } catch { /* cancelled */ }
  };
  const partnerFor = (id: string): Partner | undefined => result.full.find((p) => p.ing.id === id) ?? result.partial.find((p) => p.ing.id === id);
  const bridgeFor = (id: string): Bridge | undefined => result.bridges.find((b) => b.ing.id === id);

  return (
    <div className="relative flex h-[calc(100dvh-var(--nav-h)-var(--safe-b))] flex-col md:flex-row">
      <Glow variant="halo" tint={anchors[0] ? CATEGORY_TINT[anchors[0].cat] : undefined} />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar: anchor chips in the order added, each with ×, then + */}
        <div className="no-scrollbar flex shrink-0 items-center gap-2 overflow-x-auto px-4 pt-[calc(var(--safe-t)+12px)] pb-2" aria-label={t("Anchors")}>
          <Link href="/" aria-label={t("Back to search")} className="fab size-11 shrink-0 [&_svg]:size-5"><SearchIcon strokeWidth={1.6} /></Link>
          {anchors.map((a) => (
            <span key={a.id} className="chip chip-on gap-2 pr-1.5">
              <Mark art={a.art} cat={a.cat} photo={a.photo} image={a.image} size={30} />
              <Link href={`/ingredient/?id=${a.id}&a=${anchorIds.filter((x) => x !== a.id).join(",")}`} className="underline-offset-4 hover:underline">{a.name}</Link>
              <button type="button" aria-label={t("Remove {name}", { name: a.name })} onClick={() => removeAnchor(a.id)} className="inline-flex size-7 items-center justify-center rounded-full bg-white/15"><XIcon className="size-4" /></button>
            </span>
          ))}
          <button type="button" aria-label={t("Add an ingredient")} onClick={() => setSheet("add")} className="btn-add size-10 rounded-[10px]"><PlusIcon className="size-5" strokeWidth={1.8} /></button>
        </div>

        <VariantBar value={version} onChange={(v) => { setVersion(v); setView("map"); }} labels={versionLabels()} className="mx-4 mb-1 shrink-0" />
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          {view === "map" && version === 1 ? <RowsView result={result} onTap={openProfile} onAdd={addAnchor} />
          : view === "map" && version === 2 ? <GridView result={result} onTap={openProfile} onAdd={addAnchor} />
          : view === "map" && version === 3 ? <RankedView result={result} onTap={openProfile} onAdd={addAnchor} />
          : view === "map" && version === 4 ? <BubblesView result={result} onTap={openProfile} onAdd={addAnchor} />
          : view === "map" && version === 5 ? <CompareView result={result} onTap={openProfile} onAdd={addAnchor} />
          : view === "map" ? (
            <>
              <RingMap layout={layout} anchors={anchors} onTap={openProfile} onDoubleTap={addAnchor} onCentre={() => setSheet("anchors")} />
              {layout.overflow > 0 && (
                <button type="button" onClick={() => openList(null)} className="chip chip-plain absolute bottom-4 left-1/2 h-10 -translate-x-1/2 text-[0.875rem]">{t("+{n} more in the list", { n: layout.overflow })}</button>
              )}
              <p className="t-label-muted pointer-events-none absolute left-4 top-2 rounded-full bg-paper/80 px-2.5 py-1 backdrop-blur-sm">{anchors.length > 1 ? tn(result.full.length, "{n} partner of all", "{n} partners of all") : tn(result.full.length, "{n} partner", "{n} partners")}{result.partial.length > 0 && anchors.length > 1 ? ` · ${t("{n} of some", { n: result.partial.length })}` : ""}</p>
              {result.full.length === 0 && result.partial.length === 0 && (
                <div className="absolute inset-x-4 top-4">
                  <EmptyNotice result={result} filters={filters} onReset={() => setFilters(DEFAULT_FILTERS)} onPick={openProfile} />
                </div>
              )}
              {result.full.length === 0 && (result.partial.length > 0) && anchors.length >= 2 && (
                <div className="absolute inset-x-4 top-4"><EmptyNotice result={result} filters={filters} onReset={() => setFilters(DEFAULT_FILTERS)} onPick={openProfile} /></div>
              )}
            </>
          ) : (
            <ListView result={result} initialRing={listRing} onTap={openProfile} onAdd={addAnchor} />
          )}
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between">
            <div className="pointer-events-auto flex gap-2">
              <IconButton label={view === "map" ? t("List view") : t("Map view")} onClick={() => (view === "map" ? openList(null) : setView("map"))}>{view === "map" ? <ListIcon /> : <MapIcon />}</IconButton>
            </div>
            <div className="pointer-events-auto flex gap-2">
              <IconButton label={t("Filters")} badge={filterCount} onClick={() => setSheet("filters")}><SlidersHorizontalIcon /></IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: card on the right. Phone: bottom sheet. */}
      {card && (
        <IngredientCard id={card} partner={partnerFor(card)} bridge={bridgeFor(card)} anchors={anchors} onClose={() => setCard(null)} onAdd={() => addAnchor(card)} onSave={() => { save([...anchorIds, card].filter((x, i, arr) => arr.indexOf(x) === i)); setCard(null); }} />
      )}
      <FiltersSheet open={sheet === "filters"} onClose={() => setSheet(null)} filters={filters} onChange={setFilters} />
      <SearchLayer open={sheet === "add"} onClose={() => setSheet(null)} title={t("Add an ingredient")} placeholder={t("Ingredient")} excluded={anchorIds}
        onOpen={(id) => { addAnchor(id); setSheet(null); }}
        onCuisine={(id, name) => { setFilters({ ...filters, cuisine: id }); setSheet(null); toast(t("Filtered to {name}", { name })); }} />
      <Sheet open={sheet === "anchors"} onClose={() => setSheet(null)} title={t("Your pairing")} height="auto">
        <PairingBuilder anchors={anchors} result={result} onSave={() => { setSheet(null); save([...anchorIds]); }} onShare={share} onOpen={(id) => { setSheet(null); openProfile(id); }} />
      </Sheet>
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
          <p className="t-title text-[1.25rem]">{t("Nothing pairs with all of these.")}{result.bridges.length > 0 && ` ${t("These bridge them:")}`}</p>
          {result.bridges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">{result.bridges.map((b) => <Chip key={b.ing.id} size="sm" mark={<Mark art={b.ing.art} cat={b.ing.cat} photo={b.ing.photo} image={b.ing.image} size={26} />} onClick={() => onPick(b.ing.id)}>{b.ing.name}</Chip>)}</div>
          )}
          <p className="mt-2 text-[0.8125rem] text-muted">{t("Bridges reach {names} in two hops. They are not full matches.", { names: list(names) })}</p>
        </>
      ) : (
        <p className="t-title text-[1.25rem]">{t("No partners to show for {name}.", { name: names[0] })}</p>
      )}
      {filtered && <button type="button" className="btn-link mt-3" onClick={onReset}>{t("Reset filters")}</button>}
    </div>
  );
}

/* ========================= Screen 4: list view ========================= */
function ListView({ result, initialRing, onTap, onAdd }: { result: PartnerResult; initialRing: number | null; onTap: (id: string) => void; onAdd: (id: string) => void }) {
  const groups = [
    { key: "classic", label: t("Classic"), items: result.full.filter((p) => p.tier >= 3) },
    { key: "recommended", label: t("Recommended"), items: result.full.filter((p) => p.tier === 2) },
    { key: "works", label: t("Works"), items: result.full.filter((p) => p.tier === 1) },
    { key: "some", label: t("Pairs with some"), items: result.partial },
  ];
  const refs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    if (initialRing === null) return;
    const key = ["classic", "recommended", "works"][initialRing];
    refs.current[key]?.scrollIntoView({ block: "start" });
  }, [initialRing]);
  return (
    <div className="h-full overflow-y-auto px-4 pb-24" aria-label={t("Partners as a list")}>
      {groups.map((g) => g.items.length > 0 && (
        <section key={g.key} ref={(el) => { refs.current[g.key] = el; }} className="mt-4 scroll-mt-2">
          <SectionLabel muted className="mb-2">{g.label} · {g.items.length}</SectionLabel>
          <ul className="card overflow-hidden">
            {g.items.map((p) => <ListRow key={p.ing.id} partner={p} onTap={() => onTap(p.ing.id)} onAdd={() => onAdd(p.ing.id)} />)}
          </ul>
        </section>
      ))}
      {result.full.length === 0 && result.partial.length === 0 && <p className="mt-8 text-center text-muted">{t("Nothing to list.")}</p>}
    </div>
  );
}

function ListRow({ partner, onTap, onAdd }: { partner: Partner; onTap: () => void; onAdd: () => void }) {
  const { graph } = useStore();
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
        <Mark art={partner.ing.art} cat={partner.ing.cat} photo={partner.ing.photo} image={partner.ing.image} size={40} />
        <span className="min-w-0 flex-1">
          <span className="t-title block truncate text-[1.1875rem]">{partner.ing.name}</span>
          {partner.missing.length > 0 && <span className="block text-[0.75rem] text-muted">{t("not with {names}", { names: partner.missing.map((m) => graph?.get(m)?.name ?? m).join(", ") })}</span>}
        </span>
        <span className="stamp stamp-ink">{TIER_LABEL[partner.tier]}</span>
        <span className="flex h-3 w-6 items-end gap-0.5" aria-label={t(partner.size)}>{[1, 2, 3].map((n) => <span key={n} className={cn("w-1.5 rounded-sm", n <= bars ? "bg-ink" : "bg-pencil")} style={{ height: `${n * 4}px` }} />)}</span>
      </button>
    </li>
  );
}

/* ========================= Screen 3: ingredient sheet ========================= */
/** The ingredient's picture in a rounded white card: drawing, photo or line art, in that order. */
export function Portrait({ ing, size = 168, className }: { ing: Ingredient; size?: number; className?: string }) {
  return (
    <span className={cn("card flex items-center justify-center overflow-hidden", className)} style={{ width: size, height: size, background: `radial-gradient(110% 90% at 50% 30%, #fff 0%, color-mix(in srgb, ${CATEGORY_TINT[ing.cat]} 60%, #fff) 100%)` }}>
      {ing.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${BASE_PATH}/${ing.image}`} alt="" width={size} height={size} className="w-[80%] object-contain drop-shadow-[0_10px_12px_rgba(20,24,40,0.16)]" />
      ) : ing.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl(ing.photo, size, size)} alt="" width={size} height={size} className="size-full object-cover" style={{ background: ing.photo.color }} />
      ) : (
        <Illustration art={ing.art} cat={ing.cat} size={Math.round(size * 0.6)} strokeWidth={1.4} className="text-ink-2" />
      )}
    </span>
  );
}

/** "Pairs well with": a row of round thumbnails; tapping one reveals, in serif, why it works. */
export function PairsWellWith({ ing, onOpen, limit = 10 }: { ing: Ingredient; onOpen: (id: string) => void; limit?: number }) {
  const { graph } = useStore();
  const top = useMemo(() => graph!.partnersOf(ing.id).sort((x, y) => y.tier - x.tier || y.shared - x.shared).slice(0, limit), [graph, ing.id, limit]);
  const [pick, setPick] = useState<string | null>(null);
  const e = top.find((x) => (x.a === ing.id ? x.b : x.a) === pick);
  const other = pick ? graph!.get(pick) : null;
  if (!top.length) return null;
  return (
    <section>
      <p className="t-label-muted">{t("Pairs well with")}</p>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
        {top.map((x) => {
          const o = graph!.get(x.a === ing.id ? x.b : x.a)!;
          const on = pick === o.id;
          return (
            <button key={o.id} type="button" onClick={() => setPick(on ? null : o.id)} aria-pressed={on} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
              <span className="rounded-full transition-shadow duration-300" style={{ boxShadow: on ? "0 0 0 2px #fff, 0 0 0 3.5px var(--ink)" : undefined }}><Mark art={o.art} cat={o.cat} photo={o.photo} image={o.image} size={60} /></span>
              <span className="w-full truncate text-center text-[0.8125rem] text-muted">{o.name}</span>
            </button>
          );
        })}
      </div>
      {e && other && (
        <div key={other.id} className="rise-in mt-3 flex items-start gap-3">
          <p className="t-title min-w-0 flex-1 text-[1.25rem] text-ink">{e.reason ?? reasonSentence(e.reasonType, ing.name, other.name)}</p>
          <button type="button" onClick={() => onOpen(other.id)} className="btn-link shrink-0 pt-1">{t("Open")}</button>
        </div>
      )}
    </section>
  );
}

function IngredientCard({ id, partner, bridge, anchors, onClose, onAdd, onSave }: { id: string; partner?: Partner; bridge?: Bridge; anchors: Ingredient[]; onClose: () => void; onAdd: () => void; onSave: () => void }) {
  const { graph } = useStore();
  const router = useRouter();
  const ing = graph!.get(id);
  if (!ing) return null;
  const tasteWords = (["sweet", "sour", "salty", "bitter", "hot", "astringent"] as const).filter((x) => ing.taste[x] >= 2);
  const worksIn = [...ing.dishes.map((d) => graph!.dishes.get(d) ?? d), ...Object.keys(ing.cuisines).map((c) => graph!.cuisines.find((x) => x.id === c)?.name ?? c)].slice(0, 8);
  const isAnchor = anchors.some((a) => a.id === id);
  const fullHref = `/ingredient/?id=${ing.id}&a=${anchors.map((a) => a.id).filter((x) => x !== ing.id).join(",")}`;
  return (
    <Sheet open onClose={onClose} labelledBy="card-title" title={CATEGORY_SHORT[ing.cat]} height="full">
      <div className="flex flex-col items-center pt-2 text-center">
        <Portrait ing={ing} size={176} />
        <h2 id="card-title" className="t-display mt-5 text-[2.75rem]">{ing.name}</h2>
        <p className="mt-2 max-w-[34ch] text-[1rem] leading-relaxed text-muted">{CATEGORY_LABEL[ing.cat]} · {seasonText(ing.season)}{ing.hub ? ` · ${t("common")}` : ""}<br />{[...tasteWords.map(tasteName), WEIGHT_LABEL[Math.round(ing.weight.v)], VOLUME_LABEL[Math.round(ing.volume.v)]].filter(Boolean).join(", ")}</p>
        {anchors.length > 0 && <div className="mt-3 flex flex-wrap justify-center gap-1.5">{anchors.map((a) => { const e = partner?.edges[a.id] ?? graph!.edge(id, a.id); return <span key={a.id} className={cn("stamp", !e && "stamp-ink")}>{e ? `${TIER_LABEL[e.tier]} · ${a.name}` : t("not with {names}", { names: a.name })}</span>; })}</div>}
      </div>
      <div className="mt-8"><PairsWellWith ing={ing} onOpen={(o) => router.push(profileHref(o, [ing.id]))} /></div>
      {anchors.length > 0 && !isAnchor && (
        <section className="card mt-7 px-5 py-5">
          <p className="t-label-muted">{t("Why it works")}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {anchors.map((a) => {
              const e = partner?.edges[a.id] ?? graph!.edge(id, a.id);
              if (e) return <li key={a.id} className="t-title text-[1.25rem] text-ink">{e.reason ?? reasonSentence(e.reasonType, ing.name, a.name)}</li>;
              const via = bridge?.via[a.id];
              return <li key={a.id} className="t-title t-italic text-[1.125rem] text-muted">{a.name}: {via ? t("no direct pairing; reaches it through {name}.", { name: via.through.name }) : t("no direct pairing.")}</li>;
            })}
          </ul>
        </section>
      )}
      {worksIn.length > 0 && (
        <section className="mt-7">
          <p className="t-label-muted">{t("Works in")}</p>
          <div className="mt-3 flex flex-wrap gap-2">{worksIn.map((w) => <span key={w} className="tag">{w}</span>)}</div>
        </section>
      )}
      <div className="sticky bottom-0 -mx-5 mt-8 flex flex-col items-center gap-3 bg-gradient-to-t from-white via-white to-white/0 px-5 pt-8 pb-2">
        <div className="flex flex-wrap justify-center gap-3">
          {!isAnchor && <button type="button" className="btn-primary" onClick={onAdd}>+ {t("Add as anchor")}</button>}
          <button type="button" className="btn-secondary" onClick={onSave}>{t("Save this pairing")}</button>
        </div>
        <Link href={fullHref} className="btn-link py-1">{t("Full page")}</Link>
      </div>
    </Sheet>
  );
}

/* ========================= Pairing builder: the anchors as a tilted stack ========================= */
const TILT = [-5, 4, -2.5, 6, -4];
function PairingBuilder({ anchors, result, onSave, onShare, onOpen }: { anchors: Ingredient[]; result: PartnerResult; onSave: () => void; onShare: () => void; onOpen: (id: string) => void }) {
  const { graph } = useStore();
  const shared = result.full.slice(0, 3).map((p) => p.ing.name);
  const tags = (i: Ingredient) => [tasteName((["sweet", "sour", "salty", "bitter", "hot", "astringent"] as const).reduce((m, x) => (i.taste[x] > i.taste[m] ? x : m), "sweet")), CATEGORY_SHORT[i.cat]];
  const pair = anchors.length >= 2 ? graph!.edge(anchors[0].id, anchors[1].id) : undefined;
  return (
    <div className="pb-4">
      <div className="dot-grid relative mx-auto mt-2 flex h-[300px] max-w-[440px] items-center justify-center overflow-hidden rounded-[14px]">
        {anchors.map((a, i) => {
          const n = anchors.length;
          const x = (i - (n - 1) / 2) * Math.min(64, 220 / n);
          return (
            <button key={a.id} type="button" onClick={() => onOpen(a.id)} className="absolute" style={{ transform: `translateX(${x}px) rotate(${TILT[i % TILT.length]}deg)`, zIndex: i, animation: `settle 400ms var(--ease) ${i * 70}ms both` }}>
              <span className="card block bg-white p-2 pb-3 shadow-[0_8px_26px_rgba(20,24,40,0.14)]">
                <Portrait ing={a} size={n > 3 ? 112 : 140} className="shadow-none" />
                <span className="t-title mt-2 block text-center text-[1.0625rem]">{a.name}</span>
              </span>
            </button>
          );
        })}
        {anchors.slice(0, 2).map((a, i) => (
          <span key={`t${a.id}`} className={cn("tag absolute z-10", i === 0 ? "left-3 top-6 -rotate-2" : "right-3 bottom-8 rotate-2")}>
            {i === 0 && <span className="tag-dot" />}{tags(a).join(" · ")}
          </span>
        ))}
        {pair && <span className="tag absolute right-4 top-5 z-10 rotate-1">{TIER_LABEL[pair.tier]}</span>}
      </div>
      <h3 className="t-display mt-7 text-center text-[2.125rem]">{anchors.map((a) => a.name).join(" + ")}</h3>
      <p className="mx-auto mt-3 max-w-[34ch] text-center text-[1rem] leading-relaxed text-muted">
        {anchors.length === 1 ? tn(result.full.length, "{n} pairs with it", "{n} pair with it") : tn(result.full.length, "{n} pairs with all of them", "{n} pair with all of them")}{result.partial.length > 0 && anchors.length > 1 ? `, ${t("{n} with some", { n: result.partial.length })}` : ""}.
        {shared.length > 0 && <> {t("Next to try: {names}.", { names: list(shared) })}</>}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={onSave}>+ {t("Save this pairing")}</button>
        <button type="button" className="btn-secondary" onClick={onShare}><ShareIcon className="size-4" /> {t("Share link")}</button>
      </div>
    </div>
  );
}

/* ========================= Screen 5: filters ========================= */
export function FiltersSheet({ open, onClose, filters, onChange }: { open: boolean; onClose: () => void; filters: Filters; onChange: (f: Filters) => void }) {
  const { graph } = useStore();
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const cuisine = filters.cuisine ? graph?.cuisines.find((c) => c.id === filters.cuisine)?.name : null;
  return (
    <Sheet open={open} onClose={onClose} title={t("Filters")} height="full">
      <section className="mt-2">
        <SectionLabel muted>{t("Season")}</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">{SEASONS.map((s) => <Chip key={s} on={filters.seasons.includes(s)} muted onClick={() => onChange({ ...filters, seasons: toggle(filters.seasons, s) })} pressed={filters.seasons.includes(s)}>{seasonName(s)}</Chip>)}</div>
      </section>
      <section className="mt-7">
        <div className="flex items-baseline justify-between"><SectionLabel muted>{t("Category")}</SectionLabel><span className="text-[0.75rem] text-muted">{t("hold for “only”")}</span></div>
        <div className="mt-3 flex flex-wrap gap-2">{CATEGORY_ORDER.map((c) => <Chip key={c} on={filters.categories.includes(c)} muted pressed={filters.categories.includes(c)} mark={<span className="mark" style={{ width: 18, height: 18, ["--tint" as string]: CATEGORY_TINT[c] }} />} onClick={() => onChange({ ...filters, categories: toggle(filters.categories, c) })} onLongPress={() => onChange({ ...filters, categories: [c] })}>{CATEGORY_LABEL[c as Category]}</Chip>)}</div>
      </section>
      {cuisine && (
        <section className="mt-7">
          <SectionLabel muted>{t("Cuisine")}</SectionLabel>
          <div className="mt-3"><Chip on onClick={() => onChange({ ...filters, cuisine: null })}>{cuisine} <XIcon className="size-4" /></Chip></div>
        </section>
      )}
      <section className="mt-7">
        <label className="card flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
          <span><span className="block text-[1rem] text-ink">{t("Hide common ingredients")}</span><span className="block text-[0.8125rem] text-muted">{t("Suppresses the 30 biggest hubs so the unusual partners come forward.")}</span></span>
          <button type="button" role="switch" aria-checked={filters.hideHubs} onClick={() => onChange({ ...filters, hideHubs: !filters.hideHubs })} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", filters.hideHubs ? "bg-ink" : "bg-pencil")}><span className={cn("absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform", filters.hideHubs && "translate-x-5")} /></button>
        </label>
      </section>
      <div className="mt-10 flex flex-col items-center gap-3">
        <button type="button" className="btn-step" onClick={onClose}>{t("Done")}</button>
        <button type="button" className="btn-link py-2" onClick={() => onChange(DEFAULT_FILTERS)}>{t("Reset")}</button>
      </div>
    </Sheet>
  );
}

export { exploreHref };
