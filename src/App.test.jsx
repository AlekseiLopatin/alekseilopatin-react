import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';

const renderAt = (route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );

/* jsdom не рисует 2D-канвас и не знает Web Audio — колесо (режим
   Wheel по умолчанию) монтирует канвас сразу, а любой спин играет
   звук. Те же заглушки, что и в WheelOfNames.test.jsx. */
const stubCtx = {
  clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {},
  closePath() {}, fill() {}, stroke() {}, save() {}, restore() {},
  translate() {}, rotate() {}, fillRect() {}, strokeRect() {},
  fillText() {}, setTransform() {},
  measureText: () => ({ width: 40 }),
  createRadialGradient: () => ({ addColorStop() {} }),
};

class StubAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  destination = {};
  resume() {}
  createOscillator() {
    return { connect: () => ({ connect() {} }), start() {}, stop() {}, frequency: { value: 0 } };
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

beforeEach(() => {
  /* Конвертер на своей странице ходит в сеть — подменяем,
     чтобы тест роутинга не зависел от интернета. */
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        result: 'success',
        time_last_update_utc: 'Thu, 03 Sep 2026 00:02:31 +0000',
        rates: { USD: 1, EUR: 0.5 },
      }),
    })),
  );
  window.scrollTo = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(stubCtx);
  vi.stubGlobal('AudioContext', StubAudioContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('routing', () => {
  it.each([
    ['Color Picker', 'color-picker', '#color-input'],
    ['OTP Generator', 'otp-generator', '#generate-otp-button'],
    ['Event RSVP', 'event-rsvp', '#rsvp-name'],
    ['Mood Board', 'mood-board', '.mood-board'],
  ])('opens %s from the catalogue and returns to Practice', async (title, id, selector) => {
    const user = userEvent.setup();
    renderAt('/practice');
    const link = await screen.findByRole('link', { name: `Open lab: ${title}` });
    expect(link).toHaveAttribute('href', `/practice/${id}`);
    expect(document.querySelector(selector)).not.toBeInTheDocument();
    await user.click(link);
    expect(await screen.findByRole('link', { name: '← Back to Practice' })).toBeInTheDocument();
    expect(document.querySelector(selector)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '← Back to Practice' }));
    expect(await screen.findByRole('link', { name: `Open lab: ${title}` })).toBeInTheDocument();
  });

  it('shows projects, about and contact on the home page', async () => {
    renderAt('/');

    expect(
      await screen.findByRole('heading', { name: 'Projects', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
  });

  it('renders the practice page with every lab on it', async () => {
    renderAt('/practice');

    expect(
      await screen.findByRole('heading', { name: /practice lab/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Open lab:/ })).toHaveLength(6);
    expect(screen.getByRole('link', { name: 'Open lab: Music Shopping Cart' })).toHaveAttribute('href', '/practice/music-shopping-cart.html');
    expect(screen.getByRole('link', { name: 'Open lab: Photography Exhibit' })).toHaveAttribute('href', '/practice/photography-exhibit.html');
    expect(screen.queryByRole('button', { name: 'Generate OTP' })).not.toBeInTheDocument();
  });

  it('renders the currency page', async () => {
    renderAt('/currency');

    expect(
      await screen.findByRole('heading', { name: /currency converter/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders the games hub with links to every game', async () => {
    renderAt('/games');

    expect(
      await screen.findByRole('heading', { name: /mini games/i, level: 1 }),
    ).toBeInTheDocument();
    /* Внутренние — <Link>: Tic-Tac-Toe и Stopwatch. */
    expect(screen.getByRole('link', { name: /tic-tac-toe/i })).toHaveAttribute(
      'href',
      '/games/tic-tac-toe',
    );
    expect(screen.getByRole('link', { name: /stopwatch/i })).toHaveAttribute(
      'href',
      '/stopwatch',
    );
    /* Внешняя — новая вкладка, ведёт на архивный сайт. */
    const godotGame = screen.getByRole('link', {
      name: /protect your friend/i,
    });
    expect(godotGame).toHaveAttribute('target', '_blank');
    expect(godotGame.getAttribute('href')).toContain('legacy.alekseilopatin.com');
    /* Статичные ванильные игры — обычная ссылка, без target,
       полная перезагрузка на статику из public/games. */
    const dragonGame = screen.getByRole('link', {
      name: /dragon repeller/i,
    });
    expect(dragonGame).toHaveAttribute('href', '/games/dragon-repeller/');
    expect(dragonGame).not.toHaveAttribute('target');
  });

  it('renders Tic-Tac-Toe on its own page, reachable from the games hub', async () => {
    const user = userEvent.setup();
    renderAt('/games');

    await user.click(await screen.findByRole('link', { name: /tic-tac-toe/i }));

    expect(
      await screen.findByRole('heading', { name: /tic-tac-toe/i, level: 1 }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll('button.square')).toHaveLength(9);
  });

  it('serves the React stopwatch at the legacy /stopwatch URL', async () => {
    renderAt('/stopwatch');

    expect(
      await screen.findByRole('heading', { name: /stopwatch/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^stopwatch$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^timer$/i })).toBeInTheDocument();
    /* Без навбара/футера, только кнопка "назад". */
    expect(screen.queryByRole('navigation', { name: /main/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to mini games/i })).toBeInTheDocument();
  });

  it('serves the student picker wheel without the site navbar or footer', async () => {
    renderAt('/games/wheel');

    expect(await screen.findByText(/picker/i)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /main/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to mini games/i })).toBeInTheDocument();
  });

  it('answers an unknown address with the 404 page, not a blank screen', async () => {
    renderAt('/does-not-exist');

    expect(await screen.findByText('404')).toBeInTheDocument();
    expect(screen.getByText('/does-not-exist')).toBeInTheDocument();
    /* Навигация должна остаться: с 404 нужно иметь возможность уйти. */
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });

  it('navigates from the projects page to the practice page', async () => {
    /* Practice Lab — 10-й проект, значит скрыт за "show more". */
    const user = userEvent.setup();
    renderAt('/');

    await user.click(await screen.findByRole('button', { name: /show \d+ more/i }));
    await user.click(screen.getByRole('link', { name: /Practice Lab/ }));

    expect(
      await screen.findByRole('heading', { name: /practice lab/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('has no dead links anywhere in the footer', async () => {
    renderAt('/');

    const footer = await screen.findByRole('contentinfo');
    for (const link of within(footer).getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toBe('#');
      expect(link.getAttribute('href')).toBeTruthy();
    }
  });

  it('sets a page-specific document title', async () => {
    renderAt('/currency');
    await screen.findByRole('heading', { name: /currency converter/i, level: 1 });
    expect(document.title).toMatch(/currency converter/i);
  });
});
