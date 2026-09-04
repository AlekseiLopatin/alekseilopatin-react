import { useState } from 'react';
import './TicTacToe.css';

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/* Возвращает { winner, line } на первой найденной тройке
   одинаковых знаков, иначе null. Line нужен отдельно от winner,
   чтобы подсветить именно выигрышную тройку, а не все клетки. */
const findWinner = (squares) => {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return null;
};

const EMPTY_BOARD = Array(9).fill(null);

export const Board = () => {
  const [squares, setSquares] = useState(EMPTY_BOARD);
  const [xIsNext, setXIsNext] = useState(true);

  const result = findWinner(squares);
  const isDraw = !result && squares.every(Boolean);
  const isOver = Boolean(result) || isDraw;

  const handleClick = (index) => {
    if (squares[index] || isOver) return;

    const next = squares.slice();
    next[index] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext(!xIsNext);
  };

  const handleReset = () => {
    setSquares(EMPTY_BOARD);
    setXIsNext(true);
  };

  let status;
  if (result) status = `Winner: ${result.winner}`;
  else if (isDraw) status = "It's a draw";
  else status = `Next: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="tic-tac-toe">
      <h2 className="ttt-title">Tic-Tac-Toe</h2>
      <p className="ttt-status" aria-live="polite">
        {status}
      </p>

      <div className="ttt-grid">
        {squares.map((value, index) => (
          <button
            key={index}
            type="button"
            className={
              result?.line.includes(index) ? 'square is-winning' : 'square'
            }
            onClick={() => handleClick(index)}
            disabled={isOver}
            aria-label={`Square ${index + 1}${value ? `: ${value}` : ', empty'}`}
          >
            {value}
          </button>
        ))}
      </div>

      <button id="reset" type="button" className="ttt-reset" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
};

export default Board;
