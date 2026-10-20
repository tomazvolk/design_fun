"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { exploreHref } from "@/lib/explore-state";
import { seasonForMonth } from "@/lib/graph";
import { CATEGORY_LABEL, CATEGORY_ORDER, cap } from "@/lib/labels";
import type { Category, Ingredient } from "@/lib/types";
import { Chip, SectionLabel } from "./ui";
import { Illustration } from "./illustrations";

const WASH: Record<string, string> = { spring: "var(--mint)", summer: "var(--butter)", autumn: "var(--peach)", winter: "var(--sky)" };
const HERO: Record<string, { art: string; cat: Category }> = { spring: { art: "pea", cat: "vegetable" }, summer: { art: "tomato", cat: "vegetable" }, autumn: { art: "squash", cat: "vegetable" }, winter: { art: "orange", cat: "fruit" } };

/** Season tab: what is in season this month in the user's hemisphere, grouped by category. Tap to start a map. */
export function SeasonScreen() {
  const { graph, hemisphere, setHemisphere, pushRecent } = useStore();
  const router = useRouter();
  const month = new Date().getMonth();
  const season = seasonForMonth(month, hemisphere);
  const list = graph ? graph.inSeason(month, hemisphere) : [];
  const groups = CATEGORY_ORDER.map((c) => ({ cat: c, items: list.filter((i) => i.cat === c) })).filter((g) => g.items.length > 0);
  const open = (i: Ingredient) => { pushRecent(i.id); router.push(exploreHref([i.id])); };
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(new Date());
  return (
    <div className="px-4 pt-[calc(var(--safe-t)+20px)] md:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionLabel muted>{monthName}</SectionLabel>
          <h1 className="t-display mt-1 text-[2.5rem]">{cap(season)}</h1>
        </div>
        <Illustration art={HERO[season].art} cat={HERO[season].cat} size={88} wash={WASH[season]} strokeWidth={1.6} className="shrink-0 text-ink" />
      </div>
      <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Hemisphere">
        <Chip size="sm" on={hemisphere === "north"} muted onClick={() => setHemisphere("north")} pressed={hemisphere === "north"}>Northern hemisphere</Chip>
        <Chip size="sm" on={hemisphere === "south"} muted onClick={() => setHemisphere("south")} pressed={hemisphere === "south"}>Southern</Chip>
      </div>
      {!graph && <p className="mt-8 text-muted">Loading…</p>}
      {groups.map((g) => (
        <section key={g.cat} className="mt-8">
          <SectionLabel>{CATEGORY_LABEL[g.cat]}</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">{g.items.map((i) => <Chip key={i.id} onClick={() => open(i)}>{i.name}</Chip>)}</div>
        </section>
      ))}
    </div>
  );
}
