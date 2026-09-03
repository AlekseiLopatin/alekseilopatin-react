import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import { CurrencyConverter } from './CurrencyConverter';
import { FALLBACK_RATES } from '../data/currencies';

const liveResponse = {
  result: 'success',
  time_last_update_utc: 'Thu, 03 Sep 2026 00:02:31 +0000',
  rates: { USD: 1, EUR: 0.5, RUB: 50, GBP: 0.25 },
};

const mockFetch = (impl) => {
  vi.stubGlobal('fetch', vi.fn(impl));
};

/* Курсы в моке заведомо круглые и не совпадают с реальными:
   если тест пройдёт на них, значит компонент действительно
   считает по полученным данным, а не по запасной таблице. */
beforeEach(() => {
  mockFetch(async () => ({ ok: true, json: async () => liveResponse }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const amountInput = () => screen.getByLabelText(/amount/i);

describe('CurrencyConverter', () => {
  it('converts using the rates it fetched', async () => {
    renderWithProviders(<CurrencyConverter />);

    await waitFor(() => {
      expect(screen.getByText(/live rates/i)).toBeInTheDocument();
    });
    expect(screen.getByText('50.00 EUR')).toBeInTheDocument();
  });

  it('falls back to stored rates when the request fails', async () => {
    mockFetch(async () => {
      throw new Error('network down');
    });
    renderWithProviders(<CurrencyConverter />);

    await waitFor(() => {
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });

    const expected = (100 * FALLBACK_RATES.EUR).toFixed(2);
    expect(screen.getByText(`${expected} EUR`)).toBeInTheDocument();
  });

  it('treats a 200 response with result != success as a failure', async () => {
    /* Это API отвечает 200 даже на логическую ошибку, поэтому
       проверять только response.ok недостаточно. */
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ result: 'error', 'error-type': 'unsupported-code' }),
    }));
    renderWithProviders(<CurrencyConverter />);

    await waitFor(() => {
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });

  it('recalculates when the amount changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CurrencyConverter />);
    await waitFor(() => screen.getByText(/live rates/i));

    await user.clear(amountInput());
    await user.type(amountInput(), '40');

    expect(screen.getByText('20.00 EUR')).toBeInTheDocument();
  });

  it('swaps the two currencies and inverts the result', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CurrencyConverter />);
    await waitFor(() => screen.getByText(/live rates/i));

    await user.click(screen.getByRole('button', { name: /swap currencies/i }));

    expect(screen.getByText('200.00 USD')).toBeInTheDocument();
    expect(screen.getByText('1 EUR = 2.0000 USD')).toBeInTheDocument();
  });

  it('aborts the request if it unmounts before the response', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderWithProviders(<CurrencyConverter />);

    unmount();
    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});
