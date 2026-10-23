"use client";

import { locale, t, tn } from "@/lib/i18n";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilLineIcon, Trash2Icon } from "lucide-react";
import { cn } from "cn";
import { useStore } from "@/lib/store";
import { exploreHref } from "@/lib/explore-state";
import type { Combination, Ingredient } from "@/lib/types";
import { EmptyState, useToast } from "./ui";
import { Mark } from "./illustrations";
import { Glow, Ring } from "./mood";
import { NewCollection, useSaveFlow } from "./save-flow";
import { Portrait } from "./explore";

const TILT = [-5, 3.5, -2];

/** Collections: saved pairings filed under rings. A tilted stack of the latest, then every pairing as a card. */
export function SavedScreen() {
  const { graph, saved, savedLoaded, deleteCombination, collections, deleteCollection } = useStore();
  const { edit } = useSaveFlow();
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fmt = new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short" });
  const shown = useMemo(() => (filter ? saved.filter((c) => c.collection === filter) : saved), [saved, filter]);
  const colorOf = (c: Combination) => collections.find((x) => x.id === c.collection)?.color ?? null;
  const ings = (c: Combination) => c.anchors.map((id) => graph?.get(id)).filter((i): i is Ingredient => !!i);
  const latest = saved[0] ? ings(saved[0]) : [];
  const active = collections.find((c) => c.id === filter);

  if (savedLoaded && saved.length === 0 && collections.length === 0) {
    return (
      <div className="relative flex min-h-[calc(100dvh-var(--nav-h))] flex-col justify-center px-4">
        <Glow variant="rise" />
        <EmptyState title={t("Maybe what you need is one good pairing.")}>
          <Link href="/" className="btn-primary"><Ring size={22} width={3.5} /> {t("Find a pairing")}</Link>
        </EmptyState>
        <div className="flex justify-center"><button type="button" onClick={() => setCreating(true)} className="btn-link">{t("Create a collection")}</button></div>
        {creating && <NewCollection onClose={() => setCreating(false)} onCreated={() => setCreating(false)} />}
      </div>
    );
  }

  return (
    <div className="relative px-4 pt-[calc(var(--safe-t)+20px)] md:px-8">
      <Glow variant="halo" />
      <div className="relative text-center">
        <p className="t-label t-accent">{tn(saved.length, "{n} pairing kept", "{n} pairings kept")}</p>
        <h1 className="t-display mt-2 text-[2.75rem]">{t("Collections")}</h1>
      </div>

      {latest.length > 0 && !filter && (
        <button type="button" onClick={() => router.push(exploreHref(saved[0].anchors))} className="dot-grid relative mx-auto mt-6 flex h-[230px] w-full max-w-[460px] items-center justify-center overflow-hidden rounded-[14px]" aria-label={latest.map((i) => i.name).join(" + ")}>
          {latest.map((i, n) => {
            const x = (n - (latest.length - 1) / 2) * Math.min(70, 200 / latest.length);
            return (
              <span key={i.id} className="absolute" style={{ transform: `translateX(${x}px) rotate(${TILT[n % TILT.length]}deg)`, animation: `settle 400ms var(--ease) ${n * 70}ms both` }}>
                <span className="card block p-1.5 shadow-[0_8px_26px_rgba(20,24,40,0.14)]"><Portrait ing={i} size={latest.length > 3 ? 92 : 118} className="shadow-none" /></span>
              </span>
            );
          })}
          <span className="tag absolute left-3 top-4 z-10 -rotate-2"><span className="tag-dot" />{t("Latest")}</span>
          {saved[0].note && <span className="tag absolute bottom-4 right-3 z-10 max-w-[60%] rotate-1 truncate">{saved[0].note}</span>}
        </button>
      )}

      <div className="no-scrollbar relative -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={t("Collections")}>
        <button type="button" onClick={() => setFilter(null)} aria-pressed={!filter} className={cn("chip chip-plain", !filter && "chip-on")}>{t("Everything")}</button>
        {collections.map((c) => (
          <button key={c.id} type="button" onClick={() => setFilter(filter === c.id ? null : c.id)} aria-pressed={filter === c.id} className={cn("chip", filter === c.id && "chip-on")} style={{ paddingLeft: 10 }}>
            <Ring color={c.color} size={18} width={3} /> {c.name}
          </button>
        ))}
        <button type="button" onClick={() => setCreating(true)} className="chip shrink-0" style={{ paddingLeft: 10 }}><Ring size={18} width={3} /> <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-muted">{t("Create a collection")}</span></button>
      </div>

      {shown.length === 0 ? (
        <EmptyState title={active ? t("Nothing in {name} yet.", { name: active.name }) : t("Maybe what you need is one good pairing.")} body={active ? t("File a pairing here from its details.") : undefined} className="py-14">
          {active && <button type="button" className="btn-secondary" onClick={() => { deleteCollection(active.id); setFilter(null); }}>{t("Remove collection")}</button>}
        </EmptyState>
      ) : (
        <div className="masonry relative mt-5">
          {shown.map((c, n) => (
            <SavedCard key={c.id} n={n} combo={c} items={ings(c)} color={colorOf(c)} date={fmt.format(c.created)}
              onOpen={() => router.push(exploreHref(c.anchors))} onEdit={() => edit(c.id)}
              onDelete={async () => { await deleteCombination(c.id); toast(t("Pairing moved to the bin.")); }} />
          ))}
        </div>
      )}
      {creating && <NewCollection onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setFilter(id); }} />}
    </div>
  );
}

/** A saved pairing: marks side by side with a thin "+", the note as a yellow card. Swipe left to delete. */
function SavedCard({ n, combo, items, color, date, onOpen, onEdit, onDelete }: { n: number; combo: Combination; items: Ingredient[]; color: string | null; date: string; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const horizontal = useRef(false);
  const names = items.map((i) => i.name);
  return (
    <div className="rise-in" style={{ animationDelay: `${Math.min(n, 8) * 40}ms` }}>
      <div className="relative overflow-hidden rounded-[14px]">
        <div className="absolute inset-0 flex items-center justify-end rounded-[14px] bg-accent pr-6 text-white"><Trash2Icon className="size-5" /></div>
        <button type="button" onClick={() => { if (Math.abs(dx) < 4) onOpen(); }}
          onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; horizontal.current = false; }}
          onPointerMove={(e) => { if (!start.current) return; const ddx = e.clientX - start.current.x, ddy = e.clientY - start.current.y; if (!horizontal.current && Math.abs(ddx) > 8 && Math.abs(ddx) > Math.abs(ddy)) horizontal.current = true; if (horizontal.current) { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); setDx(Math.min(0, Math.max(-120, ddx))); } }}
          onPointerUp={() => { if (dx < -80) onDelete(); setDx(0); start.current = null; }}
          onPointerCancel={() => { setDx(0); start.current = null; }}
          className={cn("relative block w-full px-3 py-5 text-left", combo.note ? "card-note" : "card")}
          style={{ transform: `translateX(${dx}px)`, transition: dx ? "none" : "transform 300ms var(--ease)", touchAction: "pan-y" }}
          aria-label={`${names.join(` ${t("and")} `)}${combo.note ? `, ${combo.note}` : ""}`}>
          <span className="flex flex-wrap items-center justify-center gap-1">
            {items.map((i, k) => <span key={i.id} className="flex items-center gap-1">{k > 0 && <span className="text-[0.9375rem] font-light text-faint">+</span>}<Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={items.length > 2 ? 38 : 50} /></span>)}
          </span>
          {combo.note && <span className="t-title mt-4 block text-center text-[1.1875rem] leading-snug text-ink">{combo.note}</span>}
          {color && <span className="absolute right-3 top-3"><Ring color={color} size={14} width={2.5} /></span>}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1 px-1">
        <span className="caption min-w-0 flex-1">{names.join(" + ")}</span>
        <button type="button" aria-label={t("Add details")} onClick={onEdit} className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center text-faint"><PencilLineIcon className="size-4" /></button>
      </div>
      <span className="sr-only">{date}</span>
    </div>
  );
}
