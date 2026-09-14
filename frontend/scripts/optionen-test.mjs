// Prüft die Options-Mischung: Anzeige-Buchstabe muss korrekt auf den
// Original-Buchstaben zurückzeigen (wichtig für die richtige Auswertung).
// Aufruf: node scripts/optionen-test.mjs
import { mischeOptionen } from '../src/utils/optionen.js';

const optionen = ['Antwort A', 'Antwort B', 'Antwort C', 'Antwort D'];
let fehler = 0;

for (let i = 0; i < 300; i++) {
  // SC: richtige Lösung ist Original 'C'
  const sc = mischeOptionen({ typ: 'SC', optionen, antwort: 'c' });
  if (sc.liste.length !== 4) { console.log('FEHLER: SC Länge'); fehler++; break; }
  const eintragC = sc.liste.find((o) => o.original === 'C');
  if (!eintragC) { console.log('FEHLER: Original C fehlt'); fehler++; break; }
  if (sc.anzeigeZuOriginal[eintragC.buchstabe] !== 'C') { console.log('FEHLER: Mapping SC'); fehler++; break; }

  // MC: richtige Lösung Original 'A','C'
  const mc = mischeOptionen({ typ: 'MC', optionen, antwort: 'a,c' });
  const anzeigeA = mc.liste.find((o) => o.original === 'A');
  const anzeigeC = mc.liste.find((o) => o.original === 'C');
  if (!anzeigeA || !anzeigeC) { console.log('FEHLER: Original fehlt (MC)'); fehler++; break; }
  if (mc.anzeigeZuOriginal[anzeigeA.buchstabe] !== 'A' || mc.anzeigeZuOriginal[anzeigeC.buchstabe] !== 'C') {
    console.log('FEHLER: Mapping MC'); fehler++; break;
  }
}

console.log(fehler === 0 ? '✔ OPTIONEN-MISCHUNG OK (300 Durchläufe, SC & MC)' : `✘ ${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);
