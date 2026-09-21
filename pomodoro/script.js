(() => {
  'use strict';

  const MODES = {
    work:  { label: 'WORK',        minutes: 25, done: 'GOOD WORK! TAKE A BREAK' },
    short: { label: 'SHORT BREAK', minutes: 5,  done: 'BREAK OVER. BACK TO IT!' },
    long:  { label: 'LONG BREAK',  minutes: 15, done: 'FULLY RESTED. LET\'S GO!' },
  };
  const SESSIONS_BEFORE_LONG = 4;
  const BAR_BLOCKS = 20;
  const STORAGE_KEY = 'pixeldoro.count';

  const $ = (id) => document.getElementById(id);
  const el = {
    card: $('card'), time: $('time'), bar: $('bar'), status: $('status'),
    start: $('startBtn'), reset: $('resetBtn'), dots: $('dots'), count: $('count'),
    tomato: $('tomato'), modeBtns: [...document.querySelectorAll('.mode-btn')],
  };

  let mode = 'work';
  let total = MODES.work.minutes * 60 * 1000;
  let remaining = total;
  let endAt = null;      // timestamp when the current run finishes
  let tick = null;
  let completed = Number(localStorage.getItem(STORAGE_KEY)) || 0;

  /* ---------- pixel tomato ---------- */
  const TOMATO = [
    '.....GG.....',
    '....GGG.....',
    '..RRRGRRR...',
    '.RRRRRRRRR..',
    'RRLRRRRRRRR.',
    'RLRRRRRRRRRD',
    'RRRRRRRRRRRD',
    'RRRRRRRRRRDD',
    '.RRRRRRRRDD.',
    '..RDDDDDDD..',
    '....DDDD....',
  ];
  const PALETTE = { R: '#e94560', D: '#a52a3f', L: '#ff8fa3', G: '#4ecca3' };

  function drawTomato() {
    const h = TOMATO.length, w = TOMATO[0].length;
    let rects = '';
    TOMATO.forEach((row, y) => {
      [...row].forEach((c, x) => {
        if (PALETTE[c]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETTE[c]}"/>`;
      });
    });
    el.tomato.innerHTML = `<svg viewBox="0 0 ${w} ${h + 1}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
  }

  /* ---------- 8-bit beep ---------- */
  let audio = null;
  function beep() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        const t = audio.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
    } catch (_) { /* audio unavailable, ignore */ }
  }

  /* ---------- rendering ---------- */
  function fmt(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  function buildBar() {
    el.bar.innerHTML = Array.from({ length: BAR_BLOCKS }, () => '<span></span>').join('');
  }

  function renderBar() {
    const filled = Math.round(((total - remaining) / total) * BAR_BLOCKS);
    [...el.bar.children].forEach((b, i) => b.classList.toggle('on', i < filled));
  }

  function renderSessions() {
    const inCycle = completed % SESSIONS_BEFORE_LONG;
    el.dots.innerHTML = Array.from({ length: SESSIONS_BEFORE_LONG },
      (_, i) => `<i class="${i < inCycle ? 'on' : ''}"></i>`).join('');
    el.count.textContent = completed;
  }

  function render() {
    const text = fmt(remaining);
    el.time.textContent = text;
    document.title = endAt ? `${text} - ${MODES[mode].label}` : 'Pixeldoro';
    renderBar();
  }

  /* ---------- timer ---------- */
  function setMode(next, { keepStatus = false } = {}) {
    stop();
    mode = next;
    total = MODES[mode].minutes * 60 * 1000;
    remaining = total;
    document.body.dataset.mode = mode;
    el.modeBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));
    el.card.classList.remove('is-done');
    if (!keepStatus) el.status.textContent = 'READY?';
    render();
  }

  function start() {
    if (remaining <= 0) remaining = total;
    endAt = Date.now() + remaining;
    el.card.classList.add('is-running');
    el.card.classList.remove('is-done');
    el.start.textContent = 'PAUSE';
    el.status.textContent = mode === 'work' ? 'FOCUS...' : 'RESTING...';
    tick = setInterval(update, 200);
    update();
  }

  function stop() {
    clearInterval(tick);
    tick = null;
    endAt = null;
    el.card.classList.remove('is-running');
    el.start.textContent = 'START';
  }

  function pause() {
    remaining = Math.max(0, endAt - Date.now());
    stop();
    el.status.textContent = 'PAUSED';
    render();
  }

  function update() {
    remaining = Math.max(0, endAt - Date.now());
    render();
    if (remaining === 0) finish();
  }

  function finish() {
    stop();
    beep();
    el.card.classList.add('is-done');
    el.status.textContent = MODES[mode].done;
    render();

    if (mode === 'work') {
      completed += 1;
      localStorage.setItem(STORAGE_KEY, completed);
      renderSessions();
      const next = completed % SESSIONS_BEFORE_LONG === 0 ? 'long' : 'short';
      setTimeout(() => setMode(next, { keepStatus: true }), 1500);
    } else {
      setTimeout(() => setMode('work', { keepStatus: true }), 1500);
    }
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
  el.modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'BUTTON') e.target.blur();
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.key === 'r' || e.key === 'R') reset();
  });

  /* ---------- init ---------- */
  drawTomato();
  buildBar();
  renderSessions();
  setMode('work');
})();
