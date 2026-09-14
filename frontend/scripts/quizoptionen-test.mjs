// Test fuer die Quiz-Optionen: Filter, Anzahl, Umfang, Anzeige und Store.
const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
globalThis.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

const {
  ANZAHL_OPTIONEN,
  filtereNachSchwierigkeit,
  begrenzeAnzahl,
  anzahlAuswahl,
  quizUmfang,
  umfangLabel,
} = await import('../src/utils/quizOptionen.js');
const { quizOptionenStore } = await import('../src/store/localStore.js');

let fehler = 0;
const pruefe = (name, ist, soll) => { if (ist !== soll) { console.log(`FEHLER ${name}: ist=${ist} soll=${soll}`); fehler++; } };

const fragen = [];
for (let i = 0; i < 12; i++) {
  fragen.push({ id: `F${i}`, schwierigkeit: i < 5 ? 'leicht' : i < 9 ? 'mittel' : 'schwer' });
}

// Schwierigkeitsfilter
pruefe('alle ohne Filter', filtereNachSchwierigkeit(fragen, 'alle').length, 12);
pruefe('Filter leicht', filtereNachSchwierigkeit(fragen, 'leicht').length, 5);
pruefe('Filter mittel', filtereNachSchwierigkeit(fragen, 'mittel').length, 4);
pruefe('Filter schwer', filtereNachSchwierigkeit(fragen, 'schwer').length, 3);
pruefe('Filter ohne Angabe', filtereNachSchwierigkeit(fragen).length, 12);
pruefe('Filter leere Liste', filtereNachSchwierigkeit([], 'leicht').length, 0);

// Anzahl begrenzen
pruefe('alle Fragen', begrenzeAnzahl(fragen, 0).length, 12);
pruefe('fuenf Fragen', begrenzeAnzahl(fragen, 5).length, 5);
pruefe('mehr als vorhanden', begrenzeAnzahl(fragen, 99).length, 12);
pruefe('negativ bedeutet alle', begrenzeAnzahl(fragen, -3).length, 12);
pruefe('erste Frage bleibt vorne', begrenzeAnzahl(fragen, 1)[0].id, 'F0');

// Auswahlliste
pruefe('Auswahl bei 3', anzahlAuswahl(3).length, 0);
pruefe('Auswahl bei 12', anzahlAuswahl(12).join(','), '5,10');
pruefe('Auswahl bei 27', anzahlAuswahl(27).join(','), '5,10,15,20');
pruefe('Auswahl bei 60', anzahlAuswahl(60).join(','), ANZAHL_OPTIONEN.join(','));

// Umfang
const u1 = quizUmfang(fragen, { schwierigkeit: 'alle', anzahl: 0 });
pruefe('Umfang verfuegbar', u1.verfuegbar, 12);
pruefe('Umfang gestellt', u1.gestellt, 12);
pruefe('Umfang nicht begrenzt', u1.begrenzt, false);
const u2 = quizUmfang(fragen, { schwierigkeit: 'alle', anzahl: 5 });
pruefe('Umfang begrenzt gestellt', u2.gestellt, 5);
pruefe('Umfang begrenzt Flag', u2.begrenzt, true);
const u3 = quizUmfang(fragen, { schwierigkeit: 'schwer', anzahl: 10 });
pruefe('Umfang gefiltert verfuegbar', u3.verfuegbar, 3);
pruefe('Umfang gefiltert gestellt', u3.gestellt, 3);
pruefe('Umfang gefiltert Flag', u3.begrenzt, false);

// Label
pruefe('Label alle', umfangLabel(u1), '12 Fragen');
pruefe('Label begrenzt', umfangLabel(u2), '5 von 12 Fragen');
pruefe('Label leer', umfangLabel({ verfuegbar: 0, gestellt: 0 }), '');

// Store
pruefe('Store Standard Anzahl', quizOptionenStore.get().anzahl, 0);
pruefe('Store Standard Schwierigkeit', quizOptionenStore.get().schwierigkeit, 'alle');
quizOptionenStore.set({ anzahl: 10 });
pruefe('Store gespeichert', quizOptionenStore.get().anzahl, 10);
quizOptionenStore.set({ schwierigkeit: 'schwer' });
pruefe('Store ergaenzt', quizOptionenStore.get().schwierigkeit, 'schwer');
pruefe('Store behaelt Anzahl', quizOptionenStore.get().anzahl, 10);
quizOptionenStore.reset();
pruefe('Store zurueckgesetzt', quizOptionenStore.get().anzahl, 0);
pruefe('Store Standard nach Reset', quizOptionenStore.get().schwierigkeit, 'alle');

console.log(fehler === 0 ? 'QUIZ-OPTIONEN OK' : `${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);