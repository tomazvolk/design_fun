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
    slug: 'leaky',
    name: 'Leaky',
    deployed: '2026-09-21',
    status: 'wip',
    description:
      'A subscription tracker that finds your subscriptions in your inbox, keeps you on a monthly budget and has a seal mascot that reacts to the month ahead. PWA.',
    tags: ['pwa', 'fintech', 'mascot', 'vanilla js'],
    accent: '#6a9b9a',
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
    palette: { p: '#c5d3d3', d: '#496463', w: '#f4f8f8', k: '#122121' },
    rows: [
      '...dddd...',
      '..dppppd..',
      '.dpkppkpd.',
      '.dppkkppd.',
      '.dppppppd.',
      'ddpwwwwpdd',
      'dppwwwwppd',
      '.dpwwwwpd.',
      '..dppppd..',
      '.dd.dd.dd.',
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
