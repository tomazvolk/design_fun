"use client";

import { t } from "@/lib/i18n";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { CATEGORY_SHORT, CATEGORY_TINT } from "@/lib/labels";
import { useStore } from "@/lib/store";
import { exploreHref, profileHref } from "@/lib/explore-state";
import type { Ingredient } from "@/lib/types";
import { useToast } from "./ui";
import { Glow, LoadingCard } from "./mood";
import { useSaveFlow } from "./save-flow";
import { BentoProfile, type ProfileProps } from "./variants/profile-views";

const ARTIST = "Line & Leaf Studio";

/** The ingredient profile (Bento): what every tap on an ingredient opens first; the bottom button opens the pairing map. */
export function IngredientPage() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { graph, saved, pushRecent } = useStore();
  const { save } = useSaveFlow();
  const id = params.get("id") ?? "";
  const anchorKey = params.get("a") ?? "";
  const anchorIds = anchorKey.split(",").filter((x) => x && x !== id);
  const ing = graph?.get(id);
  const anchors = useMemo(() => anchorKey.split(",").filter((x) => x && x !== id).map((a) => graph?.get(a)).filter((x): x is Ingredient => !!x), [graph, anchorKey, id]);
  const combos = useMemo(() => (graph && ing ? graph.combosFor(ing.id) : []), [graph, ing]);
  const mine = useMemo(() => saved.filter((c) => c.anchors.includes(id)), [saved, id]);

  if (!graph) return <div className="flex h-[70dvh] items-center justify-center px-6"><LoadingCard className="w-full max-w-[320px]" /></div>;
  if (!ing) return <div className="px-6 pt-24 text-center"><p className="t-display t-italic text-[2.25rem]">{t("No such ingredient.")}</p><Link href="/" className="btn-primary mt-8">{t("Back to search")}</Link></div>;

  const openMap = (ids: string[]) => { pushRecent(ing.id); router.push(exploreHref(ids)); };

  const onPair = (other: string) => { pushRecent(other); router.push(profileHref(other, [ing.id, ...anchorIds])); };
  const onCuisine = (c: string) => {
    if (!(ing.cuisines[c] >= 1)) { toast(`${ing.name} has no ${graph.cuisines.find((x) => x.id === c)?.name} link`); return; }
    pushRecent(ing.id);
    router.push(exploreHref([ing.id, ...anchorIds], { seasons: ["spring", "summer", "autumn", "winter"], categories: [], hideHubs: false, cuisine: c }));
  };
  const props: ProfileProps = { ing, anchors, graph, combos, mine, artist: ARTIST, onPair, onMore: () => openMap([ing.id]), onCuisine, onCombo: openMap, onHoldCombo: (ids) => save(ids) };

  return (
    <div className="relative pb-[120px]">
      <Glow variant="halo" tint={CATEGORY_TINT[ing.cat]} />
      <div className="sticky top-0 z-20 grid grid-cols-[48px_1fr_48px] items-center bg-paper/85 px-2 pt-[calc(var(--safe-t)+6px)] pb-1 backdrop-blur-md">
        <button type="button" aria-label={t("Back")} onClick={() => (history.length > 1 ? router.back() : router.push("/"))} className="inline-flex size-12 items-center justify-center text-ink-2"><ChevronDownIcon className="size-6" strokeWidth={1.6} /></button>
        <p className="truncate text-center text-[1.0625rem] text-ink">{CATEGORY_SHORT[ing.cat]}</p>
        <span />
      </div>
      <div className="relative mx-auto mt-2 max-w-[1100px]">
        <BentoProfile {...props} />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-h)+var(--safe-b))] z-20 flex flex-col items-center px-5 pb-4 pt-16" style={{ background: `linear-gradient(to top, color-mix(in srgb, ${CATEGORY_TINT[ing.cat]} 55%, var(--paper)) 0%, color-mix(in srgb, ${CATEGORY_TINT[ing.cat]} 30%, var(--paper)) 45%, transparent 100%)` }}>
        <div className="pointer-events-auto flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary" onClick={() => openMap(anchorIds.length ? [...anchorIds, ing.id] : [ing.id])}>→ {anchors.length > 0 ? t("Add to the map") : t("See what pairs")}</button>
          {anchors.length > 0 && <button type="button" className="btn-secondary bg-white/40" onClick={() => save([...anchorIds, ing.id])}>{t("Save this pairing")}</button>}
        </div>
      </div>
    </div>
  );
}
