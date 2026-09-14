// Helfer rund um Fragen: Optionen, Antwortformat, Beschriftungen.

export const BUCHSTABEN = ['A', 'B', 'C', 'D', 'E', 'F'];

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
