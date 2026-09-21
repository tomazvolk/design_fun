# Design Fun

A shelf of small web prototypes. Plain HTML, CSS and JS, no build step.

The root page is a dashboard: one tile per prototype with its name, deployment date
and a short description. Each prototype lives in its own folder.

## Prototypes

| Prototype | Folder | Deployed | What it is |
| --- | --- | --- | --- |
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
