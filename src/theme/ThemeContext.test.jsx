import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import { Navbar } from '../components/Navbar';

const themeOf = () => document.documentElement.dataset.theme;

describe('theme switching', () => {
  it('starts on the ember theme', () => {
    renderWithProviders(<Navbar />);
    expect(themeOf()).toBe('ember');
  });

  it('applies the chosen theme to the document and remembers it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />);

    await user.click(screen.getByRole('button', { name: 'Twilight' }));

    expect(themeOf()).toBe('twilight');
    expect(localStorage.getItem('al-theme')).toBe('twilight');
  });

  it('restores the stored theme on the next visit', () => {
    localStorage.setItem('al-theme', 'daylight');
    renderWithProviders(<Navbar />);

    expect(themeOf()).toBe('daylight');
    expect(screen.getByRole('button', { name: 'Daylight' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('ignores a stored value that is not a real theme', () => {
    localStorage.setItem('al-theme', 'neon-pink');
    renderWithProviders(<Navbar />);

    expect(themeOf()).toBe('ember');
  });

  it('survives localStorage being unavailable', () => {
    /* В приватном окне и при запрете данных сайтов обращение
       к localStorage бросает SecurityError — без try/catch
       это роняло всё приложение в белый экран. */
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError');
      });
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError');
      });

    expect(() => renderWithProviders(<Navbar />)).not.toThrow();
    expect(themeOf()).toBe('ember');

    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe('language switching', () => {
  it('switches the interface and the html lang attribute', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />);

    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Русский' }));

    expect(screen.getByRole('link', { name: 'Проекты' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ru');
    expect(localStorage.getItem('al-lang')).toBe('ru');
  });
});
