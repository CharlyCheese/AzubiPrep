import test from 'node:test';
import assert from 'node:assert/strict';
import { baueLernreise, naechsteStation } from '../../frontend/src/utils/lernreise.js';
import { gruppiereNachLernfeld } from '../../frontend/src/utils/lernfeldOrdnung.js';

const modules = [
  { modul_id: 'NET', fachrichtung: 'ALLE', lernfeld: 'LF3/LF9' },
  { modul_id: 'WISO', fachrichtung: 'ALLE', lernfeld: 'KEIN_LF' },
  { modul_id: 'CODE', fachrichtung: 'FIAE', lernfeld: 'LF10a' },
  { modul_id: 'PM', fachrichtung: 'ALLE', lernfeld: 'KEIN_LF' },
  { modul_id: 'BASE', fachrichtung: 'ALLE', lernfeld: 'LF1' },
  { modul_id: 'PC', fachrichtung: 'ALLE', lernfeld: 'LF2' },
  { modul_id: 'OTHER', fachrichtung: 'ALLE', lernfeld: '' },
  { modul_id: 'ADMIN', fachrichtung: 'FISI', lernfeld: 'LF10b' },
].map(item => ({ ...item, titel: item.modul_id, fragenAnzahl: 10 }));

test('Lernweg ordnet WISO und PM hinter LF1 ein, ohne offizielle Modulzuordnungen zu verändern', () => {
  const original = JSON.stringify(modules);
  const trip = baueLernreise(modules);
  assert.deepEqual(trip.gruppen.map(g => g.lernfeld), ['LF1', 'WISO', 'PM', 'LF2', 'LF3/LF9', 'LF10a', 'KEIN_LF']);
  assert.deepEqual(trip.alle.map(s => s.nummer), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(trip.fortschritt.gesamt, 7);
  assert.equal(JSON.stringify(modules), original);
  assert.equal(gruppiereNachLernfeld(modules).find(g => g.lernfeld === 'KEIN_LF').module.length, 3);
});

test('Fortsetzen und aufzuklappende Gruppe folgen LF1, WISO, PM und LF2', () => {
  const status = {};
  for (const [id, group] of [['BASE', 'LF1'], ['WISO', 'WISO'], ['PM', 'PM'], ['PC', 'LF2']]) {
    const next = naechsteStation(baueLernreise(modules, 'FIAE', status));
    assert.equal(next.modulId, id);
    assert.equal(next.lernfeld, group);
    status[id] = { beherrscht: true, bearbeitet: true };
  }
});

test('Fehlende Etappen, andere Fachrichtung und leere Liste bleiben nutzbar', () => {
  const withoutLF1 = baueLernreise(modules.filter(m => m.modul_id !== 'BASE'), 'FISI');
  assert.deepEqual(withoutLF1.gruppen.map(g => g.lernfeld), ['WISO', 'PM', 'LF2', 'LF3/LF9', 'LF10b', 'KEIN_LF']);
  const withoutExtra = baueLernreise(modules.filter(m => !['WISO', 'PM'].includes(m.modul_id)));
  assert.deepEqual(withoutExtra.gruppen.map(g => g.lernfeld), ['LF1', 'LF2', 'LF3/LF9', 'LF10a', 'KEIN_LF']);
  assert.equal(naechsteStation(baueLernreise([])), null);
});
