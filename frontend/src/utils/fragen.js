// Helfer rund um Fragen: Optionen, Antwortformat, Beschriftungen.

export const BUCHSTABEN = ['A', 'B', 'C', 'D', 'E', 'F'];

// Nur für die Anzeige: Optionen werden als Ziffern statt Buchstaben
// dargestellt (angenehmer mit der Tastatur, siehe useQuizKeyboard – dort
// lösen sowohl Ziffern- als auch Buchstabentasten dieselbe Option aus).
// Intern bleibt weiterhin der Buchstabe (A–F) die Referenz, u. a. weil das
// Antwortformat aus dem Backend (frage.antwort) und der Misch-Mapping-Code
// (mischeOptionen) darauf aufbauen – hier wird nur die Beschriftung ersetzt.
const ZIFFERN = ['1', '2', '3', '4', '5', '6'];

/** Wandelt einen Options-Buchstaben (A–F) in die Anzeige-Ziffer (1–6) um. */
export function buchstabeZuZiffer(buchstabe) {
  const idx = BUCHSTABEN.indexOf(buchstabe);
  return idx >= 0 ? ZIFFERN[idx] : buchstabe;
}

export const TYP_LABEL = {
  SC: 'Single Choice',
  MC: 'Multiple Choice',
  FT: 'Freitext',
};

export const SCHWIERIGKEIT_LABEL = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

/** Optionen einer Frage als Array von { buchstabe, text } – nur nicht-leere. */
export function optionenListe(frage) {
  if (!frage?.optionen) return [];
  return frage.optionen
    .map((text, i) => ({ buchstabe: BUCHSTABEN[i], text, index: i }))
    .filter((o) => o.text && o.text.trim() !== '');
}

/** Prüft, ob eine Frage überhaupt beantwortbar ist. */
export function hatOptionen(frage) {
  return (frage?.typ === 'SC' || frage?.typ === 'MC') && optionenListe(frage).length > 0;
}
