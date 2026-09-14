// Tages- und Wochenziele (Phase 2) – baut auf activityStore auf.
import { activityStore, todayKey } from '../store/localStore.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { XP_REGELN, ZIELE_STANDARD } from './gamification.js';
import { meldeBelohnung } from './belohnung.js';
import { meldeMissionen } from './missionen.js';

const pad = (n) => String(n).padStart(2, '0');
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Montag der laufenden Woche. */
export function wochenStartKey(datum = new Date()) {
  const d = new Date(datum);
  const offset = (d.getDay() + 6) % 7; // Montag = 0
  d.setDate(d.getDate() - offset);
  return key(d);
}

function zieleStand() {
  const z = gamificationStore.get().ziele;
  return z && typeof z === 'object' ? z : ZIELE_STANDARD;
}

/** Tagesziel: { ist, ziel, prozent, erreicht } */
export function tagesFortschritt() {
  const ziel = zieleStand().tag;
  const ist = activityStore.get()[todayKey()] || 0;
  return { ist, ziel, prozent: ziel ? Math.min(100, Math.round((ist / ziel) * 100)) : 0, erreicht: ist >= ziel };
}

/** Wochenziel (aktive Tage): { ist, ziel, prozent, erreicht, tage } */
export function wochenFortschritt(datum = new Date()) {
  const ziel = zieleStand().woche;
  const aktivitaet = activityStore.get();
  const start = new Date(`${wochenStartKey(datum)}T12:00:00`);
  const tage = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const k = key(d);
    tage.push({ key: k, aktiv: (aktivitaet[k] || 0) > 0 });
  }
  const ist = tage.filter((t) => t.aktiv).length;
  return { ist, ziel, prozent: ziel ? Math.min(100, Math.round((ist / ziel) * 100)) : 0, erreicht: ist >= ziel, tage };
}

/** Vergibt das Tagesziel-XP einmalig pro Tag (idempotent). */
export function pruefeTagesziel() {
  if (!tagesFortschritt().erreicht) return;
  const res = gamificationStore.addXp(`tagesziel:${todayKey()}`, XP_REGELN.tagesziel);
  meldeBelohnung(res, 'Tagesziel erreicht');
  // Mission (Phase 4): nur beim ersten Erreichen des Tagesziels zaehlen
  if (res.gained > 0) meldeMissionen(gamificationStore.merkeMission('tagesziel'));
}