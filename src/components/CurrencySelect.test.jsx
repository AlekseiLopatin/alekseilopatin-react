import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { CurrencySelect } from './CurrencySelect';

const codes = ['USD', 'EUR', 'RUB', 'KZT', 'BYN', 'JPY'];

const setup = (onChange = vi.fn()) => {
  const user = userEvent.setup();
  render(
    <CurrencySelect
      id="from"
      label="From"
      value="USD"
      codes={codes}
      onChange={onChange}
    />,
  );
  return { user, onChange };
};

const open = async (user) =>
  user.click(screen.getByRole('button', { name: /from/i }));

const options = () => screen.getAllByRole('option');

describe('CurrencySelect', () => {
  it('keeps the list closed until it is asked to open', () => {
    setup();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('lists every currency and focuses the search field', async () => {
    const { user } = setup();
    await open(user);

    expect(options()).toHaveLength(codes.length);
    expect(screen.getByPlaceholderText(/search/i)).toHaveFocus();
  });

  it('filters by currency code', async () => {
    const { user } = setup();
    await open(user);

    await user.type(screen.getByPlaceholderText(/search/i), 'kzt');

    expect(options()).toHaveLength(1);
    expect(screen.getByText('Kazakhstani Tenge')).toBeInTheDocument();
  });

  it('filters by currency name too, not just the code', async () => {
    const { user } = setup();
    await open(user);

    await user.type(screen.getByPlaceholderText(/search/i), 'ruble');

    /* "ruble" встречается и в Russian Ruble, и в Belarusian Ruble —
       поиск по названию должен найти оба. */
    expect(options()).toHaveLength(2);
  });

  it('says so when nothing matches', async () => {
    const { user } = setup();
    await open(user);

    await user.type(screen.getByPlaceholderText(/search/i), 'zzz');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText(/no match/i)).toBeInTheDocument();
  });

  it('reports the picked currency and closes', async () => {
    const { user, onChange } = setup();
    await open(user);

    await user.click(screen.getByRole('option', { name: /Russian Ruble/ }));

    expect(onChange).toHaveBeenCalledWith('RUB');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks the current value as selected', async () => {
    const { user } = setup();
    await open(user);

    expect(screen.getByRole('option', { name: /US Dollar/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('closes on Escape without choosing anything', async () => {
    const { user, onChange } = setup();
    await open(user);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes when the pointer goes down outside it', async () => {
    const { user } = setup();
    await open(user);

    await user.click(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
