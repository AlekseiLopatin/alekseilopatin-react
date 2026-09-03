import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

beforeEach(() => {
  /* Тема и язык живут в localStorage, а он общий на весь прогон:
     без очистки один тест начинал бы с состояния, оставленного другим. */
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  cleanup();
});
