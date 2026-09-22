(function () {
  'use strict';

  /* ==========================================================================
     Basics
     ========================================================================== */
  const KEY = 'warranty-tracker-v1';
  const DAY = 86400000;
  const FREE_LIMIT = 10;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const view = $('#view');
  const overlay = $('#overlay');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    let years = Math.floor(months / 12);
    months = months % 12;
    if (short) return years + ' yr' + (months ? ' ' + months + ' mo' : '');
    return plural(years, 'year') + (months ? ' ' + plural(months, 'month') : '');
  }

  function monthsLabel(m) {
    if (m % 12 === 0) return plural(m / 12, 'year');
    return plural(m, 'month');
  }

  function relTime(isoTime) {
    const mins = Math.round((Date.now() - new Date(isoTime).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return plural(mins, 'minute') + ' ago';
    const h = Math.round(mins / 60);
    if (h < 24) return plural(h, 'hour') + ' ago';
    return plural(Math.round(h / 24), 'day') + ' ago';
  }

  const moneyFmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
  const moneyWhole = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  function money(n) {
    n = Number(n) || 0;
    return Number.isInteger(n) ? moneyWhole.format(n) : moneyFmt.format(n);
  }

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

  const PROVIDERS = {
    gmail: { label: 'Gmail', short: 'Gmail' },
    icloud: { label: 'iCloud Mail', short: 'iCloud' },
  };

  /* ==========================================================================
     Icons (16px, stroke)
     ========================================================================== */
  const ICONS = {
    vault: '<rect x="2.5" y="3" width="11" height="10" rx="1.5"/><circle cx="8" cy="8" r="2.2"/><path d="M4.5 13v1M11.5 13v1"/>',
    bell: '<path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.5H3L4 11Z"/><path d="M6.5 14h3"/>',
    sliders: '<path d="M2.5 5h7M12.5 5h1M2.5 11h1M6.5 11h7"/><circle cx="11" cy="5" r="1.5"/><circle cx="5" cy="11" r="1.5"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    search: '<circle cx="7" cy="7" r="4.25"/><path d="m10.2 10.2 3.3 3.3"/>',
    camera: '<path d="M2.5 5.5a1 1 0 0 1 1-1h2l1-1.5h3l1 1.5h2a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1Z"/><circle cx="8" cy="8.5" r="2.25"/>',
    upload: '<path d="M8 10.5V3M5 6l3-3 3 3M3 10.5v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2"/>',
    pencil: '<path d="m10.5 3 2.5 2.5-7 7H3.5V10Z"/>',
    trash: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5"/>',
    download: '<path d="M8 3v7.5M5 7.5l3 3 3-3M3 13h10"/>',
    x: '<path d="m4 4 8 8M12 4l-8 8"/>',
    check: '<path d="m3.5 8.5 3 3 6-7"/>',
    chevron: '<path d="m6 3.5 4.5 4.5L6 12.5"/>',
    back: '<path d="M10 3.5 5.5 8l4.5 4.5"/>',
    mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="m2.5 4.5 5.5 4 5.5-4"/>',
    lock: '<rect x="3" y="7" width="10" height="6.5" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>',
    eye: '<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/>',
    ban: '<circle cx="8" cy="8" r="5.5"/><path d="m4.1 4.1 7.8 7.8"/>',
    receipt: '<path d="M3.5 2.5h9v11l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1Z"/><path d="M6 5.5h4M6 8h4"/>',
    alert: '<path d="M8 2.5 14 13H2Z"/><path d="M8 6.5v3M8 11.2v.1"/>',
    clock: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/>',
    return: '<path d="M5.5 6.5 3 9l2.5 2.5"/><path d="M3 9h7a3 3 0 0 0 0-6H8"/>',
    shield: '<path d="M8 2 13 4v4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V4Z"/><path d="m5.8 8 1.6 1.6 3-3.2"/>',
    file: '<path d="M4 2.5h5l3 3v8H4Z"/><path d="M9 2.5v3h3"/>',
    external: '<path d="M9 3h4v4M13 3 7.5 8.5M11 9.5v3a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h3"/>',
    key: '<circle cx="5.5" cy="10.5" r="3"/><path d="m7.6 8.4 5.4-5.4M11 5l1.5 1.5"/>',
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

  /* ==========================================================================
     Sample inbox: dates are offsets from today so the demo never goes stale
     ========================================================================== */
  function sampleItems(set) {
    const t = today();
    const d = (n) => iso(addDays(t, n));
    if (set === 'b') {
      return [
        {
          id: 'b1', name: 'Bose SoundLink Flex speaker', merchant: 'Amazon.de', category: 'electronics',
          price: 149, purchased: d(-40), orderNo: '028-7730142-5530711', returnDays: 30,
          email: { from: 'auto-confirm@amazon.de', subject: 'Your Amazon.de order #028-7730142-5530711', received: d(-40) },
        },
        {
          id: 'b2', name: 'Nespresso Vertuo Pop', merchant: 'Nespresso', category: 'kitchen',
          price: 99, purchased: d(-190), orderNo: 'NS-44021877', returnDays: 14,
          email: { from: 'orders@nespresso.com', subject: 'Thank you for your order NS-44021877', received: d(-190) },
        },
      ];
    }
    return [
      {
        id: 'i1', name: 'Philips Airfryer XXL', merchant: 'Amazon.de', category: 'kitchen',
        price: 219.99, purchased: d(-28), orderNo: '302-4418823-1190755', returnDays: 30,
        email: { from: 'auto-confirm@amazon.de', subject: 'Your Amazon.de order #302-4418823-1190755', received: d(-28) },
      },
      {
        id: 'i2', name: 'Makita DHP485 cordless drill', merchant: 'Bauhaus', category: 'tools',
        price: 189, purchased: d(-5), orderNo: 'BH-88120457', returnDays: 14,
        review: { orderNo: 'The order number was split over two lines in the email. Check it matches your receipt.' },
        email: { from: 'shop@bauhaus.info', subject: 'Bestellbestätigung BH-88120457', received: d(-5) },
      },
      {
        id: 'i3', name: 'Sony WH-1000XM6 headphones', merchant: 'MediaMarkt', category: 'electronics',
        price: 399, purchased: d(-12), orderNo: 'MM-1180-99231', returnDays: 30,
        email: { from: 'service@mediamarkt.de', subject: 'Danke für deinen Einkauf', received: d(-12) },
      },
      {
        id: 'i4', name: 'Bosch Serie 6 washing machine', merchant: 'Big Bang', category: 'appliances',
        price: 649, purchased: iso(addDays(addMonths(t, -24), 25)), orderNo: '2024-118204', returnDays: 14,
        email: { from: 'racuni@bigbang.si', subject: 'Račun št. 2024-118204', received: iso(addDays(addMonths(t, -24), 25)) },
        pdf: 'racun-2024-118204.pdf',
      },
      {
        id: 'i5', name: 'Garmin Forerunner 265', merchant: 'Garmin', category: 'sports',
        price: 349.99, purchased: iso(addDays(addMonths(t, -24), 45)), orderNo: 'GA-5521047', returnDays: 30,
        review: { price: 'The email shows €359.98 including €9.99 delivery. We saved the item price.' },
        email: { from: 'noreply@garmin.com', subject: 'Order confirmation GA-5521047', received: iso(addDays(addMonths(t, -24), 45)) },
      },
      {
        id: 'i6', name: 'MacBook Air 13" M4', merchant: 'Apple', category: 'computers',
        price: 1299, purchased: d(-330), orderNo: 'W1829340112', returnDays: 14,
        email: { from: 'no_reply@email.apple.com', subject: 'Your receipt from Apple', received: d(-330) },
        pdf: 'Apple-receipt-W1829340112.pdf',
      },
      {
        id: 'i7', name: 'IKEA KIVIK 3-seat sofa', merchant: 'IKEA', category: 'furniture',
        price: 899, purchased: d(-400), orderNo: '1284470331', returnDays: 90, warrantyMonths: 120,
        warrantyNote: 'IKEA’s 10-year guarantee',
        email: { from: 'noreply@ikea.com', subject: 'Your IKEA order confirmation 1284470331', received: d(-400) },
      },
      {
        id: 'i8', name: 'De’Longhi Magnifica Evo', merchant: 'Amazon.de', category: 'kitchen',
        price: 449, purchased: d(-430), orderNo: '028-1147756-6612354', returnDays: 30,
        email: { from: 'auto-confirm@amazon.de', subject: 'Your Amazon.de order #028-1147756-6612354', received: d(-430) },
      },
      {
        id: 'i9', name: 'Dyson V15 Detect', merchant: 'Dyson', category: 'appliances',
        price: 699, purchased: iso(addDays(addMonths(t, -24), -31)), orderNo: 'DY-20931175', returnDays: 30,
        email: { from: 'orders@dyson.com', subject: 'Thanks for your order DY-20931175', received: iso(addDays(addMonths(t, -24), -31)) },
      },
    ];
  }

  /* What the scan walks through: receipts, plus the look-alikes it has to skip. */
  function sampleEmails(set) {
    const items = sampleItems(set);
    const r = (id) => { const it = items.find((x) => x.id === id); return { from: it.merchant, subject: it.email.subject, kind: 'receipt', itemId: id }; };
    if (set === 'b') {
      return [
        r('b1'),
        { from: 'Amazon.de', subject: 'Deals picked for you', kind: 'newsletter' },
        { from: 'DPD', subject: 'Your parcel arrives tomorrow', kind: 'shipping' },
        r('b2'),
        { from: 'Uber', subject: 'Your Friday evening trip', kind: 'service' },
      ];
    }
    return [
      r('i1'),
      { from: 'Amazon.de', subject: 'Deals picked for you', kind: 'newsletter' },
      r('i2'),
      r('i3'),
      { from: 'DHL', subject: 'Your parcel is on its way', kind: 'shipping' },
      r('i4'),
      { from: 'Bolt', subject: 'Your Tuesday evening ride', kind: 'service' },
      r('i5'),
      { from: 'Spotify', subject: 'Your receipt from Spotify', kind: 'subscription' },
      r('i6'),
      { from: 'Zalando', subject: 'New season, new arrivals', kind: 'newsletter' },
      r('i7'),
      { from: 'MediaMarkt', subject: 'Your order is ready to pick up', kind: 'shipping' },
      r('i8'),
      { from: 'Wolt', subject: 'Your order from Pizzeria Parma', kind: 'service' },
      r('i9'),
    ];
  }

  const SKIP_REASONS = {
    newsletter: 'Newsletter',
    shipping: 'Delivery update',
    service: 'No warranty',
    subscription: 'Subscription',
  };

  /* ==========================================================================
     State
     ========================================================================== */
  function defaultDefaults(region) {
    const out = {};
    CATS.forEach((c) => { out[c.key] = REGIONS[region].months; });
    return out;
  }

  function defaultState() {
    return {
      onboarded: false,
      plan: 'free',           // 'free' | 'trial' | 'plus'
      trialEnds: null,
      accounts: [],
      items: [],
      settings: {
        region: 'EU',
        defaults: defaultDefaults('EU'),
        returnDays: 30,
        remind: { w30: true, w7: true, r2: true },
        device: false,
        emailCopy: true,
      },
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
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked: keep going in memory */ }
  }

  /* Things that only live for this session. */
  const ui = {
    q: '', status: 'all', cat: 'all', merchant: 'all', sort: 'soonest',
    scan: null, add: null, editing: null, base: null, drawerId: null,
  };

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
    return state.items
      .flatMap(remindersFor)
      .filter((r) => r.date >= t && r.date <= horizon)
      .sort((a, b) => a.date - b.date);
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
  function isPaid() { return state.plan === 'plus' || (state.plan === 'trial' && trialLeft() >= 0); }
  function trialLeft() { return state.trialEnds ? daysFrom(today(), parse(state.trialEnds)) : -1; }

  /* ==========================================================================
     Small components
     ========================================================================== */
  function btn(label, action, o) {
    o = o || {};
    const attrs = Object.keys(o.data || {}).map((k) => ' data-' + k + '="' + esc(o.data[k]) + '"').join('');
    return '<button type="' + (o.type || 'button') + '" class="btn ' + (o.kind ? 'btn-' + o.kind : '') + (o.cls ? ' ' + o.cls : '') + '"' +
      (action ? ' data-action="' + action + '"' : '') + attrs + (o.disabled ? ' disabled' : '') + (o.id ? ' id="' + o.id + '"' : '') + '>' +
      (o.icon ? icon(o.icon) : '') + '<span>' + label + '</span></button>';
  }

  function catIcon(key) { return '<span class="cat-ic" aria-hidden="true">' + icon(key) + '</span>'; }

  function coverage(i) {
    const frac = i.status === 'expired' ? 0 : Math.max(0.02, Math.min(1, i.left / i.total));
    return '<span class="cover cover-' + i.status + '" aria-hidden="true"><span style="transform:scaleX(' + frac.toFixed(3) + ')"></span></span>';
  }

  function statusPill(i) {
    const label = { active: 'Active', expiring: 'Ending soon', expired: 'Expired' }[i.status];
    return '<span class="pill pill-' + i.status + '">' + label + '</span>';
  }

  function returnPill(i) {
    if (!i.returnOpen) return '';
    return '<span class="pill pill-return">' + icon('return', 12) + 'Return by ' + fmtDate(i.rEnd, { short: true }) + '</span>';
  }

  function field(o) {
    const id = 'f-' + o.name;
    const flag = o.flag ? '<span class="flag">' + icon('alert', 12) + 'Check this</span>' : '';
    let control;
    if (o.type === 'select') {
      control = '<select id="' + id + '" name="' + o.name + '">' +
        o.options.map((op) => '<option value="' + esc(op.value) + '"' + (String(op.value) === String(o.value) ? ' selected' : '') + '>' + esc(op.label) + '</option>').join('') +
        '</select>';
    } else if (o.type === 'textarea') {
      control = '<textarea id="' + id + '" name="' + o.name + '" rows="3" placeholder="' + esc(o.placeholder || '') + '">' + esc(o.value) + '</textarea>';
    } else {
      control = '<input id="' + id + '" name="' + o.name + '" type="' + (o.type || 'text') + '" value="' + esc(o.value) + '"' +
        (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') +
        (o.required ? ' required' : '') + (o.attrs || '') + ' />';
    }
    return '<div class="field' + (o.flag ? ' is-flagged' : '') + (o.wide ? ' field-wide' : '') + '">' +
      '<label for="' + id + '">' + o.label + flag + '</label>' + control +
      (o.hint ? '<p class="hint">' + o.hint + '</p>' : '') +
      '<p class="field-error" id="' + id + '-error" hidden></p>' +
      '</div>';
  }

  function toggle(key, on, label, desc) {
    return '<label class="switch-row">' +
      '<span class="switch"><input type="checkbox" data-toggle="' + key + '"' + (on ? ' checked' : '') + ' /><span></span></span>' +
      '<span class="switch-text"><span class="switch-label">' + label + '</span>' + (desc ? '<span class="switch-desc">' + desc + '</span>' : '') + '</span>' +
      '</label>';
  }

  /* ==========================================================================
     Router
     ========================================================================== */
  const ONBOARDING = ['welcome', 'privacy', 'connect', 'icloud', 'scan', 'review'];

  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/');
    return { name: parts[0] || '', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function go(path) { location.hash = '#/' + path; }
  function redirect(path) { history.replaceState(null, '', '#/' + path); render(); }

  function render() {
    const r = route();
    if (!state.onboarded && !ONBOARDING.includes(r.name)) return redirect('welcome');
    if (state.onboarded && (r.name === '' || r.name === 'welcome')) return redirect('vault');

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
    welcome: viewWelcome, privacy: viewPrivacy, connect: viewConnect, icloud: viewIcloud,
    scan: viewScan, review: viewReview, vault: viewVault, reminders: viewReminders,
    add: viewAdd, settings: viewSettings,
  };

  /* keep: repaint in place (after closing the drawer), without jumping to the top. */
  function paint(name, arg, keep) {
    const fn = VIEWS[name] || viewVault;
    const y = window.scrollY;
    const out = fn(arg);
    const app = !ONBOARDING.includes(name);
    ui.base = name;
    document.body.classList.toggle('is-app', app);
    $('#topbar').hidden = !app;
    $('#tabbar').hidden = !app;
    view.className = 'main ' + (app ? 'main-app' : 'main-onb');
    view.innerHTML = out.html;
    renderNav(name);
    window.scrollTo(0, keep ? y : 0);
    if (out.after) out.after();
    if (keep) return;
    const h1 = $('h1', view);
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }

  const NAV = [
    { key: 'vault', label: 'Vault', icon: 'vault' },
    { key: 'reminders', label: 'Reminders', icon: 'bell' },
    { key: 'settings', label: 'Settings', icon: 'sliders' },
  ];

  function renderNav(active) {
    const soon = upcomingReminders().filter((r) => daysFrom(today(), r.date) <= 7).length;
    const badge = (k) => (k === 'reminders' && soon ? '<span class="nav-badge" aria-label="' + plural(soon, 'reminder') + ' this week">' + soon + '</span>' : '');
    $('#nav').innerHTML = NAV.map((n) =>
      '<a href="#/' + n.key + '"' + (n.key === active ? ' aria-current="page"' : '') + '>' + n.label + badge(n.key) + '</a>'
    ).join('') + '<a class="btn btn-primary btn-sm nav-add" href="#/add">' + icon('plus') + '<span>Add receipt</span></a>';

    const tabs = [NAV[0], { key: 'add', label: 'Add', icon: 'plus' }, NAV[1], NAV[2]];
    $('#tabbar').innerHTML = tabs.map((n) =>
      '<a href="#/' + n.key + '" class="tab' + (n.key === 'add' ? ' tab-add' : '') + '"' + (n.key === active ? ' aria-current="page"' : '') + '>' +
      '<span class="tab-ic">' + icon(n.icon, 20) + badge(n.key) + '</span><span class="tab-label">' + n.label + '</span></a>'
    ).join('');
  }

  /* ==========================================================================
     Onboarding
     ========================================================================== */
  function onbShell(inner, o) {
    o = o || {};
    const steps = ['What we read', 'Connect', 'Scan', 'Review'];
    const stepper = o.step
      ? '<ol class="stepper" aria-label="Setup progress">' + steps.map((s, n) =>
          '<li class="' + (n + 1 < o.step ? 'done' : n + 1 === o.step ? 'current' : '') + '"' + (n + 1 === o.step ? ' aria-current="step"' : '') + '><span>' + s + '</span></li>'
        ).join('') + '</ol>'
      : '';
    return '<div class="onb' + (o.wide ? ' onb-wide' : '') + '">' +
      '<div class="onb-top">' +
        (o.back ? '<a class="icon-btn" href="#/' + o.back + '" aria-label="Back">' + icon('back') + '</a>' : '<span class="brand-mini">' + logo() + 'Warranty tracker</span>') +
        (state.onboarded ? '<a class="link-quiet" href="#/settings">Cancel</a>' : '') +
      '</div>' +
      stepper + inner + '</div>';
  }

  function logo() {
    return '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 3.5h18a1.5 1.5 0 0 1 1.5 1.5v23.2l-3-2-3 2-3.5-2-3.5 2-3-2-3 2V5A1.5 1.5 0 0 1 7 3.5Z" /><path class="logo-mark" d="m11 15.5 3.4 3.4L21.5 11.8" /></svg>';
  }

  function viewWelcome() {
    const t = today();
    const bought = addDays(t, -12);
    const end = addMonths(bought, 24);
    const html = onbShell(
      '<section class="welcome">' +
        '<div class="welcome-copy">' +
          '<h1 class="display">Your receipts, found and kept.</h1>' +
          '<p class="lede">Connect your inbox and we’ll find your order confirmations, note each warranty and remind you before it runs out.</p>' +
          '<div class="welcome-actions">' +
            '<a class="btn btn-primary btn-lg" href="#/privacy">' + icon('mail') + '<span>Connect your inbox</span></a>' +
            btn('Add receipts manually', 'start-manual', { kind: 'ghost', cls: 'btn-lg' }) +
          '</div>' +
          '<p class="fineprint">' + icon('lock', 14) + 'Read-only access. Disconnect anytime.</p>' +
        '</div>' +
        '<div class="welcome-art" aria-hidden="true">' +
          '<div class="paper paper-back"></div>' +
          '<div class="paper paper-mid"></div>' +
          '<div class="paper paper-front">' +
            '<p class="paper-from">' + icon('mail', 12) + 'service@mediamarkt.de</p>' +
            '<p class="paper-subject">Danke für deinen Einkauf</p>' +
            '<dl class="paper-rows">' +
              '<div><dt>Item</dt><dd>Sony WH-1000XM6</dd></div>' +
              '<div><dt>Paid</dt><dd class="mono">€399.00</dd></div>' +
              '<div><dt>Bought</dt><dd class="mono">' + fmtDate(bought) + '</dd></div>' +
            '</dl>' +
            '<div class="paper-extract">' +
              '<p><span class="dot dot-active"></span>Warranty until <b>' + fmtDate(end) + '</b></p>' +
              '<p><span class="dot dot-return"></span>Return by <b>' + fmtDate(addDays(bought, 30)) + '</b></p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<ul class="welcome-points">' +
        '<li>' + icon('mail') + '<div><b>Finds receipts for you</b><span>Gmail and iCloud Mail. Newsletters and delivery updates are skipped.</span></div></li>' +
        '<li>' + icon('bell') + '<div><b>Reminds you in time</b><span>30 and 7 days before a warranty ends, 2 days before a return window closes.</span></div></li>' +
        '<li>' + icon('download') + '<div><b>Ready for a claim</b><span>Keep the original receipt with each item and export a PDF when you need it.</span></div></li>' +
      '</ul>',
      { wide: true }
    );
    return { html };
  }

  function privacyBlock() {
    return '<div class="privacy">' +
      '<section class="privacy-col"><h2>' + icon('eye') + 'What we read</h2><ul>' +
        '<li>Emails from shops that look like order confirmations or receipts</li>' +
        '<li>Only messages from the last 3 years</li>' +
      '</ul></section>' +
      '<section class="privacy-col"><h2>' + icon('vault') + 'What we keep</h2><ul>' +
        '<li>Shop, item, price, purchase date and order number</li>' +
        '<li>A copy of the receipt email or PDF, so you have proof for a claim</li>' +
      '</ul></section>' +
      '<section class="privacy-col privacy-never"><h2>' + icon('ban') + 'What we never do</h2><ul>' +
        '<li>Read personal emails, or anything that isn’t from a shop</li>' +
        '<li>Send, delete or change any email</li>' +
        '<li>Sell or share your data</li>' +
      '</ul></section>' +
    '</div>';
  }

  function viewPrivacy() {
    return {
      html: onbShell(
        '<header class="onb-head"><h1>Before you connect, here’s what we read</h1>' +
        '<p class="lede">You give us read-only access. Disconnect in Settings at any time, and delete everything with one button.</p></header>' +
        privacyBlock() +
        '<div class="onb-foot">' +
          '<a class="btn btn-primary btn-lg" href="#/connect"><span>Continue</span></a>' +
        '</div>',
        { step: 1, back: state.onboarded ? 'settings' : 'welcome' }
      ),
    };
  }

  function providerMark(p) {
    return '<span class="prov prov-' + p + '" aria-hidden="true">' + (p === 'gmail' ? 'G' : icon('mail', 18)) + '</span>';
  }

  function viewConnect() {
    return {
      html: onbShell(
        '<header class="onb-head"><h1>Which inbox do you shop from?</h1>' +
        '<p class="lede">Pick the one your order confirmations go to. You can add another later.</p></header>' +
        '<div class="choices">' +
          '<button type="button" class="choice" data-action="connect-gmail">' + providerMark('gmail') +
            '<span class="choice-text"><b>Gmail</b><span>Sign in with Google. Takes a few seconds.</span></span>' + icon('chevron') + '</button>' +
          '<a class="choice" href="#/icloud">' + providerMark('icloud') +
            '<span class="choice-text"><b>iCloud Mail</b><span>Needs an app-specific password. We’ll walk you through it, about 2 minutes.</span></span>' + icon('chevron') + '</a>' +
        '</div>' +
        '<p class="fineprint center">Using Outlook or another inbox? Forward receipts to <span class="mono">receipts@warranty.app</span> for now.</p>',
        { step: 2, back: 'privacy' }
      ),
    };
  }

  function viewIcloud() {
    const html = onbShell(
      '<header class="onb-head"><h1>Connect iCloud Mail</h1>' +
      '<p class="lede">Apple doesn’t let apps sign in with your normal password. Instead, you create a separate password just for us. You can revoke it at any time.</p></header>' +
      '<ol class="guide">' +
        '<li><span class="guide-n">1</span><div><b>Open your Apple Account</b>' +
          '<p>Sign in at account.apple.com. Two-factor authentication needs to be on, which it is for most accounts.</p>' +
          '<a class="btn btn-secondary btn-sm" href="https://account.apple.com/account/manage" target="_blank" rel="noopener"><span>Open account.apple.com</span>' + icon('external', 14) + '</a></div></li>' +
        '<li><span class="guide-n">2</span><div><b>Create an app-specific password</b>' +
          '<p>Go to <b>Sign-In and Security</b> → <b>App-Specific Passwords</b>, select <b>+</b> and name it “Warranty tracker”.</p></div></li>' +
        '<li><span class="guide-n">3</span><div><b>Paste it here</b>' +
          '<form class="form" id="icloud-form" novalidate>' +
            field({ name: 'address', label: 'iCloud email', type: 'email', value: '', placeholder: 'you@icloud.com', attrs: ' autocomplete="email"' }) +
            field({ name: 'apppw', label: 'App-specific password', value: '', placeholder: 'abcd-efgh-ijkl-mnop', attrs: ' autocomplete="off" spellcheck="false" autocapitalize="off"', hint: 'This isn’t your Apple Account password.' }) +
            '<div class="form-actions">' + btn('Connect iCloud Mail', null, { kind: 'primary', type: 'submit' }) + '</div>' +
          '</form></div></li>' +
      '</ol>',
      { step: 2, back: 'connect' }
    );
    return { html };
  }

  function openGmailConsent() {
    modal({
      title: 'Allow read-only access to Gmail?',
      body:
        '<p class="modal-note">' + icon('alert', 14) + 'Simulated. In the real app, Google shows this step.</p>' +
        '<form class="form" id="gmail-form" novalidate>' +
          field({ name: 'address', label: 'Gmail address', type: 'email', value: '', placeholder: 'you@gmail.com', attrs: ' autocomplete="email"' }) +
        '</form>' +
        '<ul class="scope">' +
          '<li>' + icon('eye') + '<span><b>Read your email</b> so we can find receipts</span></li>' +
          '<li>' + icon('ban') + '<span><b>Can’t send, delete or change</b> anything in your inbox</span></li>' +
        '</ul>',
      actions: [
        { label: 'Cancel', action: 'close-modal', kind: 'ghost' },
        { label: 'Allow', action: 'gmail-allow', kind: 'primary' },
      ],
    });
    setTimeout(() => { const f = $('#f-address', $('.modal')); if (f) f.focus(); }, 50);
  }

  function validEmail(v, re) { return (re || /^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(v); }

  function showError(inputId, msg) {
    const el = document.getElementById(inputId + '-error');
    const input = document.getElementById(inputId);
    if (el) { el.textContent = msg || ''; el.hidden = !msg; }
    if (input) {
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) { input.setAttribute('aria-describedby', inputId + '-error'); input.focus(); }
    }
  }

  function startScan(provider, address) {
    const set = state.accounts.length ? 'b' : 'a';
    ui.scan = { provider, address, set, emails: sampleEmails(set), shown: 0, done: false, total: set === 'a' ? 1284 : 312 };
    go('scan');
  }

  /* ---------------------------------------------------------------- Scan */
  function viewScan() {
    if (!ui.scan) return { html: '', after: () => redirect(state.onboarded ? 'settings' : 'connect') };
    const s = ui.scan;
    const html = onbShell(
      '<header class="onb-head"><h1 id="scan-title">Looking for receipts…</h1>' +
      '<p class="lede" id="scan-sub">Checking <b>' + esc(s.address) + '</b>. Only emails from shops are opened.</p></header>' +
      '<div class="scan-meter"><span id="scan-bar"></span></div>' +
      '<dl class="scan-stats">' +
        '<div><dt>Emails from shops</dt><dd class="mono" id="st-shop">0</dd></div>' +
        '<div><dt>Receipts found</dt><dd class="mono" id="st-found">0</dd></div>' +
        '<div><dt>Skipped</dt><dd class="mono" id="st-skip">0</dd></div>' +
      '</dl>' +
      '<ul class="mail-list" id="mail-list" aria-live="polite"></ul>' +
      '<div class="onb-foot" id="scan-foot" hidden>' +
        btn('Review receipts', 'go-review', { kind: 'primary', cls: 'btn-lg' }) +
      '</div>',
      { step: 3 }
    );
    return { html, after: runScan };
  }

  function runScan() {
    const s = ui.scan;
    const list = $('#mail-list');
    const step = reduceMotion ? 60 : 340;
    let found = 0, skipped = 0;
    const run = (s.run = uid());
    s.shown = 0;

    function paintRow(m) {
      const li = document.createElement('li');
      li.className = 'mail';
      li.innerHTML =
        '<span class="mail-ic">' + icon('mail', 14) + '</span>' +
        '<span class="mail-text"><b>' + esc(m.from) + '</b><span>' + esc(m.subject) + '</span></span>' +
        '<span class="mail-tag is-pending">Reading…</span>';
      list.prepend(li);
      return li;
    }

    function resolveRow(li, m) {
      const tag = $('.mail-tag', li);
      tag.classList.remove('is-pending');
      if (m.kind === 'receipt') {
        found++;
        li.classList.add('is-receipt');
        tag.innerHTML = icon('check', 12) + 'Receipt';
      } else {
        skipped++;
        li.classList.add('is-skipped');
        tag.textContent = 'Skipped · ' + SKIP_REASONS[m.kind];
      }
      $('#st-found').textContent = found;
      $('#st-skip').textContent = skipped;
    }

    function tick() {
      if (s.run !== run || route().name !== 'scan' || !$('#mail-list')) return;
      if (s.shown >= s.emails.length) return finish();
      const m = s.emails[s.shown++];
      const li = paintRow(m);
      $('#st-shop').textContent = s.shown;
      $('#scan-bar').style.transform = 'scaleX(' + (s.shown / s.emails.length).toFixed(3) + ')';
      setTimeout(() => { resolveRow(li, m); setTimeout(tick, step * 0.4); }, step);
    }

    function finish() {
      s.done = true;
      $('#scan-title').textContent = found ? 'Found ' + plural(found, 'receipt') : 'No receipts found';
      $('#scan-sub').innerHTML = 'Checked ' + s.total.toLocaleString('en') + ' emails in <b>' + esc(s.address) + '</b>. ' +
        s.emails.length + (s.emails.length === 1 ? ' was' : ' were') + ' from shops.';
      $('#scan-foot').hidden = false;
      $('#scan-foot .btn').focus();
    }

    setTimeout(tick, reduceMotion ? 0 : 500);
  }

  /* ---------------------------------------------------------------- Review */
  function viewReview() {
    if (!ui.scan || !ui.scan.done) return { html: '', after: () => redirect(state.onboarded ? 'settings' : 'connect') };
    const s = ui.scan;
    const items = sampleItems(s.set).filter((it) => !findItem(it.id));
    const skipped = s.emails.filter((m) => m.kind !== 'receipt');
    const rows = items.map((it) => {
      const flags = Object.keys(it.review || {}).length;
      return '<li><label class="review-row">' +
        '<input type="checkbox" name="keep" value="' + it.id + '" checked />' +
        catIcon(it.category) +
        '<span class="review-text"><b>' + esc(it.name) + '</b>' +
          '<span>' + esc(it.merchant) + ' · ' + fmtDate(it.purchased) + '</span></span>' +
        (flags ? '<span class="flag">' + icon('alert', 12) + 'Check ' + plural(flags, 'detail') + '</span>' : '') +
        '<span class="num review-price">' + money(it.price) + '</span>' +
      '</label></li>';
    }).join('');

    const html = onbShell(
      '<header class="onb-head"><h1>' + (items.length ? 'Add these to your vault?' : 'Nothing new to add') + '</h1>' +
      '<p class="lede">' + (items.length
        ? 'Untick anything you don’t want to track. Items marked “Check” have a detail we weren’t sure about. You can fix it later.'
        : 'Every receipt in this inbox is already in your vault. We’ll keep checking for new ones.') + '</p></header>' +
      (items.length ? '<form id="review-form"><ul class="review-list">' + rows + '</ul></form>' : '') +
      '<details class="skipped"><summary>' + plural(skipped.length, 'email') + ' skipped ' + icon('chevron', 14) + '</summary><ul>' +
        skipped.map((m) => '<li><b>' + esc(m.from) + '</b><span>' + esc(m.subject) + '</span><em>' + SKIP_REASONS[m.kind] + '</em></li>').join('') +
      '</ul><p class="fineprint">Newsletters, delivery updates, rides, food and subscriptions don’t come with a warranty, so we leave them out.</p></details>' +
      '<div class="onb-foot">' +
        (items.length
          ? btn('Add ' + plural(items.length, 'item') + ' to vault', 'finish-review', { kind: 'primary', cls: 'btn-lg', id: 'review-go' })
          : btn('Go to vault', 'finish-review', { kind: 'primary', cls: 'btn-lg' })) +
      '</div>',
      { step: 4 }
    );
    return { html };
  }

  function finishReview() {
    const s = ui.scan;
    const keep = $$('#review-form input[name="keep"]:checked').map((x) => x.value);
    const items = sampleItems(s.set).filter((it) => keep.includes(it.id) && !findItem(it.id));
    items.forEach((it) => {
      it.source = s.provider;
      it.added = iso(today());
      state.items.push(it);
    });
    const now = new Date().toISOString();
    state.accounts.push({ id: uid(), provider: s.provider, address: s.address, connected: now, lastCheck: now });
    if (state.plan === 'free' && !state.trialEnds) {
      state.plan = 'trial';
      state.trialEnds = iso(addDays(today(), 14));
    }
    const first = !state.onboarded;
    state.onboarded = true;
    ui.scan = null;
    save();
    go('vault');
    toast(first
      ? (items.length ? plural(items.length, 'item') + ' added. We’ll keep checking your inbox.' : 'You’re set up. We’ll keep checking your inbox.')
      : (items.length ? plural(items.length, 'item') + ' added from ' + s.address + '.' : s.address + ' connected.'));
  }

  /* ==========================================================================
     Vault
     ========================================================================== */
  function viewVault() {
    const items = state.items;
    if (!items.length) {
      return {
        html:
          '<header class="page-head"><div><h1>Vault</h1></div></header>' +
          '<section class="empty">' +
            '<div class="empty-art" aria-hidden="true">' + icon('receipt', 28) + '</div>' +
            '<h2>No receipts yet</h2>' +
            '<p>Add a receipt and we’ll track its warranty and return window. Or connect your inbox and we’ll find your receipts for you.</p>' +
            '<div class="empty-actions">' +
              '<a class="btn btn-primary" href="#/add">' + icon('camera') + '<span>Add a receipt</span></a>' +
              (state.accounts.length ? '' : '<a class="btn btn-secondary" href="#/privacy">' + icon('mail') + '<span>Connect your inbox</span></a>') +
            '</div>' +
          '</section>',
      };
    }

    const covered = items.filter((it) => info(it).status !== 'expired').reduce((a, it) => a + Number(it.price || 0), 0);
    const att = attention();
    const merchants = Array.from(new Set(items.map((it) => it.merchant))).sort((a, b) => a.localeCompare(b));
    const cats = CATS.filter((c) => items.some((it) => it.category === c.key));

    const html =
      '<header class="page-head">' +
        '<div><h1>Vault</h1><p class="muted">' + plural(items.length, 'item') + ' · <span class="num">' + money(covered) + '</span> still under warranty</p></div>' +
        '<div class="page-actions">' + btn('Export PDF', 'export-all', { kind: 'secondary', icon: 'download' }) + '</div>' +
      '</header>' +
      (att.length ? '<section class="attention" aria-labelledby="att-title"><h2 id="att-title" class="section-label">Needs attention</h2><ul class="att-list">' +
        att.slice(0, 6).map(attCard).join('') + '</ul></section>' : '') +
      '<section class="vault" aria-label="All items">' +
        '<div class="toolbar">' +
          '<label class="search">' + icon('search') + '<span class="sr-only">Search</span>' +
            '<input type="search" id="q" placeholder="Search items, shops, order numbers" value="' + esc(ui.q) + '" autocomplete="off" /></label>' +
          '<div class="filters">' +
            '<div class="seg" role="group" aria-label="Status" id="seg"></div>' +
            '<div class="selects">' +
              '<label class="select-sm"><span class="sr-only">Category</span><select id="flt-cat"><option value="all">All categories</option>' +
                cats.map((c) => '<option value="' + c.key + '"' + (ui.cat === c.key ? ' selected' : '') + '>' + c.label + '</option>').join('') + '</select></label>' +
              '<label class="select-sm"><span class="sr-only">Shop</span><select id="flt-merchant"><option value="all">All shops</option>' +
                merchants.map((m) => '<option' + (ui.merchant === m ? ' selected' : '') + '>' + esc(m) + '</option>').join('') + '</select></label>' +
              '<label class="select-sm"><span class="sr-only">Sort</span><select id="flt-sort">' +
                [['soonest', 'Ending soonest'], ['newest', 'Newest purchase'], ['price', 'Highest price']].map((o) =>
                  '<option value="' + o[0] + '"' + (ui.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<ul class="items" id="items"></ul>' +
        '<p class="list-foot muted" id="list-foot"></p>' +
      '</section>' +
      (state.plan === 'free' ? '<p class="plan-note">' + plural(items.length, 'item') + ' of ' + FREE_LIMIT + ' on the free plan. <a href="#/settings" data-section="plan">See Plus</a></p>' : '');

    return { html, after: renderList };
  }

  function attCard(a) {
    const it = a.it, i = a.i;
    let tone, title, body;
    if (a.kind === 'return') {
      tone = 'return';
      title = 'Return by ' + fmtDate(i.rEnd, { short: true, weekday: true });
      body = i.rLeft === 0 ? 'Last day to return it' : plural(i.rLeft, 'day') + ' left to return it';
    } else if (a.kind === 'warranty') {
      tone = 'expiring';
      title = 'Warranty ends ' + fmtDate(i.end, { short: true });
      body = 'Check it works properly while it’s covered';
    } else {
      tone = 'review';
      title = 'Check ' + plural(a.n, 'detail');
      body = Object.keys(it.review).map((k) => FIELD_NAMES[k] || k).join(', ') + ' may be wrong';
    }
    return '<li><a class="att att-' + tone + '" href="#/item/' + it.id + '">' +
      '<span class="att-title">' + (tone === 'return' ? icon('return', 14) : tone === 'expiring' ? icon('clock', 14) : icon('alert', 14)) + title + '</span>' +
      '<span class="att-item">' + esc(it.name) + '</span>' +
      '<span class="att-body">' + body + '</span></a></li>';
  }

  const FIELD_NAMES = { name: 'Item name', merchant: 'Shop', price: 'Price', purchased: 'Purchase date', orderNo: 'Order number', category: 'Category' };

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
      '<span class="seg-n">' + counts[s[0]] + '</span></button>'
    ).join('');

    if (!list.length) {
      el.innerHTML = '<li class="no-results"><p><b>No items match</b></p><p class="muted">Try a different search or clear the filters.</p>' +
        btn('Clear filters', 'clear-filters', { kind: 'secondary', cls: 'btn-sm' }) + '</li>';
      $('#list-foot').textContent = '';
      return;
    }

    el.innerHTML = list.map(({ it, i }) =>
      '<li><a class="row" href="#/item/' + it.id + '">' +
        catIcon(it.category) +
        '<span class="row-main">' +
          '<span class="row-name">' + esc(it.name) + (it.review && Object.keys(it.review).length ? '<span class="flag-dot" title="Has details to check"></span>' : '') + '</span>' +
          '<span class="row-meta">' + esc(it.merchant) + ' · ' + fmtDate(it.purchased, { short: true }) + '</span>' +
        '</span>' +
        '<span class="row-cover">' +
          '<span class="row-status status-' + i.status + '">' + statusText(i, true) + '</span>' +
          coverage(i) +
          '<span class="row-pills">' + returnPill(i) + '</span>' +
        '</span>' +
        '<span class="row-price num">' + money(it.price) + '</span>' +
        '<span class="row-go">' + icon('chevron') + '</span>' +
      '</a></li>'
    ).join('');
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
    const done = () => wrap.remove();
    if (reduceMotion) done(); else setTimeout(done, 240);
    ui.returnFocus = null;
    return back;
  }

  function refreshDrawer() { if (ui.drawerId && findItem(ui.drawerId)) openDrawer(ui.drawerId); }

  function timeline(i) {
    const t = today();
    const pct = (d) => Math.max(0, Math.min(100, (daysFrom(i.bought, d) / i.total) * 100));
    const todayPct = pct(t);
    const retPct = i.rDays > 0 ? Math.max(1.2, pct(i.rEnd)) : 0;
    const todayAlign = todayPct < 12 ? 'start' : todayPct > 88 ? 'end' : 'mid';
    return '<div class="tl tl-' + i.status + '" aria-hidden="true">' +
      '<div class="tl-track">' +
        '<span class="tl-used" style="width:' + todayPct + '%"></span>' +
        (retPct ? '<span class="tl-return' + (i.returnOpen ? ' is-open' : '') + '" style="width:' + retPct + '%"></span>' : '') +
        '<span class="tl-today tl-today-' + todayAlign + '" style="left:' + todayPct + '%"><span>Today</span></span>' +
      '</div>' +
      '<div class="tl-labels">' +
        '<span><b>Bought</b>' + fmtDate(i.bought) + '</span>' +
        '<span class="tl-end"><b>' + (i.status === 'expired' ? 'Ended' : 'Ends') + '</b>' + fmtDate(i.end) + '</span>' +
      '</div>' +
    '</div>';
  }

  function drawerDetail(it) {
    const i = info(it);
    const flags = Object.keys(it.review || {});
    const head = i.status === 'expired'
      ? 'Warranty ended ' + span(i.left) + ' ago'
      : (i.left === 0 ? 'Warranty ends today' : span(i.left) + ' of warranty left');
    const sub = i.status === 'expired'
      ? 'It ended on ' + fmtDate(i.end, { weekday: true }) + '. The maker may still repair it for a fee.'
      : i.status === 'expiring'
        ? 'Covered until ' + fmtDate(i.end, { weekday: true }) + '. Check it works properly now, and claim before then if anything’s wrong.'
        : 'Covered until ' + fmtDate(i.end, { weekday: true }) + '.';

    const defaultWarranty = !it.warrantyMonths;
    const warrantySource = it.warrantyNote ? esc(it.warrantyNote) : defaultWarranty ? 'Default for ' + catLabel(it.category).toLowerCase() : 'Set by you';
    const rDefault = it.returnDays == null;

    const rems = remindersFor(it);
    const t = today();

    return '<header class="d-head">' +
        '<div class="d-top">' +
          '<span class="d-cat">' + catIcon(it.category) + catLabel(it.category) + '</span>' +
          '<button type="button" class="icon-btn" data-action="close-drawer" aria-label="Close">' + icon('x') + '</button>' +
        '</div>' +
        '<h2 id="d-title" class="d-title">' + esc(it.name) + '</h2>' +
        '<p class="muted">' + esc(it.merchant) + (it.orderNo ? ' · <span class="mono">' + esc(it.orderNo) + '</span>' : '') + '</p>' +
      '</header>' +
      '<div class="d-body">' +
        (flags.length ? '<section class="callout callout-review">' + icon('alert') + '<div>' +
          '<p><b>Check ' + (flags.length === 1 ? 'this detail' : 'these details') + '</b></p>' +
          flags.map((f) => '<p>' + (FIELD_NAMES[f] || f) + ': ' + esc(it.review[f]) + '</p>').join('') +
          '<div class="callout-actions">' + btn('Looks right', 'review-ok', { kind: 'secondary', cls: 'btn-sm', data: { id: it.id } }) +
          btn('Edit', 'edit', { kind: 'ghost', cls: 'btn-sm', data: { id: it.id } }) + '</div></div></section>' : '') +

        '<section class="d-status">' +
          '<div class="d-status-top">' + statusPill(i) + (i.returnOpen ? returnPill(i) : '') + '</div>' +
          '<p class="d-big">' + head + '</p>' +
          '<p class="muted">' + sub + '</p>' +
          timeline(i) +
          (i.returnOpen ? '<p class="d-return">' + icon('return', 14) + '<span>Changed your mind? You can return it until <b>' + fmtDate(i.rEnd, { weekday: true }) + '</b>, ' +
            (i.rLeft === 0 ? 'today is the last day.' : plural(i.rLeft, 'day') + ' from now.') + '</span></p>' : '') +
        '</section>' +

        '<section class="d-sec"><h3 class="section-label">Details</h3><dl class="dl">' +
          '<div><dt>Price paid</dt><dd class="num">' + money(it.price) + '</dd></div>' +
          '<div><dt>Bought</dt><dd>' + fmtDate(it.purchased) + '</dd></div>' +
          '<div><dt>Shop</dt><dd>' + esc(it.merchant) + '</dd></div>' +
          '<div><dt>Order number</dt><dd class="mono">' + (it.orderNo ? esc(it.orderNo) : '<span class="muted">Not found</span>') + '</dd></div>' +
          '<div><dt>Warranty</dt><dd>' + monthsLabel(i.months) + '<span class="dd-sub">' + warrantySource + '</span></dd></div>' +
          '<div><dt>Return window</dt><dd>' + (i.rDays ? plural(i.rDays, 'day') : 'None') + '<span class="dd-sub">' + (rDefault ? 'Your default' : it.email ? 'Shop’s return policy' : 'Set by you') + '</span></dd></div>' +
          (it.notes ? '<div><dt>Notes</dt><dd>' + esc(it.notes) + '</dd></div>' : '') +
        '</dl></section>' +

        '<section class="d-sec"><h3 class="section-label">Reminders</h3>' +
          (rems.length ? '<ul class="rem-list">' + rems.sort((a, b) => a.date - b.date).map((r) => {
            const past = r.date < t;
            return '<li class="' + (past ? 'is-past' : '') + '">' + icon(past ? 'check' : 'bell', 14) +
              '<span>' + REMINDER_TEXT[r.kind] + '</span><span class="mono muted">' + (past ? 'Sent ' : '') + fmtDate(r.date, { short: true }) + '</span></li>';
          }).join('') + '</ul>' : '<p class="muted">Reminders are off. <a href="#/settings">Turn them on in Settings</a></p>') +
        '</section>' +

        '<section class="d-sec"><h3 class="section-label">Proof of purchase</h3>' + proofCard(it) + '</section>' +
      '</div>' +
      '<footer class="d-foot">' +
        btn('Export for a claim', 'export-one', { kind: 'primary', icon: 'download', data: { id: it.id } }) +
        btn('Edit', 'edit', { kind: 'secondary', icon: 'pencil', data: { id: it.id } }) +
        '<button type="button" class="icon-btn icon-btn-danger" data-action="delete" data-id="' + it.id + '" aria-label="Delete ' + esc(it.name) + '">' + icon('trash') + '</button>' +
      '</footer>';
  }

  function proofCard(it) {
    if (it.photo) {
      return '<button type="button" class="proof proof-photo" data-action="view-proof" data-id="' + it.id + '">' +
        '<img src="' + it.photo + '" alt="" /><span class="proof-cap">' + icon('camera', 14) + 'Photo of receipt · added ' + fmtDate(it.added || it.purchased) + '</span></button>';
    }
    if (it.email) {
      return '<button type="button" class="proof" data-action="view-proof" data-id="' + it.id + '">' +
        '<span class="proof-ic">' + icon('mail') + '</span>' +
        '<span class="proof-text"><b>' + esc(it.email.subject) + '</b><span>' + esc(it.email.from) + ' · ' + fmtDate(it.email.received) + '</span></span>' +
        icon('chevron') + '</button>' +
        (it.pdf ? '<button type="button" class="proof" data-action="view-proof" data-id="' + it.id + '"><span class="proof-ic">' + icon('file') + '</span>' +
          '<span class="proof-text"><b>' + esc(it.pdf) + '</b><span>PDF attached to the email</span></span>' + icon('chevron') + '</button>' : '');
    }
    if (it.fileName) {
      return '<div class="proof"><span class="proof-ic">' + icon('file') + '</span><span class="proof-text"><b>' + esc(it.fileName) + '</b><span>Uploaded ' + fmtDate(it.added || it.purchased) + '</span></span></div>';
    }
    return '<p class="muted">No receipt attached. Add a photo so you have proof if you need to claim.</p>' +
      '<label class="btn btn-secondary btn-sm file-btn">' + icon('camera') + '<span>Add a photo</span>' +
      '<input type="file" accept="image/*" capture="environment" data-attach="' + it.id + '" /></label>';
  }

  function viewProof(it) {
    let body;
    if (it.photo) {
      body = '<img class="proof-full" src="' + it.photo + '" alt="Photo of the receipt for ' + esc(it.name) + '" />';
    } else {
      body = '<article class="receipt">' +
        '<header><p class="mono muted">From: ' + esc(it.email.from) + '</p><p class="mono muted">Received: ' + fmtDate(it.email.received, { weekday: true }) + '</p>' +
        '<h3>' + esc(it.email.subject) + '</h3></header>' +
        '<p>Thanks for shopping with ' + esc(it.merchant) + '. Here are your order details.</p>' +
        '<table><tbody>' +
          '<tr><td>' + esc(it.name) + '<br><span class="muted">Qty 1</span></td><td class="num">' + money(it.price) + '</td></tr>' +
          '<tr class="receipt-total"><td>Total paid</td><td class="num">' + money(it.review && it.review.price ? Number(it.price) + 9.99 : it.price) + '</td></tr>' +
        '</tbody></table>' +
        '<p class="mono muted">Order ' + esc(it.orderNo || '—') + '</p>' +
        (it.pdf ? '<p class="receipt-att">' + icon('file', 14) + esc(it.pdf) + '</p>' : '') +
      '</article>';
    }
    modal({
      title: it.photo ? 'Receipt photo' : 'Original email',
      body: body + '<p class="modal-note">' + icon('lock', 14) + 'Stored with this item. Only you can see it.</p>',
      actions: [{ label: 'Close', action: 'close-modal', kind: 'secondary' }],
      wide: true,
    });
  }

  function itemForm(v, flags, o) {
    flags = flags || {};
    o = o || {};
    const catDefault = state.settings.defaults[v.category || 'electronics'];
    return '<div class="form-grid">' +
      field({ name: 'name', label: 'Item', value: v.name || '', placeholder: 'e.g. Bosch dishwasher', required: true, flag: flags.name, wide: true }) +
      field({ name: 'merchant', label: 'Shop', value: v.merchant || '', placeholder: 'e.g. MediaMarkt', flag: flags.merchant }) +
      field({ name: 'category', label: 'Category', type: 'select', value: v.category || 'electronics', options: CATS.map((c) => ({ value: c.key, label: c.label })), flag: flags.category }) +
      field({ name: 'price', label: 'Price paid (€)', type: 'text', value: v.price != null && v.price !== '' ? String(v.price) : '', placeholder: '0.00', attrs: ' inputmode="decimal"', flag: flags.price }) +
      field({ name: 'purchased', label: 'Purchase date', type: 'date', value: v.purchased || iso(today()), attrs: ' max="' + iso(today()) + '"', flag: flags.purchased }) +
      field({ name: 'orderNo', label: 'Order number', value: v.orderNo || '', placeholder: 'Optional', flag: flags.orderNo }) +
      field({ name: 'warrantyMonths', label: 'Warranty', type: 'select', value: v.warrantyMonths || '',
        options: [{ value: '', label: 'Default (' + monthsLabel(catDefault) + ')' }].concat(WARRANTY_OPTIONS.map((m) => ({ value: m, label: monthsLabel(m) }))),
        hint: o.hideHint ? '' : 'Check the box or manual if the maker gives longer.' }) +
      field({ name: 'returnDays', label: 'Return window', type: 'select', value: v.returnDays == null ? '' : v.returnDays,
        options: [{ value: '', label: 'Default (' + plural(state.settings.returnDays, 'day') + ')' }].concat(RETURN_OPTIONS.map((d) => ({ value: d, label: d ? plural(d, 'day') : 'No returns' }))) }) +
      field({ name: 'notes', label: 'Notes', type: 'textarea', value: v.notes || '', placeholder: 'Serial number, where it’s kept, anything useful for a claim', wide: true }) +
    '</div>';
  }

  function readForm(form) {
    const f = new FormData(form);
    const price = parseFloat(String(f.get('price') || '').replace(/[€\s]/g, '').replace(',', '.'));
    return {
      name: String(f.get('name') || '').trim(),
      merchant: String(f.get('merchant') || '').trim() || 'Unknown shop',
      category: f.get('category'),
      price: isNaN(price) ? 0 : Math.round(price * 100) / 100,
      priceRaw: String(f.get('price') || '').trim(),
      purchased: f.get('purchased') || iso(today()),
      orderNo: String(f.get('orderNo') || '').trim(),
      warrantyMonths: f.get('warrantyMonths') ? Number(f.get('warrantyMonths')) : null,
      returnDays: f.get('returnDays') === '' ? null : Number(f.get('returnDays')),
      notes: String(f.get('notes') || '').trim(),
    };
  }

  function validateItem(v) {
    let ok = true;
    showError('f-price', '');
    showError('f-purchased', '');
    showError('f-name', '');
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
    const body = !state.items.length
      ? '<section class="empty"><div class="empty-art" aria-hidden="true">' + icon('bell', 28) + '</div><h2>No reminders yet</h2>' +
        '<p>Once you add receipts, reminders for warranties and return windows show up here.</p>' +
        '<div class="empty-actions"><a class="btn btn-primary" href="#/add">' + icon('plus') + '<span>Add a receipt</span></a></div></section>'
      : !on
        ? '<section class="empty"><div class="empty-art" aria-hidden="true">' + icon('bell', 28) + '</div><h2>Reminders are off</h2>' +
          '<p>Turn them on and we’ll tell you before a warranty ends or a return window closes.</p>' +
          '<div class="empty-actions"><a class="btn btn-primary" href="#/settings">Turn on reminders</a></div></section>'
        : !list.length
          ? '<section class="empty"><div class="empty-art" aria-hidden="true">' + icon('check', 28) + '</div><h2>Nothing coming up</h2>' +
            '<p>No warranties end and no return windows close in the next 12 months.</p></section>'
          : groups.map((g) => {
              const rows = list.filter((x) => g.test(daysFrom(t, x.date)));
              if (!rows.length) return '';
              return '<section class="rem-group"><h2 class="section-label">' + g.title + '</h2><ul class="rem-rows">' + rows.map((x) => {
                const d = daysFrom(t, x.date);
                const deadline = x.kind === 'r2' ? x.info.rEnd : x.info.end;
                return '<li><a class="rem-row" href="#/item/' + x.item.id + '">' +
                  '<span class="rem-date' + (d <= 7 ? ' is-soon' : '') + '"><span class="mono">' + MONTHS[x.date.getMonth()].toUpperCase() + '</span><b>' + x.date.getDate() + '</b></span>' +
                  '<span class="rem-text"><b>' + esc(x.item.name) + '</b><span>' +
                    (x.kind === 'r2' ? 'Return window closes ' : 'Warranty ends ') + fmtDate(deadline, { short: true, weekday: true }) +
                  '</span></span>' +
                  '<span class="rem-when muted">' + (d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : 'In ' + span(d, true)) + '</span>' +
                  icon('chevron') +
                '</a></li>';
              }).join('') + '</ul></section>';
            }).join('');

    return {
      html: '<header class="page-head"><div><h1>Reminders</h1>' +
        '<p class="muted">We remind you ' + reminderSummary() + '.</p></div>' +
        '<div class="page-actions"><a class="btn btn-secondary" href="#/settings" data-section="reminders">' + icon('sliders') + '<span>Change</span></a></div></header>' + body,
    };
  }

  function reminderSummary() {
    const r = state.settings.remind;
    const w = [r.w30 && '30', r.w7 && '7'].filter(Boolean);
    const parts = [];
    if (w.length) parts.push(w.join(' and ') + ' days before a warranty ends');
    if (r.r2) parts.push('2 days before a return window closes');
    return parts.length ? parts.join(', and ') : 'about nothing right now';
  }

  /* ==========================================================================
     Add a receipt
     ========================================================================== */
  function viewAdd() {
    const a = ui.add || { stage: 'choose' };
    const back = '<header class="page-head"><div><h1>Add a receipt</h1>' +
      '<p class="muted">We’ll read the details and track the warranty and return window.</p></div></header>';

    if (state.plan === 'free' && state.items.length >= FREE_LIMIT) {
      return {
        html: back + '<section class="empty"><div class="empty-art" aria-hidden="true">' + icon('vault', 28) + '</div>' +
          '<h2>Your vault is full</h2><p>The free plan holds ' + FREE_LIMIT + ' items. Plus gives you unlimited items, inbox scanning and PDF exports for €3.50 a month.</p>' +
          '<div class="empty-actions">' + btn('See Plus', 'show-plans', { kind: 'primary' }) + '</div></section>',
      };
    }

    if (a.stage === 'choose') {
      return {
        html: back +
          '<div class="add-choices">' +
            '<label class="add-choice add-choice-main">' +
              '<span class="add-ic">' + icon('camera', 22) + '</span><b>Take a photo</b><span>Point your camera at a paper receipt</span>' +
              '<input type="file" accept="image/*" capture="environment" id="photo-input" class="sr-only" /></label>' +
            '<label class="add-choice">' +
              '<span class="add-ic">' + icon('upload', 22) + '</span><b>Upload a file</b><span>PDF invoice or a screenshot</span>' +
              '<input type="file" accept="image/*,application/pdf" id="file-input" class="sr-only" /></label>' +
            '<button type="button" class="add-choice" data-action="add-manual">' +
              '<span class="add-ic">' + icon('pencil', 22) + '</span><b>Enter details</b><span>No receipt to hand? Type it in</span></button>' +
          '</div>' +
          (state.accounts.length ? '' : '<p class="fineprint center">Most receipts arrive by email. <a href="#/privacy">Connect your inbox</a> and we’ll add them for you.</p>'),
      };
    }

    if (a.stage === 'reading') {
      return {
        html: back +
          '<section class="reading">' +
            '<div class="reading-img">' + (a.image ? '<img src="' + a.image + '" alt="Your receipt" />' : '<span class="reading-file">' + icon('file', 28) + esc(a.fileName || '') + '</span>') +
              '<span class="scanline" aria-hidden="true"></span></div>' +
            '<p class="reading-text" role="status">Reading your receipt…</p>' +
          '</section>',
        after: () => {
          setTimeout(() => {
            if (!ui.add || ui.add.stage !== 'reading') return;
            ui.add.stage = 'form';
            if (route().name === 'add') paint('add');
          }, reduceMotion ? 300 : 1800);
        },
      };
    }

    /* form */
    const flags = a.flags || {};
    const flagCount = Object.keys(flags).length;
    return {
      html: back +
        '<div class="add-form-wrap">' +
          (a.image ? '<aside class="add-thumb"><img src="' + a.image + '" alt="Your receipt" /></aside>' : '') +
          '<form class="form add-form" id="add-form" novalidate>' +
            (a.extracted
              ? '<p class="callout callout-ok">' + icon('check') + '<span><b>We read your receipt.</b> ' +
                (flagCount ? 'Check the field marked below, then save.' : 'Check the details, then save.') + '</span></p>'
              : '') +
            (flagCount ? '<p class="callout callout-review">' + icon('alert') + '<span>' + Object.keys(flags).map((k) => esc(flags[k])).join(' ') + '</span></p>' : '') +
            itemForm(a.values || {}, flags) +
            '<div class="form-actions">' +
              btn('Save to vault', null, { kind: 'primary', type: 'submit' }) +
              btn('Start over', 'add-reset', { kind: 'ghost' }) +
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
    const t = today();
    const extracted = {
      name: 'Samsung 55" QLED TV QE55Q80D', merchant: 'Harvey Norman', category: 'electronics',
      price: 799, purchased: iso(addDays(t, -1)), orderNo: 'HN-5520-118934', returnDays: 14,
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
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
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
     Settings
     ========================================================================== */
  function viewSettings() {
    const s = state.settings;
    const region = REGIONS[s.region];
    const acc = state.accounts.map((a) =>
      '<li class="acct">' + providerMark(a.provider) +
        '<span class="acct-text"><b>' + esc(a.address) + '</b><span>' + PROVIDERS[a.provider].label + ' · checked ' + relTime(a.lastCheck) + '</span></span>' +
        '<span class="acct-actions">' + btn('Check now', 'check-now', { kind: 'secondary', cls: 'btn-sm', data: { id: a.id } }) +
        btn('Disconnect', 'disconnect', { kind: 'ghost', cls: 'btn-sm', data: { id: a.id } }) + '</span>' +
      '</li>').join('');

    const plan = state.plan === 'plus'
      ? '<p><b>Plus</b></p><p class="muted">Inbox scanning, unlimited items and PDF exports.</p>'
      : state.plan === 'trial' && trialLeft() >= 0
        ? '<p><b>Plus trial</b> · ' + (trialLeft() === 0 ? 'ends today' : plural(trialLeft(), 'day') + ' left') + '</p>' +
          '<p class="muted">After the trial, Plus is €3.50 a month or €30 a year. Without it, you keep up to ' + FREE_LIMIT + ' items and add them yourself.</p>'
        : '<p><b>Free</b> · ' + state.items.length + ' of ' + FREE_LIMIT + ' items</p>' +
          '<p class="muted">Add up to ' + FREE_LIMIT + ' items yourself. Plus adds inbox scanning, unlimited items and PDF exports.</p>';

    const html =
      '<header class="page-head"><div><h1>Settings</h1></div></header>' +
      '<nav class="set-nav" aria-label="Settings sections">' +
        [['inbox', 'Inbox'], ['rules', 'Warranty rules'], ['reminders', 'Reminders'], ['privacy', 'Privacy & data'], ['plan', 'Plan']]
          .map((x) => '<a href="#/settings" data-section="' + x[0] + '">' + x[1] + '</a>').join('') +
      '</nav>' +

      '<section class="card" id="set-inbox"><h2>Inbox</h2>' +
        (state.accounts.length
          ? '<p class="muted card-sub">We check connected inboxes for new receipts every few hours.</p><ul class="accts">' + acc + '</ul>' +
            '<a class="btn btn-secondary btn-sm" href="#/connect">' + icon('plus') + '<span>Connect another inbox</span></a>'
          : '<p class="muted card-sub">No inbox connected. Connect Gmail or iCloud Mail and we’ll add receipts for you.</p>' +
            '<a class="btn btn-primary btn-sm" href="#/privacy">' + icon('mail') + '<span>Connect an inbox</span></a>') +
      '</section>' +

      '<section class="card" id="set-rules"><h2>Warranty rules</h2>' +
        '<p class="muted card-sub">Used when a receipt doesn’t say how long the warranty is. Items you’ve set yourself keep their own length.</p>' +
        '<div class="rules-top">' +
          field({ name: 'region', label: 'Where you shop', type: 'select', value: s.region, options: Object.keys(REGIONS).map((k) => ({ value: k, label: REGIONS[k].label })), hint: region.note }) +
          field({ name: 'returnDefault', label: 'Default return window', type: 'select', value: s.returnDays, options: [14, 30, 60].map((d) => ({ value: d, label: plural(d, 'day') })), hint: 'Most online shops in the EU give at least 14 days.' }) +
        '</div>' +
        '<table class="rules"><thead><tr><th scope="col">Category</th><th scope="col">Default warranty</th></tr></thead><tbody>' +
          CATS.map((c) => '<tr><th scope="row">' + catIcon(c.key) + c.label + '</th><td><label class="sr-only" for="def-' + c.key + '">Default warranty for ' + c.label + '</label>' +
            '<select id="def-' + c.key + '" data-default="' + c.key + '">' + WARRANTY_OPTIONS.map((m) =>
              '<option value="' + m + '"' + (s.defaults[c.key] === m ? ' selected' : '') + '>' + monthsLabel(m) + '</option>').join('') +
            '</select></td></tr>').join('') +
        '</tbody></table>' +
      '</section>' +

      '<section class="card" id="set-reminders"><h2>Reminders</h2>' +
        '<div class="switches">' +
          toggle('w30', s.remind.w30, '30 days before a warranty ends', 'Time to check it still works properly') +
          toggle('w7', s.remind.w7, '7 days before a warranty ends', 'Last call to make a claim') +
          toggle('r2', s.remind.r2, '2 days before a return window closes', 'In case you’ve changed your mind') +
        '</div>' +
        '<h3 class="section-label">Send reminders to</h3>' +
        '<div class="switches">' +
          toggle('device', s.device, 'This device', 'Notifications from your browser or home screen app') +
          toggle('emailCopy', s.emailCopy, 'Email', state.accounts[0] ? esc(state.accounts[0].address) : 'The address you sign in with') +
        '</div>' +
      '</section>' +

      '<section class="card" id="set-privacy"><h2>Privacy & data</h2>' +
        '<div class="set-rows">' +
          '<div class="set-row"><div><b>What we read</b><p class="muted">See exactly what we look at in your inbox, and what we never touch.</p></div>' + btn('View', 'show-privacy', { kind: 'secondary', cls: 'btn-sm' }) + '</div>' +
          '<div class="set-row"><div><b>Download your data</b><p class="muted">Every item and setting, as a JSON file.</p></div>' + btn('Download', 'download-json', { kind: 'secondary', cls: 'btn-sm' }) + '</div>' +
          '<div class="set-row"><div><b>Delete all data</b><p class="muted">Removes every item, receipt and connected inbox from this device and our servers.</p></div>' + btn('Delete all data', 'delete-all', { kind: 'danger', cls: 'btn-sm' }) + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="card" id="set-plan"><h2>Plan</h2><div class="plan-now">' + plan + '</div>' +
        (state.plan === 'plus' ? '' : btn('Choose a plan', 'show-plans', { kind: 'primary', cls: 'btn-sm' })) +
      '</section>' +

      '<p class="demo-reset">Prototype. Data stays in this browser. ' + btn('Restart the demo', 'reset-demo', { kind: 'link' }) + '</p>';

    return {
      html,
      after: () => {
        if (ui.section) {
          const el = document.getElementById('set-' + ui.section);
          ui.section = null;
          if (el) setTimeout(() => el.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' }), 30);
        }
      },
    };
  }

  function showPlans(reason) {
    modal({
      title: typeof reason === 'string' ? reason : 'Choose a plan',
      body:
        '<div class="plans">' +
          '<button type="button" class="plan" data-action="pick-plan" data-plan="month"><b>Monthly</b><span class="plan-price num">€3.50</span><span class="muted">per month</span></button>' +
          '<button type="button" class="plan is-best" data-action="pick-plan" data-plan="year"><span class="plan-tag">Save 29%</span><b>Yearly</b><span class="plan-price num">€30</span><span class="muted">per year</span></button>' +
        '</div>' +
        '<ul class="plan-list">' +
          '<li>' + icon('check', 14) + 'Inbox scanning for Gmail and iCloud</li>' +
          '<li>' + icon('check', 14) + 'Unlimited items</li>' +
          '<li>' + icon('check', 14) + 'PDF exports for claims and insurance</li>' +
        '</ul>' +
        '<p class="modal-note">' + icon('alert', 14) + 'Prototype. No payment is taken.</p>',
      actions: [{ label: 'Not now', action: 'close-modal', kind: 'ghost' }],
    });
  }

  /* ==========================================================================
     Export: a print view the browser saves as PDF
     ========================================================================== */
  function exportPdf(items, single) {
    if (!isPaid()) {
      showPlans('PDF export is part of Plus');
      return;
    }
    const printed = fmtDate(today());
    const rows = items.map((it) => {
      const i = info(it);
      return '<tr><td><b>' + esc(it.name) + '</b><br>' + esc(it.merchant) + (it.orderNo ? ' · ' + esc(it.orderNo) : '') + '</td>' +
        '<td>' + fmtDate(it.purchased) + '</td><td class="num">' + money(it.price) + '</td>' +
        '<td>' + fmtDate(i.end) + '<br><span class="p-muted">' + statusText(i) + '</span></td></tr>';
    }).join('');

    let html;
    if (single) {
      const it = items[0], i = info(it);
      html = '<div class="p-page">' +
        '<header class="p-head"><p class="p-kicker">Warranty claim summary</p><h1>' + esc(it.name) + '</h1><p class="p-muted">Prepared ' + printed + '</p></header>' +
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
        (it.photo ? '<img class="p-photo" src="' + it.photo + '" alt="" />'
          : it.email ? '<p>Order confirmation email from ' + esc(it.email.from) + ', received ' + fmtDate(it.email.received) + ':<br><b>' + esc(it.email.subject) + '</b></p>' +
            (it.pdf ? '<p>Attached invoice: ' + esc(it.pdf) + '</p>' : '')
          : '<p>No receipt attached.</p>') +
        '</div>';
    } else {
      html = '<div class="p-page">' +
        '<header class="p-head"><p class="p-kicker">Warranty summary</p><h1>' + plural(items.length, 'item') + '</h1>' +
        '<p class="p-muted">Prepared ' + printed + ' · total paid ' + money(items.reduce((a, it) => a + Number(it.price || 0), 0)) + '</p></header>' +
        '<table class="p-table"><thead><tr><th>Item</th><th>Bought</th><th class="num">Paid</th><th>Warranty until</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '</div>';
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
    return wrap;
  }

  function closeModal(instant) {
    const wrap = $('.modal-wrap:not(.is-closing)');
    if (!wrap) return;
    wrap.classList.remove('is-open');
    wrap.classList.add('is-closing');
    if (instant || reduceMotion) wrap.remove(); else setTimeout(() => wrap.remove(), 180);
    if (!instant && ui.modalFocus && document.contains(ui.modalFocus)) ui.modalFocus.focus({ preventScroll: true });
  }

  function confirmModal(o) {
    modal({
      title: o.title,
      body: '<p>' + o.text + '</p>',
      actions: [
        { label: o.cancel, action: 'close-modal', kind: 'ghost' },
        { label: o.label, action: o.action, kind: 'danger', data: o.data },
      ],
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
      setTimeout(() => el.remove(), reduceMotion ? 0 : 200);
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
  const ACTIONS = {
    'start-manual': () => {
      state.onboarded = true;
      save();
      go('vault');
    },
    'connect-gmail': () => openGmailConsent(),
    'gmail-allow': () => {
      const input = $('.modal #f-address');
      const v = input.value.trim();
      if (!validEmail(v)) return showError('f-address', 'Enter your Gmail address, like name@gmail.com.');
      if (state.accounts.some((a) => a.address.toLowerCase() === v.toLowerCase())) return showError('f-address', 'This inbox is already connected.');
      closeModal(true);
      startScan('gmail', v);
    },
    'go-review': () => go('review'),
    'finish-review': finishReview,
    'close-drawer': () => go('vault'),
    'close-modal': () => closeModal(),
    'status': (el) => {
      ui.status = el.dataset.v;
      renderList();
      const again = $('#seg [data-v="' + ui.status + '"]');
      if (again) again.focus();
    },
    'clear-filters': () => {
      ui.q = ''; ui.status = 'all'; ui.cat = 'all'; ui.merchant = 'all';
      paint('vault');
    },
    'edit': (el) => { ui.editing = el.dataset.id; openDrawer(el.dataset.id); },
    'cancel-edit': () => { ui.editing = null; refreshDrawer(); },
    'review-ok': (el) => {
      const it = findItem(el.dataset.id);
      delete it.review;
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
      go('vault');
      toast(esc(gone.name) + ' deleted.', () => {
        state.items.splice(idx, 0, gone);
        save();
        if (ui.base === 'vault') paint('vault');
      });
    },
    'view-proof': (el) => viewProof(findItem(el.dataset.id)),
    'export-one': (el) => exportPdf([findItem(el.dataset.id)], true),
    'export-all': () => {
      const { list } = filtered();
      exportPdf(list.map((x) => x.it), false);
    },
    'add-manual': () => { ui.add = { stage: 'form', values: {}, flags: {}, extracted: false }; paint('add'); },
    'add-reset': () => { ui.add = null; paint('add'); },
    'show-plans': () => showPlans(),
    'pick-plan': (el) => {
      state.plan = 'plus';
      save();
      closeModal(true);
      toast(el.dataset.plan === 'year' ? 'You’re on Plus, billed yearly.' : 'You’re on Plus, billed monthly.');
      if (ui.base === 'settings') paint('settings');
    },
    'check-now': (el) => {
      const a = state.accounts.find((x) => x.id === el.dataset.id);
      el.disabled = true;
      $('span', el).textContent = 'Checking…';
      setTimeout(() => {
        a.lastCheck = new Date().toISOString();
        save();
        if (ui.base === 'settings') paint('settings');
        toast('No new receipts in ' + esc(a.address) + '.');
      }, reduceMotion ? 100 : 1200);
    },
    'disconnect': (el) => {
      const a = state.accounts.find((x) => x.id === el.dataset.id);
      confirmModal({
        title: 'Disconnect ' + esc(a.address) + '?',
        text: 'We’ll stop checking this inbox for receipts. Items already in your vault stay.',
        label: 'Disconnect', cancel: 'Keep connected', action: 'disconnect-yes', data: { id: a.id },
      });
    },
    'disconnect-yes': (el) => {
      const a = state.accounts.find((x) => x.id === el.dataset.id);
      state.accounts = state.accounts.filter((x) => x.id !== a.id);
      save();
      closeModal(true);
      paint('settings');
      toast(esc(a.address) + ' disconnected.');
    },
    'show-privacy': () => modal({ title: 'What we read', body: privacyBlock(), actions: [{ label: 'Close', action: 'close-modal', kind: 'secondary' }], wide: true }),
    'download-json': () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'warranty-tracker-' + iso(today()) + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    'delete-all': () => confirmModal({
      title: 'Delete all your data?',
      text: 'This deletes ' + plural(state.items.length, 'item') + ', every saved receipt and ' + plural(state.accounts.length, 'connected inbox', 'connected inboxes') + '. It can’t be undone.',
      label: 'Delete everything', cancel: 'Keep my data', action: 'reset-yes',
    }),
    'reset-demo': () => confirmModal({
      title: 'Restart the demo?',
      text: 'This clears everything in this browser and takes you back to the start.',
      label: 'Restart demo', cancel: 'Cancel', action: 'reset-yes',
    }),
    'reset-yes': () => {
      state = defaultState();
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      ui.scan = null; ui.add = null;
      closeModal(true);
      redirect('welcome');
    },
  };

  document.addEventListener('click', (e) => {
    const sec = e.target.closest('[data-section]');
    if (sec) {
      ui.section = sec.dataset.section;
      if (ui.base === 'settings') { e.preventDefault(); const el = document.getElementById('set-' + ui.section); ui.section = null; if (el) el.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' }); }
      return;
    }
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'q') { ui.q = e.target.value; renderList(); }
    if (e.target.name === 'keep') {
      const n = $$('#review-form input[name="keep"]:checked').length;
      const b = $('#review-go');
      if (b) { $('span', b).textContent = n ? 'Add ' + plural(n, 'item') + ' to vault' : 'Continue without adding'; }
    }
    if (e.target.name === 'apppw') {
      /* Apple shows these as four groups of four; accept pastes with or without dashes. */
      const raw = e.target.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 16);
      const grouped = raw.match(/.{1,4}/g);
      e.target.value = grouped ? grouped.join('-') : '';
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
      paint('settings');
      ui.section = 'rules';
      $('#set-rules').scrollIntoView({ block: 'start' });
      toast('Defaults set to ' + monthsLabel(REGIONS[t.value].months) + ' for ' + REGIONS[t.value].label + '.');
    }
    if (t.name === 'returnDefault') {
      state.settings.returnDays = Number(t.value);
      save();
      toast('Default return window is now ' + plural(Number(t.value), 'day') + '.');
    }
    if (t.dataset.toggle) {
      const k = t.dataset.toggle;
      if (k === 'device') {
        if (t.checked && 'Notification' in window && Notification.permission !== 'granted') {
          Notification.requestPermission().then((p) => {
            state.settings.device = p === 'granted';
            t.checked = state.settings.device;
            save();
            if (p !== 'granted') toast('Notifications are blocked. Allow them in your browser settings.');
          });
          return;
        }
        state.settings.device = t.checked;
      } else if (k === 'emailCopy') {
        state.settings.emailCopy = t.checked;
      } else {
        state.settings.remind[k] = t.checked;
      }
      save();
      renderNav(ui.base);
    }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    e.preventDefault();

    if (f.id === 'gmail-form') return ACTIONS['gmail-allow']();

    if (f.id === 'icloud-form') {
      const address = $('#f-address').value.trim();
      const pw = $('#f-apppw').value.trim();
      showError('f-address', ''); showError('f-apppw', '');
      if (!validEmail(address, /^[^\s@]+@(icloud|me|mac)\.com$/i)) return showError('f-address', 'Enter your iCloud email, ending in @icloud.com, @me.com or @mac.com.');
      if (state.accounts.some((a) => a.address.toLowerCase() === address.toLowerCase())) return showError('f-address', 'This inbox is already connected.');
      if (!/^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z]{4}$/.test(pw)) return showError('f-apppw', 'App-specific passwords have 16 letters in four groups, like abcd-efgh-ijkl-mnop.');
      const b = $('button[type="submit"]', f);
      b.disabled = true;
      $('span', b).textContent = 'Connecting…';
      setTimeout(() => startScan('icloud', address), reduceMotion ? 50 : 900);
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
      const it = Object.assign({ id: uid(), added: iso(today()), source: ui.add.image ? 'photo' : 'manual' }, v);
      if (ui.add.image) it.photo = ui.add.image;
      else if (ui.add.fileName) it.fileName = ui.add.fileName;
      state.items.push(it);
      save();
      ui.add = null;
      go('item/' + it.id);
      toast('Added to your vault.');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($('.modal-wrap:not(.is-closing)')) return closeModal();
    if (ui.drawerId) {
      if (ui.editing) { ui.editing = null; return refreshDrawer(); }
      go('vault');
    }
  });

  /* Keep Tab inside an open dialog. */
  document.addEventListener('keydown', (e) => {
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
    if (route().name !== 'add') ui.add = null;
    render();
  });

  render();
})();
