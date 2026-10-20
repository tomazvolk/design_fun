"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadGraph, PairingGraph } from "./graph";
import { db, newId } from "./db";
import type { Combination } from "./types";
import { BASE_PATH, FREE_SAVED_LIMIT, RECENTS_MAX } from "./config";
import { getPref, setPref, useMediaQuery, useMounted, useOnline, usePref } from "./prefs";

type Hemisphere = "north" | "south";

type Store = {
  graph: PairingGraph | null;
  graphError: string | null;
  online: boolean;
  recents: string[];
  pushRecent: (id: string) => void;
  saved: Combination[];
  savedLoaded: boolean;
  saveCombination: (anchors: string[], note: string) => Promise<{ ok: true; id: string } | { ok: false; reason: string }>;
  deleteCombination: (id: string) => Promise<void>;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  hemisphere: Hemisphere;
  setHemisphere: (h: Hemisphere) => void;
  /** iOS Safari has no install prompt: show a one-time hint after the second visit, or after a save. */
  installHint: boolean;
  dismissInstallHint: () => void;
  requestInstallHint: () => void;
  installed: boolean;
  updateReady: boolean;
  applyUpdate: () => void;
};

const Ctx = createContext<Store | null>(null);

const LS = { onboarded: "pe:onboarded", visits: "pe:visits", hint: "pe:install-hint-shown", hemisphere: "pe:hemisphere" };

const SOUTHERN_TZ = /^(Australia|Pacific\/(Auckland|Fiji|Tongatapu|Apia|Chatham)|America\/(Sao_Paulo|Argentina|Buenos_Aires|Santiago|Montevideo|Lima|La_Paz|Asuncion)|Africa\/(Johannesburg|Windhoek|Maputo|Harare|Lusaka|Gaborone)|Indian\/(Mauritius|Reunion)|Antarctica)/;
function guessHemisphere(): Hemisphere {
  try { return SOUTHERN_TZ.test(Intl.DateTimeFormat().resolvedOptions().timeZone ?? "") ? "south" : "north"; } catch { return "north"; }
}
function isIosSafariBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone) || window.matchMedia("(display-mode: standalone)").matches;
  return ios && !standalone;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [graph, setGraph] = useState<PairingGraph | null>(null);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [saved, setSaved] = useState<Combination[]>([]);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const waiting = useRef<ServiceWorker | null>(null);

  const mounted = useMounted();
  const online = useOnline();
  const installed = useMediaQuery("(display-mode: standalone)");
  const onboarded = usePref(LS.onboarded) === "1";
  const hemispherePref = usePref(LS.hemisphere) as Hemisphere | null;
  const hemisphere: Hemisphere = hemispherePref ?? (mounted ? guessHemisphere() : "north");
  const visits = Number(usePref(LS.visits) ?? "0");
  const hintShown = usePref(LS.hint) === "1";
  const installHint = mounted && !hintShown && isIosSafariBrowser() && (visits >= 2 || nudge);

  useEffect(() => {
    loadGraph(`${BASE_PATH}/graph.json`).then(setGraph).catch((e: Error) => setGraphError(e.message));
    db.getKv<string[]>("recents").then((r) => { if (r) setRecents(r); });
    db.allCombinations().then((all) => { setSaved(all.sort((x, y) => y.created - x.created)); setSavedLoaded(true); });
    setPref(LS.visits, String(Number(getPref(LS.visits) ?? "0") + 1));
  }, []);

  // Service worker: register, and surface a waiting worker as "update ready" (switches on next launch, or now on tap).
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    let reg: ServiceWorkerRegistration | undefined;
    navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` }).then((r) => {
      reg = r;
      if (r.waiting && navigator.serviceWorker.controller) { waiting.current = r.waiting; setUpdateReady(true); }
      r.addEventListener("updatefound", () => {
        const w = r.installing;
        w?.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) { waiting.current = w; setUpdateReady(true); }
        });
      });
    }).catch(() => { /* registration is best effort */ });
    let refreshing = false;
    const onChange = () => { if (!refreshing) { refreshing = true; window.location.reload(); } };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    const onVisible = () => { if (document.visibilityState === "visible") reg?.update().catch(() => {}); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { navigator.serviceWorker.removeEventListener("controllerchange", onChange); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  const pushRecent = useCallback((id: string) => {
    setRecents((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, RECENTS_MAX);
      db.setKv("recents", next).catch(() => {});
      return next;
    });
  }, []);

  const saveCombination = useCallback<Store["saveCombination"]>(async (anchors, note) => {
    if (saved.length >= FREE_SAVED_LIMIT) return { ok: false, reason: `Up to ${FREE_SAVED_LIMIT} saved combinations in the free tier.` };
    const c: Combination = { id: newId(), anchors: [...anchors], note: note.trim(), created: Date.now() };
    try { await db.putCombination(c); } catch { return { ok: false, reason: "Could not save on this device." }; }
    setSaved((prev) => [c, ...prev]);
    setNudge(true);
    return { ok: true, id: c.id };
  }, [saved.length]);

  const deleteCombination = useCallback(async (id: string) => {
    await db.deleteCombination(id).catch(() => {});
    setSaved((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo<Store>(() => ({
    graph, graphError, online, recents, pushRecent, saved, savedLoaded, saveCombination, deleteCombination,
    onboarded, setOnboarded: (v) => setPref(LS.onboarded, v ? "1" : "0"),
    hemisphere, setHemisphere: (h) => setPref(LS.hemisphere, h),
    installHint, dismissInstallHint: () => setPref(LS.hint, "1"), requestInstallHint: () => setNudge(true),
    installed, updateReady,
    applyUpdate: () => { waiting.current?.postMessage("skip-waiting"); },
  }), [graph, graphError, online, recents, pushRecent, saved, savedLoaded, saveCombination, deleteCombination, onboarded, hemisphere, installHint, installed, updateReady]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
