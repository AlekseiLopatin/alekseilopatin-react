/* Синтез звука через Web Audio — без единого mp3-файла.
   Портировано из ванильной версии почти без изменений: тон,
   шум и составленные из них сигналы (тик, щелчок, хлопок и т.д). */

let ctx = null;

const getContext = (muted) => {
  if (muted) return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const tone = (muted, freq, dur, type = 'sine', gain = 0.15, when = 0) => {
  const c = getContext(muted);
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const vol = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(gain, t0);
  vol.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(vol).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
};

const noise = (muted, dur, gain = 0.25, when = 0) => {
  const c = getContext(muted);
  if (!c) return;
  const t0 = c.currentTime + when;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const vol = c.createGain();
  vol.gain.value = gain;
  src.connect(vol).connect(c.destination);
  src.start(t0);
};

const rand = (a, b) => a + Math.random() * (b - a);

/* Каждая функция принимает muted первым аргументом — по этому
   значению из useWheelState звук либо звучит, либо нет. */
export const sTick = (muted) => tone(muted, 1500, 0.03, 'square', 0.05);
export const sClunk = (muted) => {
  tone(muted, 150, 0.1, 'triangle', 0.3);
  tone(muted, 85, 0.14, 'sine', 0.25);
};
export const sPop = (muted) => {
  noise(muted, 0.06, 0.3);
  tone(muted, 380, 0.07, 'square', 0.15);
};
export const sFanfare = (muted) => {
  [523, 659, 784, 1047].forEach((f, i) => {
    tone(muted, f, 0.22, 'triangle', 0.18, i * 0.11);
    tone(muted, f / 2, 0.22, 'sine', 0.1, i * 0.11);
  });
};
export const sWhir = (muted) => tone(muted, rand(700, 900), 0.05, 'sawtooth', 0.03);
