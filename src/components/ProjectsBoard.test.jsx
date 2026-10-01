import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import { ProjectsBoard } from './ProjectsBoard';
import { projects } from '../data/projects';

const cards = () => screen.getAllByRole('article');
const openFilters = async (user) => user.click(screen.getByText(/filter projects/i));

describe('ProjectsBoard', () => {
  it('shows the first nine projects and a button for the rest', () => {
    renderWithProviders(<ProjectsBoard />);

    expect(cards()).toHaveLength(9);
    expect(cards().map(card => within(card).getByRole('heading').textContent.replace(/^<|\/>$/g, ''))).toEqual([
      'School Portal', 'Mini-Gradebook · Frontend', 'Mini-Gradebook · API',
      'Thai Buddy', 'MacroKin', 'Math Flashcards', 'Currency Converter', 'Bookshelf', 'D&D Critical Hit Bot',
    ]);
    expect(
      screen.getByRole('button', { name: /show \d+ more/i }),
    ).toBeInTheDocument();
  });

  it('reveals every project when the button is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    await user.click(screen.getByRole('button', { name: /show \d+ more/i }));

    expect(cards()).toHaveLength(projects.length);
    expect(
      screen.getByRole('button', { name: /show less/i }),
    ).toBeInTheDocument();
  });

  it('narrows the list to projects carrying the chosen tag', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: 'Godot' }));

    const expected = projects.filter((p) => p.tags.includes('Godot'));
    expect(cards()).toHaveLength(expected.length);
    expect(screen.getByText(/Protect Your Friend/)).toBeInTheDocument();
    expect(screen.queryByText(/Thai Buddy/)).not.toBeInTheDocument();
  });

  it('collapses back to the first page after switching tag', async () => {
    /* Иначе после "показать ещё" новый фильтр открывался бы
       сразу развёрнутым, что выглядит как сломанная кнопка. */
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    await user.click(screen.getByRole('button', { name: /show \d+ more/i }));
    await openFilters(user);
    await user.click(screen.getByRole('button', { name: 'JavaScript' }));

    expect(cards().length).toBeLessThanOrEqual(9);
  });

  it('opens external projects in a new tab and internal ones in place', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    // Internal tools keep router links; external destinations open safely.
    const internal = screen.getByRole('link', { name: /Currency Converter/ });
    expect(internal).toHaveAttribute('href', '/currency');
    expect(internal).not.toHaveAttribute('target');

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: 'Godot' }));
    const external = within(cards()[0]).getByRole('link');
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('counts what is on screen, not what exists', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    await openFilters(user);
    await user.click(screen.getByRole('button', { name: 'Godot' }));
    const expected = projects.filter((p) => p.tags.includes('Godot')).length;

    expect(
      screen.getByText(`showing ${expected} of ${projects.length}`),
    ).toBeInTheDocument();
  });

  it('keeps all tag filters available in the disclosure', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    await openFilters(user);
    const group = screen.getByRole('group', { name: /filter by tag/i });
    expect(within(group).getAllByRole('button').length).toBeGreaterThan(5);

    await user.click(screen.getByRole('button', { name: 'Godot' }));
    expect(screen.queryByText(/nothing matches/i)).not.toBeInTheDocument();
  });

  it('offers distinct keyboard-accessible live and source actions without nested links', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<ProjectsBoard />);
    const live = screen.getByRole('link', { name: 'Live: School Portal' });
    const source = screen.getByRole('link', { name: 'GitHub: School Portal' });
    expect(live).toHaveAttribute('href', 'https://school.alekseilopatin.com');
    expect(source).toHaveAttribute('href', 'https://github.com/AlekseiLopatin/school-website');
    expect(container.querySelector('a a')).toBeNull();
    live.focus();
    await user.tab();
    expect(source).toHaveFocus();
    expect(screen.queryByRole('link', { name: 'Live: Mini-Gradebook · API' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub: Mini-Gradebook · API' })).toHaveAttribute('href', 'https://github.com/AlekseiLopatin/school-portal-api');
  });

  it('localizes card actions and descriptions in Russian', () => {
    localStorage.setItem('al-lang', 'ru');
    renderWithProviders(<ProjectsBoard />);
    expect(screen.getByRole('link', { name: 'Сайт: School Portal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Открыть: Currency Converter' })).toBeInTheDocument();
    expect(screen.getByText(/Школьная платформа на Next.js/)).toBeVisible();
  });
});
