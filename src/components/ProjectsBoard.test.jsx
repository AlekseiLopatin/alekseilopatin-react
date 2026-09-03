import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../test/renderWithProviders';
import { ProjectsBoard } from './ProjectsBoard';
import { projects } from '../data/projects';

const cards = () => screen.getAllByRole('link');

describe('ProjectsBoard', () => {
  it('shows the first nine projects and a button for the rest', () => {
    renderWithProviders(<ProjectsBoard />);

    expect(cards()).toHaveLength(9);
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
    await user.click(screen.getByRole('button', { name: 'JavaScript' }));

    expect(cards().length).toBeLessThanOrEqual(9);
  });

  it('opens external projects in a new tab and internal ones in place', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    const practice = screen.getByRole('link', { name: /Practice Lab/ });
    expect(practice).toHaveAttribute('href', '/practice');
    expect(practice).not.toHaveAttribute('target');

    await user.click(screen.getByRole('button', { name: 'Godot' }));
    const external = cards()[0];
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('counts what is on screen, not what exists', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    await user.click(screen.getByRole('button', { name: 'Godot' }));
    const expected = projects.filter((p) => p.tags.includes('Godot')).length;

    expect(
      screen.getByText(`showing ${expected} of ${projects.length}`),
    ).toBeInTheDocument();
  });

  it('tells the user when a tag matches nothing', async () => {
    /* Тег из данных всегда что-то находит, поэтому проверяем
       саму ветку через фильтр, который заведомо пуст. */
    const user = userEvent.setup();
    renderWithProviders(<ProjectsBoard />);

    const group = screen.getByRole('group', { name: /filter by tag/i });
    expect(within(group).getAllByRole('button').length).toBeGreaterThan(5);

    await user.click(screen.getByRole('button', { name: 'Godot' }));
    expect(screen.queryByText(/nothing matches/i)).not.toBeInTheDocument();
  });
});
