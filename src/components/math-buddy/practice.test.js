import { test } from 'vitest';
import assert from 'node:assert/strict';
import practice from './practice';
const {createQuestion,topics,decimal}=practice;
import engine from './engine';
test('integer decimal formatting handles zeros and trailing zeros exactly', () => {
  assert.equal(decimal(30,2),'0.3'); assert.equal(decimal(0,2),'0');
  assert.equal(decimal(105,2),'1.05'); assert.equal(decimal(1000,0),'1000');
  assert.equal(decimal(1234,3),'1.234');
});
test('every new topic has correct answers and explanations across all levels', () => {
  let seed = 42;
  const random = () => ((seed = (1664525*seed + 1013904223) >>> 0) / 2**32);
  for (const topic of Object.keys(topics)) for (const level of ['easy','medium','hard','impossible']) for(let i=0;i<100;i++) {
    const q = createQuestion(topic,level,random), f = q.facts;
    assert.ok(q.prompt.length && q.explanation.length);
    assert.ok(!/undefined|NaN|Infinity/.test(JSON.stringify(q)));
    let expected;
    switch(topic) {
      case 'decimal-add': expected=(f.a+f.b)/10**f.places; break;
      case 'decimal-sub': expected=(f.a-f.b)/10**f.places; break;
      case 'decimal-mul': expected=f.a*f.b/10**(f.ap+f.bp); break;
      case 'decimal-div': expected=f.result/10; break;
      case 'decimal-compare': assert.equal(q.answer, f.a===f.b?'=':f.a<f.b?'<':'>'); continue;
      case 'decimal-convert': expected=f.n/f.d; break;
      case 'decimal-story': expected=(f.change?f.payment-f.price*f.quantity:f.price*f.quantity)/100; break;
      case 'percent-of': expected=f.amount*f.percent/100; break;
      case 'percent-discount': expected=f.amount*(100-f.percent)/100; break;
      case 'percent-convert': expected=f.n/f.d*100; break;
      case 'percent-story': expected=f.mode==='whole'?f.part*100/f.percent:f.mode==='percent'?f.part/f.total*100:f.total*f.percent/100; break;
      case 'decimal-reason': expected=f.digit; assert.equal(f.whole*100+f.digit*10+f.tail+10-f.tail,f.whole*100+(f.digit+1)*10); break;
    }
    assert.ok(Math.abs(parseFloat(q.answer)-expected)<1e-9, `${topic}: ${q.prompt} -> ${q.answer}`);
  }
});
test('new topics persist through serialization, next round and undo without changing XP rules', () => {
  for (const topic of Object.keys(topics)) {
    let c = engine.createState().classes[0];
    c.round = engine.newRound(c.students,topic,'hard'); c.round.phase='review'; c.round.leader=0;
    const original=structuredClone(c.round.question);
    engine.award(c); c=JSON.parse(JSON.stringify(c));
    assert.equal(c.students[0].xp,20);
    c.round=engine.newRound(c.students,c.round.topic,c.round.difficulty);
    assert.equal(c.round.topic,topic); assert.equal(c.round.difficulty,'hard');
    engine.undo(c); assert.deepEqual(c.round.question,original); assert.equal(c.students[0].xp,0);
  }
});
