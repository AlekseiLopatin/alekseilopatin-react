import heroes from './heroes';
import engine from './engine';

  'use strict';

  const integer=(n,max=100000000)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
  const text=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
  function requireValid(condition){if(!condition)throw new Error('Invalid Math Buddy backup');}
  function students(rows){
    requireValid(Array.isArray(rows)&&rows.length===30);
    return rows.map((s,i)=>{
      requireValid(s&&text(s.name,100)&&integer(s.xp)&&integer(s.turns)&&typeof s.present==='boolean');
      return {name:s.name,xp:s.xp,turns:s.turns,present:s.present,appearance:heroes.sanitize(s.appearance,s.xp,i)};
    });
  }
  function question(q){
    requireValid(q&&typeof q==='object');
    if(q.kind==='practice'){
      requireValid(Object.hasOwn(engine.topics,q.topic)&&q.topic.includes('-')&&text(q.prompt,2000)&&text(q.answer,500)&&text(q.explanation,4000));
      return {kind:q.kind,topic:q.topic,prompt:q.prompt,answer:q.answer,explanation:q.explanation,layout:q.layout==='calculation'?'calculation':'text'};
    }
    if(q.kind==='fraction'){
      requireValid(['simplify','add','sub','mul','div'].includes(q.topic));
      const keys=q.topic==='simplify'?['n','d','simN','simD','k']:['a1','b1','a2','b2','simN','simD'];
      for(const key of keys)requireValid(integer(q[key],100000));
      requireValid(q.simD>0&&(q.topic==='simplify'?q.d>0&&q.k>1:q.b1>0&&q.b2>0));
      return {kind:q.kind,topic:q.topic,...Object.fromEntries(keys.map(k=>[k,q[k]]))};
    }
    requireValid(integer(q.a,100)&&integer(q.b,100)&&integer(q.answer,200)&&['+','−'].includes(q.operator));
    return {a:q.a,b:q.b,answer:q.answer,operator:q.operator};
  }
  function round(r,roster){
    requireValid(r&&['solve','review','awarded'].includes(r.phase)&&Array.isArray(r.statuses)&&r.statuses.length===30);
    requireValid(r.statuses.every(s=>['correct','attempt','none','absent'].includes(s)));
    requireValid(r.leader===null||(integer(r.leader,29)&&roster[r.leader].present));
    requireValid(r.statuses.every((s,i)=>roster[i].present?s!=='absent':s==='absent'));
    requireValid(r.gains===null||(Array.isArray(r.gains)&&r.gains.length===30&&r.gains.every(n=>integer(n,20))));
    requireValid(r.phase!=='awarded'||r.gains!==null);
    const q=question(r.question);
    requireValid(q.kind?q.topic===r.topic:['add','subtract'].includes(r.topic));
    const difficulty=r.difficulty||'easy';
    requireValid(['easy','medium','hard','impossible'].includes(difficulty));
    return {phase:r.phase,topic:r.topic,difficulty,question:q,leader:r.leader,statuses:[...r.statuses],gains:r.gains?[...r.gains]:null};
  }
  function snapshot(c){
    requireValid(c&&integer(c.roundNumber)&&c.roundNumber>=1);
    const roster=students(c.students);
    return {students:roster,round:round(c.round,roster),roundNumber:c.roundNumber};
  }
  function validate(value){
    requireValid(value&&[1,2].includes(value.version)&&integer(value.active,2)&&Array.isArray(value.classes)&&value.classes.length===3);
    return {version:2,active:value.active,classes:value.classes.map(c=>{
      requireValid(text(c.name,100));
      const result={name:c.name,...snapshot(c),undo:c.undo?snapshot(c.undo):null};
      requireValid(!result.undo||result.undo.round.phase==='review');
      return result;
    })};
  }
  const api={validate};
export default api;
