"use client";

import { cn } from "cn";
import { usePref, setPref } from "@/lib/prefs";
import type { Tier } from "@/lib/types";

/** Version switcher: a segmented control stored per screen on this device. */
export function useVariant(key: string, count: number): [number, (v: number) => void] {
  const raw = Number(usePref(key) ?? "1");
  const v = raw >= 1 && raw <= count ? raw : 1;
  return [v, (n: number) => setPref(key, String(n))];
}

export function VariantBar({ value, onChange, labels, className }: { value: number; onChange: (v: number) => void; labels: string[]; className?: string }) {
  return (
    <div className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-paper-deep p-1", className)} role="tablist" aria-label="Version">
      {labels.map((l, i) => (
        <button key={l} type="button" role="tab" aria-selected={value === i + 1} onClick={() => onChange(i + 1)}
          className={cn("h-8 shrink-0 rounded-full px-3 text-[0.75rem] font-semibold whitespace-nowrap transition-colors", value === i + 1 ? "bg-ink text-white" : "text-ink-2 hover:bg-card")}>
          <span className="tnum mr-1 opacity-60">{i + 1}</span>{l}
        </button>
      ))}
    </div>
  );
}

/** Strength meter: four bars, one per tier step. */
export function TierMeter({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span className={cn("inline-flex items-end gap-[2px]", className)} aria-label={`strength ${tier} of 4`}>
      {[1, 2, 3, 4].map((n) => <span key={n} className={cn("w-[4px] rounded-[1px]", n <= tier ? "bg-ink" : "bg-pencil")} style={{ height: 4 + n * 2.5 }} />)}
    </span>
  );
}

/** Dot pips, e.g. a taste score of 2 out of 3. */
export function Pips({ value, max, tint }: { value: number; max: number; tint?: string }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className="size-2.5 rounded-full border border-ink" style={{ background: i < Math.round(value) ? tint ?? "var(--ink)" : "transparent" }} />
      ))}
    </span>
  );
}

/** A five-step track with the ingredient's range filled. */
export function ScaleTrack({ lo, hi, labels, tint, anchors = [] }: { lo: number; hi: number; labels: [string, string]; tint: string; anchors?: { name: string; lo: number; hi: number }[] }) {
  const pct = (n: number) => ((n - 1) / 4) * 100;
  return (
    <div>
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-paper-deep" />
        {[1, 2, 3, 4, 5].map((n) => <span key={n} className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pencil" style={{ left: `${pct(n)}%` }} />)}
        {anchors.map((a) => <span key={a.name} title={a.name} className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-muted" style={{ left: `calc(${pct(a.lo)}% - 8px)`, width: `calc(${pct(a.hi) - pct(a.lo)}% + 16px)` }} />)}
        <span className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full border-[1.5px] border-ink" style={{ left: `calc(${pct(lo)}% - 10px)`, width: `calc(${pct(hi) - pct(lo)}% + 20px)`, background: tint }} />
      </div>
      <div className="mt-1 flex justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted"><span>{labels[0]}</span><span>{labels[1]}</span></div>
    </div>
  );
}

/** Horizontal bar with a label and value. */
export function HBar({ label, value, max, tint, suffix }: { label: string; value: number; max: number; tint: string; suffix?: string }) {
  return (
    <div className="grid grid-cols-[112px_1fr_auto] items-center gap-3 text-[0.875rem]">
      <span className="truncate text-ink-2">{label}</span>
      <span className="h-3 overflow-hidden rounded-full bg-paper-deep"><span className="block h-full rounded-full border-r-[1.5px] border-ink transition-[width] duration-500" style={{ width: `${Math.max(0, (value / max) * 100)}%`, background: tint, borderRightWidth: value > 0 ? 1.5 : 0 }} /></span>
      <span className="tnum min-w-8 text-right font-semibold whitespace-nowrap">{suffix ?? value}</span>
    </div>
  );
}
