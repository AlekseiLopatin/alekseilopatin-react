// Original templates informed by GoGet P5 chapters 1–12 and O-NET P6 2569.
// All diagrams are typed data rendered by React; no imported HTML or SVG.
export const curriculum = {
  'fraction-order': { title: 'Order fractions', chapter: 1, skill: 'Fraction comparison', onet: true },
  'fraction-mixed': { title: 'Multiply mixed numbers', chapter: 2, skill: 'Mixed-number multiplication' },
  'fraction-set': { title: 'Fraction of a set', chapter: 2, skill: 'Fractions of quantities' },
  'fraction-sharing': { title: 'Divide and share fractions', chapter: 3, skill: 'Fraction division in context' },
  'fraction-steps': { title: 'Fractions: several steps', chapter: 4, skill: 'Order of operations' },
  'decimal-rounding': { title: 'Round and estimate decimals', chapter: 5, skill: 'Decimal estimation' },
  'decimal-two-step': { title: 'Decimal shopping problems', chapter: 5, skill: 'Two-step decimals', onet: true },
  'percent-steps': { title: 'Successive percentages', chapter: 6, skill: 'Two-step percentages', onet: true },
  'measure-length': { title: 'Length and conversions', chapter: 7, skill: 'Length conversions', onet: true },
  'measure-mass': { title: 'Mass and conversions', chapter: 7, skill: 'Mass conversions', onet: true },
  'volume-tank': { title: 'Volume and capacity', chapter: 8, skill: 'Cuboid capacity', onet: true },
  'geometry-angles': { title: 'Lines and angles', chapter: 9, skill: 'Angles on a straight line' },
  'geometry-shapes': { title: 'Quadrilateral properties', chapter: 10, skill: 'Quadrilateral classification', onet: true },
  'geometry-prisms': { title: 'Prisms and their properties', chapter: 10, skill: 'Prism properties' },
  'area-parallelogram': { title: 'Area and perimeter', chapter: 11, skill: 'Parallelogram area', onet: true },
  'area-perimeter': { title: 'Perimeter word problems', chapter: 11, skill: 'Perimeter', onet: true },
  'graph-bars': { title: 'Read bar charts', chapter: 12, skill: 'Bar charts' },
  'graph-lines': { title: 'Read line graphs', chapter: 12, skill: 'Line graphs', onet: true },
  'onet-ratio': { title: 'Ratio and scale', skill: 'Ratio and scale', onet: true },
  'onet-pattern': { title: 'Number patterns', skill: 'Patterns', onet: true },
  'onet-time': { title: 'Time and timetables', skill: 'Elapsed time', onet: true },
  'onet-circle': { title: 'Circles: area and circumference', skill: 'Circle measurements', onet: true },
  'onet-polygon': { title: 'Triangles and polygons', skill: 'Polygon measurements', onet: true },
  'onet-composite': { title: 'Composite solid volumes', skill: 'Composite volume', onet: true },
  'onet-pie': { title: 'Read pie charts', skill: 'Pie charts', onet: true },
  'onet-whole': { title: 'Mixed whole-number operations', skill: 'Whole-number operations', onet: true },
};
export const topics = Object.fromEntries(Object.entries(curriculum).map(([id, m]) => [id, m.title]));
export const availableLevels = topic => topic === 'geometry-shapes' ? ['easy'] : ['easy', 'medium', 'hard', 'impossible'];
const gcd = (a, b) => b ? gcd(b, a % b) : a;
export function rational(n, d) { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; }
const money = cents => (cents / 100).toFixed(2);
export function createQuestion(topic, difficulty = 'easy', random = Math.random) {
  if (!curriculum[topic]) throw new Error('Unknown curriculum topic');
  const level = ['easy', 'medium', 'hard', 'impossible'].indexOf(difficulty);
  if (level < 0) throw new Error('Unknown difficulty');
  const int = (a, b) => a + Math.floor(random() * (b - a + 1));
  const advanced = level >= 2;
  const make = (prompt, answer, explanation, facts, diagram = null) => ({
    kind: 'practice', topic, prompt, answer: String(answer), explanation, facts, diagram,
    layout: 'text', skill: curriculum[topic].skill, template: `${topic}-${advanced ? 'extended' : 'foundation'}`,
    source: curriculum[topic].chapter ? `GoGet P5 chapter ${curriculum[topic].chapter}: original adaptation` : 'O-NET P6 2569 blueprint: original practice',
  });
  if (topic === 'fraction-order') {
    const d = int(3, 8), whole = advanced ? int(1, 3) : 0;
    const values = [`${whole * d + d - 1}/${d}`, `${whole * (d + 1) + d}/${d + 1}`, `${whole * (d + 2) + 1}/${d + 2}`];
    return make(`Put these fractions in increasing order: ${values[1]}, ${values[2]}, ${values[0]}.`, `${values[2]} < ${values[0]} < ${values[1]}`,
      `Each has the same whole part (${whole}). The fractional parts are 1/${d + 2}, 1 − 1/${d}, and 1 − 1/${d + 1}. Compare them, or use a common denominator.`, { d, whole });
  }
  if (topic === 'fraction-mixed') {
    const w = int(1, 4), v = int(1, 3), n = 3 * w + 2, m = 4 * v + 3, extra = level === 3 ? 5 : 0;
    return make(`Calculate ${w} 2/3 × ${v} 3/4${extra ? ' − 5/6' : ''}. Give a simplified fraction or mixed number.`, rational(n * m - extra * 2, 12),
      `Convert: ${w} 2/3 = ${n}/3 and ${v} 3/4 = ${m}/4. Multiply to get ${n * m}/12.${extra ? ' Then subtract 5/6 = 10/12.' : ''} Simplify: ${rational(n * m - extra * 2, 12)}.`, { n, m, extra });
  }
  if (topic === 'fraction-set') {
    const total=int(2,8)*24, first=total*3/4, second=first*2/3;
    return make(`A library has ${total} books. 3/4 are storybooks.${advanced ? ' Of the storybooks, 2/3 are in English. How many English storybooks are there?' : ' How many storybooks are there?'}`, advanced?second:first,
      `Storybooks: ${total} × 3/4 = ${first}.${advanced ? ` English storybooks: ${first} × 2/3 = ${second}. The second fraction refers to the storybooks.` : ''}`,{total,advanced});
  }
  if (topic === 'fraction-sharing') {
    const w = int(2, 7), n = 4 * w + 3, removed = advanced ? 2 : 0, size = level === 3 ? 3 : 1;
    const count = Math.floor((n - removed) / size);
    return make(`A ribbon is ${w} 3/4 m long.${removed ? ' Cut off 1/2 m first.' : ''} How many complete pieces of length ${size}/4 m can you cut?`, count,
      `Available ribbon: (${n} − ${removed})/4 m. Divide by ${size}/4: ${n - removed} ÷ ${size}. Count only complete pieces: ${count}.`, { n, removed, size });
  }
  if (topic === 'fraction-steps') {
    const w = int(2, 6), pieces = int(2, 5), n = (2 * w - 1) * pieces;
    return make(`Calculate (${w} − 1/2) × ${pieces}${advanced ? ' ÷ 3/4' : ''}.`, rational(n * (advanced ? 2 : 1), advanced ? 3 : 2),
      `Brackets first: ${w} − 1/2 = ${2 * w - 1}/2. Multiply by ${pieces}: ${n}/2.${advanced ? ` Divide by 3/4 by multiplying by 4/3: ${rational(n * 2, 3)}.` : ` Simplify: ${rational(n, 2)}.`}`, { w, pieces, advanced });
  }
  if (topic === 'decimal-rounding') {
    if (advanced) {
      const price=int(1101,4899),delivery=int(501,1999),count=level===3?int(2,5):1;
      const result=Math.round(price/100)*count+Math.round(delivery/100);
      return make(`Each item costs ${money(price)} baht. Delivery costs ${money(delivery)} baht. Round each price to the nearest whole baht, then estimate the total for ${count} ${count===1?'item':'items'} and one delivery.`,`${result} baht`,
        `Rounded item price: ${Math.round(price/100)} baht. Rounded delivery: ${Math.round(delivery/100)} baht. Estimate: ${Math.round(price/100)} × ${count} + ${Math.round(delivery/100)} = ${result} baht. This is an estimate, not the exact bill.`,{price,delivery,count,estimate:true});
    }
    const n = int(1101, 9899), divisor = advanced ? 100 : 10, rounded = Math.round(n / divisor) * divisor;
    return make(`Round ${money(n)} to the nearest ${advanced ? 'whole number' : 'tenth'}.`, rounded / 100,
      `Look at the ${advanced ? 'tenths' : 'hundredths'} digit. Round up when it is 5 or more; otherwise round down. Answer: ${rounded / 100}.`, { n, divisor });
  }
  if (topic === 'decimal-two-step') {
    const price = int(21, 89) * 25, count = int(2, 6), total = price * count, paid = Math.ceil(total / 10000) * 10000;
    return make(`${count} books cost ${money(price)} baht each. You pay ${money(paid)} baht. How much change do you receive?`, `${money(paid - total)} baht`,
      `Cost: ${count} × ${money(price)} = ${money(total)} baht. Change: ${money(paid)} − ${money(total)} = ${money(paid - total)} baht.`, { price, count, paid });
  }
  if (topic === 'percent-steps') {
    const total = int(2, 10) * 100, first = int(1, 4) * 10, second = int(1, 5) * 10, left = total * (100 - first) / 100, kept = left * second / 100;
    return make(`A farm harvests ${total} kg of rice. ${first}% is damaged. The farmer keeps ${second}% of the undamaged rice.${level === 3 ? ' How many kilograms can be sold?' : ' How many kilograms does the farmer keep?'}`, `${level === 3 ? left - kept : kept} kg`,
      `Undamaged: ${total} × ${100 - first}/100 = ${left} kg. Kept: ${left} × ${second}/100 = ${kept} kg.${level === 3 ? ` Sold: ${left} − ${kept} = ${left - kept} kg.` : ''} Apply the second percentage to the remainder.`, { total, first, second, sold: level === 3 });
  }
  if (topic === 'measure-length' || topic === 'measure-mass') {
    const major = int(2, 8), minor = int(1, 9) * 50, count = advanced ? int(2, 5) : 1, amount = major * 1000 + minor;
    const isMass = topic === 'measure-mass', small = isMass ? 'g' : 'm', big = isMass ? 'kg' : 'km';
    return make(`${isMass ? 'One bag weighs' : 'One lap is'} ${major} ${big} ${minor} ${small}. ${count === 1 ? `Express this in ${big}.` : `Find the total for ${count} ${isMass ? 'bags' : 'laps'}, in ${big}.`}`, `${amount * count / 1000} ${big}`,
      `Convert to ${small}: ${major} × 1000 + ${minor} = ${amount}. ${count > 1 ? `Multiply by ${count}: ${amount * count}. ` : ''}Divide by 1000: ${amount * count / 1000} ${big}.`, { amount, count });
  }
  if (topic === 'volume-tank' || topic === 'onet-composite') {
    const a = int(2, 6) * 10, b = int(2, 5) * 10, h = int(2, 5) * 10, gap = 10, composite = topic === 'onet-composite';
    const result = composite ? a * b * h + a * b * 10 : a * b * (advanced ? h - gap : h) / 1000;
    return make(composite ? `Two cuboids touch without overlapping. One measures ${a} × ${b} × ${h} cm; the other ${a} × ${b} × 10 cm. Find their total volume in cm³.` : `A tank has an internal base ${a} cm by ${b} cm and height ${h} cm.${advanced ? ` The water is ${gap} cm below the top.` : ''} Find ${advanced ? 'the volume of water' : 'its capacity'} in litres.`, `${result} ${composite ? 'cm³' : 'L'}`,
      composite ? `Add the separate volumes: ${a} × ${b} × ${h} + ${a} × ${b} × 10 = ${result} cm³.` : `Water height: ${advanced ? `${h} − ${gap} = ${h - gap}` : h} cm. Volume = length × width × height. Divide cm³ by 1000 to get ${result} L.`, { a, b, h, advanced, composite }, composite ? null : { type: 'cuboid', labels: [`${a} cm`, `${h} cm`, `${b} cm`] });
  }
  if (topic === 'geometry-angles') {
    const a = int(3, 12) * 10, b = advanced ? 20 : 0;
    return make(`Angles on a straight line are ${a}°${b ? `, ${b}°` : ''} and x°. Find x.`, `${180 - a - b}°`,
      `Angles on a straight line sum to 180°. x = 180 − ${a}${b ? ` − ${b}` : ''} = ${180 - a - b}°.`, { a, b }, { type: 'angles', values: [a, b] });
  }
  if (topic === 'geometry-shapes') {
    const choices=[['four equal sides and four right angles','Square'],['four right angles and unequal adjacent sides','Rectangle'],['four equal sides and no right angles','Rhombus'],['two pairs of parallel sides, unequal adjacent sides and no right angles','Parallelogram'],['exactly one pair of parallel sides','Trapezium'],['two pairs of equal adjacent sides, with different lengths for the two pairs','Kite']];
    const [description,answer]=choices[int(0,choices.length-1)];
    return make(`Name the most specific quadrilateral with ${description}.`,answer,`${answer}: ${description}. Use all the stated properties. Some shapes also belong to broader categories.`,{description});
  }
  if (topic === 'geometry-prisms') {
    const n = int(3, advanced ? 8 : 5), edges = advanced;
    return make(`A prism has two ${n}-sided bases. How many ${edges ? 'edges' : 'faces'} does it have?`, edges ? 3 * n : n + 2,
      edges ? `Each base has ${n} edges, with ${n} joining edges: 3 × ${n} = ${3 * n}.` : `There are 2 bases and ${n} side faces: ${n} + 2 = ${n + 2}.`, { n, edges });
  }
  if (topic === 'area-parallelogram') {
    const b = int(8, 20), h = int(3, 7), cut = advanced ? h * h : 0;
    return make(`A parallelogram has base ${b} cm and perpendicular height ${h} cm.${cut ? ` A square of side ${h} cm is removed.` : ''} Find ${cut ? 'the remaining' : 'its'} area.`, `${b * h - cut} cm²`,
      `Area = base × perpendicular height = ${b} × ${h} = ${b * h} cm².${cut ? ` Subtract the square: ${h} × ${h} = ${cut} cm². Remaining area: ${b * h - cut} cm².` : ' Do not use the sloping side as the height.'}`, { b, h, cut }, { type: 'parallelogram', labels: [`base ${b} cm`, `height ${h} cm`] });
  }
  if (topic === 'area-perimeter') {
    const a=int(8,20),b=int(3,7),gate=advanced?2:0;
    return make(`A rectangular garden is ${a} m long and ${b} m wide.${gate?' A 2 m gate needs no fencing.':''} How much fencing is needed?`,`${2*(a+b)-gate} m`,
      `Perimeter = 2 × (${a} + ${b}) = ${2*(a+b)} m.${gate?` Subtract the gate: ${2*(a+b)} − 2 = ${2*(a+b)-2} m.`:''}`,{a,b,gate});
  }
  if (topic === 'graph-bars' || topic === 'graph-lines') {
    const values = Array.from({ length: 4 }, () => int(2, 9) * 10), total = values.reduce((a, b) => a + b, 0);
    return make(`The chart shows books borrowed each week. ${advanced ? 'How many books were borrowed altogether?' : 'How many books were borrowed in Week 3?'}`, advanced ? total : values[2],
      advanced ? `Add the four readings: ${values.join(' + ')} = ${total} books.` : `Read Week 3 against the vertical scale: ${values[2]} books.`, { values, advanced }, { type: topic === 'graph-bars' ? 'bars' : 'line', values, labels: ['W1', 'W2', 'W3', 'W4'] });
  }
  if (topic === 'onet-ratio') {
    const a = int(2, 4), b = a + 1, unit = int(3, 9);
    return advanced ? make(`Red : blue beads = ${a} : ${b}. There are ${(a + b) * unit} beads altogether. How many are blue?`, b * unit,
      `Total parts: ${a} + ${b} = ${a + b}. One part: ${(a + b) * unit} ÷ ${a + b} = ${unit}. Blue beads: ${b} × ${unit} = ${b * unit}.`, { a, b, unit, mode: 'ratio' }) : make(`On a map, 1 cm represents ${unit} km. Two towns are ${a} cm apart on the map. What is their real distance?`, `${a * unit} km`, `Multiply the map length by the scale: ${a} × ${unit} = ${a * unit} km.`, { a, unit, mode: 'scale' });
  }
  if (topic === 'onet-pattern') {
    const start = int(2, 15), step = int(2, 9), index = advanced ? int(10, 20) : 5;
    return make(`The pattern starts ${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, … and increases by the same amount. Find term ${index}.`, start + (index - 1) * step,
      `Add ${step} each time. Term ${index} = ${start} + (${index} − 1) × ${step} = ${start + (index - 1) * step}.`, { start, step, index });
  }
  if (topic === 'onet-time') {
    const start = int(8, 13) * 60 + int(1, 5) * 10, duration = int(5, 12) * 15, pause = advanced ? 25 : 0;
    const clock = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
    return make(`A bus leaves at ${clock(start)}. Driving takes ${duration} minutes${pause ? `, plus a ${pause}-minute stop` : ''}. At what time does it arrive?`, clock(start + duration + pause),
      `Total elapsed time: ${duration} + ${pause} = ${duration + pause} minutes. Add this to ${clock(start)}, carrying every 60 minutes into an hour: ${clock(start + duration + pause)}.`, { start, duration, pause });
  }
  if (topic === 'onet-circle') {
    const radius = int(1, 4) * 7, area = advanced, result = area ? 22 * radius * radius / 7 : 44 * radius / 7;
    return make(`A circle has ${area ? `diameter ${radius * 2}` : `radius ${radius}`} cm. Find its ${area ? 'area' : 'circumference'}. Use π = 22/7.`, `${result} ${area ? 'cm²' : 'cm'}`,
      `Radius = ${radius} cm. ${area ? `Area = πr² = 22/7 × ${radius} × ${radius}` : `Circumference = 2πr = 2 × 22/7 × ${radius}`} = ${result}.`, { radius, area }, { type: 'circle', labels: [`${area ? 'Diameter' : 'Radius'} = ${area ? radius * 2 : radius} cm`] });
  }
  if (topic === 'onet-polygon') {
    const base = int(4, 10) * 2, height = int(3, 9);
    return make(`A triangle has base ${base} cm and perpendicular height ${height} cm.${advanced ? ` A rectangle of dimensions ${base} × ${height} cm has a larger area. How much larger?` : ' Find the triangle’s area.'}`, `${base * height / 2} cm²`,
      `Triangle area: 1/2 × ${base} × ${height} = ${base * height / 2} cm².${advanced ? ` Rectangle area: ${base * height} cm². Difference: ${base * height / 2} cm².` : ''}`, { base, height, advanced }, { type: 'triangle', labels: [`base ${base} cm`, `height ${height} cm`] });
  }
  if (topic === 'onet-pie') {
    const percent = int(1, 3) * 25, total = int(2, 10) * 20, part = total * percent / 100;
    return make(`The pie chart represents ${total} students. The shaded sector represents students who cycle. How many ${advanced ? 'do not cycle' : 'cycle'}?`, advanced ? total - part : part,
      `Cyclists: ${total} × ${percent}/100 = ${part}.${advanced ? ` Others: ${total} − ${part} = ${total - part}.` : ''}`, { total, percent, advanced }, { type: 'pie', values: [percent, 100 - percent], labels: ['Cycle', 'Other'] });
  }
  const count = int(2, 5), a = int(11, 30) * count * 10000, b = int(2, 9) * count * 1000;
  return make(`Calculate (${a} − ${b}) ÷ ${count}.`, (a - b) / count,
    `Brackets first: ${a} − ${b} = ${a - b}. Then divide by ${count}: ${(a - b) / count}.`, { a, b, count });
}

// Numeric options are distinct exact decimal values, with one correct answer.
export function withChoices(q, random = Math.random) {
  const match = String(q.answer).match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match || match[2].startsWith('/') || match[2].startsWith(':')) return q;
  const value = Number(match[1]), unit = match[2], step = Number.isInteger(value) ? Math.max(1, Math.round(Math.abs(value) / 10)) : 0.1;
  if (!Number.isFinite(value) || Number(value.toFixed(4)) !== value) return q;
  const offsets = random() < .5 ? [-1, 1, 2] : [-2, -1, 1];
  const used = new Set([value]);
  const distractors = offsets.map((offset, i) => {
    let candidate = Number((value + offset * step).toFixed(4));
    if (candidate < 0 || used.has(candidate)) candidate = Number((value + (i + 3) * step).toFixed(4));
    used.add(candidate); return candidate;
  });
  const values = [value, ...distractors].map(n => `${n}${unit}`);
  for (let i = 3; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]; }
  return { ...q, options: values, correctOption: values.indexOf(`${value}${unit}`) };
}
