import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  /* Тема и язык живут в localStorage, а он общий на весь прогон:
     без очистки один тест начинал бы с состояния, оставленного другим. */
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');

  /* jsdom не реализует matchMedia — компоненты, читающие
     prefers-reduced-motion (например Gecko), иначе падали бы
     с "matchMedia is not a function" при рендере в тестах. */
  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
  }
});

afterEach(() => {
  cleanup();
});
