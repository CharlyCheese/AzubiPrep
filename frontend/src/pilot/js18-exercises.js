const taskCases18 = [
  [{ id: 1, title: 'HTML', minutes: 10, done: false }, { id: 2, title: 'CSS', minutes: 30, done: true }, { id: 3, title: 'JS', minutes: 2, done: false }],
  [],
  [{ id: 4, title: 'A', minutes: 0, done: true }],
  [{ id: 5, title: 'Gleich', minutes: 2, done: false }, { id: 6, title: 'Gleich', minutes: 2, done: false }],
  [{ id: 7, title: 'Erster', minutes: 10, done: true }, { id: 8, title: 'Zweiter', minutes: 2, done: true }, { id: 9, title: 'Dritter', minutes: 2, done: true }],
];
const unchanged18 = 'JSON.stringify(aufgaben) === JSON.stringify(input.aufgaben)';
export const JS18_EXERCISES = {
  'js18-callback': {
    inputs: [{}],
    probe: 'typeof plusDrei==="function" && typeof anwenden==="function" && plusDrei(-3)===0 && plusDrei(8)===11 && anwenden(5,plusDrei)===8 && anwenden(4,function(n){return n*2;})===8 && anwenden(-2,function(n){return n-1;})===-3 && check(0,"number",8) && check(1,"number",0) && check(-1,"count",2)',
  },
  'js18-filter': {
    inputs: taskCases18.map(aufgaben => ({ aufgaben })),
    probe: `typeof offene==="function" && (()=>{ const expected=input.aufgaben.filter(task=>!task.done); const extra=[{id:10,title:"X",minutes:2,done:true},{id:11,title:"Y",minutes:1,done:false}]; const before=JSON.stringify(extra); const result=offene(extra); const empty=[]; const emptyResult=offene(empty); return Array.isArray(auswahl) && auswahl!==aufgaben && JSON.stringify(auswahl)===JSON.stringify(expected) && check(0,"number",expected.length) && expected.every((task,i)=>check(i+1,"string",task.title)) && Array.isArray(result) && result!==extra && result.length===1 && result[0].id===11 && JSON.stringify(extra)===before && Array.isArray(emptyResult) && emptyResult!==empty && emptyResult.length===0 && ${unchanged18} && check(-1,"count",expected.length+1); })()`,
  },
  'js18-map': {
    inputs: taskCases18.slice(0, 4).map(aufgaben => ({ aufgaben })),
    probe: `typeof titelListe==="function" && (()=>{ const expected=input.aufgaben.map(task=>task.title); const extra=[{title:"X",done:true},{title:"Y",done:false}]; const before=JSON.stringify(extra); const result=titelListe(extra); return Array.isArray(titel) && titel!==aufgaben && JSON.stringify(titel)===JSON.stringify(expected) && check(0,"number",expected.length) && expected.every((name,i)=>check(i+1,"string",name)) && JSON.stringify(result)==='["X","Y"]' && JSON.stringify(extra)===before && JSON.stringify(titelListe([]))==='[]' && ${unchanged18} && check(-1,"count",expected.length+1); })()`,
  },
  'js18-pfeile': {
    inputs: [[-2,0,3,4],[],[0],[-1,-4],[2,1,2]].map(zahlen => ({ zahlen })),
    probe: 'typeof positiveQuadrate==="function" && (()=>{ const expected=input.zahlen.filter(n=>n>0).map(n=>n*n); const extra=[-3,0,1,5]; const before=JSON.stringify(extra); const result=positiveQuadrate(extra); return Array.isArray(quadrate) && quadrate!==zahlen && JSON.stringify(quadrate)===JSON.stringify(expected) && check(0,"number",expected.length) && expected.every((n,i)=>check(i+1,"number",n)) && JSON.stringify(result)==="[1,25]" && JSON.stringify(extra)===before && JSON.stringify(positiveQuadrate([]))==="[]" && JSON.stringify(zahlen)===JSON.stringify(input.zahlen) && check(-1,"count",expected.length+1); })()',
  },
  'js18-suchen': {
    inputs: taskCases18.map(aufgaben => ({ aufgaben })),
    probe: `typeof ersteOffene==="function" && typeof hatOffene==="function" && typeof fertig==="function" && (()=>{ const expected=input.aufgaben.find(task=>!task.done); const mixed=[{id:1,title:"A",done:true},{id:2,title:"B",done:false}]; const before=JSON.stringify(mixed); const found=ersteOffene(mixed); return JSON.stringify(erste)===JSON.stringify(expected) && check(0,"string",expected===undefined?"keine":expected.title) && check(1,"boolean",input.aufgaben.some(task=>!task.done)) && check(2,"boolean",input.aufgaben.length>0 && input.aufgaben.every(task=>task.done)) && ersteOffene([])===undefined && hatOffene([])===false && fertig([])===false && found.id===2 && hatOffene(mixed)===true && fertig(mixed)===false && fertig([{done:true}])===true && ersteOffene([{done:true}])===undefined && hatOffene([{done:true}])===false && JSON.stringify(mixed)===before && ${unchanged18} && check(-1,"count",3); })()`,
  },
  'js18-reduce-sort': {
    inputs: taskCases18.map(aufgaben => ({ aufgaben })),
    probe: `typeof gesamt==="function" && typeof nachDauer==="function" && (()=>{ const expected=[...input.aufgaben].sort((a,b)=>a.minutes-b.minutes); const sum=input.aufgaben.reduce((n,task)=>n+task.minutes,0); const extra=[{id:1,minutes:10},{id:2,minutes:2},{id:3,minutes:2}]; const before=JSON.stringify(extra); const sorted=nachDauer(extra); const empty=[]; const emptySorted=nachDauer(empty); return minuten===sum && Array.isArray(sortiert) && sortiert!==aufgaben && JSON.stringify(sortiert)===JSON.stringify(expected) && check(0,"number",sum) && check(1,"number",expected.length) && expected.every((task,i)=>check(i+2,"string",task.title)) && gesamt([])===0 && gesamt(extra)===14 && Array.isArray(sorted) && sorted!==extra && sorted[0].id===2 && sorted[1].id===3 && sorted[2].id===1 && Array.isArray(emptySorted) && emptySorted!==empty && emptySorted.length===0 && JSON.stringify(extra)===before && ${unchanged18} && check(-1,"count",expected.length+2); })()`,
  },
  'js18-fehler': {
    inputs: [{}],
    probe: 'typeof pruefeDauer==="function" && pruefeDauer(1)===1 && pruefeDauer(15)===15 && pruefeDauer(240)===240 && [-1,0,1.5,NaN,"15",null,undefined].every(value=>{try{pruefeDauer(value);return false;}catch(error){return error instanceof Error && error.message==="Ungültige Dauer";}}) && check(0,"number",15) && check(1,"string","Ungültige Dauer") && check(-1,"count",2)',
  },
  'js18-debugspur': {
    inputs: [[2,3],[],[0],[-2,5,1]].map(zahlen => ({ zahlen })),
    probe: 'typeof summe==="function" && check(0,"number",input.zahlen.reduce((sum,n)=>sum+n,0)) && summe([])===0 && summe([2,3])===5 && summe([-1,0,4])===3 && JSON.stringify(zahlen)===JSON.stringify(input.zahlen) && (()=>{const extra=[3,1];const before=JSON.stringify(extra);return summe(extra)===4 && JSON.stringify(extra)===before;})() && check(-1,"count",1)',
  },
};
