import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { WheelOfNames } from './WheelOfNames';

/* jsdom не реализует 2D-контекст канваса (getContext возвращает null),
   а режим "Wheel" смонтирован по умолчанию и сразу рисует на канвасе.
   Без этой заглушки монтирование WheelOfNames падало бы с
   "ctx.setTransform is not a function" ещё до того, как тест успеет
   переключиться на безопасный для тестов режим. Методы — no-op,
   пиксели канваса здесь не проверяются (это сделано вручную в
   браузере: все шесть режимов прогнаны и дали победителя). */
const stubCtx = {
  clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {},
  closePath() {}, fill() {}, stroke() {}, save() {}, restore() {},
  translate() {}, rotate() {}, fillRect() {}, strokeRect() {},
  fillText() {}, setTransform() {},
  measureText: () => ({ width: 40 }),
  createRadialGradient: () => ({ addColorStop() {} }),
};

/* jsdom не реализует Web Audio вообще — sTick/sClunk/sFanfare и
   остальные звуки из audio.js падали бы на "AudioContext is not a
   constructor" в момент спина. Заглушка покрывает только то, что
   audio.js реально вызывает: осциллятор, gain-узел, буфер шума. */
class StubAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};
  resume() {}
  createOscillator() {
    return {
      connect: () => ({ connect() {} }),
      start() {},
      stop() {},
      frequency: { value: 0 },
    };
  }
  createGain() {
    return {
      connect: () => ({ connect() {} }),
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    };
  }
  createBuffer(channels, length) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return { connect: () => ({ connect() {} }), start() {}, buffer: null };
  }
}

const click = (el) => act(() => fireEvent.click(el));
const tick = (ms) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(stubCtx);
  vi.stubGlobal('AudioContext', StubAudioContext);
  vi.stubGlobal('alert', vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const modeButton = (label) =>
  screen.getAllByRole('button', { name: new RegExp(label, 'i') }).find((b) => b.className.includes('wheel-mode'));

const goButton = () => document.querySelector('.wheel-gobtn');

/* Полный цикл "выбрать → победитель" прогоняется через режим Gacha:
   он анимируется через setTimeout, а не requestAnimationFrame,
   поэтому детерминирован под fake timers — в отличие от Wheel/Slot/
   Plinko/Race, которые используют RAF и физику реального времени
   (те шесть проверены вручную в браузере, см. комментарий выше). */
const runGachaSpin = () => {
  click(modeButton('Gacha'));
  click(goButton());
  tick(4000);
};

describe('WheelOfNames', () => {
  it('renders the first grade with its full roster in the pool', () => {
    render(<WheelOfNames />);
    expect(screen.getByText(/In pool: 30\/30/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5A' })).toHaveClass('is-active');
  });

  it('picks a winner and shrinks the pool when "Remove picked" is on', () => {
    render(<WheelOfNames />);
    runGachaSpin();

    expect(screen.getByText(/and the winner is/i)).toBeInTheDocument();
    expect(screen.getByText(/In pool: 29\/30/)).toBeInTheDocument();
  });

  it('does not touch the pool when "Remove picked" is off', () => {
    render(<WheelOfNames />);
    click(screen.getByRole('checkbox'));
    runGachaSpin();

    expect(screen.getByText(/In pool: 30\/30/)).toBeInTheDocument();
    /* Раз имя не убрано из пула, должна появиться ручная кнопка. */
    expect(screen.getByRole('button', { name: /remove from pool/i })).toBeInTheDocument();
  });

  it('blocks the go button while a spin is in flight', () => {
    render(<WheelOfNames />);
    click(modeButton('Gacha'));
    click(goButton());
    expect(goButton()).toBeDisabled();
  });

  it('switching grade tabs shows that grade\'s own pool', () => {
    render(<WheelOfNames />);
    click(screen.getByRole('button', { name: '3/11 ch' }));
    expect(screen.getByRole('button', { name: '3/11 ch' })).toHaveClass('is-active');
    expect(screen.getByText(/In pool: 29\/29/)).toBeInTheDocument();
  });

  it('shows the empty-pool message once every student is picked, and Reset clears it', () => {
    render(<WheelOfNames />);
    click(screen.getByRole('button', { name: '4/11 ch' })); // маленький, всего один тест-класс не трогаем
    // используем "Edit names" вместо 30 кликов, чтобы дойти до пустого пула быстро
    click(screen.getByRole('button', { name: /edit names/i }));
    fireEvent.change(screen.getByLabelText(/students/i), { target: { value: 'Solo' } });
    click(screen.getByRole('button', { name: /^save$/i }));

    click(modeButton('Gacha'));
    click(goButton());
    tick(4000);
    click(within(document.querySelector('.wheel-winover')).getByRole('button', { name: /close/i }));

    expect(screen.getByText(/has been picked/i)).toBeInTheDocument();
    click(screen.getByRole('button', { name: /reset the pool/i }));
    expect(screen.getByText(/In pool: 1\/1/)).toBeInTheDocument();
  });

  it('editor saves a new roster and label', () => {
    render(<WheelOfNames />);
    click(screen.getByRole('button', { name: /edit names/i }));

    fireEvent.change(screen.getByLabelText(/grade name/i), { target: { value: 'Custom' } });
    fireEvent.change(screen.getByLabelText(/students/i), {
      target: { value: 'Ann\nBob\nBob' },
    });
    click(screen.getByRole('button', { name: /^save$/i }));

    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
    /* "Bob" повторён в textarea — сохранённый список дедуплицируется. */
    expect(screen.getByText(/In pool: 2\/2/)).toBeInTheDocument();
  });

  it('restore defaults refills the textarea without saving yet', () => {
    render(<WheelOfNames />);
    click(screen.getByRole('button', { name: /edit names/i }));
    fireEvent.change(screen.getByLabelText(/students/i), { target: { value: 'Temp' } });

    click(screen.getByRole('button', { name: /restore defaults/i }));
    expect(screen.getByLabelText(/students/i).value).toContain('Paopao');
    /* Пул не должен был поменяться — ещё не Save. */
    expect(screen.getByText(/In pool: 30\/30/)).toBeInTheDocument();
  });

  it('refuses to save an empty roster', () => {
    render(<WheelOfNames />);
    click(screen.getByRole('button', { name: /edit names/i }));
    fireEvent.change(screen.getByLabelText(/students/i), { target: { value: '   \n  ' } });
    click(screen.getByRole('button', { name: /^save$/i }));

    expect(window.alert).toHaveBeenCalled();
    expect(screen.getByText(/In pool: 30\/30/)).toBeInTheDocument();
  });

  it('lets a picked student be returned to the pool from the tray', () => {
    render(<WheelOfNames />);
    runGachaSpin();
    const winnerName = screen.getByText(/and the winner is/i).parentElement.querySelector('div:nth-child(2)')?.textContent;
    click(within(document.querySelector('.wheel-winover')).getByRole('button', { name: /close/i }));

    const chip = within(document.querySelector('.wheel-chips')).getByText(winnerName, {
      exact: false,
    });
    expect(chip).toBeInTheDocument();
    click(document.querySelector('.wheel-chip b'));
    expect(screen.getByText(/In pool: 30\/30/)).toBeInTheDocument();
  });
});
