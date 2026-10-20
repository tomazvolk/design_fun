"use client";

import { useSyncExternalStore } from "react";

/*
 * Small external stores over browser APIs, read through useSyncExternalStore so components never
 * set state inside effects just to hydrate from localStorage, navigator.onLine or matchMedia.
 */
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
function subscribePrefs(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => { listeners.delete(l); window.removeEventListener("storage", l); };
}
export function getPref(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
export function setPref(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* storage blocked */ } emit(); }
export function usePref(key: string): string | null { return useSyncExternalStore(subscribePrefs, () => getPref(key), () => null); }

const noop = () => () => {};
export function useMounted(): boolean { return useSyncExternalStore(noop, () => true, () => false); }

function subscribeOnline(l: () => void) {
  window.addEventListener("online", l); window.addEventListener("offline", l);
  return () => { window.removeEventListener("online", l); window.removeEventListener("offline", l); };
}
export function useOnline(): boolean { return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true); }

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (l) => { const m = window.matchMedia(query); m.addEventListener("change", l); return () => m.removeEventListener("change", l); },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
