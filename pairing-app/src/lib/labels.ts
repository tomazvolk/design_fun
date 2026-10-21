import type { Category, Season, Taste, Tier } from "./types";

/** Fixed category order around the ring: herbs at 12 o'clock, then clockwise (PRD screen 2). */
export const CATEGORY_ORDER: Category[] = ["herb", "spice", "vegetable", "fruit", "protein", "seafood", "dairy", "grain", "nut", "oil", "acid", "sweetener", "alcohol", "condiment", "other"];
export const CATEGORY_LABEL: Record<Category, string> = {
  herb: "Herb", spice: "Spice", vegetable: "Vegetable", fruit: "Fruit", protein: "Protein", seafood: "Seafood", dairy: "Dairy", grain: "Grain & pulse",
  nut: "Nut & seed", oil: "Oil", acid: "Acid", sweetener: "Sweetener", alcohol: "Alcohol", condiment: "Condiment", other: "Other",
};
/** Category tints, one family; used only inside the plates (wheel, radars, arcs, marks). */
export const CATEGORY_TINT: Record<Category, string> = {
  herb: "var(--c-herb)", spice: "var(--c-spice)", vegetable: "var(--c-vegetable)", fruit: "var(--c-fruit)", protein: "var(--c-protein)",
  seafood: "var(--c-seafood)", dairy: "var(--c-dairy)", grain: "var(--c-grain)", nut: "var(--c-nut)", oil: "var(--c-oil)", acid: "var(--c-acid)",
  sweetener: "var(--c-sweetener)", alcohol: "var(--c-alcohol)", condiment: "var(--c-condiment)", other: "var(--c-other)",
};
export const CATEGORY_SHORT: Record<Category, string> = {
  herb: "Herbs", spice: "Spices", vegetable: "Vegetables", fruit: "Fruit", protein: "Meat & eggs", seafood: "Seafood", dairy: "Dairy", grain: "Grains",
  nut: "Nuts", oil: "Oils", acid: "Acids", sweetener: "Sweet", alcohol: "Drinks", condiment: "Condiments", other: "Other",
};
export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
export const TASTES: Taste[] = ["sweet", "sour", "salty", "bitter", "hot", "astringent"];
export const TIER_LABEL: Record<Tier, string> = { 4: "Holy grail", 3: "Classic", 2: "Recommended", 1: "Works" };
export const RING_LABEL = ["Classic", "Recommended", "Works"] as const;
export const WEIGHT_LABEL = ["", "very light", "light", "medium", "heavy", "very heavy"];
export const VOLUME_LABEL = ["", "very quiet", "quiet", "moderate", "loud", "very loud"];

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const tierWord = (t: Tier) => TIER_LABEL[t];
export function seasonText(season: "all" | Season[]): string { return season === "all" ? "all year" : season.map(cap).join(", "); }
export function scaleText(v: { lo: number; hi: number }, labels: string[]): string {
  return v.lo === v.hi ? labels[v.lo] : `${labels[v.lo]} to ${labels[v.hi]}`;
}
/** F6: when an edge has no reason text, say the reason type as a sentence. */
export function reasonSentence(type: string, a: string, b: string): string {
  if (type === "classic") return `A classic pairing with ${b}.`;
  if (type.startsWith("shared-")) return `Shared taste: both ${type.slice(7)}.`;
  if (type === "contrast") return `Contrast: sweetness against ${b}'s edge.`;
  if (type.startsWith("cuisine-")) return `Both at home in the same cuisine.`;
  return `Works with ${b}.`;
}
export const seasonEmoji: Record<Season, string> = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" };
