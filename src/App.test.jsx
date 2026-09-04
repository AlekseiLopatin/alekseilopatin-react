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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('routing', () => {
  it('shows projects, about and contact on the home page', () => {
    renderAt('/');

    expect(
      screen.getByRole('heading', { name: 'Projects', level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
  });

  it('renders the practice page with every lab on it', () => {
    renderAt('/practice');

    expect(
      screen.getByRole('heading', { name: /practice lab/i, level: 1 }),
    ).toBeInTheDocument();
    /* getAllByText, а не getByText: у каждой лабы есть и заголовок
       карточки на странице, и собственный заголовок внутри. */
    expect(screen.getByText(/pick a colour/i)).toBeInTheDocument();
    expect(screen.getAllByText(/otp generator/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/event rsvp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tic-tac-toe/i).length).toBeGreaterThan(0);
  });

  it('renders the currency page', () => {
    renderAt('/currency');

    expect(
      screen.getByRole('heading', { name: /currency converter/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('answers an unknown address with the 404 page, not a blank screen', () => {
    renderAt('/does-not-exist');

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('/does-not-exist')).toBeInTheDocument();
    /* Навигация должна остаться: с 404 нужно иметь возможность уйти. */
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });

  it('navigates from the projects page to the practice page', async () => {
    /* Practice Lab — 10-й проект, значит скрыт за "show more". */
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('button', { name: /show \d+ more/i }));
    await user.click(screen.getByRole('link', { name: /Practice Lab/ }));

    expect(
      screen.getByRole('heading', { name: /practice lab/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('has no dead links anywhere in the footer', () => {
    renderAt('/');

    const footer = screen.getByRole('contentinfo');
    for (const link of within(footer).getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toBe('#');
      expect(link.getAttribute('href')).toBeTruthy();
    }
  });

  it('sets a page-specific document title', () => {
    renderAt('/currency');
    expect(document.title).toMatch(/currency converter/i);
  });
});
