(function () {
  'use strict';

  /* ==========================================================================
     Basics
     ========================================================================== */
  /* v1 uses 'warranty-tracker-v2' and v2 uses 'warranty-tracker-next' in this origin, so v3 keeps its own vault. */
  const KEY = 'warranty-tracker-v3';
  /* Accounts and the vault live in Supabase once config.js names a project. Without one,
     the app runs as the local demo it started as. */
  const CFG = window.WT_CONFIG || {};
  const cloud = CFG.supabaseUrl && CFG.supabaseKey && window.supabase
    ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { flowType: 'pkce' } })
    : null;
  const DAY = 86400000;
  const FREE_LIMIT = 10;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const view = $('#view');
  const overlay = $('#overlay');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function uid() { return Math.random().toString(36).slice(2, 10); }

  /* ==========================================================================
     Language: English is the source; i18n/*.js hold the other four. T() looks a text up
     by its English wording, TN() picks the plural form the language needs for a count
     (Slovenian has one for two, Croatian and Slovenian one for a few).
     ========================================================================== */
  const LANGS = { en: 'English', es: 'Español', fr: 'Français', sl: 'Slovenščina', hr: 'Hrvatski' };
  const LOCALES = { en: 'en-IE', es: 'es-ES', fr: 'fr-FR', sl: 'sl-SI', hr: 'hr-HR' };
  const DICT = window.WT_I18N || {};
  let lang = 'en';
  let pluralRules = new Intl.PluralRules('en');
  const fill = (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)) : s);
  function T(s, v) {
    const x = DICT[lang] && DICT[lang][s];
    return fill(typeof x === 'string' ? x : s, v);
  }
  function TN(s, n, v) {
    const x = (DICT[lang] && DICT[lang][s]) || (DICT.en && DICT.en[s]) || s;
    const form = typeof x === 'string' ? x : x[pluralRules.select(n)] || x.other;
    return fill(form, Object.assign({ n }, v));
  }
  function detectLang() {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (const l of list) { const k = String(l).slice(0, 2).toLowerCase(); if (LANGS[k]) return k; }
    return 'en';
  }
  /* "a, b and c" in the reader's language. */
  function andList(parts) {
    if (parts.length < 2) return parts.join('');
    try { return new Intl.ListFormat(LOCALES[lang], { type: 'conjunction' }).format(parts); } catch (e) { return parts.slice(0, -1).join(', ') + ' ' + T('and') + ' ' + parts[parts.length - 1]; }
  }

  const UNITS = {
    day: '{n} days', month: '{n} months', year: '{n} years', item: '{n} items', document: '{n} documents',
    'sample item': '{n} sample items', 'more item': '{n} more items', thing: '{n} things', warranty: '{n} warranties',
  };
  function plural(n, unit) { return TN(UNITS[unit], n); }

  /* ==========================================================================
     Dates: everything is a local calendar day, stored as YYYY-MM-DD
     ========================================================================== */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dateFmts = {};
  const pad = (n) => String(n).padStart(2, '0');

  function today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function addMonths(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
    x.setDate(Math.min(d.getDate(), last));
    return x;
  }
  function daysFrom(a, b) { return Math.round((b - a) / DAY); }

  function fmtDate(d, o) {
    d = typeof d === 'string' ? parse(d) : d;
    const withYear = !(o && o.short) || d.getFullYear() !== today().getFullYear();
    const weekday = !!(o && o.weekday);
    if (lang === 'en') {
      return (weekday ? WEEKDAYS[d.getDay()] + ' ' : '') + d.getDate() + ' ' + MONTHS[d.getMonth()] + (withYear ? ' ' + d.getFullYear() : '');
    }
    /* Other languages write dates their own way: "28. sep. 2026", "28 sept. 2026". */
    const k = lang + withYear + weekday;
    if (!dateFmts[k]) dateFmts[k] = new Intl.DateTimeFormat(LOCALES[lang], Object.assign({ day: 'numeric', month: 'short' }, withYear ? { year: 'numeric' } : {}, weekday ? { weekday: 'short' } : {}));
    return dateFmts[k].format(d);
  }

  /* 412 -> "1 year 1 month" (long) or "1 yr 1 mo" (short) */
  function span(days, short) {
    days = Math.abs(days);
    if (days === 0) return short ? plural(0, 'day') : T('less than a day');
    if (days < 45) return plural(days, 'day');
    let months = Math.round(days / 30.44);
    if (months < 12) return short ? months + ' ' + T('mo') : plural(months, 'month');
    const years = Math.floor(months / 12);
    months = months % 12;
    if (short) return years + ' ' + T('yr') + (months ? ' ' + months + ' ' + T('mo') : '');
    return plural(years, 'year') + (months ? ' ' + plural(months, 'month') : '');
  }

  function monthsLabel(m) { return m % 12 === 0 ? plural(m / 12, 'year') : plural(m, 'month'); }

  let moneyFmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
  let moneyWhole = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  function setLang(l) {
    lang = LANGS[l] ? l : detectLang();
    pluralRules = new Intl.PluralRules(lang);
    moneyFmt = new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency: 'EUR' });
    moneyWhole = new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    document.documentElement.lang = lang;
    const skip = document.querySelector('.skip');
    if (skip) skip.textContent = T('Skip to content');
  }
  function money(n) { n = Number(n) || 0; return Number.isInteger(n) ? moneyWhole.format(n) : moneyFmt.format(n); }

  /* ==========================================================================
     Reference data
     ========================================================================== */
  /* Labels are getters, so they read in whatever language is current. */
  const labelled = (list) => list.map((o) => Object.defineProperty(Object.assign({}, o), 'label', { get() { return T(o.label); } }));
  const CATS = labelled([
    { key: 'electronics', label: 'Electronics' },
    { key: 'computers', label: 'Computers & phones' },
    { key: 'appliances', label: 'Appliances' },
    { key: 'kitchen', label: 'Kitchen' },
    { key: 'tools', label: 'Tools' },
    { key: 'furniture', label: 'Furniture' },
    { key: 'sports', label: 'Sports' },
    { key: 'other', label: 'Other' },
  ]);
  const catLabel = (k) => (CATS.find((c) => c.key === k) || CATS[CATS.length - 1]).label;

  const REGIONS = {
    EU: { months: 24, get label() { return T('European Union'); }, get note() { return T('EU law gives you at least 2 years on new goods.'); } },
    UK: { months: 12, get label() { return T('United Kingdom'); }, get note() { return T('Most makers give 1 year. UK consumer law can cover faults for longer.'); } },
    US: { months: 12, get label() { return T('United States'); }, get note() { return T('US warranties vary by maker and shop. Most give 1 year.'); } },
  };

  const WARRANTY_OPTIONS = [6, 12, 18, 24, 36, 48, 60, 120];
  const RETURN_OPTIONS = [0, 14, 30, 60, 90];
  const FIELD_NAMES = {
    get name() { return T('Item name'); }, get merchant() { return T('Shop'); }, get price() { return T('Price'); },
    get purchased() { return T('Purchase date'); }, get orderNo() { return T('Order number'); }, get category() { return T('Category'); },
  };

  /* ==========================================================================
     Icons (16px outline, stroke 1.5)
     ========================================================================== */
  const ICONS = {
    home: '<path d="M2.5 7 8 2.5 13.5 7v6a.5.5 0 0 1-.5.5H10V10H6v3.5H3a.5.5 0 0 1-.5-.5Z"/>',
    bell: '<path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.5H3L4 11Z"/><path d="M6.5 14h3"/>',
    sliders: '<path d="M2.5 5h7M12.5 5h1M2.5 11h1M6.5 11h7"/><circle cx="11" cy="5" r="1.5"/><circle cx="5" cy="11" r="1.5"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    plusCircle: '<circle cx="8" cy="8" r="5.75"/><path d="M8 5.5v5M5.5 8h5"/>',
    search: '<circle cx="7" cy="7" r="4.25"/><path d="m10.2 10.2 3.3 3.3"/>',
    camera: '<path d="M2.5 5.5a1 1 0 0 1 1-1h2l1-1.5h3l1 1.5h2a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1Z"/><circle cx="8" cy="8.5" r="2.25"/>',
    upload: '<path d="M8 10.5V3M5 6l3-3 3 3M3 10.5v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2"/>',
    pencil: '<path d="m10.5 3 2.5 2.5-7 7H3.5V10Z"/>',
    trash: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"/>',
    download: '<path d="M8 3v7.5M5 7.5l3 3 3-3M3 13h10"/>',
    x: '<path d="m4 4 8 8M12 4l-8 8"/>',
    check: '<path d="m3.5 8.5 3 3 6-7"/>',
    checkCircle: '<circle cx="8" cy="8" r="5.75"/><path d="m5.5 8.2 1.7 1.7 3.3-3.6"/>',
    chevron: '<path d="m6 3.5 4.5 4.5L6 12.5"/>',
    chevronDown: '<path d="m3.5 6 4.5 4.5L12.5 6"/>',
    chevronLeft: '<path d="M10 3.5 5.5 8 10 12.5"/>',
    updown: '<path d="m5 6 3-3 3 3M5 10l3 3 3-3"/>',
    mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="m2.5 4.5 5.5 4 5.5-4"/>',
    lock: '<rect x="3" y="7" width="10" height="6.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>',
    eye: '<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/>',
    eyeOff: '<path d="M2 2l12 12"/><path d="M6.6 4.2A6 6 0 0 1 8 3.5C12 3.5 14.5 8 14.5 8a11 11 0 0 1-1.7 2.2M10.7 11.6A6 6 0 0 1 8 12.5C4 12.5 1.5 8 1.5 8a11 11 0 0 1 2.4-2.9"/>',
    alert: '<path d="M8 2.5 14 13H2Z"/><path d="M8 6.5v3M8 11.2v.1"/>',
    clock: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/>',
    return: '<path d="M5.5 6.5 3 9l2.5 2.5"/><path d="M3 9h7a3 3 0 0 0 0-6H8"/>',
    file: '<path d="M4 2.5h5l3 3v8H4Z"/><path d="M9 2.5v3h3"/>',
    receipt: '<path d="M3.5 2.5h9v11l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1Z"/><path d="M6 5.5h4M6 8h4"/>',
    user: '<circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5a5 5 0 0 1 10 0"/>',
    key: '<circle cx="5.5" cy="10.5" r="3"/><path d="m7.6 8.4 5.4-5.4M11 5l1.5 1.5"/>',
    shield: '<path d="M8 2 13 4v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4Z"/>',
    card: '<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2 6.5h12M4.5 10h2"/>',
    database: '<ellipse cx="8" cy="4" rx="5" ry="1.8"/><path d="M3 4v8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V4M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8"/>',
    logout: '<path d="M6 13.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H6M10.5 11 13.5 8l-3-3M13.5 8H6"/>',
    globe: '<circle cx="8" cy="8" r="5.75"/><path d="M2.25 8h11.5M8 2.25c1.6 1.6 2.4 3.5 2.4 5.75S9.6 12.15 8 13.75C6.4 12.15 5.6 10.25 5.6 8S6.4 3.85 8 2.25Z"/>',
    sparkle: '<path d="M8 2.5 9.3 6.7 13.5 8 9.3 9.3 8 13.5 6.7 9.3 2.5 8l4.2-1.3Z"/>',
  };
  /* Category icons: Lucide v1.47.0 (ISC licence, lucide.dev), one 24px grid and stroke for all eight. */
  const CAT_ICONS = {
    electronics: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />',
    computers: '<path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z" /><path d="M20.054 15.987H3.946" />',
    appliances: '<path d="M3 6h3" /><path d="M17 6h.01" /><rect width="18" height="20" x="3" y="2" rx="2" /><circle cx="12" cy="13" r="5" /><path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" />',
    kitchen: '<path d="M2 12h20" /><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" /><path d="m4 8 16-4" /><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />',
    tools: '<path d="M10 18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1z" /><path d="M13 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1l-.81 3.242a1 1 0 0 1-.97.758H8" /><path d="M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3" /><path d="M18 6h4" /><path d="m5 10-2 8" /><path d="m7 18 2-8" />',
    furniture: '<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" /><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" /><path d="M4 18v2" /><path d="M20 18v2" /><path d="M12 4v9" />',
    sports: '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z" /><path d="m2.5 21.5 1.4-1.4" /><path d="m20.1 3.9 1.4-1.4" /><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z" /><path d="m9.6 14.4 4.8-4.8" />',
    other: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><polyline points="3.29 7 12 12 20.71 7" /><path d="m7.5 4.27 9 5.15" />',
  };
  function icon(name, size) {
    const s = size || 16;
    if (CAT_ICONS[name]) return '<svg class="i i-cat" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-hidden="true">' + CAT_ICONS[name] + '</svg>';
    return '<svg class="i" width="' + s + '" height="' + s + '" viewBox="0 0 16 16" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  /* The app icon: a receipt with a check, on a rounded square. */
  function logo(size) {
    const s = size || 28;
    return '<svg class="logo" width="' + s + '" height="' + s + '" viewBox="0 0 32 32" aria-hidden="true">' +
      '<rect class="logo-tile" width="32" height="32" rx="7" />' +
      '<rect class="logo-tool" x="2.75" y="2.75" width="26.5" height="26.5" rx="5" />' +
      '<path class="logo-mark" d="M11 8.5h10v15l-1.7-1.1-1.6 1.1-1.7-1.1-1.7 1.1-1.6-1.1-1.7 1.1Z" />' +
      '<path class="logo-mark" d="m13.3 15.6 1.9 1.9 3.6-3.9" /></svg>';
  }

  /* ==========================================================================
     Sample receipts: dates are offsets from today so the demo never goes stale
     ========================================================================== */
  function sampleItems() {
    const t = today();
    const d = (n) => iso(addDays(t, n));
    const m = (months, days) => iso(addDays(addMonths(t, months), days));
    return [
      { id: 's1', name: 'Philips Airfryer XXL', merchant: 'Amazon.de', category: 'kitchen', price: 219.99, purchased: d(-28), orderNo: '302-4418823-1190755', returnDays: 30, fileName: 'amazon-order-302-4418823.pdf' },
      { id: 's2', name: T('Makita DHP485 cordless drill'), merchant: 'Bauhaus', category: 'tools', price: 189, purchased: d(-5), orderNo: 'BH-88120457', returnDays: 14, fileName: 'bauhaus-rechnung.pdf',
        review: { orderNo: T('The order number was split over two lines on the receipt. Check it matches.') } },
      { id: 's3', name: T('Sony WH-1000XM6 headphones'), merchant: 'MediaMarkt', category: 'electronics', price: 399, purchased: d(-12), orderNo: 'MM-1180-99231', returnDays: 30, fileName: 'mediamarkt-kassenbon.jpg' },
      { id: 's4', name: T('Bosch Serie 6 washing machine'), merchant: 'Big Bang', category: 'appliances', price: 649, purchased: m(-24, 25), orderNo: '2024-118204', returnDays: 14, fileName: 'racun-2024-118204.pdf' },
      { id: 's5', name: 'Garmin Forerunner 265', merchant: 'Garmin', category: 'sports', price: 349.99, purchased: m(-24, 45), orderNo: 'GA-5521047', returnDays: 30, fileName: 'garmin-invoice.pdf',
        review: { price: T('The receipt shows €359.98 including €9.99 delivery. We saved the item price.') } },
      { id: 's6', name: 'MacBook Air 13" M4', merchant: 'Apple', category: 'computers', price: 1299, purchased: d(-330), orderNo: 'W1829340112', returnDays: 14, fileName: 'apple-receipt.pdf' },
      { id: 's7', name: T('IKEA KIVIK 3-seat sofa'), merchant: 'IKEA', category: 'furniture', price: 899, purchased: d(-400), orderNo: '1284470331', returnDays: 90, warrantyMonths: 120,
        warrantyNote: T('IKEA’s 10-year guarantee'), fileName: 'ikea-order.pdf' },
      { id: 's8', name: 'De’Longhi Magnifica Evo', merchant: 'Amazon.de', category: 'kitchen', price: 449, purchased: d(-430), orderNo: '028-1147756-6612354', returnDays: 30, fileName: 'amazon-order-028-1147756.pdf' },
      { id: 's9', name: 'Dyson V15 Detect', merchant: 'Dyson', category: 'appliances', price: 699, purchased: m(-24, -31), orderNo: 'DY-20931175', returnDays: 30, fileName: 'dyson-order.pdf' },
    ].map((it) => Object.assign(it, { source: 'upload', added: it.purchased }));
  }

  /* ==========================================================================
     State
     ========================================================================== */
  function defaultDefaults(region) {
    const out = {};
    CATS.forEach((c) => { out[c.key] = REGIONS[region].months; });
    return out;
  }

  function defaultSettings() {
    return {
      region: 'EU',
      defaults: defaultDefaults('EU'),
      returnDays: 30,
      remind: { w30: true, w7: true, r2: true },
      device: false,
      emailCopy: true,
      theme: 'system',
      lang: null,
    };
  }

  function defaultState() {
    return {
      account: null, session: false, banner: false, plan: 'free', items: [], settings: defaultSettings(),
      /* Cloud only: whose vault this is, and what Supabase last accepted, so only changes go up. */
      uid: null, synced: {}, syncedProfile: '',
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const s = JSON.parse(raw);
      const base = defaultState();
      return Object.assign(base, s, { settings: Object.assign(base.settings, s.settings || {}) });
    } catch (e) {
      return defaultState();
    }
  }

  let state = load();
  setLang(state.settings.lang);
  function writeLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); ui.saveWarned = false; } catch (e) {
      /* Storage full or blocked: keep going in memory, but say so once. */
      if (!ui.saveWarned && !cloud) { ui.saveWarned = true; setTimeout(() => toast(T('This browser’s storage is full. Changes won’t be kept after you close the tab.')), 0); }
    }
  }
  function save() {
    writeLocal();
    if (cloud && state.session) queueSync();
  }

  /* Things that only live for this session. */
  const ui = {
    q: '', cat: 'all', merchant: 'all', showAll: false, status: 'all',
    add: null, editing: null, base: null, drawerId: null,
  };

  /* ==========================================================================
     Cloud: Supabase keeps the truth, this browser keeps a copy for speed and offline
     ========================================================================== */
  const sync = { timer: 0, running: null, again: false, failed: false };

  function appUrl() { return location.origin + location.pathname; }
  function accountFrom(user) {
    const m = user.user_metadata || {};
    return { first: m.first || '', last: m.last || '', email: user.email };
  }
  function profileRow(s) { return { id: s.uid, settings: s.settings, plan: s.plan, banner: s.banner }; }

  function queueSync() {
    clearTimeout(sync.timer);
    sync.timer = setTimeout(pushNow, 600);
  }

  /* Send only what changed since Supabase last accepted it: new or edited items, removed items, settings. */
  function pushNow() {
    if (!cloud || !state.session || !state.uid) return Promise.resolve();
    if (sync.running) { sync.again = true; return sync.running; }
    clearTimeout(sync.timer);
    const s = state;
    sync.running = (async () => {
      const now = {};
      const rows = [];
      s.items.forEach((it) => {
        const j = JSON.stringify(it);
        now[it.id] = j;
        if (s.synced[it.id] !== j) rows.push({ user_id: s.uid, id: it.id, data: it });
      });
      const gone = Object.keys(s.synced).filter((id) => !(id in now));
      const prof = JSON.stringify(profileRow(s));
      try {
        if (rows.length) {
          const { error } = await cloud.from('items').upsert(rows);
          if (error) throw error;
          rows.forEach((r) => { s.synced[r.id] = now[r.id]; });
        }
        if (gone.length) {
          const { error } = await cloud.from('items').delete().eq('user_id', s.uid).in('id', gone);
          if (error) throw error;
          gone.forEach((id) => { delete s.synced[id]; });
        }
        if (prof !== s.syncedProfile) {
          const { error } = await cloud.from('profiles').upsert(JSON.parse(prof));
          if (error) throw error;
          s.syncedProfile = prof;
        }
        sync.failed = false;
      } catch (e) {
        if (!sync.failed && s === state) { sync.failed = true; toast(T('Couldn’t save to your account. Your changes are kept here and we’ll keep trying.')); }
        sync.timer = setTimeout(pushNow, 15000);
      }
      if (s === state) writeLocal();
    })().finally(() => {
      sync.running = null;
      if (sync.again) { sync.again = false; pushNow(); }
    });
    return sync.running;
  }

  /* Replace this browser's copy with what's in Supabase. */
  async function pull() {
    const s = state;
    const [p, list] = await Promise.all([
      cloud.from('profiles').select('settings, plan, banner').eq('id', s.uid).maybeSingle(),
      cloud.from('items').select('id, data').eq('user_id', s.uid).order('created_at'),
    ]);
    if (p.error || list.error || s !== state) return false;
    if (p.data) {
      const base = defaultSettings();
      s.settings = Object.assign(base, p.data.settings || {});
      s.plan = p.data.plan || 'free';
      s.banner = !!p.data.banner;
      s.syncedProfile = JSON.stringify(profileRow(s));
    }
    s.items = list.data.map((r) => r.data);
    s.synced = {};
    s.items.forEach((it) => { s.synced[it.id] = JSON.stringify(it); });
    writeLocal();
    applyTheme();
    setLang(s.settings.lang);
    return true;
  }

  /* Signed in: load that person's vault. Unsent changes from last time go up first. */
  async function enter(user) {
    const same = state.uid === user.id;
    if (!same) {
      const theme = state.settings.theme, chosen = state.settings.lang;
      state = defaultState();
      state.settings.theme = theme;
      state.settings.lang = chosen;
      state.uid = user.id;
    }
    state.account = accountFrom(user);
    state.session = true;
    writeLocal();
    if (same) await pushNow();
    await pull();
    /* A new account has no profile row yet: create it. */
    if (!state.syncedProfile) queueSync();
  }

  /* Signed out: forget the vault on this device, remember only the email for next time. */
  function leave() {
    clearTimeout(sync.timer);
    const theme = state.settings.theme, chosen = state.settings.lang;
    const email = state.account ? state.account.email : '';
    state = defaultState();
    state.settings.theme = theme;
    state.settings.lang = chosen;
    if (email) state.account = { first: '', last: '', email };
    writeLocal();
  }

  async function bootCloud() {
    cloud.auth.onAuthStateChange((event, session) => {
      /* Supabase calls can't run inside this callback, so anything async waits a tick. */
      if (event === 'PASSWORD_RECOVERY') { ui.recovery = true; setTimeout(() => { if (state.session) go('reset'); }, 0); }
      /* Signed out elsewhere, or the session ran out. Our own log out has already tidied up. */
      if (event === 'SIGNED_OUT') setTimeout(() => { if (!state.session) return; leave(); closeDrawer(); redirect('login'); }, 0);
      if (event === 'USER_UPDATED' && session && state.session) {
        state.account = accountFrom(session.user);
        writeLocal();
      }
    });
    const { data, error } = await cloud.auth.getSession();
    const q = new URLSearchParams(location.search);
    const failed = q.get('error_description');
    const returning = q.has('code');
    if (returning || failed) history.replaceState(null, '', location.pathname + location.hash);
    if (failed) toast(esc(failed) + '.');
    if (data && data.session) {
      await enter(data.session.user);
      if (ui.recovery) return redirect('reset');
      if (returning) toast(T('You’re signed in. Welcome, {name}.', { name: esc(state.account.first) }));
      render();
    } else if (!error && state.session) {
      leave();
      render();
    }
  }

  function busy(form, on) {
    const b = $('[type="submit"]', form);
    if (b) { b.disabled = on; b.setAttribute('aria-busy', String(on)); }
  }
  function cloudMessage(error) {
    if (!navigator.onLine) return T('You’re offline. Connect to the internet and try again.');
    if (error && error.status === 429) return T('Too many tries. Wait a minute, then try again.');
    return T('Something went wrong. Try again in a moment.');
  }

  /* Passwords never sit in storage as typed. It's still a demo: all of this lives in the browser. */
  async function hashPassword(pw) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('warranty-tracker:' + pw));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return 'fallback:' + btoa(unescape(encodeURIComponent(pw)));
    }
  }

  /* ==========================================================================
     Theme
     ========================================================================== */
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    const t = state.settings.theme;
    const dark = t === 'dark' || (t === 'system' && darkQuery.matches);
    document.documentElement.classList.toggle('dark', dark);
    $$('meta[name="theme-color"]').forEach((m) => { m.setAttribute('content', dark ? '#111216' : '#fcfcfc'); m.removeAttribute('media'); });
  }
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', applyTheme);

  /* ==========================================================================
     Derived values
     ========================================================================== */
  function warrantyMonths(it) { return it.warrantyMonths || state.settings.defaults[it.category] || REGIONS[state.settings.region].months; }
  function returnDays(it) { return it.returnDays == null ? state.settings.returnDays : it.returnDays; }

  function info(it) {
    const t = today();
    const bought = parse(it.purchased);
    const months = warrantyMonths(it);
    const end = addMonths(bought, months);
    const rDays = returnDays(it);
    const rEnd = addDays(bought, rDays);
    const left = daysFrom(t, end);
    const rLeft = daysFrom(t, rEnd);
    return {
      bought, end, months, rDays, rEnd, left, rLeft,
      total: daysFrom(bought, end),
      status: left < 0 ? 'expired' : left <= 60 ? 'expiring' : 'active',
      returnOpen: rDays > 0 && rLeft >= 0,
    };
  }

  function statusText(i, short) {
    if (i.status === 'expired') return T('Expired {time} ago', { time: span(i.left, short) });
    if (i.status === 'expiring') return i.left === 0 ? T('Ends today') : T('Ends in {time}', { time: plural(i.left, 'day') });
    return T('{time} left', { time: span(i.left, short) });
  }

  function remindersFor(it) {
    const i = info(it);
    const r = state.settings.remind;
    const out = [];
    if (r.w30) out.push({ kind: 'w30', date: addDays(i.end, -30) });
    if (r.w7) out.push({ kind: 'w7', date: addDays(i.end, -7) });
    if (r.r2 && i.rDays > 0) out.push({ kind: 'r2', date: addDays(i.rEnd, -2) });
    return out.map((x) => Object.assign(x, { item: it, info: i }));
  }

  function findItem(id) { return state.items.find((x) => x.id === id); }
  function initials() {
    const a = state.account;
    if (!a) return '';
    return ((a.first || '')[0] || '').toUpperCase() + ((a.last || '')[0] || '').toUpperCase();
  }

  /* ==========================================================================
     Small components
     ========================================================================== */
  function btn(label, action, o) {
    o = o || {};
    const attrs = Object.keys(o.data || {}).map((k) => ' data-' + k + '="' + esc(o.data[k]) + '"').join('');
    return '<button type="' + (o.type || 'button') + '" class="btn btn-' + (o.kind || 'gray') + (o.cls ? ' ' + o.cls : '') + '"' +
      (action ? ' data-action="' + action + '"' : '') + attrs + (o.disabled ? ' disabled' : '') + (o.id ? ' id="' + o.id + '"' : '') + '>' +
      (o.icon ? icon(o.icon) : '') + '<span>' + label + '</span></button>';
  }

  /* Every category owns one color, the way Health gives each kind of data its own. */
  function catIcon(key) { return '<span class="cat-ic cat-' + esc(key) + '" aria-hidden="true">' + icon(key) + '</span>'; }

  function field(o) {
    const id = 'f-' + o.name;
    const flag = o.flag ? '<span class="pill pill-warning">' + icon('alert', 12) + T('Check this') + '</span>' : '';
    let control;
    if (o.type === 'select') {
      control = '<div class="select"><select id="' + id + '" name="' + o.name + '">' +
        o.options.map((op) => '<option value="' + esc(op.value) + '"' + (String(op.value) === String(o.value) ? ' selected' : '') + '>' + esc(op.label) + '</option>').join('') +
        '</select>' + icon('updown', 14) + '</div>';
    } else if (o.type === 'textarea') {
      control = '<textarea class="input" id="' + id + '" name="' + o.name + '" rows="3" placeholder="' + esc(o.placeholder || '') + '">' + esc(o.value) + '</textarea>';
    } else if (o.type === 'password') {
      control = '<div class="input-wrap"><input class="input" id="' + id + '" name="' + o.name + '" type="password" value=""' + (o.attrs || '') + ' />' +
        '<button type="button" class="input-icon" data-action="toggle-pw" data-for="' + id + '" aria-label="' + T('Show password') + '" aria-pressed="false">' + icon('eyeOff') + '</button></div>';
    } else {
      control = '<input class="input" id="' + id + '" name="' + o.name + '" type="' + (o.type || 'text') + '" value="' + esc(o.value) + '"' +
        (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + (o.attrs || '') + ' />';
    }
    return '<div class="field' + (o.flag ? ' is-flagged' : '') + (o.wide ? ' field-wide' : '') + '">' +
      '<div class="label-row"><label for="' + id + '">' + o.label + '</label>' + flag + (o.aside || '') + '</div>' + control +
      (o.hint ? '<p class="hint">' + o.hint + '</p>' : '') +
      '<p class="field-error" id="' + id + '-error" hidden></p>' +
      '</div>';
  }

  function toggle(key, on, label, desc) {
    return '<label class="switch-row">' +
      '<span class="switch-text"><span class="switch-label">' + label + '</span>' + (desc ? '<span class="switch-desc">' + desc + '</span>' : '') + '</span>' +
      '<span class="switch"><input type="checkbox" role="switch" data-toggle="' + key + '"' + (on ? ' checked' : '') + ' /><span></span></span>' +
      '</label>';
  }

  function showError(inputId, msg) {
    const el = document.getElementById(inputId + '-error');
    const input = document.getElementById(inputId);
    if (el) { el.innerHTML = msg || ''; el.hidden = !msg; }
    if (input) {
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) { input.setAttribute('aria-describedby', inputId + '-error'); input.focus(); }
    }
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  /* ==========================================================================
     Router
     ========================================================================== */
  const PUBLIC = ['welcome', 'signup', 'login', 'forgot'];
  /* Pages drawn without the app chrome. 'reset' is reached from the email link, already signed in. */
  const BARE = PUBLIC.concat('reset');

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    return { name: parts[0] || '', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }
  function go(path) { location.hash = '#/' + path; }
  function redirect(path) { history.replaceState(null, '', '#/' + path); render(); }

  function render() {
    const r = route();
    if (r.name === 'home' || r.name === 'reminders') return redirect('vault');
    if (!state.session) {
      if (r.name === 'reset') return redirect('forgot');
      if (!PUBLIC.includes(r.name)) return redirect(state.account ? 'login' : 'welcome');
    } else if (!r.name || PUBLIC.includes(r.name)) {
      return redirect('vault');
    }

    if (r.name === 'item') {
      if (!findItem(r.arg)) return redirect('vault');
      if (ui.base !== 'vault') paint('vault');
      openDrawer(r.arg);
      return;
    }
    const back = closeDrawer();
    const keep = back !== undefined && r.name === 'vault' && ui.base === 'vault';
    paint(r.name, r.arg, keep);
    if (keep && back) { const row = $('a[href="' + back + '"]', view); if (row) row.focus({ preventScroll: true }); }
  }

  const VIEWS = {
    welcome: viewWelcome, signup: viewSignup, login: viewLogin, forgot: viewForgot, reset: viewReset,
    vault: viewVault, add: viewAdd, settings: viewSettings,
  };

  /* keep: repaint in place (after closing the drawer), without jumping to the top. */
  function paint(name, arg, keep) {
    const fn = VIEWS[name] || viewVault;
    const y = window.scrollY;
    const out = fn(arg);
    const app = !BARE.includes(name);
    ui.base = name;
    ui.arg = arg;
    document.body.classList.toggle('is-app', app);
    $('#topbar').hidden = !app;
    $('#tabbar').hidden = true;
    view.className = 'main ' + (app ? 'main-app main-' + name : 'main-public');
    if (app) renderChrome(name, arg); else $('#banner').innerHTML = '';
    view.innerHTML = out.html;
    window.scrollTo(0, keep ? y : 0);
    navTone();
    if (out.after) out.after();
    if (ui.refocusSearch) {
      ui.refocusSearch = false;
      const q = visibleSearchInput();
      if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
      return;
    }
    if (keep) return;
    /* Move focus to the heading, unless the view already put it in a field. */
    const active = document.activeElement;
    const inField = active && view.contains(active) && active.matches('input, select, textarea');
    const h1 = $('h1', view);
    if (h1 && !inField) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }

  /* ==========================================================================
     App chrome: one top bar. The vault is the home page, so there's nothing to navigate
     between: the bar holds search, the one primary action, and the account menu.
     ========================================================================== */

  /* One search field, rendered wherever it's needed; a shared class keeps them in sync. */
  function searchField(id, cls) {
    return '<label class="search' + (cls ? ' ' + cls : '') + (ui.q ? ' is-filled' : '') + '"><span class="sr-only">' + T('Search receipts') + '</span>' + icon('search') +
      '<input type="search" class="search-input" id="' + id + '" value="' + esc(ui.q) + '"' + (cls ? ' placeholder="' + T('Search') + '"' : '') + ' autocomplete="off" spellcheck="false" />' +
      '<kbd>' + (isMac ? '⌘' : 'Ctrl&nbsp;') + 'K</kbd></label>';
  }
  function visibleSearchInput() {
    return $$('.search-input').find((el) => el.offsetParent !== null) || $('.search-input');
  }

  /* The nav is white while it floats over the green greeting, and turns the band's green
     once it's past it (or on pages without one). */
  function navTone() {
    const bar = $('#topbar');
    if (bar.hidden) return;
    const band = $('.greet', view);
    const past = !band || band.getBoundingClientRect().bottom <= bar.getBoundingClientRect().bottom;
    bar.classList.toggle('is-solid', past);
  }
  let navFrame = 0;
  window.addEventListener('scroll', () => {
    if (navFrame) return;
    navFrame = requestAnimationFrame(() => { navFrame = 0; navTone(); });
  }, { passive: true });
  window.addEventListener('resize', navTone);

  function renderChrome(name) {
    $('#topbar').innerHTML = '<div class="container topbar-inner">' +
      '<a class="brand" href="#/vault" aria-label="' + T('Warranty tracker, home') + '">' + logo(30) + '<span>' + T('Warranty tracker') + '</span></a>' +
      '<div class="topbar-end">' + navLang() +
        (name === 'add' ? '' : (name === 'vault' ? '' : searchField('q')) + '<a class="btn btn-primary topbar-add" href="#/add" aria-label="' + T('Add new warranty') + '">' + icon('plus') + '<span>' + T('Add new warranty') + '</span></a>') +
        '<div class="menu-wrap">' +
          '<button type="button" class="avatar" data-action="user-menu" aria-haspopup="menu" aria-expanded="false" aria-label="' + T('Account menu') + '">' + esc(initials()) + '</button>' +
        '</div>' +
      '</div></div>';

    $('#banner').innerHTML = state.banner
      ? '<div class="banner" role="status">' + icon('checkCircle') +
        '<p><b>' + T('Your vault is ready.') + '</b> ' + T('Add your first receipt, or explore with sample items.') + '</p>' +
        '<button type="button" class="icon-btn" data-action="dismiss-banner" aria-label="' + T('Dismiss') + '">' + icon('x') + '</button></div>'
      : '';
  }

  function openUserMenu(b) {
    if ($('.user-pop')) return closeUserMenu();
    const a = state.account;
    const pop = document.createElement('div');
    pop.className = 'user-pop';
    pop.setAttribute('role', 'menu');
    pop.innerHTML =
      '<div class="user-head"><b>' + esc((a.first + ' ' + a.last).trim()) + '</b><span>' + esc(a.email) + '</span></div>' +
      '<a role="menuitem" href="#/settings/profile">' + icon('user') + T('Profile') + '</a>' +
      '<a role="menuitem" href="#/settings/rules">' + icon('sliders') + T('Settings') + '</a>' +
      '<span class="menu-sep"></span>' +
      '<button type="button" role="menuitem" data-action="logout">' + icon('logout') + T('Log out') + '</button>';
    b.parentElement.appendChild(pop);
    b.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => pop.classList.add('is-open'));
    $('[role="menuitem"]', pop).focus();
  }
  function closeUserMenu(focusBack) {
    const pop = $('.user-pop');
    if (!pop) return;
    const b = $('.avatar', pop.parentElement);
    pop.remove();
    $$('.avatar').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    if (focusBack && b) b.focus();
  }

  /* ==========================================================================
     Public pages: landing, sign up, log in, reset password
     ========================================================================== */
  function publicNav(active) {
    return '<header class="pub-nav"><a class="brand" href="#/welcome">' + logo(28) + '<span>' + T('Warranty tracker') + '</span></a>' +
      '<div class="pub-actions">' + langPicker('pub-lang', true) +
        (active !== 'login' ? '<a class="btn btn-plain" href="#/login">' + T('Log in') + '</a>' : '') +
        (active !== 'signup' ? '<a class="btn btn-primary" href="#/signup">' + T('Get started') + '</a>' : '') +
      '</div></header>';
  }

  /* In the app bar: a globe and the current code, with the full list a tap away. The select
     lies invisibly over the chip, so the menu is the device's own. */
  function navLang() {
    return '<label class="nav-lang" title="' + T('Language') + '">' + icon('globe') + '<span aria-hidden="true">' + lang.toUpperCase() + '</span>' +
      '<select id="nav-lang" data-lang-pick aria-label="' + T('Language') + '">' + Object.keys(LANGS).map((k) =>
        '<option value="' + k + '" lang="' + k + '"' + (k === lang ? ' selected' : '') + '>' + LANGS[k] + '</option>').join('') +
      '</select></label>';
  }

  /* Every language names itself, so anyone can find theirs. */
  function langPicker(id, small) {
    return '<div class="select' + (small ? ' select-sm lang-pick' : '') + '"><label class="sr-only" for="' + id + '">' + T('Language') + '</label>' +
      '<select id="' + id + '" data-lang-pick>' + Object.keys(LANGS).map((k) =>
        '<option value="' + k + '" lang="' + k + '"' + (k === lang ? ' selected' : '') + '>' + LANGS[k] + '</option>').join('') +
      '</select>' + icon(small ? 'chevronDown' : 'updown', small ? 12 : 14) + '</div>';
  }

  /* 412 days -> 1 yr 1 mo. Big numbers with small units, the way Health writes "7 hr 32 min". */
  function readingParts(days) {
    days = Math.abs(days);
    if (days < 60) return [[days, TN('days', days)]];
    const m = Math.round(days / 30.44), y = Math.floor(m / 12), mo = m % 12;
    return [y && [y, T('yr')], mo && [mo, T('mo')]].filter(Boolean);
  }
  function readingText(days) { return readingParts(days).map((p) => p[0] + ' ' + p[1]).join(' '); }

  /* The one reading an item leads with: what it's called, and how much time is on it. */
  function statusOf(i, returnFirst) {
    if (i.returnOpen && returnFirst) {
      return i.rLeft === 0
        ? { label: T('Return closes'), parts: null, tone: 'info' }
        : { label: T('Left to return'), parts: readingParts(i.rLeft), tone: 'info' };
    }
    if (i.status === 'expired') {
      /* "2 yr ago", or "hace 2 años": some languages put the word first. */
      const ago = T('ago') ? [['', T('ago')]] : [];
      return { label: T('Warranty expired'), parts: DICT[lang] && DICT[lang]._agoFirst ? ago.concat(readingParts(i.left)) : readingParts(i.left).concat(ago), tone: 'weak' };
    }
    if (i.left === 0) return { label: T('Warranty ends'), parts: null, tone: 'warning' };
    return { label: T('Warranty left'), parts: readingParts(i.left), tone: i.status === 'expiring' ? 'warning' : null };
  }

  function reading(st, cls) {
    const value = st.parts
      ? st.parts.map((p) => (p[0] !== '' ? '<b class="num">' + p[0] + '</b> ' : '') + '<span>' + p[1] + '</span>').join(' ')
      : '<b>' + T('Today') + '</b>';
    return '<p class="value ' + (cls || '') + (st.tone ? ' tone-' + st.tone : '') + '">' + value + '</p>';
  }

  /* An item as a Wallet pass: category, shop, name, and the three facts a claim needs. */
  function passCard(it, i, o) {
    o = o || {};
    const f = (label, value) => '<div class="pass-field"><span>' + label + '</span><b class="num">' + value + '</b></div>';
    const title = o.titleId
      ? '<h2 id="' + o.titleId + '" class="pass-title">' + esc(it.name) + '</h2>'
      : '<p class="pass-title">' + esc(it.name) + '</p>';
    return '<div class="pass cat-' + esc(it.category) + (o.cls ? ' ' + o.cls : '') + '">' +
      title +
      '<p class="pass-cat cat-' + esc(it.category) + '">' + icon(it.category, 14) + '<span>' + catLabel(it.category) + ', ' + esc(it.merchant) + '</span></p>' +
      (o.sub ? '<p class="pass-sub">' + o.sub + '</p>' : '') +
      (o.fields === false ? '' :
        '<div class="pass-fields">' +
          f(T('Bought'), fmtDate(it.purchased)) +
          f(T('Paid'), money(it.price)) +
          f(i.status === 'expired' ? T('Warranty expired') : T('Covered until'), fmtDate(i.end)) +
        '</div>') +
      (o.foot || '') +
    '</div>';
  }

  /* A span of time as a capsule meter: how much of it has already gone. */
  function meter(i, useReturn) {
    const total = useReturn ? i.rDays : i.total;
    const gone = Math.max(0, Math.min(total, daysFrom(i.bought, today())));
    const pct = total > 0 ? Number((gone / total * 100).toFixed(2)) : 100;
    const tone = useReturn ? 'return' : i.status;
    return '<span class="meter meter-' + tone + '" title="' + T('{left} of {total} days left', { left: (total - gone).toLocaleString(LOCALES[lang]), total: total.toLocaleString(LOCALES[lang]) }) + '">' +
      '<span class="meter-gone" style="width:' + pct + '%"></span>' +
      '<span class="meter-left" style="left:' + pct + '%"></span>' +
      (pct > 0 && pct < 100 ? '<span class="meter-today" style="left:' + pct + '%"></span>' : '') +
    '</span>';
  }

  /* What the meter above it measures, in words. */
  function spanCaption(i, useReturn) {
    if (useReturn) return T('{time} to return it, until {date}', { time: plural(i.rDays, 'day'), date: fmtDate(i.rEnd, { short: true, weekday: true }) });
    return T(i.status === 'expired' ? '{time} warranty, expired {date}' : '{time} warranty, until {date}', { time: monthsLabel(i.months), date: fmtDate(i.end) });
  }

  /* Three of the sample receipts, fanned like passes in a wallet. Dates stay relative to today. */
  function heroPasses() {
    /* The vault itself, filled with the sample receipts: the product is the picture. */
    const list = sampleItems().map((it) => { const i = info(it); return { it, i, next: cardMeta(it, i) }; })
      .sort((a, b) => a.next.urgency - b.next.urgency).slice(0, 5);
    return '<div class="ledger">' + list.map(({ it, i, next }, n) => wrow(it, i, next, n)).join('') + '</div>';
  }

  function viewWelcome() {
    const steps = [
      ['Keep the receipt', 'Take a photo or upload the PDF. We read the shop, item, price and date.'],
      ['Hear about it in time', '30 and 7 days before a warranty ends, 2 days before a return window closes.'],
      ['Claim with proof', 'The original receipt stays with each item. Export a claim summary when you need it.'],
    ].map((s) => s.map((x) => T(x)));
    return {
      html: publicNav() +
        '<section class="hero">' +
          '<div class="hero-copy">' +
            '<h1 class="hero-title">' + T('Every receipt kept. Every warranty remembered.') + '</h1>' +
            '<p class="hero-sub">' + T('Snap a receipt and we’ll note the warranty and return window, then remind you before either runs out.') + '</p>' +
            '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/signup">' + T('Get started') + '</a>' +
            '<a class="btn btn-secondary btn-lg" href="#/login">' + T('Log in') + '</a></div>' +
            '<p class="hero-note">' + T('EU law gives you at least 2 years on new goods. We count every day of it.') + '</p>' +
          '</div>' +
          '<figure class="hero-shot" aria-hidden="true" inert>' +
            '<p class="shot-head"><b>' + T('Vault') + '</b><span>' + T('Sample receipts, dated from today') + '</span></p>' +
            heroPasses() +
          '</figure>' +
        '</section>' +
        '<section class="steps" aria-labelledby="steps-title">' +
          '<h2 id="steps-title" class="steps-title">' + T('From the till to the claim') + '</h2>' +
          '<ol class="steps-list">' + steps.map((s, n) =>
            '<li><span class="step-n num">' + (n + 1) + '</span><h3>' + s[0] + '</h3><p>' + s[1] + '</p></li>').join('') + '</ol>' +
        '</section>',
    };
  }

  function authShell(o) {
    return publicNav(o.active) +
      '<div class="auth' + (o.preview ? ' auth-split' : '') + '">' +
        '<section class="auth-col">' +
          '<div class="auth-logo">' + logo(64) + '</div>' +
          '<h1 class="auth-title">' + o.title + '</h1>' +
          '<p class="auth-sub">' + o.sub + '</p>' +
          o.body +
        '</section>' +
        (o.preview ? '<aside class="auth-preview" aria-hidden="true">' + o.preview + '</aside>' : '') +
      '</div>';
  }

  /* Sign-up preview: the vault being made, with the name filled in as you type. */
  function skeletonPreview() {
    const list = sampleItems().map((it) => { const i = info(it); return { it, i, next: cardMeta(it, i) }; })
      .sort((a, b) => a.next.urgency - b.next.urgency).slice(0, 3);
    return '<figure class="su-preview" inert>' +
      '<p class="su-who"><span class="avatar avatar-sm" id="pv-initials">A</span><b id="pv-name">' + T('Your vault') + '</b></p>' +
      '<p class="su-hello">' + T('Hello, {name}', { name: '<span id="pv-hello">' + T('there') + '</span>' }) + '</p>' +
      '<p class="su-sub">' + T('This is how your receipts will look, most urgent first.') + '</p>' +
      '<div class="ledger">' + list.map(({ it, i, next }, n) => wrow(it, i, next, n)).join('') + '</div>' +
    '</figure>';
  }

  function viewSignup() {
    return {
      html: authShell({
        active: 'signup',
        title: T('Get started with Warranty tracker'),
        sub: T('Create an account to keep your receipts in one place'),
        preview: skeletonPreview(),
        body:
          '<form class="form auth-form" id="signup-form" novalidate>' +
            '<div class="form-row">' +
              field({ name: 'first', label: T('First name'), value: '', attrs: ' autocomplete="given-name"' }) +
              field({ name: 'last', label: T('Last name'), value: '', attrs: ' autocomplete="family-name"' }) +
            '</div>' +
            field({ name: 'email', label: T('Email'), type: 'email', value: '', placeholder: T('you@example.com'), attrs: ' autocomplete="email" spellcheck="false"' }) +
            '<p class="inline-ok" id="email-ok" hidden>' + icon('checkCircle') + '<span></span></p>' +
            field({ name: 'password', label: T('Password'), type: 'password', attrs: ' autocomplete="new-password"', hint: T('At least 8 characters.') }) +
            btn(T('Create account'), null, { kind: 'primary', type: 'submit', cls: 'btn-block btn-lg' }) +
          '</form>' +
          '<p class="auth-foot">' + T('By signing up, you agree to the {terms} and {privacy}.', { terms: '<a href="#/signup" class="link-muted">' + T('Terms of Service') + '</a>', privacy: '<a href="#/signup" class="link-muted">' + T('Privacy Policy') + '</a>' }) + '</p>' +
          '<p class="auth-foot">' + T('Already have an account?') + ' <a href="#/login">' + T('Log in') + '</a></p>',
      }),
      after: () => $('#f-first').focus(),
    };
  }

  function viewLogin() {
    return {
      html: authShell({
        active: 'login',
        title: T('Log in to Warranty tracker'),
        sub: T('Welcome back. Enter your details to continue'),
        body:
          '<form class="form auth-form" id="login-form" novalidate>' +
            field({ name: 'email', label: T('Email'), type: 'email', value: state.account ? state.account.email : '', placeholder: T('you@example.com'), attrs: ' autocomplete="email" spellcheck="false"' }) +
            field({ name: 'password', label: T('Password'), type: 'password', attrs: ' autocomplete="current-password"', aside: '<a class="label-link" href="#/forgot">' + T('Forgot password?') + '</a>' }) +
            btn(T('Log in'), null, { kind: 'primary', type: 'submit', cls: 'btn-block btn-lg' }) +
          '</form>' +
          '<p class="auth-foot">' + T('New here?') + ' <a href="#/signup">' + T('Create an account') + '</a></p>',
      }),
      after: () => { const f = state.account ? $('#f-password') : $('#f-email'); if (f) f.focus(); },
    };
  }

  function viewForgot() {
    return {
      html: authShell({
        active: 'login',
        title: T('Reset your password'),
        sub: T('Enter your email and we’ll send you a link to set a new one'),
        body:
          '<form class="form auth-form" id="forgot-form" novalidate>' +
            field({ name: 'email', label: T('Email'), type: 'email', value: state.account ? state.account.email : '', placeholder: T('you@example.com'), attrs: ' autocomplete="email" spellcheck="false"' }) +
            '<p class="inline-ok" id="forgot-ok" hidden>' + icon('checkCircle') + '<span></span></p>' +
            btn(T('Send reset link'), null, { kind: 'primary', type: 'submit', cls: 'btn-block btn-lg', id: 'forgot-btn' }) +
          '</form>' +
          '<p class="auth-foot"><a href="#/login">' + T('Back to log in') + '</a></p>',
      }),
      after: () => $('#f-email').focus(),
    };
  }

  /* Landed from the reset email: signed in for just long enough to choose a new password. */
  function viewReset() {
    return {
      html: authShell({
        active: 'login',
        title: T('Choose a new password'),
        sub: T('For {email}. You’ll stay logged in on this device', { email: esc(state.account.email) }),
        body:
          '<form class="form auth-form" id="reset-form" novalidate>' +
            field({ name: 'password', label: T('New password'), type: 'password', attrs: ' autocomplete="new-password"', hint: T('At least 8 characters.') }) +
            btn(T('Save password'), null, { kind: 'primary', type: 'submit', cls: 'btn-block btn-lg' }) +
          '</form>' +
          '<p class="auth-foot"><a href="#/vault">' + T('Skip for now') + '</a></p>',
      }),
      after: () => $('#f-password').focus(),
    };
  }

  /* ==========================================================================
     Vault: every item, as a landscape card, most urgent first
     ========================================================================== */
  const VAULT_CAP = 8;

  /* How urgent an item is (for sorting), and what to call out on its card. The "days
     left" tone always matches the progress bar's, so the two never disagree. */
  function cardMeta(it, i) {
    const flags = Object.keys(it.review || {});
    const tier = (n, x) => n * 100000 + Math.max(0, x);
    const leftTone = i.status === 'expired' ? 'weak' : i.status === 'expiring' ? 'warning' : 'base';
    if (flags.length) {
      return { tier: 0, urgency: tier(0, i.left), leftTone,
        tag: T('Check {fields}', { fields: andList(flags.map((f) => (FIELD_NAMES[f] || f).toLowerCase())) }), tagTone: 'warning', expired: false };
    }
    if (i.status === 'expired') {
      return { tier: 4, urgency: tier(4, -i.left), leftTone, tag: null, tagTone: null, expired: true };
    }
    if (i.returnOpen && i.rLeft <= 7) {
      return { tier: 1, urgency: tier(1, i.rLeft), leftTone,
        tag: i.rLeft === 0 ? T('Return closes today') : T('Return closes in {time}', { time: plural(i.rLeft, 'day') }), tagTone: 'info', expired: false };
    }
    if (i.left <= 30) {
      return { tier: 2, urgency: tier(2, i.left), leftTone, tag: null, tagTone: null, expired: false };
    }
    if (i.returnOpen) {
      return { tier: 3, urgency: tier(3, i.left), leftTone, tag: T('Return by {date}', { date: fmtDate(i.rEnd, { short: true }) }), tagTone: 'neutral', expired: false };
    }
    return { tier: 3, urgency: tier(3, i.left), leftTone, tag: null, tagTone: null, expired: false };
  }

  function greeting() {
    const h = new Date().getHours();
    return T(h < 5 ? 'Good evening, {name}' : h < 12 ? 'Good morning, {name}' : h < 18 ? 'Good afternoon, {name}' : 'Good evening, {name}', { name: '<span class="greet-name">' + esc(state.account.first) + '</span>' });
  }

  /* The greeting: one sentence about right now, and the actions that follow from it. */
  /* Status at a glance, beside the list: a ring and a legend in the same three statuses the
     filter uses. Clicking a segment or a row filters the list to it; clicking again clears it. */
  function coverageOverview() {
    const list = state.items.map((it) => { const i = info(it); return { it, i, next: cardMeta(it, i) }; });
    const total = list.length;
    const parts = STATUSES.filter((o) => o.has).map((o) => ({ key: o.key, label: o.label, n: list.filter(o.has).length }));
    const R = 52, C = 2 * Math.PI * R;
    const shown = parts.filter((p) => p.n);
    const gap = shown.length > 1 ? 3 : 0;
    const picked = ui.status !== 'all' ? ui.status : null;
    let at = 0;
    const segs = shown.map((p) => {
      const len = (p.n / total) * C;
      const seg = '<circle class="ov-seg ov-' + p.key + (picked === p.key ? ' is-picked' : '') + '" cx="60" cy="60" r="' + R + '" data-action="status-pick" data-v="' + p.key + '"' +
        ' stroke-dasharray="' + Math.max(0.01, len - gap).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-at).toFixed(2) + '">' +
        '<title>' + T('{label}: {n} of {total}. Click to show only these.', { label: p.label, n: p.n, total }) + '</title></circle>';
      at += len;
      return seg;
    }).join('');
    const covered = total - parts.find((p) => p.key === 'expired').n;
    const pct = total ? Math.round((covered / total) * 100) : 0;
    const first = !ui.ringSeen;
    ui.ringSeen = true;
    return '<section class="overview' + (picked ? ' has-pick' : '') + (first ? ' is-first' : '') + '" aria-labelledby="ov-title">' +
      '<div class="ov-head"><h2 class="ov-title" id="ov-title">' + T('Status') + '</h2>' +
        (picked ? '<button type="button" class="link-btn ov-clear" data-action="status-pick" data-v="all">' + T('Show all') + '</button>' : '') + '</div>' +
      '<div class="ov-ring">' +
        '<svg viewBox="0 0 120 120" role="img" aria-label="' + T('{pct}% of your warranties are still covered', { pct }) + '">' +
          '<circle class="ov-track" cx="60" cy="60" r="' + R + '" />' + segs + '</svg>' +
        '<p class="ov-center"><b class="num">' + pct + '%</b></p>' +
      '</div>' +
      '<ul class="ov-legend">' + parts.map((p) =>
        '<li><button type="button" class="ov-row ov-' + p.key + '" data-action="status-pick" data-v="' + p.key + '" aria-pressed="' + (picked === p.key) + '">' +
          '<span class="ov-dot" aria-hidden="true"></span><span class="ov-label">' + p.label + '</span><b class="num">' + p.n + '</b></button></li>').join('') + '</ul>' +
    '</section>';
  }

  function greetingBlock(list) {
    /* The greeting says how things stand, never which product: everything's fine, or how many
       things need you, and whether a warranty runs out within a month. The list shows which. */
    const action = list.filter((x) => x.next.tier <= 2);
    const soon = action.filter((x) => x.i.status !== 'expired' && x.i.left <= 30).length;
    let line, cta = '';
    if (!list.length) {
      line = T('Add your first receipt and we’ll track its warranty and return window for you.');
      cta = btn(T('Try with sample items'), 'load-samples', { kind: 'secondary', icon: 'sparkle' });
    } else if (action.length) {
      /* Whole sentences per count, so every language can agree its verbs with the numbers. */
      const n = action.length;
      line = !soon ? TN('{n} things need your attention.', n)
        : n === soon ? TN('{n} things need your attention: {n} warranties expire within a month.', n)
        : TN('{n} things need your attention, including {warranties}.', n, { warranties: TN('{n} warranties that expire within a month', soon) });
      cta = ui.status === 'attention'
        ? btn(T('Show all items'), 'inspect-off')
        : btn(T('Inspect'), 'inspect', { kind: 'secondary' });
    } else {
      line = T('Everything is covered. Nothing needs your attention.');
    }
    return '<header class="page-head greet">' +
      '<div class="greet-text"><h1 class="large-title">' + greeting() + '</h1><p>' + line + '</p>' +
        (cta ? '<div class="page-actions">' + cta + '</div>' : '') + '</div>' +
    '</header>' +
    (list.length ? '' : '<section class="first-add" aria-label="' + T('Add your first receipt') + '">' + addChoices() +
      '<p class="first-add-note">' + T('We read the shop, the price and the date, then remind you before the return window or the warranty runs out.') + '</p></section>');
  }

  function viewVault() {
    const items = state.items;
    if (!items.length) return { html: greetingBlock([]) };

    const list = items.map((it) => { const i = info(it); return { it, i, next: cardMeta(it, i) }; }).sort((a, b) => a.next.urgency - b.next.urgency);
    const covered = list.filter((x) => x.i.status !== 'expired').reduce((a, x) => a + Number(x.it.price || 0), 0);
    const merchants = Array.from(new Set(items.map((it) => it.merchant))).sort((a, b) => a.localeCompare(b));
    const cats = CATS.filter((c) => items.some((it) => it.category === c.key));

    /* The greeting, then one list with search and the three filters across its top. */
    const html = greetingBlock(list) +
      '<div class="vault-body"><div class="vault-list" id="warranties">' +
      '<div class="toolbar">' +
        searchField('q-vault', 'search-bar') +
        '<div class="toolbar-controls">' +
          '<div class="select select-sm"><label class="sr-only" for="flt-status">' + T('Status') + '</label><select id="flt-status">' +
            STATUSES.map((o) => '<option value="' + o.key + '"' + (ui.status === o.key ? ' selected' : '') + '>' + o.label + '</option>').join('') +
          '</select>' + icon('chevronDown', 12) + '</div>' +
          '<div class="select select-sm"><label class="sr-only" for="flt-cat">' + T('Category') + '</label><select id="flt-cat"><option value="all">' + T('All categories') + '</option>' +
            cats.map((c) => '<option value="' + c.key + '"' + (ui.cat === c.key ? ' selected' : '') + '>' + c.label + '</option>').join('') + '</select>' + icon('chevronDown', 12) + '</div>' +
          '<div class="select select-sm"><label class="sr-only" for="flt-merchant">' + T('Shop') + '</label><select id="flt-merchant"><option value="all">' + T('All shops') + '</option>' +
            merchants.map((m) => '<option' + (ui.merchant === m ? ' selected' : '') + '>' + esc(m) + '</option>').join('') + '</select>' + icon('chevronDown', 12) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="wlist" id="items" role="region" aria-label="' + T('Items') + '"></div>' +
      '<div class="list-foot" id="list-foot" aria-live="polite"></div>' +
      (state.plan === 'free' ? '<p class="plan-note">' + T('{n} of {max} items on the free plan.', { n: items.length, max: FREE_LIMIT }) + ' <a href="#/settings/plan">' + T('See Plus') + '</a></p>' : '') +
      '</div><aside class="vault-side" aria-label="' + T('Overview') + '">' +
        '<dl class="side-stats">' +
          '<div class="stat"><dt>' + T('Items') + '</dt><dd class="num">' + items.length + '</dd></div>' +
          '<div class="stat"><dt>' + T('Still covered') + '</dt><dd class="num">' + moneyWhole.format(Math.floor(covered)) + '</dd></div>' +
        '</dl>' +
        coverageOverview() +
      '</aside></div>';

    /* The meters draw in once when the vault opens, never again while you search or filter. */
    return { html, after: () => { ui.drawIn = true; renderList(); ui.drawIn = false; } };
  }

  function filtered() {
    const q = ui.q.trim().toLowerCase();
    let list = state.items.map((it) => { const i = info(it); return { it, i, next: cardMeta(it, i) }; });
    if (q) list = list.filter(({ it }) => [it.name, it.merchant, it.orderNo, catLabel(it.category), it.notes].join(' ').toLowerCase().includes(q));
    if (ui.cat !== 'all') list = list.filter(({ it }) => it.category === ui.cat);
    if (ui.merchant !== 'all') list = list.filter(({ it }) => it.merchant === ui.merchant);
    /* Status: needs attention (a detail to check, a closing return, an ending warranty), active, or expired. */
    const status = STATUSES.find((o) => o.key === ui.status);
    if (status && status.has) list = list.filter(status.has);
    return list.sort(byWarrantyEnd);
  }

  /* The list runs by when the warranty ends: soonest first, expired at the end (most recent first). */
  function byWarrantyEnd(a, b) {
    const ax = a.i.left < 0, bx = b.i.left < 0;
    if (ax !== bx) return ax ? 1 : -1;
    return (ax ? b.i.left - a.i.left : a.i.left - b.i.left) || a.it.name.localeCompare(b.it.name);
  }

  /* One item, as a Health-style reading: category and purchase date on top, then the item,
     then one big number for the time left, and a meter showing how much of the warranty has
     already passed. */
  function wcard(it, i, next, n) { return wrow(it, i, next, n); }

  /* One item, one line: what it is, the warranty span with today marked, and the warranty
     left. Every row reads the same way; an open return window gets its own line under the span. */
  function wrow(it, i, next, n) {
    const st = statusOf(i, false);
    const tag = next.tagTone === 'warning' ? next.tag : null;
    return '<a class="lrow' + (next.expired ? ' is-expired' : '') + '" href="#/item/' + it.id + '" style="--n:' + n + '">' +
      '<span class="lrow-mark cat-' + esc(it.category) + '" aria-hidden="true">' + icon(it.category, 18) + '</span>' +
      '<span class="lrow-id"><b>' + esc(it.name) + '</b>' +
        '<span>' + esc(it.merchant) + ', <span class="num">' + money(it.price) + '</span></span>' +
        (tag ? '<span class="lrow-tag lrow-tag-warning">' + esc(tag) + '</span>' : '') +
      '</span>' +
      '<span class="lrow-span">' + meter(i, false) + '<span class="lrow-cap">' + spanCaption(i, false) + '</span>' + returnLine(i) + '</span>' +
      '<span class="lrow-reading"><span class="lrow-label">' + st.label + '</span>' + reading(st) + '</span>' +
      icon('chevron', 14) +
    '</a>';
  }

  /* The return window, when one is still open: when it closes and how long is left. */
  function returnLine(i) {
    if (!i.returnOpen) return '';
    const soon = i.rLeft <= 7;
    const text = i.rLeft === 0 ? T('Return closes today')
      : T('Return by {date}, {time} left', { date: fmtDate(i.rEnd, { short: true, weekday: true }), time: plural(i.rLeft, 'day') });
    return '<span class="lrow-return' + (soon ? ' is-soon' : '') + '">' + icon('return', 12) + '<span>' + text + '</span></span>';
  }

  /* The status filter: what needs you, what's covered, what has expired. */
  const STATUSES = labelled([
    { key: 'all', label: 'All statuses' },
    { key: 'attention', label: 'Needs attention', has: (x) => x.next.tier <= 2 },
    { key: 'active', label: 'Active warranty', has: (x) => x.next.tier === 3 },
    { key: 'expired', label: 'Expired', has: (x) => x.next.tier === 4 },
  ]);

  function renderList() {
    const el = $('#items');
    if (!el) return;
    const list = filtered();
    el.classList.toggle('is-drawing', !!ui.drawIn && !reduceMotion);

    if (!list.length) {
      el.innerHTML = '<div class="empty-note"><p>' + (ui.q ? T('No items match “{q}”.', { q: esc(ui.q) }) : T('No items match these filters.')) + '</p>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-action="clear-filters">' + T('Clear filters') + '</button></div>';
      $('#list-foot').innerHTML = '';
      return;
    }

    const capped = !ui.showAll && list.length > VAULT_CAP;
    const shown = capped ? list.slice(0, VAULT_CAP) : list;
    /* One list, most urgent first. Each row's tag and reading say what needs you. */
    el.innerHTML = '<div class="ledger">' + shown.map(({ it, i, next }, n) => wrow(it, i, next, n)).join('') + '</div>';
    $('#list-foot').innerHTML = capped
      ? btn(TN('Show all {n} items', list.length), 'show-all', { kind: 'secondary', icon: 'chevronDown' })
      : list.length === state.items.length ? '' : T('Showing {n} of {total}', { n: list.length, total: state.items.length });
  }

  /* A small paper receipt, drawn from the item's details. */
  function receiptPreview(it, i) {
    return '<div class="rc" aria-hidden="true">' +
      '<p class="rc-shop">' + esc(it.merchant) + '</p>' +
      '<p class="rc-meta mono">' + fmtDate(it.purchased) + (it.orderNo ? ' · ' + esc(it.orderNo) : '') + '</p>' +
      '<span class="rc-rule"></span>' +
      '<p class="rc-line"><span>' + esc(it.name) + '</span><span class="mono">' + money(it.price) + '</span></p>' +
      '<p class="rc-line rc-total"><span>' + T('Total') + '</span><span class="mono">' + money(it.price) + '</span></p>' +
      '<span class="rc-rule"></span>' +
      '<p class="rc-line rc-foot"><span>' + T('Warranty') + '</span><span>' + T(i.status === 'expired' ? 'Expired {date}' : 'Until {date}', { date: fmtDate(i.end) }) + '</span></p>' +
      (i.rDays ? '<p class="rc-line rc-foot"><span>' + T('Returns') + '</span><span>' + T(i.returnOpen ? 'Until {date}' : 'Closed {date}', { date: fmtDate(i.rEnd) }) + '</span></p>' : '') +
    '</div>';
  }

  /* ==========================================================================
     Item drawer
     ========================================================================== */
  function openDrawer(id) {
    const it = findItem(id);
    /* A sheet that's still animating closed doesn't count: open a fresh one. */
    let wrap = $('.drawer-wrap:not(.is-closing)', overlay);
    if (!wrap) {
      ui.returnFocus = document.activeElement;
      wrap = document.createElement('div');
      wrap.className = 'drawer-wrap';
      wrap.innerHTML = '<div class="scrim" data-action="close-drawer"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="d-title"></aside>';
      overlay.appendChild(wrap);
      document.body.classList.add('no-scroll');
      requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('is-open')));
    }
    if (ui.drawerId !== id) ui.editing = null;
    ui.drawerId = id;
    $('.drawer', wrap).innerHTML = ui.editing === id ? drawerEdit(it) : drawerDetail(it);
    const t = $('#d-title', wrap);
    if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
  }

  /* Returns the href of the row that opened it, so focus can go back there. */
  function closeDrawer() {
    const wrap = $('.drawer-wrap:not(.is-closing)', overlay);
    if (!wrap) return undefined;
    const back = ui.returnFocus && ui.returnFocus.getAttribute ? ui.returnFocus.getAttribute('href') : null;
    ui.drawerId = null;
    ui.editing = null;
    wrap.classList.remove('is-open');
    wrap.classList.add('is-closing');
    document.body.classList.remove('no-scroll');
    if (reduceMotion) wrap.remove(); else setTimeout(() => wrap.remove(), 220);
    ui.returnFocus = null;
    return back;
  }

  function refreshDrawer() { if (ui.drawerId && findItem(ui.drawerId)) openDrawer(ui.drawerId); }

  /* Returns and warranty as two aligned spans from the purchase date, with today marked on each. */
  function timeline(i) {
    const t = today();
    const pct = (d) => Math.max(0, Math.min(100, (daysFrom(i.bought, d) / i.total) * 100)).toFixed(2);
    const todayPct = pct(t);
    const align = todayPct < 12 ? 'start' : todayPct > 88 ? 'end' : 'mid';
    const r = state.settings.remind;
    const ticks = [r.w30 && addDays(i.end, -30), r.w7 && addDays(i.end, -7)].filter((d) => d && d > t)
      .map((d) => '<span class="g-tick" style="left:' + pct(d) + '%" title="' + T('Reminder {date}', { date: fmtDate(d) }) + '"></span>').join('');

    let rows = '';
    if (i.rDays > 0) {
      const text = i.returnOpen
        ? (i.rLeft === 0 ? T('until {date}, last day', { date: fmtDate(i.rEnd, { short: true, weekday: true }) })
          : T('until {date}, {time} left', { date: fmtDate(i.rEnd, { short: true, weekday: true }), time: plural(i.rLeft, 'day') }))
        : T('closed {date}', { date: fmtDate(i.rEnd, { short: true }) });
      rows += '<div class="g-row' + (i.returnOpen ? '' : ' is-past') + '">' +
        '<p class="g-head"><span>' + T('Returns') + '</span><span class="' + (i.returnOpen ? 'tone-info' : '') + '">' + text + '</span></p>' +
        '<div class="g-track"><span class="g-bar g-bar-return" style="width:' + Math.max(1.5, pct(i.rEnd)) + '%"></span>' +
          '<span class="g-mark" style="left:' + todayPct + '%"></span></div></div>';
    }
    const wDate = fmtDate(i.end, { short: true });
    const wText = i.status === 'expired' ? T('expired {date}, {time} ago', { date: wDate, time: readingText(i.left) })
      : i.left === 0 ? T('until {date}, last day', { date: wDate })
      : T('until {date}, {time} left', { date: wDate, time: readingText(i.left) });
    rows += '<div class="g-row' + (i.status === 'expired' ? ' is-past' : '') + '">' +
      '<p class="g-head"><span>' + T('Warranty') + '</span><span class="' + (i.status === 'expiring' ? 'tone-warning' : '') + '">' + wText + '</span></p>' +
      '<div class="g-track"><span class="g-bar g-bar-used" style="width:' + todayPct + '%"></span>' +
        '<span class="g-bar g-bar-left" style="left:' + todayPct + '%;width:' + (100 - todayPct).toFixed(2) + '%"></span>' + ticks +
        '<span class="g-mark" style="left:' + todayPct + '%"></span></div></div>';

    return '<div class="gantt gantt-' + i.status + '">' + rows +
      '<div class="g-axis"><span class="g-today g-today-' + align + '" style="left:' + todayPct + '%">' + T('Today') + '</span></div></div>';
  }

  /* One sentence about reminders, instead of a list of dates. */
  function reminderLine(it) {
    const t = today();
    const up = remindersFor(it).filter((r) => r.date >= t).sort((a, b) => a.date - b.date)
      .map((r) => (daysFrom(t, r.date) === 0 ? T('today') : daysFrom(t, r.date) === 1 ? T('tomorrow') : fmtDate(r.date, { short: true })));
    const change = ' <a href="#/settings/reminders">' + T('Change') + '</a>';
    if (!up.length) return T('None coming up.') + change;
    const where = andList([state.settings.device && T('on this device'), state.settings.emailCopy && T('by email')].filter(Boolean));
    return (where ? T('{dates}, {where}.', { dates: andList(up), where }) : T('{dates}.', { dates: andList(up) })) + change;
  }

  function drawerDetail(it) {
    const i = info(it);
    const flags = Object.keys(it.review || {});
    const returnFirst = i.returnOpen && (i.rLeft <= 7 || i.left > 30);
    const st = statusOf(i, returnFirst);
    const note = returnFirst
      ? (i.rLeft === 0 ? T('Today is the last day to send it back.') : T('You can send it back until {date}.', { date: fmtDate(i.rEnd, { weekday: true }) }))
      : i.status === 'expired' ? T('The maker may still repair it for a fee.')
      : i.left <= 30 ? T('Claim before then if anything’s wrong.')
      : T('Covered until {date}.', { date: fmtDate(i.end, { weekday: true }) });
    const warrantySource = it.warrantyNote ? esc(it.warrantyNote) : !it.warrantyMonths ? T('Default for {category}', { category: catLabel(it.category).toLowerCase() }) : T('Set by you');

    return '<span class="grabber" aria-hidden="true"></span>' +
      '<header class="d-head">' +
        '<button type="button" class="close-btn" data-action="close-drawer" aria-label="' + T('Close') + '">' + icon('x', 14) + '</button>' +
        passCard(it, i, { titleId: 'd-title', cls: 'pass-sheet' }) +
      '</header>' +
      '<div class="d-body">' +
        (flags.length ? '<section class="callout callout-warning">' + icon('alert') + '<div>' +
          '<p class="callout-title">' + (flags.length === 1 ? T('Check this detail') : T('Check these details')) + '</p>' +
          flags.map((f) => '<p>' + (FIELD_NAMES[f] || f) + ': ' + esc(it.review[f]) + '</p>').join('') +
          '<div class="callout-actions">' + btn(T('Looks right'), 'review-ok', { kind: 'filled-warning', cls: 'btn-sm', data: { id: it.id } }) +
          btn(T('Edit'), 'edit', { kind: 'plain', cls: 'btn-sm', data: { id: it.id } }) + '</div></div></section>' : '') +

        '<section class="d-status">' +
          '<p class="d-label">' + st.label + '</p>' +
          reading(st, 'value-xl') +
          '<p class="d-note">' + note + '</p>' +
          timeline(i) +
        '</section>' +

        '<section class="d-sec"><h3>' + T('Details') + '</h3><dl class="dl">' +
          '<div><dt>' + T('Paid') + '</dt><dd class="num">' + money(it.price) + '</dd></div>' +
          '<div><dt>' + T('Order number') + '</dt><dd class="num">' + (it.orderNo ? esc(it.orderNo) : '<span class="weak">' + T('Not recorded') + '</span>') + '</dd></div>' +
          '<div><dt>' + T('Warranty') + '</dt><dd>' + monthsLabel(i.months) + '<span class="dd-sub">' + warrantySource + '</span></dd></div>' +
          '<div><dt>' + T('Return window') + '</dt><dd>' + (i.rDays ? plural(i.rDays, 'day') : T('None')) + '<span class="dd-sub">' + (it.returnDays == null ? T('Your default') : T('Shop’s policy')) + '</span></dd></div>' +
          (it.notes ? '<div><dt>' + T('Notes') + '</dt><dd>' + esc(it.notes) + '</dd></div>' : '') +
          '<div class="dl-wide"><dt>' + T('Reminders') + '</dt><dd>' + reminderLine(it) + '</dd></div>' +
        '</dl></section>' +

        '<section class="d-sec"><h3>' + T('Receipt') + '</h3>' + proofCard(it, i) + '</section>' +
        '<section class="d-sec"><h3>' + T('Documents') + '</h3>' +
          ((it.docs || []).length ? '<ul class="doc-list">' + it.docs.map((d, n) => docRow(d, { itemId: it.id, n })).join('') + '</ul>' : '<p class="d-muted docs-empty">' + T('Warranty card, manual, delivery note: keep them here for a claim.') + '</p>') +
          dropzone('data-attach-docs="' + it.id + '"', true) +
        '</section>' +
      '</div>' +
      '<footer class="d-foot">' +
        btn(T('Export for a claim'), 'export-one', { kind: 'primary', icon: 'download', data: { id: it.id } }) +
        btn(T('Edit'), 'edit', { kind: 'gray', icon: 'pencil', data: { id: it.id } }) +
        '<button type="button" class="icon-btn icon-btn-danger" data-action="delete" data-id="' + it.id + '" aria-label="' + T('Delete {name}', { name: esc(it.name) }) + '">' + icon('trash') + '</button>' +
      '</footer>';
  }

  function proofCard(it, i) {
    if (it.photo) {
      return '<button type="button" class="proof proof-photo" data-action="view-proof" data-id="' + it.id + '">' +
        '<img src="' + it.photo + '" alt="" /><span class="proof-cap">' + icon('camera') + '<span><b>' + T('Photo of receipt') + '</b><span>' + T('Added {date}', { date: fmtDate(it.added || it.purchased) }) + '</span></span>' + icon('chevron', 12) + '</span></button>';
    }
    if (it.fileName) {
      return '<button type="button" class="proof proof-doc" data-action="view-proof" data-id="' + it.id + '">' +
        receiptPreview(it, i) +
        '<span class="proof-cap">' + icon('file') + '<span><b>' + esc(it.fileName) + '</b><span>' + T('Uploaded {date}', { date: fmtDate(it.added || it.purchased) }) + '</span></span>' + icon('chevron', 12) + '</span></button>';
    }
    return '<p class="d-muted">' + T('No receipt attached. Add a photo so you have proof if you need to claim.') + '</p>' +
      '<label class="btn btn-tinted btn-sm file-btn">' + icon('camera') + '<span>' + T('Add a photo') + '</span>' +
      '<input type="file" accept="image/*" capture="environment" data-attach="' + it.id + '" /></label>';
  }

  function viewProof(it) {
    const body = it.photo
      ? '<img class="proof-full" src="' + it.photo + '" alt="' + T('Photo of the receipt for {name}', { name: esc(it.name) }) + '" />'
      : '<article class="receipt">' +
          '<header><p class="mono">' + esc(it.fileName) + '</p><h3>' + esc(it.merchant) + '</h3><p>' + fmtDate(it.purchased, { weekday: true }) + '</p></header>' +
          '<table><tbody>' +
            '<tr><td>' + esc(it.name) + '<br><span class="weak">' + T('Qty 1') + '</span></td><td class="num">' + money(it.price) + '</td></tr>' +
            (it.review && it.review.price ? '<tr><td>' + T('Delivery') + '</td><td class="num">' + money(9.99) + '</td></tr>' : '') +
            '<tr class="receipt-total"><td>' + T('Total paid') + '</td><td class="num">' + money(it.review && it.review.price ? Number(it.price) + 9.99 : it.price) + '</td></tr>' +
          '</tbody></table>' +
          '<p class="mono weak">' + T('Order {no}', { no: esc(it.orderNo || '—') }) + '</p>' +
        '</article>';
    modal({
      title: it.photo ? T('Receipt photo') : T('Receipt'),
      body: body + '<p class="modal-note">' + icon('lock', 14) + T('Stored with this item. Only you can see it.') + '</p>',
      actions: [{ label: T('Close'), action: 'close-modal' }],
      wide: true,
    });
  }

  function itemForm(v, flags) {
    flags = flags || {};
    const catDefault = state.settings.defaults[v.category || 'electronics'];
    return '<div class="form-grid">' +
      field({ name: 'name', label: T('Item'), value: v.name || '', placeholder: T('e.g. Bosch dishwasher'), flag: flags.name, wide: true }) +
      field({ name: 'merchant', label: T('Shop'), value: v.merchant || '', placeholder: T('e.g. MediaMarkt'), flag: flags.merchant }) +
      field({ name: 'category', label: T('Category'), type: 'select', value: v.category || 'electronics', options: CATS.map((c) => ({ value: c.key, label: c.label })), flag: flags.category }) +
      field({ name: 'price', label: T('Price paid (€)'), value: v.price != null && v.price !== '' ? String(v.price) : '', placeholder: '0.00', attrs: ' inputmode="decimal"', flag: flags.price }) +
      field({ name: 'purchased', label: T('Purchase date'), type: 'date', value: v.purchased || iso(today()), attrs: ' max="' + iso(today()) + '"', flag: flags.purchased }) +
      field({ name: 'orderNo', label: T('Order number'), value: v.orderNo || '', placeholder: T('Optional'), flag: flags.orderNo }) +
      field({ name: 'warrantyMonths', label: T('Warranty'), type: 'select', value: v.warrantyMonths || '',
        options: [{ value: '', label: T('Default ({time})', { time: monthsLabel(catDefault) }) }].concat(WARRANTY_OPTIONS.map((m) => ({ value: m, label: monthsLabel(m) }))) }) +
      field({ name: 'returnDays', label: T('Return window'), type: 'select', value: v.returnDays == null ? '' : v.returnDays,
        options: [{ value: '', label: T('Default ({time})', { time: plural(state.settings.returnDays, 'day') }) }].concat(RETURN_OPTIONS.map((d) => ({ value: d, label: d ? plural(d, 'day') : T('No returns') }))) }) +
      field({ name: 'notes', label: T('Notes'), type: 'textarea', value: v.notes || '', placeholder: T('Serial number, where it’s kept, anything useful for a claim'), wide: true }) +
    '</div>';
  }

  function readForm(form) {
    const f = new FormData(form);
    const raw = String(f.get('price') || '').trim();
    const price = parsePrice(raw);
    return {
      name: String(f.get('name') || '').trim(),
      merchant: String(f.get('merchant') || '').trim() || T('Unknown shop'),
      category: f.get('category'),
      price: isNaN(price) ? 0 : Math.round(price * 100) / 100,
      priceRaw: raw,
      purchased: f.get('purchased') || iso(today()),
      orderNo: String(f.get('orderNo') || '').trim(),
      warrantyMonths: f.get('warrantyMonths') ? Number(f.get('warrantyMonths')) : null,
      returnDays: f.get('returnDays') === '' ? null : Number(f.get('returnDays')),
      notes: String(f.get('notes') || '').trim(),
    };
  }

  /* "1,299.99", "1.299,99" and "249,99" all mean what they say. */
  function parsePrice(raw) {
    let t = String(raw).replace(/[€\s]/g, '');
    const dec = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
    if (dec >= 0 && t.length - dec - 1 !== 3) t = t.slice(0, dec).replace(/[.,]/g, '') + '.' + t.slice(dec + 1);
    else t = t.replace(/[.,]/g, '');
    return /^\d*\.?\d*$/.test(t) && t !== '' && t !== '.' ? parseFloat(t) : NaN;
  }

  /* Errors are set bottom-up so focus lands on the first bad field. */
  function validateItem(v) {
    let ok = true;
    ['f-purchased', 'f-price', 'f-name'].forEach((id) => showError(id, ''));
    if (v.purchased > iso(today())) { showError('f-purchased', T('The purchase date can’t be in the future.')); ok = false; }
    if (v.priceRaw && isNaN(parsePrice(v.priceRaw))) { showError('f-price', T('Enter the price as a number, like 249.99.')); ok = false; }
    if (!v.name) { showError('f-name', T('Enter what you bought, so you can find it later.')); ok = false; }
    return ok;
  }

  function drawerEdit(it) {
    return '<span class="grabber" aria-hidden="true"></span>' +
      '<header class="d-head d-head-edit">' +
        '<button type="button" class="close-btn" data-action="close-drawer" aria-label="' + T('Close') + '">' + icon('x', 14) + '</button>' +
        '<h2 id="d-title" class="d-title">' + T('Edit item') + '</h2>' +
        '<p class="d-sub">' + esc(it.name) + '</p>' +
      '</header>' +
      '<form class="d-body form" id="edit-form" data-id="' + it.id + '" novalidate>' + itemForm(it, it.review) + '</form>' +
      '<footer class="d-foot">' +
        '<button type="submit" form="edit-form" class="btn btn-primary"><span>' + T('Save changes') + '</span></button>' +
        btn(T('Cancel'), 'cancel-edit', { kind: 'plain' }) +
      '</footer>';
  }

  /* ==========================================================================
     Add a receipt
     ========================================================================== */
  /* The three ways in: photo, file, or by hand. Shared by the Add page and an empty vault. */
  function addChoices() {
    return '<div class="add-choices">' +
        '<label class="add-choice"><span class="add-ic tint-blue">' + icon('camera', 22) + '</span>' +
          '<span class="add-text"><b>' + T('Take a photo') + '</b><span>' + T('Point your camera at a paper receipt') + '</span></span>' + icon('chevron', 14) +
          '<input type="file" accept="image/*" capture="environment" id="photo-input" class="sr-only" /></label>' +
        '<label class="add-choice"><span class="add-ic tint-indigo">' + icon('upload', 22) + '</span>' +
          '<span class="add-text"><b>' + T('Upload a file') + '</b><span>' + T('PDF invoice or a screenshot') + '</span></span>' + icon('chevron', 14) +
          '<input type="file" accept="image/*,application/pdf" id="file-input" class="sr-only" /></label>' +
        '<button type="button" class="add-choice" data-action="add-manual"><span class="add-ic tint-gray">' + icon('pencil', 22) + '</span>' +
          '<span class="add-text"><b>' + T('Enter details') + '</b><span>' + T('No receipt to hand? Type it in') + '</span></span>' + icon('chevron', 14) + '</button>' +
      '</div>';
  }

  /* Add and Settings sit on top of the vault: one way back to it. */
  function backLink() { return '<a class="back-link" href="#/vault">' + icon('chevronLeft', 14) + '<span>' + T('Vault') + '</span></a>'; }

  /* Adding a receipt: the receipt, what it is, how long it's covered, anything else to keep with it, done. */
  const ADD_STEPS = ['Receipt', 'Details', 'Coverage', 'Documents', 'Done'];
  const ADD_STEP_OF = { choose: 0, reading: 0, details: 1, coverage: 2, docs: 3, done: 4 };
  const DOC_KINDS = ['Warranty card', 'Manual', 'Invoice', 'Delivery note', 'Photo', 'Other'];

  function stepper(current) {
    return '<ol class="stepper" aria-label="' + T('Steps') + '">' + ADD_STEPS.map((label, n) =>
      '<li class="step' + (n < current ? ' is-done' : n === current ? ' is-current' : '') + '"' + (n === current ? ' aria-current="step"' : '') + '>' +
        '<span class="step-dot">' + (n < current ? icon('check', 12) : '<span class="num">' + (n + 1) + '</span>') + '</span>' +
        '<span class="step-label">' + T(label) + '</span>' +
      '</li>').join('') + '</ol>';
  }

  /* The form values collected so far, as an item. */
  function valuesToItem(v) {
    const price = parsePrice(v.price == null ? '' : String(v.price));
    return {
      name: String(v.name || '').trim(),
      merchant: String(v.merchant || '').trim() || T('Unknown shop'),
      category: v.category || 'electronics',
      price: isNaN(price) ? 0 : Math.round(price * 100) / 100,
      purchased: v.purchased || iso(today()),
      orderNo: String(v.orderNo || '').trim(),
      warrantyMonths: v.warrantyMonths ? Number(v.warrantyMonths) : null,
      returnDays: v.returnDays === '' || v.returnDays == null ? null : Number(v.returnDays),
      notes: String(v.notes || '').trim(),
    };
  }

  /* Keep whatever this step's form holds, so Back never loses anything. */
  function mergeStep(form) {
    const f = new FormData(form);
    ui.add.values = ui.add.values || {};
    f.forEach((value, key) => { if (typeof value === 'string') ui.add.values[key] = value; });
  }

  /* Step 3's live answer: when cover ends, when the return window closes, drawn from the purchase date. */
  function coveragePreview() {
    const list = addItems();
    const it = list[0];
    const i = info(it);
    const why = (x, xi) => x.warrantyMonths ? monthsLabel(xi.months) : T('{time}, your default for {category}', { time: monthsLabel(xi.months), category: catLabel(x.category).toLowerCase() });
    /* Several items from one receipt: the first leads, the rest are listed with their own end dates. */
    return '<div class="cov-figs">' +
        '<div><span>' + T('Covered until') + '</span><b class="num">' + fmtDate(i.end) + '</b><em>' + (list.length > 1 ? esc(it.name) + ', ' : '') + why(it, i) + '</em></div>' +
        '<div><span>' + T('Return by') + '</span><b class="num">' + (i.rDays ? fmtDate(i.rEnd) : T('No returns')) + '</b><em>' + (i.rDays ? T('{time} from purchase', { time: plural(i.rDays, 'day') }) : T('This shop takes nothing back')) + '</em></div>' +
      '</div>' + timeline(i) +
      (list.length > 1 ? '<ul class="cov-lines">' + list.slice(1).map((x) => { const xi = info(x);
        return '<li><b>' + esc(x.name) + '</b><span>' + T('Covered until {date}', { date: '<span class="num">' + fmtDate(xi.end) + '</span>' }) + ', ' + why(x, xi) + '</span></li>'; }).join('') + '</ul>' : '');
  }

  /* Documents: the warranty card, the manual, the delivery note: whatever the shop asks to see. */
  function fileSize(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function guessKind(name, type) {
    const n = String(name).toLowerCase();
    if (/warrant|garanc|garant|jamstv/.test(n)) return 'Warranty card';
    if (/manual|navodil|instruction|anleitung|guide/.test(n)) return 'Manual';
    if (/invoice|ra[cč]un|rechnung|bill/.test(n)) return 'Invoice';
    if (/deliver|dobavn|lieferschein/.test(n)) return 'Delivery note';
    return String(type).startsWith('image/') ? 'Photo' : 'Other';
  }
  function readDocs(files) {
    return Promise.all(Array.from(files || []).map((file) => {
      const doc = { id: uid(), name: file.name, size: file.size, type: file.type, kind: guessKind(file.name, file.type), added: iso(today()) };
      if (!file.type.startsWith('image/')) return Promise.resolve(doc);
      return shrinkImage(file, 360).then((thumb) => Object.assign(doc, { thumb })).catch(() => doc);
    }));
  }
  function docRow(d, o) {
    const mark = d.thumb
      ? '<span class="doc-thumb"><img src="' + d.thumb + '" alt="" /></span>'
      : '<span class="doc-thumb doc-file" aria-hidden="true">' + icon('file', 18) + '<em>' + esc((String(d.name).split('.').pop() || 'file').slice(0, 4)) + '</em></span>';
    const kind = o.editable
      ? '<div class="select select-sm doc-kind"><label class="sr-only" for="kind-' + d.id + '">' + T('Type of {name}', { name: esc(d.name) }) + '</label><select id="kind-' + d.id + '" data-doc-kind="' + d.id + '">' +
          DOC_KINDS.map((k) => '<option value="' + k + '"' + (k === d.kind ? ' selected' : '') + '>' + T(k) + '</option>').join('') + '</select>' + icon('chevronDown', 12) + '</div>'
      : '';
    return '<li class="doc" style="--n:' + (o.n || 0) + '">' + mark +
      '<span class="doc-text"><b>' + esc(d.name) + '</b><span>' + (o.editable ? '' : esc(T(d.kind)) + ', ') + fileSize(d.size || 0) + '</span></span>' + kind +
      '<button type="button" class="icon-btn doc-remove" data-action="doc-remove" data-doc="' + d.id + '"' + (o.itemId ? ' data-id="' + o.itemId + '"' : '') + ' aria-label="' + T('Remove {name}', { name: esc(d.name) }) + '">' + icon('x', 14) + '</button>' +
    '</li>';
  }
  function dropzone(attrs, compact) {
    return '<label class="dropzone' + (compact ? ' dropzone-compact' : '') + '">' +
      '<span class="dz-ic" aria-hidden="true">' + icon('upload', 20) + '</span>' +
      '<span class="dz-text"><b>' + T('Drop files here, or browse') + '</b><span>' + T('Warranty card, manual, delivery note. PDF or photos, as many as you need.') + '</span></span>' +
      '<input type="file" class="sr-only" multiple accept="image/*,application/pdf" ' + attrs + ' /></label>';
  }
  function renderAddDocs() {
    const list = $('#add-doc-list');
    if (!list || !ui.add) return;
    const docs = ui.add.docs || [];
    list.innerHTML = docs.map((d, n) => docRow(d, { editable: true, n })).join('');
    const go = $('#docs-next span');
    if (go) go.textContent = docs.length ? T('Save to vault') : T('Skip and save');
  }

  function viewAdd() {
    const a = ui.add || { stage: 'choose' };
    const step = ADD_STEP_OF[a.stage] == null ? 0 : ADD_STEP_OF[a.stage];
    const titles = ({
      choose: ['Add a receipt', 'How would you like to add it?'],
      reading: ['Reading your receipt', 'This takes a moment.'],
      details: ['What did you buy?', a.extracted ? 'We read these from your receipt. Check them, then continue.' : 'The basics, so you can find it and prove the purchase.'],
      coverage: ['How long is it covered?', 'We’ve filled in the usual lengths. Change them if the shop or maker gives more.'],
      docs: ['Anything else to keep with it?', 'Shops often ask for more than the receipt. Add the warranty card, the manual or the delivery note now, and it’s all in one place when you claim.'],
    }[a.stage] || ['Add a receipt', '']).map((x) => (x ? T(x) : x));
    const shell = (inner) => '<div class="add-shell">' + inner + '</div>';
    const top = '<div class="add-top">' + backLink() + '</div>' + stepper(step);
    const head = '<header class="add-head"><h1 class="large-title">' + titles[0] + '</h1>' + (titles[1] ? '<p>' + titles[1] + '</p>' : '') + '</header>';
    const panel = (html) => '<section class="step-panel">' + html + '</section>';
    const actions = (next) => '<div class="step-actions">' + btn(T('Back'), 'add-back', { kind: 'plain', icon: 'chevronLeft' }) + next + '</div>';

    if (state.plan === 'free' && state.items.length >= FREE_LIMIT && a.stage !== 'done') {
      return {
        html: shell('<div class="add-top">' + backLink() + '</div><header class="add-head"><h1 class="large-title">' + T('Your vault is full') + '</h1><p>' + T('The free plan holds {max} items. Plus holds as many as you like.', { max: FREE_LIMIT }) + '</p></header>' +
          '<div class="done-actions">' + btn(T('See Plus'), 'show-plans', { kind: 'primary', cls: 'btn-lg' }) + '</div>'),
      };
    }

    if (a.stage === 'choose') return { html: shell(top + head + panel(addChoices())) };

    if (a.stage === 'reading') {
      return {
        html: shell(top + head + panel(
          '<div class="reading">' +
            '<div class="reading-img">' + (a.image ? '<img src="' + a.image + '" alt="' + T('Your receipt') + '" />' : '<span class="reading-file">' + icon('file', 24) + '<span class="mono">' + esc(a.fileName || '') + '</span></span>') +
              '<span class="scanline" aria-hidden="true"></span></div>' +
            '<p class="reading-text" role="status"><span class="spinner" aria-hidden="true"></span>' + T('Finding the shop, the item, the price and the date…') + '</p>' +
          '</div>')),
        /* A real read moves on by itself when readReceipt answers; the demo just waits a beat. */
        after: () => {
          if (!a.simulated) return;
          setTimeout(() => {
            if (!ui.add || ui.add.stage !== 'reading') return;
            ui.add.stage = 'details';
            if (route().name === 'add') paint('add');
          }, reduceMotion ? 300 : 1800);
        },
      };
    }

    if (a.stage === 'details') {
      const v = a.values || {};
      const flags = a.flags || {};
      const flagCount = Object.keys(flags).length;
      return {
        html: shell(top + head + panel(
          (a.image ? '<div class="add-thumb"><img src="' + a.image + '" alt="' + T('Your receipt') + '" /></div>' : '') +
          '<form class="form add-form" id="add-details" novalidate>' +
            (flagCount ? '<p class="callout callout-warning">' + icon('alert') + '<span>' + Object.keys(flags).map((k) => esc(flags[k])).join(' ') + '</span></p>' : '') +
            (a.lines ? receiptLines(a.lines) +
              '<div class="form-grid">' +
                field({ name: 'merchant', label: T('Shop'), value: v.merchant || '', placeholder: 'Big Bang…', flag: flags.merchant, attrs: ' autocomplete="off"' }) +
                field({ name: 'purchased', label: T('Purchase date'), type: 'date', value: v.purchased || iso(today()), attrs: ' max="' + iso(today()) + '"', flag: flags.purchased }) +
                field({ name: 'orderNo', label: T('Order number'), value: v.orderNo || '', placeholder: T('Optional'), flag: flags.orderNo, wide: true, attrs: ' autocomplete="off" spellcheck="false"' }) +
              '</div>'
            : '<div class="form-grid">' +
              field({ name: 'name', label: T('Item'), value: v.name || '', placeholder: T('Gorenje washing machine…'), flag: flags.name, wide: true, attrs: ' autocomplete="off"' }) +
              field({ name: 'merchant', label: T('Shop'), value: v.merchant || '', placeholder: 'Big Bang…', flag: flags.merchant, attrs: ' autocomplete="off"' }) +
              field({ name: 'category', label: T('Category'), type: 'select', value: v.category || 'electronics', options: CATS.map((c) => ({ value: c.key, label: c.label })), flag: flags.category }) +
              field({ name: 'price', label: T('Price paid (€)'), value: v.price != null && v.price !== '' ? String(v.price) : '', placeholder: '0.00', attrs: ' inputmode="decimal" autocomplete="off"', flag: flags.price }) +
              field({ name: 'purchased', label: T('Purchase date'), type: 'date', value: v.purchased || iso(today()), attrs: ' max="' + iso(today()) + '"', flag: flags.purchased }) +
              field({ name: 'orderNo', label: T('Order number'), value: v.orderNo || '', placeholder: T('Optional'), flag: flags.orderNo, wide: true, attrs: ' autocomplete="off" spellcheck="false"' }) +
            '</div>') +
            actions('<button type="submit" class="btn btn-primary btn-lg"><span>' + T('Continue') + '</span>' + icon('chevron') + '</button>') +
            (a.simulated ? '<p class="fineprint">' + T('Prototype: reading the receipt is simulated, so these details are sample data.') + '</p>' : '') +
          '</form>')),
        after: () => { if (!a.extracted) { const n = $('#f-name'); if (n) n.focus(); } },
      };
    }

    if (a.stage === 'coverage') {
      const v = a.values || {};
      const catDefault = state.settings.defaults[v.category || 'electronics'];
      return {
        html: shell(top + head + panel(
          '<form class="form add-form" id="add-coverage" novalidate>' +
            '<div class="cov-preview" id="cov-preview" aria-live="polite">' + coveragePreview() + '</div>' +
            '<div class="form-grid">' +
              field({ name: 'warrantyMonths', label: T('Warranty'), type: 'select', value: v.warrantyMonths || '',
                options: [{ value: '', label: a.lines ? T('Default for each item’s category') : T('Default ({time})', { time: monthsLabel(catDefault) }) }].concat(WARRANTY_OPTIONS.map((m) => ({ value: m, label: monthsLabel(m) }))) }) +
              field({ name: 'returnDays', label: T('Return window'), type: 'select', value: v.returnDays == null ? '' : v.returnDays,
                options: [{ value: '', label: T('Default ({time})', { time: plural(state.settings.returnDays, 'day') }) }].concat(RETURN_OPTIONS.map((d) => ({ value: d, label: d ? plural(d, 'day') : T('No returns') }))) }) +
              field({ name: 'notes', label: T('Notes'), type: 'textarea', value: v.notes || '', placeholder: T('Serial number, where it’s kept, anything useful for a claim'), wide: true }) +
            '</div>' +
            actions('<button type="submit" class="btn btn-primary btn-lg"><span>' + T('Continue') + '</span>' + icon('chevron') + '</button>') +
          '</form>')),
      };
    }

    if (a.stage === 'docs') {
      const receipt = a.image || a.fileName
        ? '<p class="docs-receipt">' + icon('checkCircle', 16) + '<span>' + (a.fileName ? T('Your receipt is already attached: {file}.', { file: '<b>' + esc(a.fileName) + '</b>' }) : T('Your receipt is already attached.')) + '</span></p>'
        : '';
      return {
        html: shell(top + head + panel(
          '<form class="form add-form" id="add-docs" novalidate>' +
            receipt +
            dropzone('id="docs-input"') +
            '<ul class="doc-list" id="add-doc-list" aria-live="polite"></ul>' +
            actions('<button type="submit" class="btn btn-primary btn-lg" id="docs-next">' + icon('check') + '<span>' + T('Skip and save') + '</span></button>') +
          '</form>')),
        after: renderAddDocs,
      };
    }

    /* Done: a lime burst, the check draws itself, then the new item and what happens next. */
    const saved = (a.savedIds || [a.savedId]).map(findItem).filter(Boolean);
    if (!saved.length) { ui.add = null; return viewAdd(); }
    const it = saved[0];
    const card = (x) => {
      const xi = info(x);
      const st = statusOf(xi, xi.returnOpen && xi.rLeft <= 7);
      const docs = (x.docs || []).length + (x.photo || x.fileName ? 1 : 0);
      return '<div class="done-card">' +
          '<span class="lrow-mark cat-' + esc(x.category) + '" aria-hidden="true">' + icon(x.category, 18) + '</span>' +
          '<span class="done-name"><b>' + esc(x.name) + '</b><span>' + esc(x.merchant) + ', <span class="num">' + money(x.price) + '</span>' + (docs ? ', ' + plural(docs, 'document') : '') + '</span></span>' +
          '<span class="lrow-reading"><span class="lrow-label">' + st.label + '</span>' + reading(st) + '</span>' +
        '</div>';
    };
    return {
      html: shell('<div class="add-top">' + backLink() + '</div>' + stepper(4) + panel(
        '<div class="done">' +
          '<div class="done-burst" aria-hidden="true">' + Array.from({ length: 10 }, (_, n) => '<i style="--a:' + (n * 36) + 'deg"></i>').join('') +
            '<svg class="done-mark" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="m15 27 7.5 7.5L37.5 19" /></svg></div>' +
          '<h1 class="large-title">' + (saved.length > 1 ? TN('{n} items added to your vault', saved.length) : T('Added to your vault')) + '</h1>' +
          '<div class="done-cards">' + saved.map(card).join('') + '</div>' +
          (saved.length > 1 ? '' : '<p class="done-remind">' + icon('bell', 14) + '<span>' + T('Reminders:') + ' ' + reminderLine(it) + '</span></p>') +
          '<div class="done-actions">' +
            (saved.length > 1
              ? '<a class="btn btn-primary btn-lg" href="#/vault"><span>' + T('Open vault') + '</span></a>'
              : '<a class="btn btn-primary btn-lg" href="#/item/' + it.id + '"><span>' + T('Open item') + '</span></a>') +
            btn(T('Add another'), 'add-reset', { kind: 'secondary', cls: 'btn-lg', icon: 'plus' }) +
          '</div>' +
        '</div>')),
    };
  }

  /* A receipt with several products: each line becomes its own item, and any line can be left out. */
  function receiptLines(lines) {
    const kept = lines.filter((l) => l.keep).length;
    return '<fieldset class="lines">' +
      '<legend class="lines-head"><b>' + TN('{n} items on this receipt', lines.length) + '</b>' +
        '<span>' + T('Each ticked one goes into your vault on its own. Untick anything you don’t need a warranty for.') + '</span></legend>' +
      lines.map((l, n) =>
        '<div class="line' + (l.keep ? '' : ' is-off') + '">' +
          '<label class="line-keep"><input type="checkbox" name="keep-' + n + '"' + (l.keep ? ' checked' : '') + ' />' +
            '<span class="sr-only">' + T('Add {name} to the vault', { name: esc(l.name) }) + '</span></label>' +
          '<div class="form-grid">' +
            field({ name: 'name-' + n, label: T('Item'), value: l.name, flag: l.note, wide: true, hint: l.note ? esc(l.note) : '', attrs: ' autocomplete="off"' }) +
            field({ name: 'category-' + n, label: T('Category'), type: 'select', value: l.category, options: CATS.map((c) => ({ value: c.key, label: c.label })) }) +
            field({ name: 'price-' + n, label: T('Price paid (€)'), value: l.price !== '' && l.price != null ? String(l.price) : '', placeholder: '0.00', attrs: ' inputmode="decimal" autocomplete="off"' }) +
          '</div>' +
        '</div>').join('') +
      '<p class="field-error" id="f-lines-error"' + (kept ? ' hidden' : '') + '>' + (kept ? '' : T('Tick at least one item to add.')) + '</p>' +
    '</fieldset>';
  }

  /* Read the lines back from the form, check them, and keep them on ui.add. */
  function readLines(form) {
    const f = new FormData(form);
    const lines = ui.add.lines.map((l, n) => ({
      name: String(f.get('name-' + n) || '').trim(), category: String(f.get('category-' + n) || 'other'),
      price: String(f.get('price-' + n) || '').trim(), keep: f.get('keep-' + n) === 'on', note: l.note,
    }));
    ui.add.lines = lines;
    let ok = true;
    lines.forEach((l, n) => {
      showError('f-name-' + n, ''); showError('f-price-' + n, '');
      if (!l.keep) return;
      if (!l.name) { showError('f-name-' + n, T('Enter what you bought, so you can find it later.')); ok = false; }
      if (l.price && isNaN(parsePrice(l.price))) { showError('f-price-' + n, T('Enter the price as a number, like 249.99.')); ok = false; }
    });
    const kept = lines.filter((l) => l.keep).length;
    const err = $('#f-lines-error');
    if (err) { err.hidden = !!kept; err.textContent = kept ? '' : T('Tick at least one item to add.'); }
    if (!kept) ok = false;
    const room = FREE_LIMIT - state.items.length;
    if (kept && state.plan === 'free' && kept > room) {
      if (err) { err.hidden = false; err.textContent = T('The free plan holds {max} items, so there’s room for {room}. Untick some, or see Plus.', { max: FREE_LIMIT, room: plural(room, 'more item') }); }
      ok = false;
    }
    return ok;
  }

  /* The items this add will save: one, or one per ticked receipt line. */
  function addItems() {
    const v = ui.add.values || {};
    if (!ui.add.lines) return [valuesToItem(v)];
    return ui.add.lines.filter((l) => l.keep).map((l) => valuesToItem(Object.assign({}, v, { name: l.name, category: l.category, price: l.price })));
  }

  function onReceiptFile(file) {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const begin = (image) => {
      /* With an account, the read-receipt Edge Function reads it with OpenAI. The local demo simulates it. */
      ui.add = cloud
        ? { stage: 'reading', image, fileName: file.name, values: {}, flags: {} }
        : { stage: 'reading', image, fileName: file.name, extracted: true, simulated: true,
            values: { name: 'Samsung 55" QLED TV QE55Q80D', merchant: 'Harvey Norman', category: 'electronics',
              price: 799, purchased: iso(addDays(today(), -1)), orderNo: 'HN-5520-118934', returnDays: 14 },
            flags: { name: T('The receipt says “{text}”. We guessed the full name. Check it’s right.', { text: 'SAMS QE55Q80D 55IN' }) } };
      if (cloud) readReceipt(file, ui.add);
      /* An empty vault offers the same choices, so move to the Add page if we're not on it. */
      if (route().name === 'add') paint('add'); else go('add');
    };
    if (!isImage) return begin(null);
    shrinkImage(file).then(begin).catch(() => begin(null));
  }

  /* Send the receipt to the read-receipt Edge Function and fill the form with what comes back.
     Whatever happens, the user lands on the details step: filled in, or empty to type by hand. */
  async function readReceipt(file, add) {
    let values = {}, flags = {}, lines = null, failed = null;
    try {
      const isPdf = file.type === 'application/pdf';
      if (!isPdf && !file.type.startsWith('image/')) throw new Error(T('We can read photos and PDFs.'));
      if (isPdf && file.size > 6 * 1048576) throw new Error(T('That PDF is too large to read.'));
      /* Small receipt print needs more pixels than the stored thumbnail keeps. */
      const data = isPdf ? await fileToDataUrl(file) : await shrinkImage(file, 2000, 0.85);
      const { data: r, error } = await cloud.functions.invoke(CFG.receiptFunction || 'read-receipt', { body: { file: data, fileName: file.name, today: iso(today()), lang } });
      if (error || !r || r.error) throw new Error(T('We couldn’t read that receipt.'));
      if (!r.isReceipt) throw new Error(T('That doesn’t look like a receipt.'));
      const date = /^\d{4}-\d{2}-\d{2}$/.test(r.purchased || '') && r.purchased <= iso(today()) ? r.purchased : '';
      values = {
        merchant: r.merchant || '', purchased: date, orderNo: r.orderNo || '',
        returnDays: RETURN_OPTIONS.includes(r.returnDays) ? r.returnDays : null,
      };
      /* Every product line on the receipt. An older function answered with one item at the top level. */
      const found = (Array.isArray(r.items) ? r.items : [r]).filter((l) => l && l.name).map((l) => ({
        name: l.name, category: CATS.some((c) => c.key === l.category) ? l.category : 'other',
        price: typeof l.price === 'number' ? l.price : '', keep: l.keep !== false, note: l.note || '',
      }));
      if (found.length > 1) lines = found;
      else if (found.length) {
        Object.assign(values, { name: found[0].name, category: found[0].category, price: found[0].price });
        if (found[0].note) flags.name = found[0].note;
      }
      (r.flags || []).forEach((f) => { if (FIELD_NAMES[f.field]) flags[f.field] = f.note; });
      /* The date field falls back to today, so say so rather than let it pass unnoticed. */
      if (!date) flags.purchased = flags.purchased || T('We couldn’t read the purchase date, so we put today. Check it’s right.');
      if (r.currency && r.currency !== 'EUR' && !flags.price) flags.price = T('The receipt is in {currency}, not euros. Check the price.', { currency: esc(r.currency) });
    } catch (e) {
      failed = (e && e.message) || T('We couldn’t read that receipt.');
    }
    /* The user may have left or started over while we were reading. */
    if (ui.add !== add || add.stage !== 'reading') return;
    Object.assign(add, { stage: 'details', values, flags, lines, extracted: !failed });
    if (route().name === 'add') paint('add');
    if (failed) toast(esc(failed) + ' ' + T('Fill in the details below.'));
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  /* Keep photos small enough for local storage. */
  function shrinkImage(file, max, quality) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, (max || 900) / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality || 0.72));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
  }

  /* ==========================================================================
     Settings: section sidebar + two-column rows
     ========================================================================== */
  const SETTINGS = labelled([
    { key: 'profile', label: 'Profile', icon: 'user', group: 'Account', tint: 'gray' },
    { key: 'password', label: 'Password', icon: 'key', group: 'Account', tint: 'gray' },
    { key: 'rules', label: 'Warranty rules', icon: 'shield', group: 'Warranties', tint: 'green' },
    { key: 'reminders', label: 'Reminders', icon: 'bell', group: 'Warranties', tint: 'red' },
    { key: 'plan', label: 'Plan', icon: 'card', group: 'Workspace', tint: 'blue' },
    { key: 'data', label: 'Your data', icon: 'database', group: 'Advanced', tint: 'indigo' },
    { key: 'danger', label: 'Danger zone', icon: 'alert', group: 'Advanced', tint: 'orange' },
  ]);

  function srow(title, desc, control) {
    return '<div class="srow"><div class="srow-label"><h2>' + title + '</h2>' + (desc ? '<p>' + desc + '</p>' : '') + '</div>' +
      '<div class="srow-control">' + control + '</div></div>';
  }

  function viewSettings(arg) {
    const key = SETTINGS.some((s) => s.key === arg) ? arg : 'profile';
    let groups = '';
    let last = '';
    SETTINGS.forEach((s) => {
      if (s.group !== last) { groups += (last ? '</div>' : '') + '<div class="snav-group"><p class="snav-head">' + T(s.group) + '</p>'; last = s.group; }
      groups += '<a href="#/settings/' + s.key + '"' + (s.key === key ? ' aria-current="page"' : '') + '><span class="set-ic tint-' + s.tint + '">' + icon(s.icon, 14) + '</span><span class="snav-label">' + s.label + '</span>' + icon('chevron', 12) + '</a>';
    });
    groups += '</div>';

    return {
      html: backLink() + '<header class="page-head"><h1 class="large-title">' + T('Settings') + '</h1></header>' +
        '<div class="settings">' +
        '<nav class="snav" aria-label="' + T('Settings sections') + '">' + groups + '</nav>' +
        '<div class="settings-body">' + SETTINGS_BODY[key]() + '</div>' +
      '</div>',
    };
  }

  const SETTINGS_BODY = {
    profile() {
      const a = state.account;
      return srow(T('Your profile'), T('How we greet you, and where reminders go.'),
          '<form class="form" id="profile-form" novalidate>' +
            '<div class="form-row">' + field({ name: 'first', label: T('First name'), value: a.first, attrs: ' autocomplete="given-name"' }) + field({ name: 'last', label: T('Last name'), value: a.last, attrs: ' autocomplete="family-name"' }) + '</div>' +
            field({ name: 'email', label: T('Email'), type: 'email', value: a.email, attrs: ' autocomplete="email" spellcheck="false"' }) +
            '<div class="form-actions">' + btn(T('Save changes'), null, { kind: 'primary', type: 'submit' }) + '</div>' +
          '</form>') +
        srow(T('Language'), T('For the app, your reminders and what we read from receipts.'), langPicker('set-lang')) +
        srow(T('Appearance'), T('Match your device, or pick one.'),
          '<div class="seg seg-fixed" role="radiogroup" aria-label="' + T('Theme') + '">' +
            [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map((o) =>
              '<button type="button" role="radio" data-action="theme" data-v="' + o[0] + '" aria-checked="' + (state.settings.theme === o[0]) + '">' + T(o[1]) + '</button>').join('') +
          '</div>');
    },
    password() {
      return srow(T('Change password'), T('Use at least 8 characters. You’ll stay logged in on this device.'),
        '<form class="form" id="password-form" novalidate>' +
          field({ name: 'current', label: T('Current password'), type: 'password', attrs: ' autocomplete="current-password"' }) +
          field({ name: 'next', label: T('New password'), type: 'password', attrs: ' autocomplete="new-password"' }) +
          '<div class="form-actions">' + btn(T('Update password'), null, { kind: 'primary', type: 'submit' }) + '</div>' +
        '</form>');
    },
    rules() {
      const s = state.settings;
      return srow(T('Where you shop'), REGIONS[s.region].note,
          field({ name: 'region', label: T('Region'), type: 'select', value: s.region, options: Object.keys(REGIONS).map((k) => ({ value: k, label: REGIONS[k].label })) })) +
        srow(T('Default return window'), T('Used when a receipt doesn’t mention one. Most online shops in the EU give at least 14 days.'),
          field({ name: 'returnDefault', label: T('Return window'), type: 'select', value: s.returnDays, options: [14, 30, 60].map((d) => ({ value: d, label: plural(d, 'day') })) })) +
        srow(T('Warranty by category'), T('Used when a receipt doesn’t say how long the warranty is. Items you’ve set yourself keep their own length.'),
          '<div class="card crows">' + CATS.map((c) =>
            '<div class="crow">' + catIcon(c.key) + '<label for="def-' + c.key + '">' + c.label + '</label>' +
            '<div class="select select-sm"><select id="def-' + c.key + '" data-default="' + c.key + '">' + WARRANTY_OPTIONS.map((m) =>
              '<option value="' + m + '"' + (s.defaults[c.key] === m ? ' selected' : '') + '>' + monthsLabel(m) + '</option>').join('') +
            '</select>' + icon('updown', 14) + '</div></div>').join('') + '</div>');
    },
    reminders() {
      const s = state.settings;
      return srow(T('When to remind you'), T('Reminders go out in the morning.'),
          '<div class="card switches">' +
            toggle('w30', s.remind.w30, T('30 days before a warranty ends'), T('Time to check it still works properly')) +
            toggle('w7', s.remind.w7, T('7 days before a warranty ends'), T('Last call to make a claim')) +
            toggle('r2', s.remind.r2, T('2 days before a return window closes'), T('In case you’ve changed your mind')) +
          '</div>') +
        srow(T('Where to send them'), T('Pick one or both.'),
          '<div class="card switches">' +
            toggle('device', s.device, T('This device'), T('Notifications from your browser or home screen app')) +
            toggle('emailCopy', s.emailCopy, T('Email'), esc(state.account.email)) +
          '</div>');
    },
    plan() {
      const plus = state.plan === 'plus';
      return srow(T('Current plan'), plus ? T('Thanks for supporting Warranty tracker.') : T('Upgrade any time. No payment is taken in this prototype.'),
        '<div class="card plan-card">' +
          '<div class="plan-line"><b>' + (plus ? 'Plus' : T('Free')) + '</b><span class="pill pill-' + (plus ? 'brand' : 'neutral') + '">' + (plus ? T('Active') : T('Current')) + '</span></div>' +
          '<p>' + (plus ? T('Unlimited items and PDF exports.') : T('{n} of {max} items. Plus adds unlimited items and PDF exports for {price} a month.', { n: state.items.length, max: FREE_LIMIT, price: money(3.5) })) + '</p>' +
          (plus ? btn(T('Switch to Free'), 'plan-free', { kind: 'gray', cls: 'btn-sm' }) : btn(T('Choose a plan'), 'show-plans', { kind: 'primary', cls: 'btn-sm' })) +
        '</div>');
    },
    data() {
      return srow(T('Download your data'), T('Every item and setting, as a JSON file.'), btn(T('Download'), 'download-json', { icon: 'download' })) +
        srow(T('Sample items'), T('Nine example receipts, to see how the vault works.'), btn(T('Add sample items'), 'load-samples', { icon: 'sparkle' }));
    },
    danger() {
      return srow(T('Delete all items'), T('Removes every item and saved receipt. Your account stays.'), btn(T('Delete all items'), 'delete-items', { kind: 'danger-tinted' })) +
        srow(T('Delete account'), T('Removes your account and everything in it. You’ll be logged out.'), btn(T('Delete account'), 'delete-account', { kind: 'danger' }));
    },
  };

  function showPlans(reason) {
    modal({
      title: typeof reason === 'string' ? reason : T('Choose a plan'),
      body:
        '<div class="plans">' +
          '<button type="button" class="plan" data-action="pick-plan" data-plan="month"><b>' + T('Monthly') + '</b><span class="plan-price num">' + money(3.5) + '</span><span class="weak">' + T('per month') + '</span></button>' +
          '<button type="button" class="plan is-best" data-action="pick-plan" data-plan="year"><span class="pill pill-brand plan-tag">' + T('Save {pct}%', { pct: 29 }) + '</span><b>' + T('Yearly') + '</b><span class="plan-price num">' + money(30) + '</span><span class="weak">' + T('per year') + '</span></button>' +
        '</div>' +
        '<ul class="plan-list"><li>' + icon('check', 14) + T('Unlimited items') + '</li><li>' + icon('check', 14) + T('PDF exports for claims and insurance') + '</li></ul>' +
        '<p class="modal-note">' + icon('alert', 14) + T('Prototype. No payment is taken.') + '</p>',
      actions: [{ label: T('Not now'), action: 'close-modal', kind: 'plain' }],
    });
  }

  /* ==========================================================================
     Export: a print view the browser saves as PDF
     ========================================================================== */
  function exportPdf(items, single) {
    if (state.plan !== 'plus') { showPlans(T('PDF export is part of Plus')); return; }
    const printed = fmtDate(today());
    let html;
    if (single) {
      const it = items[0], i = info(it);
      html = '<div class="p-page">' +
        '<header class="p-head"><p class="p-kicker">' + T('Warranty claim summary') + '</p><h1>' + esc(it.name) + '</h1><p class="p-muted">' + T('Prepared {date} by {name}', { date: printed, name: esc((state.account.first + ' ' + state.account.last).trim()) }) + '</p></header>' +
        '<table class="p-dl"><tbody>' +
          '<tr><th>' + T('Shop') + '</th><td>' + esc(it.merchant) + '</td></tr>' +
          '<tr><th>' + T('Order number') + '</th><td>' + esc(it.orderNo || T('Not recorded')) + '</td></tr>' +
          '<tr><th>' + T('Purchase date') + '</th><td>' + fmtDate(it.purchased) + '</td></tr>' +
          '<tr><th>' + T('Price paid') + '</th><td>' + money(it.price) + '</td></tr>' +
          '<tr><th>' + T('Warranty') + '</th><td>' + T('{time}, until {date}', { time: monthsLabel(i.months) + (it.warrantyNote ? ' (' + esc(it.warrantyNote) + ')' : ''), date: fmtDate(i.end) }) + '</td></tr>' +
          '<tr><th>' + T('Status on {date}', { date: printed }) + '</th><td>' + (i.status === 'expired' ? T('Expired {time} ago', { time: span(i.left) }) : T('Covered, {time} left', { time: span(i.left) })) + '</td></tr>' +
          (it.notes ? '<tr><th>' + T('Notes') + '</th><td>' + esc(it.notes) + '</td></tr>' : '') +
        '</tbody></table>' +
        '<h2>' + T('Proof of purchase') + '</h2>' +
        (it.photo ? '<img class="p-photo" src="' + it.photo + '" alt="" />' : it.fileName ? '<p>' + T('Receipt file: {file}', { file: esc(it.fileName) }) + '</p>' : '<p>' + T('No receipt attached.') + '</p>') +
        ((it.docs || []).length ? '<h2>' + T('Other documents') + '</h2><ul>' + it.docs.map((d) => '<li>' + esc(T(d.kind)) + ': ' + esc(d.name) + '</li>').join('') + '</ul>' : '') +
        '</div>';
    } else {
      html = '<div class="p-page">' +
        '<header class="p-head"><p class="p-kicker">' + T('Warranty summary') + '</p><h1>' + plural(items.length, 'item') + '</h1>' +
        '<p class="p-muted">' + T('Prepared {date} · total paid {total}', { date: printed, total: money(items.reduce((a, it) => a + Number(it.price || 0), 0)) }) + '</p></header>' +
        '<table class="p-table"><thead><tr><th>' + T('Item') + '</th><th>' + T('Bought') + '</th><th class="num">' + T('Paid') + '</th><th>' + T('Warranty until') + '</th></tr></thead><tbody>' +
        items.map((it) => {
          const i = info(it);
          return '<tr><td><b>' + esc(it.name) + '</b><br>' + esc(it.merchant) + (it.orderNo ? ' · ' + esc(it.orderNo) : '') + '</td>' +
            '<td>' + fmtDate(it.purchased) + '</td><td class="num">' + money(it.price) + '</td>' +
            '<td>' + fmtDate(i.end) + '<br><span class="p-muted">' + statusText(i) + '</span></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    $('#print').innerHTML = html;
    const title = document.title;
    document.title = single ? T('Claim summary - {name}', { name: items[0].name }) : T('Warranty summary {date}', { date: iso(today()) });
    setTimeout(() => { window.print(); document.title = title; }, 50);
  }

  /* ==========================================================================
     Modal + toast
     ========================================================================== */
  function modal(o) {
    closeModal(true);
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = '<div class="scrim" data-action="close-modal"></div>' +
      '<div class="modal' + (o.wide ? ' modal-wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
        '<header class="m-head"><h2 id="m-title">' + o.title + '</h2>' +
        '<button type="button" class="icon-btn" data-action="close-modal" aria-label="' + T('Close') + '">' + icon('x') + '</button></header>' +
        '<div class="m-body">' + o.body + '</div>' +
        (o.actions && o.actions.length ? '<footer class="m-foot">' + o.actions.map((a) => btn(a.label, a.action, { kind: a.kind, data: a.data })).join('') + '</footer>' : '') +
      '</div>';
    ui.modalFocus = document.activeElement;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('is-open')));
    /* Focus the first action: the primary one, or on a confirm, the safe way out. */
    const primary = $('.m-foot .btn-primary', wrap) || $('.m-foot .btn', wrap) || $('.m-head .icon-btn', wrap);
    if (primary) primary.focus();
  }

  function closeModal(instant) {
    const wrap = $('.modal-wrap:not(.is-closing)');
    if (!wrap) return;
    wrap.classList.remove('is-open');
    wrap.classList.add('is-closing');
    if (instant || reduceMotion) wrap.remove(); else setTimeout(() => wrap.remove(), 160);
    if (!instant && ui.modalFocus && document.contains(ui.modalFocus)) ui.modalFocus.focus({ preventScroll: true });
  }

  function confirmModal(o) {
    modal({
      title: o.title,
      body: '<p>' + o.text + '</p>',
      actions: [{ label: o.cancel, action: 'close-modal', kind: 'gray' }, { label: o.label, action: o.action, kind: 'danger', data: o.data }],
    });
  }

  function toast(msg, undo) {
    const region = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span>' + msg + '</span>' + (undo ? '<button type="button" class="toast-undo">' + T('Undo') + '</button>' : '');
    region.appendChild(el);
    let timer;
    const dismiss = () => {
      clearTimeout(timer);
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), reduceMotion ? 0 : 160);
    };
    const arm = () => { timer = setTimeout(dismiss, undo ? 6000 : 3500); };
    if (undo) $('.toast-undo', el).addEventListener('click', () => { undo(); dismiss(); });
    el.addEventListener('pointerenter', () => clearTimeout(timer));
    el.addEventListener('pointerleave', arm);
    el.addEventListener('focusin', () => clearTimeout(timer));
    el.addEventListener('focusout', arm);
    arm();
    while (region.children.length > 3) region.firstChild.remove();
  }

  /* ==========================================================================
     Actions
     ========================================================================== */
  function loadSamples() {
    const fresh = sampleItems().filter((s) => !findItem(s.id));
    if (!fresh.length) { toast(T('Sample items are already in your vault.')); return; }
    state.items = state.items.concat(fresh);
    state.banner = false;
    save();
    if (ui.base === 'vault') paint('vault'); else go('vault');
    toast(TN('{n} sample items added.', fresh.length));
  }

  const ACTIONS = {
    'toggle-pw': (el) => {
      const input = document.getElementById(el.dataset.for);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      el.setAttribute('aria-pressed', String(show));
      el.setAttribute('aria-label', show ? T('Hide password') : T('Show password'));
      el.innerHTML = icon(show ? 'eye' : 'eyeOff');
    },
    'user-menu': (el) => openUserMenu(el),
    'logout': async () => {
      closeUserMenu();
      closeDrawer();
      if (cloud) {
        await pushNow();
        await cloud.auth.signOut();
        leave();
        go('login');
        toast(T('You’re logged out.'));
        return;
      }
      state.session = false;
      save();
      go('login');
      toast(T('You’re logged out.'));
    },
    'dismiss-banner': () => { state.banner = false; save(); $('#banner').innerHTML = ''; },
    'load-samples': loadSamples,
    'close-drawer': () => go('vault'),
    'close-modal': () => closeModal(),
    'status-pick': (el) => {
      const v = el.dataset.v;
      ui.status = v === 'all' || ui.status === v ? 'all' : v;
      ui.showAll = ui.status !== 'all';
      paint('vault', null, true);
      const again = $('.ov-row[data-v="' + v + '"]') || $('.ov-row');
      if (again && el.tagName === 'BUTTON') again.focus({ preventScroll: true });
    },
    /* Inspect filters to what needs attention, then takes you down to the list. */
    'inspect': () => {
      ui.status = 'attention';
      ui.showAll = true;
      paint('vault', null, true);
      const list = $('#warranties');
      if (list) list.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const status = $('#flt-status');
      if (status) status.focus({ preventScroll: true });
    },
    'inspect-off': () => { ui.status = 'all'; ui.showAll = false; paint('vault', null, true); },
    'clear-filters': () => {
      ui.q = ''; ui.cat = 'all'; ui.merchant = 'all'; ui.showAll = false; ui.status = 'all';
      paint('vault');
    },
    'show-all': () => { ui.showAll = true; renderList(); },
    'edit': (el) => { ui.editing = el.dataset.id; openDrawer(el.dataset.id); },
    'cancel-edit': () => { ui.editing = null; refreshDrawer(); },
    'review-ok': (el) => {
      delete findItem(el.dataset.id).review;
      save();
      refreshDrawer();
      renderList();
      toast(T('Marked as checked.'));
    },
    'delete': (el) => {
      const it = findItem(el.dataset.id);
      confirmModal({
        title: T('Delete {name}?', { name: esc(it.name) }),
        text: T('This removes the item, its reminders and the saved receipt.'),
        label: T('Delete item'), cancel: T('Keep item'), action: 'delete-yes', data: { id: it.id },
      });
    },
    'delete-yes': (el) => {
      const idx = state.items.findIndex((x) => x.id === el.dataset.id);
      if (idx < 0) return;
      const [gone] = state.items.splice(idx, 1);
      save();
      closeModal(true);
      go('vault');
      toast(T('{name} deleted.', { name: esc(gone.name) }), () => {
        state.items.splice(idx, 0, gone);
        save();
        if (ui.base === 'vault') paint('vault', null, true);
      });
    },
    'view-proof': (el) => viewProof(findItem(el.dataset.id)),
    'export-one': (el) => exportPdf([findItem(el.dataset.id)], true),
    'export-all': () => exportPdf(filtered().map((x) => x.it), false),
    'add-manual': () => {
      ui.add = { stage: 'details', values: {}, flags: {}, extracted: false };
      if (route().name === 'add') paint('add'); else go('add');
    },
    'add-reset': () => { ui.add = null; paint('add'); },
    'add-back': () => {
      const a = ui.add;
      if (!a || a.stage === 'details') { ui.add = null; return paint('add'); }
      const form = $('#add-coverage');
      if (form) mergeStep(form);
      a.stage = a.stage === 'docs' ? 'coverage' : 'details';
      paint('add');
    },
    'doc-remove': (el) => {
      if (el.dataset.id) {
        const it = findItem(el.dataset.id);
        const idx = (it.docs || []).findIndex((d) => d.id === el.dataset.doc);
        if (idx < 0) return;
        const [gone] = it.docs.splice(idx, 1);
        save();
        refreshDrawer();
        toast(T('{name} removed.', { name: esc(gone.name) }), () => { it.docs.splice(idx, 0, gone); save(); refreshDrawer(); });
        return;
      }
      ui.add.docs = (ui.add.docs || []).filter((d) => d.id !== el.dataset.doc);
      renderAddDocs();
    },
    'show-plans': () => showPlans(),
    'pick-plan': (el) => {
      state.plan = 'plus';
      save();
      closeModal(true);
      toast(el.dataset.plan === 'year' ? T('You’re on Plus, billed yearly.') : T('You’re on Plus, billed monthly.'));
      if (ui.base === 'settings') paint('settings', ui.arg, true);
    },
    'plan-free': () => { state.plan = 'free'; save(); paint('settings', ui.arg, true); toast(T('You’re on the Free plan.')); },
    'theme': (el) => {
      state.settings.theme = el.dataset.v;
      save();
      applyTheme();
      $$('[data-action="theme"]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === el.dataset.v)));
    },
    'download-json': () => {
      const data = Object.assign({}, state, { account: Object.assign({}, state.account, { password: undefined }), uid: undefined, synced: undefined, syncedProfile: undefined });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'warranty-tracker-' + iso(today()) + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    'delete-items': () => confirmModal({
      title: T('Delete all {items}?', { items: plural(state.items.length, 'item') }),
      text: T('This removes every item, its reminders and saved receipts. Your account stays. This can’t be undone.'),
      label: T('Delete all items'), cancel: T('Keep items'), action: 'delete-items-yes',
    }),
    'delete-items-yes': () => {
      state.items = [];
      save();
      closeModal(true);
      paint('settings', ui.arg, true);
      toast(T('All items deleted.'));
    },
    'delete-account': () => confirmModal({
      title: T('Delete your account?'),
      text: T('This deletes your account, {items} and every saved receipt. It can’t be undone.', { items: plural(state.items.length, 'item') }),
      label: T('Delete account'), cancel: T('Keep account'), action: 'delete-account-yes',
    }),
    'delete-account-yes': async (el) => {
      if (cloud) {
        el.disabled = true;
        const { error } = await cloud.rpc('delete_account');
        if (error) { el.disabled = false; toast(T('Couldn’t delete your account.') + ' ' + cloudMessage(error)); return; }
        /* The account is already gone on the server, so this only clears the local session. */
        await cloud.auth.signOut({ scope: 'local' }).catch(() => {});
      }
      clearTimeout(sync.timer);
      const chosen = state.settings.lang;
      state = defaultState();
      state.settings.lang = chosen;
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      ui.add = null;
      closeModal(true);
      applyTheme();
      redirect('welcome');
      toast(T('Your account was deleted.'));
    },
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrap')) closeUserMenu();
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    /* Typing into a field with an error clears it; it's checked again on submit. */
    if (t.getAttribute('aria-invalid') === 'true') showError(t.id, '');
    if (t.classList.contains('search-input')) {
      ui.q = t.value;
      ui.showAll = false;
      t.closest('.search').classList.toggle('is-filled', !!t.value);
      $$('.search-input').forEach((el) => { if (el !== t) el.value = t.value; });
      if (ui.base !== 'vault') { ui.refocusSearch = true; go('vault'); } else renderList();
    }
    /* Live preview next to the sign-up form. */
    if (ui.base === 'signup' && (t.id === 'f-first' || t.id === 'f-last')) {
      const first = $('#f-first').value.trim();
      const last = $('#f-last').value.trim();
      $('#pv-hello').textContent = (first + ' ' + last).trim() || T('there');
      $('#pv-name').textContent = first ? T('{name}’s vault', { name: first }) : T('Your vault');
      $('#pv-initials').textContent = ((first[0] || '') + (last[0] || '')).toUpperCase() || 'A';
    }
    if (ui.base === 'signup' && t.id === 'f-email') {
      const ok = $('#email-ok');
      if (validEmail(t.value.trim())) { ok.hidden = false; $('span', ok).innerHTML = T('Reminders will go to {email}', { email: '<b>' + esc(t.value.trim()) + '</b>' }); }
      else ok.hidden = true;
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    /* A new language: redraw everything that's on screen in it. */
    if (t.hasAttribute('data-lang-pick')) {
      state.settings.lang = t.value;
      setLang(t.value);
      save();
      closeDrawer();
      render();
      const again = document.getElementById(t.id);
      if (again) again.focus();
      return;
    }
    if (t.id === 'flt-cat') { ui.cat = t.value; ui.showAll = false; renderList(); }
    if (t.id === 'flt-merchant') { ui.merchant = t.value; ui.showAll = false; renderList(); }
    /* Status also changes the greeting's Inspect / Show all button, so repaint in place. */
    if (t.id === 'flt-status') { ui.status = t.value; ui.showAll = t.value !== 'all'; paint('vault', null, true); $('#flt-status').focus(); }
    if (t.id === 'photo-input' || t.id === 'file-input') onReceiptFile(t.files[0]);
    if (/^keep-\d+$/.test(t.name || '')) {
      t.closest('.line').classList.toggle('is-off', !t.checked);
      const err = $('#f-lines-error');
      if (err && t.checked) err.hidden = true;
    }
    if (t.form && t.form.id === 'add-coverage' && ui.add) {
      mergeStep(t.form);
      $('#cov-preview').innerHTML = coveragePreview();
    }
    if (t.id === 'docs-input' && ui.add) {
      readDocs(t.files).then((docs) => { ui.add.docs = (ui.add.docs || []).concat(docs); renderAddDocs(); });
      t.value = '';
    }
    if (t.dataset.docKind && ui.add) {
      const d = (ui.add.docs || []).find((x) => x.id === t.dataset.docKind);
      if (d) d.kind = t.value;
    }
    if (t.dataset.attachDocs) {
      const it = findItem(t.dataset.attachDocs);
      const n = t.files.length;
      readDocs(t.files).then((docs) => { it.docs = (it.docs || []).concat(docs); save(); refreshDrawer(); toast(TN('{n} documents added.', n)); });
    }
    if (t.dataset.attach) {
      const it = findItem(t.dataset.attach);
      shrinkImage(t.files[0]).then((img) => { it.photo = img; save(); refreshDrawer(); toast(T('Photo added.')); });
    }
    if (t.dataset.default) {
      state.settings.defaults[t.dataset.default] = Number(t.value);
      save();
      toast(T('{category} now default to {time}.', { category: catLabel(t.dataset.default), time: monthsLabel(Number(t.value)) }));
    }
    if (t.name === 'region' && ui.base === 'settings') {
      state.settings.region = t.value;
      state.settings.defaults = defaultDefaults(t.value);
      save();
      paint('settings', 'rules', true);
      toast(T('Defaults set to {time} for {region}.', { time: monthsLabel(REGIONS[t.value].months), region: REGIONS[t.value].label }));
    }
    if (t.name === 'returnDefault') {
      state.settings.returnDays = Number(t.value);
      save();
      toast(T('Default return window is now {time}.', { time: plural(Number(t.value), 'day') }));
    }
    if (t.dataset.toggle) {
      const k = t.dataset.toggle;
      if (k === 'device' && t.checked && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((p) => {
          state.settings.device = p === 'granted';
          t.checked = state.settings.device;
          save();
          if (p !== 'granted') toast(T('Notifications are blocked. Allow them in your browser settings.'));
        });
        return;
      }
      if (k === 'device' || k === 'emailCopy') state.settings[k] = t.checked;
      else state.settings.remind[k] = t.checked;
      save();
      renderChrome(ui.base, ui.arg);
    }
  });

  /* Drop files on a drop zone: they go through its file input, like a browse. */
  document.addEventListener('dragover', (e) => {
    const z = e.target.closest && e.target.closest('.dropzone');
    if (!z) return;
    e.preventDefault();
    z.classList.add('is-over');
  });
  document.addEventListener('dragleave', (e) => {
    const z = e.target.closest && e.target.closest('.dropzone');
    if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over');
  });
  document.addEventListener('drop', (e) => {
    const z = e.target.closest && e.target.closest('.dropzone');
    if (!z) return;
    e.preventDefault();
    z.classList.remove('is-over');
    const input = $('input[type="file"]', z);
    if (!input || !e.dataTransfer.files.length) return;
    try { input.files = e.dataTransfer.files; } catch (err) { return; }
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  document.addEventListener('submit', async (e) => {
    const f = e.target;
    e.preventDefault();
    const val = (name) => { const el = f.elements[name]; return el ? el.value.trim() : ''; };

    if (f.id === 'signup-form') {
      ['f-password', 'f-email', 'f-first'].forEach((id) => showError(id, ''));
      let ok = true;
      if (f.elements.password.value.length < 8) { showError('f-password', T('Use at least 8 characters.')); ok = false; }
      if (!validEmail(val('email'))) { showError('f-email', T('Enter an email address, like name@example.com.')); ok = false; }
      else if (!cloud && state.account && state.account.email.toLowerCase() === val('email').toLowerCase()) {
        showError('f-email', T('An account with this email already exists.') + ' <a href="#/login">' + T('Log in instead') + '</a>'); ok = false;
      }
      if (!val('first')) { showError('f-first', T('Enter your first name.')); ok = false; }
      if (!ok) return;
      if (cloud) {
        const exists = T('An account with this email already exists.') + ' <a href="#/login">' + T('Log in instead') + '</a>';
        busy(f, true);
        const { data, error } = await cloud.auth.signUp({
          email: val('email'), password: f.elements.password.value,
          options: { data: { first: val('first'), last: val('last') }, emailRedirectTo: appUrl() },
        });
        busy(f, false);
        if (error) {
          if (error.code === 'user_already_exists' || error.code === 'email_exists') return showError('f-email', exists);
          if (error.code === 'weak_password') return showError('f-password', T('Choose a stronger password: longer, or mix in numbers and symbols.'));
          if (error.code === 'email_address_invalid') return showError('f-email', T('That email address can’t be used. Try another.'));
          return showError('f-password', cloudMessage(error));
        }
        /* With email confirmation on, an existing address comes back as a user with no identities. */
        if (data.user && data.user.identities && !data.user.identities.length) return showError('f-email', exists);
        if (!data.session) {
          const ok = $('#email-ok');
          ok.hidden = false;
          $('span', ok).innerHTML = '<b>' + T('Check your email.') + '</b> ' + T('We sent a link to {email}. Open it on this device to finish creating your account.', { email: esc(val('email')) });
          return;
        }
        await enter(data.session.user);
        go('vault');
        return;
      }
      const password = await hashPassword(f.elements.password.value);
      const theme = state.settings.theme;
      state = defaultState();
      state.settings.theme = theme;
      state.account = { first: val('first'), last: val('last'), email: val('email'), password };
      state.session = true;
      save();
      go('vault');
      return;
    }

    if (f.id === 'login-form') {
      showError('f-password', ''); showError('f-email', '');
      if (!validEmail(val('email'))) return showError('f-email', T('Enter an email address, like name@example.com.'));
      if (cloud) {
        if (!f.elements.password.value) return showError('f-password', T('Enter your password.'));
        busy(f, true);
        const { data, error } = await cloud.auth.signInWithPassword({ email: val('email'), password: f.elements.password.value });
        if (error) {
          busy(f, false);
          if (error.code === 'email_not_confirmed') return showError('f-email', T('Confirm your email first: open the link we sent when you signed up.'));
          if (error.code === 'invalid_credentials') return showError('f-password', T('That email and password don’t match. Try again or {link}.', { link: '<a href="#/forgot">' + T('reset your password') + '</a>' }));
          return showError('f-password', cloudMessage(error));
        }
        await enter(data.user);
        go('vault');
        toast(T('Welcome back, {name}.', { name: esc(state.account.first) }));
        return;
      }
      if (!state.account || state.account.email.toLowerCase() !== val('email').toLowerCase()) {
        return showError('f-email', T('We can’t find an account with that email. Check it, or {link}.', { link: '<a href="#/signup">' + T('create an account') + '</a>' }));
      }
      if (!f.elements.password.value) return showError('f-password', T('Enter your password.'));
      if ((await hashPassword(f.elements.password.value)) !== state.account.password) {
        return showError('f-password', T('That password isn’t right. Try again or {link}.', { link: '<a href="#/forgot">' + T('reset it') + '</a>' }));
      }
      state.session = true;
      save();
      go('vault');
      toast(T('Welcome back, {name}.', { name: esc(state.account.first) }));
      return;
    }

    if (f.id === 'forgot-form') {
      showError('f-email', '');
      if (!validEmail(val('email'))) return showError('f-email', T('Enter an email address, like name@example.com.'));
      if (cloud) {
        busy(f, true);
        const { error } = await cloud.auth.resetPasswordForEmail(val('email'), { redirectTo: appUrl() });
        busy(f, false);
        if (error) return showError('f-email', cloudMessage(error));
      }
      const ok = $('#forgot-ok');
      ok.hidden = false;
      $('span', ok).innerHTML = '<b>' + T('Check your email.') + '</b> ' + T('If an account exists for {email}, you’ll get a link to reset your password.', { email: esc(val('email')) }) + ' ' + (cloud ? T('Open it on this device.') : T('(Prototype: no email is sent.)'));
      $('#forgot-btn span').textContent = T('Send again');
      return;
    }

    if (f.id === 'reset-form') {
      showError('f-password', '');
      if (f.elements.password.value.length < 8) return showError('f-password', T('Use at least 8 characters.'));
      busy(f, true);
      const { error } = await cloud.auth.updateUser({ password: f.elements.password.value });
      busy(f, false);
      if (error) return showError('f-password', error.code === 'same_password' ? T('That’s your current password. Choose a new one.') : cloudMessage(error));
      ui.recovery = false;
      go('vault');
      toast(T('Password updated.'));
      return;
    }

    if (f.id === 'profile-form') {
      showError('f-first', ''); showError('f-email', '');
      if (!validEmail(val('email'))) return showError('f-email', T('Enter an email address, like name@example.com.'));
      if (!val('first')) return showError('f-first', T('Enter your first name.'));
      if (cloud) {
        const moved = val('email').toLowerCase() !== state.account.email.toLowerCase();
        busy(f, true);
        const { error } = await cloud.auth.updateUser(Object.assign({ data: { first: val('first'), last: val('last') } }, moved ? { email: val('email') } : {}));
        busy(f, false);
        if (error) {
          if (error.code === 'email_exists') return showError('f-email', T('Another account already uses this email.'));
          return showError('f-email', cloudMessage(error));
        }
        Object.assign(state.account, { first: val('first'), last: val('last') });
        writeLocal();
        renderChrome(ui.base, ui.arg);
        toast(moved ? T('Profile saved. To change your email, open the link we sent to {email}.', { email: esc(val('email')) }) : T('Profile saved.'));
        return;
      }
      Object.assign(state.account, { first: val('first'), last: val('last'), email: val('email') });
      save();
      renderChrome(ui.base, ui.arg);
      toast(T('Profile saved.'));
      return;
    }

    if (f.id === 'password-form') {
      showError('f-current', ''); showError('f-next', '');
      if (cloud) {
        if (f.elements.next.value.length < 8) return showError('f-next', T('Use at least 8 characters.'));
        busy(f, true);
        const check = await cloud.auth.signInWithPassword({ email: state.account.email, password: f.elements.current.value });
        if (check.error) { busy(f, false); return showError('f-current', check.error.code === 'invalid_credentials' ? T('That isn’t your current password.') : cloudMessage(check.error)); }
        const { error } = await cloud.auth.updateUser({ password: f.elements.next.value });
        busy(f, false);
        if (error) return showError('f-next', error.code === 'same_password' ? T('That’s your current password. Choose a new one.') : error.code === 'weak_password' ? T('Choose a stronger password.') : cloudMessage(error));
        f.reset();
        toast(T('Password updated.'));
        return;
      }
      if ((await hashPassword(f.elements.current.value)) !== state.account.password) return showError('f-current', T('That isn’t your current password.'));
      if (f.elements.next.value.length < 8) return showError('f-next', T('Use at least 8 characters.'));
      state.account.password = await hashPassword(f.elements.next.value);
      save();
      f.reset();
      toast(T('Password updated.'));
      return;
    }

    if (f.id === 'edit-form') {
      const it = findItem(f.dataset.id);
      const v = readForm(f);
      if (!validateItem(v)) return;
      delete v.priceRaw;
      Object.assign(it, v);
      if (it.warrantyMonths && it.warrantyNote) delete it.warrantyNote;
      delete it.review;
      save();
      ui.editing = null;
      refreshDrawer();
      renderList();
      toast(T('Changes saved.'));
      return;
    }

    if (f.id === 'add-details') {
      if (ui.add.lines) {
        const date = String(new FormData(f).get('purchased') || '');
        showError('f-purchased', date > iso(today()) ? T('The purchase date can’t be in the future.') : '');
        if (!readLines(f) || date > iso(today())) return;
        ['merchant', 'purchased', 'orderNo'].forEach((k) => { ui.add.values[k] = String(new FormData(f).get(k) || ''); });
        ui.add.stage = 'coverage';
        paint('add');
        return;
      }
      if (!validateItem(readForm(f))) return;
      mergeStep(f);
      ui.add.stage = 'coverage';
      paint('add');
      return;
    }

    if (f.id === 'add-coverage') {
      mergeStep(f);
      ui.add.stage = 'docs';
      paint('add');
      return;
    }

    if (f.id === 'add-docs') {
      /* Items from one receipt share it, its documents, and a receipt id that ties them together. */
      const list = addItems();
      const receipt = list.length > 1 ? uid() : null;
      const saved = list.map((v) => {
        const it = Object.assign({ id: uid(), added: iso(today()), source: ui.add.image ? 'photo' : ui.add.fileName ? 'upload' : 'manual' }, v);
        if (receipt) it.receipt = receipt;
        if (ui.add.image) it.photo = ui.add.image;
        else if (ui.add.fileName) it.fileName = ui.add.fileName;
        if ((ui.add.docs || []).length) it.docs = ui.add.docs;
        state.items.push(it);
        return it.id;
      });
      state.banner = false;
      save();
      ui.add = { stage: 'done', savedIds: saved };
      paint('add');
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && state.session) {
      const q = visibleSearchInput();
      if (q) { e.preventDefault(); q.focus(); q.select(); }
      return;
    }
    if (e.key === 'Escape') {
      if ($('.user-pop')) return closeUserMenu(true);
      if ($('.modal-wrap:not(.is-closing)')) return closeModal();
      if (ui.drawerId) {
        if (ui.editing) { ui.editing = null; return refreshDrawer(); }
        return go('vault');
      }
      const a = document.activeElement;
      if (a && a.classList.contains('search-input')) {
        /* First Esc clears the search, the next folds it away. */
        if (ui.q) {
          ui.q = '';
          $$('.search-input').forEach((el) => { el.value = ''; el.closest('.search').classList.remove('is-filled'); });
          renderList();
        } else a.blur();
      }
      return;
    }
    /* Keep Tab inside an open dialog. */
    if (e.key !== 'Tab') return;
    const box = $('.modal-wrap:not(.is-closing) .modal') || (ui.drawerId && $('.drawer'));
    if (!box) return;
    const f = $$('a[href], button:not([disabled]), input:not([type="hidden"]):not(.sr-only), select, textarea, [tabindex="0"]', box).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !box.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !box.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  });

  /* Leaving the add page drops a half-finished receipt. */
  window.addEventListener('hashchange', () => {
    closeUserMenu();
    if (route().name !== 'add') ui.add = null;
    render();
  });

  window.addEventListener('online', () => { if (cloud && state.session) pushNow(); });

  applyTheme();
  render();
  if (cloud) bootCloud();
})();
