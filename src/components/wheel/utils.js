export const rand = (a, b) => a + Math.random() * (b - a);
export const irand = (n) => Math.floor(Math.random() * n);
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = irand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const mod = (x, n) => ((x % n) + n) % n;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const PALETTE = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1',
];
export const colorOf = (i) => PALETTE[i % PALETTE.length];
export const trunc = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
export const easeOutQuart = (t) => 1 - (1 - t) ** 4;
export const easeOutCubic = (t) => 1 - (1 - t) ** 3;
export const hashCode = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/* Общий помощник для canvas-режимов: создаёт канвас, растянутый
   под devicePixelRatio, и возвращает его контекст плюс CSS-размер. */
export const makeCanvas = (stageEl, className) => {
  const canvas = document.createElement('canvas');
  canvas.className = className;
  stageEl.appendChild(canvas);
  const dpr = window.devicePixelRatio || 1;
  const W = stageEl.clientWidth;
  const H = stageEl.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { canvas, ctx, W, H };
};
