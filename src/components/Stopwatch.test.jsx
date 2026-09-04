import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Stopwatch } from './Stopwatch';

/* Секундомер и таймер оба считают от Date.now(), поэтому advance
   должен двигать И таймеры, И системные часы — иначе следующий
   тик всё равно вычислит разницу от настоящего "сейчас". */
const tick = (ms) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

/* userEvent зависает под fake timers (та же ловушка, что и в
   Contact.test.jsx) — здесь везде fireEvent + act. */
const click = (el) => act(() => fireEvent.click(el));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/* Оба режима смонтированы одновременно (см. комментарий в
   Stopwatch.jsx), поэтому .stopwatch-display существует дважды —
   берём тот, что внутри НЕ скрытой панели. */
const display = () =>
  document.querySelector('.stopwatch-panel:not([hidden]) .stopwatch-display');

describe('Stopwatch — stopwatch mode', () => {
  it('starts at zero with Reset disabled', () => {
    render(<Stopwatch />);

    expect(display()).toHaveTextContent('00:00:00.00');
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('counts up while running and stops on pause', () => {
    render(<Stopwatch />);

    click(screen.getByRole('button', { name: 'Start' }));
    tick(1500);
    expect(display()).toHaveTextContent(/^00:00:01\./);

    click(screen.getByRole('button', { name: 'Pause' }));
    const paused = display().textContent;
    tick(1000);
    /* После паузы время не должно тикать дальше. */
    expect(display()).toHaveTextContent(paused);
  });

  it('resumes from where it paused, not from zero', () => {
    render(<Stopwatch />);

    click(screen.getByRole('button', { name: 'Start' }));
    tick(1000);
    click(screen.getByRole('button', { name: 'Pause' }));
    click(screen.getByRole('button', { name: 'Resume' }));
    tick(1000);

    expect(display()).toHaveTextContent(/^00:00:02\./);
  });

  it('logs the time to history on reset and zeroes the display', () => {
    render(<Stopwatch />);

    click(screen.getByRole('button', { name: 'Start' }));
    tick(2000);
    click(screen.getByRole('button', { name: 'Pause' }));
    click(screen.getByRole('button', { name: 'Reset' }));

    expect(display()).toHaveTextContent('00:00:00.00');
    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByText(/^00:00:02\./)).toBeInTheDocument();
  });

  it('does not log to history when reset at zero', () => {
    render(<Stopwatch />);

    click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.queryByRole('heading', { name: 'History' })).not.toBeInTheDocument();
  });
});

describe('Stopwatch — timer mode', () => {
  const switchToTimer = () => click(screen.getByRole('tab', { name: 'Timer' }));

  it('defaults to 15 minutes', () => {
    render(<Stopwatch />);

    switchToTimer();
    expect(display()).toHaveTextContent('00:15:00');
  });

  it('applies a preset and counts down after Start', () => {
    render(<Stopwatch />);
    switchToTimer();

    click(screen.getByRole('button', { name: '1 min' }));
    expect(display()).toHaveTextContent('00:01:00');

    click(screen.getByRole('button', { name: 'Start' }));
    tick(30000);
    expect(display()).toHaveTextContent('00:00:30');
  });

  it('accepts a custom duration in minutes', () => {
    render(<Stopwatch />);
    switchToTimer();

    fireEvent.change(screen.getByPlaceholderText(/custom/i), {
      target: { value: '2' },
    });
    click(screen.getByRole('button', { name: 'Set' }));

    expect(display()).toHaveTextContent('00:02:00');
  });

  it('shows "Time\'s up!" and disables Start once it reaches zero', () => {
    render(<Stopwatch />);
    switchToTimer();

    click(screen.getByRole('button', { name: '1 min' }));
    click(screen.getByRole('button', { name: 'Start' }));
    tick(60_000);

    expect(display()).toHaveTextContent('00:00:00');
    expect(screen.getByText("Time's up!")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
  });

  it('reset returns to the configured duration, not zero', () => {
    render(<Stopwatch />);
    switchToTimer();

    click(screen.getByRole('button', { name: '5 min' }));
    click(screen.getByRole('button', { name: 'Start' }));
    tick(60_000);
    click(screen.getByRole('button', { name: 'Reset' }));

    expect(display()).toHaveTextContent('00:05:00');
  });

  it('keeps stopwatch state intact when switching tabs away and back', () => {
    render(<Stopwatch />);

    click(screen.getByRole('button', { name: 'Start' }));
    tick(1000);
    click(screen.getByRole('button', { name: 'Pause' }));
    const paused = display().textContent;

    switchToTimer();
    click(screen.getByRole('tab', { name: 'Stopwatch' }));

    expect(display()).toHaveTextContent(paused);
  });
});
