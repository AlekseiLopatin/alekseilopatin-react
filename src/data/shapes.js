export const shapes = [
  { id: 'circle', name: { en: 'Circle', ru: 'Круг' }, fields: ['r'], formula: 'S = πr²', expression: v => `π × ${v.r}²`, area: v => Math.PI * v.r * v.r },
  { id: 'rectangle', name: { en: 'Rectangle', ru: 'Прямоугольник' }, fields: ['w', 'h'], formula: 'S = wh', expression: v => `${v.w} × ${v.h}`, area: v => v.w * v.h },
  { id: 'triangle', name: { en: 'Triangle', ru: 'Треугольник' }, fields: ['b', 'h'], formula: 'S = bh / 2', expression: v => `${v.b} × ${v.h} / 2`, area: v => v.b * v.h / 2 },
  { id: 'square', name: { en: 'Square', ru: 'Квадрат' }, fields: ['a'], formula: 'S = a²', expression: v => `${v.a}²`, area: v => v.a * v.a },
  { id: 'parallelogram', name: { en: 'Parallelogram', ru: 'Параллелограмм' }, fields: ['b', 'h'], formula: 'S = bh', expression: v => `${v.b} × ${v.h}`, area: v => v.b * v.h },
  { id: 'trapezoid', name: { en: 'Trapezoid', ru: 'Трапеция' }, fields: ['a', 'b', 'h'], formula: 'S = (a + b)h / 2', expression: v => `(${v.a} + ${v.b}) × ${v.h} / 2`, area: v => (v.a / 2 + v.b / 2) * v.h },
  { id: 'ellipse', name: { en: 'Ellipse', ru: 'Эллипс' }, fields: ['a', 'b'], formula: 'S = πab', expression: v => `π × ${v.a} × ${v.b}`, area: v => Math.PI * v.a * v.b },
];

export function measureArea(shape, values) {
  const errors = {};
  const numbers = {};
  for (const key of shape.fields) {
    const raw = values[key] ?? '';
    if (raw === '') continue;
    const number = Number(raw);
    if (!Number.isFinite(number) || number <= 0) errors[key] = true;
    else numbers[key] = number;
  }
  if (Object.keys(errors).length || Object.keys(numbers).length !== shape.fields.length) return { errors, area: null };
  const area = shape.area(numbers);
  return { errors, area: Number.isFinite(area) && area > 0 ? area : null, outOfRange: !Number.isFinite(area) || area === 0 };
}
