// Erzeugt aus einer Frage + Musterlösung einen lesbaren Antwort-Text.
import { BUCHSTABEN } from './fragen.js';

export function korrekteAntwortText(frage) {
  if (!frage) return '';
  if (frage.typ === 'FT') {
    // Musterlösung: Synonyme durch | getrennt
    return frage.antwort.split('|').join('  ODER  ');
  }
  const buchstaben = frage.antwort
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const optionen = frage.optionen || [];
  return buchstaben
    .map((b, i) => {
      const idx = BUCHSTABEN.indexOf(b);
      const text = optionen[idx] ? optionen[idx] : '';
      return text ? `${b}) ${text}` : b;
    })
    .join('   ');
}

export function optionText(frage, buchstabe) {
  const optionen = frage?.optionen || [];
  const idx = BUCHSTABEN.indexOf(buchstabe);
  return idx >= 0 && optionen[idx] ? optionen[idx] : buchstabe;
}
