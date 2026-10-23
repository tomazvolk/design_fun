"use client";

import { setPref, usePref } from "./prefs";

/*
 * Skins: one seated figure in twelve materials. Picking one tints the glows and the mascot; nothing else
 * changes. Each skin carries its own three glow pigments and the tile it sits on in the picker.
 */
export type Skin = { id: string; name: string; tile: string; glows: [string, string, string] };

export const SKINS: Skin[] = [
  { id: "felt", name: "Felt", tile: "#e6e3e1", glows: ["#ffb3cc", "#cdbdf5", "#ffc4a6"] },
  { id: "chrome", name: "Chrome", tile: "#15161a", glows: ["#bfd3f5", "#cdbdf5", "#c6ead8"] },
  { id: "delft", name: "Delft", tile: "#dfe5ee", glows: ["#bfd3f5", "#d6e2f7", "#cdbdf5"] },
  { id: "rose", name: "Rose glass", tile: "#f5d6dc", glows: ["#ffb3cc", "#ffc4a6", "#ffd0a0"] },
  { id: "oil", name: "Oil paint", tile: "#efd9d6", glows: ["#ffc4a6", "#ffb3cc", "#cdbdf5"] },
  { id: "obsidian", name: "Obsidian", tile: "#cfd5de", glows: ["#bfd3f5", "#cdbdf5", "#d9dde6"] },
  { id: "terracotta", name: "Terracotta", tile: "#fdc7aa", glows: ["#ffc4a6", "#ffd0a0", "#ffb3cc"] },
  { id: "jade", name: "Jade", tile: "#d9ece2", glows: ["#c6ead8", "#bfd3f5", "#fdf0a6"] },
  { id: "marble", name: "Marble", tile: "#ecebe8", glows: ["#e3dfd8", "#cdbdf5", "#ffd0a0"] },
  { id: "holo", name: "Hologram", tile: "#dcdde3", glows: ["#cdbdf5", "#c6ead8", "#ffb3cc"] },
  { id: "lavender", name: "Lavender", tile: "#e4dcf5", glows: ["#cdbdf5", "#bfd3f5", "#ffb3cc"] },
  { id: "bronze", name: "Bronze", tile: "#2a211b", glows: ["#ffd0a0", "#ffc4a6", "#fdf0a6"] },
];

const KEY = "pe2:skin";
export function useSkin(): [Skin, (id: string) => void] {
  const id = usePref(KEY);
  return [SKINS.find((s) => s.id === id) ?? SKINS[0], (next) => setPref(KEY, next)];
}

/** The glow variables a skin sets on the app frame. */
export function skinStyle(s: Skin): React.CSSProperties {
  return { ["--glow-a" as string]: s.glows[0], ["--glow-b" as string]: s.glows[1], ["--glow-c" as string]: s.glows[2] };
}
