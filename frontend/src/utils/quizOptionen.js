// Quiz-Optionen: Schwierigkeitsfilter und Anzahl der Fragen je Durchlauf.
// Reine Funktionen (testbar) - die Seite Quiz.jsx verwendet sie beim Start.
export const ANZAHL_OPTIONEN = [5, 10, 15, 20, 30, 50];

export const QUIZ_OPTIONEN_STANDARD = { schwierigkeit: 'alle', anzahl: 0 };

/** Fragen nach Schwierigkeit filtern; 'alle' filtert nicht. */
export function filtereNachSchwierigkeit(fragen = [], schwierigkeit = 'alle') {
  const liste = fragen || [];
  if (!schwierigkeit || schwierigkeit === 'alle') return liste;
  return liste.filter((f) => f.schwierigkeit === schwierigkeit);
}

/** Anzahl begrenzen; 0 oder kleiner bedeutet alle Fragen. */
export function begrenzeAnzahl(fragen = [], anzahl = 0) {
  const n = Number(anzahl) || 0;
  const liste = fragen || [];
  return n > 0 ? liste.slice(0, n) : liste;
}

/** Auswahlliste der Anzahlen, die zum verfuegbaren Pool passen. */
export function anzahlAuswahl(verfuegbar = 0, optionen = ANZAHL_OPTIONEN) {
  return optionen.filter((n) => n < verfuegbar);
}

/**
 * Umfang eines Quizdurchlaufs.
 * @returns {{verfuegbar:number, gestellt:number, begrenzt:boolean}}
 */
export function quizUmfang(fragen = [], { schwierigkeit = 'alle', anzahl = 0 } = {}) {
  const pool = filtereNachSchwierigkeit(fragen, schwierigkeit);
  const gestellt = begrenzeAnzahl(pool, anzahl).length;
  return { verfuegbar: pool.length, gestellt, begrenzt: gestellt < pool.length };
}

/** Text fuer den Quizkopf, z. B. "10 von 27 Fragen" oder "27 Fragen". */
export function umfangLabel({ verfuegbar = 0, gestellt = 0 } = {}) {
  if (!verfuegbar) return '';
  return gestellt < verfuegbar ? `${gestellt} von ${verfuegbar} Fragen` : `${verfuegbar} Fragen`;
}