import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { abdeckungProzent, modulStatusEines, aktualisiereModulStatus, statusAnzeige } from '../src/utils/modulStatus.js';
import { baueLernreise, naechsteStation } from '../src/utils/lernreise.js';
import { gamificationStore } from '../src/store/gamificationStore.js';

const values = new Map();
globalThis.localStorage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
globalThis.window = { dispatchEvent() {} };
beforeEach(() => { gamificationStore.reset(); });

function progress(richtig, falsch = 0, modulId = 'M') {
  return Object.fromEntries(Array.from({ length: richtig + falsch }, (_, i) => [`${modulId}-${i}`, {
    modulId, letztesErgebnis: i < richtig, richtig: 25, falsch: 3,
  }]));
}

test('20 aus 100 zählen als 20 Prozent, nicht als ganzes Modul', () => {
  const s = modulStatusEines('M', progress(20), 100);
  assert.equal(s.abdeckung, 20);
  assert.equal(s.quote, 100);
  assert.equal(s.beherrschung, 20);
  assert.equal(s.beherrscht, false);
  assert.equal(statusAnzeige(s).label, 'in Bearbeitung');
  assert.equal(s.anzahl, 20); // Historische Versuchsanzahlen werden nicht addiert.
});

test('80 Prozent des Gesamtbestands müssen richtig sein', () => {
  assert.equal(modulStatusEines('M', progress(79, 21), 100).beherrscht, false);
  assert.equal(modulStatusEines('M', progress(80, 20), 100).beherrscht, true);
  assert.equal(modulStatusEines('M', progress(80), 100).beherrscht, true);
  assert.equal(modulStatusEines('M', progress(20), 20).beherrscht, true);
});

test('unbekannte Modulgröße ist keine Freigabe für Beherrschung', () => {
  for (const size of [0, undefined, NaN, -1, Infinity]) {
    assert.equal(modulStatusEines('M', progress(20), size).beherrscht, false);
  }
});

test('wachsende Kataloge werden anhand der neuen Größe bewertet', () => {
  const p = progress(20);
  assert.equal(modulStatusEines('M', p, 20).beherrscht, true);
  assert.equal(modulStatusEines('M', p, 100).beherrscht, false);
});

test('Rundung erreicht weder 80 noch 100 Prozent vorzeitig', () => {
  assert.equal(modulStatusEines('M', progress(199), 250).beherrscht, false);
  assert.equal(modulStatusEines('M', progress(199), 250).beherrschung, 79);
  assert.equal(abdeckungProzent(249, 250), 99);
  assert.equal(abdeckungProzent(250, 250), 100);
  assert.equal(abdeckungProzent(29, 100), 29);
});

test('Lernreise lässt teilweise richtige Station als nächste Station offen', () => {
  const status = { M: modulStatusEines('M', progress(20), 100) };
  const reise = baueLernreise([{ modul_id: 'M', fachrichtung: 'FIAE', fragenAnzahl: 100, lernfeld: 'LF12a' }], 'FIAE', status);
  assert.equal(reise.fortschritt.beherrscht, 0);
  assert.equal(naechsteStation(reise).modulId, 'M');
  assert.equal(reise.alle[0].beherrschung, 20);
});

test('alter falscher Status wird korrigiert und bekannte andere Modulgröße erhalten', () => {
  gamificationStore.setModulStatus({
    M: { bearbeitet: true, beherrscht: true, anzahl: 20, richtig: 20, gesamt: 100 },
    N: { bearbeitet: true, beherrscht: true, anzahl: 20, richtig: 20, gesamt: 20 },
  });
  aktualisiereModulStatus({ ...progress(20), ...progress(20, 0, 'N') }, (id) => id, (id) => id === 'M' ? 100 : 0);
  assert.equal(gamificationStore.get().modulStatus.M.beherrscht, false);
  assert.equal(gamificationStore.get().modulStatus.N.beherrscht, true);
});
