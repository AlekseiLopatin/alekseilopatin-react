import engine from './engine';
import saves from './saves';

export const KEY = 'math-buddy-v1';
export function readProgress() {
  let state = engine.createState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const original = JSON.parse(raw);
      state = saves.validate(original);
      if (original.version === 1 && !localStorage.getItem(`${KEY}-before-v2`)) localStorage.setItem(`${KEY}-before-v2`, raw);
    }
    return { state, protected: false };
  } catch { return { state, protected: true }; }
}
export function storeProgress(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function restoreProgress(value, current) {
  const next = saves.validate(value);
  localStorage.setItem(`${KEY}-before-import`, localStorage.getItem(KEY) ?? JSON.stringify(current));
  storeProgress(next);
  return next;
}
export function download(content, filename) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
