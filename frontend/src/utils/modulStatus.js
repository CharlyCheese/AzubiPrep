// Modul-Status "bearbeitet" / "beherrscht" (Phase 3).
// Quelle der Wahrheit ist der lokale Lernfortschritt (progressStore): jeder
// Eintrag kennt sein Modul (modulId) und das letzte Ergebnis.
// Entscheidung aus dem Gamification-Plan: beherrscht ab BEHERRSCHT_AB Prozent
// Erfolgsquote (richtig / beantwortet) mit mindestens einer beantworteten Frage.
import { BEHERRSCHT_AB } from './gamification.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { toastStore } from '../store/toastStore.js';

export const MODUL_OFFEN = 'offen';
export const MODUL_BEARBEITET = 'bearbeitet';
export const MODUL_BEHERRSCHT = 'beherrscht';

/**
 * Deckungsgrad in Prozent: bearbeitete Fragen bezogen auf alle Fragen des Moduls.
 * Damit bezieht sich jede Fortschrittsanzeige auf die maximale Fragenzahl.
 */
export function abdeckungProzent(anzahl = 0, gesamt = 0) {
  const g = Number(gesamt) || 0;
  if (!g) return 0;
  return Math.min(100, Math.round(((Number(anzahl) || 0) / g) * 100));
}

/** Standardstatus eines Moduls ohne Lernaktivitaet. */
export function leerenModulStatus(gesamt = 0) {
  const g = Number(gesamt) || 0;
  return {
    bearbeitet: false,
    anzahl: 0,
    richtig: 0,
    falsch: 0,
    quote: 0,
    beherrscht: false,
    gesamt: g || null,
    abdeckung: g ? 0 : null,
  };
}

/**
 * Berechnet den Status je Modul:
 * { [modulId]: { bearbeitet, beherrscht, anzahl, richtig, falsch, quote, gesamt, abdeckung } }
 * @param {object} fortschritt progressStore.get()
 * @param {(modulId:string)=>number} gesamtVon Fragenzahl je Modul (optional)
 */
export function modulStatusAusFortschritt(fortschritt = {}, gesamtVon = () => 0) {
  const map = {};
  for (const eintrag of Object.values(fortschritt || {})) {
    const modulId = eintrag?.modulId || 'unbekannt';
    const s = map[modulId] || { bearbeitet: false, anzahl: 0, richtig: 0, falsch: 0, quote: 0, beherrscht: false };
    s.anzahl += 1;
    if (eintrag.letztesErgebnis === true) s.richtig += 1;
    else s.falsch += 1;
    map[modulId] = s;
  }
  for (const s of Object.values(map)) {
    s.quote = s.anzahl ? Math.round((s.richtig / s.anzahl) * 100) : 0;
    s.bearbeitet = s.anzahl > 0;
    s.beherrscht = s.anzahl > 0 && s.quote >= BEHERRSCHT_AB;
  }
  for (const [modulId, s] of Object.entries(map)) {
    const gesamt = Number(gesamtVon(modulId)) || 0;
    s.gesamt = gesamt || null;
    s.abdeckung = gesamt ? abdeckungProzent(s.anzahl, gesamt) : null;
  }
  return map;
}

/** Status eines einzelnen Moduls (mit Standardwerten). */
export function modulStatusEines(modulId, fortschritt = {}, gesamt = 0) {
  return modulStatusAusFortschritt(fortschritt, () => gesamt)[modulId] || leerenModulStatus(gesamt);
}

/** Anzeige-Stufe: 'beherrscht' | 'bearbeitet' | 'offen'. */
export function modulStufe(status) {
  if (!status || !status.bearbeitet) return MODUL_OFFEN;
  return status.beherrscht ? MODUL_BEHERRSCHT : MODUL_BEARBEITET;
}

/** Gemeinsame Anzeige-Konfiguration fuer alle Seiten (Label + Badge-Klasse). */
export const MODUL_STUFEN_ANZEIGE = {
  [MODUL_BEHERRSCHT]: { label: 'beherrscht', klasse: 'badge-leicht' },
  [MODUL_BEARBEITET]: { label: 'bearbeitet', klasse: 'badge-mittel' },
  [MODUL_OFFEN]: { label: 'offen', klasse: 'badge-neutral' },
};

/** Anzeige-Objekt (Label + Badge-Klasse) fuer einen Modul-Status. */
export function statusAnzeige(status) {
  return MODUL_STUFEN_ANZEIGE[modulStufe(status)];
}

function gleich(a = {}, b = {}) {
  return (
    a.bearbeitet === b.bearbeitet &&
    a.beherrscht === b.beherrscht &&
    a.anzahl === b.anzahl &&
    a.richtig === b.richtig &&
    a.gesamt === b.gesamt &&
    a.abdeckung === b.abdeckung
  );
}

/**
 * Aktualisiert den gespeicherten Modul-Status und meldet neu erreichte Zustaende.
 * @param {object} fortschritt progressStore.get()
 * @param {(modulId:string)=>string} titelVon Aufloesung Modul-ID -> Titel (optional)
 * @param {(modulId:string)=>number} gesamtVon Fragenzahl je Modul (optional)
 */
export function aktualisiereModulStatus(fortschritt, titelVon = (id) => id, gesamtVon = () => 0) {
  const berechnet = modulStatusAusFortschritt(fortschritt, gesamtVon);
  const vorher = gamificationStore.get().modulStatus || {};
  const neuBearbeitet = [];
  const neuBeherrscht = [];
  let geaendert = Object.keys(berechnet).length !== Object.keys(vorher).length;
  for (const [modulId, s] of Object.entries(berechnet)) {
    const alt = vorher[modulId] || {};
    if (!alt.beherrscht && s.beherrscht) neuBeherrscht.push({ modulId, titel: titelVon(modulId) });
    else if (!alt.bearbeitet && s.bearbeitet) neuBearbeitet.push({ modulId, titel: titelVon(modulId) });
    if (!gleich(s, alt)) geaendert = true;
  }
  if (geaendert) {
    const am = new Date().toISOString();
    const neu = {};
    for (const [modulId, s] of Object.entries(berechnet)) neu[modulId] = { ...s, am };
    gamificationStore.setModulStatus(neu);
  }
  return { status: berechnet, neuBearbeitet, neuBeherrscht };
}

/** Meldet neu erreichte Modul-Zustaende als Toast. */
export function meldeModulStatus({ neuBearbeitet = [], neuBeherrscht = [] }) {
  neuBearbeitet.forEach((m) => toastStore.push(`Modul bearbeitet: ${m.titel}`, 'modul'));
  neuBeherrscht.forEach((m) => toastStore.push(`Modul beherrscht: ${m.titel} 🏅`, 'modul'));
}