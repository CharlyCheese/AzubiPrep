// Test fuer den Modul-Status (bearbeitet / beherrscht ab 80 Prozent).
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
  modulStatusAusFortschritt,
  modulStatusEines,
  modulStufe,
  statusAnzeige,
  aktualisiereModulStatus,
  meldeModulStatus,
  abdeckungProzent,
  leerenModulStatus,
} = await import('../src/utils/modulStatus.js');
const { gamificationStore } = await import('../src/store/gamificationStore.js');

let fehler = 0;
const pruefe = (name, ist, soll) => { if (ist !== soll) { console.log(`FEHLER ${name}: ist=${ist} soll=${soll}`); fehler++; } };

// M1: 4 richtig / 1 falsch = 80 % -> beherrscht; M2: 1 richtig / 4 = 25 % -> nur bearbeitet
const fortschritt = {
  a: { modulId: 'M1', letztesErgebnis: true },
  b: { modulId: 'M1', letztesErgebnis: true },
  c: { modulId: 'M1', letztesErgebnis: true },
  d: { modulId: 'M1', letztesErgebnis: true },
  e: { modulId: 'M1', letztesErgebnis: false },
  f: { modulId: 'M2', letztesErgebnis: true },
  g: { modulId: 'M2', letztesErgebnis: false },
  h: { modulId: 'M2', letztesErgebnis: false },
  i: { modulId: 'M2', letztesErgebnis: false },
};
const map = modulStatusAusFortschritt(fortschritt);
pruefe('M1 Quote', map.M1.quote, 80);
pruefe('M1 beherrscht', map.M1.beherrscht, true);
pruefe('M1 Anzahl', map.M1.anzahl, 5);
pruefe('M1 richtig', map.M1.richtig, 4);
pruefe('M2 Quote', map.M2.quote, 25);
pruefe('M2 nicht beherrscht', map.M2.beherrscht, false);
pruefe('M2 bearbeitet', map.M2.bearbeitet, true);
pruefe('leerer Fortschritt', Object.keys(modulStatusAusFortschritt({})).length, 0);
pruefe('unbekanntes Modul', modulStatusEines('M9', fortschritt).beherrscht, false);
pruefe('Stufe M1', modulStufe(map.M1), 'beherrscht');
pruefe('Stufe M2', modulStufe(map.M2), 'bearbeitet');
pruefe('Stufe offen', modulStufe(undefined), 'offen');
pruefe('Anzeige-Klasse beherrscht', statusAnzeige(map.M1).klasse, 'badge-leicht');
pruefe('Anzeige-Label offen', statusAnzeige(null).label, 'offen');

// Persistenz + Meldungen
const erst = aktualisiereModulStatus(fortschritt, (id) => `Titel ${id}`);
pruefe('beherrscht gemeldet', erst.neuBeherrscht.map((m) => m.modulId).join(','), 'M1');
pruefe('bearbeitet gemeldet', erst.neuBearbeitet.map((m) => m.modulId).join(','), 'M2');
pruefe('Titel aufgeloest', erst.neuBeherrscht[0].titel, 'Titel M1');
pruefe('Status gespeichert', gamificationStore.get().modulStatus.M1.beherrscht, true);
pruefe('Zeitstempel gesetzt', typeof gamificationStore.get().modulStatus.M1.am, 'string');
const zweit = aktualisiereModulStatus(fortschritt);
pruefe('zweite Pruefung meldet nichts', zweit.neuBeherrscht.length + zweit.neuBearbeitet.length, 0);
meldeModulStatus(erst);
pruefe('Meldungen ohne Fehler', true, true);

// Abdeckung: Fortschritt immer bezogen auf die maximale Fragenzahl des Moduls
pruefe('abdeckungProzent 5 von 10', abdeckungProzent(5, 10), 50);
pruefe('abdeckungProzent ohne Gesamt', abdeckungProzent(5, 0), 0);
pruefe('abdeckungProzent gedeckelt', abdeckungProzent(20, 10), 100);

const mitGesamt = modulStatusAusFortschritt(fortschritt, (id) => (id === 'M1' ? 10 : 4));
pruefe('gesamt aus gesamtVon', mitGesamt.M1.gesamt, 10);
pruefe('abdeckung M1', mitGesamt.M1.abdeckung, 50);
pruefe('abdeckung M2', mitGesamt.M2.abdeckung, 100);
pruefe('ohne gesamtVon gesamt null', modulStatusAusFortschritt(fortschritt).M1.gesamt, null);
pruefe('ohne gesamtVon abdeckung null', modulStatusAusFortschritt(fortschritt).M1.abdeckung, null);
pruefe('modulStatusEines mit Gesamt', modulStatusEines('M1', fortschritt, 10).abdeckung, 50);
pruefe('leerer Status Gesamt', modulStatusEines('M9', fortschritt, 20).gesamt, 20);
pruefe('leerer Status Abdeckung', modulStatusEines('M9', fortschritt, 20).abdeckung, 0);
pruefe('leerer Status ohne Gesamt', modulStatusEines('M9', fortschritt).gesamt, null);
pruefe('leerenModulStatus ohne Gesamt', leerenModulStatus().abdeckung, null);

console.log(fehler === 0 ? 'MODUL-STATUS OK' : `${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);