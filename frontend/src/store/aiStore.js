import { create } from './miniStore.js';

const KEY = 'azubiprep.ai.settings.v1';
const defaults = { version: 1, enabled: false, model: 'qwen3:4b' };
const valid = value => value?.version === 1 && typeof value.enabled === 'boolean' && typeof value.model === 'string' && /^qwen[a-z0-9._-]*:[a-z0-9._-]{1,48}$/i.test(value.model) && !/cloud/i.test(value.model);
let initial = defaults;
try { const saved = JSON.parse(localStorage.getItem(KEY)); if (valid(saved)) initial = saved; } catch { /* Freiwillige Hilfe bleibt ausgeschaltet. */ }
const store = create({ ...initial, storageError: '' });
let revision = 0;
const native = window.azubiDesktop?.loadAiPreferences && window.azubiDesktop?.saveAiPreferences;
if (native) {
  store.setState(defaults);
  window.azubiDesktop.loadAiPreferences().then(saved => { if (revision === 0 && valid(saved)) store.setState(saved); })
    .catch(() => store.setState({ storageError: 'KI-Einstellungen konnten nicht geladen werden. Die Lernbegleitung bleibt zunächst ausgeschaltet.' }));
}
export const aiStore = {
  useStore: store.useStore,
  get: store.getState,
  async set(change) {
    revision++;
    const next = { ...store.getState(), ...change, version: 1 };
    const value = { version: 1, enabled: next.enabled, model: next.model };
    if (!valid(value)) return;
    store.setState({ ...value, storageError: '' });
    try {
      if (native) await window.azubiDesktop.saveAiPreferences(value);
      else localStorage.setItem(KEY, JSON.stringify(value));
    } catch { store.setState({ storageError: 'KI-Einstellungen konnten nicht dauerhaft gespeichert werden.' }); }
  },
  reset: () => aiStore.set(defaults),
};
