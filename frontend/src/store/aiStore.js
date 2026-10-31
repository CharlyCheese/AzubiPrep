import { create } from './miniStore.js';

const KEY = 'azubiprep.ai.settings.v1';
const defaults = { version: 2, provider: 'none', qwenModel: 'qwen3:4b', chatgptModel: '' };
const valid = value => value?.version === 2 && ['none', 'qwen', 'chatgpt'].includes(value.provider) && /^qwen[a-z0-9._-]*:[a-z0-9._-]{1,48}$/i.test(value.qwenModel) && !/cloud/i.test(value.qwenModel) && typeof value.chatgptModel === 'string' && /^(?:[a-zA-Z0-9._:-]{1,80})?$/.test(value.chatgptModel);
const migrate = value => value?.version === 1 && typeof value.enabled === 'boolean' && typeof value.model === 'string' ? { ...defaults, provider: value.enabled ? 'qwen' : 'none', qwenModel: value.model } : value;
const expanded = value => ({ ...value, enabled: value.provider !== 'none', model: value.provider === 'chatgpt' ? value.chatgptModel : value.qwenModel });
let initial = defaults;
try { const saved = migrate(JSON.parse(localStorage.getItem(KEY))); if (valid(saved)) initial = saved; } catch { /* Freiwillige Hilfe bleibt ausgeschaltet. */ }
const store = create({ ...expanded(initial), accountRevision: 0, storageError: '' });
let revision = 0;
const native = window.azubiDesktop?.loadAiPreferences && window.azubiDesktop?.saveAiPreferences;
if (native) {
  store.setState(expanded(defaults));
  window.azubiDesktop.loadAiPreferences().then(saved => { const value = migrate(saved); if (revision === 0 && valid(value)) store.setState(expanded(value)); })
    .catch(() => store.setState({ storageError: 'KI-Einstellungen konnten nicht geladen werden. Die Lernbegleitung bleibt zunächst ausgeschaltet.' }));
}
export const aiStore = {
  useStore: store.useStore,
  get: store.getState,
  accountChanged() { store.setState({ accountRevision: store.getState().accountRevision + 1 }); },
  async set(change) {
    revision++;
    const previous = store.getState();
    const next = { ...previous, ...change, version: 2 };
    if (change.enabled !== undefined && change.provider === undefined) next.provider = change.enabled ? 'qwen' : 'none';
    if (change.model !== undefined) next[next.provider === 'chatgpt' ? 'chatgptModel' : 'qwenModel'] = change.model;
    const value = { version: 2, provider: next.provider, qwenModel: next.qwenModel, chatgptModel: next.chatgptModel };
    if (!valid(value)) return;
    store.setState({ ...expanded(value), storageError: '' });
    try {
      if (native) await window.azubiDesktop.saveAiPreferences(value);
      else localStorage.setItem(KEY, JSON.stringify(value));
    } catch { store.setState({ storageError: 'KI-Einstellungen konnten nicht dauerhaft gespeichert werden.' }); }
  },
  reset: () => aiStore.set(defaults),
};
