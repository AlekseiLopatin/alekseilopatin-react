
  'use strict';
  const topics = {
    'decimal-compare': 'Compare decimals', 'decimal-add': 'Add decimals',
    'decimal-sub': 'Subtract decimals', 'decimal-mul': 'Multiply decimals',
    'decimal-div': 'Divide decimals', 'decimal-convert': 'Fractions → decimals',
    'decimal-story': 'Decimals in everyday life', 'percent-of': 'Percentage of a number',
    'percent-convert': 'Fractions, decimals & percentages', 'percent-discount': 'Discounts & sale prices',
    'percent-story': 'Percentage word problems', 'decimal-reason': 'Decimal number puzzles'
  };
  const levels = ['easy', 'medium', 'hard', 'impossible'];
  // Decimal strings are formed directly from integers, without floating-point rounding.
  function decimal(n, places = 0) {
    if (!Number.isSafeInteger(n) || !Number.isInteger(places) || places < 0) throw new Error('Invalid decimal');
    const sign = n < 0 ? '−' : '', digits = String(Math.abs(n)).padStart(places + 1, '0');
    return sign + (places ? `${digits.slice(0, -places)}.${digits.slice(-places)}`.replace(/\.?0+$/, '') : digits);
  }
  function createQuestion(topic, difficulty = 'easy', random = Math.random) {
    if (!Object.hasOwn(topics, topic) || !levels.includes(difficulty)) throw new Error('Unknown practice setting');
    const level = levels.indexOf(difficulty), int = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
    const pick = values => values[int(0, values.length - 1)];
    const places = level === 0 ? 1 : 2, scale = 10 ** places;
    const q = (prompt, answer, explanation, facts = {}, layout = 'text') => ({kind: 'practice', topic, prompt, answer: String(answer), explanation, facts, layout});
    if (topic === 'decimal-add' || topic === 'decimal-sub') {
      let a = int(1, 9 * scale), b = int(1, 9 * scale);
      if (topic === 'decimal-sub' && a < b) [a,b] = [b,a];
      const op = topic === 'decimal-add' ? '+' : '−', n = op === '+' ? a+b : a-b;
      return q(`${decimal(a,places)} ${op} ${decimal(b,places)}`, decimal(n,places),
        `Align the decimal points. In ${places === 1 ? 'tenths' : 'hundredths'}: ${a} ${op} ${b} = ${n}. Convert back: ${decimal(n,places)}.`, {a,b,places}, 'calculation');
    }
    if (topic === 'decimal-mul') {
      const a = int(2,99), b = int(2,level ? 25 : 9), bp = level ? 1 : 0;
      return q(`${decimal(a,1)} × ${decimal(b,bp)}`, decimal(a*b,1+bp),
        `Calculate ${a} × ${b} = ${a*b}. Divide by ${10 ** (1+bp)} to put the decimal point back: ${decimal(a*b,1+bp)}.`, {a,b,ap:1,bp}, 'calculation');
    }
    if (topic === 'decimal-div') {
      const result = int(2,99), divisor = int(2,level ? 25 : 9), dp = level ? 1 : 0;
      return q(`${decimal(result*divisor,1+dp)} ÷ ${decimal(divisor,dp)}`, decimal(result,1),
        `Check by multiplication: ${decimal(result,1)} × ${decimal(divisor,dp)} = ${decimal(result*divisor,1+dp)}. So the quotient is ${decimal(result,1)}.`, {result,divisor,dp}, 'calculation');
    }
    if (topic === 'decimal-compare') {
      const a = int(1,999), b = pick([a, a+1, Math.max(1,a-int(1,9)), a+int(10,90)]);
      const left = decimal(a,2) + (a % 100 === 0 ? '.0' : a % 10 === 0 ? '0' : '');
      const symbol = a === b ? '=' : a < b ? '<' : '>';
      return q(`Fill in <, > or =: ${left} □ ${decimal(b,2)}`, symbol,
        `Write both numbers in hundredths: ${a} and ${b}. Since ${a} ${symbol} ${b}, ${left} ${symbol} ${decimal(b,2)}. Trailing zeros do not change a decimal’s value.`, {a,b});
    }
    if (topic === 'decimal-convert') {
      const d = pick(level ? [4,5,8,20,25,40,50] : [2,4,5,10]), n = int(1,d-1);
      const p = d === 8 || d === 40 ? 3 : 2, factor = 10**p/d;
      return q(`Write ${n}/${d} as a decimal.`, decimal(n*factor,p),
        `Make the denominator ${10**p}: multiply both parts by ${factor}. ${n}/${d} = ${n*factor}/${10**p} = ${decimal(n*factor,p)}.`, {n,d});
    }
    if (topic === 'decimal-story') {
      const price = int(11,99)*5, quantity = int(2,level ? 6 : 3), total = price*quantity;
      const payment = (Math.floor(total/1000)+1)*1000;
      if (level === 0) return q(`One notebook costs ${decimal(price,2)} baht. How much do ${quantity} notebooks cost?`, `${decimal(total,2)} baht`,
        `${decimal(price,2)} × ${quantity} = ${decimal(total,2)} baht. Multiply the price of one notebook by the number of notebooks.`, {price,quantity,payment,change:false});
      return q(`One notebook costs ${decimal(price,2)} baht. You buy ${quantity} and pay ${decimal(payment,2)} baht. How much change do you get?`, `${decimal(payment-total,2)} baht`,
        `1. Total cost: ${decimal(price,2)} × ${quantity} = ${decimal(total,2)} baht.\n2. Change: ${decimal(payment,2)} − ${decimal(total,2)} = ${decimal(payment-total,2)} baht.`, {price,quantity,payment,change:true});
    }
    if (topic === 'percent-convert') {
      const d = pick(level ? [4,5,10,20,25,50,100] : [2,4,5,10]), n = int(1,d-1), percent = n*(100/d);
      const fromDecimal = random() < .5;
      return q(`Write ${fromDecimal ? decimal(percent,2) : `${n}/${d}`} as a percentage.`, `${percent}%`,
        `${n}/${d} = ${percent}/100 = ${decimal(percent,2)} = ${percent}%. Percent means “out of 100”.`, {n,d,percent});
    }
    if (topic === 'percent-of' || topic === 'percent-discount') {
      const percent = pick(level ? [5,10,15,20,25,30,35,40,60,75] : [10,25,50]), amount = int(2,20)*(level > 1 ? 25 : 20);
      const part = amount*percent; // hundredths of the amount
      if (topic === 'percent-of') return q(`What is ${percent}% of ${amount}?`, decimal(part,2),
        `${percent}% means ${percent}/100. Calculate ${amount} × ${percent} ÷ 100 = ${decimal(part,2)}.`, {percent,amount});
      return q(`A bag costs ${amount} baht. It is discounted by ${percent}%. What is the sale price?`, `${decimal(amount*100-part,2)} baht`,
        `1. Discount: ${amount} × ${percent}/100 = ${decimal(part,2)} baht.\n2. Sale price: ${amount} − ${decimal(part,2)} = ${decimal(amount*100-part,2)} baht. The discount is the saving, not the final price.`, {percent,amount});
    }
    if (topic === 'percent-story') {
      const percent = pick([10,20,25,40,50,60,75]), total = int(1,5)*20, part = total*percent/100;
      if (level === 0) return q(`A club has ${total} students. ${percent}% walk to school. How many students walk?`, `${part} students`,
        `${total} × ${percent}/100 = ${part} students.`, {percent,total,part,mode:'part'});
      if (level === 1) return q(`A club has ${total} students. ${part} walk to school. What percentage walk?`, `${percent}%`,
        `Divide the part by the whole, then multiply by 100: ${part} ÷ ${total} × 100 = ${percent}%.`, {percent,total,part,mode:'percent'});
      return q(`${part} students walk to school. They are ${percent}% of a club. How many students are in the club?`, `${total} students`,
        `${percent}% represents ${part} students. The whole is ${part} × 100 ÷ ${percent} = ${total} students. Check: ${total} × ${percent}/100 = ${part}.`, {percent,total,part,mode:'whole'});
    }
    // Missing-place-value reasoning instead of merely increasing operand size.
    const whole = int(1,9), digit = int(1,8), tail = int(1,9);
    return q(`Find the missing digit: ${whole}.□${tail} + 0.0${10-tail} = ${whole}.${digit+1}0`, digit,
      `The hundredths add to 10 hundredths, so carry 1 tenth. The tenths must be ${digit+1} − 1 = ${digit}. Check: ${whole}.${digit}${tail} + 0.0${10-tail} = ${whole}.${digit+1}0.`, {whole,digit,tail});
  }
  const api = {topics, createQuestion, decimal};
export default api;
