import type { Category, Season, Taste, Tier } from "./types";
import { t } from "./i18n";

/** A label record whose values are English and translate on every read, so call sites stay `LABEL[key]`. */
function translated<T extends object>(o: T): T {
  return new Proxy(o, { get: (target, key) => { const v = Reflect.get(target, key); return typeof v === "string" && v ? t(v) : v; } });
}

/** Fixed category order around the ring: herbs at 12 o'clock, then clockwise (PRD screen 2). */
export const CATEGORY_ORDER: Category[] = ["herb", "spice", "vegetable", "fruit", "protein", "seafood", "dairy", "grain", "nut", "oil", "acid", "sweetener", "alcohol", "condiment", "other"];
export const CATEGORY_LABEL: Record<Category, string> = translated({
  herb: "Herb", spice: "Spice", vegetable: "Vegetable", fruit: "Fruit", protein: "Protein", seafood: "Seafood", dairy: "Dairy", grain: "Grain & pulse",
  nut: "Nut & seed", oil: "Oil", acid: "Acid", sweetener: "Sweetener", alcohol: "Alcohol", condiment: "Condiment", other: "Other",
});
/** Category tints, one family; used only inside the plates (wheel, radars, arcs, marks). */
export const CATEGORY_TINT: Record<Category, string> = {
  herb: "var(--c-herb)", spice: "var(--c-spice)", vegetable: "var(--c-vegetable)", fruit: "var(--c-fruit)", protein: "var(--c-protein)",
  seafood: "var(--c-seafood)", dairy: "var(--c-dairy)", grain: "var(--c-grain)", nut: "var(--c-nut)", oil: "var(--c-oil)", acid: "var(--c-acid)",
  sweetener: "var(--c-sweetener)", alcohol: "var(--c-alcohol)", condiment: "var(--c-condiment)", other: "var(--c-other)",
};
export const CATEGORY_SHORT: Record<Category, string> = translated({
  herb: "Herbs", spice: "Spices", vegetable: "Vegetables", fruit: "Fruit", protein: "Meat & eggs", seafood: "Seafood", dairy: "Dairy", grain: "Grains",
  nut: "Nuts", oil: "Oils", acid: "Acids", sweetener: "Sweet", alcohol: "Drinks", condiment: "Condiments", other: "Other",
});
/** Seven families around the wheel, in fixed order clockwise from 12 o'clock. */
export const FAMILIES: { id: string; label: string; tint: string; cats: Category[] }[] = ([
  { id: "herbs", label: "Herbs & spices", tint: "var(--f-herbs)", cats: ["herb", "spice"] },
  { id: "veg", label: "Vegetables", tint: "var(--f-veg)", cats: ["vegetable"] },
  { id: "fruit", label: "Fruit", tint: "var(--f-fruit)", cats: ["fruit"] },
  { id: "meat", label: "Meat & fish", tint: "var(--f-meat)", cats: ["protein", "seafood"] },
  { id: "dairy", label: "Dairy", tint: "var(--f-dairy)", cats: ["dairy"] },
  { id: "grains", label: "Grains & nuts", tint: "var(--f-grains)", cats: ["grain", "nut"] },
  { id: "pantry", label: "Pantry & drinks", tint: "var(--f-pantry)", cats: ["oil", "acid", "sweetener", "condiment", "alcohol", "other"] },
] as { id: string; label: string; tint: string; cats: Category[] }[]).map((f) => translated(f));
export const familyOf = (c: Category) => FAMILIES.find((f) => f.cats.includes(c))!;
export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
export const TASTES: Taste[] = ["sweet", "sour", "salty", "bitter", "hot", "astringent"];
export const TIER_LABEL: Record<Tier, string> = translated({ 4: "Holy grail", 3: "Classic", 2: "Recommended", 1: "Works" });
export const RING_LABEL = ["Classic", "Recommended", "Works"] as const;
export const WEIGHT_LABEL = translated(["", "very light", "light", "medium", "heavy", "very heavy"]);
export const VOLUME_LABEL = translated(["", "very quiet", "quiet", "moderate", "loud", "very loud"]);

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const tierWord = (t: Tier) => TIER_LABEL[t];
export const seasonName = (s: Season) => t(cap(s));
export const tasteName = (x: Taste) => t(cap(x));
export function seasonText(season: "all" | Season[]): string { return season === "all" ? t("all year") : season.map(seasonName).join(", "); }
export function scaleText(v: { lo: number; hi: number }, labels: string[]): string {
  return v.lo === v.hi ? labels[v.lo] : t("{a} to {b}", { a: labels[v.lo], b: labels[v.hi] });
}
/** F6: when an edge has no reason text, say the reason type as a sentence. */
export function reasonSentence(type: string, a: string, b: string): string {
  if (type === "classic") return t("A classic pairing with {b}.", { b });
  if (type.startsWith("shared-")) return t("Shared taste: both {taste}.", { taste: t(type.slice(7)) });
  if (type === "contrast") return t("Contrast: sweetness against the edge of {b}.", { b });
  if (type.startsWith("cuisine-")) return t("Both at home in the same cuisine.");
  return t("Works with {b}.", { b });
}

