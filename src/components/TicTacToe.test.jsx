import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Board } from './TicTacToe';

const squares = () => screen.getAllByRole('button', { name: /^Square \d/ });
const reset = () => document.getElementById('reset');
const status = () => screen.getByText(/^(Next|Winner|It's a draw)/);

/* X завершает верхний ряд [0,1,2] на пятом ходу, ничьи и других
   линий по пути не возникает — стандартный сценарий победы. */
const playXWinsTopRow = async (user) => {
  const s = squares();
  for (const i of [0, 3, 1, 4, 2]) {
    await user.click(s[i]);
  }
};

/* Порядок кликов даёт полностью занятую доску без победителя:
   0 X · 4 O · 8 X · 1 O · 2 X · 5 O · 3 X · 6 O · 7 X.
   Ни одна тройка не совпадает ни в процессе, ни в конце. */
const playToDraw = async (user) => {
  const s = squares();
  for (const i of [0, 4, 8, 1, 2, 5, 3, 6, 7]) {
    await user.click(s[i]);
  }
};

describe('Tic-Tac-Toe', () => {
  it('renders nine squares in a single 3x3 grid container', () => {
    /* Реальный layout (grid-template-columns: repeat(3, 1fr)) живёт
       в TicTacToe.css; jsdom не вычисляет CSS из стилшитов (css:false
       в vite.config), поэтому здесь проверяется структура — девять
       .square внутри одного .ttt-grid, — а не вычисленные колонки. */
    render(<Board />);

    expect(squares()).toHaveLength(9);
    expect(document.querySelectorAll('button.square')).toHaveLength(9);

    const grid = document.querySelector('.ttt-grid');
    expect(grid.querySelectorAll(':scope > button.square')).toHaveLength(9);
  });

  it('marks the first click X and the second O', async () => {
    const user = userEvent.setup();
    render(<Board />);
    const s = squares();

    await user.click(s[0]);
    expect(s[0]).toHaveTextContent('X');

    await user.click(s[1]);
    expect(s[1]).toHaveTextContent('O');
  });

  it('keeps alternating X and O on every subsequent click', async () => {
    const user = userEvent.setup();
    render(<Board />);
    const s = squares();
    const order = [0, 1, 2, 3, 4];
    const expected = ['X', 'O', 'X', 'O', 'X'];

    for (let i = 0; i < order.length; i += 1) {
      await user.click(s[order[i]]);
      expect(s[order[i]]).toHaveTextContent(expected[i]);
    }
  });

  it('ignores a click on a square that is already taken', async () => {
    const user = userEvent.setup();
    render(<Board />);
    const s = squares();

    await user.click(s[0]); // X
    await user.click(s[0]); // повторный клик — должен быть проигнорирован

    expect(s[0]).toHaveTextContent('X');
    /* Следующий реальный ход всё ещё O, значит очередь не сдвинулась. */
    await user.click(s[1]);
    expect(s[1]).toHaveTextContent('O');
  });

  it('declares the winner and stops accepting clicks', async () => {
    const user = userEvent.setup();
    render(<Board />);
    const s = squares();

    await playXWinsTopRow(user);

    expect(status()).toHaveTextContent('Winner: X');
    expect(s[0]).toBeDisabled();

    await user.click(s[5]); // пустая клетка после победы
    expect(s[5]).toHaveTextContent('');
    expect(status()).toHaveTextContent('Winner: X');
  });

  it('highlights only the winning line, not the whole board', async () => {
    const user = userEvent.setup();
    render(<Board />);

    await playXWinsTopRow(user);

    const winning = document.querySelectorAll('.square.is-winning');
    expect(winning).toHaveLength(3);
    expect([...winning].map((el) => el.getAttribute('aria-label'))).toEqual([
      'Square 1: X',
      'Square 2: X',
      'Square 3: X',
    ]);
  });

  it('declares a draw when the board fills with no winner', async () => {
    const user = userEvent.setup();
    render(<Board />);

    await playToDraw(user);

    expect(status()).toHaveTextContent("It's a draw");
    expect(squares().every((sq) => sq.textContent)).toBe(true);
  });

  it('resets the board, the turn and the winner on click', async () => {
    const user = userEvent.setup();
    render(<Board />);

    await playXWinsTopRow(user);
    expect(status()).toHaveTextContent('Winner: X');

    await user.click(reset());

    expect(status()).toHaveTextContent('Next: X');
    expect(squares().every((sq) => sq.textContent === '')).toBe(true);
    expect(squares()[0]).not.toBeDisabled();

    /* После сброса игра снова живая: первый клик опять X. */
    await user.click(squares()[4]);
    expect(squares()[4]).toHaveTextContent('X');
  });

  it('shows whose turn it is before the game ends', () => {
    render(<Board />);
    expect(status()).toHaveTextContent('Next: X');
  });
});
