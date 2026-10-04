/* ==========================================================================
   main.js
   Titik masuk aplikasi: menyambungkan event (klik, submit, input, hover,
   keyboard) dengan logika game (game.js) dan tampilan (ui.js).
   ========================================================================== */

const nameInput = $('#player-name');
const formSetup = $('#form-setup');
const formAnswer = $('#form-answer');
const boardDialog = $('#dlg-board');
const btnMusic = $('#btn-music');

// Ambil nama pemain dari input (maksimal 14 karakter, default "Pemain")
const getPlayerName = () => nameInput.value.trim().slice(0, 14) || 'Pemain';

// Mulai permainan baru
const startGame = () => {
  savePrefs({ name: nameInput.value.trim() });
  startNewGame(getPlayerName());

  placeWalker(0);
  markStones();
  renderProgress();
  renderQuestion();
  renderHistory();
  renderHint();
  updateHud();
  setFeedback(MESSAGES.start[0]);
  startTimer();
  showPage('play');
  el.answer.focus();
};

// Pindah ke halaman terima kasih setelah domba sampai di rumah
const finishAndShowResult = () => {
  stopTimer();
  const record = finishGame();
  renderStats(record);
  renderBoard(el.boardThanks, record.id);
  $('#thanks-msg').textContent = MESSAGES.finish[0];
  spawnConfetti();
  Sound.sfx('win');
  showPage('thanks');
};

// Event utama: pemain menekan Submit
const handleSubmit = async (event) => {
  event.preventDefault();                    // cegah halaman reload
  if (!state.running || el.btnSubmit.disabled) return;

  const raw = el.answer.value.trim();
  if (raw === '') {                          // percabangan: input kosong
    setFeedback('Isi jawabanmu dulu ya.', 'warn');
    el.answer.focus();
    return;
  }

  // Kunci tombol selama animasi supaya tidak bisa submit dua kali
  el.btnSubmit.disabled = true;
  const from = CHECKPOINTS[state.step];
  const result = submitAnswer(Number(raw));
  updateHud();
  renderHistory();

  if (result.ok) {
    setFeedback(`${pick(MESSAGES.correct)} +${result.points}`, 'ok');
    Sound.sfx('correct');
    await animateWalker(from, CHECKPOINTS[state.step], 900);   // maju ke titik berikutnya
    markStones();
    renderProgress();

    if (result.finished) {                   // sudah sampai rumah
      await delay(500);
      finishAndShowResult();
      el.btnSubmit.disabled = false;
      return;
    }
  } else {
    setFeedback(`${pick(MESSAGES.wrong)} (jawaban: ${result.answer})`, 'bad');
    Sound.sfx('wrong');
    shakeWalker();
    await delay(450);
    await animateWalker(from, 0, 600 + from * 700);            // kembali ke awal
    markStones();
    renderProgress();
  }

  newQuestion();                             // soal berikutnya
  renderQuestion();
  el.btnSubmit.disabled = false;
  el.answer.focus();
};

// Event: tombol Petunjuk
const handleHint = () => {
  const hint = useHint();
  if (!hint) {
    setFeedback('Petunjuk sudah habis.', 'warn');
    return;
  }
  setFeedback(hint, 'warn');
  renderHint();
  updateHud();
  el.answer.focus();
};

// Event: tombol kembali (halaman game dan tutorial)
const goBack = () => {
  if (currentPage === 'tutorial') {
    showPage(previousPage === 'tutorial' ? 'home' : previousPage);
  } else if (currentPage === 'play') {
    const hasProgress = state.history.length > 0;
    if (!hasProgress || window.confirm('Kembali ke menu? Progres permainan akan hilang.')) {
      stopTimer();
      state.running = false;
      showPage('home');
    }
  } else {
    showPage('home');
  }
};

// Papan skor dalam dialog
const openBoard = () => {
  renderBoard(el.boardDialog);
  if (typeof boardDialog.showModal === 'function') boardDialog.showModal();
};

// Pasang semua event listener
const bindEvents = () => {
  $('#btn-start').addEventListener('click', startGame);
  formSetup.addEventListener('submit', (event) => {   // Enter di kolom nama = mulai
    event.preventDefault();
    startGame();
  });
  nameInput.addEventListener('input', () => savePrefs({ name: nameInput.value.trim() }));

  formAnswer.addEventListener('submit', handleSubmit);
  el.btnHint.addEventListener('click', handleHint);

  el.btnBack.addEventListener('click', goBack);
  $('#btn-happy').addEventListener('click', () => showPage('home'));
  $('#btn-tutorial').addEventListener('click', () => {
    if (currentPage !== 'tutorial') showPage('tutorial');
  });
  $('#btn-board').addEventListener('click', openBoard);

  btnMusic.addEventListener('click', () => {
    const on = Sound.toggle();
    btnMusic.setAttribute('aria-pressed', String(on));
    btnMusic.classList.toggle('is-off', !on);
  });

  // Hover pada domba di menu: bergoyang kecil dan bunyi pelan
  $$('.hero').forEach((hero) => hero.addEventListener('mouseenter', () => Sound.sfx('hover')));

  // Dialog papan skor
  $('#btn-clear-board').addEventListener('click', () => {
    if (window.confirm('Hapus semua data papan skor?')) {
      clearBoard();
      renderBoard(el.boardDialog);
    }
  });
  boardDialog.addEventListener('click', (event) => {   // klik area gelap = tutup
    if (event.target === boardDialog) boardDialog.close();
  });

  // Keyboard: Escape untuk kembali
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !boardDialog.open && currentPage !== 'home') goBack();
  });
};

// Inisialisasi aplikasi
const init = () => {
  nameInput.value = loadPrefs().name || '';
  btnMusic.classList.add('is-off');
  spawnClouds();
  buildMap();
  renderTutorial();
  renderProgress();
  renderHistory();
  bindEvents();
  showPage('home');
};

init();
