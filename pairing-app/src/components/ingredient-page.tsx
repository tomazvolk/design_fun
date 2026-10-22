"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { exploreHref } from "@/lib/explore-state";
import type { Ingredient } from "@/lib/types";
import { useToast } from "./ui";
import { BentoProfile, BarsProfile, CardProfile, StudioProfile, TabsProfile, type ProfileProps } from "./variants/profile-views";
import { useVariant, VariantBar } from "./variants/shared";
import { SaveSheet } from "./explore";

const ARTIST = "Line & Leaf Studio";
const PROFILE_VERSIONS = ["Bento", "Tabs", "Bars", "Radar studio", "Card"];

/** The ingredient page in five versions (Bento, Tabs, Bars, Radar studio, Card), switchable at the top and remembered per device. */
export function IngredientPage() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { graph, saved, saveCombination, pushRecent } = useStore();
  const id = params.get("id") ?? "";
  const anchorKey = params.get("a") ?? "";
  const anchorIds = anchorKey.split(",").filter((x) => x && x !== id);
  const [saveFor, setSaveFor] = useState<string[] | null>(null);
  const [version, setVersion] = useVariant("pe:profile-version", PROFILE_VERSIONS.length);
  const ing = graph?.get(id);
  const anchors = useMemo(() => anchorKey.split(",").filter((x) => x && x !== id).map((a) => graph?.get(a)).filter((x): x is Ingredient => !!x), [graph, anchorKey, id]);
  const combos = useMemo(() => (graph && ing ? graph.combosFor(ing.id) : []), [graph, ing]);
  const mine = useMemo(() => saved.filter((c) => c.anchors.includes(id)), [saved, id]);

  if (!graph) return <div className="flex h-[70dvh] items-center justify-center text-muted">Loading…</div>;
  if (!ing) return <div className="px-6 pt-20 text-center"><p className="t-title text-[1.5rem]">No such ingredient.</p><Link href="/" className="mt-4 inline-block underline underline-offset-4">Back to search</Link></div>;

  const openMap = (ids: string[]) => { pushRecent(ing.id); router.push(exploreHref(ids)); };

  const onPair = (other: string) => openMap([ing.id, other]);
  const onCuisine = (c: string) => {
    if (!(ing.cuisines[c] >= 1)) { toast(`${ing.name} has no ${graph.cuisines.find((x) => x.id === c)?.name} link`); return; }
    pushRecent(ing.id);
    router.push(exploreHref([ing.id, ...anchorIds], { seasons: ["spring", "summer", "autumn", "winter"], categories: [], hideHubs: false, cuisine: c }));
  };
  const props: ProfileProps = { ing, anchors, graph, combos, mine, artist: ARTIST, onPair, onMore: () => openMap([ing.id]), onCuisine, onCombo: openMap, onHoldCombo: (ids) => setSaveFor(ids) };
  const View = [BentoProfile, TabsProfile, BarsProfile, StudioProfile, CardProfile][version - 1];

  return (
    <div className="pb-[calc(var(--safe-b)+104px)]">
      <div className="sticky top-0 z-20 bg-paper/92 px-3 pt-[calc(var(--safe-t)+8px)] pb-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Back" onClick={() => (history.length > 1 ? router.back() : router.push("/"))} className="fab size-10 shrink-0 [&_svg]:size-4"><ArrowLeftIcon /></button>
          <VariantBar value={version} onChange={setVersion} labels={PROFILE_VERSIONS} className="min-w-0 flex-1" />
        </div>
      </div>
      <div className="mx-auto mt-2 max-w-[1100px]">
        <View {...props} />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-paper via-paper/90 to-transparent px-5 pb-[calc(var(--safe-b)+16px)] pt-6 md:left-auto md:right-6 md:w-[360px] md:bg-none">
        <button type="button" className="btn-primary w-full" onClick={() => openMap([ing.id, ...anchorIds])}>{anchors.length > 0 ? "Back to the map" : "Explore from here"}</button>
      </div>
      <SaveSheet ids={saveFor} onClose={() => setSaveFor(null)} onSave={async (ids, note) => { const r = await saveCombination(ids, note); toast(r.ok ? "Saved" : r.reason); setSaveFor(null); }} />
    </div>
  );
}

