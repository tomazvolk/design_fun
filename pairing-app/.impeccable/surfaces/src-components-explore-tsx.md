---
version: 1
slug: "src-components-explore-tsx"
primary_target: "src/components/explore.tsx"
related_targets: ["src/components/ring-map.tsx","src/components/ingredient-page.tsx","src/components/charts.tsx"]
---

# Explore surface (search home, wheel map, card, list, filters) · mode: Operate

Scope: the Explore route and everything it reaches (ingredient page, saved, season share the world). Audience: a home cook with one hand free, in the kitchen, asking "I have these; what finishes the dish?"; a menu developer at a desk. Task: find partners of one to five anchors in under ten seconds, read why, save. Constraints: tier by ring and label never by colour alone; list view is the accessible twin; offline PWA; anchors and filters in the URL.

## Direction contract

THESIS: The map is a tasting wheel. Categories are tinted wedges in a fixed order around the hub, tiers are rings, and every ingredient is a small line drawing sitting on its wedge. It refuses the dotted-node graph and the generic radar: nothing on this surface is a plain dot or a grey polygon.

OWN-WORLD: Warm paper grey with a faint grain; ink black line drawings on every ingredient; fifteen pastel tints of one family, one per category, used only inside the plates (wheel, radars, arcs, chips' marks) and never as chrome; a chunky soft serif (Young Serif) for names and headings, Inter for UI; black pill primary buttons; pencil-grey hand-drawn ring guides; tier shown as a small rubber-stamp label. With all content removed you would still see a wheel of pastel wedges on paper.

STORY: The cook types one ingredient and sees it drawn at the hub with its partners spread by family around it, closest ring strongest. They tap a second ingredient; the wheel glides to show only what suits both. They open a card, read why, and save the set with a note.

FIRST VIEWPORT: Phone, 390 wide. Anchor chips with their drawings across the top; the wheel fills the screen: hub drawing at the centre with the name beneath, three pencil rings, fifteen wedge tints behind, partner drawings on their wedges with one-size labels, category names set along the outer rim. List toggle bottom-left, filters bottom-right. Home without anchors: the search slot, a strip of in-season cards with drawings on tinted discs, recents, and a small category wheel as an index.

FORM: The Flavour Wheel, position 1 on my grounded list, chosen by the user as IMPECCABLE'S PICK over the assigned Recipe Tin. Seed key b22cedba. Signature interaction: adding or removing an anchor glides every drawing to its new ring and wedge. Motion grammar: 420 ms exponential ease-out, nothing else moves.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
