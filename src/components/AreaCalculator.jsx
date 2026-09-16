import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { shapes, measureArea } from '../data/shapes';
import ShapeDiagram from './ShapeDiagram';
import './AreaCalculator.css';

const copy = {
  en: { choose: 'Choose a shape', dimensions: 'Dimensions', formula: 'Formula', result: 'Area', units: 'square units', hint: 'Enter every dimension to calculate the area.', error: 'Enter a finite number greater than zero.', range: 'These dimensions are outside the supported numeric range.', scale: 'Diagram is schematic, not to scale.', same: 'Use the same unit for every length. Results are rounded to 2 decimal places; very small or large values use scientific notation.', height: 'h is the perpendicular height, not the sloping side.', ellipse: 'a and b are the semi-axes: half the full width and height.', circle: 'r is the radius: half the diameter.', basic: 'S is the area. Letters on the diagram match the dimensions below.', bases: 'a and b are the two parallel bases.', r: 'Radius', w: 'Width', h: 'Height', a: 'Side', b: 'Base', semiA: 'Horizontal semi-axis', semiB: 'Vertical semi-axis', baseA: 'First base', baseB: 'Second base' },
  ru: { choose: 'Выбери фигуру', dimensions: 'Размеры', formula: 'Формула', result: 'Площадь', units: 'кв. единиц', hint: 'Введи все размеры, чтобы рассчитать площадь.', error: 'Введи конечное число больше нуля.', range: 'Эти размеры выходят за поддерживаемый числовой диапазон.', scale: 'Схема условная, без соблюдения масштаба.', same: 'Используй одну единицу для всех длин. Результат округлён до 2 знаков после запятой; очень малые и большие значения — в научной записи.', height: 'h — перпендикулярная высота, а не наклонная сторона.', ellipse: 'a и b — полуоси: половины полной ширины и высоты.', circle: 'r — радиус: половина диаметра.', basic: 'S — площадь. Буквы на схеме соответствуют размерам ниже.', bases: 'a и b — два параллельных основания.', r: 'Радиус', w: 'Ширина', h: 'Высота', a: 'Сторона', b: 'Основание', semiA: 'Горизонтальная полуось', semiB: 'Вертикальная полуось', baseA: 'Первое основание', baseB: 'Второе основание' },
};

export default function AreaCalculator() {
  const { lang } = useLanguage();
  const text = copy[lang];
  const [shapeId, setShapeId] = useState('circle');
  const [drafts, setDrafts] = useState({});
  const shape = shapes.find(item => item.id === shapeId);
  const values = drafts[shapeId] ?? {};
  const { area, errors, outOfRange } = measureArea(shape, values);
  const format = number => new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 2, notation: number !== 0 && (Math.abs(number) < 0.01 || Math.abs(number) >= 1e12) ? 'scientific' : 'standard' }).format(number);
  const fieldName = key => shapeId === 'ellipse' ? text[key === 'a' ? 'semiA' : 'semiB'] : shapeId === 'trapezoid' && key !== 'h' ? text[key === 'a' ? 'baseA' : 'baseB'] : text[key];
  const explanation = shapeId === 'circle' ? text.circle : shapeId === 'ellipse' ? text.ellipse : ['triangle', 'parallelogram', 'trapezoid'].includes(shapeId) ? `${shapeId === 'trapezoid' ? text.bases + ' ' : ''}${text.height}` : text.basic;
  return (
    <div className="area-calculator">
      <div className="area-controls">
        <label className="area-label" htmlFor="area-shape">{text.choose}</label>
        <select id="area-shape" value={shapeId} onChange={event => setShapeId(event.target.value)}>
          {shapes.map(item => <option key={item.id} value={item.id}>{item.name[lang]}</option>)}
        </select>
        <fieldset>
          <legend>{text.dimensions}</legend>
          {shape.fields.map(key => (
            <div className="area-field" key={`${shapeId}-${key}`}>
              <label htmlFor={`area-${key}`}>{fieldName(key)} <span>({key})</span></label>
              <input id={`area-${key}`} type="number" step="any" min="0" value={values[key] ?? ''} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `area-error-${key}` : 'area-units'} onChange={event => setDrafts(previous => ({ ...previous, [shapeId]: { ...previous[shapeId], [key]: event.target.value } }))} />
              {errors[key] && <p className="area-error" id={`area-error-${key}`}>{text.error}</p>}
            </div>
          ))}
        </fieldset>
        <p id="area-units" className="area-note">{text.same}</p>
      </div>
      <div className="area-visual">
        <h2>{shape.name[lang]}</h2>
        <figure>
          <ShapeDiagram shape={shapeId} label={`${shape.name[lang]}. ${explanation}`} />
          <figcaption className="area-note">{text.scale}</figcaption>
        </figure>
        <p className="area-explanation">{explanation}</p>
        <div className="area-formula">
          <h3>{text.formula}</h3>
          <p>{shape.formula}</p>
        </div>
        <div className="area-result" role="status" aria-live="polite" aria-atomic="true">
          <h3>{text.result}</h3>
          {area === null ? <p className={outOfRange ? 'area-error' : 'area-note'}>{outOfRange ? text.range : text.hint}</p> : <>
            <p className="area-substitution">S = {shape.expression(Object.fromEntries(shape.fields.map(key => [key, values[key]])))}</p>
            <p className="area-answer">≈ <output>{format(area)}</output> <span>{text.units}</span></p>
          </>}
        </div>
      </div>
    </div>
  );
}
