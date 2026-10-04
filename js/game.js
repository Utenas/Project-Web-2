/* ==========================================================================
   game.js
   Logika permainan (tanpa menyentuh tampilan):
   membuat soal, memeriksa jawaban, menghitung skor, dan mencatat riwayat.
   Tampilan diurus oleh ui.js, sehingga logika mudah diuji dan dibaca.
   ========================================================================== */

// Jumlah soal yang harus dijawab benar sampai domba tiba di rumah
const TOTAL_STEPS = CHECKPOINTS.length - 1;

// State (kondisi) permainan yang sedang berjalan
const state = {
  playerName: 'Pemain',
  running: false,
  step: 0,             // posisi domba (0 = Start, TOTAL_STEPS = Rumah)
  score: 0,
  streak: 0,           // jawaban benar beruntun
  bestStreak: 0,
  mistakes: 0,         // total jawaban salah
  hintsLeft: SCORING.maxHints,
  startedAt: 0,        // waktu mulai permainan (ms)
  questionStartedAt: 0,
  current: null,       // soal yang sedang tampil
  history: []          // Array of Objects: riwayat semua jawaban
};

// Cari objek operator berdasarkan simbol kuncinya
const getOperator = (key) => OPERATORS.find((op) => op.key === key);

/* --------------------------------------------------------------------------
   Membuat soal: aritmatika sederhana antara DUA bilangan (+, -, x, /).
   Angka sedikit membesar seiring domba maju (berdasarkan step), tetapi
   pemain tidak perlu memilih tingkat kesulitan.
   Pembagian selalu menghasilkan bilangan bulat, dan pengurangan tidak negatif.
   -------------------------------------------------------------------------- */
const buildQuestion = (step) => {
  const op = pick(OPERATORS);
  let a;
  let b;

  switch (op.key) {
    case 'add':
      a = randInt(2, 15 + step * 3);
      b = randInt(2, 15 + step * 3);
      break;
    case 'sub':
      a = randInt(5, 20 + step * 3);
      b = randInt(1, a - 1);                 // b < a supaya hasil positif
      break;
    case 'mul':
      a = randInt(2, 6 + step);
      b = randInt(2, 6 + step);
      break;
    default: {                               // pembagian
      b = randInt(2, 5 + Math.floor(step / 2));
      const quotient = randInt(2, 6 + step); // hasil bagi dipilih dulu
      a = b * quotient;                      // supaya a habis dibagi b
    }
  }

  return { text: `${a} ${op.symbol} ${b}`, answer: op.apply(a, b), a, b, op: op.key };
};

// Buat soal baru, hindari soal yang sama dua kali berturut-turut
const newQuestion = () => {
  let question = buildQuestion(state.step);
  let guard = 0;
  while (state.current && question.text === state.current.text && guard < 10) {
    question = buildQuestion(state.step);
    guard++;
  }
  state.current = question;
  state.questionStartedAt = Date.now();
  return question;
};

// Mulai permainan baru: reset semua state
const startNewGame = (playerName) => {
  state.playerName = playerName || 'Pemain';
  state.running = true;
  state.step = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.mistakes = 0;
  state.hintsLeft = SCORING.maxHints;
  state.history = [];
  state.current = null;
  state.startedAt = Date.now();
  return newQuestion();
};

// Hitung poin untuk jawaban benar: poin dasar + bonus kecepatan + bonus beruntun
const calcPoints = (elapsedMs, streak) => {
  const seconds = Math.floor(elapsedMs / 1000);
  const timeBonus = Math.max(0, SCORING.timeBonusMax - seconds * SCORING.timePenaltyPerSec);
  const streakBonus = Math.min(streak, 5) * SCORING.streakBonus;
  return SCORING.correct + timeBonus + streakBonus;
};

/* --------------------------------------------------------------------------
   Memeriksa jawaban pemain.
   - Benar: domba maju satu titik, skor bertambah.
   - Salah: domba kembali ke awal (step = 0), skor berkurang.
   Mengembalikan ringkasan hasil agar tampilan bisa bereaksi.
   -------------------------------------------------------------------------- */
const submitAnswer = (value) => {
  const elapsed = Date.now() - state.questionStartedAt;
  const ok = value === state.current.answer;
  let points = 0;

  if (ok) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    points = calcPoints(elapsed, state.streak);
    state.score += points;
    state.step += 1;
  } else {
    state.streak = 0;
    state.mistakes += 1;
    points = -Math.min(state.score, SCORING.wrongPenalty);
    state.score += points;
    state.step = 0;                          // mulai lagi dari awal
  }

  // Catat ke riwayat (Array of Objects)
  state.history.push({
    no: state.history.length + 1,
    question: state.current.text,
    given: value,
    answer: state.current.answer,
    ok,
    ms: elapsed
  });

  return { ok, points, finished: state.step >= TOTAL_STEPS, answer: state.current.answer };
};

// Petunjuk: beri tahu genap/ganjil dan rentang jawaban. Mengurangi skor.
const useHint = () => {
  if (state.hintsLeft <= 0 || !state.current) return null;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - SCORING.hintPenalty);

  const answer = state.current.answer;
  const spread = Math.max(3, Math.round(answer * 0.2));
  const low = Math.max(0, answer - randInt(1, spread));
  const high = answer + randInt(1, spread);
  const parity = answer % 2 === 0 ? 'genap' : 'ganjil';
  return `Jawabannya bilangan ${parity}, antara ${low} dan ${high}.`;
};

// Selesaikan permainan: hitung statistik, simpan rekor ke papan skor
const finishGame = () => {
  state.running = false;
  const totalMs = Date.now() - state.startedAt;
  const attempts = state.history.length;
  let correct = 0;
  for (const item of state.history) {        // perulangan: hitung jawaban benar
    if (item.ok) correct += 1;
  }
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  const record = {
    id: Date.now(),
    name: state.playerName,
    score: state.score,
    timeMs: totalMs,
    mistakes: state.mistakes,
    bestStreak: state.bestStreak,
    accuracy,
    date: new Date().toISOString()
  };
  addRecord(record);
  return record;
};
