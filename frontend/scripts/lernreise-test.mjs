// Test fuer die Lernreise (Phase 5): Stationen, Fortschritt, naechste Station, Uebersicht.
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
  baueLernreise,
  baueStation,
  fortschritt,
  naechsteStation,
  fachrichtungsUebersicht,
  GRUPPE_FACHRICHTUNG,
  GRUPPE_GEMEINSAM,
  GRUPPEN_ANZEIGE,
} = await import('../src/utils/lernreise.js');

let fehler = 0;
const pruefe = (name, ist, soll) => { if (ist !== soll) { console.log(`FEHLER ${name}: ist=${ist} soll=${soll}`); fehler++; } };

const module = [
  { modul_id: 'WISO', titel: 'WiSo', beschreibung: 'Basis', fachrichtung: 'ALLE', fragenAnzahl: 16 },
  { modul_id: 'PM', titel: 'Projektmanagement', beschreibung: 'Basis', fachrichtung: 'ALLE', fragenAnzahl: 12 },
  { modul_id: 'FIAE-A', titel: 'FIAE A', fachrichtung: 'FIAE', fragenAnzahl: 10 },
  { modul_id: 'FIAE-B', titel: 'FIAE B', fachrichtung: 'FIAE', fragenAnzahl: 10 },
  { modul_id: 'FISI-A', titel: 'FISI A', fachrichtung: 'FISI', fragenAnzahl: 10 },
];
const statusMap = {
  'FIAE-A': { bearbeitet: true, anzahl: 10, richtig: 9, quote: 90, beherrscht: true },
  WISO: { bearbeitet: true, anzahl: 4, richtig: 2, quote: 50, beherrscht: false },
};

pruefe('Anzeige Fachrichtung', GRUPPEN_ANZEIGE[GRUPPE_FACHRICHTUNG], 'Deine Fachrichtung');
pruefe('Anzeige gemeinsam', GRUPPEN_ANZEIGE[GRUPPE_GEMEINSAM], 'Gemeinsame Module (alle Fachrichtungen)');

const reise = baueLernreise(module, 'FIAE', statusMap);
pruefe('Stationen FIAE', reise.stationen.length, 2);
pruefe('Gemeinsame Stationen', reise.gemeinsam.length, 2);
pruefe('Alle Stationen', reise.alle.length, 4);
pruefe('Nummerierung', reise.stationen.map((s) => s.nummer).join(','), '1,2');
pruefe('Nummerierung gemeinsam', reise.gemeinsam.map((s) => s.nummer).join(','), '1,2');
pruefe('Gruppe gesetzt', reise.gemeinsam[0].gruppe, GRUPPE_GEMEINSAM);
pruefe('Status beherrscht', reise.stationen[0].stufe, 'beherrscht');
pruefe('Status offen', reise.stationen[1].stufe, 'offen');
pruefe('Anzeige-Label offen', reise.stationen[1].anzeige.label, 'offen');
pruefe('keine Fremd-Fachrichtung', reise.alle.some((s) => s.fachrichtung === 'FISI'), false);
pruefe('Fortschritt gesamt', reise.fortschritt.gesamt, 4);
pruefe('Fortschritt bearbeitet', reise.fortschritt.bearbeitet, 2);
pruefe('Fortschritt beherrscht', reise.fortschritt.beherrscht, 1);
pruefe('Prozent beherrscht', reise.fortschritt.prozentBeherrscht, 25);
pruefe('Prozent bearbeitet', reise.fortschritt.prozentBearbeitet, 50);
pruefe('Quote durchgereicht', reise.gemeinsam[0].quote, 50);
pruefe('bearbeitet-Flag', reise.gemeinsam[0].bearbeitet, true);
pruefe('Beschreibung durchgereicht', reise.gemeinsam[0].beschreibung, 'Basis');

pruefe('naechste Station', naechsteStation(reise).modulId, 'FIAE-B');
pruefe('naechste Station ohne Reise', naechsteStation(null), null);

const alleBeherrscht = baueLernreise(module, 'FIAE', {
  'FIAE-A': { bearbeitet: true, beherrscht: true },
  'FIAE-B': { bearbeitet: true, beherrscht: true },
  WISO: { bearbeitet: true, beherrscht: true },
  PM: { bearbeitet: true, beherrscht: true },
});
pruefe('alles beherrscht - keine Station', naechsteStation(alleBeherrscht), null);
pruefe('Prozent 100', alleBeherrscht.fortschritt.prozentBeherrscht, 100);

const uebersicht = fachrichtungsUebersicht(
  module,
  statusMap,
  [{ code: 'FIAE', name: 'Anwendungsentwicklung' }, { code: 'FISI', name: 'Systemintegration' }],
);
pruefe('Uebersicht Anzahl', uebersicht.length, 2);
pruefe('Uebersicht Codes', uebersicht.map((u) => u.code).join(','), 'FIAE,FISI');
pruefe('Uebersicht Name', uebersicht[0].name, 'Anwendungsentwicklung');
pruefe('Uebersicht FIAE beherrscht', uebersicht[0].beherrscht, 1);
pruefe('Uebersicht FIAE gesamt', uebersicht[0].gesamt, 4);
pruefe('Uebersicht FISI beherrscht', uebersicht[1].beherrscht, 0);
pruefe('Uebersicht aus Modulen', fachrichtungsUebersicht(module, statusMap).map((u) => u.code).join(','), 'FIAE,FISI');

// Robustheit
pruefe('leere Modulliste', baueLernreise([], 'FIAE', {}).fortschritt.gesamt, 0);
pruefe('ohne Statusargument', baueLernreise(module, 'FIAE').fortschritt.bearbeitet, 0);
pruefe('Einzelstation ohne Status', baueStation(module[2], 1, GRUPPE_FACHRICHTUNG).stufe, 'offen');
pruefe('Fortschritt ohne Argumente', fortschritt().gesamt, 0);
pruefe('Prozent ohne Module', fortschritt([], {}).prozentBeherrscht, 0);
pruefe('Uebersicht ohne Fachrichtungsliste', fachrichtungsUebersicht(module, statusMap).length, 2);

// Abdeckung je Station: Fortschritt bezogen auf alle Fragen des Moduls
pruefe('Station gesamt', reise.stationen[0].gesamt, 10);
pruefe('Station abdeckung', reise.stationen[0].abdeckung, 100);
pruefe('Station ohne Aktivitaet Abdeckung', reise.stationen[1].abdeckung, 0);
pruefe('gemeinsame Station gesamt', reise.gemeinsam[0].gesamt, 16);
pruefe('gemeinsame Station Abdeckung', reise.gemeinsam[0].abdeckung, 25);
pruefe('Station ohne Gesamtangabe', baueStation({ modul_id: 'X', titel: 'X', fachrichtung: 'FIAE' }, 1).abdeckung, 0);

console.log(fehler === 0 ? 'LERNREISE OK' : `${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);