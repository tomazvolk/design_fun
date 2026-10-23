import { SL } from "./i18n-sl.mjs";

/*
 * Translation layer. Strings are written in English in the code and looked up by their English text, so a
 * missing translation falls back to English instead of showing a key. The active language is module state:
 * the store sets it, then remounts the app tree so every t() call re-reads it (see StoreProvider).
 */
export type Lang = "en" | "sl";
export const LANGS: { id: Lang; label: string; locale: string }[] = [
  { id: "en", label: "English", locale: "en-GB" },
  { id: "sl", label: "Slovenščina", locale: "sl-SI" },
];

type Entry = string | [one: string, two: string, few: string, other: string];
const DICT: Record<Exclude<Lang, "en">, Record<string, Entry>> = { sl: SL };

let current: Lang = "en";
export const setLang = (l: Lang) => { current = l; };
export const getLang = (): Lang => current;
export const locale = (): string => LANGS.find((l) => l.id === current)!.locale;

function fill(s: string, vars?: Record<string, string | number>): string {
  return vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : s;
}

/** Translate an English string; {name} placeholders are filled from vars. */
export function t(en: string, vars?: Record<string, string | number>): string {
  if (current === "en") return fill(en, vars);
  const e = DICT[current][en];
  return fill(typeof e === "string" ? e : Array.isArray(e) ? e[3] : en, vars);
}

/** Plural: English one/other; Slovenian has four forms (1, 2, 3–4, 5+), keyed by the English "other" text. */
export function tn(n: number, one: string, other: string, vars?: Record<string, string | number>): string {
  const v = { n, ...vars };
  if (current === "en") return fill(n === 1 ? one : other, v);
  const e = DICT[current][other];
  if (!Array.isArray(e)) return fill(typeof e === "string" ? e : n === 1 ? one : other, v);
  const m = Math.abs(n) % 100;
  return fill(m === 1 ? e[0] : m === 2 ? e[1] : m === 3 || m === 4 ? e[2] : e[3], v);
}

/** Join a list with commas and a final "and" in the active language. */
export function list(xs: string[]): string {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} ${t("and")} ${xs.at(-1)}`;
}

/** Strings to translate that are not passed to t() literally (labels from records). Read by scripts/check-i18n.mjs. */
export const EXTRA_KEYS: string[] = [];
