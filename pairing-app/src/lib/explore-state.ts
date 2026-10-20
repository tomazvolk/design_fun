"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, Filters, Season } from "./types";
import { CATEGORY_ORDER, SEASONS } from "./labels";
import { MAX_ANCHORS } from "./config";

export const DEFAULT_FILTERS: Filters = { seasons: [...SEASONS], categories: [...CATEGORY_ORDER], hideHubs: false, cuisine: null };
const SS_KEY = "pe:filters";

/**
 * F2: the anchor set lives in the URL (?a=fennel,orange) so back/forward and share links work.
 * F5: filters live in the URL too and persist for the session; they reset on app restart.
 */
export function useExploreState() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const anchors = useMemo(() => (params.get("a") ?? "").split(",").filter(Boolean).slice(0, MAX_ANCHORS), [params]);
  const filters = useMemo<Filters>(() => {
    const has = params.has("s") || params.has("c") || params.has("h") || params.has("k");
    if (!has) {
      try { const stored = sessionStorage.getItem(SS_KEY); if (stored) return { ...DEFAULT_FILTERS, ...(JSON.parse(stored) as Partial<Filters>) }; } catch { /* no session storage */ }
      return DEFAULT_FILTERS;
    }
    const seasons = params.has("s") ? (params.get("s") ?? "").split(",").filter((s): s is Season => (SEASONS as string[]).includes(s)) : [...SEASONS];
    const categories = params.has("c") ? (params.get("c") ?? "").split(",").filter((c): c is Category => (CATEGORY_ORDER as string[]).includes(c)) : [...CATEGORY_ORDER];
    return { seasons, categories, hideHubs: params.get("h") === "1", cuisine: params.get("k") || null };
  }, [params]);

  useEffect(() => {
    try { sessionStorage.setItem(SS_KEY, JSON.stringify(filters)); } catch { /* ignore */ }
  }, [filters]);

  const navigate = useCallback((next: { anchors?: string[]; filters?: Filters }, mode: "push" | "replace") => {
    const href = exploreHref(next.anchors ?? anchors, next.filters ?? filters);
    if (mode === "push") router.push(href); else router.replace(href);
  }, [anchors, filters, router]);

  return {
    anchors, filters, pathname,
    setAnchors: (ids: string[]) => navigate({ anchors: ids.slice(0, MAX_ANCHORS) }, "push"),
    setFilters: (f: Filters) => navigate({ filters: f }, "replace"),
    filterCount: countNonDefault(filters),
  };
}

export function exploreHref(anchors: string[], filters: Filters = DEFAULT_FILTERS): string {
  const q = new URLSearchParams();
  if (anchors.length) q.set("a", anchors.join(","));
  if (filters.seasons.length !== SEASONS.length) q.set("s", filters.seasons.join(","));
  if (filters.categories.length !== CATEGORY_ORDER.length) q.set("c", filters.categories.join(","));
  if (filters.hideHubs) q.set("h", "1");
  if (filters.cuisine) q.set("k", filters.cuisine);
  const s = q.toString();
  return s ? `/?${s}` : "/";
}

export function countNonDefault(f: Filters): number {
  let n = 0;
  if (f.seasons.length !== SEASONS.length) n++;
  if (f.categories.length !== CATEGORY_ORDER.length) n++;
  if (f.hideHubs) n++;
  if (f.cuisine) n++;
  return n;
}
