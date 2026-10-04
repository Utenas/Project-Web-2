/* ==========================================================================
   utils.js
   Fungsi bantu kecil yang dipakai di banyak tempat.
   ========================================================================== */

// Pintasan untuk mengambil elemen DOM
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

// Bilangan bulat acak antara min dan max (keduanya termasuk)
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Ambil satu elemen acak dari array
const pick = (list) => list[randInt(0, list.length - 1)];

// Ubah milidetik menjadi format mm:ss
const formatTime = (ms) => {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

// Jeda berbasis Promise, dipakai bersama async/await
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hapus semua isi (anak) sebuah elemen
const clearChildren = (element) => {
  while (element.firstChild) element.removeChild(element.firstChild);
};

// Buat elemen HTML dengan class dan teks (singkat, supaya kode DOM rapi)
const createEl = (tag, className = '', text = '') => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};
