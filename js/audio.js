/* ==========================================================================
   audio.js
   Musik latar dan efek suara sederhana memakai Web Audio API.
   Tidak butuh file audio. Suara baru menyala setelah tombol musik diklik
   (aturan browser: audio harus dimulai oleh interaksi pengguna).
   ========================================================================== */

const Sound = (() => {
  let ctx = null;        // AudioContext
  let timer = null;      // interval musik latar
  let enabled = false;   // status suara
  let noteIndex = 0;

  // Tangga nada pentatonik supaya terdengar lembut
  const SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 392.0, 329.6];

  // Mainkan satu nada
  const tone = (freq, duration, type = 'sine', volume = 0.08, offset = 0) => {
    const start = ctx.currentTime + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  };

  // Nada musik latar (urutan melompat acak sedikit)
  const playBackgroundNote = () => {
    tone(SCALE[noteIndex % SCALE.length], 1.6);
    noteIndex += Math.random() < 0.5 ? 1 : 3;
  };

  // Nyalakan atau matikan suara. Mengembalikan status terbaru.
  const toggle = () => {
    enabled = !enabled;
    if (enabled) {
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume();
      } catch (error) {
        enabled = false;
        return false;
      }
      playBackgroundNote();
      timer = setInterval(playBackgroundNote, 700);
    } else {
      clearInterval(timer);
    }
    return enabled;
  };

  // Efek suara untuk kejadian tertentu
  const sfx = (name) => {
    if (!enabled || !ctx) return;
    switch (name) {
      case 'correct':
        tone(523.3, 0.18);
        tone(659.3, 0.25, 'sine', 0.08, 0.12);
        break;
      case 'wrong':
        tone(180, 0.4, 'sawtooth', 0.05);
        break;
      case 'win':
        [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, 0.3, 'triangle', 0.08, i * 0.14));
        break;
      case 'hover':
        tone(700, 0.08, 'sine', 0.03);
        break;
      default:
        break;
    }
  };

  return { toggle, sfx, isOn: () => enabled };
})();
