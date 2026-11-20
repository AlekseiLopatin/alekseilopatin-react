import { it, expect } from 'vitest';
import { curriculum, createQuestion, withChoices } from './curriculum';
import fractions from './fractions';
import engine from './engine';
import saves from './saves';
const number = value => parseFloat(String(value));
it('covers every supplied chapter and produces persistable questions at each tier',()=>{
  expect(new Set(Object.values(curriculum).map(m=>m.chapter).filter(Boolean)).size).toBe(12);
  for(const topic of Object.keys(curriculum))for(const tier of ['easy','medium','hard','impossible'])for(let i=0;i<20;i++){
    const q=createQuestion(topic,tier);expect(q.prompt).toBeTruthy();expect(q.explanation).toBeTruthy();expect(q.answer).not.toMatch(/NaN|undefined|Infinity/);
    const s=engine.createState();s.classes[0].round={...s.classes[0].round,topic,question:q};const restored=saves.validate(s).classes[0].round.question;
    expect(restored.answer).toBe(q.answer);if(q.diagram)expect(restored.diagram.type).toBe(q.diagram.type);
  }
});
it('independently checks numeric templates across random samples',()=>{
  for(let i=0;i<100;i++)for(const tier of ['easy','impossible']){
    const advanced=tier==='impossible';
    for(const topic of Object.keys(curriculum)){
      const q=createQuestion(topic,tier),f=q.facts;let expected;
      switch(topic){
        case 'fraction-set':expected=f.total*(advanced?1/2:3/4);break;
        case 'fraction-sharing':expected=Math.floor((f.n-f.removed)/f.size);break;
        case 'decimal-rounding':expected=f.estimate?Math.round(f.price/100)*f.count+Math.round(f.delivery/100):Math.round(f.n/f.divisor)*f.divisor/100;break;
        case 'decimal-two-step':expected=(f.paid-f.count*f.price)/100;break;
        case 'percent-steps':expected=f.total*(1-f.first/100)*(f.sold?1-f.second/100:f.second/100);break;
        case 'measure-length':case 'measure-mass':expected=f.amount*f.count/1000;break;
        case 'volume-tank':expected=f.a*f.b*(f.h-(advanced?10:0))/1000;break;
        case 'onet-composite':expected=f.a*f.b*(f.h+10);break;
        case 'geometry-angles':expected=180-f.a-f.b;break;
        case 'geometry-prisms':expected=f.edges?3*f.n:f.n+2;break;
        case 'area-parallelogram':expected=f.b*f.h-f.cut;break;
        case 'area-perimeter':expected=2*(f.a+f.b)-f.gate;break;
        case 'graph-bars':case 'graph-lines':expected=advanced?f.values.reduce((a,b)=>a+b,0):f.values[2];break;
        case 'onet-ratio':expected=f.mode==='ratio'?f.b*f.unit:f.a*f.unit;break;
        case 'onet-pattern':expected=f.start+(f.index-1)*f.step;break;
        case 'onet-circle':expected=f.area?22/7*f.radius**2:2*22/7*f.radius;break;
        case 'onet-polygon':expected=f.base*f.height/2;break;
        case 'onet-pie':expected=f.total*(advanced?100-f.percent:f.percent)/100;break;
        case 'onet-whole':expected=(f.a-f.b)/f.count;break;
      }
      if(expected!==undefined)expect(number(q.answer)).toBeCloseTo(expected,8);
      const choice=withChoices(q);if(choice.options){expect(new Set(choice.options).size).toBe(4);expect(number(choice.options[choice.correctOption])).toBe(number(q.answer));}
    }
  }
});
it('Hard and Challenge fraction operations retain non-unit factors after cancellation',()=>{
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  for(const topic of ['mul','div'])for(const tier of ['hard','impossible'])for(let i=0;i<500;i++){
    const q=fractions.createQuestion(topic,tier), x=topic==='mul'?gcd(q.a1,q.b2):gcd(q.a1,q.a2),y=topic==='mul'?gcd(q.a2,q.b1):gcd(q.b1,q.b2);
    const factors=topic==='mul'?[q.a1/x,q.a2/y,q.b1/y,q.b2/x]:[q.a1/x,q.b2/y,q.b1/y,q.a2/x];expect(factors.every(n=>n>1)).toBe(true);
  }
});
