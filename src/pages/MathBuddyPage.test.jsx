import { beforeEach, expect, it } from 'vitest';
import { fireEvent, renderWithProviders, screen, within } from '../test/renderWithProviders';
import MathBuddyPage from './MathBuddyPage';
import engine from '../components/math-buddy/engine';
import { KEY } from '../components/math-buddy/storage';

beforeEach(() => { HTMLDialogElement.prototype.showModal = function () { this.open = true; }; });
const saved = () => JSON.parse(localStorage.getItem(KEY));
it('marks attempts, awards leader XP once and undoes a level up', () => {
  const state = engine.createState(); state.classes[0].students[0].xp = 90;
  localStorage.setItem(KEY, JSON.stringify(state)); renderWithProviders(<MathBuddyPage />);
  fireEvent.change(screen.getByLabelText('Class leader'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: /^Student 02: Correct/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Show answer' }));
  fireEvent.click(screen.getByRole('button', { name: 'Award XP' }));
  expect(saved().classes[0].students[0].xp).toBe(110);
  expect(saved().classes[0].students[1].xp).toBe(3);
  expect(screen.getByText('Round glasses')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Keep going' }));
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(saved().classes[0].students[0].xp).toBe(90);
  expect(saved().classes[0].students[0].turns).toBe(0);
});
it('customizes a hero without changing XP and supports cancel', () => {
  renderWithProviders(<MathBuddyPage />); fireEvent.click(screen.getByRole('button', { name: 'Teacher', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Customize Student 01' }));
  fireEvent.change(screen.getByLabelText('Character'), { target: { value: '5' } });
  expect(screen.getByRole('option', { name: /Round glasses/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Save hero' }));
  expect(saved().classes[0].students[0].appearance.character).toBe(5);
  expect(saved().classes[0].students[0].xp).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Customize Student 01' }));
  fireEvent.change(screen.getByLabelText('Character'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
  expect(saved().classes[0].students[0].appearance.character).toBe(5);
});
it('reuses site themes, shows the guide and cleans up fullscreen layout on unmount', () => {
  const view = renderWithProviders(<MathBuddyPage />);
  fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'twilight' } });
  expect(localStorage.getItem('al-theme')).toBe('twilight');
  fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
  expect(screen.getByText(/Progress lives in this browser/)).toBeInTheDocument();
  view.unmount(); expect(document.documentElement).not.toHaveClass('mb-active');
});
it('keeps absent and excluded students out of bulk marks', () => {
  renderWithProviders(<MathBuddyPage />); fireEvent.click(screen.getByRole('button', { name: 'Teacher', exact: true }));
  fireEvent.click(screen.getAllByLabelText('Present')[0]);
  fireEvent.click(screen.getAllByLabelText('No XP')[1]);
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  fireEvent.click(screen.getByRole('button', { name: 'Deselect all' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
  expect(saved().classes[0].round.statuses.slice(0, 3)).toEqual(['absent', 'none', 'correct']);
});
it('preserves unreadable data and still offers export', () => {
  localStorage.setItem(KEY, '{broken'); renderWithProviders(<MathBuddyPage />);
  fireEvent.click(screen.getByRole('button', { name: /^Student 01: Correct/ }));
  expect(localStorage.getItem(KEY)).toBe('{broken');
  fireEvent.click(screen.getByRole('button', { name: 'Teacher', exact: true }));
  expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Export progress' })).toBeInTheDocument();
});
