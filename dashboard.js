(function () {
  const grid = document.getElementById('grid');
  const meta = document.getElementById('meta');

  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  /* 'YYYY-MM-DD' -> '21 SEP 2026', without letting the local timezone shift the day. */
  function formatDate(iso) {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return String(iso).toUpperCase();
    return d + ' ' + MONTHS[m - 1] + ' ' + y;
  }

  function daysAgo(iso) {
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return null;
    const then = Date.UTC(y, m - 1, d);
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((today - then) / 86400000);
  }

  function relative(iso) {
    const days = daysAgo(iso);
    if (days === null) return '';
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return days + ' days ago';
    const months = Math.round(days / 30);
    if (months < 12) return months + (months === 1 ? ' month ago' : ' months ago');
    const years = Math.round(days / 365);
    return years + (years === 1 ? ' year ago' : ' years ago');
  }

  /* Build a crisp <svg> from the little character grids in prototypes.js. */
  function renderArt(name) {
    const art = (window.PIXEL_ART || {})[name] || (window.PIXEL_ART || {}).blank;
    if (!art) return '';
    const rows = art.rows;
    const w = rows[0].length;
    const h = rows.length;
    let out = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const fill = art.palette[rows[y][x]];
        if (!fill) continue;
        out += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + fill + '"/>';
      }
    }
    return (
      '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-hidden="true" ' +
      'shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">' + out + '</svg>'
    );
  }

  function tile(p) {
    const a = document.createElement('a');
    a.className = 'tile';
    a.href = p.url || p.slug + '/';
    a.style.setProperty('--accent', p.accent || '#e94560');
    if (p.status === 'wip') a.classList.add('is-wip');

    const tags = (p.tags || []).map((t) => '<li>' + t + '</li>').join('');

    a.innerHTML =
      '<div class="tile-art">' + renderArt(p.art) + '</div>' +
      '<div class="tile-body">' +
        '<div class="tile-head">' +
          '<h2 class="tile-name">' + p.name + '</h2>' +
          '<span class="badge">' + (p.status === 'wip' ? 'WIP' : 'LIVE') + '</span>' +
        '</div>' +
        '<p class="tile-date"><time datetime="' + p.deployed + '">' + formatDate(p.deployed) + '</time>' +
          '<span class="ago">' + relative(p.deployed) + '</span></p>' +
        '<p class="tile-desc">' + p.description + '</p>' +
        (tags ? '<ul class="tags">' + tags + '</ul>' : '') +
        '<span class="tile-go">OPEN &rsaquo;</span>' +
      '</div>';

    return a;
  }

  function ghost() {
    const el = document.createElement('div');
    el.className = 'tile tile-ghost';
    el.innerHTML =
      '<div class="tile-art">' + renderArt('blank') + '</div>' +
      '<div class="tile-body">' +
        '<div class="tile-head"><h2 class="tile-name">NEXT ONE</h2></div>' +
        '<p class="tile-desc">Empty slot. Add a folder and an entry in <code>prototypes.js</code> and it shows up here.</p>' +
      '</div>';
    return el;
  }

  const list = (window.PROTOTYPES || []).slice().sort((a, b) => String(b.deployed).localeCompare(String(a.deployed)));

  list.forEach((p) => grid.appendChild(tile(p)));
  grid.appendChild(ghost());

  const live = list.filter((p) => p.status !== 'wip').length;
  const newest = list[0];
  meta.textContent =
    list.length + (list.length === 1 ? ' PROTOTYPE' : ' PROTOTYPES') +
    ' · ' + live + ' LIVE' +
    (newest ? ' · LAST SHIP ' + formatDate(newest.deployed) : '');
})();
