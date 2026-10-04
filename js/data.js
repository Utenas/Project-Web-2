/* ==========================================================================
   data.js
   Berisi semua data statis game dalam bentuk Array of Objects.
   Dimuat paling awal karena dipakai oleh file JavaScript lainnya.
   ========================================================================== */

// Bentuk jalur di peta (format path SVG, koordinat mengikuti viewBox 760 x 520)
const ROUTE_D =
  'M80 450C60 330 120 220 220 200S330 300 400 300 470 120 560 110 680 250 640 330 560 420 520 440';

// Posisi tiap titik di sepanjang jalur: 0 = Start, 1 = Rumah.
// Jumlah langkah (soal) = jumlah titik - 1.
const CHECKPOINTS = [0, 0.16, 0.32, 0.47, 0.62, 0.78, 0.9, 1];

// Daftar operator aritmatika. Setiap objek punya simbol dan fungsi hitung (arrow function).
const OPERATORS = [
  { key: 'add', symbol: '+', apply: (a, b) => a + b },
  { key: 'sub', symbol: '\u2212', apply: (a, b) => a - b },
  { key: 'mul', symbol: '\u00D7', apply: (a, b) => a * b },
  { key: 'div', symbol: '\u00F7', apply: (a, b) => a / b }
];

// Pengaturan skor
const SCORING = {
  correct: 100,       // poin dasar tiap jawaban benar
  timeBonusMax: 50,   // bonus kecepatan maksimal
  timePenaltyPerSec: 3, // bonus berkurang tiap detik
  streakBonus: 10,    // bonus per jawaban benar beruntun (maks 5x)
  wrongPenalty: 20,   // pengurangan poin jika salah
  hintPenalty: 15,    // pengurangan poin jika memakai petunjuk
  maxHints: 3         // jumlah petunjuk per permainan
};

// Posisi dan ukuran pohon dekorasi di peta
const TREES = [
  { x: 40, y: 120, scale: 0.8 },  { x: 120, y: 60, scale: 1.0 },
  { x: 300, y: 90, scale: 1.2 },  { x: 330, y: 430, scale: 0.8 },
  { x: 250, y: 470, scale: 1.0 }, { x: 700, y: 60, scale: 1.2 },
  { x: 720, y: 200, scale: 0.8 }, { x: 610, y: 470, scale: 1.0 },
  { x: 190, y: 330, scale: 1.2 }, { x: 470, y: 500, scale: 0.8 },
  { x: 30, y: 300, scale: 1.0 },  { x: 690, y: 420, scale: 1.2 }
];

// Pesan umpan balik (dipilih acak)
const MESSAGES = {
  correct: ['Benar! Domba maju.', 'Mantap! Satu langkah lebih dekat.', 'Tepat sekali!', 'Hebat, lanjut terus!'],
  wrong: ['Belum tepat. Domba kembali ke awal.', 'Yah salah, ulangi dari Start ya.', 'Coba lagi, pasti bisa!'],
  start: ['Jawab dengan benar untuk maju.'],
  finish: ['Berkat kamu, domba sampai di rumah dengan selamat.']
};

// Isi halaman tutorial
const TUTORIAL = {
  steps: [
    'Isi nama pemain, lalu klik si domba di menu untuk memulai.',
    'Jawab soal di panel kanan, lalu tekan Submit atau Enter.',
    'Jawaban benar: domba maju ke titik berikutnya.',
    'Jawaban salah: domba kembali ke titik awal.'
  ],
  tips: [
    'Antar domba sampai ke rumah di ujung jalan.',
    'Soalnya acak: tambah, kurang, kali, atau bagi dua bilangan.',
    'Tombol Petunjuk memberi bantuan, tapi mengurangi skor.',
    'Tombol musik di kiri bawah bisa dimatikan kapan saja.'
  ]
};
