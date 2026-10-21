import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PairingGraph } from "@/lib/graph";
import { layoutWheel } from "@/lib/rings";
import { DEFAULT_FILTERS } from "@/lib/explore-state";
import type { GraphJson } from "@/lib/types";

const json = JSON.parse(readFileSync(path.resolve(__dirname, "../public/graph.json"), "utf8")) as GraphJson;
const g = new PairingGraph(json);

describe("graph rules", () => {
  it("has one canonical lowercase name per ingredient and a fixed category", () => {
    for (const i of g.ingredients) {
      expect(i.name).toBe(i.name.toLowerCase());
      expect(json.categories).toContain(i.cat);
    }
  });
  it("stores every edge once, undirected, tiered 1 to 4", () => {
    for (const [a, b, tier] of json.edges) {
      expect(a).not.toBe(b);
      expect(tier).toBeGreaterThanOrEqual(1);
      expect(tier).toBeLessThanOrEqual(4);
    }
    expect(g.edge("fennel", "orange")?.tier).toBe(4);
    expect(g.edge("orange", "fennel")).toBe(g.edge("fennel", "orange"));
  });
  it("marks 30 hubs", () => expect(json.hubs).toHaveLength(30));
});

describe("F1 search", () => {
  it("matches aliases, accent and case insensitive, prefix first", () => {
    const r = g.search("Spring Onion");
    expect(r[0]).toMatchObject({ kind: "ingredient", id: "scallion", via: "spring onions" });
    expect(g.search("crème")[0]).toMatchObject({ id: "crème-fraîche" });
    expect(g.search("fen")[0]).toMatchObject({ id: "fennel" });
  });
  it("returns at most 8 results, ingredients before cuisines and dishes", () => {
    const r = g.search("i");
    expect(r.length).toBeLessThanOrEqual(8);
    const kinds = r.map((x) => x.kind);
    expect(kinds.indexOf("cuisine") === -1 || kinds.lastIndexOf("ingredient") < kinds.indexOf("cuisine")).toBe(true);
  });
  it("offers closest names when nothing matches", () => {
    expect(g.search("fenel")).toHaveLength(0);
    expect(g.closest("fenel").map((i) => i.id)).toContain("fennel");
  });
});

describe("F3 partners", () => {
  it("single anchor returns all partners with their tier, never the anchor itself", () => {
    const r = g.partners(["fennel"], DEFAULT_FILTERS);
    expect(r.full.length).toBe(g.partnersOf("fennel").length);
    expect(r.full.some((p) => p.ing.id === "fennel")).toBe(false);
    expect(r.full.find((p) => p.ing.id === "orange")?.tier).toBe(4);
  });
  it("two anchors: full matches pair with both at the minimum tier; partials fade", () => {
    const r = g.partners(["fennel", "orange"], DEFAULT_FILTERS);
    const olive = r.full.find((p) => p.ing.id === "olive")!;
    expect(olive).toBeDefined();
    expect(olive.tier).toBe(Math.min(g.edge("fennel", "olive")!.tier, g.edge("orange", "olive")!.tier));
    for (const p of r.full) expect(p.missing).toHaveLength(0);
    for (const p of r.partial) expect(p.missing.length).toBeGreaterThan(0);
    expect(r.full.map((p) => p.ing.id)).toEqual(expect.arrayContaining(["olive", "chicken", "mint", "chile"]));
  });
  it("sizes nodes in three steps with about 10% large", () => {
    const r = g.partners(["fennel"], DEFAULT_FILTERS);
    const large = r.full.filter((p) => p.size === "large").length;
    expect(large).toBeGreaterThan(0);
    expect(large / r.full.length).toBeLessThanOrEqual(0.15);
  });
  it("F5 hide hubs removes hubs but never anchors", () => {
    const r = g.partners(["lemon"], { ...DEFAULT_FILTERS, hideHubs: true });
    expect(r.full.some((p) => g.hubs.has(p.ing.id))).toBe(false);
    expect(r.anchors[0].id).toBe("lemon");
  });
  it("F5 category filter keeps only selected categories", () => {
    const r = g.partners(["fennel"], { ...DEFAULT_FILTERS, categories: ["herb"] });
    expect(r.full.every((p) => p.ing.cat === "herb")).toBe(true);
  });
  it("F7 bridges appear only when the intersection is empty and link every anchor", () => {
    const r = g.partners(["fennel", "orange"], DEFAULT_FILTERS);
    expect(r.bridges).toHaveLength(0);
    const odd = g.ingredients.find((x) => x.id !== "fennel" && !g.edge("fennel", x.id) && [...g.adj.get(x.id)!.keys()].some((y) => g.edge(y, "fennel")))!;
    const e = g.partners(["fennel", odd.id], DEFAULT_FILTERS);
    if (e.full.length === 0) {
      expect(e.bridges.length).toBeGreaterThan(0);
      expect(e.bridges.length).toBeLessThanOrEqual(6);
      for (const b of e.bridges) for (const a of e.anchors) expect(g.edge(b.ing.id, a.id) || b.via[a.id]).toBeTruthy();
    }
  });
});

describe("F4 ring placement", () => {
  it("caps a ring at 24 with the overflow at 6 o'clock", () => {
    const layout = layoutWheel(g.partners(["garlic"], DEFAULT_FILTERS));
    for (const ring of layout.rings) {
      expect(ring.nodes.length).toBeLessThanOrEqual(24);
      if (ring.overflow > 0) { expect(ring.plus).not.toBeNull(); expect(ring.plus!.y).toBeGreaterThan(ring.radius * 0.9); }
    }
  });
  it("keeps categories in the fixed order around the wheel, herbs first", () => {
    const layout = layoutWheel(g.partners(["garlic"], DEFAULT_FILTERS));
    const order = layout.wedges.map((w) => w.cat);
    expect(order[0]).toBe("herb");
    for (let i = 1; i < layout.wedges.length; i++) expect(layout.wedges[i].start).toBeGreaterThanOrEqual(layout.wedges[i - 1].end - 1e-9);
    for (const n of layout.nodes) { const w = layout.wedges.find((x) => x.cat === n.partner.ing.cat)!; expect(n.angle).toBeGreaterThanOrEqual(w.start); expect(n.angle).toBeLessThanOrEqual(w.end); }
  });
  it("puts tier 4 and 3 inside, 2 in the middle, 1 and partials outside", () => {
    const layout = layoutWheel(g.partners(["fennel", "orange"], DEFAULT_FILTERS));
    for (const n of layout.rings[0].nodes) expect(n.partner.tier).toBeGreaterThanOrEqual(3);
    for (const n of layout.rings[1].nodes) expect(n.partner.tier).toBe(2);
    for (const n of layout.rings[2].nodes) expect(n.faded || n.partner.tier === 1).toBe(true);
  });
});
