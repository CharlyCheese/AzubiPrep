// Test fuer die Missionen (Phase 4): Perioden-Keys, Zaehler, Anzeige, Belohnung.
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
  MISSIONEN,
  MISSIONSTYPEN,
  PERIODE_TAG,
  PERIODE_WOCHE,
  periodeKey,
  periodeKeyTag,
  periodeKeyWoche,
  leereZaehler,
  zaehlerErhoehen,
  missionenMitStatus,
  missionById,
  meldeMissionen,
} = await import('../src/utils/missionen.js');
const { gamificationStore } = await import('../src/store/gamificationStore.js');

let fehler = 0;
const pruefe = (name, ist, soll) => { if (ist !== soll) { console.log(`FEHLER ${name}: ist=${ist} soll=${soll}`); fehler++; } };

// Konfiguration
pruefe('Anzahl Missionen', MISSIONEN.length, 8);
pruefe('IDs eindeutig', new Set(MISSIONEN.map((m) => m.id)).size, MISSIONEN.length);
pruefe('Missionen vollstaendig', MISSIONEN.every((m) => m.titel && m.beschreibung && m.ziel > 0 && m.xp > 0 && MISSIONSTYPEN.includes(m.typ)), true);
pruefe('Tagesmissionen', MISSIONEN.filter((m) => m.periode === PERIODE_TAG).length, 3);
pruefe('Wochenmissionen', MISSIONEN.filter((m) => m.periode === PERIODE_WOCHE).length, 5);
pruefe('missionById unbekannt', missionById('gibt-es-nicht'), null);

// Perioden-Keys (Montag = Wochenstart)
const montag = new Date('2026-09-14T10:00:00');
pruefe('Tag-Key', periodeKeyTag(montag), '2026-09-14');
pruefe('Wochen-Key Montag', periodeKeyWoche(montag), '2026-09-14');
pruefe('Wochen-Key Sonntag', periodeKeyWoche(new Date('2026-09-20T10:00:00')), '2026-09-14');
pruefe('Wochen-Key naechster Montag', periodeKeyWoche(new Date('2026-09-21T10:00:00')), '2026-09-21');
pruefe('periodeKey Tag', periodeKey(PERIODE_TAG, montag), '2026-09-14');
pruefe('leere Zaehler Anzahl', Object.keys(leereZaehler()).length, MISSIONSTYPEN.length);
pruefe('leere Zaehler Werte', Object.values(leereZaehler()).every((v) => v === 0), true);

// Zaehler beider Perioden
let s = zaehlerErhoehen({}, 'frage', 4, montag);
pruefe('Tag-Zaehler nach 4', s.missionen.tag.zaehler.frage, 4);
pruefe('Wochen-Zaehler nach 4', s.missionen.woche.zaehler.frage, 4);
pruefe('noch keine Mission erledigt', s.erreicht.length, 0);
s = zaehlerErhoehen(s.missionen, 'frage', 1, montag);
pruefe('Tagesmission erreicht', s.erreicht.map((m) => m.id).join(','), 'tag-fragen-5');
pruefe('Mission markiert', typeof s.missionen.tag.erledigt['tag-fragen-5'], 'string');
pruefe('Mission nicht doppelt', zaehlerErhoehen(s.missionen, 'frage', 5, montag).erreicht.length, 0);

const w = zaehlerErhoehen({}, 'richtig', 15, montag);
pruefe('Tages- und Wochenmission erreicht', w.erreicht.map((m) => m.id).join(','), 'tag-richtig-3,woche-richtig-15');

// Periodenwechsel setzt zurueck
const nachWechsel = zaehlerErhoehen(w.missionen, 'frage', 1, new Date('2026-09-15T09:00:00'));
pruefe('Tag-Zaehler zurueckgesetzt', nachWechsel.missionen.tag.zaehler.frage, 1);
pruefe('Tag-Key neu', nachWechsel.missionen.tag.key, '2026-09-15');
pruefe('Wochen-Zaehler bleibt', nachWechsel.missionen.woche.zaehler.richtig, 15);
pruefe('Wochen-Zaehler zurueckgesetzt', zaehlerErhoehen(w.missionen, 'frage', 1, new Date('2026-09-21T09:00:00')).missionen.woche.zaehler.richtig, 0);
pruefe('kein Zaehler ohne Typ', zaehlerErhoehen({}, '', 1, montag).geaendert, false);

// Anzeige
const status = missionenMitStatus(s.missionen, montag);
pruefe('Anzeige Liste vollstaendig', status.liste.length, MISSIONEN.length);
pruefe('Anzeige Tag und Woche', status.tag.length + status.woche.length, MISSIONEN.length);
const fragen5 = status.tag.find((m) => m.id === 'tag-fragen-5');
pruefe('erreicht geflaggt', fragen5.erreicht, true);
pruefe('Fortschritt gedeckelt', fragen5.ist, 5);
const quizMission = status.tag.find((m) => m.id === 'tag-quiz-1');
pruefe('offene Mission', quizMission.erreicht, false);
pruefe('offene Mission Fortschritt', quizMission.fortschritt, 0);

// Store-Integration (Belohnung + Idempotenz)
const r1 = gamificationStore.merkeMission('quiz');
pruefe('Store: Mission erledigt', r1.erledigt.length, 1);
pruefe('Store: XP vergeben', r1.xp[0].res.gained, 20);
pruefe('Store: XP gesamt', gamificationStore.get().xp, 20);
const r2 = gamificationStore.merkeMission('quiz');
pruefe('Store: keine Doppelbelohnung', r2.xp.length, 0);
pruefe('Store: XP unveraendert', gamificationStore.get().xp, 20);
pruefe('Store: Zaehler erhoeht', gamificationStore.get().missionen.tag.zaehler.quiz, 2);
meldeMissionen(r1);
pruefe('Meldung ohne Fehler', true, true);

console.log(fehler === 0 ? 'MISSIONEN OK' : `${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);