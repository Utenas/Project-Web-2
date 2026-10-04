/* ==========================================================================
   storage.js
   Menyimpan papan skor dan nama pemain di localStorage browser.
   Semua akses dibungkus try/catch supaya tidak error di mode privat.
   ========================================================================== */

const STORAGE_KEYS = { board: 'tbh_board_v1', prefs: 'tbh_prefs_v1' };
const BOARD_LIMIT = 10; // jumlah skor tertinggi yang disimpan

// Baca JSON dari localStorage, kembalikan nilai cadangan jika gagal
const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

// Tulis JSON ke localStorage
const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* penyimpanan penuh atau diblokir: abaikan saja */
  }
};

const loadBoard = () => readJSON(STORAGE_KEYS.board, []);

// Tambah rekor baru, urutkan (skor tertinggi dulu, waktu tercepat jika seri), simpan 10 teratas
const addRecord = (record) => {
  const board = loadBoard();
  board.push(record);
  board.sort((a, b) => b.score - a.score || a.timeMs - b.timeMs);
  const top = board.slice(0, BOARD_LIMIT);
  writeJSON(STORAGE_KEYS.board, top);
  return top;
};

const clearBoard = () => writeJSON(STORAGE_KEYS.board, []);

const loadPrefs = () => readJSON(STORAGE_KEYS.prefs, { name: '' });
const savePrefs = (prefs) => writeJSON(STORAGE_KEYS.prefs, prefs);
