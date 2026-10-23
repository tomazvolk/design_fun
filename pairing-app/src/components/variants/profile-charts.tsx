"use client";

import { cn } from "cn";
import type { Cuisine, Ingredient, Taste } from "@/lib/types";
import { TASTES, TIER_LABEL, VOLUME_LABEL, WEIGHT_LABEL, cap, scaleText, tasteName } from "@/lib/labels";
import { getLang, list, t } from "@/lib/i18n";

/*
 * Profile charts written to be read, not decoded: each starts with a plain sentence, then one labelled row per
 * dimension with a segmented bar and the value in words. An anchor can be laid under every row for comparison.
 */
const TASTE_WORD = (n: number) => t(["none", "a little", "clearly", "strongly"][n]);
const TIER_WORD = (n: number) => (n === 0 ? "—" : TIER_LABEL[n as 1 | 2 | 3 | 4]);

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
      <span className="truncate text-[0.9375rem] font-medium" title={label}>{label}</span>
      <span className="flex flex-col gap-1.5">
        <Segs value={value} max={max} fill={tint} />
        {compare && <Segs value={compare.value} max={max} fill="var(--ink-2)" thin />}
      </span>
      <span className="text-right text-[0.8125rem] text-ink-2">{word}{compare && <span className="block text-[0.6875rem] text-muted">{compare.name}: {compare.value === 0 ? "—" : max === 3 ? TASTE_WORD(compare.value) : TIER_WORD(compare.value)}</span>}</span>
    </Tag>
  );
}

/* Slovenian: the sentence describes "okus" (taste, masculine), so taste adjectives agree with it. */
const SL_TASTE: Record<Taste, string> = { sweet: "sladek", sour: "kisel", salty: "slan", bitter: "grenak", hot: "pekoč", astringent: "trpek" };

export function tasteSentence(ing: Ingredient): string {
  const by = (n: number) => TASTES.filter((x) => ing.taste[x] === n);
  if (getLang() === "sl") {
    const parts = [...by(3).map((x) => `zelo ${SL_TASTE[x]}`), ...by(2).map((x) => SL_TASTE[x]), ...by(1).map((x) => `rahlo ${SL_TASTE[x]}`)];
    return parts.length ? `Okus: ${list(parts)}.` : "Blag okus, brez izrazitega lastnega.";
  }
  const parts = [...by(3).map((x) => `very ${x}`), ...by(2), ...by(1).map((x) => `a little ${x}`)];
  return parts.length ? cap(list(parts)) + "." : "Mild, with no strong taste of its own.";
}

/** Slovenian cuisine adjectives in the locative ("v italijanski kuhinji"): each -a adjective takes -i. */
const loc = (name: string) => name.toLowerCase().split(" ").map((w) => (w.endsWith("a") ? `${w.slice(0, -1)}i` : w)).join(" ");

function cuisineSentence(top: string[], rest: string[]): string {
  if (getLang() === "sl") {
    if (top.length === 0 && rest.length === 0) return "Ni vezano na nobeno kuhinjo.";
    if (top.length === 0) return `Uporablja se v ${list(rest.map(loc))} kuhinji.`;
    return `Klasika v ${list(top.map(loc))} kuhinji${rest.length ? `; uporablja se tudi v ${list(rest.map(loc))}` : ""}.`;
  }
  if (top.length === 0 && rest.length === 0) return "Not tied to any one cuisine.";
  if (top.length === 0) return `Used in ${list(rest)}.`;
  return `A classic in ${list(top)}${rest.length ? `; also used in ${list(rest)}` : ""}.`;
}
const unusedSentence = (names: string[]) => (getLang() === "sl" ? `Ni značilno za ${list(names.map((n) => n.toLowerCase().replace(/a\b/g, "o")))} kuhinjo.` : `Not typical in ${list(names)}.`);
const shortCuisine = (name: string) => (getLang() === "sl" ? name.replace("Kitajska in japonska", "Kitajska, Japonska").replace("Mehiška in latinskoameriška", "Latinska Amerika").replace("Jugovzhodnoazijska", "JV Azija") : name.replace("Chinese & Japanese", "Chinese & Jp.").replace("Mexican & Latin", "Mexican").replace("Southeast Asian", "SE Asian").replace("Middle Eastern", "Mid. Eastern"));

export function TasteChart({ ing, tint, compare }: { ing: Ingredient; tint: string; compare: Ingredient | null }) {
  return (
    <div>
      <p className="t-title text-[1.25rem]">{tasteSentence(ing)}</p>
      <div className="mt-3 flex flex-col">
        {TASTES.map((x: Taste) => (
          <Row key={x} label={tasteName(x)} value={ing.taste[x]} max={3} word={TASTE_WORD(ing.taste[x])} tint={tint} compare={compare ? { name: compare.name, value: compare.taste[x] } : null} />
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
  const sentence = cuisineSentence(top, rest);
  const shown = compare ? rows.filter((r) => r.v > 0 || (compare.cuisines[r.c.id] ?? 0) > 0) : used;
  const unused = rows.filter((r) => !shown.includes(r)).map((r) => r.c.name);
  return (
    <div>
      <p className="t-title text-[1.25rem]">{sentence}</p>
      <div className="mt-3 flex flex-col">
        {shown.map(({ c, v }) => (
          <Row key={c.id} label={shortCuisine(c.name)} value={v} max={4} word={TIER_WORD(v)} tint={tint}
            compare={compare ? { name: compare.name, value: compare.cuisines[c.id] ?? 0 } : null} onClick={v > 0 ? () => onCuisine(c.id) : undefined} />
        ))}
      </div>
      {unused.length > 0 && <p className="mt-2 text-[0.8125rem] text-muted">{unusedSentence(unused)}</p>}
      {used.length > 0 && <p className="mt-1 text-[0.75rem] text-faint">{t("Tap a cuisine to see partners from it.")}</p>}
    </div>
  );
}

export function ScaleChart({ title, value, labels, tint, compare }: { title: string; value: { lo: number; hi: number }; labels: string[]; tint: string; compare: { name: string; lo: number; hi: number } | null }) {
  const word = cap(scaleText(value, labels));
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
      {compare && <p className="mt-1 text-[0.75rem] text-muted">{t("Thin bar: {name}, {value}", { name: compare.name, value: scaleText(compare, labels) })}</p>}
    </div>
  );
}

export { WEIGHT_LABEL, VOLUME_LABEL };
