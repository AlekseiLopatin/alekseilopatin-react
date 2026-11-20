import { describe, it, expect } from 'vitest';
import engine from './engine';
import saves from './saves';
import { createBatch, awardBatch, undoBatch, ready, recommendations } from './rounds';
const prepare = () => { const s=engine.createState(), c=s.classes[0]; c.batch=createBatch(c.students,'fraction-mixed','hard'); return {s,c}; };
const complete = c => { c.batch.phase='review'; c.batch.revealed.fill(true); c.batch.results.forEach(row=>row.fill('correct')); };
describe('five-question classroom transactions',()=>{
  it('starts unmarked, excludes absentees, and rotates checkers without self-checks',()=>{
    const {c}=prepare(); c.students[1].present=false;
    const a=createBatch(c.students,'mul','hard','written',1),b=createBatch(c.students,'mul','hard','written',2);
    expect(a.results[0]).toEqual(Array(5).fill('unmarked'));expect(a.results[1]).toEqual(Array(5).fill('absent'));
    expect(a.checkers[1]).toBe(null);expect(new Set(a.checkers.filter(n=>n!==null)).size).toBe(29);
    a.checkers.forEach((n,i)=>{if(n!==null)expect(n).not.toBe(i);});expect(a.checkers[0]).not.toBe(b.checkers[0]);
  });
  it('blocks unrevealed or unmarked awards and awards exactly once',()=>{
    const {c}=prepare();expect(awardBatch(c)).toBe(false);complete(c);c.batch.results[2][3]='unmarked';expect(awardBatch(c)).toBe(false);
    c.batch.results[2][3]='none';c.batch.leader=0;c.batch.results[0][0]='attempt';c.batch.results[0][1]='none';
    c.batch.revealed[4]=false;expect(ready(c.batch)).toBe(false);c.batch.revealed[4]=true;
    expect(awardBatch(c)).toBe(true);expect(c.students[0].xp).toBe(66);expect(c.students[2].xp).toBe(40);expect(c.students[0].turns).toBe(1);
    expect(awardBatch(c)).toBe(false);expect(c.students[0].xp).toBe(66);expect(c.skills['fraction-mixed'][0]).toEqual({correct:3,attempt:1,none:1});
  });
  it('round-trips live review, awarded state, statistics and undo',()=>{
    const {s,c}=prepare();complete(c);c.batch.leader=1;awardBatch(c);
    const restored=saves.validate(JSON.parse(JSON.stringify(s))).classes[0];expect(restored.batch.phase).toBe('awarded');expect(restored.students[1].xp).toBe(100);
    expect(recommendations(restored)[0].total).toBe(150);expect(undoBatch(restored)).toBe(true);expect(restored.students[1].xp).toBe(0);expect(restored.skills).toEqual({});expect(restored.batch.phase).toBe('review');expect(undoBatch(restored)).toBe(false);
  });
  it('undo preserves customization while removing locked items',()=>{
    const {c}=prepare();c.students[0].xp=90;complete(c);awardBatch(c);c.students[0].appearance.character=4;c.students[0].appearance.glasses='round';undoBatch(c);
    expect(c.students[0].appearance.character).toBe(4);expect(c.students[0].appearance.glasses).toBe(null);expect(c.students[0].xp).toBe(90);
  });
  it('rejects corrupted batch data and accepts legacy saves',()=>{
    expect(saves.validate(engine.createState()).classes).toHaveLength(3);
    for(const corrupt of [b=>b.results[0][0]='hack',b=>b.questions.pop(),b=>b.revealed[0]='yes',b=>b.checkers[0]=0,b=>b.index=5]){
      const {s,c}=prepare();corrupt(c.batch);expect(()=>saves.validate(s)).toThrow();
    }
  });
  it('keeps completed results after attendance changes for the next lesson',()=>{
    const {s,c}=prepare();complete(c);c.batch.leader=0;awardBatch(c);
    c.students[0].present=false;c.round.statuses[0]='absent';c.batchUndo=null;
    const restored=saves.validate(s).classes[0];expect(restored.batch.gains[0]).toBe(100);expect(restored.students[0].present).toBe(false);
  });
  it('preserves an unfinished review with a chart and choices',()=>{
    const {s,c}=prepare();c.batch=createBatch(c.students,'graph-bars','hard','choice');c.batch.phase='review';c.batch.revealed[0]=true;c.batch.results[0][0]='attempt';
    const restored=saves.validate(s).classes[0].batch;expect(restored.questions[0].diagram.type).toBe('bars');expect(restored.questions[0].options).toHaveLength(4);expect(restored.results[0][0]).toBe('attempt');expect(restored.results[0][1]).toBe('unmarked');
  });
});
