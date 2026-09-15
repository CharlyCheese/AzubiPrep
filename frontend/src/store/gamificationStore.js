// Gamification-Store: XP + Ereignis-Log (Idempotenz). Stabiler Snapshot fuer
// useSyncExternalStore (wie notesStore).
import { levelAusXp, vergibBadges } from '../utils/gamification.js';
import { zaehlerErhoehen } from '../utils/missionen.js';

const PREFIX = 'azubiprep.';
const KEY = 'game';

let cache = null;
let raw = null;

function readGame() {
  let r = '{}';
  try { r = localStorage.getItem(PREFIX + KEY) || '{}'; } catch { r = '{}'; }
  if (r !== raw) {
    raw = r;
    try {
      const parsed = JSON.parse(r);
      cache = parsed && typeof parsed === 'object' ? parsed : {};
    } catch { cache = {}; }
    if (!cache.xp) cache.xp = 0;
    if (!cache.eventLog) cache.eventLog = {};
    if (!cache.badges) cache.badges = {};
    if (!cache.modulStatus) cache.modulStatus = {};
    if (!cache.missionen) cache.missionen = {};
    if (!cache.ziele) cache.ziele = { tag: 10, woche: 3 };
  }
  return cache;
}

function writeGame(game) {
  raw = JSON.stringify(game);
  cache = game;
  try { localStorage.setItem(PREFIX + KEY, raw); } catch { /* ignore */ }
}

function notify() {
  window.dispatchEvent(new Event('azubiprep-game'));
}

export const gamificationStore = {
  get() { return readGame(); },
  snapshot() { return readGame(); },
  subscribe(cb) {
    const handler = () => cb();
    window.addEventListener('azubiprep-game', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('azubiprep-game', handler);
      window.removeEventListener('storage', handler);
    };
  },
  addXp(key, menge) {
    const game = { ...readGame() };
    const vorLevel = levelAusXp(game.xp || 0).level;
    let gained = 0;
    if (menge > 0 && !game.eventLog[key]) {
      game.eventLog[key] = true;
      game.xp = (game.xp || 0) + menge;
      gained = menge;
    }
    // Abzeichen-Pruefung sitzt zentral hier (Phase 3), damit jede Vergabestelle sie nutzt.
    const badges = vergibBadges(game);
    const nachLevel = levelAusXp(game.xp || 0).level;
    if (gained > 0 || badges.length) {
      writeGame(game);
      notify();
    }
    return { gained, total: game.xp || 0, level: levelAusXp(game.xp || 0), leveledUp: nachLevel > vorLevel, badges };
  },
  /**
   * Missionen (Phase 4): Zaehler beider Perioden erhoehen und neu erledigte
   * Missionen mit ihrem XP-Betrag belohnen (idempotent ueber addXp).
   * @returns {{erledigt: object[], xp: {mission: object, res: object}[]}}
   */
  merkeMission(typ, menge = 1) {
    const game = { ...readGame() };
    const { missionen, erreicht, geaendert } = zaehlerErhoehen(game.missionen, typ, menge);
    if (!geaendert) return { erledigt: [], xp: [] };
    game.missionen = missionen;
    writeGame(game);
    const xp = erreicht.map((m) => ({ mission: m, res: this.addXp(`mission:${m.periodeKey}:${m.id}`, m.xp) }));
    notify();
    return { erledigt: erreicht, xp };
  },
  setZiele(ziele) {
    const game = { ...readGame() };
    game.ziele = { ...(game.ziele || {}), ...ziele };
    writeGame(game);
    notify();
    return game.ziele;
  },
  setModulStatus(modulStatus) {
    const game = { ...readGame() };
    game.modulStatus = modulStatus;
    writeGame(game);
    notify();
    return game.modulStatus;
  },
  reset() {
    writeGame({ xp: 0, eventLog: {}, badges: {}, modulStatus: {}, missionen: {}, ziele: { tag: 10, woche: 3 } });
    notify();
  },
  /** Kompletten Gamification-Stand ersetzen (z. B. beim Sync-Download). */
  replace(game) {
    writeGame(game && typeof game === 'object' ? game : {});
    notify();
  },
};