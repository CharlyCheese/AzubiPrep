// Antwortprüfung für SC, MC und FT (siehe docs/08-Datenformate.md, Abschnitt
// "Antwortformate"). Case-insensitiv, da das Frontend Buchstaben teils
// grossgeschrieben zurueckmeldet (Anzeige-Buchstaben A-D).

function normalizeLetters(value) {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .sort();
}

/** Entfernt Diakritika/Sonderzeichen und normalisiert Groß-/Kleinschreibung
 *  und Whitespace für den FT-Freitextvergleich. */
function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Diakritika entfernen
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Satzzeichen etc. entfernen
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Prüft eine Nutzerantwort gegen die Musterlösung einer Frage.
 * @returns {{ richtig: boolean, erwartet: string }}
 */
export function pruefeAntwort(frage, nutzerAntwort) {
  if (frage.typ === 'FT') {
    const synonyme = String(frage.antwort ?? '')
      .split('|')
      .map((s) => normalizeText(s))
      .filter(Boolean);
    const text = normalizeText(nutzerAntwort);
    const richtig = text.length > 0 && synonyme.some((syn) => syn && text.includes(syn));
    return { richtig, erwartet: frage.antwort };
  }

  const erwarteteBuchstaben = normalizeLetters(frage.antwort);
  const gegebeneBuchstaben = normalizeLetters(nutzerAntwort);
  const richtig =
    erwarteteBuchstaben.length > 0 &&
    erwarteteBuchstaben.length === gegebeneBuchstaben.length &&
    erwarteteBuchstaben.every((b, i) => b === gegebeneBuchstaben[i]);

  return { richtig, erwartet: erwarteteBuchstaben.join(',') };
}

/** Lesbare Musterlösung für FT-Fragen (Synonyme durch " ODER " getrennt). */
export function musterloesungFT(frage) {
  return String(frage.antwort ?? '').split('|').join(' ODER ');
}
