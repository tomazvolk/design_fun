# Pairing Explorer

A visual reference for flavour affinities, built from the PRD "Pairing Explorer — PRD" (Oct 20, 2026). Progressive web app, static export, no backend.

- `pnpm dev` runs it at http://localhost:3000/pairing/ (the basePath is `/pairing`).
- `pnpm export` compiles the graph, builds, writes the service worker and copies `out/` to `../pairing`, which is the committed, deployed folder.
- `pnpm test` runs the graph engine tests; `pnpm lint` and `pnpm typecheck` as usual.

## Where things are

| Path | What |
| --- | --- |
| `src/data/source/*.mjs` | The hand-authored pairing source: ingredients with taste, weight, volume, season, cuisines, dishes and tiered partner lists (`partner:tier`). |
| `src/data/source/meta.mjs` | Aliases, dish nodes, dropped tokens, proven combos, hand-written pairing reasons. |
| `scripts/build-graph.mjs` | Compiles the source into `public/graph.json` (undirected edges stored once, higher tier wins, hubs, shared-partner counts, reason types) and prints a report. |
| `scripts/build-sw.mjs` | Writes `out/sw.js` after `next build`: precaches the app shell and graph; graph is stale-while-revalidate. |
| `src/lib/graph.ts` | In-memory graph: search (F1), partners and filters (F3, F5), bridges (F7), season. |
| `src/lib/rings.ts` | Ring placement (F4): tier to ring, category order, 24 cap, "+N" at 6 o'clock. |
| `src/lib/store.tsx`, `db.ts`, `prefs.ts` | App state, IndexedDB for recents and saved combinations, localStorage prefs, service worker registration. |
| `src/lib/explore-state.ts` | Anchors and filters in the URL (`?a=fennel,orange&s=…&c=…&h=1&k=italian`). |
| `src/components/` | Explore (search home, map, list, card, filters, save), ingredient page and charts, saved, season, shell, onboarding, illustrations. |

## Data

The graph is the prototype's own dataset, written for this build: about 300 ingredients and 12,500 tiered pairings. It is not derived from any book's lists. Coverage against the PRD's reference (about 700 ingredients, 24,000 pairings) is roughly 40%; the pipeline scales by adding entries to the source files.
