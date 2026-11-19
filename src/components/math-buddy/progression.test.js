import { test } from 'vitest';
import assert from 'node:assert/strict';
import engine from './engine';
import heroes from './heroes';
import saves from './saves';
test('level boundaries and all nine unlocks',()=>{
  assert.equal(heroes.level(0),1);assert.equal(heroes.level(99),1);assert.equal(heroes.level(100),2);assert.equal(heroes.level(1050),11);
  assert.equal(heroes.items.length,9);
  for(const item of heroes.items){
    const a={...heroes.defaultAppearance(0),[item.slot]:item.id};
    assert.equal(heroes.sanitize(a,(item.level-1)*100-1)[item.slot],null);
    assert.equal(heroes.sanitize(a,(item.level-1)*100)[item.slot],item.id);
  }
});
test('undo preserves changed hero and removes newly locked accessories',()=>{
  const c=engine.createState().classes[0];c.students[0].xp=90;
  c.round.phase='review';c.round.leader=0;
  engine.award(c);assert.equal(c.students[0].xp,110);
  c.students[0].appearance={...heroes.defaultAppearance(5),glasses:'round'};
  assert.equal(engine.award(c),false);
  engine.undo(c);
  assert.equal(c.students[0].xp,90);assert.equal(c.students[0].turns,0);
  assert.equal(c.students[0].appearance.character,5);assert.equal(c.students[0].appearance.glasses,null);
});
test('legacy migration preserves progress and initializes all appearances without changing source',()=>{
  const legacy=engine.createState();legacy.version=1;
  legacy.classes.forEach(c=>c.students.forEach(s=>delete s.appearance));legacy.classes[1].students[2].xp=431;
  const original=JSON.stringify(legacy),next=saves.validate(legacy);
  assert.equal(next.version,2);assert.equal(next.classes[1].students[2].xp,431);
  assert.ok(next.classes.every(c=>c.students.every(s=>s.appearance)));
  assert.equal(JSON.stringify(legacy),original);
});
test('backup round-trip preserves rewards, equipment, class and undo',()=>{
  const s=engine.createState();s.active=2;const c=s.classes[2];c.students[1].xp=490;
  c.students[1].appearance.hat='cap';c.round.phase='review';engine.award(c);
  const next=saves.validate(JSON.parse(JSON.stringify(s)));
  assert.equal(next.active,2);assert.equal(next.classes[2].students[1].xp,500);
  assert.equal(next.classes[2].students[1].appearance.hat,'cap');
  engine.undo(next.classes[2]);assert.equal(next.classes[2].students[1].xp,490);
});
test('reject malformed backups before replacing live state',()=>{
  for(const mutate of [s=>s.classes.pop(),s=>s.active=3,s=>s.classes[0].students[0].xp=-1,s=>s.classes[0].round.leader=33,s=>s.classes[0].round.statuses[0]='hacked',s=>s.classes[0].round.question.simD=0]){
    const s=engine.createState();mutate(s);assert.throws(()=>saves.validate(s));
  }
});
