// Missionen (Phase 4): statische Konfiguration mit Tages- und Wochenperiode.
// Der Fortschritt laeuft ueber Zaehler in azubiprep.game.missionen und wird beim
// Periodenwechsel automatisch zurueckgesetzt (Perioden-Key Tag/Woche).
import { toastStore } from '../store/toastStore.js';

export const PERIODE_TAG = 'tag';
export const PERIODE_WOCHE = 'woche';

/** Zaehler, die eine Mission hochzaehlen kann. */
export const MISSIONSTYPEN = ['frage', 'richtig', 'quiz', 'pruefung', 'tagesziel'];

const pad = (n) => String(n).padStart(2, '0');
const tagKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Perioden-Key Tag: lokales Datum 'YYYY-MM-DD'. */
export function periodeKeyTag(datum = new Date()) {
  return tagKey(new Date(datum));
}

/** Perioden-Key Woche: Montag der laufenden Woche 'YYYY-MM-DD'. */
export function periodeKeyWoche(datum = new Date()) {
  const d = new Date(datum);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return tagKey(d);
}

export function periodeKey(periode, datum = new Date()) {
  return periode === PERIODE_WOCHE ? periodeKeyWoche(datum) : periodeKeyTag(datum);
}

/**
 * Statische Missionskonfiguration.
 * xp: Belohnung pro erledigter Mission (neu in Phase 4, im Plan zu bestaetigen).
 */
export const MISSIONEN = [
  { id: 'tag-fragen-5', periode: PERIODE_TAG, typ: 'frage', ziel: 5, xp: 15,
    titel: 'Fünf Fragen heute', beschreibung: 'Beantworte heute 5 Fragen.' },
  { id: 'tag-richtig-3', periode: PERIODE_TAG, typ: 'richtig', ziel: 3, xp: 15,
    titel: 'Drei Richtige', beschreibung: 'Beantworte heute 3 Fragen richtig.' },
  { id: 'tag-quiz-1', periode: PERIODE_TAG, typ: 'quiz', ziel: 1, xp: 20,
    titel: 'Eine Quizrunde', beschreibung: 'Schließe heute eine Quizrunde ab.' },
  { id: 'woche-fragen-25', periode: PERIODE_WOCHE, typ: 'frage', ziel: 25, xp: 40,
    titel: 'Fleißige Woche', beschreibung: 'Beantworte diese Woche 25 Fragen.' },
  { id: 'woche-richtig-15', periode: PERIODE_WOCHE, typ: 'richtig', ziel: 15, xp: 40,
    titel: 'Sichere Woche', beschreibung: 'Beantworte diese Woche 15 Fragen richtig.' },
  { id: 'woche-quiz-3', periode: PERIODE_WOCHE, typ: 'quiz', ziel: 3, xp: 50,
    titel: 'Drei Quizrunden', beschreibung: 'Schließe diese Woche 3 Quizrunden ab.' },
  { id: 'woche-pruefung-1', periode: PERIODE_WOCHE, typ: 'pruefung', ziel: 1, xp: 60,
    titel: 'Prüfungstraining', beschreibung: 'Absolviere diese Woche eine Prüfungssimulation.' },
  { id: 'woche-tagesziel-3', periode: PERIODE_WOCHE, typ: 'tagesziel', ziel: 3, xp: 60,
    titel: 'Dranbleiben', beschreibung: 'Erreiche das Tagesziel an 3 Tagen.' },
];

export function missionById(id) {
  return MISSIONEN.find((m) => m.id === id) || null;
}

/** Alle Zaehler auf 0. */
export function leereZaehler() {
  const z = {};
  MISSIONSTYPEN.forEach((t) => { z[t] = 0; });
  return z;
}

function leerePeriode(key) {
  return { key, zaehler: leereZaehler(), erledigt: {} };
}

/** Periodendaten; veraltete Perioden werden durch eine leere ersetzt. */
export function periodeStand(missionen, periode, key) {
  const stand = missionen?.[periode];
  if (!stand || stand.key !== key) return leerePeriode(key);
  return {
    key: stand.key,
    zaehler: { ...leereZaehler(), ...(stand.zaehler || {}) },
    erledigt: { ...(stand.erledigt || {}) },
  };
}

/**
 * Erhoeht die Zaehler beider Perioden und markiert neu erreichte Missionen.
 * @returns {{missionen: object, erreicht: object[], geaendert: boolean}}
 */
export function zaehlerErhoehen(missionen, typ, menge = 1, datum = new Date()) {
  if (!typ || menge <= 0) return { missionen: missionen || {}, erreicht: [], geaendert: false };
  const tag = periodeStand(missionen, PERIODE_TAG, periodeKeyTag(datum));
  const woche = periodeStand(missionen, PERIODE_WOCHE, periodeKeyWoche(datum));
  tag.zaehler[typ] = (tag.zaehler[typ] || 0) + menge;
  woche.zaehler[typ] = (woche.zaehler[typ] || 0) + menge;

  const erreicht = [];
  const jetzt = new Date().toISOString();
  for (const m of MISSIONEN) {
    const stand = m.periode === PERIODE_TAG ? tag : woche;
    if (!stand.erledigt[m.id] && (stand.zaehler[m.typ] || 0) >= m.ziel) {
      stand.erledigt[m.id] = jetzt;
      erreicht.push({ ...m, periodeKey: stand.key, erledigtAm: jetzt });
    }
  }
  return {
    missionen: { ...(missionen || {}), [PERIODE_TAG]: tag, [PERIODE_WOCHE]: woche },
    erreicht,
    geaendert: true,
  };
}

/** Missionen mit Status und Fortschritt fuer die Anzeige. */
export function missionenMitStatus(missionen, datum = new Date()) {
  const tag = periodeStand(missionen, PERIODE_TAG, periodeKeyTag(datum));
  const woche = periodeStand(missionen, PERIODE_WOCHE, periodeKeyWoche(datum));
  const liste = MISSIONEN.map((m) => {
    const stand = m.periode === PERIODE_TAG ? tag : woche;
    const ist = Math.min(m.ziel, stand.zaehler[m.typ] || 0);
    return {
      id: m.id,
      titel: m.titel,
      beschreibung: m.beschreibung,
      periode: m.periode,
      typ: m.typ,
      ziel: m.ziel,
      xp: m.xp,
      ist,
      erreicht: ist >= m.ziel,
      erledigtAm: stand.erledigt[m.id] || null,
      fortschritt: m.ziel ? Math.min(1, ist / m.ziel) : 0,
    };
  });
  return {
    liste,
    tag: liste.filter((m) => m.periode === PERIODE_TAG),
    woche: liste.filter((m) => m.periode === PERIODE_WOCHE),
  };
}

/** Meldet neu erledigte Missionen als Toast und liefert deren IDs. */
export function meldeMissionen(ergebnis) {
  const erreicht = ergebnis?.erreicht || [];
  return erreicht.map((m) => {
    toastStore.push(`Mission erledigt: ${m.titel} (+${m.xp} XP)`, 'mission');
    return m.id;
  });
}