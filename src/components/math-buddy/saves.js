import heroes from './heroes';
import engine from './engine';

  'use strict';

  const integer=(n,max=100000000)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
  const text=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
  function requireValid(condition){if(!condition)throw new Error('Invalid Math Buddy backup');}
  function diagram(d) {
    if (d == null) return null;
    requireValid(d && ['bars','line','pie','angles','circle','cuboid','parallelogram','triangle'].includes(d.type));
    const labels = d.labels || [], values = d.values || [];
    requireValid(Array.isArray(labels) && labels.length <= 8 && labels.every(s => text(s,100)));
    requireValid(Array.isArray(values) && values.length <= 8 && values.every(n => Number.isFinite(n) && n >= 0 && n <= 1000));
    if (['bars','line'].includes(d.type)) requireValid(values.length === 4 && labels.length === 4 && values.every(n=>n<=100));
    if (d.type === 'pie') requireValid(values.length===2 && values[0]+values[1]===100);
    if (d.type === 'angles') requireValid(values.length===2 && values[0]+values[1]<180);
    return {type:d.type,labels:[...labels],values:[...values]};
  }
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
      const extra={};
      for (const key of ['skill','template','source']) if(q[key]!==undefined){requireValid(text(q[key],200));extra[key]=q[key];}
      if(q.diagram)extra.diagram=diagram(q.diagram);
      if(q.options){requireValid(Array.isArray(q.options)&&q.options.length===4&&q.options.every(v=>text(v,500))&&new Set(q.options).size===4&&integer(q.correctOption,3));extra.options=[...q.options];extra.correctOption=q.correctOption;}
      return {kind:q.kind,topic:q.topic,prompt:q.prompt,answer:q.answer,explanation:q.explanation,layout:q.layout==='calculation'?'calculation':'text',...extra};
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
  function skills(value = {}) {
    requireValid(value && typeof value === 'object' && !Array.isArray(value));
    const result = {};
    for(const [key,rows] of Object.entries(value)){
      requireValid(Object.hasOwn(engine.topics,key)&&Array.isArray(rows)&&rows.length===30);
      result[key]=rows.map(row=>{requireValid(row&&['correct','attempt','none'].every(k=>integer(row[k])));return {correct:row.correct,attempt:row.attempt,none:row.none};});
    }
    return result;
  }
  function batch(b,roster){
    if(b==null)return null;
    requireValid(b && integer(b.number) && b.number>0 && Object.hasOwn(engine.topics,b.topic));
    requireValid(['easy','medium','hard','impossible'].includes(b.difficulty)&&['written','choice'].includes(b.format));
    requireValid(['solve','review','awarded'].includes(b.phase)&&integer(b.index,4));
    requireValid(Array.isArray(b.questions)&&b.questions.length===5);
    const questions=b.questions.map(question);requireValid(questions.every(q=>q.topic===b.topic));
    requireValid(Array.isArray(b.revealed)&&b.revealed.length===5&&b.revealed.every(v=>typeof v==='boolean'));
    requireValid(b.phase!=='solve'||b.revealed.every(v=>!v));
    requireValid(b.leader===null||(integer(b.leader,29)&&(b.phase==='awarded'||roster[b.leader].present)));
    requireValid(Array.isArray(b.results)&&b.results.length===30);
    const results=b.results.map((row,i)=>{requireValid(Array.isArray(row)&&row.length===5);const present=b.phase==='awarded'?row[0]!=='absent':roster[i].present;requireValid(row.every(s=>present?['unmarked','correct','attempt','none'].includes(s):s==='absent'));return [...row];});
    requireValid(Array.isArray(b.checkers)&&b.checkers.length===30&&b.checkers.every((n,i)=>n===null||(integer(n,29)&&n!==i&&results[n][0]!=='absent'&&results[i][0]!=='absent')));
    requireValid(b.gains===null||(Array.isArray(b.gains)&&b.gains.length===30&&b.gains.every(n=>integer(n,100))));
    requireValid(b.phase!=='awarded'||(b.gains!==null&&b.revealed.every(Boolean)&&results.every(row=>row.every(s=>s!=='unmarked'))));
    return {number:b.number,topic:b.topic,difficulty:b.difficulty,format:b.format,phase:b.phase,index:b.index,questions,revealed:[...b.revealed],leader:b.leader,results,checkers:[...b.checkers],gains:b.gains?[...b.gains]:null};
  }
  function validate(value){
    requireValid(value&&[1,2].includes(value.version)&&integer(value.active,2)&&Array.isArray(value.classes)&&value.classes.length===3);
    return {version:2,active:value.active,classes:value.classes.map(c=>{
      requireValid(text(c.name,100));
      const result={name:c.name,...snapshot(c),undo:c.undo?snapshot(c.undo):null};
      requireValid(!result.undo||result.undo.round.phase==='review');
      if(c.mode!==undefined){requireValid(['single','batch'].includes(c.mode));result.mode=c.mode;}
      if(c.skills!==undefined)result.skills=skills(c.skills);
      if(c.batch){result.batch=batch(c.batch,result.students);if(result.batch.phase!=='awarded')result.mode='batch';}
      if(c.batchUndo){
        const roster=students(c.batchUndo.students),previous=batch(c.batchUndo.batch,roster);
        requireValid(previous&&previous.phase==='review');
        result.batchUndo={students:roster,batch:previous,skills:skills(c.batchUndo.skills)};
      }
      return result;
    })};
  }
  const api={validate};
export default api;
