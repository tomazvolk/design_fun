"use client";

import { locale, t } from "@/lib/i18n";
import { Glow } from "./mood";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { profileHref } from "@/lib/explore-state";
import { seasonForMonth } from "@/lib/graph";
import { CATEGORY_ORDER, CATEGORY_SHORT, CATEGORY_TINT, cap } from "@/lib/labels";
import type { Ingredient } from "@/lib/types";
import { Chip, SectionLabel } from "./ui";
import { Mark } from "./illustrations";

const GLOW: Record<string, string> = { spring: "var(--g-mint)", summer: "var(--g-lemon)", autumn: "var(--g-apricot)", winter: "var(--g-sky)" };

/** Season tab: what is in season this month in the user's hemisphere, grouped by category. Tap to start a map. */
export function SeasonScreen() {
  const { graph, hemisphere, setHemisphere, pushRecent } = useStore();
  const router = useRouter();
  const month = new Date().getMonth();
  const season = seasonForMonth(month, hemisphere);
  const list = graph ? graph.inSeason(month, hemisphere) : [];
  const groups = CATEGORY_ORDER.map((c) => ({ cat: c, items: list.filter((i) => i.cat === c) })).filter((g) => g.items.length > 0);
  const open = (i: Ingredient) => { pushRecent(i.id); router.push(profileHref(i.id)); };
  const monthName = new Intl.DateTimeFormat(locale(), { month: "long" }).format(new Date());
  return (
    <div className="relative px-4 pt-[calc(var(--safe-t)+28px)] md:px-8">
      <Glow variant="rise" tint={GLOW[season]} />
      <div className="relative text-center">
        <p className="t-label t-accent">{t("In season now")}</p>
        <h1 className="t-display mt-3 text-[3.25rem]">{t(cap(season))}</h1>
        <p className="t-title t-italic text-[1.375rem] text-muted">{t("in {month}", { month: monthName })}</p>
      </div>
      <div className="relative mt-6 flex justify-center gap-2" role="radiogroup" aria-label={t("Hemisphere")}>
        <Chip size="sm" on={hemisphere === "north"} muted onClick={() => setHemisphere("north")} pressed={hemisphere === "north"}>{t("Northern hemisphere")}</Chip>
        <Chip size="sm" on={hemisphere === "south"} muted onClick={() => setHemisphere("south")} pressed={hemisphere === "south"}>{t("Southern")}</Chip>
      </div>
      {!graph && <p className="mt-8 text-muted">{t("Loading…")}</p>}
      {groups.map((g) => (
        <section key={g.cat} className="relative mt-9">
          <div className="flex items-center gap-2"><span className="mark" style={{ width: 12, height: 12, ["--tint" as string]: CATEGORY_TINT[g.cat] }} /><SectionLabel muted>{CATEGORY_SHORT[g.cat]}</SectionLabel></div>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {g.items.map((i) => (
              <button key={i.id} type="button" onClick={() => open(i)} className="card flex flex-col items-center gap-2 px-2 pt-4 pb-3 transition-transform active:scale-[0.97]">
                <Mark art={i.art} cat={i.cat} photo={i.photo} image={i.image} size={64} />
                <span className="t-title text-center text-[1rem] leading-tight">{i.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
