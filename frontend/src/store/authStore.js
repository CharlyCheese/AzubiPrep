// Auth-Store: Token + Nutzer in localStorage, reaktiv (gleiches
// Snapshot-Cache-Muster wie gamificationStore/notesStore, nötig für
// useSyncExternalStore). Login ist rein optional – ohne Login verhält sich
// die App wie bisher (reiner localStorage-Modus).
const PREFIX = 'azubiprep.';
const KEY = 'auth';

let cache = null;
let raw = null;

function readAuth() {
  let r = 'null';
  try { r = localStorage.getItem(PREFIX + KEY) || 'null'; } catch { r = 'null'; }
  if (r !== raw) {
    raw = r;
    try {
      const parsed = JSON.parse(r);
      cache = parsed && typeof parsed === 'object' ? parsed : null;
    } catch { cache = null; }
  }
  return cache;
}

function writeAuth(value) {
  raw = value ? JSON.stringify(value) : 'null';
  cache = value;
  try {
    if (value) localStorage.setItem(PREFIX + KEY, raw);
    else localStorage.removeItem(PREFIX + KEY);
  } catch { /* ignore */ }
}

function notify() {
  window.dispatchEvent(new Event('azubiprep-auth'));
}

export const authStore = {
  /** { token, user } oder null, wenn nicht eingeloggt. */
  get() {
    return readAuth();
  },
  snapshot() {
    return readAuth();
  },
  subscribe(cb) {
    const handler = () => cb();
    window.addEventListener('azubiprep-auth', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('azubiprep-auth', handler);
      window.removeEventListener('storage', handler);
    };
  },
  setSession(token, user) {
    writeAuth({ token, user });
    notify();
  },
  logout() {
    writeAuth(null);
    notify();
  },
  token() {
    return readAuth()?.token || null;
  },
};
