import { it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, renderWithProviders, fireEvent } from '../test/renderWithProviders';
import MathFlashcardsPage from './MathFlashcardsPage';
import { STORAGE_KEY } from '../components/math-flashcards/model';

it('creates, edits and persists a card and guards deletion', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MathFlashcardsPage />);
  await user.type(screen.getByLabelText('New deck name'), 'Grade 5');
  await user.click(screen.getByRole('button', { name: '+ Create deck' }));
  await user.type(screen.getByLabelText('Question'), '3 + 4');
  await user.type(screen.getByLabelText('Answer'), '7');
  await user.click(screen.getByRole('button', { name: 'Save card' }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).decks.at(-1).cards[0].answer).toBe('7');
  await user.click(screen.getByRole('button', { name: 'Edit', exact: true }));
  await user.type(screen.getByLabelText('Explanation (optional)'), '3 + 3 + 1');
  await user.click(screen.getByRole('button', { name: 'Save card' }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).decks.at(-1).cards).toHaveLength(1);
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  await user.click(screen.getByRole('button', { name: 'Delete deck' }));
  expect(screen.getByRole('heading', { name: 'Grade 5' })).toBeInTheDocument();
  confirm.mockReturnValue(true);
  await user.click(screen.getByRole('button', { name: 'Delete deck' }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).decks.some(d => d.title === 'Grade 5')).toBe(false);
  confirm.mockRestore();
});

it('does not expose answers until requested and resets on keyboard navigation', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MathFlashcardsPage />);
  await user.click(screen.getByRole('button', { name: 'Start lesson →' }));
  expect(screen.queryByText('56')).not.toBeInTheDocument();
  fireEvent.keyDown(window, { code: 'Space', key: ' ' });
  expect(screen.getByText('56')).toBeInTheDocument();
  expect(screen.queryByText('8 × 5 + 8 × 2 = 40 + 16 = 56')).not.toBeInTheDocument();
  fireEvent.keyDown(window, { code: 'Space', key: ' ' });
  expect(screen.getByText('8 × 5 + 8 × 2 = 40 + 16 = 56')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  expect(screen.getByRole('heading', { name: '12 × 6' })).toBeInTheDocument();
  expect(screen.queryByText('72', { exact: true })).not.toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.getByRole('heading', { name: 'Math Flashcards' })).toBeInTheDocument();
});

it('previews spreadsheet rows and blocks invalid rows before adding anything', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MathFlashcardsPage />);
  await user.click(screen.getByText('Paste from spreadsheet'));
  fireEvent.change(screen.getByLabelText('Spreadsheet rows'), { target: { value: 'Q\tA\nBad' } });
  await user.click(screen.getByRole('button', { name: 'Preview', exact: true }));
  expect(screen.getByRole('button', { name: 'Add cards' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Spreadsheet rows'), { target: { value: 'Q\tA\tExplanation' } });
  await user.click(screen.getByRole('button', { name: 'Preview', exact: true }));
  await user.click(screen.getByRole('button', { name: 'Add cards' }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).decks[0].cards.at(-1).question).toBe('Q');
});
