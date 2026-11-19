
  'use strict';
  const characters = ['Cat','Rabbit','Bear','Fox','Dragon','Robot'];
  const colors = {sky:'#93b3d3',sand:'#cfb28c',leaf:'#a6b985',lavender:'#c4a5cc',peach:'#dfac86',mint:'#8dbbb0'};
  const items = [
    {id:'round',slot:'glasses',name:'Round glasses',level:2},
    {id:'cap',slot:'hat',name:'Explorer cap',level:3},
    {id:'leaf',slot:'frame',name:'Forest frame',level:4},
    {id:'scarf',slot:'costume',name:'Adventure scarf',level:5},
    {id:'star',slot:'glasses',name:'Star glasses',level:6},
    {id:'crown',slot:'hat',name:'Hero crown',level:7},
    {id:'gold',slot:'frame',name:'Golden frame',level:8},
    {id:'cape',slot:'costume',name:'Superhero cape',level:9},
    {id:'wizard',slot:'hat',name:'Wizard hat',level:10}
  ];
  const slots = ['glasses','hat','costume','frame'];
  const level = xp => 1+Math.floor(xp/100);
  const defaultAppearance = i => ({character:i%6,color:Object.keys(colors)[i%6],glasses:null,hat:null,costume:null,frame:null});
  function sanitize(appearance,xp,index=0){
    const a=appearance||{}, next=defaultAppearance(index);
    if(Number.isInteger(a.character)&&a.character>=0&&a.character<6) next.character=a.character;
    if(Object.hasOwn(colors,a.color)) next.color=a.color;
    for(const slot of slots) next[slot]=items.some(item=>item.id===a[slot]&&item.slot===slot&&item.level<=level(xp))?a[slot]:null;
    return next;
  }
  function svg(appearance){
    const a=appearance, color=colors[a.color]||colors.sky;
    const features=[
      '<path d="M23 28L22 6L40 23M56 23L74 6L74 28"/>',
      '<ellipse cx="31" cy="18" rx="8" ry="17"/><ellipse cx="65" cy="18" rx="8" ry="17"/>',
      '<circle cx="25" cy="23" r="11"/><circle cx="71" cy="23" r="11"/>',
      '<path d="M21 35L14 6L42 25M54 25L82 6L75 35"/><path d="M22 58L8 68L30 76"/>',
      '<path d="M26 26L29 7L42 24M54 24L67 7L70 26M72 55L90 40L84 70L65 73"/>',
      '<path d="M48 22V8"/><circle cx="48" cy="6" r="4"/><rect x="12" y="31" width="9" height="21" rx="3"/><rect x="75" y="31" width="9" height="21" rx="3"/>'
    ][a.character];
    const frame=a.frame?`<rect x="3" y="2" width="90" height="77" rx="20" fill="none" stroke="${a.frame==='gold'?'#e3bb55':'#75aa73'}" stroke-width="3" stroke-dasharray="${a.frame==='gold'?'4 3':'12 4'}"/>`:'';
    const costume=a.costume==='cape'?'<path d="M28 51L12 78H84L68 51Z" fill="#9a5da5" stroke="#35493c" stroke-width="2"/>':'';
    const face=a.character===5?'<rect x="26" y="29" width="44" height="23" rx="5" fill="#3c5b52"/><path d="M33 37h8m14 0h8" stroke="#b0e6cb" stroke-width="4"/>':'<ellipse cx="36" cy="39" rx="3" ry="4" fill="#35493c"/><ellipse cx="60" cy="39" rx="3" ry="4" fill="#35493c"/><path d="M43 47Q48 53 53 47" fill="none" stroke="#35493c" stroke-width="2.2" stroke-linecap="round"/>';
    const glasses=a.glasses==='round'?'<g fill="none" stroke="#3b3148" stroke-width="2.5"><circle cx="35" cy="40" r="10"/><circle cx="61" cy="40" r="10"/><path d="M45 40H51"/></g>':a.glasses==='star'?'<g fill="#ffe18a" stroke="#735c35" stroke-width="1.5"><path d="M35 29L38 36L46 36L40 42L42 50L35 46L28 50L30 42L24 36L32 36Z"/><path d="M61 29L64 36L72 36L66 42L68 50L61 46L54 50L56 42L50 36L58 36Z"/></g>':'';
    const hat=a.hat==='cap'?'<path d="M24 25Q28 5 52 12Q68 15 70 26H20M55 26H81" fill="#4f8c78" stroke="#35493c" stroke-width="3"/>':a.hat==='crown'?'<path d="M27 24L23 8L38 15L48 3L58 15L73 8L69 24Z" fill="#e8c45d" stroke="#795f32" stroke-width="2"/>':a.hat==='wizard'?'<path d="M20 26L45 2L63 23L78 28Z" fill="#7564b3" stroke="#3b3148" stroke-width="2"/><path d="M43 12L47 17L40 17Z" fill="#ffe18a"/>':'';
    return `<svg class="avatar" viewBox="0 0 96 82" aria-hidden="true">${frame}${costume}<g fill="${color}" stroke="#35493c" stroke-width="2.4" stroke-linejoin="round">${features}<path d="M24 55Q15 70 28 74H69Q82 70 72 55"/><rect x="19" y="19" width="58" height="43" rx="${a.character===5?9:20}"/></g>${a.character===3?'<path d="M22 43L48 59L74 43Q72 62 48 62Q24 62 22 43" fill="#f4e7cb"/>':''}${face}${glasses}${hat}${a.costume==='scarf'?'<path d="M26 58H70V65H53V77H43V65H26Z" fill="#d47564" stroke="#864e46" stroke-width="2"/>':''}</svg>`;
  }
  const api={characters,colors,items,slots,level,defaultAppearance,sanitize,svg};
export default api;
