/* ==========================================================================
   ui.js
   Semua manipulasi DOM: berpindah halaman, menggambar peta, menggerakkan
   domba, menampilkan soal, riwayat, papan skor, dan efek visual.
   ========================================================================== */

const SVG_NS = 'http://www.w3.org/2000/svg';

// Daftar halaman dan selector-nya
const PAGES = {
  home: '#page-home',
  play: '#page-play',
  thanks: '#page-thanks',
  tutorial: '#page-tutorial'
};
const PAGE_TITLES = { home: '', play: 'Jalan Pulang', thanks: '', tutorial: 'Tutorial' };

let currentPage = 'home';
let previousPage = 'home';
let timerId = null;
let walkerFrame = 0;     // id requestAnimationFrame untuk animasi domba

// Referensi elemen yang sering dipakai
const el = {
  topbarTitle: $('#topbar-title'),
  btnBack: $('#btn-back'),
  hud: $('#hud'),
  hudScore: $('#hud-score'),
  hudTime: $('#hud-time'),
  hudMiss: $('#hud-miss'),
  route: $('#route'),
  stones: $('#map-stones'),
  trees: $('#map-trees'),
  walker: $('#walker'),
  walkerImg: $('#walker-img'),
  stage: $('#stage'),
  tip: $('#stone-tip'),
  progress: $('#progress'),
  question: $('#question'),
  answer: $('#answer'),
  btnSubmit: $('#btn-submit'),
  btnHint: $('#btn-hint'),
  feedback: $('#feedback'),
  historyList: $('#history-list'),
  scenery: $('#scenery'),
  confetti: $('#confetti'),
  stats: $('#result-stats'),
  boardThanks: $('#board-thanks'),
  boardDialog: $('#board-dialog')
};

/* ---------------------------- Perpindahan halaman ---------------------------- */

// Tampilkan satu halaman dan sembunyikan yang lain
const showPage = (name) => {
  previousPage = currentPage;
  currentPage = name;

  Object.entries(PAGES).forEach(([key, selector]) => {
    $(selector).hidden = key !== name;       // atribut hidden dari HTML5
  });

  document.body.dataset.page = name;         // dipakai CSS untuk mengatur tampilan
  el.btnBack.hidden = name === 'home';
  el.hud.hidden = name !== 'play';
  el.topbarTitle.textContent = PAGE_TITLES[name];
  window.scrollTo(0, 0);
};

/* -------------------------------- Peta & domba -------------------------------- */

// Buat elemen SVG dengan atribut sekaligus
const svgEl = (name, attrs = {}, parent = null) => {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (parent) parent.appendChild(node);
  return node;
};

let routeLength = 0;

// Titik (x, y) pada jalur untuk posisi 0..1
const pointAt = (fraction) => el.route.getPointAtLength(fraction * routeLength);

// Taruh domba pada posisi tertentu di jalur
const placeWalker = (fraction) => {
  const point = pointAt(fraction);
  el.walker.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
};

// Gerakkan domba dari posisi "from" ke "to" secara halus. Mengembalikan Promise.
const animateWalker = (from, to, duration) => new Promise((resolve) => {
  cancelAnimationFrame(walkerFrame);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = reduce ? 1 : duration;
  const startTime = performance.now();

  const tick = (now) => {
    const k = Math.min(1, (now - startTime) / total);
    const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // easing in-out
    placeWalker(from + (to - from) * eased);
    if (k < 1) {
      walkerFrame = requestAnimationFrame(tick);
    } else {
      resolve();
    }
  };
  walkerFrame = requestAnimationFrame(tick);
});

// Tampilkan tooltip di dekat batu pijakan
const showTip = (text, target) => {
  const stageBox = el.stage.getBoundingClientRect();
  const box = target.getBoundingClientRect();
  el.tip.textContent = text;
  el.tip.hidden = false;
  el.tip.style.left = `${box.left - stageBox.left + box.width / 2}px`;
  el.tip.style.top = `${box.top - stageBox.top - 8}px`;
};
const hideTip = () => { el.tip.hidden = true; };

// Gambar peta: jalur, pohon dekorasi, dan batu pijakan
const buildMap = () => {
  ['#route-bed', '#route', '#route-dash'].forEach((selector) => $(selector).setAttribute('d', ROUTE_D));
  routeLength = el.route.getTotalLength();

  // Pohon dekorasi (perulangan dari array TREES)
  TREES.forEach((tree, index) => {
    const group = svgEl('g', { transform: `translate(${tree.x} ${tree.y}) scale(${tree.scale})` }, el.trees);
    group.setAttribute('data-tree', index + 1);
    svgEl('rect', { x: -4, y: 10, width: 8, height: 22, rx: 3, fill: '#6B4A2B' }, group);
    svgEl('path', { d: 'M0 -34 L22 4 H-22z', fill: '#14503A' }, group);
    svgEl('path', { d: 'M0 -18 L26 18 H-26z', fill: '#1F7A4F' }, group);
  });

  // Batu pijakan = semua titik di antara Start dan Rumah
  for (let n = 1; n < TOTAL_STEPS; n++) {
    const point = pointAt(CHECKPOINTS[n]);
    const group = svgEl('g', {
      class: 'stone', transform: `translate(${point.x} ${point.y})`,
      tabindex: 0, role: 'img', 'aria-label': `Titik ${n} dari ${TOTAL_STEPS}`
    }, el.stones);
    group.dataset.index = n;
    svgEl('circle', { r: 15 }, group);
    svgEl('path', { d: 'M-5 -5 L5 5 M5 -5 L-5 5', class: 'stone__x' }, group);

    // Event hover dan fokus: tampilkan tooltip
    const label = `Titik ${n} dari ${TOTAL_STEPS}`;
    group.addEventListener('mouseenter', () => showTip(label, group));
    group.addEventListener('mouseleave', hideTip);
    group.addEventListener('focus', () => showTip(label, group));
    group.addEventListener('blur', hideTip);
  }
  placeWalker(0);
};

// Tandai batu yang sudah dilewati domba
const markStones = () => {
  $$('.stone', el.stones).forEach((stone) => {
    stone.classList.toggle('is-done', Number(stone.dataset.index) <= state.step);
  });
};

/* -------------------------------- Panel soal -------------------------------- */

// Titik kemajuan (satu titik per soal)
const renderProgress = () => {
  clearChildren(el.progress);
  for (let i = 0; i < TOTAL_STEPS; i++) {
    const dot = createEl('li', i < state.step ? 'is-on' : '');
    dot.setAttribute('aria-label', i < state.step ? 'selesai' : 'belum');
    el.progress.appendChild(dot);
  }
};

const renderQuestion = () => {
  el.question.textContent = state.current ? state.current.text : '-';
  el.answer.value = '';
};

// Tampilkan pesan umpan balik. type: 'ok' | 'bad' | 'warn' | ''
const setFeedback = (message, type = '') => {
  el.feedback.textContent = message;
  el.feedback.className = `feedback ${type}`.trim();
};

const renderHint = () => {
  el.btnHint.textContent = `Petunjuk (${state.hintsLeft})`;
  el.btnHint.disabled = state.hintsLeft <= 0;
};

// Riwayat jawaban: tampilkan 8 terakhir, terbaru di atas
const renderHistory = () => {
  clearChildren(el.historyList);
  if (state.history.length === 0) {
    el.historyList.appendChild(createEl('li', 'empty', 'Belum ada jawaban.'));
    return;
  }
  state.history.slice(-8).reverse().forEach((item) => {
    const mark = item.ok ? '\u2713' : '\u2717';
    const text = `${item.no}. ${item.question} = ${item.given} ${mark}`;
    el.historyList.appendChild(createEl('li', item.ok ? 'ok' : 'bad', text));
  });
};

// HUD di bagian atas: skor, waktu, jumlah salah
const updateHud = () => {
  el.hudScore.textContent = state.score;
  el.hudMiss.textContent = state.mistakes;
  el.hudTime.textContent = formatTime(state.running ? Date.now() - state.startedAt : 0);
};

const startTimer = () => {
  stopTimer();
  timerId = setInterval(updateHud, 250);
};
const stopTimer = () => {
  clearInterval(timerId);
  timerId = null;
};

// Getarkan peta saat jawaban salah
const shakeWalker = () => {
  el.walkerImg.classList.remove('shake');
  void el.walkerImg.getBoundingClientRect(); // memicu reflow supaya animasi bisa diulang
  el.walkerImg.classList.add('shake');
};

/* ---------------------- Hasil, papan skor, tutorial, efek ---------------------- */

// Papan skor ke dalam elemen <ol>. Rekor yang baru saja dibuat diberi sorotan.
const renderBoard = (listEl, highlightId = null) => {
  clearChildren(listEl);
  const board = loadBoard();
  if (board.length === 0) {
    listEl.appendChild(createEl('li', 'empty', 'Belum ada skor. Jadilah yang pertama!'));
    return;
  }
  board.forEach((rec, index) => {
    const row = createEl('li', rec.id === highlightId ? 'is-new' : '');
    row.appendChild(createEl('span', 'board__rank', String(index + 1)));
    row.appendChild(createEl('span', 'board__name', rec.name));
    row.appendChild(createEl('span', 'board__meta', formatTime(rec.timeMs)));
    row.appendChild(createEl('strong', 'board__score', String(rec.score)));
    listEl.appendChild(row);
  });
};

// Ringkasan hasil di halaman terima kasih (daftar definisi <dl>)
const renderStats = (record) => {
  clearChildren(el.stats);
  const rows = [
    { label: 'Skor', value: record.score },
    { label: 'Waktu', value: formatTime(record.timeMs) },
    { label: 'Akurasi', value: `${record.accuracy}%` },
    { label: 'Salah', value: record.mistakes },
    { label: 'Beruntun terbaik', value: `${record.bestStreak}x` }
  ];
  rows.forEach((row) => {
    const box = createEl('div', 'stats__item');
    box.appendChild(createEl('dt', '', row.label));
    box.appendChild(createEl('dd', '', String(row.value)));
    el.stats.appendChild(box);
  });
};

// Isi halaman tutorial dari objek TUTORIAL
const renderTutorial = () => {
  const fill = (selector, items) => {
    const list = $(selector);
    clearChildren(list);
    items.forEach((text) => list.appendChild(createEl('li', '', text)));
  };
  fill('#tutorial-steps', TUTORIAL.steps);
  fill('#tutorial-tips', TUTORIAL.tips);
};

// Konfeti jatuh di halaman terima kasih
const spawnConfetti = () => {
  clearChildren(el.confetti);
  const colors = ['#FF9A4D', '#FFF6E0', '#8FE0A8', '#FF6B8A', '#FFE27A'];
  for (let i = 0; i < 40; i++) {
    const piece = createEl('i');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${4 + Math.random() * 5}s`;
    piece.style.animationDelay = `${-Math.random() * 8}s`;
    el.confetti.appendChild(piece);
  }
};

// Awan dekoratif di latar
const spawnClouds = () => {
  for (let i = 0; i < 6; i++) {
    const cloud = createEl('i', 'cloud');
    cloud.style.left = `${Math.random() * 85}%`;
    cloud.style.top = `${6 + Math.random() * 28}%`;
    cloud.style.width = `${90 + Math.random() * 110}px`;
    cloud.style.animationDelay = `${-Math.random() * 12}s`;
    el.scenery.appendChild(cloud);
  }
};
