import { describe, expect, it, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { localize, PairingGraph, type Overlay } from "@/lib/graph";
import { list, setLang, t, tn } from "@/lib/i18n";
import { CATEGORY_LABEL, TIER_LABEL } from "@/lib/labels";
import type { GraphJson } from "@/lib/types";

const json = JSON.parse(readFileSync(path.resolve(__dirname, "../public/graph.json"), "utf8")) as GraphJson;
const sl = JSON.parse(readFileSync(path.resolve(__dirname, "../public/i18n/sl.json"), "utf8")) as Overlay;
const g = new PairingGraph(localize(json, sl));

afterEach(() => setLang("en"));

describe("Slovenian graph", () => {
  it("shows Slovenian names and descriptions, keeps ids", () => {
    expect(g.get("fennel")?.name).toBe("koromač");
    expect(g.get("garlic")?.description).toMatch(/^Surov oster/);
    expect(g.ingredients.every((i) => i.name && i.description)).toBe(true);
  });
  it("searches Slovenian with or without accents, and English names still work", () => {
    expect(g.search("cesen")[0]).toMatchObject({ id: "garlic" });
    expect(g.search("česen")[0]).toMatchObject({ id: "garlic" });
    expect(g.search("garlic")[0]).toMatchObject({ id: "garlic", via: "garlic" });
  });
  it("translates dishes, cuisines, regions and combo origins", () => {
    expect(g.dishes.get("salads")).toBe("solate");
    expect(g.cuisines.find((c) => c.id === "italian")?.name).toBe("Italijanska");
    expect(g.get("fennel")?.chips).toContain("Sicilijanska");
    expect(g.combos.some((c) => c.origin === "Rimska · carbonara")).toBe(true);
  });
});

describe("UI strings", () => {
  it("translates labels and fills placeholders", () => {
    setLang("sl");
    expect(t("Saved")).toBe("Shranjeno");
    expect(t("Up to {n} ingredients", { n: 5 })).toBe("Največ 5 sestavin");
    expect(CATEGORY_LABEL.herb).toBe("Zelišče");
    expect(TIER_LABEL[4]).toBe("Sveti gral");
    expect(list(["a", "b", "c"])).toBe("a, b in c");
  });
  it("uses the four Slovenian plural forms", () => {
    setLang("sl");
    const f = (n: number) => tn(n, "{n} partner", "{n} partners");
    expect([f(1), f(2), f(3), f(5), f(101), f(102)]).toEqual(["1 kombinacija", "2 kombinaciji", "3 kombinacije", "5 kombinacij", "101 kombinacija", "102 kombinaciji"]);
  });
  it("falls back to English for unknown strings", () => {
    setLang("sl");
    expect(t("Not in the dictionary")).toBe("Not in the dictionary");
    setLang("en");
    expect(CATEGORY_LABEL.herb).toBe("Herb");
  });
});
