"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { profileHref } from "@/lib/explore-state";
import { seasonForMonth } from "@/lib/graph";
import { CATEGORY_ORDER, CATEGORY_SHORT, CATEGORY_TINT, cap } from "@/lib/labels";
import type { Category, Ingredient } from "@/lib/types";
import { Chip, SectionLabel } from "./ui";
import { Illustration, Mark } from "./illustrations";

const WASH: Record<string, string> = { spring: "var(--c-herb)", summer: "var(--c-acid)", autumn: "var(--c-spice)", winter: "var(--c-seafood)" };
const HERO: Record<string, { art: string; cat: Category }> = { spring: { art: "pea", cat: "vegetable" }, summer: { art: "tomato", cat: "vegetable" }, autumn: { art: "squash", cat: "vegetable" }, winter: { art: "orange", cat: "fruit" } };

/** Season tab: what is in season this month in the user's hemisphere, grouped by category. Tap to start a map. */
export function SeasonScreen() {
  const { graph, hemisphere, setHemisphere, pushRecent } = useStore();
  const router = useRouter();
  const month = new Date().getMonth();
  const season = seasonForMonth(month, hemisphere);
  const list = graph ? graph.inSeason(month, hemisphere) : [];
  const groups = CATEGORY_ORDER.map((c) => ({ cat: c, items: list.filter((i) => i.cat === c) })).filter((g) => g.items.length > 0);
  const open = (i: Ingredient) => { pushRecent(i.id); router.push(profileHref(i.id)); };
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date());
  return (
    <div className="px-4 pt-[calc(var(--safe-t)+20px)] md:px-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="t-display text-[2.75rem]">{cap(season)}<span className="block text-[1.125rem] text-muted">in {monthName}</span></h1>
        <Illustration art={HERO[season].art} cat={HERO[season].cat} size={104} wash={WASH[season]} strokeWidth={1.4} className="shrink-0 text-ink" />
      </div>
      <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Hemisphere">
        <Chip size="sm" on={hemisphere === "north"} muted onClick={() => setHemisphere("north")} pressed={hemisphere === "north"}>Northern hemisphere</Chip>
        <Chip size="sm" on={hemisphere === "south"} muted onClick={() => setHemisphere("south")} pressed={hemisphere === "south"}>Southern</Chip>
      </div>
      {!graph && <p className="mt-8 text-muted">Loading…</p>}
      {groups.map((g) => (
        <section key={g.cat} className="mt-8">
          <div className="flex items-center gap-2"><span className="mark" style={{ width: 14, height: 14, ["--tint" as string]: CATEGORY_TINT[g.cat] }} /><SectionLabel>{CATEGORY_SHORT[g.cat]}</SectionLabel></div>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {g.items.map((i) => (
              <button key={i.id} type="button" onClick={() => open(i)} className="card flex flex-col items-center gap-2 px-2 pt-4 pb-3 transition-transform active:scale-[0.97]">
                <Mark art={i.art} cat={i.cat} size={60} />
                <span className="t-title text-center text-[0.9375rem] leading-tight">{i.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
