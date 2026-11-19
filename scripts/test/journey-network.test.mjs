import test from 'node:test';
import assert from 'node:assert/strict';
import { createNetwork, validNetwork, updateNetwork, probeNetwork, networkPassed, initialProbe } from '../../frontend/src/utils/journeyNetwork.js';

function finish(network, i, ip = '192.0.2.20') {
  let state = updateNetwork(network, { type: 'test' });
  for (const [field, value] of Object.entries({ linked: true, ip, prefix: '24', gateway: '192.0.2.1', dns: '192.0.2.53', diagnosis: ['link', 'address', 'dns'][i] })) state = updateNetwork(state, { type: 'configure', field, value });
  return updateNetwork(updateNetwork(state, { type: 'test' }), { type: 'finish' });
}

test('Drei unabhängige Störungen liefern Link-, Adress- und DNS-Befunde', () => {
  const state = createNetwork(); assert.equal(validNetwork(state), true);
  assert.deepEqual(state.cases.map(c => probeNetwork(c).failure), ['link', 'address', 'dns']);
  assert.equal(initialProbe(0).checks[1].skipped, true);
  assert.equal(initialProbe(2).ipReachable, true);
  assert.equal(initialProbe(2).passed, false);
});
test('Erst beobachten, dann ändern, richtig einordnen und erneut prüfen', () => {
  let state = createNetwork();
  assert.throws(() => updateNetwork(state, { type: 'configure', field: 'linked', value: true }));
  assert.throws(() => updateNetwork(state, { type: 'finish' }));
  state = updateNetwork(state, { type: 'test' });
  state = updateNetwork(state, { type: 'configure', field: 'linked', value: true });
  assert.equal(state.cases[0].checked, false);
  state = updateNetwork(state, { type: 'test' });
  assert.equal(probeNetwork(state.cases[0]).passed, true);
  assert.throws(() => updateNetwork(state, { type: 'finish' }));
  state = updateNetwork(state, { type: 'configure', field: 'diagnosis', value: 'dns' });
  state = updateNetwork(state, { type: 'test' });
  assert.throws(() => updateNetwork(state, { type: 'finish' }));
  state = updateNetwork(state, { type: 'configure', field: 'diagnosis', value: 'link' });
  assert.throws(() => updateNetwork(state, { type: 'finish' }));
  state = updateNetwork(state, { type: 'test' });
  assert.equal(updateNetwork(state, { type: 'finish' }).index, 1);
});
test('Alle freien /24-Hostadressen funktionieren; belegte, Netz-/Broadcast- und fremde Adressen scheitern', () => {
  const base = { ...createNetwork().cases[0], linked: true };
  for (let host = 0; host <= 255; host++) assert.equal(probeNetwork({ ...base, ip: `192.0.2.${host}` }).passed, host >= 2 && host <= 254 && ![10, 53].includes(host), String(host));
  for (const ip of ['', '192.0.2.020', '192.0.2.256', '198.51.100.25', '999.0.2.20', '192.0.2', '192.0.2.20.1']) assert.equal(probeNetwork({ ...base, ip }).passed, false);
  for (const prefix of ['25', '26']) assert.equal(probeNetwork({ ...base, prefix }).failure, 'address');
  assert.equal(probeNetwork({ ...base, gateway: '192.0.2.2' }).failure, 'gateway');
});
test('Drei Fälle ergeben einen unveränderlichen Abschluss mit echten alternativen Adressen', () => {
  let state = createNetwork(); const old = JSON.stringify(state);
  state = finish(state, 0, '192.0.2.25'); assert.equal(state.cases[0].done, true);
  const first = JSON.stringify(state.cases[0]);
  state = finish(state, 1, '192.0.2.254'); state = finish(state, 2, '192.0.2.2');
  assert.equal(networkPassed(state), true); assert.equal(validNetwork(JSON.parse(JSON.stringify(state))), true);
  assert.equal(JSON.stringify(state.cases[0]), first); assert.equal(JSON.stringify(createNetwork()), old);
  assert.throws(() => updateNetwork(state, { type: 'test' }));
});
test('Unzulässige Fälle, übersprungene Schritte, freie Pfade und erfundene Abschlüsse werden abgewiesen', () => {
  const fresh = createNetwork(); const clone = () => structuredClone(fresh);
  for (const mutate of [s => s.extra = 1, s => s.index = 1, s => s.cases.pop(), s => s.cases[0].extra = 'secret', s => s.cases[0].ip = '../../secret', s => s.cases[0].linked = 'true', s => s.cases[0].checked = true, s => s.cases[1].observed = true, s => s.cases[0].done = true]) { const invalid = clone(); mutate(invalid); assert.equal(validNetwork(invalid), false); }
  const observed = updateNetwork(fresh, { type: 'test' });
  for (const action of [{ type: 'fetch' }, { type: 'configure', field: 'ip', value: 'fetch()' }, { type: 'configure', field: 'dns', value: '1'.repeat(16) }, { type: 'configure', field: 'prefix', value: '0' }, { type: 'configure', field: 'done', value: true }]) assert.throws(() => updateNetwork(observed, action));
});
