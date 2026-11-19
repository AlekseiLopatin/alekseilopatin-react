import { test } from 'vitest';
import assert from 'node:assert/strict';
import engine from './engine';
import fractions from './fractions';
test('fraction difficulty enforces required operations instead of denominator size alone', () => {
  const gcd = (a,b) => b ? gcd(b,a%b) : a;
  for (const topic of ['add','sub','mul','div']) for (const tier of Object.keys(fractions.difficulties)) for (let i=0;i<250;i++) {
    const q=fractions.createQuestion(topic,tier), {a1,b1,a2,b2}=q;
    assert.notEqual(q.simN,0); assert.notEqual(q.simN,q.simD);
    if (topic==='add'||topic==='sub') {
      if(tier==='easy') assert.equal(b1,b2);
      if(tier==='medium') { assert.notEqual(b1,b2); assert.ok(b1%b2===0||b2%b1===0); }
      if(tier==='hard') { assert.notEqual(b1,b2); assert.equal(gcd(b1,b2),1); }
      if(tier==='impossible') {
        assert.notEqual(b1,b2); assert.ok(b1%b2!==0&&b2%b1!==0);
        assert.ok(gcd(b1,b2)>1);
        const n=a1*b2+(topic==='add'?1:-1)*a2*b1;
        assert.ok(gcd(n,b1*b2)>gcd(b1,b2), 'must reduce again after finding the LCM');
      }
    } else {
      const x=topic==='mul'?gcd(a1,b2):gcd(a1,a2);
      const y=topic==='mul'?gcd(a2,b1):gcd(b1,b2);
      assert.equal(Number(x>1)+Number(y>1),tier==='easy'?0:tier==='medium'?1:2);
    }
  }
});
test('all fraction topics and tiers produce exact reduced nonnegative answers', () => {
  const gcd = (a,b) => b ? gcd(b,a % b) : a;
  for (const topic of Object.keys(fractions.topics)) for (const difficulty of Object.keys(fractions.difficulties)) {
    for (let i = 0; i < 300; i++) {
      const q = engine.createQuestion(topic, difficulty);
      let n, d;
      if (topic === 'simplify') {
        n = q.n; d = q.d;
        assert.ok(gcd(n,d) > 1); assert.equal(q.k, gcd(n,d));
      } else {
        assert.ok(q.a1 > 0 && q.a1 < q.b1 && q.a2 > 0 && q.a2 < q.b2);
        if (topic === 'add') { n = q.a1*q.b2 + q.a2*q.b1; d = q.b1*q.b2; }
        if (topic === 'sub') { n = q.a1*q.b2 - q.a2*q.b1; d = q.b1*q.b2; }
        if (topic === 'mul') { n = q.a1*q.a2; d = q.b1*q.b2; }
        if (topic === 'div') { n = q.a1*q.b2; d = q.b1*q.a2; }
      }
      assert.ok(q.simD > 0 && q.simN >= 0);
      assert.equal(gcd(q.simN,q.simD), 1);
      assert.equal(n*q.simD, d*q.simN);
    }
  }
});
test('fraction settings and question survive award and undo', () => {
  const c = engine.createState().classes[0];
  c.round = engine.newRound(c.students, 'div', 'hard');
  const question = structuredClone(c.round.question);
  c.round.phase = 'review'; engine.award(c);
  c.round = engine.newRound(c.students, c.round.topic, c.round.difficulty);
  assert.equal(c.round.topic, 'div'); assert.equal(c.round.difficulty, 'hard');
  engine.undo(c);
  assert.deepEqual(c.round.question, question); assert.equal(c.round.difficulty, 'hard');
});
test('three independent classes with thirty students and all correct initially', () => {
  const s = engine.createState();
  assert.equal(s.classes.length, 3);
  for (const c of s.classes) { assert.equal(c.students.length, 30); assert.ok(c.round.statuses.every(s => s === 'correct')); }
  s.classes[0].students[0].xp = 30;
  assert.equal(s.classes[1].students[0].xp, 0);
});
test('awards, leader multiplier, exclusions, absence, duplicate protection and rollback', () => {
  const c = engine.createState().classes[0];
  assert.equal(engine.award(c), false);
  c.round.phase = 'review'; c.round.leader = 1;
  c.round.statuses[1] = 'attempt'; c.round.statuses[2] = 'none'; c.students[3].present = false;
  assert.equal(engine.award(c), true);
  assert.deepEqual(c.students.slice(0,4).map(s => s.xp), [10,6,0,0]);
  assert.equal(c.students[1].turns, 1);
  assert.equal(engine.award(c), false);
  assert.equal(engine.undo(c), true);
  assert.ok(c.students.every(s => s.xp === 0));
  assert.equal(c.students[1].turns, 0);
  assert.equal(c.round.phase, 'review');
  assert.equal(engine.undo(c), false);
});
test('correct leader earns twenty and next round resets exclusions but retains absence', () => {
  const c = engine.createState().classes[0]; c.round.phase = 'review'; c.round.leader = 0;
  c.round.statuses[1] = 'none'; c.students[2].present = false;
  engine.award(c); assert.equal(c.students[0].xp, 20);
  c.round = engine.newRound(c.students);
  assert.equal(c.round.statuses[1], 'correct'); assert.equal(c.round.statuses[2], 'absent'); assert.equal(c.round.leader, null);
  engine.undo(c); assert.equal(c.students[0].xp, 0);
});
