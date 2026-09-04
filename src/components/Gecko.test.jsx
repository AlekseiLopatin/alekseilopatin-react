import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { Gecko } from './Gecko';

const tick = (ms) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const query = (container) => container.querySelector('.gecko');

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Gecko', () => {
  it('stays hidden while inactive', () => {
    const { container } = render(<Gecko active={false} />);
    tick(10_000);
    expect(query(container)).toBeNull();
  });

  it('waits a few seconds before appearing once active', () => {
    const { container } = render(<Gecko active />);

    tick(3000);
    expect(query(container)).toBeNull();

    tick(3500); // пересекает APPEAR_DELAY_MS = 6000
    expect(query(container)).not.toBeNull();
  });

  it('disappears as soon as it goes inactive', () => {
    const { container, rerender } = render(<Gecko active />);
    tick(6500);
    expect(query(container)).not.toBeNull();

    rerender(<Gecko active={false} />);
    expect(query(container)).toBeNull();
  });

  it('resets the appear delay if it goes inactive and active again', () => {
    const { container, rerender } = render(<Gecko active />);
    tick(2000);
    rerender(<Gecko active={false} />);
    rerender(<Gecko active />);

    /* Не хватает даже исходных 6с, потому что отсчёт задержки
       начался заново после повторной активации. */
    tick(4000);
    expect(query(container)).toBeNull();

    tick(2500);
    expect(query(container)).not.toBeNull();
  });

  it('respects prefers-reduced-motion and never appears', () => {
    const original = window.matchMedia;
    window.matchMedia = (q) => ({
      matches: q === '(prefers-reduced-motion: reduce)',
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });

    const { container } = render(<Gecko active />);
    tick(30_000);
    expect(query(container)).toBeNull();

    window.matchMedia = original;
  });

  it('is marked decorative for assistive tech', () => {
    /* pointer-events:none живёт в Gecko.css, которую vitest не
       грузит (css:false в vite.config.js) — тут проверяем только
       то, что можно увидеть без вычисленных стилей. */
    const { container } = render(<Gecko active />);
    tick(6500);

    expect(query(container)).toHaveAttribute('aria-hidden', 'true');
  });
});
