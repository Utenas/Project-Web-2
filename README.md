# Turn Back To Home

Game edukasi aritmatika berbasis web. Seekor domba kecil tersesat di pegunungan dan ingin pulang.
Bantu dia dengan menjawab soal matematika: jawaban benar membuat domba maju ke titik berikutnya,
jawaban salah membuatnya kembali ke awal.

Proyek ini dibuat untuk **Tugas 2 Figma & JavaScript** (HTML5, CSS3, dan JavaScript).

- Link Figma (View): _isi dengan link Figma publik_
- Live Demo (GitHub Pages): _isi dengan link GitHub Pages_

## Fitur utama

| Fitur | Penjelasan |
|---|---|
| Soal aritmatika acak | Dua bilangan dengan operator `+`, `−`, `×`, `÷`. Pembagian selalu menghasilkan bilangan bulat dan pengurangan tidak pernah negatif. |
| Domba bergerak di peta | Jawaban benar: domba berjalan halus ke titik berikutnya. Jawaban salah: domba bergetar lalu kembali ke Start. |
| Skor dan waktu | Poin dasar + bonus kecepatan + bonus jawaban benar beruntun. Salah dan memakai petunjuk mengurangi poin. |
| Petunjuk | Maksimal 3 kali per permainan (genap/ganjil dan rentang jawaban). |
| Riwayat jawaban | Daftar jawaban terakhir (benar/salah) di panel soal. |
| Papan skor | 10 skor tertinggi disimpan di `localStorage` dan tampil di halaman hasil serta dialog. |
| Musik dan efek suara | Dibuat dengan Web Audio API (tanpa file audio), bisa dimatikan. |
| 4 halaman | Menu, Game, Terima kasih, Tutorial (sesuai desain Figma). |

## Cara bermain

1. Isi nama pemain (boleh dikosongkan), lalu klik domba di menu atau tekan Enter.
2. Jawab soal di panel kanan (di ponsel: panel di bawah peta), lalu tekan **Submit** atau Enter.
3. Benar: domba maju. Salah: domba kembali ke Start.
4. Sampai di rumah, halaman hasil menampilkan skor, waktu, akurasi, dan papan skor.

## Cara menjalankan

Tidak perlu instalasi apa pun.

1. Unduh atau clone folder proyek ini.
2. Buka `index.html` di browser (Chrome, Edge, Firefox, atau Safari terbaru).

Opsional: jalankan dengan server lokal, misalnya ekstensi **Live Server** di VS Code atau
`python -m http.server` lalu buka `http://localhost:8000`.

### Deploy ke GitHub Pages

1. Buat repositori baru di GitHub, lalu unggah seluruh isi folder ini (`index.html` harus ada di root).
2. Buka **Settings > Pages**.
3. Pada **Source** pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu satu sampai dua menit. Link live demo muncul di halaman yang sama.

## Struktur folder

```
turn-back-to-home-web/
├── index.html          # struktur halaman (HTML5 semantik)
├── css/
│   └── style.css       # tampilan, tata letak, dan media queries
├── js/
│   ├── data.js         # data statis (Array of Objects)
│   ├── utils.js        # fungsi bantu (acak, format waktu, buat elemen)
│   ├── storage.js      # papan skor dan nama di localStorage
│   ├── audio.js        # musik dan efek suara (Web Audio API)
│   ├── game.js         # logika game: soal, jawaban, skor
│   ├── ui.js           # manipulasi DOM: peta, panel, halaman, efek
│   └── main.js         # titik masuk: event handling dan inisialisasi
├── assets/
│   ├── sheep.svg
│   ├── sheep-happy.svg
│   └── mountains.svg
└── README.md
```

Urutan skrip di `index.html` penting: `data` → `utils` → `storage` → `audio` → `game` → `ui` → `main`.

## Pemenuhan spesifikasi tugas

**HTML5 semantik dan aksesibilitas**
- Memakai `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<dialog>`, dan `<details>`.
- Semua gambar memiliki atribut `alt`; semua input memiliki `<label>` (kolom jawaban memakai label khusus screen reader).
- Ada skip link, atribut `aria-label`, `aria-live` untuk umpan balik, dan dukungan keyboard penuh.

**CSS3**
- Tata letak modern dengan **CSS Grid** (halaman game, hasil, tutorial) dan **Flexbox** (header, dock, tombol).
- **Media queries** untuk tiga ukuran layar: ponsel (≤ 760px), tablet (761–1023px), desktop (≥ 1024px).
- Design tokens (warna, font, jarak) lewat CSS custom properties, dan `prefers-reduced-motion` untuk animasi.

**JavaScript**
- **Manipulasi DOM dinamis**: peta SVG, batu pijakan, pohon, titik kemajuan, riwayat, papan skor, dan konfeti dibuat lewat kode.
- **Event handling**: `click`, `submit`, `input`, `mouseenter`/`mouseleave` (tooltip batu dan domba), `focus`/`blur`, dan `keydown` (Escape).
- **Array of Objects**: `OPERATORS`, `TREES`, `SCORING`, riwayat jawaban (`state.history`), dan rekor papan skor.
- **Percabangan, perulangan, dan fungsi**: `switch`/`if` untuk membuat soal, `for`/`forEach` untuk render dan statistik, serta fungsi modular dan arrow function.
- **async/await** dan Promise untuk animasi domba, `localStorage` untuk menyimpan data.

## Contoh struktur data

```js
// Objek operator (data.js)
{ key: 'div', symbol: '÷', apply: (a, b) => a / b }

// Satu entri riwayat jawaban (game.js)
{ no: 3, question: '12 ÷ 3', given: 4, answer: 4, ok: true, ms: 5230 }

// Satu rekor papan skor (game.js)
{ id: 1759400000000, name: 'Zar', score: 1300, timeMs: 13000, mistakes: 1, bestStreak: 7, accuracy: 88, date: '...' }
```

## Teknologi

HTML5, CSS3, JavaScript (ES6+) tanpa framework dan tanpa library tambahan. Font: Fredoka dan Nunito (Google Fonts).
