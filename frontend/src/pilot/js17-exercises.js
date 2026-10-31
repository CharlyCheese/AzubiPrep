const unchangedNumbers17 = 'JSON.stringify(zahlen) === JSON.stringify(input.zahlen)';
export const JS17_EXERCISES = {
  'js17-arraystart': { inputs: [{}], probe: 'Array.isArray(lernziele) && lernziele.length===3 && lernziele[0]==="HTML" && lernziele[1]==="CSS" && lernziele[2]==="JavaScript" && check(0,"string","HTML") && check(1,"string","JavaScript") && check(2,"number",3) && check(3,"undefined") && check(-1,"count",4)' },
  'js17-arrayaendern': { inputs: [{}], probe: 'Array.isArray(themen) && themen.length===2 && themen[0]==="Struktur" && themen[1]==="CSS" && entfernt==="JavaScript" && check(0,"string","Struktur") && check(1,"string","CSS") && check(2,"number",2) && check(3,"string","JavaScript") && check(-1,"count",4)' },
  'js17-for': {
    inputs: [[2,4,6],[],[0],[-2,5]].map(zahlen => ({ zahlen })),
    probe: `typeof summeMitIndex==="function" && ergebnis===input.zahlen.reduce((sum,value)=>sum+value,0) && check(0,"number",ergebnis) && summeMitIndex([])===0 && summeMitIndex([5])===5 && summeMitIndex([-1,2,-3])===-2 && ${unchangedNumbers17} && check(-1,"count",1)`,
  },
  'js17-forof': {
    inputs: [{ zahlen:[2,5,3], mindestwert:3 }, { zahlen:[], mindestwert:0 }, { zahlen:[-3,0,4], mindestwert:0 }, { zahlen:[3], mindestwert:3 }],
    probe: `typeof zaehleAb==="function" && anzahl===input.zahlen.filter(value=>value>=input.mindestwert).length && check(0,"number",anzahl) && zaehleAb([1,2,3],2)===2 && zaehleAb([],0)===0 && zaehleAb([-3,0],0)===1 && ${unchangedNumbers17} && check(-1,"count",1)`,
  },
  'js17-while': {
    inputs: [{ startwert:0, zielwert:6 }, { startwert:1, zielwert:6 }, { startwert:6, zielwert:6 }, { startwert:8, zielwert:3 }],
    probe: 'typeof schritteBisZiel==="function" && check(0,"number",Math.max(0,Math.ceil((input.zielwert-input.startwert)/2))) && schritteBisZiel(0,0)===0 && schritteBisZiel(0,1)===1 && schritteBisZiel(1,6)===3 && schritteBisZiel(7,2)===0 && check(-1,"count",1)',
  },
  'js17-abbrechen': {
    inputs: [[2,-5,3,0,9],[0,4],[],[7,-2,1]].map(zahlen => ({ zahlen })),
    probe: `typeof summeBisStop==="function" && (()=>{ let sum=0; for(const value of input.zahlen){if(value===0)break;if(value>0)sum+=value;} return check(0,"number",sum); })() && summeBisStop([1,0,5])===1 && summeBisStop([-3,2])===2 && summeBisStop([])===0 && ${unchangedNumbers17} && check(-1,"count",1)`,
  },
  'js17-zahlenprojekt': {
    inputs: [[3,-1,0,5],[],[-3,0],[1,2]].map(zahlen => ({ zahlen })),
    probe: `typeof positiveWerte==="function" && Array.isArray(ergebnis) && ergebnis!==zahlen && (()=>{ const expected=input.zahlen.filter(value=>value>0); const empty=positiveWerte([]); const extra=positiveWerte([-1,0,2,1]); return JSON.stringify(ergebnis)===JSON.stringify(expected) && check(0,"number",expected.length) && expected.every((value,index)=>check(index+1,"number",value)) && Array.isArray(empty) && empty.length===0 && JSON.stringify(extra)==="[2,1]" && ${unchangedNumbers17} && check(-1,"count",expected.length+1); })()`,
  },
  'js17-objekte': { inputs:[{}], probe:'typeof produkt==="object" && produkt!==null && !Array.isArray(produkt) && produkt.name==="Heft" && produkt.preisCent===200 && produkt.aufLager===true && eigenschaft==="name" && check(0,"string","Heft") && check(1,"number",200) && check(2,"string","Heft") && check(3,"boolean",true) && check(-1,"count",4)' },
  'js17-kopien': {
    inputs: [{ vorlage:{name:'Heft',preisCent:200,bestand:3} }, { vorlage:{name:'Stift',preisCent:100,bestand:0} }, { vorlage:{name:'Mappe',preisCent:350,bestand:7} }],
    probe: 'typeof kopie==="object" && kopie!==null && kopie!==vorlage && kopie.name===input.vorlage.name && kopie.preisCent===input.vorlage.preisCent && kopie.bestand===input.vorlage.bestand+1 && originalBestand===input.vorlage.bestand && JSON.stringify(vorlage)===JSON.stringify(input.vorlage) && check(0,"number",originalBestand) && check(1,"number",kopie.bestand) && check(-1,"count",2)',
  },
  'js17-produkte': {
    inputs: [{ produkte:[{name:'Heft',preisCent:200,bestand:3},{name:'Stift',preisCent:100,bestand:2}] }, { produkte:[] }, { produkte:[{name:'Leer',preisCent:500,bestand:0},{name:'Probe',preisCent:0,bestand:2}] }],
    probe: 'typeof berechneLagerwert==="function" && gesamtCent===input.produkte.reduce((sum,item)=>sum+item.preisCent*item.bestand,0) && check(0,"number",gesamtCent) && berechneLagerwert([])===0 && berechneLagerwert([{name:"Test",preisCent:250,bestand:2}])===500 && JSON.stringify(produkte)===JSON.stringify(input.produkte) && check(-1,"count",1)',
  },
  'js17-aufgabenprojekt': {
    inputs: [
      { aufgaben:[{titel:'HTML üben',minuten:20,erledigt:false},{titel:'CSS lesen',minuten:30,erledigt:true},{titel:'JavaScript testen',minuten:15,erledigt:false}] },
      { aufgaben:[] },
      { aufgaben:[{titel:'Fertig',minuten:5,erledigt:true}] },
      { aufgaben:[{titel:'Kurze Pause',minuten:0,erledigt:false},{titel:'Notizen',minuten:10,erledigt:false}] },
    ],
    probe: 'typeof werteAufgabenAus==="function" && typeof auswertung==="object" && auswertung!==null && (()=>{ const pending=input.aufgaben.filter(item=>!item.erledigt); const titles=pending.map(item=>item.titel); const minutes=pending.reduce((sum,item)=>sum+item.minuten,0); const empty=werteAufgabenAus([]); const extra=werteAufgabenAus([{titel:"A",minuten:5,erledigt:false},{titel:"B",minuten:50,erledigt:true}]); return auswertung.offen===pending.length && auswertung.restMinuten===minutes && Array.isArray(auswertung.titel) && JSON.stringify(auswertung.titel)===JSON.stringify(titles) && check(0,"number",pending.length) && check(1,"number",minutes) && titles.every((title,index)=>check(index+2,"string",title)) && empty.offen===0 && empty.restMinuten===0 && Array.isArray(empty.titel) && empty.titel.length===0 && extra.offen===1 && extra.restMinuten===5 && Array.isArray(extra.titel) && extra.titel.length===1 && extra.titel[0]==="A" && JSON.stringify(aufgaben)===JSON.stringify(input.aufgaben) && check(-1,"count",titles.length+2); })()',
  },
};
