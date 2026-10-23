"use client";

import { t } from "@/lib/i18n";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "cn";
import type { Ingredient, Partner, PartnerResult, Tier } from "@/lib/types";
import { CATEGORY_TINT, FAMILIES, TIER_LABEL, familyOf } from "@/lib/labels";
import { Mark, ArtGlyph } from "../illustrations";
import { TierMeter } from "./shared";

type ViewProps = { result: PartnerResult; onTap: (id: string) => void; onAdd: (id: string) => void };

const score = (p: Partner) => p.tier * 100 + Math.min(99, p.shared);
const byStrength = (a: Partner, b: Partner) => score(b) - score(a) || a.ing.name.localeCompare(b.ing.name);
const famLabel = (p: Partner) => familyOf(p.ing.cat).label;

function Empty({ result, onTap }: { result: PartnerResult; onTap?: (id: string) => void }) {
  if (result.full.length > 0) return null;
  if (result.anchors.length < 2) return <p className="px-6 py-16 text-center text-muted">{t("No partners to show with these filters.")}</p>;
  return (
    <div className="card mx-auto mt-4 max-w-[520px] p-5">
      <p className="t-title text-[1.25rem]">{t("Nothing pairs with all of these.")}</p>
      {result.bridges.length > 0 && <>
        <p className="mt-1 text-[0.875rem] text-muted">{t("These bridge them in two steps:")}</p>
        <div className="mt-3 flex flex-wrap gap-2">{result.bridges.map((b) => <button key={b.ing.id} type="button" onClick={() => onTap?.(b.ing.id)} className="chip h-10 text-[0.875rem]"><Mark art={b.ing.art} cat={b.ing.cat} photo={b.ing.photo} image={b.ing.image} size={28} />{b.ing.name}</button>)}</div>
      </>}
    </div>
  );
}

/* ---------- 1. Rows: one shelf per strength, big illustrated cards ---------- */
export function RowsView({ result, onTap, onAdd }: ViewProps) {
  const groups = [
    { label: t("Classic"), hint: t("the pairings cooks reach for first"), items: result.full.filter((p) => p.tier >= 3) },
    { label: t("Recommended"), hint: t("strong and reliable"), items: result.full.filter((p) => p.tier === 2) },
    { label: t("Works"), hint: t("worth trying"), items: result.full.filter((p) => p.tier === 1) },
    { label: t("Pairs with some"), hint: t("takes the dish another way"), items: result.partial },
  ].filter((g) => g.items.length > 0);
  return (
    <div className="h-full overflow-y-auto pb-28">
      <Empty result={result} onTap={onTap} />
      {groups.map((g) => (
        <section key={g.label} className="mt-5">
          <div className="flex items-baseline justify-between px-4">
            <h3 className="t-title text-[1.375rem]">{g.label} <span className="tnum text-[1rem] text-muted">{g.items.length}</span></h3>
            <span className="text-[0.8125rem] text-muted">{g.hint}</span>
          </div>
          <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-3">
            {[...g.items].sort(byStrength).map((p) => (
              <div key={p.ing.id} className={cn("card relative flex w-[132px] shrink-0 snap-start flex-col items-center gap-2 px-2 pt-5 pb-3", p.missing.length > 0 && "opacity-60")}>
                <button type="button" onClick={() => onTap(p.ing.id)} className="flex flex-col items-center gap-2" aria-label={t("Open {name}", { name: p.ing.name })}>
                  <Mark art={p.ing.art} cat={p.ing.cat} photo={p.ing.photo} image={p.ing.image} size={72} />
                  <span className="t-title text-center text-[1rem] leading-tight">{p.ing.name}</span>
                  <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted">{famLabel(p)}</span>
                </button>
                <button type="button" aria-label={t("Add {name} as anchor", { name: p.ing.name })} onClick={() => onAdd(p.ing.id)} className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-paper-deep text-ink hover:bg-ink hover:text-white"><PlusIcon className="size-4" /></button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------- 2. Grid: family tabs, tiles with a strength meter ---------- */
export function GridView({ result, onTap, onAdd }: ViewProps) {
  const [fam, setFam] = useState<string>("all");
  const all = useMemo(() => [...result.full].sort(byStrength), [result]);
  const counts = useMemo(() => Object.fromEntries(FAMILIES.map((f) => [f.id, all.filter((p) => f.cats.includes(p.ing.cat)).length])), [all]);
  const items = fam === "all" ? all : all.filter((p) => familyOf(p.ing.cat).id === fam);
  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 py-2">
        <button type="button" onClick={() => setFam("all")} className={cn("chip chip-plain h-9 text-[0.875rem]", fam === "all" && "chip-on")}>{t("All")} <span className="tnum opacity-60">{all.length}</span></button>
        {FAMILIES.filter((f) => counts[f.id] > 0).map((f) => (
          <button key={f.id} type="button" onClick={() => setFam(f.id)} className={cn("chip h-9 pl-2 text-[0.875rem]", fam === f.id && "chip-on")}>
            <span className="size-4 rounded-full border border-ink/20" style={{ background: f.tint }} />{f.label} <span className="tnum opacity-60">{counts[f.id]}</span>
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28">
        <Empty result={result} onTap={onTap} />
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {items.map((p) => (
            <button key={p.ing.id} type="button" onClick={() => onTap(p.ing.id)} onDoubleClick={() => onAdd(p.ing.id)} className="card relative flex flex-col items-center gap-1.5 px-1.5 pt-4 pb-3 transition-transform active:scale-[0.97]">
              <Mark art={p.ing.art} cat={p.ing.cat} photo={p.ing.photo} image={p.ing.image} size={56} />
              <span className="line-clamp-1 text-center text-[0.875rem] font-semibold">{p.ing.name}</span>
              <span className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-muted"><TierMeter tier={p.tier} />{TIER_LABEL[p.tier]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Ranked: a leaderboard with strength bars ---------- */
export function RankedView({ result, onTap, onAdd }: ViewProps) {
  const all = useMemo(() => [...result.full].sort(byStrength), [result]);
  const top = all[0] ? score(all[0]) : 1;
  return (
    <div className="h-full overflow-y-auto px-4 pb-28">
      <Empty result={result} onTap={onTap} />
      <ol className="card mt-2 overflow-hidden">
        {all.map((p, i) => (
          <li key={p.ing.id} className="border-b border-hairline last:border-0">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="tnum w-6 text-right text-[0.8125rem] font-semibold text-muted">{i + 1}</span>
              <button type="button" onClick={() => onTap(p.ing.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Mark art={p.ing.art} cat={p.ing.cat} photo={p.ing.photo} image={p.ing.image} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2"><span className="truncate text-[1rem] font-semibold">{p.ing.name}</span><span className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted">{TIER_LABEL[p.tier]}</span></span>
                  <span className="mt-1.5 block h-2.5 overflow-hidden rounded-full bg-paper-deep"><span className="block h-full rounded-full" style={{ width: `${(score(p) / top) * 100}%`, background: CATEGORY_TINT[p.ing.cat], boxShadow: "inset -1.5px 0 0 var(--ink)" }} /></span>
                </span>
              </button>
              <button type="button" aria-label={t("Add {name} as anchor", { name: p.ing.name })} onClick={() => onAdd(p.ing.id)} className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-paper-deep hover:bg-ink hover:text-white"><PlusIcon className="size-4" /></button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- 4. Bubbles: packed circles, size by strength, colour by family ---------- */
type Bubble = { p: Partner; x: number; y: number; r: number };
function pack(items: Partner[]): { bubbles: Bubble[]; w: number; h: number } {
  const bubbles: Bubble[] = [];
  const rOf = (p: Partner) => 22 + p.tier * 9 + (p.size === "large" ? 8 : p.size === "medium" ? 4 : 0);
  for (const p of items) {
    const r = rOf(p);
    if (bubbles.length === 0) { bubbles.push({ p, x: 0, y: 0, r }); continue; }
    for (let t = 0; t < 4000; t += 1) {
      const a = t * 0.35, d = 4 + t * 0.9;
      const x = Math.cos(a) * d * 1.25, y = Math.sin(a) * d * 0.85;
      if (bubbles.every((b) => Math.hypot(b.x - x, b.y - y) >= b.r + r + 4)) { bubbles.push({ p, x, y, r }); break; }
    }
  }
  const minX = Math.min(...bubbles.map((b) => b.x - b.r)), maxX = Math.max(...bubbles.map((b) => b.x + b.r));
  const minY = Math.min(...bubbles.map((b) => b.y - b.r)), maxY = Math.max(...bubbles.map((b) => b.y + b.r));
  for (const b of bubbles) { b.x -= minX; b.y -= minY; }
  return { bubbles, w: maxX - minX, h: maxY - minY };
}
export function BubblesView({ result, onTap }: ViewProps & { anchors?: Ingredient[] }) {
  const items = useMemo(() => [...result.full].sort(byStrength), [result]);
  const { bubbles, w, h } = useMemo(() => (items.length ? pack(items) : { bubbles: [], w: 1, h: 1 }), [items]);
  return (
    <div className="h-full overflow-y-auto px-3 pb-28">
      <Empty result={result} onTap={onTap} />
      {bubbles.length > 0 && (
        <svg viewBox={`-6 -6 ${w + 12} ${h + 12}`} className="mx-auto block w-full max-w-[720px]" role="group" aria-label={t("Pairings as bubbles")}>
          {bubbles.map((b) => {
            const big = b.r >= 44;
            const name = b.p.ing.name;
            const maxChars = Math.floor((b.r * 1.75) / 6.6);
            return (
              <g key={b.p.ing.id} transform={`translate(${b.x} ${b.y})`} className="cursor-pointer" onClick={() => onTap(b.p.ing.id)} role="button" aria-label={`${name}, ${TIER_LABEL[b.p.tier]}`}>
                <circle r={b.r} fill={CATEGORY_TINT[b.p.ing.cat]} stroke="var(--ink)" strokeWidth={b.p.tier >= 3 ? 1.6 : 1} />
                <g className="text-ink"><ArtGlyph art={b.p.ing.art} cat={b.p.ing.cat} y={big ? -9 : -6} size={big ? b.r * 0.85 : b.r * 0.9} strokeWidth={2.4} /></g>
                <text y={big ? b.r * 0.55 : b.r * 0.62} textAnchor="middle" fontSize={big ? 12 : 10.5} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">{name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name}</text>
              </g>
            );
          })}
        </svg>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[0.75rem] text-ink-2">
        {FAMILIES.map((f) => <span key={f.id} className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full border border-ink/30" style={{ background: f.tint }} />{f.label}</span>)}
        <span className="text-muted">· {t("bigger = stronger")}</span>
      </div>
    </div>
  );
}

/* ---------- 5. Compare: partners against each anchor ---------- */
export function CompareView({ result, onTap, onAdd }: ViewProps) {
  const anchors = result.anchors;
  const rows = useMemo(() => [...result.full.sort(byStrength), ...result.partial.sort(byStrength)], [result]);
  return (
    <div className="h-full overflow-auto px-4 pb-28">
      {anchors.length === 1 && <p className="mt-2 rounded-2xl bg-paper-deep px-4 py-3 text-[0.875rem] text-ink-2">{t("Add a second ingredient with the + at the top to see where they agree and where they differ.")}</p>}
      <table className="card mt-3 w-full border-separate border-spacing-0 overflow-hidden text-[0.875rem]">
        <thead>
          <tr className="text-left">
            <th className="sticky top-0 bg-card px-3 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">{t("Partner")}</th>
            {anchors.map((a) => (
              <th key={a.id} className="sticky top-0 bg-card px-2 py-3 text-center"><span className="inline-flex flex-col items-center gap-1"><Mark art={a.art} cat={a.cat} photo={a.photo} image={a.image} size={30} /><span className="text-[0.6875rem] font-semibold">{a.name}</span></span></th>
            ))}
            <th className="sticky top-0 bg-card px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.ing.id} className={cn(p.missing.length > 0 && "opacity-60")}>
              <td className="border-t border-hairline px-3 py-2">
                <button type="button" onClick={() => onTap(p.ing.id)} className="flex items-center gap-2.5 text-left"><Mark art={p.ing.art} cat={p.ing.cat} photo={p.ing.photo} image={p.ing.image} size={32} /><span className="font-semibold">{p.ing.name}</span></button>
              </td>
              {anchors.map((a) => {
                const e = p.edges[a.id];
                return (
                  <td key={a.id} className="border-t border-hairline px-2 py-2 text-center">
                    {e ? <span className="inline-flex flex-col items-center gap-1"><TierMeter tier={e.tier as Tier} /><span className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted">{TIER_LABEL[e.tier as Tier]}</span></span> : <span className="text-faint">—</span>}
                  </td>
                );
              })}
              <td className="border-t border-hairline px-2 py-2 text-right">
                <button type="button" aria-label={t("Add {name} as anchor", { name: p.ing.name })} onClick={() => onAdd(p.ing.id)} className="inline-flex size-8 items-center justify-center rounded-full bg-paper-deep hover:bg-ink hover:text-white"><PlusIcon className="size-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
