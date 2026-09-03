import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import { Contact, EMAIL } from './Contact';

/* userEvent.setup() сам подменяет navigator.clipboard рабочей
   заглушкой, поэтому свой stubGlobal здесь не нужен — он бы
   ещё и сломал сам user-event, который ходит в navigator. */

afterEach(() => {
  vi.useRealTimers();
});

describe('Contact', () => {
  it('shows the address as a mailto link', () => {
    renderWithProviders(<Contact />);

    expect(screen.getByRole('link', { name: EMAIL })).toHaveAttribute(
      'href',
      `mailto:${EMAIL}`,
    );
  });

  it('copies the address and confirms it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    await user.click(screen.getByRole('button', { name: /copy/i }));

    await expect(navigator.clipboard.readText()).resolves.toBe(EMAIL);
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('returns to the idle label after two seconds', async () => {
    /* Здесь намеренно fireEvent, а не userEvent: его заглушка
       буфера обмена сама ждёт промисов, и под фейковыми таймерами
       клик просто не дожидается ответа. Нам нужен только сброс
       состояния по таймеру, так что хватает голого клика. */
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    vi.useFakeTimers();
    renderWithProviders(<Contact />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    });
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument();
  });

  it('does not break when the clipboard is unavailable', async () => {
    /* Буфер обмена недоступен без https и может быть запрещён
       политикой — кнопка не должна ронять страницу. */
    const user = userEvent.setup();
    renderWithProviders(<Contact />);

    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new DOMException('denied', 'NotAllowedError'),
    );

    await user.click(screen.getByRole('button', { name: /copy/i }));

    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: EMAIL })).toBeInTheDocument();
  });

  it('opens external profiles safely', () => {
    renderWithProviders(<Contact />);

    for (const name of ['GitHub', 'LinkedIn']) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });
});
