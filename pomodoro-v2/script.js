(() => {
  'use strict';

  const MODES = {
    work:  { title: 'Focus',       minutes: 25, running: 'Focusing',      done: 'Session done. Take a breather.' },
    short: { title: 'Short break', minutes: 5,  running: 'Short break',   done: 'Break is over. Back to it.' },
    long:  { title: 'Long break',  minutes: 15, running: 'Long break',    done: 'Fully rested. Ready for more.' },
  };
  const ORDER = ['work', 'short', 'long'];
  const SESSIONS_BEFORE_LONG = 4;
  const COUNT_KEY = 'halo.count';
  const SOUND_KEY = 'halo.sound';
  const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  const R = 138;
  const C = 2 * Math.PI * R;

  const $ = (id) => document.getElementById(id);
  const el = {
    body: document.body,
    seg: $('seg'), segActive: $('segActive'),
    tabs: [...document.querySelectorAll('.seg-list[role="tablist"] .seg-item')],
    dial: $('dial'), arc: $('arc'), knob: $('knob'),
    time: $('time'), status: $('status'),
    start: $('startBtn'), startLabel: $('startLabel'),
    reset: $('resetBtn'), sound: $('soundBtn'),
    dots: $('dots'), sessionsText: $('sessionsText'),
    toast: $('toast'), toastText: $('toastText'),
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* private mode */ } },
  };

  let mode = 'work';
  let total = MODES.work.minutes * 60000;
  let remaining = total;
  let endAt = null;        // timestamp the current run finishes at, null when not running
  let tick = null;         // interval for timekeeping, keeps going in background tabs
  let frame = null;        // rAF for the ring, only while visible
  let nextModeTimer = null;
  let completed = Number(store.get(COUNT_KEY)) || 0;
  let soundOn = store.get(SOUND_KEY) !== 'off';
  let shownSeconds = null;

  /* ---------- instant mode for keyboard-driven actions ---------- */

  // Actions fired from the keyboard skip every transition: they are repeated often and must feel immediate.
  let instant = false;
  function withInstant(fn) {
    instant = true;
    document.documentElement.classList.add('is-instant');
    fn();
    // Force styles to apply before transitions come back.
    void document.body.offsetWidth;
    document.documentElement.classList.remove('is-instant');
    instant = false;
  }

  /* ---------- time readout with rolling digits ---------- */

  const slots = [];
  (function buildTime() {
    const parts = ['d', 'd', ':', 'd', 'd'];
    parts.forEach((p) => {
      const s = document.createElement('span');
      if (p === ':') {
        s.className = 'colon';
        s.textContent = ':';
      } else {
        s.className = 'slot';
        slots.push(s);
      }
      el.time.appendChild(s);
    });
  })();

  function setGlyph(slot, ch, dir, animate) {
    if (slot.dataset.v === ch) return;
    slot.dataset.v = ch;

    const prev = slot.querySelector('.glyph:not(.is-leaving)');
    const next = document.createElement('span');
    next.className = 'glyph';
    next.textContent = ch;
    slot.appendChild(next);

    if (!animate || !prev) {
      if (prev) prev.remove();
      return;
    }

    // Counting down, the new digit drops in from above; counting up, it rises from below.
    const move = reduceMotion.matches ? 0 : 38 * dir;
    const blur = reduceMotion.matches ? '0px' : '3px';
    const opts = { duration: 240, easing: EASE_OUT, fill: 'both' };

    prev.classList.add('is-leaving');
    const out = prev.animate(
      [
        { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translateY(${move}%)`, opacity: 0, filter: `blur(${blur})` },
      ],
      opts
    );
    out.onfinish = () => prev.remove();
    out.oncancel = () => prev.remove();

    next.animate(
      [
        { transform: `translateY(${-move}%)`, opacity: 0, filter: `blur(${blur})` },
        { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
      ],
      opts
    );
  }

  function renderTime(animate) {
    const secs = Math.max(0, Math.ceil(remaining / 1000));
    if (secs === shownSeconds) return;
    const dir = shownSeconds === null || secs < shownSeconds ? 1 : -1;
    shownSeconds = secs;

    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const text = String(m).padStart(2, '0') + String(s).padStart(2, '0');
    [...text].forEach((ch, i) => setGlyph(slots[i], ch, dir, animate && !instant));

    el.time.setAttribute('aria-label', `${m} minutes ${s} seconds remaining`);
    document.title = endAt ? `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} · ${MODES[mode].title}` : 'Halo';
  }

  /* ---------- ring ---------- */

  el.arc.style.strokeDasharray = C;

  function renderRing() {
    const f = total ? remaining / total : 0;
    el.arc.style.strokeDashoffset = C * (1 - f);
    el.arc.classList.toggle('is-empty', f <= 0.0005);
    el.knob.style.transform = `rotate(${f * 360}deg)`;
  }

  // Glide the ring to its new value instead of snapping (reset, mode change).
  let settleTimer = null;
  function settleRing() {
    clearTimeout(settleTimer);
    el.dial.classList.add('is-settling');
    renderRing();
    settleTimer = setTimeout(() => el.dial.classList.remove('is-settling'), 720);
  }

  function loop() {
    if (!endAt) { frame = null; return; }
    remaining = Math.max(0, endAt - Date.now());
    renderRing();
    frame = requestAnimationFrame(loop);
  }

  /* ---------- segmented control ---------- */

  function positionSeg() {
    const i = ORDER.indexOf(mode);
    const tab = el.tabs[i];
    const box = el.segActive.getBoundingClientRect();
    const r = tab.getBoundingClientRect();
    const left = r.left - box.left;
    const right = box.right - r.right;
    el.segActive.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;
  }

  function renderTabs() {
    el.tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
    positionSeg();
  }

  /* ---------- primary button label ---------- */

  function setLabel(text) {
    if (el.startLabel.textContent === text) return;
    el.startLabel.textContent = text;
    if (instant) return;
    // A short blur bridges the two words so it reads as one morph, not a swap.
    el.startLabel.animate(
      [
        { filter: 'blur(3px)', opacity: 0.4 },
        { filter: 'blur(0px)', opacity: 1 },
      ],
      { duration: 220, easing: 'ease-out' }
    );
  }

  /* ---------- sessions ---------- */

  function renderSessions(justCompleted) {
    const inCycle = completed % SESSIONS_BEFORE_LONG;
    const filled = justCompleted && inCycle === 0 ? SESSIONS_BEFORE_LONG : inCycle;
    el.dots.innerHTML = Array.from({ length: SESSIONS_BEFORE_LONG }, (_, i) => {
      const cls = [i < filled ? 'on' : '', justCompleted && i === filled - 1 ? 'is-new' : ''].join(' ').trim();
      return `<i class="${cls}"></i>`;
    }).join('');

    const toLong = SESSIONS_BEFORE_LONG - inCycle;
    el.sessionsText.textContent =
      completed === 0
        ? 'No sessions yet'
        : `${completed} done · ${inCycle === 0 ? 'long break earned' : `${toLong} to a long break`}`;
  }

  /* ---------- sound ---------- */

  let audio = null;
  function chime() {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      // Two soft sine notes, a gentle bell rather than an alarm.
      [[659.25, 0], [987.77, 0.18], [1318.5, 0.36]].forEach(([freq, delay]) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = audio.currentTime + delay;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + 1.5);
      });
    } catch (_) { /* audio unavailable */ }
  }

  function renderSound() {
    el.sound.setAttribute('aria-pressed', String(soundOn));
  }

  function toggleSound() {
    soundOn = !soundOn;
    store.set(SOUND_KEY, soundOn ? 'on' : 'off');
    renderSound();
  }

  /* ---------- toast ---------- */

  let toastTimer = null;
  let toastLeft = 0;
  let toastShownAt = 0;

  function showToast(text) {
    el.toastText.textContent = text;
    el.toast.classList.add('is-visible');
    toastLeft = 5000;
    scheduleToastHide();
  }

  function scheduleToastHide() {
    clearTimeout(toastTimer);
    toastShownAt = Date.now();
    toastTimer = setTimeout(hideToast, toastLeft);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    toastLeft = 0;
    el.toast.classList.remove('is-visible');
  }

  // Don't let the toast expire while nobody is looking at the tab.
  document.addEventListener('visibilitychange', () => {
    if (!el.toast.classList.contains('is-visible')) return;
    if (document.hidden) {
      clearTimeout(toastTimer);
      toastLeft = Math.max(1500, toastLeft - (Date.now() - toastShownAt));
    } else {
      scheduleToastHide();
    }
  });

  el.toast.addEventListener('click', hideToast);

  /* ---------- timer ---------- */

  function setMode(next) {
    clearTimeout(nextModeTimer);
    stop();
    mode = next;
    total = MODES[mode].minutes * 60000;
    remaining = total;
    el.body.dataset.mode = mode;
    el.status.textContent = 'Ready when you are';
    setLabel('Start');
    renderTabs();
    renderTime(true);
    settleRing();
  }

  function start() {
    clearTimeout(nextModeTimer);
    if (remaining <= 0) remaining = total;
    endAt = Date.now() + remaining;
    el.dial.classList.add('is-running');
    el.status.textContent = MODES[mode].running;
    setLabel('Pause');
    hideToast();
    tick = setInterval(update, 250);
    if (!frame) frame = requestAnimationFrame(loop);
    update();
  }

  function stop() {
    clearInterval(tick);
    tick = null;
    endAt = null;
    el.dial.classList.remove('is-running');
  }

  function pause() {
    remaining = Math.max(0, endAt - Date.now());
    stop();
    el.status.textContent = 'Paused';
    setLabel('Resume');
    renderTime(true);
    renderRing();
  }

  function update() {
    remaining = Math.max(0, endAt - Date.now());
    renderTime(!document.hidden);
    if (remaining === 0) finish();
  }

  function finish() {
    stop();
    renderRing();
    chime();
    showToast(MODES[mode].done);

    let next = 'work';
    if (mode === 'work') {
      completed += 1;
      store.set(COUNT_KEY, completed);
      renderSessions(true);
      next = completed % SESSIONS_BEFORE_LONG === 0 ? 'long' : 'short';
    }
    el.status.textContent = `Up next: ${MODES[next].title.toLowerCase()}`;
    setLabel('Start');
    // Let the empty ring sit for a beat before refilling for the next mode.
    nextModeTimer = setTimeout(() => {
      setMode(next);
      el.status.textContent = `Up next: ${MODES[next].title.toLowerCase()}`;
    }, 1600);
  }

  function toggle() {
    if (endAt) pause(); else start();
  }

  function reset() {
    setMode(mode);
  }

  /* ---------- events ---------- */

  el.start.addEventListener('click', toggle);
  el.reset.addEventListener('click', reset);
  el.sound.addEventListener('click', toggleSound);
  el.tabs.forEach((t) => t.addEventListener('click', () => {
    if (t.dataset.mode !== mode) setMode(t.dataset.mode);
  }));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const key = e.key.toLowerCase();

    if (e.code === 'Space') {
      e.preventDefault();
      // A focused button would also fire its own click on Space.
      if (e.target instanceof HTMLButtonElement) e.target.blur();
      withInstant(toggle);
    } else if (key === 'r') {
      withInstant(reset);
    } else if (key === 'm') {
      toggleSound();
    } else if (key === '1' || key === '2' || key === '3') {
      withInstant(() => setMode(ORDER[Number(key) - 1]));
    } else if (key === 'escape') {
      hideToast();
    }
  });

  // Keep the segmented clip aligned when fonts load or the layout changes.
  if ('ResizeObserver' in window) new ResizeObserver(positionSeg).observe(el.seg);
  if (document.fonts) document.fonts.ready.then(positionSeg);

  /* ---------- init ---------- */

  renderSound();
  renderSessions(false);
  renderTabs();
  renderTime(false);
  renderRing();
  // Turn transitions on only after the first paint so nothing animates on load.
  requestAnimationFrame(() => requestAnimationFrame(() => el.seg.classList.add('is-ready')));
})();
