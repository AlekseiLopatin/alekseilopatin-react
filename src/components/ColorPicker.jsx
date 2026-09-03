import { useState } from 'react';
import './ColorPicker.css';

/* Тесты задания требуют ровно эти id:
   #color-picker-container (белый фон изначально) и #color-input
   внутри него. Всё остальное — оформление на свой вкус. */
export const ColorPicker = () => {
  const [color, setColor] = useState('#ffffff');

  return (
    <div
      id="color-picker-container"
      className="color-picker"
      style={{ backgroundColor: color }}
    >
      <h2 className="color-picker-title">Pick a colour</h2>

      {/* Инпут — прямой ребёнок контейнера: обёртка вокруг него
          делала его лишь потомком, и тест это ловит. Связь с
          подписью держим через htmlFor, а не вложенностью. */}
      <label className="visually-hidden" htmlFor="color-input">
        Colour
      </label>
      <input
        id="color-input"
        type="color"
        value={color}
        onChange={(event) => setColor(event.target.value)}
      />

      <output className="color-picker-value">{color.toUpperCase()}</output>
    </div>
  );
};

export default ColorPicker;
