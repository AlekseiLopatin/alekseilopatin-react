export default function ShapeDiagram({ shape, label }) {
  const outlines = {
    rectangle: '60,55 260,55 260,175 60,175', square: '100,45 240,45 240,185 100,185',
    triangle: '60,175 140,45 280,175', parallelogram: '55,175 100,55 280,55 235,175', trapezoid: '50,175 100,55 220,55 280,175',
  };
  const height = ['triangle', 'parallelogram', 'trapezoid'].includes(shape);
  return (
    <svg className="area-diagram" viewBox="0 0 340 230" role="img" aria-label={label}>
      <g className="area-outline">
        {shape === 'circle' ? <circle cx="170" cy="115" r="78" /> : shape === 'ellipse' ? <ellipse cx="170" cy="115" rx="120" ry="65" /> : <polygon points={outlines[shape]} />}
      </g>
      {shape === 'circle' && <><path className="area-guide" d="M170 115 H248" /><circle cx="170" cy="115" r="3" fill="currentColor" /><text x="205" y="105">r</text></>}
      {shape === 'ellipse' && <><path className="area-guide" d="M170 50 V115 H290" /><text x="225" y="105">a</text><text x="152" y="85">b</text><path className="area-angle" d="M170 105 H180 V115" /></>}
      {shape === 'rectangle' && <><text x="155" y="200">w</text><text x="275" y="120">h</text></>}
      {shape === 'square' && <text x="165" y="210">a</text>}
      {height && <><path className="area-guide" d={`M140 ${shape === 'triangle' ? 45 : 55} V175`} /><path className="area-angle" d="M140 163 H152 V175" /><text x="120" y="120">h</text><text x="165" y="202">b</text></>}
      {shape === 'trapezoid' && <text x="155" y="40">a</text>}
    </svg>
  );
}
