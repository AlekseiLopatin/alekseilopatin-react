export default function Diagram({ diagram: d }) {
  if (!d) return null;
  const common = { viewBox: '0 0 480 230', className: 'mb-diagram', role: 'img', 'aria-label': `${d.type} diagram: ${(d.labels || []).join(', ')}. ${(d.values || []).join(', ')}` };
  const outline = { fill: 'none', stroke: 'currentColor', strokeWidth: 3 };
  if (d.type === 'bars' || d.type === 'line') {
    const points = d.values.map((v, i) => `${90 + i * 100},${190 - v * 1.6}`).join(' ');
    return <svg {...common}>{[0, 20, 40, 60, 80, 100].map(v => <g key={v}><line x1="55" x2="450" y1={190-v*1.6} y2={190-v*1.6} stroke="currentColor" opacity=".2" /><text x="10" y={196-v*1.6}>{v}</text></g>)}{d.type === 'line' && <polyline points={points} {...outline} />}{d.values.map((v, i) => <g key={i}>{d.type === 'bars' ? <rect x={70+i*100} y={190-v*1.6} width="40" height={v*1.6} fill="var(--color-accent)" /> : <circle cx={90+i*100} cy={190-v*1.6} r="5" fill="var(--color-accent)" />}<text x={75+i*100} y="220">{d.labels[i]}</text></g>)}</svg>;
  }
  if (d.type === 'pie') {
    const p = d.values[0], angle = p / 100 * 2 * Math.PI, x = 230 + 85 * Math.sin(angle), y = 110 - 85 * Math.cos(angle);
    return <svg {...common}><circle cx="230" cy="110" r="85" {...outline} /><path d={`M230 110 L230 25 A85 85 0 ${p > 50 ? 1 : 0} 1 ${x} ${y} Z`} fill="var(--color-accent)" /><text x="340" y="100">Cycle: {p}%</text><text x="340" y="130">Other: {100-p}%</text></svg>;
  }
  if (d.type === 'angles') {
    const [a, b] = d.values, ray = deg => [240 + 130*Math.cos(deg*Math.PI/180), 185 - 130*Math.sin(deg*Math.PI/180)];
    const first = ray(a), second = ray(a+b);
    return <svg {...common}><path d="M40 185 H440" {...outline} /><path d={`M240 185 L${first[0]} ${first[1]}`} {...outline} />{b > 0 && <path d={`M240 185 L${second[0]} ${second[1]}`} {...outline} />}<text x="320" y="170">{a}°</text>{b > 0 && <text x="220" y="90">{b}°</text>}<text x="150" y="170">x°</text></svg>;
  }
  return <svg {...common}>
    {d.type === 'circle' ? <><circle cx="230" cy="105" r="80" {...outline} /><path d={d.labels[0].startsWith('Diameter') ? 'M150 105 H310' : 'M230 105 H310'} {...outline}/></> : d.type === 'cuboid' ? <path d="M100 80 H300 V175 H100 Z M100 80 L160 35 H360 V130 L300 175 M300 80 L360 35 M160 35 V130 H360 M100 175 L160 130" {...outline}/> : <><path d={d.type === 'triangle' ? 'M90 170 L220 40 L390 170 Z' : 'M80 170 L150 40 H390 L320 170 Z'} {...outline}/><path d={d.type === 'triangle' ? 'M220 40 V170' : 'M150 40 V170'} {...outline} strokeDasharray="6 5"/></>}
    {(d.labels || []).map((label, i) => <text key={i} x={i === 1 ? 15 : 150} y={i === 1 ? 110 : i === 2 ? 20 : 215}>{label}</text>)}
    <text x="320" y="225" fontSize="12">Not to scale</text>
  </svg>;
}
