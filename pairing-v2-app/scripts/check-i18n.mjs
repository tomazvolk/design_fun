/*
 * Lists every English string the app translates and fails if a language is missing any of them.
 * Strings are found as literals passed to t(), tr(), translate() and tn(), plus the label records in labels.ts.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(tsx?|mjs)$/.test(f) && !p.includes("i18n-sl")) files.push(p); } })(join(root, "src"));
const keys = new Set();
const lit = String.raw`"((?:[^"\\]|\\.)*)"`;
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(new RegExp(String.raw`\b(?:t|tr|translate)\(\s*` + lit, "g"))) keys.add(m[1]);
  for (const m of s.matchAll(new RegExp(String.raw`\btn\([^,]+,\s*` + lit + String.raw`\s*,\s*` + lit, "g"))) { keys.add(`PLURAL:${m[2]}`); }
}
const labels = readFileSync(join(root, "src/lib/labels.ts"), "utf8");
for (const block of labels.matchAll(/translated\(([\s\S]*?)\)\s*;/g)) for (const m of block[1].matchAll(/"([^"]+)"/g)) keys.add(m[1]);
for (const m of labels.matchAll(/label: "([^"]+)"/g)) keys.add(m[1]);
// Seasons, tastes, version labels and onboarding slides are translated from records.
for (const k of ["Spring", "Summer", "Autumn", "Winter", "Sweet", "Sour", "Salty", "Bitter", "Hot", "Astringent", "sweet", "sour", "salty", "bitter", "hot", "astringent",
  "Rows", "Grid", "Ranked", "Bubbles", "Compare", "Wheel", "Explore", "Saved", "Season", "small", "medium", "large", "none", "a little", "clearly", "strongly", "and",
  "very light", "light", "heavy", "very heavy", "very quiet", "quiet", "moderate", "loud", "very loud"]) keys.add(k);
keys.delete(", ");
const onb = readFileSync(join(root, "src/components/onboarding.tsx"), "utf8");
for (const m of onb.matchAll(/(?:title|body): "([^"]+)"/g)) keys.add(m[1]);

const { SL } = await import(join(root, "src/lib/i18n-sl.mjs"));
const missing = [...keys].filter((k) => (k.startsWith("PLURAL:") ? !Array.isArray(SL[k.slice(7)]) : !(k in SL)));
if (process.argv.includes("--list")) console.log([...keys].sort().join("\n"));
if (missing.length) { console.error(`Slovenian is missing ${missing.length} strings:\n` + missing.map((k) => `  ${k}`).join("\n")); process.exit(1); }
console.log(`i18n: ${keys.size} strings, Slovenian complete.`);
