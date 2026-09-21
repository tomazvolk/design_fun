(function () {
  'use strict';

  /* ======================================================================
     Helpers
     ====================================================================== */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const round2 = (n) => Math.round(n * 100) / 100;
  const moneyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const money = (n) => moneyFmt.format(n || 0);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

  /* Dates live as local 'YYYY-MM-DD' strings so they compare and serialise cleanly. */
  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => toISO(new Date());
  const addDays = (s, n) => { const d = fromISO(s); d.setDate(d.getDate() + n); return toISO(d); };
  const addMonths = (s, n) => {
    const d = fromISO(s);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
    return toISO(d);
  };
  const daysBetween = (a, b) => Math.round((fromISO(b) - fromISO(a)) / 86400000);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function fmtDate(s) {
    const d = fromISO(s);
    const out = MONTHS[d.getMonth()] + ' ' + d.getDate();
    return d.getFullYear() === new Date().getFullYear() ? out : out + ', ' + d.getFullYear();
  }

  function fmtRel(s) {
    const n = daysBetween(today(), s);
    if (n === 0) return 'today';
    if (n === 1) return 'tomorrow';
    if (n === -1) return 'yesterday';
    if (n > 1) return n < 60 ? 'in ' + n + ' days' : 'in ' + Math.round(n / 30) + ' months';
    return -n < 60 ? -n + ' days ago' : Math.round(-n / 30) + ' months ago';
  }

  /* ======================================================================
     Icons: 8x8 pixel bitmaps, drawn at 2x or 3x so every pixel stays square
     ====================================================================== */
  const ICONS = {
    plus: ['........', '...XX...', '...XX...', '.XXXXXX.', '.XXXXXX.', '...XX...', '...XX...', '........'],
    search: ['.XXXX...', 'X....X..', 'X....X..', 'X....X..', 'X....X..', '.XXXXX..', '.....XX.', '......XX'],
    refresh: ['..XXXX.X', '.X....XX', 'X....XXX', 'X.......', 'X.......', 'X......X', '.X....X.', '..XXXX..'],
    mail: ['........', 'XXXXXXXX', 'XX....XX', 'X.X..X.X', 'X..XX..X', 'X......X', 'XXXXXXXX', '........'],
    cloud: ['........', '..XXX...', '.X...XX.', 'XX.....X', 'X......X', '.XXXXXX.', '........', '........'],
    chevDown: ['........', '........', 'XX....XX', '.XX..XX.', '..XXXX..', '...XX...', '........', '........'],
    chevLeft: ['....XX..', '...XX...', '..XX....', '.XX.....', '..XX....', '...XX...', '....XX..', '........'],
    chevRight: ['..XX....', '...XX...', '....XX..', '.....XX.', '....XX..', '...XX...', '..XX....', '........'],
    x: ['XX....XX', '.XX..XX.', '..XXXX..', '...XX...', '..XXXX..', '.XX..XX.', 'XX....XX', '........'],
    alert: ['...XX...', '..X..X..', '..X..X..', '.X.XX.X.', '.X.XX.X.', 'X......X', 'X..XX..X', 'XXXXXXXX'],
    clock: ['..XXXX..', '.X....X.', 'X..X...X', 'X..X...X', 'X..XXX.X', 'X......X', '.X....X.', '..XXXX..'],
    trend: ['........', '....XXXX', '......XX', '.....X.X', 'X...X...', '.X.X....', '..X.....', '........'],
    pause: ['..XXXX..', '.X....X.', 'X.X..X.X', 'X.X..X.X', 'X.X..X.X', 'X.X..X.X', '.X....X.', '..XXXX..'],
    gift: ['..X..X..', '...XX...', 'XXXXXXXX', 'X..XX..X', 'XXXXXXXX', '.X.XX.X.', '.X.XX.X.', '.XXXXXX.'],
    check: ['........', '.......X', '......XX', '.....XX.', 'X...XX..', 'XX.XX...', '.XXX....', '..X.....'],
    trash: ['...XX...', 'XXXXXXXX', '........', '.XXXXXX.', '.X.XX.X.', '.X.XX.X.', '.X.XX.X.', '.XXXXXX.'],
    arrowUp: ['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', '...XX...', '...XX...', '...XX...', '...XX...'],
    arrowDown: ['...XX...', '...XX...', '...XX...', '...XX...', 'XX.XX.XX', '.XXXXXX.', '..XXXX..', '...XX...'],
    inbox: ['.XXXXXX.', '.X....X.', 'X......X', 'X......X', 'XXX..XXX', 'X.XXXX.X', 'X......X', 'XXXXXXXX'],
    bell: ['...XX...', '..XXXX..', '.XXXXXX.', '.XXXXXX.', '.XXXXXX.', 'XXXXXXXX', '........', '...XX...'],
    wallet: ['........', 'XXXXXXX.', 'X......X', 'XXXXXXXX', 'X.....XX', 'X.....XX', 'XXXXXXXX', '........'],
    home: ['...XX...', '..XXXX..', '.XX..XX.', 'XX....XX', '.X....X.', '.X.XX.X.', '.X.XX.X.', '.XXXXXX.'],
    list: ['........', 'XX.XXXXX', '........', 'XX.XXXXX', '........', 'XX.XXXXX', '........', '........'],
    settings: ['...XX...', '.XXXXXX.', '.XX..XX.', 'XX....XX', 'XX....XX', '.XX..XX.', '.XXXXXX.', '...XX...'],
    sparkle: ['...XX...', '...XX...', '..XXXX..', 'XXXXXXXX', 'XXXXXXXX', '..XXXX..', '...XX...', '...XX...'],
    drop: ['...XX...', '..XXXX..', '.XXXXXX.', 'XXXXXXXX', 'X.XXXXXX', 'X.XXXXXX', '.XXXXXX.', '..XXXX..'],
    device: ['.XXXXXX.', '.X....X.', '.X....X.', '.X....X.', '.X....X.', '.XXXXXX.', '.XX..XX.', '.XXXXXX.'],
    edit: ['......XX', '.....XXX', '....XXX.', '...XXX..', '..XXX...', '.XXX....', 'X.X.....', 'XX......'],
    google: ['..XXXX..', '.XX..XX.', 'XX......', 'XX......', 'XX..XXXX', 'XX....XX', '.XX..XX.', '..XXXX..'],
    logout: ['XXXX....', 'X.......', 'X....X..', 'X.XXXXXX', 'X....X..', 'X.......', 'XXXX....', '........'],
  };

  /* One <rect> per horizontal run of lit pixels keeps the markup small. */
  function pixelRects(rows, fill) {
    let out = '';
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length;) {
        const ch = row[x];
        if (ch === '.' || (fill && !fill[ch])) { x++; continue; }
        let w = 1;
        while (row[x + w] === ch) w++;
        out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1"' + (fill ? ' fill="' + fill[ch] + '"' : '') + '/>';
        x += w;
      }
    });
    return out;
  }

  const iconCache = {};
  function icon(name, size) {
    /* Snap to whole multiples of the 8px grid so pixels never blur. */
    const s = Math.max(8, Math.round((size || 16) / 8) * 8);
    const key = name + s;
    if (!iconCache[key]) {
      iconCache[key] = '<svg class="px-icon" width="' + s + '" height="' + s + '" viewBox="0 0 8 8" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">' +
        pixelRects(ICONS[name] || []) + '</svg>';
    }
    return iconCache[key];
  }

  /* Penny, the fox. Drawn as a left half and mirrored, plus a tail that moves on its own. 32x26. */
  const FOX_PAL = { k: '#2b1a2e', o: '#f08a2e', d: '#c45a1e', l: '#ffb45e', w: '#fff1e8', p: '#ff77a8', t: '#29adff' };
  const FOX_HEAD = [
    '..kk........',
    '..kok.......',
    '..kpok......',
    '..kppok.....',
    '.kpppokkkkkk',
    '.kooooolllll',
    '.koooooooooo',
    '.koooooooooo',
  ];
  /* Brow, eyes, nose and cheeks, mouth, chin. */
  const FOX_FACES = {
    happy: ['.koooooooooo', '.koooookoooo', '.kooookokooo', '.koppwwwwwwk', '.kowwwwwwkpp', '..kwwwwwwwkk', '...kkwwwwwww'],
    content: ['.koooooooooo', '.kooooookwoo', '.kooooookkoo', '.koppwwwwwwk', '.kowwwwwkwww', '..kwwwwwwkkk', '...kkwwwwwww'],
    neutral: ['.koooooooooo', '.kooooookwoo', '.kooooookkoo', '.koowwwwwwwk', '.kowwwwwwwkk', '..kwwwwwwwww', '...kkwwwwwww'],
    sad: ['.kooooookooo', '.kooookkkwoo', '.kooooookkoo', '.koowwwtwwwk', '.kowwwwwwkkk', '..kwwwwwkwww', '...kkwwwwwww'],
    relieved: ['.koooooooooo', '.koooooooooo', '.koooookkkoo', '.koppwwwwwwk', '.kowwwwwkwww', '..kwwwwwwkkk', '...kkwwwwwww'],
  };
  const FOX_BODY = [
    '.....kkkkkkk',
    '...kdoowwwww',
    '...kdowwwppw',
    '...kdowwpppp',
    '...kdowwwppp',
    '...kdowwwwpp',
    '...kdowwwwwp',
    '...kdooowwww',
    '...kddoooooo',
    '...kdddddk..',
    '....kkkkk...',
  ];
  const FOX_TAIL = [
    '.kkk......',
    'kwwwk.....',
    'kwwwwk....',
    'kwwwwk....',
    'kowwok....',
    'koooook...',
    'kooooook..',
    'kdoooook..',
    'kdooooook.',
    '.kdoooook.',
    '.kddooook.',
    '..kddoook.',
    '...kkdook.',
    '.....kkk..',
  ];

  /* Three behaviours: giggle when under budget, cry when over, idle and blink in between. */
  const foxAct = (mood) => (mood === 'happy' || mood === 'relieved' ? 'giggle' : mood === 'sad' || mood === 'worried' ? 'cry' : 'idle');
  const FOX_LABEL = { giggle: 'Giggling', idle: 'Keeping watch', cry: 'Crying' };
  const px = (x, y, w, h, c, cls) => '<rect' + (cls ? ' class="' + cls + '"' : '') + ' x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
  const pxHeart = (x, y, cls) => '<g class="' + cls + '">' + px(x, y, 1, 1, FOX_PAL.p) + px(x + 2, y, 1, 1, FOX_PAL.p) +
    px(x, y + 1, 3, 1, FOX_PAL.p) + px(x + 1, y + 2, 1, 1, FOX_PAL.p) + '</g>';

  function fox(mood, o) {
    o = o || {};
    const act = foxAct(mood);
    const face = act === 'cry' ? 'sad' : FOX_FACES[mood] ? mood : 'neutral';
    const mirror = (r) => '......' + r + r.split('').reverse().join('') + '..';
    const body = FOX_HEAD.concat(FOX_FACES[face], FOX_BODY).map(mirror);
    /* The tail tucks in behind the body, so only draw it where the body is empty. */
    const tail = body.map((r, y) => {
      const tr = FOX_TAIL[y - 9] || '';
      return r.split('').map((c, x) => (c === '.' && tr[x] && tr[x] !== '.' ? tr[x] : '.')).join('');
    });
    let extra = '';
    if (act === 'cry') {
      extra = px(13, 12, 1, 2, FOX_PAL.t, 'fox-tear') + px(22, 12, 1, 2, FOX_PAL.t, 'fox-tear fox-tear-2');
    } else if (act === 'giggle') {
      extra = pxHeart(1, 5, 'fox-heart') + pxHeart(28, 3, 'fox-heart fox-heart-2');
    } else {
      /* Eyelids, shown for a moment every few seconds. */
      extra = '<g class="fox-lids">' + px(14, 9, 2, 1, FOX_PAL.o) + px(20, 9, 2, 1, FOX_PAL.o) +
        px(14, 10, 2, 1, FOX_PAL.k) + px(20, 10, 2, 1, FOX_PAL.k) + '</g>';
    }
    const s = o.size || 4;
    return '<figure class="fox fox-' + act + '" aria-hidden="true">' +
      '<svg viewBox="0 0 32 26" width="' + 32 * s + '" height="' + 26 * s + '" shape-rendering="crispEdges"><g class="fox-sprite">' +
        '<g class="fox-tail">' + pixelRects(tail, FOX_PAL) + '</g>' +
        pixelRects(body, FOX_PAL) + extra +
      '</g></svg>' + (o.caption === false ? '' : '<figcaption>Penny</figcaption>') + '</figure>';
  }

  /* ======================================================================
     Reference data
     ====================================================================== */
  const CFG = window.LEAKY_CONFIG || {};
  const LIVE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  const APP_URL = location.origin + location.pathname;
  let sb = null;

  const FREE_LIMIT = 5;
  const PAGE_SIZE = 10;
  const STORE_KEY = 'leaky-v2:v1';

  const CATS = {
    video: { label: 'Video', tone: 'rose' },
    music: { label: 'Music', tone: 'lavender' },
    software: { label: 'Software', tone: 'sky' },
    storage: { label: 'Storage', tone: 'slate' },
    news: { label: 'News', tone: 'amber' },
    learning: { label: 'Learning', tone: 'clay' },
    wellness: { label: 'Wellness', tone: 'lavender' },
    fitness: { label: 'Fitness', tone: 'clay' },
    shopping: { label: 'Shopping', tone: 'amber' },
    other: { label: 'Other', tone: 'slate' },
  };

  const PROVIDERS = {
    gmail: { label: 'Gmail', how: 'Connected with Google, read-only', icon: 'mail' },
    manual: { label: 'Added by hand', icon: 'edit' },
  };

  const PLANS = [
    { id: 'free', name: 'Free', price: '$0', desc: 'Track up to 5 subscriptions with every alert.', tone: 'slate', icon: 'drop' },
    { id: 'monthly', name: 'Pro monthly', price: '$4.50 a month', desc: 'Unlimited subscriptions and every alert. Cancel any time.', tone: 'sky', icon: 'sparkle' },
    { id: 'yearly', name: 'Pro yearly', price: '$35 a year', desc: 'Everything in Pro for about $2.92 a month. Saves 35% on monthly.', tone: 'lavender', icon: 'sparkle' },
  ];

  /*
   * Sample inbox for the simulated scan. Offsets are days from today so the
   * demo always has renewals coming up. used = days since last activity email.
   */
  const SAMPLE_INBOX = [
    { name: 'Netflix', cat: 'video', amount: 15.49, cycle: 'monthly', renew: 4, used: -2, history: [[13.99, -150], [15.49, -26]] },
    { name: 'Spotify', cat: 'music', amount: 11.99, cycle: 'monthly', renew: 12, used: -1 },
    { name: 'YouTube Premium', cat: 'video', amount: 13.99, cycle: 'monthly', renew: 3, used: -3, review: true },
    { name: 'Adobe Creative Cloud', cat: 'software', amount: 19.99, cycle: 'monthly', renew: 9, used: -112 },
    { name: 'ChatGPT Plus', cat: 'software', amount: 20.0, cycle: 'monthly', renew: 15, used: -1 },
    { name: 'iCloud+', cat: 'storage', amount: 2.99, cycle: 'monthly', renew: 18, used: -5 },
    { name: 'The New York Times', cat: 'news', amount: 17.0, cycle: 'monthly', renew: 6, used: -8 },
    { name: 'Disney+', cat: 'video', amount: 13.99, cycle: 'monthly', renew: 21, used: -96 },
    { name: 'Headspace', cat: 'wellness', amount: 12.99, cycle: 'monthly', renew: 27, used: -74 },
    { name: 'Duolingo Super', cat: 'learning', amount: 12.99, cycle: 'monthly', trial: 2, trialLength: 14, used: -1 },
    { name: 'Strava', cat: 'fitness', amount: 11.99, cycle: 'monthly', trial: 9, trialLength: 30, used: -4 },
    { name: 'Amazon Prime', cat: 'shopping', amount: 139.0, cycle: 'yearly', renew: 55, used: -3 },
  ];

  /* ======================================================================
     State
     ====================================================================== */
  function defaultState() {
    return {
      v: 1,
      user: null,
      onboarded: false,
      step: 'name',
      goals: ['trials', 'renewals', 'prices', 'unused'],
      accounts: [],
      subs: [],
      ignored: [],
      budget: null,
      plan: 'free',
      notified: {},
      settings: {
        renewalAlerts: true,
        renewalDays: 3,
        trialAlerts: true,
        trialDays: 3,
        priceAlerts: true,
        unusedFlag: true,
        unusedMonths: 2,
        notifications: false,
        emailAlerts: false,
        emailFreq: 'daily',
      },
    };
  }

  /* Fill in defaults and migrate older saved shapes. */
  function normalize(s) {
    const base = defaultState();
    if (!s || s.v !== 1) return base;
    const out = Object.assign(base, s, { settings: Object.assign(base.settings, s.settings) });
    if (out.step === 'scanning' || out.step === 'found') out.step = 'source';
    out.accounts = (out.accounts || []).filter((a) => a.provider === 'gmail');
    out.subs = out.subs || [];
    out.subs.forEach((x) => { if (x.source !== 'gmail' && x.source !== 'manual') x.source = 'manual'; });
    if (out.user && out.user.method === 'apple') out.user.method = 'email';
    return out;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return normalize(JSON.parse(raw));
    } catch (e) { /* storage blocked: run in memory */ }
    return defaultState();
  }

  function saveLocal() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function save() {
    saveLocal();
    if (LIVE && sb && state.user && state.user.id) schedulePush();
  }

  /* Swap the whole state for another user's (or a fresh one), keeping the object identity. */
  function replaceState(next) {
    const fresh = normalize(next);
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, fresh);
  }

  const state = load();
  const ui = {
    tab: 'all',
    search: '',
    category: 'all',
    source: 'all',
    sort: { key: 'next', dir: 'asc' },
    page: 1,
    openSection: 'budget',
    connect: null,
    chartRange: '3m',
    authMode: 'signup',
    authBusy: false,
    authEmail: '',
    booting: LIVE,
    relief: null,
    installEvent: null,
    toastTimer: null,
  };

  /* ======================================================================
     Subscription maths
     ====================================================================== */
  const cycleMonths = (s) => (s.cycle === 'yearly' ? 12 : 1);

  /* Move stale dates forward, and turn finished trials into paid subscriptions. */
  function rollForward(s) {
    const t = today();
    if (s.status === 'trial' && s.trialEnds && s.trialEnds < t) {
      s.status = 'active';
      s.nextRenewal = s.trialEnds;
      s.trialEnds = null;
    }
    if (s.status === 'cancelled' || !s.nextRenewal) return;
    let guard = 0;
    while (s.nextRenewal < t && guard++ < 240) s.nextRenewal = addMonths(s.nextRenewal, cycleMonths(s));
  }

  function nextCharge(s) {
    if (s.status === 'cancelled') return null;
    return s.status === 'trial' ? s.trialEnds : s.nextRenewal;
  }

  /* The date this subscription charges in the current calendar month, if it does. */
  function chargeThisMonth(s) {
    const month = today().slice(0, 7);
    if (s.status === 'cancelled') return null;
    if (s.status === 'trial') return s.trialEnds && s.trialEnds.slice(0, 7) === month ? s.trialEnds : null;
    if (s.nextRenewal.slice(0, 7) === month) return s.nextRenewal;
    const prev = addMonths(s.nextRenewal, -cycleMonths(s));
    return prev.slice(0, 7) === month ? prev : null;
  }

  const perMonth = (s) => (s.status === 'cancelled' ? 0 : s.cycle === 'yearly' ? s.amount / 12 : s.amount);

  function totals() {
    const t = today();
    let projected = 0;
    let charged = 0;
    let avg = 0;
    state.subs.forEach((s) => {
      const d = chargeThisMonth(s);
      if (d) {
        projected += s.amount;
        if (d <= t) charged += s.amount;
      }
      avg += perMonth(s);
    });
    return {
      projected: round2(projected),
      charged: round2(charged),
      toCome: round2(projected - charged),
      avg: round2(avg),
      yearly: round2(avg * 12),
    };
  }

  function priceChange(s) {
    const h = s.priceHistory || [];
    if (h.length < 2) return null;
    const a = h[h.length - 2];
    const b = h[h.length - 1];
    if (b.amount <= a.amount || daysBetween(b.date, today()) > 90) return null;
    return { from: a.amount, to: b.amount, date: b.date };
  }

  const isUnused = (s) => s.status === 'active' && !!s.lastUsed &&
    daysBetween(s.lastUsed, today()) >= state.settings.unusedMonths * 30;

  const activeSubs = () => state.subs.filter((s) => s.status !== 'cancelled');

  function lastCharge(s) {
    if (s.status === 'trial' || !s.nextRenewal) return null;
    const prev = addMonths(s.nextRenewal, -cycleMonths(s));
    return prev <= today() ? prev : null;
  }

  /* ======================================================================
     Mood
     ====================================================================== */
  function moodFor(projected, budget) {
    if (ui.relief && ui.relief.until > Date.now()) return 'relieved';
    if (!budget) return 'neutral';
    const r = projected / budget;
    if (r <= 0.85) return 'happy';
    if (r <= 1) return 'content';
    if (r <= 1.15) return 'worried';
    return 'sad';
  }

  function budgetStatus(projected, budget) {
    if (!budget) return null;
    if (projected > budget) return { tone: 'critical', label: 'Over budget' };
    if (projected / budget > 0.85) return { tone: 'warning', label: 'Close to your limit' };
    return { tone: 'success', label: 'Within budget' };
  }

  function speech(mood, projected, budget) {
    const diff = Math.abs(round2(budget - projected));
    const unused = state.subs.filter(isUnused);
    const unusedNote = unused.length
      ? ' ' + plural(unused.length, 'subscription') + (unused.length === 1 ? ' looks' : ' look') + ' unused.'
      : '';
    switch (mood) {
      case 'relieved': return 'Nice one. That frees up ' + money(ui.relief.amount) + ' this month.';
      case 'happy': return state.subs.length ? 'Plenty of room. You’re set to finish ' + money(diff) + ' under budget.' : 'Got it. I’ll compare that with what we find.';
      case 'content': return state.subs.length ? 'On track, with ' + money(diff) + ' to spare. Keep an eye on new sign-ups.' : 'Got it. I’ll compare that with what we find.';
      case 'worried': return 'It’s a tight month. You’re set to go ' + money(diff) + ' over.' + unusedNote;
      case 'sad': return 'We’re leaking. You’re set to go ' + money(diff) + ' over budget.' + unusedNote;
      default: return state.subs.length ? 'Set a monthly budget and I’ll keep an eye on it for you.' : 'Pick a number that feels right. You can change it later.';
    }
  }

  /* ======================================================================
     Building blocks
     ====================================================================== */
  function btn(label, action, o) {
    o = o || {};
    const cls = 'btn btn-' + (o.variant || 'secondary') + (o.size ? ' btn-' + o.size : '');
    return '<button type="' + (o.type || 'button') + '" class="' + cls + '"' +
      (action ? ' data-action="' + action + '"' : '') +
      (o.id != null ? ' data-id="' + esc(o.id) + '"' : '') +
      (o.disabled ? ' disabled' : '') +
      (o.aria ? ' aria-label="' + esc(o.aria) + '"' : '') + '>' +
      (o.icon ? icon(o.icon) : '') + (label ? '<span>' + esc(label) + '</span>' : '') + '</button>';
  }

  function tag(cat) {
    const c = CATS[cat] || CATS.other;
    return '<span class="tag tag-' + c.tone + '">' + esc(c.label) + '</span>';
  }

  function statusHtml(tone, label) {
    return '<span class="status status-' + tone + '"><span class="dot" aria-hidden="true"></span>' + esc(label) + '</span>';
  }

  function subStatus(s) {
    if (s.review) return statusHtml('warning', 'Check details');
    if (s.status === 'cancelled') return statusHtml('neutral', 'Cancelled');
    if (s.status === 'trial') return statusHtml('warning', 'Free trial');
    if (isUnused(s)) return statusHtml('warning', 'Looks unused');
    return statusHtml('success', 'Active');
  }

  function pageHeader(o) {
    return '<header class="page-head"><div>' +
      '<h1 class="page-title" tabindex="-1">' + esc(o.title) + '</h1>' +
      (o.subtitle ? '<p class="page-sub">' + o.subtitle + '</p>' : '') + '</div>' +
      (o.action ? '<div class="page-actions">' + o.action + '</div>' : '') + '</header>';
  }

  function emptyState(o) {
    return '<div class="empty' + (o.small ? ' empty-sm' : '') + '">' +
      '<div class="empty-icon">' + icon(o.icon || 'inbox') + '</div>' +
      '<p class="empty-title">' + esc(o.title) + '</p>' +
      (o.text ? '<p class="empty-text">' + esc(o.text) + '</p>' : '') +
      (o.action || '') + '</div>';
  }

  function choiceCard(o) {
    return '<div class="choice tone-' + o.tone + '">' +
      '<span class="choice-icon">' + icon(o.icon, 24) + '</span>' +
      '<p class="choice-title">' + esc(o.title) + (o.badge || '') + '</p>' +
      (o.price ? '<p class="choice-price">' + esc(o.price) + '</p>' : '') +
      '<p class="choice-desc">' + esc(o.desc) + '</p>' +
      (o.actions ? '<div class="choice-actions">' + o.actions + '</div>' : '') + '</div>';
  }

  function selectField(name, value, options, o) {
    o = o || {};
    return '<div class="select-wrap"><select class="select' + (o.small ? ' select-sm' : '') + '" ' +
      (o.id ? 'id="' + o.id + '" ' : '') + 'name="' + name + '"' +
      (o.setting ? ' data-setting="' + o.setting + '"' : '') +
      (o.aria ? ' aria-label="' + esc(o.aria) + '"' : '') + '>' +
      options.map(([v, l]) => '<option value="' + esc(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' + esc(l) + '</option>').join('') +
      '</select>' + icon('chevDown') + '</div>';
  }

  function toggle(key, on, label, o) {
    o = o || {};
    return '<button type="button" class="switch' + (o.small ? ' switch-sm' : '') + '" role="switch" aria-checked="' + !!on + '" ' +
      'data-action="toggle" data-id="' + key + '" aria-label="' + esc(label) + '"' + (o.disabled ? ' disabled' : '') + '></button>';
  }

  function meter(projected, budget) {
    if (!budget) return '';
    const scale = Math.max(projected, budget) || 1;
    const inPct = (Math.min(projected, budget) / scale) * 100;
    const overPct = (Math.max(0, projected - budget) / scale) * 100;
    return '<div class="meter" role="img" aria-label="' + money(projected) + ' projected against a ' + money(budget) + ' budget">' +
      '<span class="meter-fill" style="transform:scaleX(' + inPct / 100 + ')"></span>' +
      (overPct ? '<span class="meter-over" style="left:' + inPct + '%;width:' + overPct + '%"></span>' +
        '<span class="meter-mark" style="left:' + inPct + '%"></span>' : '') +
      '</div>';
  }

  /* ======================================================================
     Routing
     ====================================================================== */
  const ROUTES = [
    { id: 'overview', label: 'Overview', icon: 'home', nav: true },
    { id: 'subscriptions', label: 'Subscriptions', icon: 'list', nav: true },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
  ];

  function route() {
    const r = location.hash.replace(/^#\/?/, '');
    if (r === 'inbox') { ui.openSection = 'inbox'; history.replaceState(null, '', '#/settings'); return 'settings'; }
    return ROUTES.some((x) => x.id === r) ? r : 'overview';
  }

  const initials = (u) => {
    const src = (u.name || u.email || '?').trim();
    const parts = src.split(/[\s@._-]+/).filter(Boolean);
    return ((parts[0] || '?')[0] + (u.name && parts[1] ? parts[1][0] : '')).toUpperCase();
  };

  /* The bell next to the avatar: opens the notifications page, badge counts what needs a look. */
  function renderNotifBtn() {
    const b = $('#notif-btn');
    const show = !ui.booting && !!state.user && state.onboarded;
    b.hidden = !show;
    if (!show) return;
    const n = attentionItems(totals()).length;
    const badge = b.querySelector('.notif-count');
    badge.textContent = n > 9 ? '9+' : String(n);
    badge.hidden = !n;
    b.setAttribute('aria-label', n ? 'Notifications, ' + plural(n, 'item') + ' need a look' : 'Notifications, all clear');
    if (route() === 'notifications') b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }

  function renderUserMenu() {
    const wrap = $('#user-menu');
    const u = state.user;
    wrap.hidden = !u || ui.booting;
    if (!u) return;
    $('#avatar-btn').textContent = initials(u);
    $('#avatar-btn').setAttribute('aria-label', 'Account menu for ' + (u.name || u.email || 'you'));
    $('#user-pop').innerHTML =
      '<div class="user-pop-head"><p class="user-pop-name">' + esc(u.name || 'Your account') + '</p>' +
        (u.email ? '<p class="user-pop-mail">' + esc(u.email) + '</p>' : '') + '</div>' +
      (state.onboarded ? '<a class="user-pop-item" role="menuitem" href="#/settings">' + icon('settings') + 'Settings</a>' : '') +
      '<button type="button" class="user-pop-item" role="menuitem" data-action="sign-out">' + icon('logout') + 'Log out</button>';
  }

  function setUserMenu(open) {
    const pop = $('#user-pop');
    const b = $('#avatar-btn');
    if (!pop) return;
    b.setAttribute('aria-expanded', String(open));
    if (open) {
      pop.hidden = false;
      requestAnimationFrame(() => pop.classList.add('is-open'));
      const first = pop.querySelector('.user-pop-item');
      if (first) first.focus();
    } else if (!pop.hidden) {
      pop.classList.remove('is-open');
      setTimeout(() => { if (!pop.classList.contains('is-open')) pop.hidden = true; }, 120);
    }
  }

  function renderNav() {
    const nav = $('#nav');
    const menu = $('#menu-btn');
    if (ui.booting || !state.user || !state.onboarded) {
      nav.innerHTML = '';
      menu.hidden = true;
      return;
    }
    menu.hidden = false;
    const r = route();
    nav.innerHTML = ROUTES.filter((x) => x.nav).map((x) =>
      '<a href="#/' + x.id + '"' + (x.id === r ? ' aria-current="page"' : '') + '>' + icon(x.icon) + x.label + '</a>'
    ).join('');
  }

  function render() {
    state.subs.forEach(rollForward);
    renderNav();
    renderUserMenu();
    renderNotifBtn();
    const view = $('#view');
    if (ui.booting) {
      view.innerHTML = '<div class="boot" aria-busy="true" aria-label="Loading"><span class="spinner"></span></div>';
      return;
    }
    if (ui.authMode === 'reset-new') {
      view.innerHTML = viewAuth();
      document.title = 'New password · Leaky';
      return;
    }
    if (!state.user || ui.connect || !state.onboarded) {
      view.innerHTML = !state.user ? viewAuth() : ui.connect ? viewConnect() : viewOnboarding();
      document.title = !state.user ? 'Sign in · Leaky' : ui.connect ? 'Connect ' + PROVIDERS[ui.connect.provider].label + ' · Leaky' : 'Get started · Leaky';
      return;
    }
    const r = route();
    const views = { overview: viewOverview, subscriptions: viewSubs, settings: viewSettings, notifications: viewNotifications };
    view.innerHTML = views[r]();
    document.title = (ROUTES.find((x) => x.id === r).label) + ' · Leaky';
    renderChart();
  }

  /* ======================================================================
     Sign in + onboarding
     ====================================================================== */
  const STEPS = ['name', 'goals', 'budget', 'source'];
  const stepIndex = (s) => Math.max(0, STEPS.indexOf(s));

  const GOALS = [
    { id: 'trials', icon: 'gift', title: 'Free trials', desc: 'Warn me before a trial turns into a paid plan.', setting: 'trialAlerts' },
    { id: 'renewals', icon: 'clock', title: 'Renewals', desc: 'Remind me a few days before something renews.', setting: 'renewalAlerts' },
    { id: 'prices', icon: 'trend', title: 'Price increases', desc: 'Tell me when a merchant quietly charges more.', setting: 'priceAlerts' },
    { id: 'unused', icon: 'pause', title: 'Unused subscriptions', desc: 'Flag things I haven’t touched in months.', setting: 'unusedFlag' },
  ];

  function authShell(title, sub, inner, foot) {
    return '<div class="auth step-enter">' +
      '<h1 class="hero-title" tabindex="-1">' + esc(title) + '</h1>' +
      (sub ? '<p class="hero-sub">' + sub + '</p>' : '') +
      '<div class="auth-card">' + inner + '</div>' +
      (foot || '') +
      (LIVE ? '' : '<p class="tertiary auth-note">Demo mode: sign-in is simulated and nothing is sent anywhere.</p>') +
    '</div>';
  }

  const authError = '<p class="field-error" id="a-error" hidden>' + icon('alert') + '<span></span></p>';
  const busyLabel = (idle, busy) => (ui.authBusy ? busy : idle);

  function viewAuth() {
    const mode = ui.authMode;
    const email = esc(ui.authEmail || '');

    if (mode === 'check-email') {
      return authShell('Check your email',
        'We sent a confirmation link to <strong>' + email + '</strong>. Open it on this device to finish creating your account.',
        '<div class="stack-sm">' +
          btn(busyLabel('Send the link again', 'Sending…'), 'resend-confirm', { size: 'lg', disabled: ui.authBusy }) +
          authError +
        '</div>',
        '<p class="auth-switch muted">Wrong address? <button type="button" class="link-btn" data-action="auth-mode" data-id="signup">Start over</button></p>');
    }
    if (mode === 'forgot') {
      return authShell('Reset your password', 'Enter your email and we’ll send you a link to choose a new password.',
        '<form data-form="forgot" class="stack-sm" novalidate>' +
          '<div class="field"><label class="field-label" for="a-email">Email</label>' +
            '<input class="input" id="a-email" name="email" type="email" autocomplete="email" required value="' + email + '" /></div>' +
          authError +
          btn(busyLabel('Send reset link', 'Sending…'), null, { variant: 'primary', size: 'lg', type: 'submit', disabled: ui.authBusy }) +
        '</form>',
        '<p class="auth-switch muted"><button type="button" class="link-btn" data-action="auth-mode" data-id="signin">Back to sign in</button></p>');
    }
    if (mode === 'reset-sent') {
      return authShell('Check your email', 'If there’s an account for <strong>' + email + '</strong>, a reset link is on its way. It expires in an hour.',
        btn('Back to sign in', 'auth-mode', { id: 'signin', size: 'lg' }));
    }
    if (mode === 'reset-new') {
      return authShell('Choose a new password', 'You’re signed in. Pick a new password to finish.',
        '<form data-form="reset-new" class="stack-sm" novalidate>' +
          '<div class="field"><label class="field-label" for="a-pass">New password</label>' +
            '<p class="field-desc">At least 8 characters.</p>' +
            '<input class="input" id="a-pass" name="password" type="password" autocomplete="new-password" required /></div>' +
          authError +
          btn(busyLabel('Save password', 'Saving…'), null, { variant: 'primary', size: 'lg', type: 'submit', disabled: ui.authBusy }) +
        '</form>');
    }

    const signup = mode === 'signup';
    return authShell(signup ? 'Create your account' : 'Welcome back',
      signup ? 'Leaky finds the subscriptions hiding in your inbox and keeps them under budget.' : 'Sign in to pick up where you left off.',
      '<div class="stack-xs">' + btn('Continue with Google', 'social', { id: 'google', size: 'lg', icon: 'google', disabled: ui.authBusy }) + '</div>' +
      '<div class="divider" role="separator"><span>or</span></div>' +
      '<form data-form="auth" class="stack-sm" novalidate>' +
        '<div class="field"><label class="field-label" for="a-email">Email</label>' +
          '<input class="input" id="a-email" name="email" type="email" autocomplete="email" required value="' + email + '" /></div>' +
        '<div class="field"><div class="field-label-row"><label class="field-label" for="a-pass">Password</label>' +
            (signup ? '' : '<button type="button" class="link-btn link-sm" data-action="auth-mode" data-id="forgot">Forgot password?</button>') + '</div>' +
          (signup ? '<p class="field-desc">At least 8 characters.</p>' : '') +
          '<input class="input" id="a-pass" name="password" type="password" autocomplete="' + (signup ? 'new-password' : 'current-password') + '" required /></div>' +
        authError +
        btn(busyLabel(signup ? 'Create account' : 'Sign in', signup ? 'Creating account…' : 'Signing in…'), null, { variant: 'primary', size: 'lg', type: 'submit', disabled: ui.authBusy }) +
      '</form>',
      '<p class="auth-switch muted">' + (signup ? 'Already have an account?' : 'New to Leaky?') +
        ' <button type="button" class="link-btn" data-action="auth-mode" data-id="' + (signup ? 'signin' : 'signup') + '">' + (signup ? 'Sign in' : 'Create one') + '</button></p>');
  }

  function wizard(step, inner, o) {
    o = o || {};
    const i = stepIndex(step);
    return '<div class="onb">' +
      '<div class="wiz-head">' +
        (i > 0 && o.back !== false ? btn('Back', 'onb-back', { variant: 'ghost', icon: 'chevLeft' }) : '<span></span>') +
        '<p class="label">Step ' + (i + 1) + ' of ' + STEPS.length + '</p>' +
      '</div>' +
      '<div class="wiz-bar" aria-hidden="true">' + STEPS.map((s, k) => '<span' + (k <= i ? ' class="on"' : '') + '></span>').join('') + '</div>' +
      '<div class="step-enter wiz-body">' + inner + '</div>' +
    '</div>';
  }

  function viewOnboarding() {
    switch (state.step) {
      case 'goals': return wizard('goals', onbGoals());
      case 'budget': return wizard('budget', onbBudget());
      case 'source': return wizard('source', onbSource());
      default: return wizard('name', onbName());
    }
  }

  function onbName() {
    return '<h1 class="hero-title" tabindex="-1">What should we call you?</h1>' +
      '<p class="hero-sub">So Leaky can say hello properly. First names are fine.</p>' +
      '<form class="onb-form" data-form="onb-name" novalidate>' +
        '<div class="field"><label class="field-label" for="onb-name">Your name</label>' +
          '<input class="input" id="onb-name" name="name" autocomplete="given-name" required value="' + esc(state.user.name || '') + '" />' +
          '<p class="field-error" id="n-error" hidden>' + icon('alert') + '<span>Add a name, even a short one.</span></p></div>' +
        '<div class="onb-actions">' + btn('Continue', null, { variant: 'primary', size: 'lg', type: 'submit' }) + '</div>' +
      '</form>';
  }

  function onbGoals() {
    return '<h1 class="hero-title" tabindex="-1">What should Leaky watch for?</h1>' +
      '<p class="hero-sub">Pick as many as you like. You can change these in settings.</p>' +
      '<div class="goal-grid stagger">' + GOALS.map((g) => {
        const on = state.goals.includes(g.id);
        return '<button type="button" class="goal" aria-pressed="' + on + '" data-action="onb-goal" data-id="' + g.id + '">' +
          '<span class="goal-icon">' + icon(g.icon, 20) + '</span>' +
          '<span class="goal-text"><span class="goal-title">' + esc(g.title) + '</span><span class="goal-desc">' + esc(g.desc) + '</span></span>' +
          '<span class="goal-check">' + icon('check') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="onb-actions">' + btn('Continue', 'onb-goals-next', { variant: 'primary', size: 'lg' }) + '</div>';
  }

  function onbBudget() {
    const T = totals();
    const b = state.budget;
    return '<h1 class="hero-title" tabindex="-1">What’s your monthly budget for subscriptions?</h1>' +
      '<p class="hero-sub">Subscriptions only, not your general spending.' +
        (state.subs.length ? ' Yours come to ' + money(T.projected) + ' this month.' : ' Leaky compares this with what we find next.') + '</p>' +
      '<form class="onb-form" data-form="onb-budget" novalidate>' +
        '<div class="field"><label class="field-label" for="onb-budget">Monthly budget</label>' +
          '<div class="affix"><span>$</span><input class="input" id="onb-budget" name="budget" inputmode="decimal" autocomplete="off" value="' + (b ? esc(b) : '') + '" /></div></div>' +
        '<div class="onb-status" id="onb-status" aria-live="polite">' + onbStatus(T.projected, b) + '</div>' +
        '<div class="onb-actions">' +
          btn('Skip for now', 'onb-skip', { variant: 'ghost', size: 'lg' }) +
          btn('Continue', null, { variant: 'primary', size: 'lg', type: 'submit' }) +
        '</div>' +
      '</form>';
  }

  function onbStatus(projected, budget) {
    const md = moodFor(projected, budget);
    if (!budget || !state.subs.length) return '<div class="say">' + fox(budget ? md : 'neutral') + '<p class="speech">' + esc(speech(budget ? md : 'neutral', projected, budget)) + '</p></div>';
    const st = budgetStatus(projected, budget);
    return meter(projected, budget) +
      '<div class="budget-line" style="justify-content:space-between;margin:0">' + statusHtml(st.tone, st.label) +
      '<span class="muted">' + money(projected) + ' of ' + money(budget) + '</span></div>' +
      '<div class="say">' + fox(md) + '<p class="speech">' + esc(speech(md, projected, budget)) + '</p></div>';
  }

  function onbSource() {
    const has = state.subs.length > 0;
    return '<h1 class="hero-title" tabindex="-1">Where should we look for subscriptions?</h1>' +
      '<p class="hero-sub">Connect an inbox and Leaky reads the receipts and renewal emails for you. Or add them by hand.</p>' +
      '<div class="choice-grid stagger onb-choices">' +
        choiceCard({ tone: 'clay', icon: 'mail', title: 'Gmail', desc: 'Sign in with Google and allow read-only access. Takes a few seconds.',
          actions: btn('Connect Gmail', 'connect-gmail', { variant: has ? 'secondary' : 'primary' }) }) +
        choiceCard({ tone: 'amber', icon: 'edit', title: 'By hand', desc: 'Type them in yourself. You can always connect an inbox later.',
          actions: btn('Add a subscription', 'add-sub', { icon: 'plus' }) }) +
      '</div>' +
      (has ? onbSubsTable() : '') +
      '<div class="onb-actions">' + (has
        ? btn('Finish', 'onb-finish', { variant: 'primary', size: 'lg' })
        : '<button type="button" class="link-btn" data-action="onb-finish">Skip for now, I’ll add them later</button>') + '</div>';
  }

  function onbSubsTable(list) {
    list = list || state.subs;
    const rows = list.map((s) =>
      '<tr data-open="' + s.id + '"><td><div class="name-cell"><button type="button" class="row-link" data-action="open-sub" data-id="' + s.id + '">' + esc(s.name) + '</button>' + tag(s.category) + '</div></td>' +
      '<td class="col-status">' + subStatus(s) + '</td>' +
      '<td class="num">' + money(s.amount) + '<span class="per">' + (s.cycle === 'yearly' ? '/yr' : '/mo') + '</span></td></tr>'
    ).join('');
    return '<div class="table-card"><table class="rtable"><thead><tr><th>Name</th><th>Status</th><th class="num">Price</th></tr></thead><tbody class="stagger">' + rows + '</tbody></table>' +
      '<div class="pager"><span>' + plural(list.length, 'subscription') + ' · ' + money(round2(list.reduce((a, x) => a + perMonth(x), 0))) + ' a month</span></div></div>';
  }

  function parseMoney(v) {
    const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
    return isFinite(n) && n > 0 ? round2(n) : null;
  }

  /* ======================================================================
     Scanning (simulated)
     ====================================================================== */
  function makeSubs(provider) {
    const t = today();
    return SAMPLE_INBOX
      .filter((x) => !state.ignored.includes(x.name.toLowerCase()))
      .filter((x) => !state.subs.some((s) => s.name.toLowerCase() === x.name.toLowerCase()))
      .map((x) => {
        const trial = x.trial != null;
        return {
          id: uid(),
          name: x.name,
          category: x.cat,
          amount: x.amount,
          cycle: x.cycle,
          status: trial ? 'trial' : 'active',
          nextRenewal: trial ? addDays(t, x.trial) : addDays(t, x.renew),
          trialEnds: trial ? addDays(t, x.trial) : null,
          trialStarted: trial ? addDays(t, x.trial - x.trialLength) : null,
          lastUsed: x.used != null ? addDays(t, x.used) : null,
          priceHistory: (x.history || [[x.amount, -200]]).map(([a, d]) => ({ amount: a, date: addDays(t, d) })),
          source: provider,
          review: !!x.review,
          detectedAt: t,
        };
      });
  }

  /* ======================================================================
     Connect flow: your email -> scanning -> results. A page, not a modal.
     ====================================================================== */
  const SCAN_TOTAL = 3184;
  /* Emails that stream past while scanning. tag null = not a billing email. */
  const SCAN_MAIL = [
    { from: 'Netflix', subj: 'Your receipt for September', tag: 'Receipt' },
    { from: 'Ana', subj: 'Weekend plans?', tag: null },
    { from: 'Spotify', subj: 'Spotify Premium: payment confirmed', tag: 'Receipt' },
    { from: 'Duolingo', subj: 'Your Super trial has started', tag: 'Trial' },
    { from: 'Amazon', subj: 'Your order has shipped', tag: null },
    { from: 'Adobe', subj: 'Invoice for Creative Cloud', tag: 'Receipt' },
    { from: 'Netflix', subj: 'We’re updating our prices', tag: 'Price change' },
    { from: 'The New York Times', subj: 'Payment received, thank you', tag: 'Receipt' },
    { from: 'GitHub', subj: '[repo] Pull request merged', tag: null },
    { from: 'Amazon Prime', subj: 'Your membership renews soon', tag: 'Renewal' },
    { from: 'Strava', subj: 'Welcome to your free trial', tag: 'Trial' },
    { from: 'Apple', subj: 'Your receipt from Apple', tag: 'Receipt' },
    { from: 'Headspace', subj: 'Subscription renewed', tag: 'Receipt' },
    { from: 'Mum', subj: 'Photos from Sunday', tag: null },
    { from: 'Disney+', subj: 'Your monthly statement', tag: 'Receipt' },
    { from: 'OpenAI', subj: 'Your ChatGPT Plus receipt', tag: 'Receipt' },
  ];
  const SCAN_TAG_TONE = { Receipt: 'sky', Renewal: 'amber', Trial: 'clay', 'Price change': 'rose' };

  function startConnect(provider) {
    ui.connect = { provider: provider, phase: 'email', account: null, emitted: [], count: 0, found: 0, results: [], rescan: false };
    render();
    focusTitle();
  }

  function startScan(account, rescan) {
    ui.connect = { provider: account.provider, phase: 'scan', account: account, emitted: [], count: 0, found: 0, results: [], rescan: !!rescan };
    render();
    focusTitle();
    const fast = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gap = fast ? 120 : 300;
    const c = ui.connect;
    const tick = () => {
      if (ui.connect !== c) return;
      const i = c.emitted.length;
      if (i >= SCAN_MAIL.length) return setTimeout(finish, fast ? 200 : 500);
      const m = SCAN_MAIL[i];
      c.emitted.push(m);
      if (m.tag) c.found++;
      c.count = Math.min(SCAN_TOTAL, Math.round(((i + 1) / SCAN_MAIL.length) * SCAN_TOTAL + (i < SCAN_MAIL.length - 1 ? (i * 37) % 90 : 0)));
      paintScan(m, fast);
      setTimeout(tick, gap);
    };
    const finish = () => {
      if (ui.connect !== c) return;
      const now = new Date().toISOString();
      if (!c.rescan) state.accounts.push(c.account);
      state.accounts.forEach((a) => { if (a.id === c.account.id || c.rescan) a.lastScan = now; });
      const found = makeSubs(c.account.provider);
      state.subs = state.subs.concat(found);
      c.results = found.map((x) => x.id);
      c.phase = 'results';
      save();
      render();
      focusTitle();
    };
    setTimeout(tick, fast ? 200 : 600);
  }

  /* Update the scan screen in place so rows and bars animate instead of re-rendering. */
  function paintScan(m, fast) {
    const c = ui.connect;
    const list = $('#mail-list');
    const bar = $('#scan-bar');
    const count = $('#scan-count');
    const found = $('#scan-found');
    if (bar) bar.style.transform = 'scaleX(' + (c.count / SCAN_TOTAL) + ')';
    if (count) count.textContent = c.count.toLocaleString('en-US') + ' of ' + SCAN_TOTAL.toLocaleString('en-US') + ' emails';
    if (found) found.textContent = plural(c.found, 'billing email');
    if (!list || !m) return;
    const li = document.createElement('li');
    li.className = 'mail is-entering';
    li.innerHTML = mailRow(m, false);
    list.appendChild(li);
    requestAnimationFrame(() => requestAnimationFrame(() => li.classList.remove('is-entering')));
    setTimeout(() => { li.querySelector('.mail-tag').outerHTML = mailTag(m, true); }, fast ? 60 : 180);
    while (list.children.length > 6) {
      const first = list.firstElementChild;
      first.classList.add('is-leaving');
      setTimeout(() => first.remove(), 150);
      if (list.children.length - 1 <= 6) break;
    }
  }

  function mailTag(m, revealed) {
    if (!revealed) return '<span class="mail-tag tag tag-neutral is-pending">Reading…</span>';
    return m.tag
      ? '<span class="mail-tag tag tag-' + SCAN_TAG_TONE[m.tag] + '">' + esc(m.tag) + '</span>'
      : '<span class="mail-tag tag tag-neutral">Skipped</span>';
  }
  function mailRow(m, revealed) {
    return '<span class="mail-icon">' + icon('mail') + '</span>' +
      '<span class="mail-text"><span class="mail-from">' + esc(m.from) + '</span><span class="mail-subj">' + esc(m.subj) + '</span></span>' +
      mailTag(m, revealed);
  }

  function stepper(phase) {
    const steps = [['email', 'Your email'], ['scan', 'Scanning'], ['results', 'Results']];
    const i = steps.findIndex((x) => x[0] === phase);
    return '<ol class="stepper" aria-label="Progress">' + steps.map((st, k) =>
      '<li class="' + (k < i ? 'done' : k === i ? 'now' : '') + '"' + (k === i ? ' aria-current="step"' : '') + '>' +
        '<span class="st-dot">' + (k < i ? icon('check') : (k + 1)) + '</span><span class="st-label">' + st[1] + '</span></li>'
    ).join('') + '</ol>';
  }

  function viewConnect() {
    const c = ui.connect;
    const P = PROVIDERS[c.provider];
    let inner = '';
    if (c.phase === 'email') inner = connectEmail(c, P);
    else if (c.phase === 'scan') inner = connectScan(c, P);
    else inner = connectResults(c, P);
    return '<div class="onb connect">' +
      '<div class="wiz-head">' +
        (c.phase === 'email' ? btn('Back', 'connect-back', { variant: 'ghost', icon: 'chevLeft' }) : '<span></span>') +
        '<p class="label">' + esc(P.label) + '</p>' +
      '</div>' +
      stepper(c.phase) +
      '<div class="step-enter wiz-body" data-phase="' + c.phase + '">' + inner + '</div>' +
    '</div>';
  }

  function connectEmail(c, P) {
    return '<h1 class="hero-title" tabindex="-1">Connect Gmail</h1>' +
      '<p class="hero-sub">Enter the address of the inbox to read. Leaky only looks at billing emails, and you can disconnect any time.</p>' +
      '<form class="connect-card" data-form="connect-email" novalidate>' +
        '<div class="field"><label class="field-label" for="c-email">Gmail address</label>' +
          '<input class="input" id="c-email" name="email" type="email" autocomplete="email" inputmode="email" required value="' + esc((state.user && state.user.email) || '') + '" /></div>' +
        '<p class="field-error" id="c-error" hidden>' + icon('alert') + '<span></span></p>' +
        btn('Continue with Google', null, { variant: 'primary', size: 'lg', type: 'submit' }) +
        '<p class="tertiary auth-note">Prototype: this skips Google’s sign-in and runs a simulated scan with sample data.</p>' +
      '</form>';
  }

  function connectScan(c, P) {
    const rows = c.emitted.slice(-6).map((m) => '<li class="mail">' + mailRow(m, true) + '</li>').join('');
    return '<h1 class="hero-title" tabindex="-1">Reading your inbox</h1>' +
      '<p class="hero-sub">' + esc(c.account.address) + ' · Only billing emails are read. Everything else is skipped without being stored.</p>' +
      '<div class="scan" aria-live="polite">' +
        '<div class="scan-counts"><span id="scan-count">' + c.count.toLocaleString('en-US') + ' of ' + SCAN_TOTAL.toLocaleString('en-US') + ' emails</span>' +
          '<span id="scan-found" class="muted">' + plural(c.found, 'billing email') + '</span></div>' +
        '<div class="progress" role="progressbar" aria-label="Emails scanned" aria-valuemin="0" aria-valuemax="' + SCAN_TOTAL + '" aria-valuenow="' + c.count + '">' +
          '<span id="scan-bar" style="transform:scaleX(' + (c.count / SCAN_TOTAL) + ')"></span></div>' +
        '<ul class="mail-list" id="mail-list">' + rows + '</ul>' +
      '</div>';
  }

  function connectResults(c, P) {
    const found = c.results.map(findSub).filter(Boolean);
    const n = found.length;
    const trials = found.filter((s) => s.status === 'trial').length;
    const rises = found.filter((s) => priceChange(s)).length;
    const review = found.filter((s) => s.review).length;
    const chips = [SCAN_TOTAL.toLocaleString('en-US') + ' emails read', plural(n, 'subscription')]
      .concat(trials ? [plural(trials, 'free trial')] : [])
      .concat(rises ? [plural(rises, 'price rise')] : []);
    const title = n ? (c.rescan ? 'We found ' + plural(n, 'new subscription') : 'We found ' + plural(n, 'subscription')) : (c.rescan ? 'Nothing new' : 'No subscriptions found');
    const sub = n
      ? (review ? plural(review, 'receipt') + ' needed a second look, flagged below. ' : '') + 'Tap a row to edit it, or add anything we missed.'
      : (c.rescan ? 'Your list is up to date.' : 'Nothing that looks like a subscription turned up. You can add them by hand.');
    return '<h1 class="hero-title" tabindex="-1">' + esc(title) + '</h1>' +
      '<p class="hero-sub">' + esc(sub) + '</p>' +
      '<ul class="chips stagger">' + chips.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      (n ? onbSubsTable(found) : '') +
      '<div class="onb-actions">' +
        btn('Add one by hand', 'add-sub', { icon: 'plus', size: 'lg' }) +
        btn(state.onboarded ? 'Done' : 'Finish', 'connect-done', { variant: 'primary', size: 'lg' }) +
      '</div>';
  }

  /* ======================================================================
     Overview
     ====================================================================== */
  function viewOverview() {
    const T = totals();
    const b = state.budget;
    const md = moodFor(T.projected, b);
    const month = MONTHS_LONG[new Date().getMonth()];
    const n = activeSubs().length;
    const action = state.accounts.length
      ? btn('Add subscription', 'add-sub', { icon: 'plus' }) + btn('Scan inbox', 'scan-all', { variant: 'primary', icon: 'refresh' })
      : btn('Add subscription', 'add-sub', { variant: 'primary', icon: 'plus' });

    const header = pageHeader({
      title: 'Overview',
      subtitle: esc(month) + ' · ' + plural(n, 'active subscription'),
      action: action,
    });

    if (!state.subs.length) {
      return header + emptyState({
        icon: 'drop',
        title: 'Nothing tracked yet',
        text: 'Connect an inbox and Leaky will find your subscriptions, or add them one by one.',
        action: state.accounts.length ? '' : btn('Connect an inbox', 'go-inbox'),
      });
    }

    const st = budgetStatus(T.projected, b);
    const budgetCard =
      '<section class="card budget-card" aria-labelledby="budget-h">' +
        '<div class="budget-head">' +
          '<div>' +
            '<h2 class="label" id="budget-h">Projected for ' + esc(month) + '</h2>' +
            '<p class="big-num"><span class="num-xl">' + money(T.projected) + '</span>' +
              '<span class="muted">' + (b ? 'of ' + money(b) + ' budget' : 'no budget set') + '</span></p>' +
          '</div>' +
          (st ? '<div class="budget-line">' + statusHtml(st.tone, st.label) +
            '<span class="muted">' + (T.projected > b ? money(T.projected - b) + ' over' : money(b - T.projected) + ' left') + '</span></div>' : '') +
        '</div>' +
        '<div class="chart-bar"><div class="seg" role="group" aria-label="Chart range">' +
          '<button type="button" class="seg-btn" data-action="chart-range" data-id="3m" aria-pressed="' + (ui.chartRange !== '12m') + '">3 months</button>' +
          '<button type="button" class="seg-btn" data-action="chart-range" data-id="12m" aria-pressed="' + (ui.chartRange === '12m') + '">12 months</button>' +
        '</div></div>' +
        '<div class="chart" id="budget-chart"></div>' +
        '<dl class="stats">' +
          '<div><dt>Already charged</dt><dd>' + money(T.charged) + '</dd></div>' +
          '<div><dt>Still to come</dt><dd>' + money(T.toCome) + '</dd></div>' +
          '<div><dt>Average per month</dt><dd>' + money(T.avg) + '</dd></div>' +
          '<div><dt>Per year</dt><dd>' + money(T.yearly) + '</dd></div>' +
        '</dl>' +
      '</section>';

    const pennyCard =
      '<section class="card penny-card" aria-labelledby="penny-h">' +
        '<div class="card-head"><h2 class="section-title" id="penny-h">Penny</h2><span class="muted">' + FOX_LABEL[foxAct(md)] + '</span></div>' +
        '<div class="penny">' + fox(md, { size: 3, caption: false }) + '<p class="penny-says">' + esc(speech(md, T.projected, b)) + '</p></div>' +
      '</section>';

    return header + '<div class="overview">' + budgetCard + upcomingCard() + pennyCard + '</div>';
  }

  function attentionItems(T) {
    const items = [];
    const S = state.settings;
    const b = state.budget;
    const unused = S.unusedFlag ? state.subs.filter(isUnused) : [];

    if (b && T.projected > b) {
      const free = round2(unused.reduce((sum, s) => sum + (chargeThisMonth(s) ? s.amount : 0), 0));
      items.push({
        tone: 'critical', icon: 'alert',
        title: 'Projected ' + money(T.projected - b) + ' over budget',
        desc: free ? 'Cancelling the unused subscriptions below would free up ' + money(free) + ' this month.' : 'Review your subscriptions to find some room.',
        actions: btn('Review subscriptions', 'go-subs'),
      });
    }
    if (!b) {
      items.push({
        tone: 'warning', icon: 'wallet', title: 'No monthly budget set',
        desc: 'Set one so Leaky can tell you when subscriptions add up.',
        actions: btn('Set budget', 'go-budget'),
      });
    }
    state.subs.filter((s) => s.review).forEach((s) => items.push({
      tone: 'warning', icon: 'alert', title: 'Check the details for ' + s.name,
      desc: 'We couldn’t read the amount on this receipt with confidence.',
      actions: btn('Review', 'open-sub', { id: s.id }),
    }));
    if (S.trialAlerts) {
      state.subs.filter((s) => s.status === 'trial' && !s.trialAck && daysBetween(today(), s.trialEnds) <= 7).forEach((s) => items.push({
        tone: 'warning', icon: 'gift', title: s.name + ' trial ends ' + fmtRel(s.trialEnds),
        desc: 'Then ' + money(s.amount) + (s.cycle === 'yearly' ? ' a year' : ' a month') + '. Cancel before ' + fmtDate(s.trialEnds) + ' if you don’t want it.',
        actions: btn('Mark cancelled', 'cancel-sub', { id: s.id }) + btn('Keep it', 'keep-trial', { id: s.id, variant: 'ghost' }),
      }));
    }
    if (S.priceAlerts) {
      state.subs.filter((s) => s.status !== 'cancelled' && !s.priceAck && priceChange(s)).forEach((s) => {
        const pc = priceChange(s);
        items.push({
          tone: 'warning', icon: 'trend', title: s.name + ' raised its price',
          desc: money(pc.from) + ' to ' + money(pc.to) + (s.cycle === 'yearly' ? ' a year' : ' a month') + ', since ' + fmtDate(pc.date) + '.',
          actions: btn('Review', 'open-sub', { id: s.id }) + btn('Got it', 'ack-price', { id: s.id, variant: 'ghost' }),
        });
      });
    }
    unused.forEach((s) => items.push({
      tone: 'info', icon: 'pause', title: s.name + ' looks unused',
      desc: 'No activity emails for ' + Math.floor(daysBetween(s.lastUsed, today()) / 30) + ' months. It costs ' + money(perMonth(s)) + ' a month.',
      actions: btn('Mark cancelled', 'cancel-sub', { id: s.id }) + btn('Still using it', 'ack-unused', { id: s.id, variant: 'ghost' }),
    }));
    if (state.plan === 'free' && activeSubs().length > FREE_LIMIT) {
      items.push({
        tone: 'info', icon: 'sparkle', title: 'The free plan covers ' + FREE_LIMIT + ' subscriptions',
        desc: 'Leaky is tracking ' + activeSubs().length + '. Upgrade to get alerts for all of them.',
        actions: btn('See plans', 'go-plan'),
      });
    }
    return items;
  }

  function viewNotifications() {
    const items = attentionItems(totals());
    const header = pageHeader({
      title: 'Notifications',
      subtitle: items.length ? plural(items.length, 'thing') + ' to look at' : 'You’re all caught up',
    });
    if (!items.length) {
      return header + emptyState({ icon: 'bell', title: 'All clear', text: 'Leaky will let you know here about trials ending, price rises, unused subscriptions and your budget.' });
    }
    return header + '<section class="card notif-card" aria-label="Notifications"><ul class="attn stagger">' + items.map((it) =>
      '<li class="attn-item tone-' + it.tone + '"><span class="attn-icon">' + icon(it.icon) + '</span>' +
      '<p class="attn-title">' + (it.tone === 'critical' || it.tone === 'warning' ? '<span class="sr-only">Warning: </span>' : '') + esc(it.title) + '</p>' +
      '<p class="attn-desc">' + esc(it.desc) + '</p>' +
      '<div class="attn-actions">' + it.actions + '</div></li>'
    ).join('') + '</ul></section>';
  }

  function upcomingCard() {
    const t = today();
    const horizon = addDays(t, 14);
    const list = activeSubs()
      .map((s) => ({ s: s, d: nextCharge(s) }))
      .filter((x) => x.d && x.d >= t && x.d <= horizon)
      .sort((a, b) => a.d.localeCompare(b.d));
    const lead = (s) => (s.status === 'trial' ? state.settings.trialAlerts && state.settings.trialDays : state.settings.renewalAlerts && state.settings.renewalDays);
    const rows = list.map(({ s, d }) => {
      const days = daysBetween(t, d);
      const reminder = lead(s) && days <= lead(s);
      return '<div class="up-row">' +
        '<div class="up-date">' + esc(fmtDate(d)) + '<span class="muted">' + esc(fmtRel(d)) + '</span></div>' +
        '<div class="up-name"><button type="button" class="row-link" data-action="open-sub" data-id="' + s.id + '">' + esc(s.name) + '</button>' +
          (s.status === 'trial' ? '<span class="tag tag-neutral">Trial ends</span>' : tag(s.category)) +
          (reminder ? '<span class="bell" title="Reminder on">' + icon('bell') + '<span class="sr-only">Reminder on</span></span>' : '') + '</div>' +
        '<div class="up-amt">' + money(s.amount) + '<span class="muted">' + (s.cycle === 'yearly' ? 'yearly' : 'monthly') + '</span></div>' +
      '</div>';
    }).join('');
    return '<section class="card" aria-labelledby="up-h"><div class="card-head"><h2 class="section-title" id="up-h">Coming up</h2><span class="muted">Next 14 days</span></div>' +
      (rows ? '<div class="upcoming stagger">' + rows + '</div>' : emptyState({ small: true, icon: 'clock', title: 'No renewals in the next two weeks' })) +
      '</section>';
  }

  /* ======================================================================
     Budget chart: cumulative spend through the month against the limit
     ====================================================================== */
  /* Every charge date inside [start, end], projected from each subscription's billing cycle. */
  function chargesInWindow(start, end) {
    const out = {};
    const amountAt = (s, d) => {
      const h = s.priceHistory || [];
      let a = h.length ? h[0].amount : s.amount;
      h.forEach((x) => { if (x.date <= d) a = x.amount; });
      return h.length ? a : s.amount;
    };
    activeSubs().forEach((s) => {
      const anchor = s.status === 'trial' ? s.trialEnds : s.nextRenewal;
      if (!anchor) return;
      const cm = cycleMonths(s);
      for (let k = -14; k <= 14; k++) {
        const d = addMonths(anchor, k * cm);
        if (d < start || d > end) continue;
        if (s.status === 'trial' && d < s.trialEnds) continue;
        (out[d] = out[d] || []).push({ s: s, amount: amountAt(s, d) });
      }
    });
    return out;
  }

  function chartData(months) {
    const t = today();
    const [y, m] = t.split('-').map(Number);
    const start = toISO(new Date(y, m - 2, 1));
    const endD = new Date(y, m - 2 + months, 0);
    const end = toISO(endD);
    const n = daysBetween(start, end) + 1;
    const charges = chargesInWindow(start, end);
    const cum = []; const iso = []; const monthsOut = [];
    let run = 0; let cur = null;
    for (let i = 0; i < n; i++) {
      const d = addDays(start, i);
      iso[i] = d;
      if (d.slice(0, 7) !== cur) {
        cur = d.slice(0, 7);
        run = 0;
        monthsOut.push({ key: cur, from: i, to: i, label: MONTHS[Number(d.slice(5, 7)) - 1], year: Number(d.slice(0, 4)) });
      }
      run = round2(run + (charges[d] || []).reduce((a, c) => a + c.amount, 0));
      cum[i] = run;
      monthsOut[monthsOut.length - 1].to = i;
      monthsOut[monthsOut.length - 1].total = run;
    }
    return { n: n, cum: cum, iso: iso, months: monthsOut, charges: charges, todayI: daysBetween(start, t), start: start };
  }

  function renderChart() {
    const el = $('#budget-chart');
    if (!el) return;
    const months = ui.chartRange === '12m' ? 12 : 3;
    const D = chartData(months);
    const b = state.budget;
    const W = Math.max(280, el.clientWidth);
    const H = 220;
    const padL = 44; const padR = 16; const padT = 24; const padB = 28;
    const top = Math.max.apply(null, D.months.map((mo) => mo.total).concat([b || 0]));
    const maxV = (top || 10) * 1.2;
    const last = D.n - 1;
    const x = (i) => padL + (i / last) * (W - padL - padR);
    const yv = (v) => padT + (1 - v / maxV) * (H - padT - padB);
    const snap = (v) => Math.round(v / 2) * 2;
    const pt = (i) => snap(x(i)) + ',' + snap(yv(D.cum[i]));
    const range = (a, c) => Array.from({ length: c - a + 1 }, (_, i) => a + i);
    const baseY = yv(0);
    const ti = Math.max(0, Math.min(last, D.todayI));

    /* Drawn as a staircase: each charge is a vertical jump, like an 8-bit score counter.
       Each month starts again from zero, so the line drops to the floor at the boundary. */
    const linePts = (from, to) => range(from, to).map((i) => {
      if (i === from) return pt(i);
      const reset = D.iso[i].slice(8) === '01';
      const px = snap(x(i));
      return px + ',' + snap(yv(D.cum[i - 1])) + ' ' +
        (reset ? px + ',' + snap(baseY) + ' ' : '') + pt(i);
    }).join(' ');
    const solid = linePts(0, ti);
    const dashed = linePts(ti, last);
    const area = linePts(0, last) + ' ' + x(last).toFixed(1) + ',' + baseY.toFixed(1) + ' ' + x(0).toFixed(1) + ',' + baseY.toFixed(1);

    const step = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000].find((k) => maxV / k <= 4) || 10000;
    let grid = '';
    for (let v = step; v <= maxV; v += step) {
      if (b && Math.abs(yv(v) - yv(b)) < 14) continue;
      grid += '<line class="grid" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + yv(v).toFixed(1) + '" y2="' + yv(v).toFixed(1) + '"/>' +
        '<text class="axis" x="' + (padL - 8) + '" y="' + (yv(v) + 4).toFixed(1) + '" text-anchor="end">$' + v + '</text>';
    }

    /* Month bands: boundary lines, a centred label, and each month's total above its peak. */
    const segW = (W - padL - padR) / D.months.length;
    const nowK = Math.max(0, D.months.findIndex((mo) => mo.from <= ti && ti <= mo.to));
    const monthMarks = D.months.map((mo, k) => {
      const cx = (x(mo.from) + x(mo.to)) / 2;
      const label = mo.label + (months === 12 && mo.label === 'Jan' ? ' ’' + String(mo.year).slice(2) : '');
      const every = segW >= 40 ? 1 : segW >= 22 ? 2 : 3;
      const isNow = mo.from <= ti && ti <= mo.to;
      return (k ? '<line class="band" x1="' + x(mo.from).toFixed(1) + '" x2="' + x(mo.from).toFixed(1) + '" y1="' + padT + '" y2="' + baseY.toFixed(1) + '"/>' : '') +
        ((k - nowK) % every === 0 ? '<text class="axis' + (isNow ? ' axis-now' : '') + '" x="' + cx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + label + '</text>' : '') +
        (segW >= 64 && mo.total ? '<text class="end-label' + (b && mo.total > b ? ' is-over' : '') + '" x="' + x(mo.to).toFixed(1) + '" y="' + (yv(mo.total) - 8).toFixed(1) + '" text-anchor="end">' + money(mo.total) + '</text>' : '');
    }).join('');

    /* Budget sits on the y-axis as its own tick, so it never collides with the data. */
    let ref = '';
    if (b) {
      const by = yv(b);
      ref = '<line class="ref" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + by.toFixed(1) + '" y2="' + by.toFixed(1) + '"/>' +
        '<text class="ref-label" x="' + (padL - 8) + '" y="' + (by + 4).toFixed(1) + '" text-anchor="end">$' + Math.round(b) + '</text>';
    }
    const overClip = b ? '<clipPath id="over-clip"><rect x="0" y="0" width="' + W + '" height="' + yv(b).toFixed(1) + '"/></clipPath>' : '';
    const over = b ? '<polygon class="over" points="' + area + '" clip-path="url(#over-clip)"/>' : '';
    const cur = D.months.find((mo) => mo.from <= ti && ti <= mo.to) || D.months[0];
    const first = D.months[0]; const lastM = D.months[D.months.length - 1];

    el.innerHTML =
      '<svg class="chart-svg" shape-rendering="crispEdges" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
        'aria-label="Subscription spend by month, ' + first.label + ' to ' + lastM.label + '. ' + money(D.cum[ti]) + ' charged so far in ' + cur.label + ', ' + money(cur.total) + ' projected' +
        (b ? ', against a ' + money(b) + ' monthly budget.' : '.') + '">' +
        '<defs>' + overClip +
          '<pattern id="area-grad" width="4" height="4" patternUnits="userSpaceOnUse"><rect class="d-area" width="2" height="2"/><rect class="d-area" x="2" y="2" width="2" height="2"/></pattern>' +
          '<pattern id="over-grad" width="4" height="4" patternUnits="userSpaceOnUse"><rect class="d-over" width="4" height="2"/><rect class="d-over" x="2" y="2" width="2" height="2"/></pattern>' +
        '</defs>' +
        grid + monthMarks +
        '<polygon class="area" points="' + area + '"/>' + over +
        '<line class="base" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + baseY.toFixed(1) + '" y2="' + baseY.toFixed(1) + '"/>' +
        ref +
        '<polyline class="line" points="' + solid + '"/>' +
        '<polyline class="line projected" points="' + dashed + '"/>' +
        (b ? '<g clip-path="url(#over-clip)"><polyline class="line line-over" points="' + solid + '"/>' +
          '<polyline class="line line-over projected" points="' + dashed + '"/></g>' : '') +
        '<rect class="marker" x="' + (snap(x(ti)) - 5) + '" y="' + (snap(yv(D.cum[ti])) - 5) + '" width="10" height="10"/>' +
        '<g class="hover" hidden><line class="crosshair" y1="' + padT + '" y2="' + baseY.toFixed(1) + '"/><rect class="hover-dot" width="10" height="10"/></g>' +
        '<rect class="hit" x="' + padL + '" y="0" width="' + (W - padL - padR) + '" height="' + H + '" fill="transparent"/>' +
      '</svg>' +
      '<div class="tooltip" hidden></div>' +
      '<ul class="legend" aria-hidden="true">' +
        '<li><span class="sw sw-solid"></span>Charged</li>' +
        '<li><span class="sw sw-dashed"></span>Projected</li>' +
        (b ? '<li><span class="sw sw-ref"></span>Monthly budget</li>' : '') +
        (b && D.months.some((mo) => mo.total > b) ? '<li><span class="sw sw-over"></span>Over budget</li>' : '') +
      '</ul>';

    el._geo = { D: D, x: x, yv: yv, padL: padL, padR: padR, W: W, H: H, last: last, ti: ti };
  }

  function chartHover(el, clientX) {
    const g = el._geo;
    if (!g) return;
    const svg = el.querySelector('svg');
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left;
    const i = Math.max(0, Math.min(g.last, Math.round(((px - g.padL) / (g.W - g.padL - g.padR)) * g.last)));
    const hover = svg.querySelector('.hover');
    const cx = g.x(i); const cy = g.yv(g.D.cum[i]);
    hover.hidden = false;
    hover.querySelector('.crosshair').setAttribute('x1', cx);
    hover.querySelector('.crosshair').setAttribute('x2', cx);
    hover.querySelector('.hover-dot').setAttribute('x', Math.round(cx / 2) * 2 - 5);
    hover.querySelector('.hover-dot').setAttribute('y', Math.round(cy / 2) * 2 - 5);
    const tip = el.querySelector('.tooltip');
    const d = g.D.iso[i];
    const mo = MONTHS[Number(d.slice(5, 7)) - 1];
    const kind = i <= g.ti ? 'charged' : 'projected';
    const items = g.D.charges[d] || [];
    tip.innerHTML = '<p class="tip-title">' + esc(fmtDate(d)) + '</p>' +
      '<p><span class="tip-val">' + money(g.D.cum[i]) + '</span> <span class="muted">' + kind + ' so far in ' + mo + '</span></p>' +
      (items.length ? '<ul class="tip-list">' + items.map((c) => '<li><span>' + esc(c.s.name) + '</span><span>' + money(c.amount) + '</span></li>').join('') + '</ul>' : '');
    tip.hidden = false;
    const tw = tip.offsetWidth;
    let left = cx + 12;
    if (left + tw > g.W) left = cx - tw - 12;
    tip.style.left = Math.max(0, left) + 'px';
    tip.style.top = Math.max(0, Math.min(cy - 12, g.H - tip.offsetHeight)) + 'px';
  }

  function chartLeave(el) {
    const hover = el.querySelector('.hover');
    const tip = el.querySelector('.tooltip');
    if (hover) hover.hidden = true;
    if (tip) tip.hidden = true;
  }

  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest('#budget-chart');
    if (el) chartHover(el, e.clientX);
  });
  document.addEventListener('pointerleave', (e) => {
    if (e.target && e.target.id === 'budget-chart') chartLeave(e.target);
  }, true);
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest && e.target.closest('#budget-chart');
    if (el) chartHover(el, e.clientX);
    else { const c = $('#budget-chart'); if (c) chartLeave(c); }
  });
  window.addEventListener('resize', () => { if ($('#budget-chart')) renderChart(); });

  /* ======================================================================
     Subscriptions
     ====================================================================== */
  const TABS = [
    { id: 'all', label: 'All', test: () => true },
    { id: 'active', label: 'Active', test: (s) => s.status === 'active' },
    { id: 'trial', label: 'Trials', test: (s) => s.status === 'trial' },
    { id: 'cancelled', label: 'Cancelled', test: (s) => s.status === 'cancelled' },
  ];

  function viewSubs() {
    const T = totals();
    const header = pageHeader({
      title: 'Subscriptions',
      subtitle: plural(activeSubs().length, 'active subscription') + ' · ' + money(T.avg) + ' a month on average',
      action: btn('Add subscription', 'add-sub', { variant: 'primary', icon: 'plus' }),
    });
    if (!state.subs.length) {
      return header + emptyState({
        icon: 'list',
        title: 'No subscriptions yet',
        text: state.accounts.length ? 'Nothing turned up in your inbox. Add one by hand.' : 'Connect your inbox and Leaky will find them, or add one by hand.',
        action: state.accounts.length ? '' : btn('Connect an inbox', 'go-inbox'),
      });
    }

    const tabs = '<div class="tabs" role="tablist" aria-label="Status">' + TABS.map((tb) =>
      '<button type="button" class="tab" role="tab" id="tab-' + tb.id + '" aria-selected="' + (ui.tab === tb.id) + '" aria-controls="subs-panel" data-action="tab" data-id="' + tb.id + '">' +
      tb.label + '<span class="count">' + state.subs.filter(tb.test).length + '</span></button>'
    ).join('') + '</div>';

    const catOpts = [['all', 'All']].concat(Object.keys(CATS).filter((k) => state.subs.some((s) => s.category === k)).map((k) => [k, CATS[k].label]));
    const srcOpts = [['all', 'All']].concat(Object.keys(PROVIDERS).filter((k) => state.subs.some((s) => s.source === k)).map((k) => [k, PROVIDERS[k].label]));
    const filterBtn = (key, label, value, opts) =>
      '<label class="filter-btn"><span>' + label + ' · <span class="val" data-val="' + key + '">' + esc((opts.find((o) => o[0] === value) || opts[0])[1]) + '</span></span>' + icon('chevDown') +
      '<select data-filter="' + key + '" aria-label="' + label + '">' +
      opts.map(([v, l]) => '<option value="' + v + '"' + (v === value ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select></label>';

    const toolbar = '<div class="toolbar">' +
      '<div class="search">' + icon('search') + '<input class="input input-sm" id="search" type="search" placeholder="Search subscriptions" aria-label="Search subscriptions" value="' + esc(ui.search) + '" /></div>' +
      filterBtn('category', 'Category', ui.category, catOpts) +
      filterBtn('source', 'Source', ui.source, srcOpts) +
      '<button type="button" class="link-btn" id="reset-filters" data-action="reset-filters"' + (filtersActive() ? '' : ' hidden') + '>Reset filters</button>' +
    '</div>';

    return header + tabs + '<div class="table-card" id="subs-panel" role="tabpanel" aria-labelledby="tab-' + ui.tab + '">' + toolbar + '<div id="subs-rows">' + subsRows() + '</div></div>';
  }

  const filtersActive = () => !!ui.search || ui.category !== 'all' || ui.source !== 'all';

  function filteredSubs() {
    const tb = TABS.find((x) => x.id === ui.tab) || TABS[0];
    const q = ui.search.trim().toLowerCase();
    const list = state.subs.filter((s) =>
      tb.test(s) &&
      (ui.category === 'all' || s.category === ui.category) &&
      (ui.source === 'all' || s.source === ui.source) &&
      (!q || s.name.toLowerCase().includes(q))
    );
    const dir = ui.sort.dir === 'asc' ? 1 : -1;
    const key = {
      name: (s) => s.name.toLowerCase(),
      next: (s) => nextCharge(s) || '9999',
      price: (s) => perMonth(s) || s.amount / 1000,
    }[ui.sort.key];
    return list.sort((a, b) => {
      const x = key(a); const y = key(b);
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  }

  function sortHeader(key, label, cls) {
    const on = ui.sort.key === key;
    return '<th class="' + (cls || '') + '"' + (on ? ' aria-sort="' + (ui.sort.dir === 'asc' ? 'ascending' : 'descending') + '"' : '') + '>' +
      '<button type="button" class="th-sort" data-action="sort" data-id="' + key + '">' + label +
      (on ? icon(ui.sort.dir === 'asc' ? 'arrowUp' : 'arrowDown') : '') + '</button></th>';
  }

  function subsRows() {
    const list = filteredSubs();
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    ui.page = Math.min(ui.page, pages);
    const start = (ui.page - 1) * PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);

    if (!total) {
      return emptyState({
        small: true, icon: 'search', title: 'No subscriptions match',
        text: filtersActive() ? 'Try a different search or reset the filters.' : 'Nothing in this tab yet.',
      });
    }

    const rows = pageItems.map((s) => {
      const d = nextCharge(s);
      const pc = state.settings.priceAlerts ? priceChange(s) : null;
      const used = s.lastUsed ? fmtRel(s.lastUsed) : 'No data';
      const cycle = s.cycle === 'yearly' ? 'Yearly' : 'Monthly';
      const src = PROVIDERS[s.source] ? PROVIDERS[s.source].label : 'Added by hand';
      return '<tr data-open="' + s.id + '" class="' + (s.status === 'cancelled' ? 'is-cancelled' : '') + '">' +
        '<td><div class="name-cell"><button type="button" class="row-link" data-action="open-sub" data-id="' + s.id + '">' + esc(s.name) + '</button>' + tag(s.category) + '</div>' +
          '<div class="sub-meta"><span class="m-1024">' + esc(src) + ' · last activity ' + esc(used) + '</span>' +
          '<span class="m-640">' + cycle + (d ? ' · ' + (s.status === 'trial' ? 'trial ends ' : 'next ') + esc(fmtDate(d)) : '') + '</span></div></td>' +
        '<td class="col-status">' + subStatus(s) + '</td>' +
        '<td class="col-mid">' + cycle + '</td>' +
        '<td class="col-mid">' + (d ? '<div class="cell-date">' + esc(fmtDate(d)) + '<span class="muted">' + esc(fmtRel(d)) + '</span></div>' : '<span class="muted">None</span>') + '</td>' +
        '<td class="col-low muted">' + esc(used) + '</td>' +
        '<td class="col-low muted">' + esc(src) + '</td>' +
        '<td class="num">' + (pc && !s.priceAck ? '<span class="price-up" title="Price went up from ' + money(pc.from) + '">' + icon('trend') + '<span class="sr-only">Price went up from ' + money(pc.from) + '. </span></span>' : '') +
          money(s.amount) + '<span class="per">' + (s.cycle === 'yearly' ? '/yr' : '/mo') + '</span></td>' +
      '</tr>';
    }).join('');

    let pager = '';
    if (pages > 1) {
      let nums = '';
      for (let i = 1; i <= pages; i++) {
        nums += '<button type="button" class="page-btn" data-action="page" data-id="' + i + '"' + (i === ui.page ? ' aria-current="page"' : '') + ' aria-label="Page ' + i + '">' + i + '</button>';
      }
      pager = '<div class="pages">' +
        '<button type="button" class="page-btn" data-action="page" data-id="' + (ui.page - 1) + '" aria-label="Previous page"' + (ui.page === 1 ? ' disabled' : '') + '>' + icon('chevLeft') + '</button>' +
        nums +
        '<button type="button" class="page-btn" data-action="page" data-id="' + (ui.page + 1) + '" aria-label="Next page"' + (ui.page === pages ? ' disabled' : '') + '>' + icon('chevRight') + '</button></div>';
    }

    return '<div class="table-scroll"><table class="rtable"><thead><tr>' +
      sortHeader('name', 'Name') + '<th>Status</th><th class="col-mid">Billing</th>' + sortHeader('next', 'Next charge', 'col-mid') +
      '<th class="col-low">Last activity</th><th class="col-low">Source</th>' + sortHeader('price', 'Price', 'num') +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="pager"><span>' + (start + 1) + '–' + Math.min(start + PAGE_SIZE, total) + ' of ' + plural(total, 'item') + '</span>' + pager + '</div>';
  }

  function refreshRows() {
    const el = $('#subs-rows');
    if (el) el.innerHTML = subsRows();
    const reset = $('#reset-filters');
    if (reset) reset.hidden = !filtersActive();
  }

  /* ======================================================================
     Inbox
     ====================================================================== */
  function inboxEvents() {
    const t = today();
    const out = [];
    state.subs.filter((s) => s.source !== 'manual').forEach((s) => {
      const account = state.accounts.find((a) => a.provider === s.source);
      const base = { s: s, account: account ? account.address : PROVIDERS[s.source].label };
      if (s.status === 'trial' && s.trialStarted) out.push(Object.assign({ type: 'Trial confirmation', date: s.trialStarted, amount: 0 }, base));
      const pc = priceChange(s);
      if (pc) out.push(Object.assign({ type: 'Price change notice', date: addDays(pc.date, -14), amount: pc.to }, base));
      const last = lastCharge(s);
      if (last) out.push(Object.assign({ type: 'Receipt', date: last, amount: s.amount }, base));
      if (s.cycle === 'yearly' && s.status === 'active') {
        const notice = addDays(s.nextRenewal, -30);
        if (notice <= t) out.push(Object.assign({ type: 'Renewal notice', date: notice, amount: s.amount }, base));
      }
    });
    return out.filter((e) => e.date <= t).sort((a, b) => b.date.localeCompare(a.date));
  }

  function inboxBody() {
    const a = state.accounts[0];
    if (!a) {
      return '<div class="setting"><div class="setting-text"><p class="setting-label">Gmail</p>' +
        '<p class="setting-desc">Leaky reads receipts, renewal notices, trial confirmations and price-change emails. Nothing else.</p></div>' +
        btn('Connect Gmail', 'connect-gmail', { icon: 'mail' }) + '</div>';
    }
    const events = inboxEvents();
    return '<div class="account"><span class="account-icon">' + icon('mail', 20) + '</span>' +
        '<div><p class="account-name">' + esc(a.address) + '</p>' +
        '<p class="account-meta"><span>' + esc(PROVIDERS.gmail.how) + '</span>' +
        statusHtml('success', 'Connected') + '<span>Last scan ' + esc(a.lastScan ? relTime(a.lastScan) : 'never') + '</span></p></div>' +
        '<div class="account-actions">' + btn('Scan now', 'scan-all', { icon: 'refresh' }) + btn('Disconnect', 'disconnect', { id: a.id, variant: 'ghost' }) + '</div>' +
      '</div>' +
      (events.length
        ? '<div class="table-card"><div class="table-scroll"><table class="rtable"><thead><tr><th>From</th><th class="col-mid">Email</th><th class="col-mid">Received</th><th>Read as</th><th class="num">Amount</th></tr></thead><tbody>' +
          events.map((e) =>
            '<tr data-open="' + e.s.id + '"><td><div class="name-cell"><button type="button" class="row-link" data-action="open-sub" data-id="' + e.s.id + '">' + esc(e.s.name) + '</button></div>' +
            '<div class="sub-meta"><span class="m-1024">' + esc(e.type) + ' · ' + esc(fmtDate(e.date)) + '</span><span class="m-640">' + esc(e.type) + ' · ' + esc(fmtDate(e.date)) + '</span></div></td>' +
            '<td class="col-mid">' + esc(e.type) + '</td>' +
            '<td class="col-mid muted">' + esc(fmtDate(e.date)) + '</td>' +
            '<td class="col-status">' + (e.s.review && e.type === 'Receipt' ? statusHtml('warning', 'Needs a check') : statusHtml('success', 'Parsed')) + '</td>' +
            '<td class="num">' + (e.amount ? money(e.amount) : '<span class="muted">Free</span>') + '</td></tr>'
          ).join('') + '</tbody></table></div>' +
          '<div class="pager"><span>' + plural(events.length, 'billing email') + ' found</span></div></div>'
        : '');
  }

  function relTime(iso) {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return plural(mins, 'minute') + ' ago';
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return plural(hrs, 'hour') + ' ago';
    return fmtRel(toISO(new Date(iso)));
  }

  /* ======================================================================
     Settings
     ====================================================================== */
  function viewSettings() {
    const S = state.settings;
    const T = totals();
    const b = state.budget;
    const plan = PLANS.find((p) => p.id === state.plan);

    const budgetBody =
      '<div class="field"><label class="field-label" for="budget-input">Monthly budget</label>' +
        '<p class="field-desc" id="budget-desc">Covers subscriptions only, not general spending. Leaky compares it with this month’s projected total.</p>' +
        '<div class="affix" style="max-width:240px"><span>$</span><input class="input" id="budget-input" inputmode="decimal" autocomplete="off" aria-describedby="budget-desc" value="' + (b ? esc(b.toFixed(2)) : '') + '" /></div>' +
        '<p class="muted">This month: ' + money(T.projected) + ' projected.</p></div>';

    const days = [[1, '1 day before'], [3, '3 days before'], [7, '7 days before']];
    const alertRow = (key, label, desc, extra) =>
      '<div class="setting"><div class="setting-text"><p class="setting-label" id="lbl-' + key + '">' + label + '</p><p class="setting-desc">' + desc + '</p>' +
      (S[key] && extra ? '<div class="setting-control">' + extra + '</div>' : '') + '</div>' + toggle(key, S[key], label) + '</div>';

    const canNotify = 'Notification' in window;
    const blocked = canNotify && Notification.permission === 'denied';
    const pushOn = S.notifications && canNotify && !blocked;
    const channelRow = (key, label, desc, on, extra, disabled) =>
      '<div class="setting"><div class="setting-text"><p class="setting-label">' + label + '</p><p class="setting-desc">' + desc + '</p>' +
      (on && extra ? '<div class="setting-control">' + extra + '</div>' : '') + '</div>' + toggle(key, on, label, { disabled: disabled }) + '</div>';
    const alertsBody =
      '<p class="overline">How to reach you</p>' +
      channelRow('notifications', 'Push notifications',
        !canNotify ? 'This browser doesn’t support notifications.' : blocked ? 'Notifications are blocked for this site in your browser settings.' : 'Alerts on this device, even when Leaky is closed.',
        pushOn, btn('Send a test notification', 'test-notify', { icon: 'bell' }), !canNotify || blocked) +
      channelRow('emailAlerts', 'Email alerts', 'Alerts sent to ' + esc((state.user && state.user.email) || 'your account email') + '.',
        S.emailAlerts,
        '<label class="field-label" for="s-email-freq">Send</label>' + selectField('emailFreq', S.emailFreq, [['instant', 'As they happen'], ['daily', 'Daily summary'], ['weekly', 'Weekly summary']], { id: 's-email-freq', setting: 'emailFreq' }) +
        '<p class="field-desc">Email delivery switches on once Leaky’s email service is connected.</p>') +
      '<p class="overline">What to alert you about</p>' +
      alertRow('renewalAlerts', 'Renewal alerts', 'A reminder before a subscription renews, so there’s time to cancel.',
        '<label class="field-label" for="s-renewal">Remind me</label>' + selectField('renewalDays', S.renewalDays, days, { id: 's-renewal', setting: 'renewalDays' })) +
      alertRow('trialAlerts', 'Free trial warnings', 'A warning before a free trial turns into a paid subscription.',
        '<label class="field-label" for="s-trial">Warn me</label>' + selectField('trialDays', S.trialDays, days, { id: 's-trial', setting: 'trialDays' })) +
      alertRow('priceAlerts', 'Price increase alerts', 'Tells you when a merchant raises its price.') +
      alertRow('unusedFlag', 'Unused subscription flagging', 'Highlights subscriptions with no activity emails for a while.',
        '<label class="field-label" for="s-unused">Flag after</label>' + selectField('unusedMonths', S.unusedMonths, [[1, '1 month'], [2, '2 months'], [3, '3 months'], [6, '6 months']], { id: 's-unused', setting: 'unusedMonths' }));

    const channels = [pushOn ? 'push' : null, S.emailAlerts ? 'email' : null].filter(Boolean);
    const alertsSummary = (channels.length ? channels.join(' + ') : 'No delivery') + ' · ' + [
      S.renewalAlerts ? 'Renewals ' + S.renewalDays + (S.renewalDays === 1 ? ' day' : ' days') + ' before' : null,
      S.trialAlerts ? 'trials' : null,
      S.priceAlerts ? 'price rises' : null,
      S.unusedFlag ? 'unused after ' + plural(S.unusedMonths, 'month') : null,
    ].filter(Boolean).join(', ');

    const deviceBody =
      '<div class="setting"><div class="setting-text"><p class="setting-label">Install Leaky</p>' +
        '<p class="setting-desc">' + (isStandalone() ? 'Leaky is installed on this device.' : ui.installEvent ? 'Add Leaky to your home screen or dock, like an app.' : 'Use your browser’s “Add to Home Screen” or install option to keep Leaky one tap away.') + '</p>' +
        (ui.installEvent && !isStandalone() ? '<div class="setting-control">' + btn('Install', 'install', { icon: 'device' }) + '</div>' : '') +
      '</div></div>';

    const planBody =
      '<div class="choice-grid">' + PLANS.map((p) => choiceCard({
        tone: p.tone, icon: p.icon, title: p.name, price: p.price, desc: p.desc,
        badge: p.id === state.plan ? ' <span class="tag tag-neutral">Current plan</span>' : '',
        actions: p.id === state.plan ? '' : btn('Switch to ' + p.name, 'choose-plan', { id: p.id }),
      })).join('') + '</div>' +
      '<p class="muted">Prototype: switching plans doesn’t take a payment.</p>';

    const section = (id, title, summary, body, flag) => {
      const open = ui.openSection === id;
      return '<section class="card acc' + (open ? ' is-open' : '') + '">' +
        '<h2 class="acc-h"><button type="button" class="acc-btn" id="acc-' + id + '" data-action="toggle-section" data-id="' + id + '" aria-expanded="' + open + '" aria-controls="acc-body-' + id + '">' +
          '<span class="acc-title">' + title + '</span>' +
          '<span class="acc-summary" data-summary="' + id + '">' + (flag ? '<span class="flag">' + icon('alert') + esc(summary) + '</span>' : esc(summary)) + '</span>' +
          icon('chevDown') + '</button></h2>' +
        '<div class="acc-body" id="acc-body-' + id + '"' + (open ? '' : ' hidden') + '>' + body + '</div></section>';
    };

    const u = state.user;
    const method = u.method === 'google' ? 'Signed in with Google' : 'Signed in with email';
    const accountBody =
      '<div class="field"><label class="field-label" for="name-input">Your name</label>' +
        '<input class="input" id="name-input" autocomplete="given-name" style="max-width:240px" value="' + esc(u.name || '') + '" /></div>' +
      '<div class="setting"><div class="setting-text"><p class="setting-label">' + esc(method) + '</p>' +
        '<p class="setting-desc">' + (u.email ? esc(u.email) : 'Leaky only stores what it needs to keep your list on this device.') + '</p></div>' +
        btn('Sign out', 'sign-out') + '</div>' +
      (LIVE && u.method === 'email' ? '<div class="setting"><div class="setting-text"><p class="setting-label">Password</p>' +
        '<p class="setting-desc">We’ll email you a link to choose a new one.</p></div>' + btn('Change password', 'change-password') + '</div>' : '');

    return pageHeader({ title: 'Settings', subtitle: 'Changes save automatically.' }) +
      section('account', 'Account', (u.name || 'No name') + (u.email ? ' · ' + u.email : ''), accountBody) +
      section('inbox', 'Inbox', state.accounts[0] ? state.accounts[0].address + ' · last scan ' + (state.accounts[0].lastScan ? relTime(state.accounts[0].lastScan) : 'never') : 'Not connected', inboxBody(), !state.accounts.length) +
      section('budget', 'Budget', b ? money(b) + ' a month' : 'Not set', budgetBody, !b) +
      section('alerts', 'Alerts', alertsSummary, alertsBody) +
      section('device', 'This device', isStandalone() ? 'Installed' : 'Not installed', deviceBody) +
      section('plan', 'Plan', plan.name + (plan.id === 'free' ? ' · up to ' + FREE_LIMIT + ' subscriptions' : ' · ' + plan.price), planBody,
        state.plan === 'free' && activeSubs().length > FREE_LIMIT) +
      '<h2 class="danger-title">Danger zone</h2>' +
      '<div class="card danger-card">' +
        (LIVE
          ? '<div class="setting"><div class="setting-text"><p class="setting-label">Delete account</p><p class="setting-desc">Permanently deletes your account, subscriptions and settings.</p></div>' +
            btn('Delete account', 'delete-all', { variant: 'danger-outline' }) + '</div>'
          : '<div class="setting"><div class="setting-text"><p class="setting-label">Delete all data</p><p class="setting-desc">Removes inboxes, subscriptions and settings from this device and starts over.</p></div>' +
            btn('Delete all data', 'delete-all', { variant: 'danger-outline' }) + '</div>') +
      '</div>';
  }

  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  /* ======================================================================
     Overlays: modal, sheet, toast
     ====================================================================== */
  let lastFocus = null;

  function openOverlay(html) {
    lastFocus = document.activeElement;
    $('#overlay').innerHTML = html;
    document.body.classList.add('no-scroll');
    const first = $('#overlay input, #overlay select, #overlay [data-autofocus]') || $('#overlay button');
    if (first) first.focus();
  }

  function closeOverlay() {
    const ov = $('#overlay');
    if (!ov.innerHTML || ov.classList.contains('is-closing')) return;
    const restore = lastFocus;
    const done = () => {
      ov.innerHTML = '';
      ov.classList.remove('is-closing');
      document.body.classList.remove('no-scroll');
      if (restore && document.contains(restore)) restore.focus();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
    ov.classList.add('is-closing');
    setTimeout(done, 150);
  }

  function modal(o) {
    openOverlay(
      '<div class="scrim" data-action="close"></div>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<form data-form="' + (o.form || '') + '" novalidate>' +
          '<h2 class="modal-title" id="modal-title">' + esc(o.title) + '</h2>' +
          '<div class="modal-body">' + o.body + '</div>' +
          '<div class="modal-actions">' + btn('Cancel', 'close') + o.primary + '</div>' +
        '</form>' +
      '</div>'
    );
  }

  function confirmModal(title, text, label, action) {
    modal({
      title: title,
      form: 'confirm',
      body: '<p>' + esc(text) + '</p>',
      primary: btn(label, action, { variant: 'danger' }),
    });
  }

  function sheet(sub) {
    const isNew = !sub;
    const s = sub || { name: '', category: 'other', amount: '', cycle: 'monthly', status: 'active', nextRenewal: addMonths(today(), 1), lastUsed: null, source: 'manual' };
    const dateVal = s.status === 'trial' ? s.trialEnds : s.nextRenewal;
    const catOpts = Object.keys(CATS).map((k) => [k, CATS[k].label]);
    const src = s.source === 'manual'
      ? icon('edit') + '<span>Added by hand</span>'
      : icon(PROVIDERS[s.source].icon) + '<span>Found in ' + esc(PROVIDERS[s.source].label) + (s.detectedAt ? ' on ' + esc(fmtDate(s.detectedAt)) : '') + '</span>';
    openOverlay(
      '<div class="sheet-backdrop" data-action="close"></div>' +
      '<aside class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
        '<form data-form="sub" data-id="' + (s.id || '') + '" style="display:contents">' +
          '<div class="sheet-head"><div>' +
            '<p class="label">' + (isNew ? 'New subscription' : 'Subscription') + '</p>' +
            '<h2 class="modal-title" id="sheet-title">' + (isNew ? 'Add a subscription' : esc(s.name)) + '</h2></div>' +
            btn('', 'close', { variant: 'ghost', icon: 'x', aria: 'Close' }).replace('class="btn', 'class="sheet-close btn') +
          '</div>' +
          '<div class="sheet-body">' +
            (s.review ? '<div class="callout callout-warning">' + icon('alert') + '<span><span class="sr-only">Warning: </span>We weren’t sure about the amount on this receipt. Check it matches your latest charge, then save.</span></div>' : '') +
            (isNew ? '' : '<p class="source-line">' + src + '</p>') +
            '<div class="field"><label class="field-label" for="f-name">Name</label><input class="input" id="f-name" name="name" required value="' + esc(s.name) + '" /></div>' +
            '<div class="field"><label class="field-label" for="f-cat">Category</label>' + selectField('category', s.category, catOpts, { id: 'f-cat' }) + '</div>' +
            '<div class="field-row">' +
              '<div class="field"><label class="field-label" for="f-amount">Price</label><div class="affix"><span>$</span><input class="input" id="f-amount" name="amount" inputmode="decimal" required value="' + (s.amount === '' ? '' : esc(Number(s.amount).toFixed(2))) + '" /></div></div>' +
              '<div class="field"><label class="field-label" for="f-cycle">Billing</label>' + selectField('cycle', s.cycle, [['monthly', 'Monthly'], ['yearly', 'Yearly']], { id: 'f-cycle' }) + '</div>' +
            '</div>' +
            '<div class="field-row">' +
              '<div class="field"><label class="field-label" for="f-status">Status</label>' + selectField('status', s.status, [['active', 'Active'], ['trial', 'Free trial'], ['cancelled', 'Cancelled']], { id: 'f-status' }) + '</div>' +
              '<div class="field"><label class="field-label" for="f-date" id="f-date-label">' + dateLabel(s.status) + '</label><input class="input" id="f-date" name="date" type="date" required value="' + esc(dateVal || '') + '" /></div>' +
            '</div>' +
            '<div class="field"><label class="field-label" for="f-used">Last activity</label>' +
              '<p class="field-desc">From sign-in and usage emails. Used to flag subscriptions you’ve stopped using.</p>' +
              '<input class="input" id="f-used" name="lastUsed" type="date" value="' + esc(s.lastUsed || '') + '" /></div>' +
            '<p class="field-error" id="f-error" hidden>' + icon('alert') + '<span></span></p>' +
          '</div>' +
          '<div class="sheet-foot">' +
            (isNew ? '' : btn('Delete', 'delete-sub', { variant: 'danger-outline', icon: 'trash', id: s.id })) +
            '<span class="spacer"></span>' +
            btn('Cancel', 'close') +
            btn(isNew ? 'Add subscription' : 'Save changes', null, { variant: 'primary', type: 'submit' }) +
          '</div>' +
        '</form>' +
      '</aside>'
    );
  }

  const dateLabel = (status) => (status === 'trial' ? 'Trial ends' : status === 'cancelled' ? 'Paid until' : 'Next charge');

  function toast(msg, undo) {
    const region = $('#toasts');
    clearTimeout(ui.toastTimer);
    region.innerHTML = '<div class="toast is-entering" role="status">' + icon('check') + '<span>' + esc(msg) + '</span>' +
      (undo ? '<button type="button" data-action="undo">Undo</button>' : '') + '</div>';
    const el = region.firstElementChild;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('is-entering')));
    ui.undo = undo || null;
    ui.toastTimer = setTimeout(() => {
      const el = region.firstElementChild;
      if (!el) return;
      el.classList.add('is-leaving');
      setTimeout(() => { if (region.firstElementChild === el) region.innerHTML = ''; ui.undo = null; }, 220);
    }, undo ? 6000 : 3200);
  }

  const settingsSaved = () => toast('Your settings have been updated');

  /* ======================================================================
     Actions
     ====================================================================== */
  function findSub(id) { return state.subs.find((s) => s.id === id); }

  function focusTitle() {
    const h = $('#view h1');
    if (h) h.focus({ preventScroll: true });
  }

  /* Change a subscription and note the room it frees up this month. */
  function withRelief(fn) {
    const before = totals().projected;
    fn();
    const after = totals().projected;
    if (state.budget && after < before) {
      ui.relief = { amount: round2(before - after), until: Date.now() + 5000 };
      setTimeout(() => {
        if (ui.relief && ui.relief.until <= Date.now()) {
          ui.relief = null;
          if (route() === 'overview' && !$('#overlay').innerHTML) render();
        }
      }, 5100);
    }
  }

  function cancelSub(id) {
    const s = findSub(id);
    if (!s) return;
    const prev = s.status;
    withRelief(() => { s.status = 'cancelled'; });
    save();
    render();
    toast('Marked ' + s.name + ' as cancelled. Cancel it with ' + s.name + ' too.', () => {
      s.status = prev;
      ui.relief = null;
      save();
      render();
    });
  }

  const ACTIONS = {
    close: closeOverlay,
    'connect-gmail': () => startConnect('gmail'),
    'chart-range': (id) => {
      ui.chartRange = id;
      document.querySelectorAll('.seg-btn').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.id === id)));
      renderChart();
    },
    'connect-back': () => { ui.connect = null; render(); focusTitle(); },
    'connect-done': () => {
      ui.connect = null;
      if (!state.onboarded) return finishOnboarding();
      location.hash = '#/overview';
      render();
      focusTitle();
    },
    social: (id) => {
      if (!LIVE) return signIn({ method: id, email: null, name: '' });
      authRun(async () => {
        const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: APP_URL } });
        if (error) throw error;
      }, true);
    },
    'auth-mode': (id) => {
      const email = $('#a-email');
      if (email && email.value) ui.authEmail = email.value.trim();
      ui.authMode = id || (ui.authMode === 'signup' ? 'signin' : 'signup');
      render();
      focusTitle();
    },
    'resend-confirm': () => authRun(async () => {
      const { error } = await sb.auth.resend({ type: 'signup', email: ui.authEmail, options: { emailRedirectTo: APP_URL } });
      if (error) throw error;
      toast('Sent. Check your inbox and spam folder.');
    }),
    'sign-out': async () => {
      setUserMenu(false);
      if (LIVE && sb) { await flushPush(); await sb.auth.signOut().catch(() => {}); }
      signedOut();
    },
    'change-password': () => {
      const email = state.user && state.user.email;
      if (!LIVE || !email) return;
      sb.auth.resetPasswordForEmail(email, { redirectTo: APP_URL })
        .then(({ error }) => toast(error ? authMessage(error) : 'We sent a link to ' + email + ' to set a new password.'));
    },
    'onb-back': () => {
      const i = stepIndex(state.step);
      goStep(STEPS[Math.max(0, i - 1)]);
    },
    'onb-goal': (id) => {
      state.goals = state.goals.includes(id) ? state.goals.filter((g) => g !== id) : state.goals.concat(id);
      save();
      const b = $('.goal[data-id="' + id + '"]');
      if (b) b.setAttribute('aria-pressed', String(state.goals.includes(id)));
    },
    'onb-goals-next': () => goStep('budget'),
    'onb-skip': () => { state.budget = null; goStep('source'); },
    'onb-finish': finishOnboarding,
    'scan-all': () => { if (state.accounts.length) startScan(state.accounts[0], true); },
    'add-sub': () => sheet(null),
    'open-sub': (id) => { const s = findSub(id); if (s) sheet(s); },
    'cancel-sub': cancelSub,
    'keep-trial': (id) => { const s = findSub(id); if (s) { s.trialAck = true; save(); render(); toast('Keeping ' + s.name + ' after the trial'); } },
    'ack-price': (id) => { const s = findSub(id); if (s) { s.priceAck = true; save(); render(); } },
    'ack-unused': (id) => { const s = findSub(id); if (s) { s.lastUsed = today(); save(); render(); toast('Got it. ' + s.name + ' won’t be flagged for now.'); } },
    'go-subs': () => { location.hash = '#/subscriptions'; },
    'go-inbox': () => { ui.openSection = 'inbox'; location.hash = '#/settings'; },
    'go-budget': () => { ui.openSection = 'budget'; location.hash = '#/settings'; },
    'go-plan': () => { ui.openSection = 'plan'; location.hash = '#/settings'; },
    tab: (id) => { ui.tab = id; ui.page = 1; render(); const t = $('#tab-' + id); if (t) t.focus(); },
    sort: (key) => {
      ui.sort = ui.sort.key === key ? { key: key, dir: ui.sort.dir === 'asc' ? 'desc' : 'asc' } : { key: key, dir: 'asc' };
      refreshRows();
      const b = $('.th-sort[data-id="' + key + '"]');
      if (b) b.focus();
    },
    page: (n) => { ui.page = Number(n); refreshRows(); const b = $('.page-btn[aria-current="page"]'); if (b) b.focus(); },
    'reset-filters': () => { ui.search = ''; ui.category = 'all'; ui.source = 'all'; ui.page = 1; render(); const s = $('#search'); if (s) s.focus(); },
    disconnect: (id) => {
      const a = state.accounts.find((x) => x.id === id);
      state.accounts = state.accounts.filter((x) => x.id !== id);
      save(); render();
      toast('Disconnected ' + (a ? a.address : 'inbox'));
    },
    'delete-all': () => LIVE
      ? confirmModal('Delete your account?', 'This permanently deletes your account, subscriptions and settings. It can’t be undone.', 'Delete account', 'confirm-delete-all')
      : confirmModal('Delete all data?', 'This removes your inboxes, subscriptions and settings from this device. It can’t be undone.', 'Delete everything', 'confirm-delete-all'),
    'confirm-delete-all': async () => {
      if (LIVE && sb) {
        clearTimeout(pushTimer);
        const { error } = await sb.rpc('delete_account');
        if (error) { closeOverlay(); toast('Couldn’t delete your account. Try again.'); return; }
        await sb.auth.signOut().catch(() => {});
      }
      closeOverlay();
      signedOut();
      ui.authMode = 'signup';
      render();
    },
    'delete-sub': (id) => {
      const s = findSub(id);
      if (!s) return;
      const idx = state.subs.indexOf(s);
      withRelief(() => { state.subs.splice(idx, 1); });
      if (s.source !== 'manual') state.ignored.push(s.name.toLowerCase());
      save(); closeOverlay(); render();
      toast('Deleted ' + s.name, () => {
        state.subs.splice(idx, 0, s);
        state.ignored = state.ignored.filter((n) => n !== s.name.toLowerCase());
        ui.relief = null;
        save(); render();
      });
    },
    undo: () => { const fn = ui.undo; ui.undo = null; $('#toasts').innerHTML = ''; if (fn) fn(); },
    'toggle-section': (id) => {
      ui.openSection = ui.openSection === id ? null : id;
      render();
      const b = $('#acc-' + id);
      if (b) b.focus();
    },
    toggle: (key) => {
      if (key === 'notifications') return toggleNotifications();
      state.settings[key] = !state.settings[key];
      save(); render();
      const b = $('.switch[data-id="' + key + '"]');
      if (b) b.focus();
      settingsSaved();
    },
    'choose-plan': (id) => {
      state.plan = id;
      save(); render();
      const b = $('#acc-plan');
      if (b) b.focus();
      toast('You’re now on ' + PLANS.find((p) => p.id === id).name);
    },
    'test-notify': () => notify('Leaky test notification', 'Renewal and trial alerts will look like this.'),
    install: () => {
      const e = ui.installEvent;
      if (!e) return;
      e.prompt();
      e.userChoice.finally(() => { ui.installEvent = null; render(); });
    },
  };

  /* Demo mode only: pretend the sign-in worked. */
  function signIn(user) {
    state.user = user;
    state.step = 'name';
    save();
    render();
    focusTitle();
  }

  function signedOut() {
    clearTimeout(pushTimer);
    replaceState(null);
    ui.authMode = 'signin';
    ui.connect = null;
    saveLocal();
    if (location.hash) history.replaceState(null, '', location.pathname);
    render();
    focusTitle();
  }

  function authMessage(err) {
    const m = String((err && err.message) || '').toLowerCase();
    const code = err && err.code;
    if (code === 'invalid_credentials' || m.includes('invalid login')) return 'That email and password don’t match. Try again, or reset your password.';
    if (code === 'email_not_confirmed' || m.includes('email not confirmed')) return 'Confirm your email first. Check your inbox for the link.';
    if (code === 'user_already_exists' || m.includes('already registered')) return 'There’s already an account with this email. Sign in instead.';
    if (code === 'weak_password' || m.includes('password should')) return 'Pick a stronger password, at least 8 characters.';
    if (code === 'same_password') return 'That’s your current password. Pick a new one.';
    if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || (err && err.status === 429) || m.includes('rate limit')) return 'Too many attempts. Wait a minute and try again.';
    if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return 'Google sign-in isn’t switched on yet.';
    if (m.includes('failed to fetch') || m.includes('network')) return 'Couldn’t reach the server. Check your connection and try again.';
    return (err && err.message) || 'Something went wrong. Try again.';
  }

  /* Run an auth call with a busy state and friendly errors. keepBusy: the page is about to redirect. */
  async function authRun(fn, keepBusy) {
    if (ui.authBusy) return;
    ui.authBusy = true;
    render();
    try {
      await fn();
      if (!keepBusy) { ui.authBusy = false; render(); }
    } catch (err) {
      ui.authBusy = false;
      render();
      showError('a-error', authMessage(err));
      const field = $('#a-pass') || $('#a-email');
      if (field) field.focus();
    }
  }

  /* ---- Supabase sync: one row per user holding the app state as JSON ---- */
  let pushTimer = null;
  let pushWarned = false;

  function remotePayload() {
    const data = JSON.parse(JSON.stringify(state));
    data.user = { name: (state.user && state.user.name) || '' };
    return data;
  }

  function schedulePush() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, 800);
  }

  async function pushNow() {
    pushTimer = null;
    if (!sb || !state.user || !state.user.id) return;
    const { error } = await sb.from('leaky_state')
      .upsert({ user_id: state.user.id, data: remotePayload(), updated_at: new Date().toISOString() });
    if (error && !pushWarned) {
      pushWarned = true;
      toast('Couldn’t save to your account. Your changes are kept on this device for now.');
    }
    if (!error) pushWarned = false;
  }

  async function flushPush() {
    if (pushTimer) { clearTimeout(pushTimer); await pushNow(); }
  }

  async function applySession(session) {
    if (!session) {
      if (state.user && state.user.id) { replaceState(null); saveLocal(); }
      return;
    }
    const u = session.user;
    const meta = u.user_metadata || {};
    const provider = (u.app_metadata && u.app_metadata.provider) || 'email';
    const metaName = meta.given_name || String(meta.full_name || meta.name || '').split(' ')[0] || '';
    if (!state.user || state.user.id !== u.id) {
      const { data, error } = await sb.from('leaky_state').select('data').eq('user_id', u.id).maybeSingle();
      if (error) toast('Couldn’t load your saved data. Showing what’s on this device.');
      else replaceState(data ? data.data : null);
    }
    state.user = {
      id: u.id,
      email: u.email,
      method: provider === 'google' ? 'google' : 'email',
      name: (state.user && state.user.name) || metaName,
    };
    ui.authBusy = false;
    ui.authEmail = '';
    saveLocal();
  }

  function onAuthEvent(event, session) {
    if (event === 'PASSWORD_RECOVERY') {
      applySession(session).then(() => { ui.authMode = 'reset-new'; render(); focusTitle(); });
    } else if (event === 'SIGNED_IN') {
      if (!state.user || !session || state.user.id !== session.user.id) {
        applySession(session).then(() => { if (ui.authMode !== 'reset-new') ui.authMode = 'signin'; render(); focusTitle(); });
      }
    } else if (event === 'SIGNED_OUT') {
      if (state.user) signedOut();
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(el);
    });
  }

  async function bootLive() {
    try {
      await loadScript(SUPABASE_JS);
      sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
        auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
      });
      /* Defer work out of the callback: supabase-js holds a lock while it runs. */
      sb.auth.onAuthStateChange((event, session) => { setTimeout(() => onAuthEvent(event, session), 0); });
      const { data } = await sb.auth.getSession();
      const errParam = new URLSearchParams(location.search).get('error_description');
      if (location.search) history.replaceState(null, '', location.pathname + location.hash);
      await applySession(data.session);
      if (errParam) setTimeout(() => showError('a-error', errParam), 0);
    } catch (e) {
      setTimeout(() => toast('Couldn’t reach the account service. Try reloading.'), 0);
    }
    ui.booting = false;
    render();
    focusTitle();
    checkAlerts();
  }

  function goStep(step) {
    state.step = step;
    save();
    render();
    window.scrollTo(0, 0);
    focusTitle();
  }

  function finishOnboarding() {
    GOALS.forEach((g) => { state.settings[g.setting] = state.goals.includes(g.id); });
    state.onboarded = true;
    state.step = 'done';
    save();
    location.hash = '#/overview';
    render();
    focusTitle();
  }

  /* ======================================================================
     Forms
     ====================================================================== */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const focusSoon = () => setTimeout(focusTitle, 0);

  function showError(id, msg) {
    const el = $('#' + id);
    if (!el) return;
    if (msg) el.querySelector('span').textContent = msg;
    el.hidden = false;
  }

  function newAccount(provider, address) {
    return { id: uid(), provider: provider, address: address, connectedAt: new Date().toISOString(), lastScan: null };
  }

  const FORMS = {
    'connect-email': (f) => {
      const c = ui.connect;
      const email = f.email.value.trim();
      if (!EMAIL_RE.test(email)) { showError('c-error', 'Enter a valid email address.'); f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); return; }
      startScan(newAccount(c.provider, email), false);
    },
    confirm: () => {},
    auth: (f) => {
      const email = f.email.value.trim();
      const pass = f.password.value;
      if (!EMAIL_RE.test(email)) { showError('a-error', 'Enter a valid email address.'); f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); return; }
      if (ui.authMode === 'signup' ? pass.length < 8 : !pass) {
        showError('a-error', ui.authMode === 'signup' ? 'Use at least 8 characters.' : 'Enter your password.');
        f.password.setAttribute('aria-invalid', 'true');
        f.password.focus();
        return;
      }
      if (!LIVE) return signIn({ method: 'email', email: email, name: '' });
      ui.authEmail = email;
      if (ui.authMode === 'signup') {
        authRun(async () => {
          const { data, error } = await sb.auth.signUp({ email: email, password: pass, options: { emailRedirectTo: APP_URL } });
          if (error) throw error;
          /* An existing, confirmed email comes back with no identities instead of an error. */
          if (data.user && data.user.identities && data.user.identities.length === 0) throw { code: 'user_already_exists' };
          if (!data.session) { ui.authMode = 'check-email'; focusSoon(); }
        });
      } else {
        authRun(async () => {
          const { error } = await sb.auth.signInWithPassword({ email: email, password: pass });
          if (error) throw error;
        });
      }
    },
    forgot: (f) => {
      const email = f.email.value.trim();
      if (!EMAIL_RE.test(email)) { showError('a-error', 'Enter a valid email address.'); f.email.focus(); return; }
      ui.authEmail = email;
      authRun(async () => {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: APP_URL });
        if (error) throw error;
        ui.authMode = 'reset-sent';
        focusSoon();
      });
    },
    'reset-new': (f) => {
      const pass = f.password.value;
      if (pass.length < 8) { showError('a-error', 'Use at least 8 characters.'); f.password.focus(); return; }
      authRun(async () => {
        const { error } = await sb.auth.updateUser({ password: pass });
        if (error) throw error;
        ui.authMode = 'signin';
        toast('Password updated');
        focusSoon();
      });
    },
    'onb-name': (f) => {
      const name = f.name.value.trim();
      if (!name) { showError('n-error'); f.name.setAttribute('aria-invalid', 'true'); f.name.focus(); return; }
      state.user.name = name;
      goStep('goals');
    },
    'onb-budget': (f) => {
      const raw = f.budget.value.trim();
      const v = parseMoney(raw);
      if (raw && v == null) { f.budget.focus(); return; }
      state.budget = v;
      goStep('source');
    },
    sub: (f) => {
      const name = f.name.value.trim();
      const amount = parseFloat(String(f.amount.value).replace(/[^0-9.]/g, ''));
      const date = f.date.value;
      const status = f.status.value;
      if (!name) { showError('f-error', 'Add a name.'); f.name.focus(); return; }
      if (!isFinite(amount) || amount < 0) { showError('f-error', 'Enter a price, like 9.99.'); f.amount.focus(); return; }
      if (!date) { showError('f-error', 'Pick a date.'); f.date.focus(); return; }

      const id = f.dataset.id;
      const existing = id && findSub(id);
      const fields = {
        name: name,
        category: f.category.value,
        cycle: f.cycle.value,
        status: status,
        nextRenewal: date,
        trialEnds: status === 'trial' ? date : null,
        lastUsed: f.lastUsed.value || null,
      };
      const price = round2(amount);

      withRelief(() => {
        if (existing) {
          const h = existing.priceHistory || (existing.priceHistory = []);
          if (existing.review && h.length) h[h.length - 1].amount = price;
          else if (price !== existing.amount) { h.push({ amount: price, date: today() }); existing.priceAck = true; }
          Object.assign(existing, fields, { amount: price, review: false });
        } else {
          state.subs.push(Object.assign({
            id: uid(), amount: price, source: 'manual', review: false, detectedAt: today(),
            priceHistory: [{ amount: price, date: today() }],
          }, fields));
        }
      });
      save();
      closeOverlay();
      render();
      toast(existing ? 'Saved ' + name : 'Added ' + name);
    },
  };

  /* ======================================================================
     Settings inputs
     ====================================================================== */
  let budgetTimer = null;
  function onBudgetInput(el) {
    clearTimeout(budgetTimer);
    budgetTimer = setTimeout(() => {
      const raw = el.value.trim();
      const v = parseMoney(raw);
      if (raw && v == null) return;
      if (v === state.budget) return;
      state.budget = v;
      save();
      const sum = $('[data-summary="budget"]');
      if (sum) sum.innerHTML = v ? esc(money(v) + ' a month') : '<span class="flag">' + icon('alert') + 'Not set</span>';
      toast(v ? 'Budget updated to ' + money(v) + ' a month' : 'Budget cleared');
    }, 700);
  }

  let nameTimer = null;
  function onNameInput(el) {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => {
      const v = el.value.trim();
      if (!v || v === state.user.name) return;
      state.user.name = v;
      save();
      const sum = $('[data-summary="account"]');
      if (sum) sum.textContent = v + (state.user.email ? ' · ' + state.user.email : '');
      settingsSaved();
    }, 700);
  }

  function toggleNotifications() {
    const S = state.settings;
    const done = () => {
      save(); render();
      const b = $('.switch[data-id="notifications"]');
      if (b) b.focus();
    };
    if (S.notifications) { S.notifications = false; done(); settingsSaved(); return; }
    if (!('Notification' in window)) return;
    Notification.requestPermission().then((p) => {
      S.notifications = p === 'granted';
      done();
      if (p === 'granted') { settingsSaved(); checkAlerts(); }
      else toast('Notifications weren’t allowed, so they stay off');
    });
  }

  /* ======================================================================
     Alerts as notifications (while the app is open or installed)
     ====================================================================== */
  function notify(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const opts = { body: body, icon: 'favicon.svg', tag: title };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((r) => r.showNotification(title, opts));
    } else {
      try { new Notification(title, opts); } catch (e) { /* some browsers require the SW */ }
    }
  }

  function checkAlerts() {
    const S = state.settings;
    if (!state.onboarded || !S.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;
    const t = today();
    const due = [];
    state.subs.forEach((s) => {
      const d = nextCharge(s);
      if (!d) return;
      const days = daysBetween(t, d);
      if (s.status === 'trial' && S.trialAlerts && days >= 0 && days <= S.trialDays && !s.trialAck) {
        due.push({ key: 'trial:' + s.id + ':' + d, title: s.name + ' trial ends ' + fmtRel(d), body: 'Then ' + money(s.amount) + '. Cancel before ' + fmtDate(d) + ' if you don’t want it.' });
      } else if (s.status === 'active' && S.renewalAlerts && days >= 0 && days <= S.renewalDays) {
        due.push({ key: 'renew:' + s.id + ':' + d, title: s.name + ' renews ' + fmtRel(d), body: money(s.amount) + ' on ' + fmtDate(d) + '.' });
      }
      const pc = priceChange(s);
      if (pc && S.priceAlerts && !s.priceAck && s.status !== 'cancelled') {
        due.push({ key: 'price:' + s.id + ':' + pc.date, title: s.name + ' raised its price', body: money(pc.from) + ' to ' + money(pc.to) + '.' });
      }
    });
    due.forEach((a) => {
      if (state.notified[a.key]) return;
      notify(a.title, a.body);
      state.notified[a.key] = t;
    });
    save();
  }

  /* ======================================================================
     Events
     ====================================================================== */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el && !el.disabled) {
      e.preventDefault();
      const fn = ACTIONS[el.dataset.action];
      if (fn) fn(el.dataset.id, el, e);
      return;
    }
    const row = e.target.closest('tr[data-open]');
    if (row && !e.target.closest('a, button, input, select, label')) ACTIONS['open-sub'](row.dataset.open);

    const nav = $('#nav');
    if (nav.classList.contains('is-open') && !e.target.closest('#nav, #menu-btn')) setMenu(false);
  });

  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    const fn = FORMS[f.dataset.form];
    if (fn) fn(f);
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'search') { ui.search = t.value; ui.page = 1; refreshRows(); }
    else if (t.id === 'budget-input') onBudgetInput(t);
    else if (t.id === 'name-input') onNameInput(t);
    else if (t.id === 'onb-budget') {
      const v = parseMoney(t.value);
      const T = totals();
      $('#onb-status').innerHTML = onbStatus(T.projected, v);
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.filter) {
      ui[t.dataset.filter] = t.value;
      ui.page = 1;
      const val = $('[data-val="' + t.dataset.filter + '"]');
      if (val) val.textContent = t.options[t.selectedIndex].text;
      refreshRows();
    } else if (t.dataset.setting) {
      state.settings[t.dataset.setting] = isNaN(Number(t.value)) ? t.value : Number(t.value);
      save();
      const id = t.id;
      render();
      const again = $('#' + id);
      if (again) again.focus();
      settingsSaved();
    } else if (t.id === 'f-status') {
      $('#f-date-label').textContent = dateLabel(t.value);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if ($('#avatar-btn').getAttribute('aria-expanded') === 'true') { setUserMenu(false); $('#avatar-btn').focus(); return; }
      if ($('#overlay').innerHTML) closeOverlay();
      else if ($('#nav').classList.contains('is-open')) { setMenu(false); $('#menu-btn').focus(); }
      return;
    }
    /* Keep Tab inside an open dialog. */
    if (e.key === 'Tab' && $('#overlay').innerHTML) {
      const items = Array.from($('#overlay').querySelectorAll('button:not([disabled]), input, select, [href], [tabindex]:not([tabindex="-1"])'))
        .filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    /* Arrow keys between tabs. */
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.target.classList.contains('tab')) {
      const i = TABS.findIndex((x) => x.id === ui.tab);
      const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
      ACTIONS.tab(next.id);
    }
  });

  function setMenu(open) {
    $('#nav').classList.toggle('is-open', open);
    $('#menu-btn').setAttribute('aria-expanded', String(open));
  }
  $('#menu-btn').addEventListener('click', () => setMenu(!$('#nav').classList.contains('is-open')));
  /* The logo always goes to the overview; if already there, back to the top. */
  $('.brand').addEventListener('click', (e) => {
    if (state.onboarded && route() === 'overview' && !ui.connect) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
  $('#avatar-btn').addEventListener('click', (e) => { e.stopPropagation(); setUserMenu($('#avatar-btn').getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', (e) => { if (!e.target.closest('#user-menu')) setUserMenu(false); });
  $('#user-pop').addEventListener('click', (e) => { if (e.target.closest('a')) setUserMenu(false); });

  window.addEventListener('hashchange', () => {
    setMenu(false);
    closeOverlay();
    if (ui.connect && ui.connect.phase !== 'scan') ui.connect = null;
    render();
    window.scrollTo(0, 0);
    focusTitle();
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    ui.installEvent = e;
    if (state.onboarded && route() === 'settings') render();
  });

  window.addEventListener('pagehide', () => { if (pushTimer) pushNow(); });

  render();
  if (LIVE) bootLive();
  else checkAlerts();
})();
