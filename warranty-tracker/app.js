(function () {
  'use strict';

  /* ==========================================================================
     Basics
     ========================================================================== */
  const KEY = 'warranty-tracker-v2';
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
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  /* ==========================================================================
     Dates: everything is a local calendar day, stored as YYYY-MM-DD
     ========================================================================== */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    const base = d.getDate() + ' ' + MONTHS[d.getMonth()];
    const withYear = !(o && o.short) || d.getFullYear() !== today().getFullYear();
    return (o && o.weekday ? WEEKDAYS[d.getDay()] + ' ' : '') + base + (withYear ? ' ' + d.getFullYear() : '');
  }

  /* 412 -> "1 year 1 month" (long) or "1 yr 1 mo" (short) */
  function span(days, short) {
    days = Math.abs(days);
    if (days === 0) return short ? '0 days' : 'less than a day';
    if (days < 45) return plural(days, 'day');
    let months = Math.round(days / 30.44);
    if (months < 12) return short ? months + ' mo' : plural(months, 'month');
    const years = Math.floor(months / 12);
    months = months % 12;
    if (short) return years + ' yr' + (months ? ' ' + months + ' mo' : '');
    return plural(years, 'year') + (months ? ' ' + plural(months, 'month') : '');
  }

  function monthsLabel(m) { return m % 12 === 0 ? plural(m / 12, 'year') : plural(m, 'month'); }

  const moneyFmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
  const moneyWhole = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  function money(n) { n = Number(n) || 0; return Number.isInteger(n) ? moneyWhole.format(n) : moneyFmt.format(n); }

  /* ==========================================================================
     Reference data
     ========================================================================== */
  const CATS = [
    { key: 'electronics', label: 'Electronics' },
    { key: 'computers', label: 'Computers & phones' },
    { key: 'appliances', label: 'Appliances' },
    { key: 'kitchen', label: 'Kitchen' },
    { key: 'tools', label: 'Tools' },
    { key: 'furniture', label: 'Furniture' },
    { key: 'sports', label: 'Sports' },
    { key: 'other', label: 'Other' },
  ];
  const catLabel = (k) => (CATS.find((c) => c.key === k) || CATS[CATS.length - 1]).label;

  const REGIONS = {
    EU: { label: 'European Union', months: 24, note: 'EU law gives you at least 2 years on new goods.' },
    UK: { label: 'United Kingdom', months: 12, note: 'Most makers give 1 year. UK consumer law can cover faults for longer.' },
    US: { label: 'United States', months: 12, note: 'US warranties vary by maker and shop. Most give 1 year.' },
  };

  const WARRANTY_OPTIONS = [6, 12, 18, 24, 36, 48, 60, 120];
  const RETURN_OPTIONS = [0, 14, 30, 60, 90];
  const FIELD_NAMES = { name: 'Item name', merchant: 'Shop', price: 'Price', purchased: 'Purchase date', orderNo: 'Order number', category: 'Category' };

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
    updown: '<path d="m5 6 3-3 3 3M5 10l3 3 3-3"/>',
    mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="m2.5 4.5 5.5 4 5.5-4"/>',
    lock: '<rect x="3" y="7" width="10" height="6.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>',
    eye: '<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/>',
    eyeOff: '<path d="M2 2l12 12"/><path d="M6.6 4.2A6 6 0 0 1 8 3.5C12 3.5 14.5 8 14.5 8a11 11 0 0 1-1.7 2.2M10.7 11.6A6 6 0 0 1 8 12.5C4 12.5 1.5 8 1.5 8a11 11 0 0 1 2.4-2.9"/>',
    alert: '<path d="M8 2.5 14 13H2Z"/><path d="M8 6.5v3M8 11.2v.1"/>',
    clock: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/>',
    return: '<path d="M5.5 6.5 3 9l2.5 2.5"/><path d="M3 9h7a3 3 0 0 0 0-6H8"/>',
    file: '<path d="M4 2.5h5l3 3v8H4Z"/><path d="M9 2.5v3h3"/>',
    user: '<circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5a5 5 0 0 1 10 0"/>',
    key: '<circle cx="5.5" cy="10.5" r="3"/><path d="m7.6 8.4 5.4-5.4M11 5l1.5 1.5"/>',
    shield: '<path d="M8 2 13 4v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4Z"/>',
    card: '<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2 6.5h12M4.5 10h2"/>',
    database: '<ellipse cx="8" cy="4" rx="5" ry="1.8"/><path d="M3 4v8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V4M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8"/>',
    logout: '<path d="M6 13.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H6M10.5 11 13.5 8l-3-3M13.5 8H6"/>',
    sparkle: '<path d="M8 2.5 9.3 6.7 13.5 8 9.3 9.3 8 13.5 6.7 9.3 2.5 8l4.2-1.3Z"/>',
    electronics: '<path d="M3 11V8.5a5 5 0 0 1 10 0V11"/><rect x="2.5" y="9.5" width="2.5" height="4" rx="1"/><rect x="11" y="9.5" width="2.5" height="4" rx="1"/>',
    appliances: '<rect x="3" y="2" width="10" height="12" rx="1.5"/><circle cx="8" cy="9" r="2.75"/><path d="M5 4.5h1.5"/>',
    computers: '<rect x="3" y="3.5" width="10" height="7" rx="1"/><path d="M1.5 12.5h13"/>',
    kitchen: '<path d="M3 6.5h10v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"/><path d="M1.5 7.5H3M13 7.5h1.5M6 4V2.5M10 4V2.5"/>',
    tools: '<path d="M10.5 2.5a3 3 0 0 0-2.8 4L2.8 11.4a1.2 1.2 0 0 0 1.8 1.8l4.9-4.9a3 3 0 0 0 4-2.8l-1.8 1.8-1.8-.6-.6-1.8Z"/>',
    furniture: '<path d="M3.5 7V5.5A1.5 1.5 0 0 1 5 4h6a1.5 1.5 0 0 1 1.5 1.5V7"/><path d="M2 8a1 1 0 0 1 2 0v1.5h8V8a1 1 0 0 1 2 0v4H2Z"/><path d="M3.5 12v1.5M12.5 12v1.5"/>',
    sports: '<rect x="4.5" y="4.5" width="7" height="7" rx="2"/><path d="M6 4.5 6.5 2h3l.5 2.5M6 11.5l.5 2.5h3l.5-2.5"/>',
    other: '<path d="M2.5 5 8 2.5 13.5 5v6L8 13.5 2.5 11Z"/><path d="M2.5 5 8 7.5 13.5 5M8 7.5v6"/>',
  };
  function icon(name, size) {
    const s = size || 16;
    return '<svg class="i" width="' + s + '" height="' + s + '" viewBox="0 0 16 16" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  function logo(size) {
    const s = size || 28;
    return '<svg class="logo" width="' + s + '" height="' + s + '" viewBox="0 0 32 32" aria-hidden="true">' +
      '<path class="logo-body" d="M7 3.5h18a1.5 1.5 0 0 1 1.5 1.5v23.2l-3-2-3 2-3.5-2-3.5 2-3-2-3 2V5A1.5 1.5 0 0 1 7 3.5Z" />' +
      '<path class="logo-mark" d="m11 15.5 3.4 3.4L21.5 11.8" /></svg>';
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
      { id: 's2', name: 'Makita DHP485 cordless drill', merchant: 'Bauhaus', category: 'tools', price: 189, purchased: d(-5), orderNo: 'BH-88120457', returnDays: 14, fileName: 'bauhaus-rechnung.pdf',
        review: { orderNo: 'The order number was split over two lines on the receipt. Check it matches.' } },
      { id: 's3', name: 'Sony WH-1000XM6 headphones', merchant: 'MediaMarkt', category: 'electronics', price: 399, purchased: d(-12), orderNo: 'MM-1180-99231', returnDays: 30, fileName: 'mediamarkt-kassenbon.jpg' },
      { id: 's4', name: 'Bosch Serie 6 washing machine', merchant: 'Big Bang', category: 'appliances', price: 649, purchased: m(-24, 25), orderNo: '2024-118204', returnDays: 14, fileName: 'racun-2024-118204.pdf' },
      { id: 's5', name: 'Garmin Forerunner 265', merchant: 'Garmin', category: 'sports', price: 349.99, purchased: m(-24, 45), orderNo: 'GA-5521047', returnDays: 30, fileName: 'garmin-invoice.pdf',
        review: { price: 'The receipt shows €359.98 including €9.99 delivery. We saved the item price.' } },
      { id: 's6', name: 'MacBook Air 13" M4', merchant: 'Apple', category: 'computers', price: 1299, purchased: d(-330), orderNo: 'W1829340112', returnDays: 14, fileName: 'apple-receipt.pdf' },
      { id: 's7', name: 'IKEA KIVIK 3-seat sofa', merchant: 'IKEA', category: 'furniture', price: 899, purchased: d(-400), orderNo: '1284470331', returnDays: 90, warrantyMonths: 120,
        warrantyNote: 'IKEA’s 10-year guarantee', fileName: 'ikea-order.pdf' },
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
    };
  }

  function defaultState() {
    return { account: null, session: false, banner: false, plan: 'free', items: [], settings: defaultSettings() };
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
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked: keep going in memory */ }
  }

  /* Things that only live for this session. */
  const ui = {
    q: '', status: 'all', cat: 'all', merchant: 'all', sort: 'soonest',
    add: null, editing: null, base: null, drawerId: null,
  };

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
    document.documentElement.classList.toggle('dark', t === 'dark' || (t === 'system' && darkQuery.matches));
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
    if (i.status === 'expired') return 'Ended ' + span(i.left, short) + ' ago';
    if (i.status === 'expiring') return i.left === 0 ? 'Ends today' : 'Ends in ' + plural(i.left, 'day');
    return span(i.left, short) + ' left';
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

  const REMINDER_TEXT = {
    w30: 'Warranty ends in 30 days',
    w7: 'Warranty ends in 7 days',
    r2: 'Return window closes in 2 days',
  };

  function upcomingReminders() {
    const t = today();
    const horizon = addDays(t, 365);
    return state.items.flatMap(remindersFor).filter((r) => r.date >= t && r.date <= horizon).sort((a, b) => a.date - b.date);
  }

  function attention() {
    const out = [];
    state.items.forEach((it) => {
      const i = info(it);
      if (i.returnOpen && i.rLeft <= 7) out.push({ kind: 'return', it, i, sort: i.rLeft });
      if (i.left >= 0 && i.left <= 30) out.push({ kind: 'warranty', it, i, sort: i.left + 0.5 });
      const n = Object.keys(it.review || {}).length;
      if (n) out.push({ kind: 'review', it, i, n, sort: 100 });
    });
    return out.sort((a, b) => a.sort - b.sort);
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
    return '<button type="' + (o.type || 'button') + '" class="btn btn-' + (o.kind || 'secondary') + (o.cls ? ' ' + o.cls : '') + '"' +
      (action ? ' data-action="' + action + '"' : '') + attrs + (o.disabled ? ' disabled' : '') + (o.id ? ' id="' + o.id + '"' : '') + '>' +
      (o.icon ? icon(o.icon) : '') + '<span>' + label + '</span></button>';
  }

  function catIcon(key) { return '<span class="cat-ic" aria-hidden="true">' + icon(key) + '</span>'; }

  function coverage(i) {
    const frac = i.status === 'expired' ? 0 : Math.max(0.02, Math.min(1, i.left / i.total));
    return '<span class="cover cover-' + i.status + '" aria-hidden="true"><span style="transform:scaleX(' + frac.toFixed(3) + ')"></span></span>';
  }

  function statusPill(i) {
    const o = { active: ['success', 'Active', 'checkCircle'], expiring: ['warning', 'Ending soon', 'clock'], expired: ['neutral', 'Expired', ''] }[i.status];
    return '<span class="pill pill-' + o[0] + '">' + (o[2] ? icon(o[2], 12) : '') + o[1] + '</span>';
  }

  function returnPill(i) {
    if (!i.returnOpen) return '';
    return '<span class="pill pill-info">' + icon('return', 12) + 'Return by ' + fmtDate(i.rEnd, { short: true }) + '</span>';
  }

  function field(o) {
    const id = 'f-' + o.name;
    const flag = o.flag ? '<span class="pill pill-warning">' + icon('alert', 12) + 'Check this</span>' : '';
    let control;
    if (o.type === 'select') {
      control = '<div class="select"><select id="' + id + '" name="' + o.name + '">' +
        o.options.map((op) => '<option value="' + esc(op.value) + '"' + (String(op.value) === String(o.value) ? ' selected' : '') + '>' + esc(op.label) + '</option>').join('') +
        '</select>' + icon('updown', 14) + '</div>';
    } else if (o.type === 'textarea') {
      control = '<textarea class="input" id="' + id + '" name="' + o.name + '" rows="3" placeholder="' + esc(o.placeholder || '') + '">' + esc(o.value) + '</textarea>';
    } else if (o.type === 'password') {
      control = '<div class="input-wrap"><input class="input" id="' + id + '" name="' + o.name + '" type="password" value=""' + (o.attrs || '') + ' />' +
        '<button type="button" class="input-icon" data-action="toggle-pw" data-for="' + id + '" aria-label="Show password" aria-pressed="false">' + icon('eyeOff') + '</button></div>';
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

  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    return { name: parts[0] || '', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }
  function go(path) { location.hash = '#/' + path; }
  function redirect(path) { history.replaceState(null, '', '#/' + path); render(); }

  function render() {
    const r = route();
    if (!state.session) {
      if (!PUBLIC.includes(r.name)) return redirect(state.account ? 'login' : 'welcome');
    } else if (!r.name || PUBLIC.includes(r.name)) {
      return redirect('home');
    }

    if (r.name === 'item') {
      if (!findItem(r.arg)) return redirect('home');
      if (ui.base !== 'home') paint('home');
      openDrawer(r.arg);
      return;
    }
    const back = closeDrawer();
    const keep = back !== undefined && r.name === 'home' && ui.base === 'home';
    paint(r.name, r.arg, keep);
    if (keep && back) { const row = $('a[href="' + back + '"]', view); if (row) row.focus({ preventScroll: true }); }
  }

  const VIEWS = {
    welcome: viewWelcome, signup: viewSignup, login: viewLogin, forgot: viewForgot,
    home: viewHome, reminders: viewReminders, add: viewAdd, settings: viewSettings,
  };

  /* keep: repaint in place (after closing the drawer), without jumping to the top. */
  function paint(name, arg, keep) {
    const fn = VIEWS[name] || viewHome;
    const y = window.scrollY;
    const out = fn(arg);
    const app = !PUBLIC.includes(name);
    ui.base = name;
    ui.arg = arg;
    document.body.classList.toggle('is-app', app);
    $('#rail').hidden = !app;
    $('#topbar').hidden = !app;
    $('#tabbar').hidden = !app;
    view.className = 'main ' + (app ? 'main-app main-' + name : 'main-public');
    if (app) renderChrome(name, arg); else $('#banner').innerHTML = '';
    view.innerHTML = out.html;
    window.scrollTo(0, keep ? y : 0);
    if (out.after) out.after();
    if (ui.refocusSearch) {
      ui.refocusSearch = false;
      const q = $('#q');
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
     App chrome: icon rail, top bar, tab bar, banner
     ========================================================================== */
  const NAV = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'reminders', label: 'Reminders', icon: 'bell' },
    { key: 'add', label: 'Add receipt', icon: 'plusCircle' },
  ];

  function renderChrome(name, arg) {
    const soon = upcomingReminders().filter((r) => daysFrom(today(), r.date) <= 7).length;
    const dot = (k) => (k === 'reminders' && soon ? '<span class="dot-badge" aria-hidden="true"></span>' : '');
    const railLink = (n) => '<a href="#/' + n.key + '" class="rail-link"' + (n.key === name ? ' aria-current="page"' : '') +
      ' aria-label="' + n.label + (n.key === 'reminders' && soon ? ', ' + plural(soon, 'reminder') + ' this week' : '') + '" data-tip="' + n.label + '">' + icon(n.icon, 20) + dot(n.key) + '</a>';

    $('#rail').innerHTML =
      '<a class="rail-logo" href="#/home" aria-label="Warranty tracker, home">' + logo(28) + '</a>' +
      '<nav class="rail-group" aria-label="Main">' + NAV.map(railLink).join('') + '</nav>' +
      '<span class="rail-sep" aria-hidden="true"></span>' +
      '<nav class="rail-group" aria-label="Account">' + railLink({ key: 'settings', label: 'Settings', icon: 'sliders' }) + '</nav>';

    const crumbs = {
      reminders: ['Reminders'],
      add: ['Add receipt'],
      settings: ['Settings', (SETTINGS.find((s) => s.key === (arg || 'profile')) || SETTINGS[0]).label],
    }[name];
    const crumbHtml = crumbs
      ? '<nav class="crumbs" aria-label="Breadcrumb">' + crumbs.map((c, n) =>
          n < crumbs.length - 1 ? '<a href="#/' + name + '">' + c + '</a>' + icon('chevron', 14) : '<span aria-current="page">' + c + '</span>').join('') + '</nav>'
      : '';

    $('#topbar').innerHTML =
      '<a class="topbar-logo" href="#/home" aria-label="Warranty tracker, home">' + logo(24) + '</a>' +
      crumbHtml +
      '<div class="topbar-end">' +
        '<label class="search">' + icon('search') + '<span class="sr-only">Search receipts</span>' +
          '<input type="search" id="q" placeholder="Search" value="' + esc(ui.q) + '" autocomplete="off" />' +
          '<kbd>' + (isMac ? '⌘' : 'Ctrl ') + 'K</kbd></label>' +
        (name === 'add' ? '' : '<a class="btn btn-primary topbar-add" href="#/add">' + icon('plus') + '<span>Add receipt</span></a>') +
        '<div class="menu-wrap">' +
          '<button type="button" class="avatar" id="avatar-btn" data-action="user-menu" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu">' + esc(initials()) + '</button>' +
        '</div>' +
      '</div>';

    const tabs = [NAV[0], NAV[1], { key: 'add', label: 'Add', icon: 'plusCircle' }, { key: 'settings', label: 'Settings', icon: 'sliders' }];
    $('#tabbar').innerHTML = tabs.map((n) =>
      '<a href="#/' + n.key + '" class="tab"' + (n.key === name ? ' aria-current="page"' : '') + '>' +
      '<span class="tab-ic">' + icon(n.icon, 20) + dot(n.key) + '</span><span>' + n.label + '</span></a>').join('');

    $('#banner').innerHTML = state.banner
      ? '<div class="banner" role="status">' + icon('checkCircle') +
        '<p><b>Your vault is ready.</b> Add your first receipt, or explore with sample items.</p>' +
        '<button type="button" class="icon-btn" data-action="dismiss-banner" aria-label="Dismiss">' + icon('x') + '</button></div>'
      : '';
  }

  function openUserMenu() {
    const b = $('#avatar-btn');
    if ($('.user-pop')) return closeUserMenu();
    const a = state.account;
    const pop = document.createElement('div');
    pop.className = 'user-pop';
    pop.setAttribute('role', 'menu');
    pop.innerHTML =
      '<div class="user-head"><b>' + esc((a.first + ' ' + a.last).trim()) + '</b><span>' + esc(a.email) + '</span></div>' +
      '<a role="menuitem" href="#/settings/profile">' + icon('user') + 'Profile</a>' +
      '<a role="menuitem" href="#/settings/rules">' + icon('sliders') + 'Settings</a>' +
      '<span class="menu-sep"></span>' +
      '<button type="button" role="menuitem" data-action="logout">' + icon('logout') + 'Log out</button>';
    b.parentElement.appendChild(pop);
    b.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => pop.classList.add('is-open'));
    $('[role="menuitem"]', pop).focus();
  }
  function closeUserMenu(focusBack) {
    const pop = $('.user-pop');
    if (!pop) return;
    pop.remove();
    const b = $('#avatar-btn');
    if (b) { b.setAttribute('aria-expanded', 'false'); if (focusBack) b.focus(); }
  }

  /* ==========================================================================
     Public pages: landing, sign up, log in, reset password
     ========================================================================== */
  function publicNav(active) {
    return '<header class="pub-nav"><a class="pub-brand" href="#/welcome">' + logo(24) + '<span>Warranty tracker</span></a>' +
      '<div class="pub-actions">' +
        (active !== 'login' ? '<a class="btn btn-secondary" href="#/login">Log in</a>' : '') +
        (active !== 'signup' ? '<a class="btn btn-primary" href="#/signup">Get started</a>' : '') +
      '</div></header>';
  }

  function previewRows() {
    return [
      ['kitchen', 'Philips Airfryer XXL', 'Amazon.de', 'info', 'Return by 24 Sep'],
      ['appliances', 'Bosch washing machine', 'Big Bang', 'warning', 'Ends in 25 days'],
      ['computers', 'MacBook Air 13" M4', 'Apple', 'success', '1 yr 1 mo left'],
      ['furniture', 'IKEA KIVIK sofa', 'IKEA', 'success', '8 yr 11 mo left'],
    ].map((r) => '<div class="pv-row">' + catIcon(r[0]) + '<span class="pv-text"><b>' + r[1] + '</b><span>' + r[2] + '</span></span>' +
      '<span class="pill pill-' + r[3] + '">' + r[4] + '</span></div>').join('');
  }

  function viewWelcome() {
    return {
      html: publicNav() +
        '<section class="hero">' +
          '<div class="hero-copy">' +
            '<p class="eyebrow"><span>EU warranties</span><span class="mono">2 years minimum</span></p>' +
            '<h1 class="serif">Every receipt kept. Every warranty remembered.</h1>' +
            '<p class="hero-sub">Snap a receipt and we’ll note the warranty and return window, then remind you <b>before</b> either runs out.</p>' +
            '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/signup"><span>Get started</span>' + icon('chevron', 14) + '</a>' +
            '<a class="btn btn-secondary btn-lg" href="#/login">Log in</a></div>' +
          '</div>' +
          '<div class="hero-preview" aria-hidden="true">' +
            '<div class="pv-card">' +
              '<div class="pv-top"><span class="pv-greet">Good morning, Alex</span><span class="pv-search">' + icon('search', 12) + 'Search</span></div>' +
              '<div class="pv-stats"><div><span>Items</span><b>9</b></div><div><span>Still covered</span><b>€4,454</b></div><div><span>Ending soon</span><b>2</b></div></div>' +
              '<div class="pv-table">' + previewRows() + '</div>' +
            '</div>' +
          '</div>' +
        '</section>' +
        '<section class="features">' +
          '<div><span class="feat-ic">' + icon('camera') + '</span><h2>Snap the receipt</h2><p>Take a photo or upload the PDF. We read the shop, item, price and date.</p></div>' +
          '<div><span class="feat-ic">' + icon('bell') + '</span><h2>Get reminded in time</h2><p>30 and 7 days before a warranty ends, 2 days before a return window closes.</p></div>' +
          '<div><span class="feat-ic">' + icon('download') + '</span><h2>Ready for a claim</h2><p>The original receipt stays with each item. Export a PDF when you need it.</p></div>' +
        '</section>',
    };
  }

  function authShell(o) {
    return publicNav(o.active) +
      '<div class="auth' + (o.preview ? ' auth-split' : '') + '">' +
        '<section class="auth-col">' +
          '<div class="auth-logo">' + logo(40) + '</div>' +
          '<h1 class="auth-title">' + o.title + '</h1>' +
          '<p class="auth-sub">' + o.sub + '</p>' +
          o.body +
        '</section>' +
        (o.preview ? '<aside class="auth-preview" aria-hidden="true">' + o.preview + '</aside>' : '') +
      '</div>';
  }

  function skeletonPreview() {
    const bars = ['home', 'bell', 'plusCircle', 'sliders'].map((ic, n) =>
      '<div class="sk-nav">' + icon(ic) + '<span class="sk" style="width:' + [56, 72, 64, 52][n] + 'px"></span></div>').join('');
    return '<div class="sk-app">' +
      '<div class="sk-side"><div class="sk-org"><span class="sk-avatar" id="pv-initials">A</span><b id="pv-name">Your vault</b>' + icon('chevronDown') + '</div>' + bars + '</div>' +
      '<div class="sk-main"><p class="sk-hello">Hello, <span id="pv-hello">there</span></p><span class="sk sk-line"></span>' +
        '<div class="sk-card"></div><div class="sk-card sk-card-2"></div></div>' +
    '</div>';
  }

  function viewSignup() {
    return {
      html: authShell({
        active: 'signup',
        title: 'Get started with Warranty tracker',
        sub: 'Create an account to keep your receipts in one place',
        preview: skeletonPreview(),
        body:
          '<form class="form auth-form" id="signup-form" novalidate>' +
            '<div class="form-row">' +
              field({ name: 'first', label: 'First name', value: '', attrs: ' autocomplete="given-name"' }) +
              field({ name: 'last', label: 'Last name', value: '', attrs: ' autocomplete="family-name"' }) +
            '</div>' +
            field({ name: 'email', label: 'Email', type: 'email', value: '', placeholder: 'you@example.com', attrs: ' autocomplete="email"' }) +
            '<p class="inline-ok" id="email-ok" hidden>' + icon('checkCircle') + '<span></span></p>' +
            field({ name: 'password', label: 'Password', type: 'password', attrs: ' autocomplete="new-password"', hint: 'At least 8 characters.' }) +
            btn('Continue', null, { kind: 'primary', type: 'submit', cls: 'btn-block btn-lg' }) +
          '</form>' +
          '<p class="auth-foot">By signing up, you agree to the <a href="#/signup" class="link-muted">Terms of Service</a> and <a href="#/signup" class="link-muted">Privacy Policy</a>.</p>' +
          '<p class="auth-foot">Already have an account? <a href="#/login">Log in</a></p>',
      }),
      after: () => $('#f-first').focus(),
    };
  }

  function viewLogin() {
    return {
      html: authShell({
        active: 'login',
        title: 'Log in to Warranty tracker',
        sub: 'Welcome back. Enter your details to continue',
        body:
          '<form class="form auth-form" id="login-form" novalidate>' +
            field({ name: 'email', label: 'Email', type: 'email', value: state.account ? state.account.email : '', placeholder: 'you@example.com', attrs: ' autocomplete="email"' }) +
            field({ name: 'password', label: 'Password', type: 'password', attrs: ' autocomplete="current-password"', aside: '<a class="label-link" href="#/forgot">Forgot password?</a>' }) +
            btn('Continue', null, { kind: 'primary', type: 'submit', cls: 'btn-block btn-lg' }) +
          '</form>' +
          '<p class="auth-foot">New here? <a href="#/signup">Create an account</a></p>',
      }),
      after: () => { const f = state.account ? $('#f-password') : $('#f-email'); if (f) f.focus(); },
    };
  }

  function viewForgot() {
    return {
      html: authShell({
        active: 'login',
        title: 'Reset your password',
        sub: 'Enter your email and we’ll send you a link to set a new one',
        body:
          '<form class="form auth-form" id="forgot-form" novalidate>' +
            field({ name: 'email', label: 'Email', type: 'email', value: state.account ? state.account.email : '', placeholder: 'you@example.com', attrs: ' autocomplete="email"' }) +
            '<p class="inline-ok" id="forgot-ok" hidden>' + icon('checkCircle') + '<span></span></p>' +
            btn('Send reset link', null, { kind: 'primary', type: 'submit', cls: 'btn-block btn-lg', id: 'forgot-btn' }) +
          '</form>' +
          '<p class="auth-foot"><a href="#/login">Back to log in</a></p>',
      }),
      after: () => $('#f-email').focus(),
    };
  }

  /* ==========================================================================
     Home: greeting, summary, needs attention, items table
     ========================================================================== */
  function greeting() {
    const h = new Date().getHours();
    const part = h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    return part + ', ' + esc(state.account.first);
  }

  function viewHome() {
    const items = state.items;
    const head = '<header class="page-head"><h1>' + greeting() + '</h1></header>';

    if (!items.length) {
      return {
        html: head +
          '<section class="empty">' +
            '<p>No receipts yet. Add your first one and we’ll track its warranty and return window.</p>' +
            '<div class="empty-actions">' +
              '<a class="btn btn-primary" href="#/add">' + icon('plus') + '<span>Add receipt</span></a>' +
              btn('Try with sample items', 'load-samples', { icon: 'sparkle' }) +
            '</div>' +
          '</section>',
      };
    }

    const infos = items.map(info);
    const covered = items.filter((it, n) => infos[n].status !== 'expired').reduce((a, it) => a + Number(it.price || 0), 0);
    const ending = infos.filter((i) => i.status === 'expiring').length;
    const returns = infos.filter((i) => i.returnOpen).length;
    const att = attention();
    const merchants = Array.from(new Set(items.map((it) => it.merchant))).sort((a, b) => a.localeCompare(b));
    const cats = CATS.filter((c) => items.some((it) => it.category === c.key));

    const html = head +
      '<section class="stats" aria-label="Summary">' +
        '<div><span>Items</span><b>' + items.length + '</b></div>' +
        '<div><span>Still under warranty</span><b class="num">' + money(covered) + '</b></div>' +
        '<div><span>Ending in 60 days</span><b>' + ending + '</b></div>' +
        '<div><span>Return windows open</span><b>' + returns + '</b></div>' +
      '</section>' +

      (att.length ? '<section class="section" aria-labelledby="att-title"><div class="section-head"><h2 id="att-title">Needs attention</h2></div>' +
        '<ul class="list">' + att.slice(0, 5).map(attRow).join('') + '</ul></section>' : '') +

      '<section class="section" aria-labelledby="items-title">' +
        '<div class="section-head"><h2 id="items-title">Items</h2><div class="seg" role="group" aria-label="Status" id="seg"></div></div>' +
        '<div class="toolbar">' +
          '<div class="select select-sm"><label class="sr-only" for="flt-cat">Category</label><select id="flt-cat"><option value="all">All categories</option>' +
            cats.map((c) => '<option value="' + c.key + '"' + (ui.cat === c.key ? ' selected' : '') + '>' + c.label + '</option>').join('') + '</select>' + icon('updown', 14) + '</div>' +
          '<div class="select select-sm"><label class="sr-only" for="flt-merchant">Shop</label><select id="flt-merchant"><option value="all">All shops</option>' +
            merchants.map((m) => '<option' + (ui.merchant === m ? ' selected' : '') + '>' + esc(m) + '</option>').join('') + '</select>' + icon('updown', 14) + '</div>' +
          '<div class="select select-sm"><label class="sr-only" for="flt-sort">Sort</label><select id="flt-sort">' +
            [['soonest', 'Ending soonest'], ['newest', 'Newest purchase'], ['price', 'Highest price']].map((o) =>
              '<option value="' + o[0] + '"' + (ui.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>' + icon('updown', 14) + '</div>' +
          '<span class="toolbar-gap"></span>' +
          btn('Export PDF', 'export-all', { icon: 'download', cls: 'btn-sm' }) +
        '</div>' +
        '<div class="table" role="table" aria-label="Items">' +
          '<div class="thead" role="row"><span role="columnheader">Item</span><span role="columnheader">Status</span><span role="columnheader">Warranty</span><span role="columnheader" class="t-right">Price</span><span></span></div>' +
          '<div id="items" role="rowgroup"></div>' +
        '</div>' +
        '<p class="list-foot" id="list-foot"></p>' +
      '</section>' +
      (state.plan === 'free' ? '<p class="plan-note">' + items.length + ' of ' + FREE_LIMIT + ' items on the free plan. <a href="#/settings/plan">See Plus</a></p>' : '');

    return { html, after: renderList };
  }

  function attRow(a) {
    const it = a.it, i = a.i;
    let ic, tone, title, meta;
    if (a.kind === 'return') {
      ic = 'return'; tone = 'info';
      title = 'Return window closes ' + fmtDate(i.rEnd, { short: true, weekday: true });
      meta = i.rLeft === 0 ? 'Last day to return it' : plural(i.rLeft, 'day') + ' left';
    } else if (a.kind === 'warranty') {
      ic = 'clock'; tone = 'warning';
      title = 'Warranty ends ' + fmtDate(i.end, { short: true, weekday: true });
      meta = 'Check it still works properly';
    } else {
      ic = 'alert'; tone = 'warning';
      title = 'Check ' + plural(a.n, 'detail');
      meta = Object.keys(it.review).map((k) => FIELD_NAMES[k] || k).join(', ') + ' may be wrong';
    }
    return '<li><a class="lrow" href="#/item/' + it.id + '">' +
      '<span class="tone-ic tone-' + tone + '">' + icon(ic) + '</span>' +
      '<span class="lrow-text"><b>' + esc(it.name) + '</b><span>' + title + '</span></span>' +
      '<span class="lrow-meta">' + meta + '</span>' +
      icon('chevron') + '</a></li>';
  }

  function filtered() {
    const q = ui.q.trim().toLowerCase();
    let list = state.items.map((it) => ({ it, i: info(it) }));
    if (q) list = list.filter(({ it }) => [it.name, it.merchant, it.orderNo, catLabel(it.category), it.notes].join(' ').toLowerCase().includes(q));
    if (ui.cat !== 'all') list = list.filter(({ it }) => it.category === ui.cat);
    if (ui.merchant !== 'all') list = list.filter(({ it }) => it.merchant === ui.merchant);
    const counts = { all: list.length, active: 0, expiring: 0, expired: 0 };
    list.forEach(({ i }) => { counts[i.status]++; });
    if (ui.status !== 'all') list = list.filter(({ i }) => i.status === ui.status);

    const rank = { expiring: 0, active: 1, expired: 2 };
    list.sort((a, b) => {
      if (ui.sort === 'newest') return b.i.bought - a.i.bought;
      if (ui.sort === 'price') return b.it.price - a.it.price;
      if (rank[a.i.status] !== rank[b.i.status]) return rank[a.i.status] - rank[b.i.status];
      return a.i.status === 'expired' ? b.i.left - a.i.left : a.i.left - b.i.left;
    });
    return { list, counts };
  }

  function renderList() {
    const el = $('#items');
    if (!el) return;
    const { list, counts } = filtered();
    const segs = [['all', 'All'], ['active', 'Active'], ['expiring', 'Ending soon'], ['expired', 'Expired']];
    $('#seg').innerHTML = segs.map((s) =>
      '<button type="button" data-action="status" data-v="' + s[0] + '" aria-pressed="' + (ui.status === s[0]) + '">' + s[1] +
      '<span class="seg-n">' + counts[s[0]] + '</span></button>').join('');

    if (!list.length) {
      el.innerHTML = '<div class="t-empty">' + (ui.q ? 'No items match “' + esc(ui.q) + '”.' : 'No items match these filters.') + ' ' +
        '<button type="button" class="link-btn" data-action="clear-filters">Clear filters</button></div>';
      $('#list-foot').textContent = '';
      return;
    }

    el.innerHTML = list.map(({ it, i }) =>
      '<a class="trow" role="row" href="#/item/' + it.id + '">' +
        '<span class="t-item" role="cell">' + catIcon(it.category) +
          '<span class="t-text"><b>' + esc(it.name) + (it.review && Object.keys(it.review).length ? '<span class="flag-dot" title="Has details to check"></span>' : '') + '</b>' +
          '<span>' + esc(it.merchant) + ' · ' + fmtDate(it.purchased, { short: true }) + '</span></span></span>' +
        '<span class="t-status" role="cell">' + statusPill(i) + returnPill(i) + '</span>' +
        '<span class="t-cover" role="cell"><span class="t-cover-text status-' + i.status + '">' + statusText(i, true) + '</span>' + coverage(i) +
          '<span class="t-until mono">' + (i.status === 'expired' ? 'ended ' : 'until ') + fmtDate(i.end, { short: true }) + '</span></span>' +
        '<span class="t-price num" role="cell">' + money(it.price) + '</span>' +
        '<span class="t-go" aria-hidden="true">' + icon('chevron') + '</span>' +
      '</a>').join('');
    $('#list-foot').textContent = list.length === state.items.length ? '' : 'Showing ' + list.length + ' of ' + state.items.length;
  }

  /* ==========================================================================
     Item drawer
     ========================================================================== */
  function openDrawer(id) {
    const it = findItem(id);
    let wrap = $('.drawer-wrap', overlay);
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
    const wrap = $('.drawer-wrap', overlay);
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

  function timeline(i) {
    const t = today();
    const pct = (d) => Math.max(0, Math.min(100, (daysFrom(i.bought, d) / i.total) * 100));
    const todayPct = pct(t);
    const retPct = i.rDays > 0 ? Math.max(1.2, pct(i.rEnd)) : 0;
    const align = todayPct < 12 ? 'start' : todayPct > 88 ? 'end' : 'mid';
    return '<div class="tl tl-' + i.status + '" aria-hidden="true">' +
      '<div class="tl-track">' +
        '<span class="tl-used" style="width:' + todayPct + '%"></span>' +
        (retPct ? '<span class="tl-return' + (i.returnOpen ? ' is-open' : '') + '" style="width:' + retPct + '%"></span>' : '') +
        '<span class="tl-today tl-today-' + align + '" style="left:' + todayPct + '%"><span>Today</span></span>' +
      '</div>' +
      '<div class="tl-labels"><span><b>Bought</b>' + fmtDate(i.bought) + '</span>' +
        '<span class="tl-end"><b>' + (i.status === 'expired' ? 'Ended' : 'Ends') + '</b>' + fmtDate(i.end) + '</span></div>' +
    '</div>';
  }

  function drawerDetail(it) {
    const i = info(it);
    const flags = Object.keys(it.review || {});
    const head = i.status === 'expired' ? 'Warranty ended ' + span(i.left) + ' ago'
      : i.left === 0 ? 'Warranty ends today' : span(i.left) + ' of warranty left';
    const sub = i.status === 'expired'
      ? 'It ended on ' + fmtDate(i.end, { weekday: true }) + '. The maker may still repair it for a fee.'
      : i.status === 'expiring'
        ? 'Covered until ' + fmtDate(i.end, { weekday: true }) + '. Check it works properly now, and claim before then if anything’s wrong.'
        : 'Covered until ' + fmtDate(i.end, { weekday: true }) + '.';
    const warrantySource = it.warrantyNote ? esc(it.warrantyNote) : !it.warrantyMonths ? 'Default for ' + catLabel(it.category).toLowerCase() : 'Set by you';
    const rems = remindersFor(it).sort((a, b) => a.date - b.date);
    const t = today();

    return '<header class="d-head">' +
        '<div class="d-top"><span class="d-cat">' + catIcon(it.category) + catLabel(it.category) + '</span>' +
          '<button type="button" class="icon-btn" data-action="close-drawer" aria-label="Close">' + icon('x') + '</button></div>' +
        '<h2 id="d-title" class="d-title">' + esc(it.name) + '</h2>' +
        '<p class="d-sub">' + esc(it.merchant) + (it.orderNo ? ' · <span class="mono">' + esc(it.orderNo) + '</span>' : '') + '</p>' +
      '</header>' +
      '<div class="d-body">' +
        (flags.length ? '<section class="callout callout-warning">' + icon('alert') + '<div>' +
          '<p class="callout-title">Check ' + (flags.length === 1 ? 'this detail' : 'these details') + '</p>' +
          flags.map((f) => '<p>' + (FIELD_NAMES[f] || f) + ': ' + esc(it.review[f]) + '</p>').join('') +
          '<div class="callout-actions">' + btn('Looks right', 'review-ok', { cls: 'btn-sm', data: { id: it.id } }) +
          btn('Edit', 'edit', { kind: 'ghost', cls: 'btn-sm', data: { id: it.id } }) + '</div></div></section>' : '') +

        '<section class="d-status">' +
          '<div class="d-pills">' + statusPill(i) + returnPill(i) + '</div>' +
          '<p class="d-big">' + head + '</p>' +
          '<p class="d-muted">' + sub + '</p>' +
          timeline(i) +
          (i.returnOpen ? '<p class="inline-info">' + icon('return') + '<span>Changed your mind? You can return it until <b>' + fmtDate(i.rEnd, { weekday: true }) + '</b>, ' +
            (i.rLeft === 0 ? 'today is the last day.' : plural(i.rLeft, 'day') + ' from now.') + '</span></p>' : '') +
        '</section>' +

        '<section class="d-sec"><h3>Details</h3><dl class="dl">' +
          '<div><dt>Price paid</dt><dd class="num">' + money(it.price) + '</dd></div>' +
          '<div><dt>Bought</dt><dd>' + fmtDate(it.purchased) + '</dd></div>' +
          '<div><dt>Shop</dt><dd>' + esc(it.merchant) + '</dd></div>' +
          '<div><dt>Order number</dt><dd class="mono">' + (it.orderNo ? esc(it.orderNo) : '<span class="weak">Not recorded</span>') + '</dd></div>' +
          '<div><dt>Warranty</dt><dd>' + monthsLabel(i.months) + '<span class="dd-sub">' + warrantySource + '</span></dd></div>' +
          '<div><dt>Return window</dt><dd>' + (i.rDays ? plural(i.rDays, 'day') : 'None') + '<span class="dd-sub">' + (it.returnDays == null ? 'Your default' : 'Shop’s return policy') + '</span></dd></div>' +
          (it.notes ? '<div><dt>Notes</dt><dd>' + esc(it.notes) + '</dd></div>' : '') +
        '</dl></section>' +

        '<section class="d-sec"><h3>Reminders</h3>' +
          (rems.length ? '<ul class="rem-list">' + rems.map((r) => {
            const past = r.date < t;
            return '<li class="' + (past ? 'is-past' : '') + '">' + icon(past ? 'check' : 'bell') +
              '<span>' + REMINDER_TEXT[r.kind] + '</span><span class="mono">' + (past ? 'Sent ' : '') + fmtDate(r.date, { short: true }) + '</span></li>';
          }).join('') + '</ul>' : '<p class="d-muted">Reminders are off. <a href="#/settings/reminders">Turn them on in Settings</a></p>') +
        '</section>' +

        '<section class="d-sec"><h3>Receipt</h3>' + proofCard(it) + '</section>' +
      '</div>' +
      '<footer class="d-foot">' +
        btn('Export for a claim', 'export-one', { kind: 'primary', icon: 'download', data: { id: it.id } }) +
        btn('Edit', 'edit', { icon: 'pencil', data: { id: it.id } }) +
        '<button type="button" class="icon-btn icon-btn-danger" data-action="delete" data-id="' + it.id + '" aria-label="Delete ' + esc(it.name) + '">' + icon('trash') + '</button>' +
      '</footer>';
  }

  function proofCard(it) {
    if (it.photo) {
      return '<button type="button" class="proof proof-photo" data-action="view-proof" data-id="' + it.id + '">' +
        '<img src="' + it.photo + '" alt="" /><span class="proof-cap">' + icon('camera') + 'Photo of receipt · added ' + fmtDate(it.added || it.purchased) + '</span></button>';
    }
    if (it.fileName) {
      return '<button type="button" class="proof" data-action="view-proof" data-id="' + it.id + '">' +
        '<span class="proof-ic">' + icon('file') + '</span>' +
        '<span class="proof-text"><b class="mono">' + esc(it.fileName) + '</b><span>Uploaded ' + fmtDate(it.added || it.purchased) + '</span></span>' +
        icon('chevron') + '</button>';
    }
    return '<p class="d-muted">No receipt attached. Add a photo so you have proof if you need to claim.</p>' +
      '<label class="btn btn-secondary btn-sm file-btn">' + icon('camera') + '<span>Add a photo</span>' +
      '<input type="file" accept="image/*" capture="environment" data-attach="' + it.id + '" /></label>';
  }

  function viewProof(it) {
    const body = it.photo
      ? '<img class="proof-full" src="' + it.photo + '" alt="Photo of the receipt for ' + esc(it.name) + '" />'
      : '<article class="receipt">' +
          '<header><p class="mono">' + esc(it.fileName) + '</p><h3>' + esc(it.merchant) + '</h3><p>' + fmtDate(it.purchased, { weekday: true }) + '</p></header>' +
          '<table><tbody>' +
            '<tr><td>' + esc(it.name) + '<br><span class="weak">Qty 1</span></td><td class="num">' + money(it.price) + '</td></tr>' +
            (it.review && it.review.price ? '<tr><td>Delivery</td><td class="num">€9.99</td></tr>' : '') +
            '<tr class="receipt-total"><td>Total paid</td><td class="num">' + money(it.review && it.review.price ? Number(it.price) + 9.99 : it.price) + '</td></tr>' +
          '</tbody></table>' +
          '<p class="mono weak">Order ' + esc(it.orderNo || '—') + '</p>' +
        '</article>';
    modal({
      title: it.photo ? 'Receipt photo' : 'Receipt',
      body: body + '<p class="modal-note">' + icon('lock', 14) + 'Stored with this item. Only you can see it.</p>',
      actions: [{ label: 'Close', action: 'close-modal' }],
      wide: true,
    });
  }

  function itemForm(v, flags) {
    flags = flags || {};
    const catDefault = state.settings.defaults[v.category || 'electronics'];
    return '<div class="form-grid">' +
      field({ name: 'name', label: 'Item', value: v.name || '', placeholder: 'e.g. Bosch dishwasher', flag: flags.name, wide: true }) +
      field({ name: 'merchant', label: 'Shop', value: v.merchant || '', placeholder: 'e.g. MediaMarkt', flag: flags.merchant }) +
      field({ name: 'category', label: 'Category', type: 'select', value: v.category || 'electronics', options: CATS.map((c) => ({ value: c.key, label: c.label })), flag: flags.category }) +
      field({ name: 'price', label: 'Price paid (€)', value: v.price != null && v.price !== '' ? String(v.price) : '', placeholder: '0.00', attrs: ' inputmode="decimal"', flag: flags.price }) +
      field({ name: 'purchased', label: 'Purchase date', type: 'date', value: v.purchased || iso(today()), attrs: ' max="' + iso(today()) + '"', flag: flags.purchased }) +
      field({ name: 'orderNo', label: 'Order number', value: v.orderNo || '', placeholder: 'Optional', flag: flags.orderNo }) +
      field({ name: 'warrantyMonths', label: 'Warranty', type: 'select', value: v.warrantyMonths || '',
        options: [{ value: '', label: 'Default (' + monthsLabel(catDefault) + ')' }].concat(WARRANTY_OPTIONS.map((m) => ({ value: m, label: monthsLabel(m) }))) }) +
      field({ name: 'returnDays', label: 'Return window', type: 'select', value: v.returnDays == null ? '' : v.returnDays,
        options: [{ value: '', label: 'Default (' + plural(state.settings.returnDays, 'day') + ')' }].concat(RETURN_OPTIONS.map((d) => ({ value: d, label: d ? plural(d, 'day') : 'No returns' }))) }) +
      field({ name: 'notes', label: 'Notes', type: 'textarea', value: v.notes || '', placeholder: 'Serial number, where it’s kept, anything useful for a claim', wide: true }) +
    '</div>';
  }

  function readForm(form) {
    const f = new FormData(form);
    const raw = String(f.get('price') || '').trim();
    const price = parseFloat(raw.replace(/[€\s]/g, '').replace(',', '.'));
    return {
      name: String(f.get('name') || '').trim(),
      merchant: String(f.get('merchant') || '').trim() || 'Unknown shop',
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

  /* Errors are set bottom-up so focus lands on the first bad field. */
  function validateItem(v) {
    let ok = true;
    ['f-purchased', 'f-price', 'f-name'].forEach((id) => showError(id, ''));
    if (v.purchased > iso(today())) { showError('f-purchased', 'The purchase date can’t be in the future.'); ok = false; }
    if (v.priceRaw && isNaN(parseFloat(v.priceRaw.replace(/[€\s]/g, '').replace(',', '.')))) { showError('f-price', 'Enter the price as a number, like 249.99.'); ok = false; }
    if (!v.name) { showError('f-name', 'Enter what you bought, so you can find it later.'); ok = false; }
    return ok;
  }

  function drawerEdit(it) {
    return '<header class="d-head">' +
        '<div class="d-top"><span class="d-cat">Edit item</span>' +
          '<button type="button" class="icon-btn" data-action="close-drawer" aria-label="Close">' + icon('x') + '</button></div>' +
        '<h2 id="d-title" class="d-title">' + esc(it.name) + '</h2>' +
      '</header>' +
      '<form class="d-body form" id="edit-form" data-id="' + it.id + '" novalidate>' + itemForm(it, it.review) + '</form>' +
      '<footer class="d-foot">' +
        '<button type="submit" form="edit-form" class="btn btn-primary"><span>Save changes</span></button>' +
        btn('Cancel', 'cancel-edit', { kind: 'ghost' }) +
      '</footer>';
  }

  /* ==========================================================================
     Reminders
     ========================================================================== */
  function reminderSummary() {
    const r = state.settings.remind;
    const w = [r.w30 && '30', r.w7 && '7'].filter(Boolean);
    const parts = [];
    if (w.length) parts.push(w.join(' and ') + ' days before a warranty ends');
    if (r.r2) parts.push('2 days before a return window closes');
    return parts.join(', and ');
  }

  function viewReminders() {
    const list = upcomingReminders();
    const t = today();
    const r = state.settings.remind;
    const on = r.w30 || r.w7 || r.r2;
    const groups = [
      { title: 'This week', test: (d) => d <= 7 },
      { title: 'This month', test: (d) => d > 7 && d <= 31 },
      { title: 'Next 3 months', test: (d) => d > 31 && d <= 92 },
      { title: 'Later', test: (d) => d > 92 },
    ];
    const emptyLine = (text, cta) => '<section class="empty"><p>' + text + '</p>' + (cta ? '<div class="empty-actions">' + cta + '</div>' : '') + '</section>';

    const body = !state.items.length
      ? emptyLine('No reminders yet. Add a receipt and its reminders show up here.', '<a class="btn btn-primary" href="#/add">' + icon('plus') + '<span>Add receipt</span></a>')
      : !on
        ? emptyLine('Reminders are off.', '<a class="btn btn-secondary" href="#/settings/reminders">Turn on reminders</a>')
        : !list.length
          ? emptyLine('Nothing coming up in the next 12 months.')
          : groups.map((g) => {
              const rows = list.filter((x) => g.test(daysFrom(t, x.date)));
              if (!rows.length) return '';
              return '<section class="section"><div class="section-head"><h2>' + g.title + '</h2></div><ul class="list">' + rows.map((x) => {
                const d = daysFrom(t, x.date);
                const deadline = x.kind === 'r2' ? x.info.rEnd : x.info.end;
                return '<li><a class="lrow" href="#/item/' + x.item.id + '">' +
                  '<span class="date-chip' + (d <= 7 ? ' is-soon' : '') + '"><span>' + MONTHS[x.date.getMonth()] + '</span><b>' + x.date.getDate() + '</b></span>' +
                  '<span class="lrow-text"><b>' + esc(x.item.name) + '</b><span>' + (x.kind === 'r2' ? 'Return window closes ' : 'Warranty ends ') + fmtDate(deadline, { short: true, weekday: true }) + '</span></span>' +
                  '<span class="lrow-meta">' + (d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : 'In ' + span(d, true)) + '</span>' +
                  icon('chevron') + '</a></li>';
              }).join('') + '</ul></section>';
            }).join('');

    return {
      html: '<header class="page-head page-head-row"><div><h1>Reminders</h1>' +
        (on ? '<p>We remind you ' + reminderSummary() + '.</p>' : '') + '</div>' +
        '<a class="btn btn-secondary" href="#/settings/reminders">' + icon('sliders') + '<span>Change</span></a></header>' + body,
    };
  }

  /* ==========================================================================
     Add a receipt
     ========================================================================== */
  function viewAdd() {
    const a = ui.add || { stage: 'choose' };
    const head = '<header class="page-head"><h1>Add a receipt</h1><p>We’ll read the details and track the warranty and return window.</p></header>';

    if (state.plan === 'free' && state.items.length >= FREE_LIMIT) {
      return {
        html: head + '<section class="empty"><p>Your vault is full. The free plan holds ' + FREE_LIMIT + ' items.</p>' +
          '<div class="empty-actions">' + btn('See Plus', 'show-plans', { kind: 'primary' }) + '</div></section>',
      };
    }

    if (a.stage === 'choose') {
      return {
        html: head +
          '<div class="add-choices">' +
            '<label class="add-choice"><span class="add-ic">' + icon('camera', 20) + '</span>' +
              '<span class="add-text"><b>Take a photo</b><span>Point your camera at a paper receipt</span></span>' +
              '<input type="file" accept="image/*" capture="environment" id="photo-input" class="sr-only" /></label>' +
            '<label class="add-choice"><span class="add-ic">' + icon('upload', 20) + '</span>' +
              '<span class="add-text"><b>Upload a file</b><span>PDF invoice or a screenshot</span></span>' +
              '<input type="file" accept="image/*,application/pdf" id="file-input" class="sr-only" /></label>' +
            '<button type="button" class="add-choice" data-action="add-manual"><span class="add-ic">' + icon('pencil', 20) + '</span>' +
              '<span class="add-text"><b>Enter details</b><span>No receipt to hand? Type it in</span></span></button>' +
          '</div>',
      };
    }

    if (a.stage === 'reading') {
      return {
        html: head +
          '<section class="reading">' +
            '<div class="reading-img">' + (a.image ? '<img src="' + a.image + '" alt="Your receipt" />' : '<span class="reading-file">' + icon('file', 24) + '<span class="mono">' + esc(a.fileName || '') + '</span></span>') +
              '<span class="scanline" aria-hidden="true"></span></div>' +
            '<p class="reading-text" role="status"><span class="spinner" aria-hidden="true"></span>Reading your receipt…</p>' +
          '</section>',
        after: () => {
          setTimeout(() => {
            if (!ui.add || ui.add.stage !== 'reading') return;
            ui.add.stage = 'form';
            if (route().name === 'add') paint('add');
          }, reduceMotion ? 300 : 1600);
        },
      };
    }

    const flags = a.flags || {};
    const flagCount = Object.keys(flags).length;
    return {
      html: head +
        '<div class="add-form-wrap">' +
          (a.image ? '<aside class="add-thumb"><img src="' + a.image + '" alt="Your receipt" /></aside>' : '') +
          '<form class="card form add-form" id="add-form" novalidate>' +
            (a.extracted ? '<p class="inline-ok">' + icon('checkCircle') + '<span><b>We read your receipt.</b> ' +
              (flagCount ? 'Check the field marked below, then save.' : 'Check the details, then save.') + '</span></p>' : '') +
            (flagCount ? '<p class="callout callout-warning">' + icon('alert') + '<span>' + Object.keys(flags).map((k) => esc(flags[k])).join(' ') + '</span></p>' : '') +
            itemForm(a.values || {}, flags) +
            '<div class="form-actions">' +
              btn('Start over', 'add-reset', { kind: 'ghost' }) +
              btn('Save to vault', null, { kind: 'primary', type: 'submit' }) +
            '</div>' +
            (a.extracted ? '<p class="fineprint">Prototype: reading the receipt is simulated, so the details above are sample data.</p>' : '') +
          '</form>' +
        '</div>',
      after: () => { if (!a.extracted) { const n = $('#f-name'); if (n) n.focus(); } },
    };
  }

  function onReceiptFile(file) {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const extracted = {
      name: 'Samsung 55" QLED TV QE55Q80D', merchant: 'Harvey Norman', category: 'electronics',
      price: 799, purchased: iso(addDays(today(), -1)), orderNo: 'HN-5520-118934', returnDays: 14,
    };
    const flags = { name: 'The receipt says “SAMS QE55Q80D 55IN”. We guessed the full name. Check it’s right.' };
    const begin = (image) => {
      ui.add = { stage: 'reading', image, fileName: file.name, values: extracted, flags, extracted: true };
      paint('add');
    };
    if (!isImage) return begin(null);
    shrinkImage(file).then(begin).catch(() => begin(null));
  }

  /* Keep photos small enough for local storage. */
  function shrinkImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
  }

  /* ==========================================================================
     Settings: section sidebar + two-column rows
     ========================================================================== */
  const SETTINGS = [
    { key: 'profile', label: 'Profile', icon: 'user', group: 'Account' },
    { key: 'password', label: 'Password', icon: 'key', group: 'Account' },
    { key: 'rules', label: 'Warranty rules', icon: 'shield', group: 'Warranties' },
    { key: 'reminders', label: 'Reminders', icon: 'bell', group: 'Warranties' },
    { key: 'plan', label: 'Plan', icon: 'card', group: 'Workspace' },
    { key: 'data', label: 'Your data', icon: 'database', group: 'Advanced' },
    { key: 'danger', label: 'Danger zone', icon: 'alert', group: 'Advanced' },
  ];

  function srow(title, desc, control) {
    return '<div class="srow"><div class="srow-label"><h2>' + title + '</h2>' + (desc ? '<p>' + desc + '</p>' : '') + '</div>' +
      '<div class="srow-control">' + control + '</div></div>';
  }

  function viewSettings(arg) {
    const key = SETTINGS.some((s) => s.key === arg) ? arg : 'profile';
    let groups = '';
    let last = '';
    SETTINGS.forEach((s) => {
      if (s.group !== last) { groups += (last ? '</div>' : '') + '<div class="snav-group"><p class="snav-head">' + s.group + '</p>'; last = s.group; }
      groups += '<a href="#/settings/' + s.key + '"' + (s.key === key ? ' aria-current="page"' : '') + '>' + icon(s.icon) + s.label + '</a>';
    });
    groups += '</div>';

    return {
      html: '<div class="settings">' +
        '<nav class="snav" aria-label="Settings sections">' + groups + '</nav>' +
        '<div class="settings-body"><h1 class="sr-only">Settings</h1>' + SETTINGS_BODY[key]() + '</div>' +
      '</div>',
    };
  }

  const SETTINGS_BODY = {
    profile() {
      const a = state.account;
      return srow('Your profile', 'How we greet you, and where reminders go.',
          '<form class="form" id="profile-form" novalidate>' +
            '<div class="form-row">' + field({ name: 'first', label: 'First name', value: a.first }) + field({ name: 'last', label: 'Last name', value: a.last }) + '</div>' +
            field({ name: 'email', label: 'Email', type: 'email', value: a.email }) +
            '<div class="form-actions">' + btn('Save changes', null, { kind: 'primary', type: 'submit' }) + '</div>' +
          '</form>') +
        srow('Appearance', 'Match your device, or pick one.',
          '<div class="seg seg-fixed" role="radiogroup" aria-label="Theme">' +
            [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']].map((o) =>
              '<button type="button" role="radio" data-action="theme" data-v="' + o[0] + '" aria-checked="' + (state.settings.theme === o[0]) + '">' + o[1] + '</button>').join('') +
          '</div>');
    },
    password() {
      return srow('Change password', 'Use at least 8 characters. You’ll stay logged in on this device.',
        '<form class="form" id="password-form" novalidate>' +
          field({ name: 'current', label: 'Current password', type: 'password', attrs: ' autocomplete="current-password"' }) +
          field({ name: 'next', label: 'New password', type: 'password', attrs: ' autocomplete="new-password"' }) +
          '<div class="form-actions">' + btn('Update password', null, { kind: 'primary', type: 'submit' }) + '</div>' +
        '</form>');
    },
    rules() {
      const s = state.settings;
      return srow('Where you shop', REGIONS[s.region].note,
          field({ name: 'region', label: 'Region', type: 'select', value: s.region, options: Object.keys(REGIONS).map((k) => ({ value: k, label: REGIONS[k].label })) })) +
        srow('Default return window', 'Used when a receipt doesn’t mention one. Most online shops in the EU give at least 14 days.',
          field({ name: 'returnDefault', label: 'Return window', type: 'select', value: s.returnDays, options: [14, 30, 60].map((d) => ({ value: d, label: plural(d, 'day') })) })) +
        srow('Warranty by category', 'Used when a receipt doesn’t say how long the warranty is. Items you’ve set yourself keep their own length.',
          '<div class="card crows">' + CATS.map((c) =>
            '<div class="crow">' + catIcon(c.key) + '<label for="def-' + c.key + '">' + c.label + '</label>' +
            '<div class="select select-sm"><select id="def-' + c.key + '" data-default="' + c.key + '">' + WARRANTY_OPTIONS.map((m) =>
              '<option value="' + m + '"' + (s.defaults[c.key] === m ? ' selected' : '') + '>' + monthsLabel(m) + '</option>').join('') +
            '</select>' + icon('updown', 14) + '</div></div>').join('') + '</div>');
    },
    reminders() {
      const s = state.settings;
      return srow('When to remind you', 'Reminders go out in the morning.',
          '<div class="card switches">' +
            toggle('w30', s.remind.w30, '30 days before a warranty ends', 'Time to check it still works properly') +
            toggle('w7', s.remind.w7, '7 days before a warranty ends', 'Last call to make a claim') +
            toggle('r2', s.remind.r2, '2 days before a return window closes', 'In case you’ve changed your mind') +
          '</div>') +
        srow('Where to send them', 'Pick one or both.',
          '<div class="card switches">' +
            toggle('device', s.device, 'This device', 'Notifications from your browser or home screen app') +
            toggle('emailCopy', s.emailCopy, 'Email', esc(state.account.email)) +
          '</div>');
    },
    plan() {
      const plus = state.plan === 'plus';
      return srow('Current plan', plus ? 'Thanks for supporting Warranty tracker.' : 'Upgrade any time. No payment is taken in this prototype.',
        '<div class="card plan-card">' +
          '<div class="plan-line"><b>' + (plus ? 'Plus' : 'Free') + '</b><span class="pill pill-' + (plus ? 'brand' : 'neutral') + '">' + (plus ? 'Active' : 'Current') + '</span></div>' +
          '<p>' + (plus ? 'Unlimited items and PDF exports.' : state.items.length + ' of ' + FREE_LIMIT + ' items. Plus adds unlimited items and PDF exports for €3.50 a month.') + '</p>' +
          (plus ? btn('Switch to Free', 'plan-free', { kind: 'ghost', cls: 'btn-sm' }) : btn('Choose a plan', 'show-plans', { kind: 'primary', cls: 'btn-sm' })) +
        '</div>');
    },
    data() {
      return srow('Download your data', 'Every item and setting, as a JSON file.', btn('Download', 'download-json', { icon: 'download' })) +
        srow('Sample items', 'Nine example receipts, to see how the vault works.', btn('Add sample items', 'load-samples', { icon: 'sparkle' }));
    },
    danger() {
      return srow('Delete all items', 'Removes every item and saved receipt. Your account stays.', btn('Delete all items', 'delete-items', { kind: 'danger-outline' })) +
        srow('Delete account', 'Removes your account and everything in it. You’ll be logged out.', btn('Delete account', 'delete-account', { kind: 'danger' }));
    },
  };

  function showPlans(reason) {
    modal({
      title: typeof reason === 'string' ? reason : 'Choose a plan',
      body:
        '<div class="plans">' +
          '<button type="button" class="plan" data-action="pick-plan" data-plan="month"><b>Monthly</b><span class="plan-price num">€3.50</span><span class="weak">per month</span></button>' +
          '<button type="button" class="plan is-best" data-action="pick-plan" data-plan="year"><span class="pill pill-brand plan-tag">Save 29%</span><b>Yearly</b><span class="plan-price num">€30</span><span class="weak">per year</span></button>' +
        '</div>' +
        '<ul class="plan-list"><li>' + icon('check', 14) + 'Unlimited items</li><li>' + icon('check', 14) + 'PDF exports for claims and insurance</li></ul>' +
        '<p class="modal-note">' + icon('alert', 14) + 'Prototype. No payment is taken.</p>',
      actions: [{ label: 'Not now', action: 'close-modal', kind: 'ghost' }],
    });
  }

  /* ==========================================================================
     Export: a print view the browser saves as PDF
     ========================================================================== */
  function exportPdf(items, single) {
    if (state.plan !== 'plus') { showPlans('PDF export is part of Plus'); return; }
    const printed = fmtDate(today());
    let html;
    if (single) {
      const it = items[0], i = info(it);
      html = '<div class="p-page">' +
        '<header class="p-head"><p class="p-kicker">Warranty claim summary</p><h1>' + esc(it.name) + '</h1><p class="p-muted">Prepared ' + printed + ' by ' + esc((state.account.first + ' ' + state.account.last).trim()) + '</p></header>' +
        '<table class="p-dl"><tbody>' +
          '<tr><th>Shop</th><td>' + esc(it.merchant) + '</td></tr>' +
          '<tr><th>Order number</th><td>' + esc(it.orderNo || 'Not recorded') + '</td></tr>' +
          '<tr><th>Purchase date</th><td>' + fmtDate(it.purchased) + '</td></tr>' +
          '<tr><th>Price paid</th><td>' + money(it.price) + '</td></tr>' +
          '<tr><th>Warranty</th><td>' + monthsLabel(i.months) + (it.warrantyNote ? ' (' + esc(it.warrantyNote) + ')' : '') + ', until ' + fmtDate(i.end) + '</td></tr>' +
          '<tr><th>Status on ' + printed + '</th><td>' + (i.status === 'expired' ? 'Ended ' + span(i.left) + ' ago' : 'Covered, ' + span(i.left) + ' left') + '</td></tr>' +
          (it.notes ? '<tr><th>Notes</th><td>' + esc(it.notes) + '</td></tr>' : '') +
        '</tbody></table>' +
        '<h2>Proof of purchase</h2>' +
        (it.photo ? '<img class="p-photo" src="' + it.photo + '" alt="" />' : it.fileName ? '<p>Receipt file: ' + esc(it.fileName) + '</p>' : '<p>No receipt attached.</p>') +
        '</div>';
    } else {
      html = '<div class="p-page">' +
        '<header class="p-head"><p class="p-kicker">Warranty summary</p><h1>' + plural(items.length, 'item') + '</h1>' +
        '<p class="p-muted">Prepared ' + printed + ' · total paid ' + money(items.reduce((a, it) => a + Number(it.price || 0), 0)) + '</p></header>' +
        '<table class="p-table"><thead><tr><th>Item</th><th>Bought</th><th class="num">Paid</th><th>Warranty until</th></tr></thead><tbody>' +
        items.map((it) => {
          const i = info(it);
          return '<tr><td><b>' + esc(it.name) + '</b><br>' + esc(it.merchant) + (it.orderNo ? ' · ' + esc(it.orderNo) : '') + '</td>' +
            '<td>' + fmtDate(it.purchased) + '</td><td class="num">' + money(it.price) + '</td>' +
            '<td>' + fmtDate(i.end) + '<br><span class="p-muted">' + statusText(i) + '</span></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    $('#print').innerHTML = html;
    const title = document.title;
    document.title = single ? 'Claim summary - ' + items[0].name : 'Warranty summary ' + iso(today());
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
        '<button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">' + icon('x') + '</button></header>' +
        '<div class="m-body">' + o.body + '</div>' +
        (o.actions && o.actions.length ? '<footer class="m-foot">' + o.actions.map((a) => btn(a.label, a.action, { kind: a.kind, data: a.data })).join('') + '</footer>' : '') +
      '</div>';
    ui.modalFocus = document.activeElement;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('is-open')));
    const primary = $('.m-foot .btn-primary, .m-foot .btn-danger', wrap) || $('.m-head .icon-btn', wrap);
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
      actions: [{ label: o.cancel, action: 'close-modal', kind: 'ghost' }, { label: o.label, action: o.action, kind: 'danger', data: o.data }],
    });
  }

  function toast(msg, undo) {
    const region = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span>' + msg + '</span>' + (undo ? '<button type="button" class="toast-undo">Undo</button>' : '');
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
    arm();
    while (region.children.length > 3) region.firstChild.remove();
  }

  /* ==========================================================================
     Actions
     ========================================================================== */
  function loadSamples() {
    const fresh = sampleItems().filter((s) => !findItem(s.id));
    if (!fresh.length) { toast('Sample items are already in your vault.'); return; }
    state.items = state.items.concat(fresh);
    state.banner = false;
    save();
    if (ui.base === 'home') paint('home'); else go('home');
    toast(plural(fresh.length, 'sample item') + ' added.');
  }

  const ACTIONS = {
    'toggle-pw': (el) => {
      const input = document.getElementById(el.dataset.for);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      el.setAttribute('aria-pressed', String(show));
      el.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      el.innerHTML = icon(show ? 'eye' : 'eyeOff');
    },
    'user-menu': () => openUserMenu(),
    'logout': () => {
      closeUserMenu();
      closeDrawer();
      state.session = false;
      save();
      go('login');
      toast('You’re logged out.');
    },
    'dismiss-banner': () => { state.banner = false; save(); $('#banner').innerHTML = ''; },
    'load-samples': loadSamples,
    'close-drawer': () => go('home'),
    'close-modal': () => closeModal(),
    'status': (el) => {
      ui.status = el.dataset.v;
      renderList();
      const again = $('#seg [data-v="' + ui.status + '"]');
      if (again) again.focus();
    },
    'clear-filters': () => {
      ui.q = ''; ui.status = 'all'; ui.cat = 'all'; ui.merchant = 'all';
      paint('home');
    },
    'edit': (el) => { ui.editing = el.dataset.id; openDrawer(el.dataset.id); },
    'cancel-edit': () => { ui.editing = null; refreshDrawer(); },
    'review-ok': (el) => {
      delete findItem(el.dataset.id).review;
      save();
      refreshDrawer();
      renderList();
      toast('Marked as checked.');
    },
    'delete': (el) => {
      const it = findItem(el.dataset.id);
      confirmModal({
        title: 'Delete ' + esc(it.name) + '?',
        text: 'This removes the item, its reminders and the saved receipt.',
        label: 'Delete item', cancel: 'Keep item', action: 'delete-yes', data: { id: it.id },
      });
    },
    'delete-yes': (el) => {
      const idx = state.items.findIndex((x) => x.id === el.dataset.id);
      if (idx < 0) return;
      const [gone] = state.items.splice(idx, 1);
      save();
      closeModal(true);
      go('home');
      toast(esc(gone.name) + ' deleted.', () => {
        state.items.splice(idx, 0, gone);
        save();
        if (ui.base === 'home') paint('home', null, true);
      });
    },
    'view-proof': (el) => viewProof(findItem(el.dataset.id)),
    'export-one': (el) => exportPdf([findItem(el.dataset.id)], true),
    'export-all': () => exportPdf(filtered().list.map((x) => x.it), false),
    'add-manual': () => { ui.add = { stage: 'form', values: {}, flags: {}, extracted: false }; paint('add'); },
    'add-reset': () => { ui.add = null; paint('add'); },
    'show-plans': () => showPlans(),
    'pick-plan': (el) => {
      state.plan = 'plus';
      save();
      closeModal(true);
      toast(el.dataset.plan === 'year' ? 'You’re on Plus, billed yearly.' : 'You’re on Plus, billed monthly.');
      if (ui.base === 'settings') paint('settings', ui.arg, true);
    },
    'plan-free': () => { state.plan = 'free'; save(); paint('settings', ui.arg, true); toast('You’re on the Free plan.'); },
    'theme': (el) => {
      state.settings.theme = el.dataset.v;
      save();
      applyTheme();
      $$('[data-action="theme"]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === el.dataset.v)));
    },
    'download-json': () => {
      const data = Object.assign({}, state, { account: Object.assign({}, state.account, { password: undefined }) });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'warranty-tracker-' + iso(today()) + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    'delete-items': () => confirmModal({
      title: 'Delete all ' + plural(state.items.length, 'item') + '?',
      text: 'This removes every item, its reminders and saved receipts. Your account stays. This can’t be undone.',
      label: 'Delete all items', cancel: 'Keep items', action: 'delete-items-yes',
    }),
    'delete-items-yes': () => {
      state.items = [];
      save();
      closeModal(true);
      paint('settings', ui.arg, true);
      toast('All items deleted.');
    },
    'delete-account': () => confirmModal({
      title: 'Delete your account?',
      text: 'This deletes your account, ' + plural(state.items.length, 'item') + ' and every saved receipt. It can’t be undone.',
      label: 'Delete account', cancel: 'Keep account', action: 'delete-account-yes',
    }),
    'delete-account-yes': () => {
      state = defaultState();
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      ui.add = null;
      closeModal(true);
      applyTheme();
      redirect('welcome');
      toast('Your account was deleted.');
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
    if (t.id === 'q') {
      ui.q = t.value;
      if (ui.base !== 'home') { ui.refocusSearch = true; go('home'); } else renderList();
    }
    /* Live preview next to the sign-up form. */
    if (ui.base === 'signup' && (t.id === 'f-first' || t.id === 'f-last')) {
      const first = $('#f-first').value.trim();
      const last = $('#f-last').value.trim();
      $('#pv-hello').textContent = (first + ' ' + last).trim() || 'there';
      $('#pv-name').textContent = first ? first + '’s vault' : 'Your vault';
      $('#pv-initials').textContent = (first[0] || 'A').toUpperCase();
    }
    if (ui.base === 'signup' && t.id === 'f-email') {
      const ok = $('#email-ok');
      if (validEmail(t.value.trim())) { ok.hidden = false; $('span', ok).innerHTML = 'Reminders will go to <b>' + esc(t.value.trim()) + '</b>'; }
      else ok.hidden = true;
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'flt-cat') { ui.cat = t.value; renderList(); }
    if (t.id === 'flt-merchant') { ui.merchant = t.value; renderList(); }
    if (t.id === 'flt-sort') { ui.sort = t.value; renderList(); }
    if (t.id === 'photo-input' || t.id === 'file-input') onReceiptFile(t.files[0]);
    if (t.dataset.attach) {
      const it = findItem(t.dataset.attach);
      shrinkImage(t.files[0]).then((img) => { it.photo = img; save(); refreshDrawer(); toast('Photo added.'); });
    }
    if (t.dataset.default) {
      state.settings.defaults[t.dataset.default] = Number(t.value);
      save();
      toast(catLabel(t.dataset.default) + ' now default to ' + monthsLabel(Number(t.value)) + '.');
    }
    if (t.name === 'region' && ui.base === 'settings') {
      state.settings.region = t.value;
      state.settings.defaults = defaultDefaults(t.value);
      save();
      paint('settings', 'rules', true);
      toast('Defaults set to ' + monthsLabel(REGIONS[t.value].months) + ' for ' + REGIONS[t.value].label + '.');
    }
    if (t.name === 'returnDefault') {
      state.settings.returnDays = Number(t.value);
      save();
      toast('Default return window is now ' + plural(Number(t.value), 'day') + '.');
    }
    if (t.dataset.toggle) {
      const k = t.dataset.toggle;
      if (k === 'device' && t.checked && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then((p) => {
          state.settings.device = p === 'granted';
          t.checked = state.settings.device;
          save();
          if (p !== 'granted') toast('Notifications are blocked. Allow them in your browser settings.');
        });
        return;
      }
      if (k === 'device' || k === 'emailCopy') state.settings[k] = t.checked;
      else state.settings.remind[k] = t.checked;
      save();
      renderChrome(ui.base, ui.arg);
    }
  });

  document.addEventListener('submit', async (e) => {
    const f = e.target;
    e.preventDefault();
    const val = (name) => { const el = f.elements[name]; return el ? el.value.trim() : ''; };

    if (f.id === 'signup-form') {
      ['f-password', 'f-email', 'f-first'].forEach((id) => showError(id, ''));
      let ok = true;
      if (f.elements.password.value.length < 8) { showError('f-password', 'Use at least 8 characters.'); ok = false; }
      if (!validEmail(val('email'))) { showError('f-email', 'Enter an email address, like name@example.com.'); ok = false; }
      else if (state.account && state.account.email.toLowerCase() === val('email').toLowerCase()) {
        showError('f-email', 'An account with this email already exists. <a href="#/login">Log in instead</a>'); ok = false;
      }
      if (!val('first')) { showError('f-first', 'Enter your first name.'); ok = false; }
      if (!ok) return;
      const password = await hashPassword(f.elements.password.value);
      const theme = state.settings.theme;
      state = defaultState();
      state.settings.theme = theme;
      state.account = { first: val('first'), last: val('last'), email: val('email'), password };
      state.session = true;
      state.banner = true;
      save();
      go('home');
      return;
    }

    if (f.id === 'login-form') {
      showError('f-password', ''); showError('f-email', '');
      if (!validEmail(val('email'))) return showError('f-email', 'Enter an email address, like name@example.com.');
      if (!state.account || state.account.email.toLowerCase() !== val('email').toLowerCase()) {
        return showError('f-email', 'We can’t find an account with that email. Check it, or <a href="#/signup">create an account</a>.');
      }
      if (!f.elements.password.value) return showError('f-password', 'Enter your password.');
      if ((await hashPassword(f.elements.password.value)) !== state.account.password) {
        return showError('f-password', 'That password isn’t right. Try again or <a href="#/forgot">reset it</a>.');
      }
      state.session = true;
      save();
      go('home');
      toast('Welcome back, ' + esc(state.account.first) + '.');
      return;
    }

    if (f.id === 'forgot-form') {
      showError('f-email', '');
      if (!validEmail(val('email'))) return showError('f-email', 'Enter an email address, like name@example.com.');
      const ok = $('#forgot-ok');
      ok.hidden = false;
      $('span', ok).innerHTML = '<b>Check your email.</b> If an account exists for ' + esc(val('email')) + ', you’ll get a link to reset your password. (Prototype: no email is sent.)';
      $('#forgot-btn span').textContent = 'Send again';
      return;
    }

    if (f.id === 'profile-form') {
      showError('f-first', ''); showError('f-email', '');
      if (!validEmail(val('email'))) return showError('f-email', 'Enter an email address, like name@example.com.');
      if (!val('first')) return showError('f-first', 'Enter your first name.');
      Object.assign(state.account, { first: val('first'), last: val('last'), email: val('email') });
      save();
      renderChrome(ui.base, ui.arg);
      toast('Profile saved.');
      return;
    }

    if (f.id === 'password-form') {
      showError('f-current', ''); showError('f-next', '');
      if ((await hashPassword(f.elements.current.value)) !== state.account.password) return showError('f-current', 'That isn’t your current password.');
      if (f.elements.next.value.length < 8) return showError('f-next', 'Use at least 8 characters.');
      state.account.password = await hashPassword(f.elements.next.value);
      save();
      f.reset();
      toast('Password updated.');
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
      toast('Changes saved.');
      return;
    }

    if (f.id === 'add-form') {
      const v = readForm(f);
      if (!validateItem(v)) return;
      delete v.priceRaw;
      const it = Object.assign({ id: uid(), added: iso(today()), source: ui.add.image ? 'photo' : ui.add.fileName ? 'upload' : 'manual' }, v);
      if (ui.add.image) it.photo = ui.add.image;
      else if (ui.add.fileName) it.fileName = ui.add.fileName;
      state.items.push(it);
      state.banner = false;
      save();
      ui.add = null;
      go('item/' + it.id);
      toast('Added to your vault.');
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && state.session) {
      const q = $('#q');
      if (q) { e.preventDefault(); q.focus(); q.select(); }
      return;
    }
    if (e.key === 'Escape') {
      if ($('.user-pop')) return closeUserMenu(true);
      if ($('.modal-wrap:not(.is-closing)')) return closeModal();
      if (ui.drawerId) {
        if (ui.editing) { ui.editing = null; return refreshDrawer(); }
        return go('home');
      }
      if (document.activeElement && document.activeElement.id === 'q' && ui.q) {
        ui.q = '';
        document.activeElement.value = '';
        renderList();
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

  applyTheme();
  render();
})();
