export type Tier = 1 | 2 | 3 | 4;
export type Taste = "sweet" | "sour" | "salty" | "bitter" | "hot" | "astringent";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Category = "herb" | "spice" | "vegetable" | "fruit" | "protein" | "seafood" | "dairy" | "grain" | "nut" | "oil" | "acid" | "sweetener" | "alcohol" | "condiment" | "other";

/** A Pexels photo: the original's URL plus credit. Sized copies come from photoUrl(). */
export type Photo = { provider: "pexels" | "unsplash"; id: number | string; src: string; w: number; h: number; by: string; byUrl: string; url: string; color: string; alt: string };

export type Scale = { v: number; lo: number; hi: number };

export type Ingredient = {
  id: string;
  name: string;
  aliases: string[];
  cat: Category;
  taste: Record<Taste, number>;
  weight: Scale;
  volume: Scale;
  season: "all" | Season[];
  techniques: string[];
  cuisines: Record<string, number>;
  chips: string[];
  dishes: string[];
  art: string | null;
  description: string | null;
  photo: Photo | null;
  hub: boolean;
  degree: number;
};

export type Edge = { a: string; b: string; tier: Tier; shared: number; reasonType: string; reason: string | null };

export type Cuisine = { id: string; name: string };
export type Dish = { id: string; name: string };
export type Combo = { ingredients: string[]; origin: string };

/** Shape of public/graph.json as written by scripts/build-graph.mjs. */
export type GraphJson = {
  version: string;
  generated: string;
  categories: Category[];
  cuisines: Cuisine[];
  tastes: Taste[];
  hubs: string[];
  ingredients: Ingredient[];
  dishes: Dish[];
  edges: [number, number, Tier, number, string, string | null][];
  combos: Combo[];
};

export type Filters = {
  seasons: Season[];
  categories: Category[];
  hideHubs: boolean;
  cuisine: string | null;
};

export type NodeSize = "small" | "medium" | "large";

export type Partner = {
  ing: Ingredient;
  /** Shown tier: minimum across the anchor edges that exist. */
  tier: Tier;
  /** Sum of shared-partner counts across anchor edges; drives node size. */
  shared: number;
  edges: Record<string, Edge>;
  /** Anchor ids this ingredient does not pair with (empty for full matches). */
  missing: string[];
  size: NodeSize;
};

export type Bridge = {
  ing: Ingredient;
  /** For each anchor the bridge does not touch directly, the ingredient that links them. */
  via: Record<string, { through: Ingredient; tiers: number }>;
  score: number;
};

export type PartnerResult = {
  anchors: Ingredient[];
  full: Partner[];
  partial: Partner[];
  bridges: Bridge[];
  /** Full matches hidden by the active filters; reported so the UI can say so. */
  filteredOut: number;
};

export type SearchResult =
  | { kind: "ingredient"; id: string; name: string; via?: string; cat: Category }
  | { kind: "cuisine"; id: string; name: string }
  | { kind: "dish"; id: string; name: string };

export type Combination = { id: string; anchors: string[]; note: string; created: number };
