// Antwortoptionen mischen (Fisher-Yates) mit Rückabbildung auf die
// Original-Buchstaben, damit die Auswertung unverändert korrekt bleibt.
import { BUCHSTABEN, optionenListe } from './fragen.js';

/**
 * Liefert eine gemischte Optionsliste und das Mapping
 * Anzeige-Buchstabe → Original-Buchstabe.
 * @returns {{ liste: Array<{buchstabe:string, text:string, original:string}>, anzeigeZuOriginal: Record<string,string> }}
 */
export function mischeOptionen(frage) {
  const basis = optionenListe(frage); // [{ buchstabe, text }] in Originalreihenfolge

  if (basis.length <= 1) {
    const liste = basis.map((o) => ({ buchstabe: o.buchstabe, text: o.text, original: o.buchstabe }));
    const anzeigeZuOriginal = {};
    liste.forEach((o) => { anzeigeZuOriginal[o.buchstabe] = o.original; });
    return { liste, anzeigeZuOriginal };
  }

  const indizes = basis.map((_, i) => i);
  for (let i = indizes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indizes[i], indizes[j]] = [indizes[j], indizes[i]];
  }

  const liste = indizes.map((origIdx, anzeigeIdx) => ({
    buchstabe: BUCHSTABEN[anzeigeIdx],
    text: basis[origIdx].text,
    original: basis[origIdx].buchstabe,
  }));
  const anzeigeZuOriginal = {};
  liste.forEach((o) => { anzeigeZuOriginal[o.buchstabe] = o.original; });

  return { liste, anzeigeZuOriginal };
}

/** Reverse-Mapping Original → Anzeige (z. B. für die „Richtige Antwort"-Anzeige). */
export function originalZuAnzeige(gemischt) {
  const map = {};
  (gemischt?.liste || []).forEach((o) => { map[o.original] = o.buchstabe; });
  return map;
}
