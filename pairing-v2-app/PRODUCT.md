# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 static export, Tailwind 4, hand-written SVG charts. Deployed as static files under `/pairing` on the design-fun shelf (Vercel). No backend: the pairing graph ships as one JSON file, saved data lives in IndexedDB.

## What it is

Pairing Explorer is a visual reference for flavour affinities. Type an ingredient and see what it pairs with as a map, strongest partners nearest the centre. Tap a second ingredient and the map re-centres on what the two have in common, so a cook builds a dish outward from what is already in the pan. It replaces the alphabetical pairing list with a graph you can walk.

## Users and jobs

- Improvising home cook (primary): cooks from what is in the fridge. "I have these three things; what finishes the dish?" One hand, in the kitchen, answer in under 10 seconds from a cold start.
- Professional cook or menu developer: builds dishes from an anchor ingredient, needs breadth fast, often at a desk.
- Food writer or recipe developer: checks whether a pairing is established and what sits next to it that is less obvious.

## Mechanism

A graph of ~300 ingredients (target 700) and ~12,500 pairings, each tiered 1 to 4 (works, recommended, classic, holy grail). The map places partners in three rings by tier, grouped by category in a fixed order around the circle, with node size by shared-partner count. Multi-anchor intersection, two-hop bridges when it is empty, filters (season, category, hide hubs, cuisine), a list view as the accessible form, an ingredient profile page with four radars (heaviness, volume, taste, cuisine), pairing arcs and proven combos, saved combinations with a note.

## Constraints to preserve

- Tier is shown by ring and by a label, never by colour alone. Every chart has a text equivalent under it.
- The list view is the canonical accessible form; every map action has a list equivalent.
- Installable PWA, works offline after first load, phone first with a two-column layout on desktop.
- Anchors and filters live in the URL so links reproduce a map.
- The dataset is our own, not a book's lists; no chef quotes or book text.
- Illustrators are credited on screen ("Artwork by …").

## Terminology

Anchor (an ingredient at the centre of the map), partner, tier, ring, bridge, combination (a saved anchor set with a note), hub (one of the 30 most-connected ingredients), category (15 fixed), cuisine group (8 fixed).

## Visual constraint volunteered by the user

The reference is the Lake coloring app: warm paper grey, white cards with large radii, black line art, a chunky editorial serif, letterspaced small caps, pastel washes. On 2026-10-20 the user asked for a replacement look: colour by category on the map and charts, and an illustrated map (drawings on nodes, hand-drawn guides, paper texture, the centre as a hero illustration).

## Open decisions

- Build or license a larger dataset.
- Whether multi-anchor is the paid feature or free.
