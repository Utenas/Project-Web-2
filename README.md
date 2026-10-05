# Turn Back To Home

Game edukasi aritmatika berbasis web. Pemain membantu seekor domba yang tersesat di pegunungan untuk kembali ke rumah dengan menjawab soal matematika.

**Tugas 2 Figma & JavaScript**
Teknologi: HTML5, CSS3, JavaScript (ES6+)

* **Figma:** https://www.figma.com/design/88DsescZYvI7M5wJefUoPD/Project-Web2
* **Live Demo:** https://utenas.github.io/Project-Web-2

## Fitur

* Soal aritmatika acak: `+`, `−`, `×`, `÷`
* Jawaban benar membuat domba maju.
* Jawaban salah membuat domba kembali ke Start.
* Sistem skor, waktu, akurasi, dan combo.
* Maksimal 3 petunjuk setiap permainan.
* Riwayat jawaban.
* Top 10 skor menggunakan `localStorage`.
* Musik dan efek suara menggunakan Web Audio API.
* Tampilan responsif desktop, tablet, dan mobile.
* Halaman Menu, Game, Hasil, dan Tutorial.

## Cara Bermain

1. Masukkan nama pemain atau kosongkan, lalu klik domba atau tekan `Enter`.
2. Jawab soal dan tekan **Submit** atau `Enter`.
3. Jawaban benar membuat domba maju.
4. Jawaban salah membuat domba kembali ke Start.
5. Sampai di rumah untuk menyelesaikan permainan dan melihat hasil.

## Cara Menjalankan

Tidak membutuhkan instalasi tambahan. Buka `index.html` menggunakan browser.

Atau gunakan server lokal:

```bash
python -m http.server
```

Kemudian buka `http://localhost:8000`.

## Struktur Folder

```text
turn-back-to-home-web/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   ├── utils.js
│   ├── storage.js
│   ├── audio.js
│   ├── game.js
│   ├── ui.js
│   └── main.js
├── assets/
│   ├── sheep.svg
│   ├── sheep-happy.svg
│   └── mountains.svg
└── README.md
```

## Spesifikasi Tugas

**HTML5:** menggunakan elemen semantik dan fitur aksesibilitas.

**CSS3:** menggunakan Grid, Flexbox, Custom Properties, media queries, dan animasi responsif.

**JavaScript:** menggunakan DOM Manipulation, Event Handling, Array of Objects, percabangan, perulangan, function, `async/await`, Promise, dan `localStorage`.

## Teknologi

HTML5, CSS3, JavaScript ES6+, Fredoka & Nunito.

Tanpa framework atau library tambahan.
