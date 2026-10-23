# Design Fun

A shelf of small web prototypes. Mostly plain HTML, CSS and JS with no build step. Bledara, Odziv and
Pairing Explorer are Next.js apps: their sources are in `bledara-app/`, `forms-app/` and `pairing-app/` (ignored by
Vercel), and `bledara/`, `forms/` and `pairing/` are the committed static exports, rebuilt with `pnpm export` inside the app folder.

The root page is a dashboard: one tile per prototype with its name, deployment date
and a short description. Each prototype lives in its own folder.

## Prototypes

| Prototype | Folder | Deployed | What it is |
| --- | --- | --- | --- |
| Warranty landing page v2 | `warranty-landing-v2/` | 2026-10-23 | The same landing page in Proof's Colorful direction: sky hero with paper sheets, serif claims, pastel scenes |
| Warranty landing page | `warranty-landing/` | 2026-10-23 | Marketing landing page for Warranty tracker v3, built with the Proof skill: Minimal light in the app's brand, links into the live app |
| Pairing Explorer | `pairing/` (built from `pairing-app/`) | 2026-10-20 | Flavour-pairing map PWA: ring map by strength, multi-anchor intersection, ingredient pages with charts, saved combinations, offline. 300 ingredients, 12,000 tiered pairings. Next.js static export |
| Odziv | `forms/` (built from `forms-app/`) | 2026-10-19 | EU-hosted Typeform alternative: workspaces, builder with logic and themes, conversational respondent view, results with drop-off, Typeform importer, simulated AI (form from prompt, follow-ups, lead scores). Dummy data, Next.js static export |
| Bledara | `bledara/` (built from `bledara-app/`) | 2026-10-06 | SaaS management platform prototype on dummy data: subscriptions, roles, settings, audit log. Next.js static export |
| Warranty tracker v2 | `warranty-tracker-v2/` | 2026-09-23 | Warranty tracker redesigned bright and minimal: white, black type, hairlines, one accent |
| Warranty tracker | `warranty-tracker/` | 2026-09-22 | Receipt vault PWA: accounts, warranty and return reminders, claim PDFs |
| Leaky v2 | `leaky-v2/` | 2026-09-21 | Leaky restyled as 80s arcade pixel art |
| Leaky | `leaky/` | 2026-09-21 | Subscription tracker PWA: inbox scanning, budget, projection chart |
| Halo | `pomodoro-v2/` | 2026-09-21 | Pomodoro v2: calm ring timer with rolling digits |
| Pixeldoro | `pomodoro/` | 2026-09-21 | Pixel art pomodoro timer |

## Add a prototype

1. Create a folder with an `index.html` inside, e.g. `synth/index.html`.
2. Add an entry to the `PROTOTYPES` array in [`prototypes.js`](prototypes.js):

```js
{
  slug: 'synth',
  name: 'Bleep',
  deployed: '2026-10-04',
  status: 'live',          // or 'wip'
  description: 'A tiny step sequencer you play with the keyboard.',
  tags: ['audio', 'vanilla js'],
  accent: '#5fa8ff',       // tile frame color
  art: 'blank',            // key in PIXEL_ART, draw a new one if you like
}
```

The tile appears on the dashboard, sorted newest first. Use `url` instead of `slug`
if the prototype is hosted somewhere else.

## Run locally

```sh
npx serve .
```

Then open http://localhost:3000.

## Deploy to Vercel

Option 1, CLI:

```sh
npm i -g vercel
vercel
```

Option 2, Git: push this repo to GitHub, then import it at https://vercel.com/new.
Vercel detects it as a static site; leave the build command empty and the output
directory as the root. `cleanUrls` is on, so `/pomodoro` serves `pomodoro/index.html`.
