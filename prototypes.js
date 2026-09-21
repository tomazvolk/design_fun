/*
 * The prototype registry.
 *
 * To add a prototype:
 *   1. Drop it in its own folder, e.g. /synth, with an index.html inside.
 *   2. Add an entry below. Newest first is nice, but the dashboard sorts by date anyway.
 *
 * deployed : YYYY-MM-DD, the day it went live
 * status   : 'live' | 'wip'
 * accent   : any CSS color, used for the tile frame
 * art      : a tiny pixel drawing, see PIXEL_ART below
 */
const PROTOTYPES = [
  {
    slug: 'leaky-v2',
    name: 'Leaky v2',
    deployed: '2026-09-21',
    status: 'wip',
    description:
      'Leaky redrawn as an 80s arcade game: bitmap fonts, notched pixel frames, a staircase spend chart, a health-bar budget meter and Drip, a droplet mascot whose face follows your budget.',
    tags: ['pwa', 'pixel art', 'v2', 'vanilla js'],
    accent: '#29adff',
    art: 'leakyV2',
  },
  {
    slug: 'leaky',
    name: 'Leaky',
    deployed: '2026-09-21',
    status: 'wip',
    description:
      'A subscription tracker that finds your subscriptions in your inbox, keeps you on a monthly budget and charts the month’s projection against your limit. PWA.',
    tags: ['pwa', 'fintech', 'mascot', 'vanilla js'],
    accent: '#a98993',
    art: 'leaky',
  },
  {
    slug: 'pomodoro-v2',
    name: 'Halo',
    deployed: '2026-09-21',
    status: 'live',
    description:
      'Pomodoro v2. A calm take on the timer: a depleting ring, rolling digits, a soft chime and instant keyboard shortcuts.',
    tags: ['timer', 'v2', 'motion', 'vanilla js'],
    accent: '#f2553f',
    art: 'halo',
  },
  {
    slug: 'pomodoro',
    name: 'Pixeldoro',
    deployed: '2026-09-21',
    status: 'live',
    description:
      'A pixel art pomodoro timer. 25 minute sprints, pixel progress bar and an 8-bit chime when time is up.',
    tags: ['timer', 'pixel art', 'vanilla js'],
    accent: '#e94560',
    art: 'tomato',
  },
];

/* Pixel art for the tiles: each row is a string, each character a palette key. */
const PIXEL_ART = {
  tomato: {
    palette: { r: '#e94560', d: '#a52a3f', g: '#4ecca3', k: '#000000' },
    rows: [
      '....gg....',
      '...gggg...',
      '..kgrrgk..',
      '.krrrrrrk.',
      'krrrrrrrrk',
      'krrrrrrrrk',
      'krrdrrrrdk',
      'krrrrrrrrk',
      '.kdrrrrdk.',
      '..kkkkkk..',
    ],
  },
  halo: {
    palette: { a: '#f2553f', m: '#4a3322', w: '#f7ecdf' },
    rows: [
      '...aaaa...',
      '..a....a..',
      '.a......a.',
      'a........a',
      'a...ww...a',
      'm...ww...a',
      'm........a',
      '.m......a.',
      '..m....a..',
      '...mmaa...',
    ],
  },
  leaky: {
    palette: { p: '#4c2934', d: '#755760', r: '#e5484d', s: '#f4e7dd' },
    rows: [
      '.........r',
      '........rr',
      '.......r..',
      'dddddddrdd',
      '......p...',
      '.....p....',
      '...pp.....',
      '.pp.......',
      'p.........',
      'ssssssssss',
    ],
  },
  leakyV2: {
    palette: { o: '#0b4f8a', b: '#29adff', h: '#c7f0ff', e: '#0d0a1f' },
    rows: [
      '....oo....',
      '...obbo...',
      '..obbbbo..',
      '.obhbbbbo.',
      'obhbbbbbbo',
      'obbebbebbo',
      'obbebbebbo',
      'obbbbbbbbo',
      '.obeeeebo.',
      '..oooooo..',
    ],
  },
  /* Fallback for prototypes that have not been given art yet. */
  blank: {
    palette: { m: '#a08a76', k: '#000000' },
    rows: [
      'kkkkkkkkkk',
      'k........k',
      'k..mmmm..k',
      'k.m....m.k',
      'k......m.k',
      'k.....m..k',
      'k....m...k',
      'k........k',
      'k....m...k',
      'kkkkkkkkkk',
    ],
  },
};

window.PROTOTYPES = PROTOTYPES;
window.PIXEL_ART = PIXEL_ART;
