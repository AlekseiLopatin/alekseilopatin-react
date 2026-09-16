import { describe, expect, it } from 'vitest';
import { fireEvent, screen, renderWithProviders } from '../test/renderWithProviders';
import AreaCalculator from './AreaCalculator';
import { shapes, measureArea } from '../data/shapes';

describe('area calculator', () => {
  it.each([
    ['circle', { r: '3' }, 28.274333882308138],
    ['rectangle', { w: '2.5', h: '4' }, 10],
    ['triangle', { b: '8', h: '3' }, 12],
    ['square', { a: '3.5' }, 12.25],
    ['parallelogram', { b: '8', h: '3' }, 24],
    ['trapezoid', { a: '4', b: '10', h: '3' }, 21],
    ['ellipse', { a: '4', b: '2' }, 25.132741228718345],
  ])('calculates %s and displays its formula and substitution', (id, values, expected) => {
    const shape = shapes.find(item => item.id === id);
    expect(measureArea(shape, values).area).toBeCloseTo(expected, 10);
    renderWithProviders(<AreaCalculator />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: id } });
    expect(screen.getByText(shape.formula)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName();
    for (const [key, value] of Object.entries(values)) fireEvent.change(document.getElementById(`area-${key}`), { target: { value } });
    expect(screen.getByText(`S = ${shape.expression(values)}`)).toBeInTheDocument();
    expect(document.querySelector('output').textContent).toBe(new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(expected));
  });

  it('keeps valid fields and per-shape drafts while rejecting zero and negative values', () => {
    renderWithProviders(<AreaCalculator />);
    expect(document.querySelector('output')).toBeNull();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'rectangle' } });
    const width = screen.getByLabelText('Width (w)');
    fireEvent.change(width, { target: { value: '5' } });
    const height = screen.getByLabelText('Height (h)');
    for (const value of ['-2', '0']) {
      fireEvent.change(height, { target: { value } });
      expect(height).toHaveAttribute('aria-invalid', 'true');
      expect(width).toHaveValue(5);
      expect(document.querySelector('output')).toBeNull();
    }
    fireEvent.change(height, { target: { value: '3' } });
    expect(document.querySelector('output')).toHaveTextContent('15');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'circle' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'rectangle' } });
    expect(screen.getByLabelText('Width (w)')).toHaveValue(5);
    expect(document.querySelector('output')).toHaveTextContent('15');
  });

  it('handles nonfinite inputs, overflow and underflow without showing a false result', () => {
    const square = shapes.find(shape => shape.id === 'square');
    expect(measureArea(square, { a: 'Infinity' }).errors.a).toBe(true);
    expect(measureArea(square, { a: 'NaN' }).area).toBeNull();
    expect(measureArea(square, { a: '1e200' }).outOfRange).toBe(true);
    expect(measureArea(square, { a: '1e-200' }).outOfRange).toBe(true);
  });

  it('uses scientific notation instead of rounding a tiny area to zero', () => {
    renderWithProviders(<AreaCalculator />);
    fireEvent.change(screen.getByLabelText('Radius (r)'), { target: { value: '0.001' } });
    expect(document.querySelector('output').textContent).toContain('E-6');
  });
});
