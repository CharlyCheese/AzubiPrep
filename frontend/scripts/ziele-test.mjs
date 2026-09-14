// Test fuer Tages-/Wochenziele (mit Browser-API-Stubs).
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

const { activityStore } = await import('../src/store/localStore.js');
const { gamificationStore } = await import('../src/store/gamificationStore.js');
const { tagesFortschritt, wochenFortschritt, pruefeTagesziel, wochenStartKey } = await import('../src/utils/ziele.js');

let fehler = 0;
const pruefe = (name, ist, soll) => { if (ist !== soll) { console.log(`FEHLER ${name}: ist=${ist} soll=${soll}`); fehler++; } };

pruefe('Tagesziel Zielwert', tagesFortschritt().ziel, 10);
pruefe('Tagesziel Start', tagesFortschritt().ist, 0);
activityStore.add(new Date().toISOString().slice(0, 10), 10);
pruefe('Tagesziel erreicht', tagesFortschritt().erreicht, true);
pruefe('Tagesziel Prozent', tagesFortschritt().prozent, 100);

pruefeTagesziel();
pruefe('Tagesziel-XP vergeben', gamificationStore.get().xp, 30);
pruefeTagesziel();
pruefe('Tagesziel-XP nicht doppelt', gamificationStore.get().xp, 30);

const w = wochenFortschritt();
pruefe('Wochenziel Zielwert', w.ziel, 3);
pruefe('Wochenziel 7 Tage', w.tage.length, 7);
pruefe('Wochenstart ist Montag', new Date(wochenStartKey() + 'T12:00:00').getDay(), 1);

console.log(fehler === 0 ? 'ZIELE OK' : `${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);