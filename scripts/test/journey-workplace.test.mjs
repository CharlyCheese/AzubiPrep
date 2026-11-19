import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkplace, validWorkplace, checkWorkplace, updateWorkplace, TEST_DOCUMENT } from '../../frontend/src/utils/journeyWorkplace.js';

function prepared(device = 'office') {
  let state = createWorkplace();
  for (const [field, value] of Object.entries({ device, software: 'approved', account: 'standard', displays: '2', updated: true })) state = updateWorkplace(state, { type: 'configure', field, value });
  for (const type of ['create-folder', 'create-file', 'open-file', 'check']) state = updateWorkplace(state, { type });
  return state;
}

test('Einrichtungsmodell startet leer; eine Bestätigung allein erfüllt den Bedarf nicht', () => {
  const value = createWorkplace();
  assert.equal(validWorkplace(value), true);
  assert.equal(checkWorkplace(value).passed, false);
  assert.equal(checkWorkplace({ ...value, checked: true }).passed, false);
  assert.equal(checkWorkplace(value).checks.filter(item => !item.passed).length, 6);
});

test('Zwei Geräte erfüllen denselben Bedarf; schwaches Gerät fällt trotz gleicher Bedienung durch', () => {
  for (const device of ['office', 'power']) {
    const state = prepared(device);
    assert.equal(checkWorkplace(state).passed, true);
    assert.equal(state.checked, true);
    assert.equal(validWorkplace(JSON.parse(JSON.stringify(state))), true);
  }
  const failed = checkWorkplace(prepared('compact'));
  assert.equal(failed.passed, false);
  assert.deepEqual(failed.checks.filter(item => !item.passed).map(item => item.label), ['Hardwarebedarf', 'Bildschirme']);
});

test('Software, Standardkonto, Updates und zwei Bildschirme werden getrennt geprüft', () => {
  for (const [field, value, label] of [['software', 'preview', 'Anwendung'], ['account', 'admin', 'Benutzerrechte'], ['updated', false, 'Aktualisierung'], ['displays', '1', 'Bildschirme']]) {
    const changed = updateWorkplace(prepared(), { type: 'configure', field, value });
    assert.equal(changed.checked, false);
    const result = checkWorkplace(changed);
    assert.equal(result.passed, false);
    assert.equal(result.checks.find(item => item.label === label).passed, false);
  }
});

test('Dateiarbeit verlangt Ordner, Anlegen und tatsächliches Öffnen innerhalb des Modells', () => {
  let state = createWorkplace();
  assert.throws(() => updateWorkplace(state, { type: 'create-file' }));
  assert.throws(() => updateWorkplace(state, { type: 'open-file' }));
  state = updateWorkplace(state, { type: 'create-folder' });
  state = updateWorkplace(state, { type: 'create-file' });
  assert.equal(checkWorkplace(state).checks.find(item => item.label === 'Dateiablage').passed, false);
  state = updateWorkplace(state, { type: 'open-file' });
  assert.equal(checkWorkplace(state).checks.find(item => item.label === 'Dateiablage').passed, true);
  assert.match(TEST_DOCUMENT, /ä ö ü ß/);
});

test('Jede Änderung verwirft den Prüfstatus; der vorherige Stand bleibt unverändert', () => {
  const old = prepared(); const original = JSON.stringify(old);
  const changed = updateWorkplace(old, { type: 'configure', field: 'device', value: 'power' });
  assert.equal(changed.checked, false);
  assert.equal(JSON.stringify(old), original);
  assert.equal(updateWorkplace(changed, { type: 'check' }).checked, true);
});

test('Fremde Felder, Freitextpfade, ausführbare Daten und widersprüchliche Dateischritte werden abgelehnt', () => {
  for (const value of [null, [], { ...createWorkplace(), extra: 1 }, { ...createWorkplace(), device: 'fetch()' }, { ...createWorkplace(), software: '../../secret' }, { ...createWorkplace(), checked: 'true' }, { ...createWorkplace(), file: true }, { ...createWorkplace(), opened: true }, { ...createWorkplace(), displays: 2 }]) assert.equal(validWorkplace(value), false);
  for (const action of [{ type: 'fetch' }, { type: 'configure', field: '__proto__', value: {} }, { type: 'configure', field: 'file', value: true }, { type: 'configure', field: 'account', value: 'root' }, { type: 'configure', field: 'updated', value: 1 }]) assert.throws(() => updateWorkplace(createWorkplace(), action));
});
