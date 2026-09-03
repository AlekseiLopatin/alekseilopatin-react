import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { OTPGenerator } from './OTPGenerator';

/* Отсчёт длится пять секунд реального времени, поэтому крутим
   таймеры вручную — иначе тест либо тормозил бы, либо мигал. */
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/* Каждый следующий setTimeout создаётся эффектом уже ПОСЛЕ
   ре-рендера, поэтому один advanceTimersByTime(5000) прокрутил бы
   ровно один тик: на момент вызова остальных таймеров ещё нет.
   Отматываем по секунде, давая React перерисоваться между ними. */
const tick = (seconds) => {
  for (let i = 0; i < seconds; i += 1) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
};

const button = () => screen.getByRole('button', { name: /generate otp/i });
const timer = () => document.getElementById('otp-timer');

describe('OTPGenerator', () => {
  it('starts with a hint, an empty timer and an enabled button', () => {
    render(<OTPGenerator />);

    expect(screen.getByText(/click 'generate otp'/i)).toBeInTheDocument();
    expect(timer()).toHaveTextContent('');
    expect(button()).toBeEnabled();
  });

  it('generates a six-digit code and locks the button while counting', () => {
    render(<OTPGenerator />);

    act(() => button().click());

    expect(document.getElementById('otp-display').textContent).toMatch(
      /^\d{6}$/,
    );
    expect(timer()).toHaveTextContent('Expires in: 5 seconds');
    expect(button()).toBeDisabled();
  });

  it('counts down one second at a time', () => {
    render(<OTPGenerator />);
    act(() => button().click());

    tick(1);
    expect(timer()).toHaveTextContent('Expires in: 4 seconds');
    tick(2);
    expect(timer()).toHaveTextContent('Expires in: 2 seconds');
  });

  it('expires at zero, releases the button and stops scheduling', () => {
    render(<OTPGenerator />);
    act(() => button().click());

    tick(5);
    expect(timer()).toHaveTextContent(/expired/i);
    expect(button()).toBeEnabled();

    /* Ключевое требование: на нуле таймер должен замолчать,
       а не продолжать тикать в минус. */
    expect(vi.getTimerCount()).toBe(0);
    tick(10);
    expect(timer()).toHaveTextContent(/expired/i);
  });

  it('pads short numbers so the code is always six digits', () => {
    /* Math.random близкий к нулю даёт, например, 42 —
       без padStart код оказался бы двузначным. */
    vi.spyOn(Math, 'random').mockReturnValue(0.000042);
    render(<OTPGenerator />);

    act(() => button().click());

    expect(document.getElementById('otp-display')).toHaveTextContent('000042');
    Math.random.mockRestore();
  });

  it('announces the timer politely for screen readers', () => {
    render(<OTPGenerator />);
    expect(timer()).toHaveAttribute('aria-live', 'polite');
  });
});
