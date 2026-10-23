"use client";

import { cn } from "cn";
import type { Cuisine, Ingredient, Taste } from "@/lib/types";
import { TASTES, TIER_LABEL, VOLUME_LABEL, WEIGHT_LABEL, cap } from "@/lib/labels";

/*
 * Profile charts written to be read, not decoded: each starts with a plain sentence, then one labelled row per
 * dimension with a segmented bar and the value in words. An anchor can be laid under every row for comparison.
 */
const TASTE_WORD = ["none", "a little", "clearly", "strongly"];
const TIER_WORD: Record<number, string> = { 0: "—", 1: TIER_LABEL[1], 2: TIER_LABEL[2], 3: TIER_LABEL[3], 4: TIER_LABEL[4] };

function Segs({ value, max, fill, thin }: { value: number; max: number; fill: string; thin?: boolean }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={cn("flex-1 rounded-full transition-colors", thin ? "h-1.5" : "h-3.5")}
          style={{ background: i < value ? fill : "var(--paper-deep)", boxShadow: i < value && !thin ? "inset 0 0 0 1px rgba(23,22,20,0.22)" : undefined }} />
      ))}
    </span>
  );
}

function Row({ label, value, max, word, tint, compare, onClick }: { label: string; value: number; max: number; word: string; tint: string; compare?: { name: string; value: number } | null; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick} className={cn("grid w-full grid-cols-[112px_1fr_88px] items-center gap-3 py-1.5 text-left", value === 0 && (!compare || compare.value === 0) && "opacity-45", onClick && "rounded-lg hover:bg-paper-deep/60")}>
      <span className="truncate text-[0.9375rem] font-medium">{label}</span>
      <span className="flex flex-col gap-1.5">
        <Segs value={value} max={max} fill={tint} />
        {compare && <Segs value={compare.value} max={max} fill="var(--ink-2)" thin />}
      </span>
      <span className="text-right text-[0.8125rem] text-ink-2">{word}{compare && <span className="block text-[0.6875rem] text-muted">{compare.name}: {compare.value === 0 ? "—" : max === 3 ? TASTE_WORD[compare.value] : TIER_WORD[compare.value]}</span>}</span>
    </Tag>
  );
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export function tasteSentence(ing: Ingredient): string {
  const by = (n: number) => TASTES.filter((t) => ing.taste[t] === n);
  const parts = [...by(3).map((t) => `very ${t}`), ...by(2), ...by(1).map((t) => `a little ${t}`)];
  return parts.length ? cap(list(parts)) + "." : "Mild, with no strong taste of its own.";
}

export function TasteChart({ ing, tint, compare }: { ing: Ingredient; tint: string; compare: Ingredient | null }) {
  return (
    <div>
      <p className="t-title text-[1.25rem]">{tasteSentence(ing)}</p>
      <div className="mt-3 flex flex-col">
        {TASTES.map((t: Taste) => (
          <Row key={t} label={cap(t)} value={ing.taste[t]} max={3} word={TASTE_WORD[ing.taste[t]]} tint={tint} compare={compare ? { name: compare.name, value: compare.taste[t] } : null} />
        ))}
      </div>
    </div>
  );
}

export function CuisineChart({ ing, cuisines, tint, compare, onCuisine }: { ing: Ingredient; cuisines: Cuisine[]; tint: string; compare: Ingredient | null; onCuisine: (id: string) => void }) {
  const rows = cuisines.map((c) => ({ c, v: ing.cuisines[c.id] ?? 0 })).sort((a, b) => b.v - a.v);
  const used = rows.filter((r) => r.v > 0);
  const top = used.filter((r) => r.v >= 3).map((r) => r.c.name);
  const rest = used.filter((r) => r.v < 3).map((r) => r.c.name);
  const sentence = used.length === 0 ? "Not tied to any one cuisine." : top.length ? `A classic in ${list(top)}${rest.length ? `; also used in ${list(rest)}` : ""}.` : `Used in ${list(rest)}.`;
  const shown = compare ? rows.filter((r) => r.v > 0 || (compare.cuisines[r.c.id] ?? 0) > 0) : used;
  const unused = rows.filter((r) => !shown.includes(r)).map((r) => r.c.name);
  return (
    <div>
      <p className="t-title text-[1.25rem]">{sentence}</p>
      <div className="mt-3 flex flex-col">
        {shown.map(({ c, v }) => (
          <Row key={c.id} label={c.name.replace("Chinese & Japanese", "Chinese & Jp.").replace("Mexican & Latin", "Mexican").replace("Southeast Asian", "SE Asian").replace("Middle Eastern", "Mid. Eastern")} value={v} max={4} word={TIER_WORD[v]} tint={tint}
            compare={compare ? { name: compare.name, value: compare.cuisines[c.id] ?? 0 } : null} onClick={v > 0 ? () => onCuisine(c.id) : undefined} />
        ))}
      </div>
      {unused.length > 0 && <p className="mt-2 text-[0.8125rem] text-muted">Not typical in {list(unused)}.</p>}
      {used.length > 0 && <p className="mt-1 text-[0.75rem] text-faint">Tap a cuisine to see partners from it.</p>}
    </div>
  );
}

export function ScaleChart({ title, value, labels, tint, compare }: { title: string; value: { lo: number; hi: number }; labels: string[]; tint: string; compare: { name: string; lo: number; hi: number } | null }) {
  const word = value.lo === value.hi ? cap(labels[value.lo]) : `${cap(labels[value.lo])} to ${labels[value.hi]}`;
  const pct = (n: number) => ((n - 1) / 4) * 100;
  return (
    <div>
      <p className="t-label-muted">{title}</p>
      <p className="t-title mt-1 text-[1.25rem]">{word}</p>
      <div className="relative mt-3 h-8">
        <div className="absolute inset-x-0 top-[11px] h-[10px] rounded-full bg-paper-deep" />
        {[1, 2, 3, 4, 5].map((n) => <span key={n} className="absolute top-[13px] size-1.5 -translate-x-1/2 rounded-full bg-pencil" style={{ left: `${pct(n)}%` }} />)}
        <span className="absolute top-[7px] h-[18px] rounded-full border-[1.5px] border-ink/40" style={{ left: `calc(${pct(value.lo)}% - 9px)`, width: `calc(${pct(value.hi) - pct(value.lo)}% + 18px)`, background: tint }} />
        {compare && <span className="absolute top-[28px] h-1.5 rounded-full bg-ink-2" style={{ left: `calc(${pct(compare.lo)}% - 4px)`, width: `calc(${pct(compare.hi) - pct(compare.lo)}% + 8px)` }} title={compare.name} />}
      </div>
      <div className="mt-1 flex justify-between text-[0.75rem] text-muted"><span>{cap(labels[1])}</span><span>{cap(labels[5])}</span></div>
      {compare && <p className="mt-1 text-[0.75rem] text-muted">Thin bar: {compare.name}, {compare.lo === compare.hi ? labels[compare.lo] : `${labels[compare.lo]} to ${labels[compare.hi]}`}</p>}
    </div>
  );
}

export { WEIGHT_LABEL, VOLUME_LABEL };
