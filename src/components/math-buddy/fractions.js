
'use strict';
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b, a%b]; } return a; }
function pickWeighted(items){
  const total = items.reduce((s,it)=>s+it[1],0);
  let r = Math.random()*total;
  for (const [v,w] of items){ r -= w; if (r <= 0) return v; }
  return items[items.length-1][0];
}
// biases toward `min` when skew > 1 — used so each tier still favors its simpler end
function biasedInt(min, max, skew){
  const t = Math.pow(Math.random(), skew);
  return Math.round(min + t*(max-min));
}
function coprimeBase(aMax, bMax, skew){
  for (let tries=0; tries<40; tries++){
    const a = biasedInt(1, aMax, skew);
    const b = biasedInt(a+1, bMax, skew);
    if (gcd(a,b) === 1) return [a,b];
  }
  return [1,2];
}

// --- Topic: Simplify --------------------------------------------------------
// every exercise = (a*k)/(b*k) with gcd(a,b)=1 and k>1, so it is ALWAYS reducible —
// never a dead-end coprime fraction like 17/999
const SIMPLIFY_TIERS = {
  easy:       {aMax:4,  bMax:6,  skew:1.3, kPool:[[2,55],[3,30],[4,15]]},
  medium:     {aMax:9,  bMax:14, skew:1.4, kPool:[[2,28],[3,26],[4,16],[5,12],[6,18]]},
  hard:       {aMax:15, bMax:20, skew:1.5, kPool:[[3,14],[4,10],[6,16],[7,20],[8,10],[9,10],[11,10],[13,10]]},
  impossible: {aMax:24, bMax:36, skew:1.6, kPool:[[7,10],[9,10],[11,12],[12,14],[13,10],[14,12],[15,10],[16,8],[18,10],[21,8],[24,6]]},
};
function genSimplifyExercise(tierKey){
  const cfg = SIMPLIFY_TIERS[tierKey];
  const [a,b] = coprimeBase(cfg.aMax, cfg.bMax, cfg.skew);
  const k = pickWeighted(cfg.kPool);
  return {n:a*k, d:b*k, simN:a, simD:b, k};
}

// Pools enforce the required steps; randomness only chooses within a level.
const operationPools = new Map();
function operationPool(topic, tier) {
  const key = topic + ':' + tier;
  if (operationPools.has(key)) return operationPools.get(key);
  const max = {easy:6, medium:10, hard:15, impossible:20}[tier];
  const pool = [];
  for(let b1=2;b1<=max;b1++) for(let a1=1;a1<b1;a1++) {
    if(gcd(a1,b1)!==1) continue;
    for(let b2=2;b2<=max;b2++) for(let a2=1;a2<b2;a2++) {
      if(gcd(a2,b2)!==1) continue;
      const related = b1%b2===0 || b2%b1===0;
      let n, d, allowed;
      if(topic==='add' || topic==='sub') {
        n = a1*b2 + (topic==='add' ? 1 : -1)*a2*b1; d=b1*b2;
        if(n<=0 || n===d) continue;
        if(tier==='easy') allowed=b1===b2;
        if(tier==='medium') allowed=b1!==b2 && related;
        if(tier==='hard') allowed=!related && gcd(b1,b2)===1 && b1>=4 && b2>=4;
        // Both fractions need conversion using the LCM, then further reduction.
        if(tier==='impossible') allowed=!related && b1>=6 && b2>=6 && gcd(b1,b2)>1 && gcd(n,d)>gcd(b1,b2) && a1>1 && a2>1;
      } else {
        n=topic==='mul'?a1*a2:a1*b2; d=topic==='mul'?b1*b2:b1*a2;
        if(n===d) continue;
        const cross1=topic==='mul'?gcd(a1,b2):gcd(a1,a2);
        const cross2=topic==='mul'?gcd(a2,b1):gcd(b1,b2);
        const cancellations=Number(cross1>1)+Number(cross2>1);
        if(tier==='easy') allowed=cancellations===0;
        if(tier==='medium') allowed=cancellations===1;
        if(tier==='hard') allowed=cancellations===2 && b1>=6 && b2>=6;
        if(tier==='impossible') allowed=cancellations===2 && b1>=10 && b2>=10 && a1>=3 && a2>=3 && cross1!==cross2;
      }
      if(allowed){ const factor=gcd(n,d); pool.push({a1,b1,a2,b2,simN:n/factor,simD:d/factor}); }
    }
  }
  if(!pool.length) throw new Error('No questions for '+key);
  operationPools.set(key,pool);
  return pool;
}
function genOperationExercise(topic,tier) {
  const pool=operationPool(topic,tier);
  return {...pool[Math.floor(Math.random()*pool.length)]};
}

function genExercise(topic, tierKey){
  return topic === 'simplify' ? genSimplifyExercise(tierKey) : genOperationExercise(topic, tierKey);
}


const topics = {simplify: 'Simplify fractions', add: 'Add fractions', sub: 'Subtract fractions', mul: 'Multiply fractions', div: 'Divide fractions'};
const difficulties = {easy: 'Easy', medium: 'Medium', hard: 'Hard', impossible: 'Challenge'};
function createQuestion(topic = 'simplify', difficulty = 'easy') {
  if (!Object.hasOwn(topics, topic) || !Object.hasOwn(difficulties, difficulty)) throw new Error('Unknown fraction setting');
  return {kind: 'fraction', topic, ...genExercise(topic, difficulty)};
}
const api = {createQuestion, topics, difficulties};
export default api;
