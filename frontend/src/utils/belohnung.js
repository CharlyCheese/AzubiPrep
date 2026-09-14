// Zentrale Belohnungs-Hinweise (Phase 3): XP, Level-Up und Abzeichen.
// Alle Vergabestellen (Quiz, Pruefung, Tagesziel) nutzen diese Funktion,
// damit Abzeichen-Hinweise nicht an jeder Stelle einzeln gepflegt werden muessen.
import { badgeById } from './gamification.js';
import { toastStore } from '../store/toastStore.js';

/**
 * Meldet das Ergebnis von gamificationStore.addXp() als Toast(s).
 * @param {{gained:number,leveledUp:boolean,level:{level:number,titel:string},badges:string[]}} res
 * @param {string} praefix optionaler Anlass, z. B. 'Quiz abgeschlossen'
 * @returns {{message:string,typ:string}[]} die ausgeloesten Meldungen (fuer Tests)
 */
export function meldeBelohnung(res, praefix = '') {
  if (!res) return [];
  const meldungen = [];
  if (res.gained > 0) {
    meldungen.push({ message: `${praefix ? `${praefix}: ` : ''}+${res.gained} XP`, typ: 'xp' });
  }
  if (res.leveledUp) {
    meldungen.push({ message: `Level ${res.level.level}: ${res.level.titel}!`, typ: 'level' });
  }
  for (const id of res.badges || []) {
    const badge = badgeById(id);
    if (badge) meldungen.push({ message: `Abzeichen: ${badge.symbol} ${badge.titel}`, typ: 'badge' });
  }
  meldungen.forEach((m) => toastStore.push(m.message, m.typ));
  return meldungen;
}