import { JS15_EXERCISES } from './js15-exercises.js';
import { JS16_EXERCISES } from './js16-exercises.js';
import { JS17_EXERCISES } from './js17-exercises.js';
// Fixed trusted guest probes. No probe source or input values arrive from IPC,
// editor text or imports. Every probe itself executes only inside QuickJS.
export const JS_EXERCISES = {
  ...JS15_EXERCISES,
  ...JS16_EXERCISES,
  ...JS17_EXERCISES,
  'js-datei': { inputs: [{}], probe: 'check(0, "string")' },
  'js-werte': { inputs: [{}], probe: 'check(0,"number",42) && check(1,"string","42") && check(2,"boolean",true)' },
  'js-konstanten': { inputs: [{}], probe: 'kursName === "JavaScript" && startJahr === 2026 && check(0,"string",kursName) && check(1,"number",startJahr) && (() => { try { kursName = "anders"; return false; } catch { return true; } })() && (() => { try { startJahr = 1; return false; } catch { return true; } })()' },
  'js-zuweisung': { inputs: [{}], probe: 'punkte === 15 && check(0,"number",10) && check(1,"number",15) && (() => { punkte = 16; return punkte === 16; })()' },
  'js-typen': { inputs: [{}], probe: 'anzahl === 3 && thema === "HTML" && bereit === true && spaeter === undefined && leer === null && check(0,"string","number") && check(1,"string","string") && check(2,"string","boolean") && check(3,"string","undefined") && check(4,"string","object")' },
  'js-rechnen': { inputs: [{}], probe: 'check(0,"number",7) && check(1,"number",7) && check(2,"number",12) && check(3,"number",4) && check(4,"number",2)' },
  'js-klammern': { inputs: [{ basisPreis: 4, zuschlag: 2, anzahl: 3 }, { basisPreis: 7, zuschlag: 1, anzahl: 5 }], probe: 'gesamt === (basisPreis + zuschlag) * anzahl && check(0,"number",gesamt)' },
  'js-budgetprojekt': { inputs: [{ personen: 4, paketPreis: 6, versand: 3, budget: 40 }, { personen: 7, paketPreis: 5, versand: 2, budget: 50 }, { personen: 3, paketPreis: 9, versand: 4, budget: 20 }], probe: 'materialKosten === personen * paketPreis && gesamtKosten === materialKosten + versand && restBudget === budget - gesamtKosten && check(0,"number",materialKosten) && check(1,"number",gesamtKosten) && check(2,"number",restBudget)' },
};
