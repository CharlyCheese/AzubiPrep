// FE-020: kanonische Reihenfolge der Lernfelder für die Akkordeon-Gliederung
// in Lernbereich (Lernen.jsx) und Lernreise (Lernreise.jsx). Reine
// Funktionen, kein React – nutzt das `lernfeld`-Feld, das CONTENT-007 auf
// Modul-Ebene (`modules.csv`, 6. Spalte) eingeführt hat.
//
// Reihenfolge: LF1…LF9 (gemeinsame Lernfelder, Jahr 1+2), danach LF10-12
// (fachrichtungsspezifisch, Jahr 3) – dabei die eigene Fachrichtung zuerst,
// die übrigen drei danach alphabetisch nach Suffix. `KEIN_LF` (WiSo/PM,
// offiziell keine Lernfelder, siehe CONTENT-007) und unbekannte/leere Werte
// landen als eigene Gruppe „Sonstige Prüfungsbereiche“ am Ende.

const SUFFIX_ZU_FACHRICHTUNG = { a: 'FIAE', b: 'FISI', c: 'DPA', d: 'DVK' };

/** Erste Angabe aus einem ggf. kombinierten Lernfeld-Wert ("LF3/LF9" -> "LF3"). */
function ersterWert(lernfeld) {
  return String(lernfeld || '').split('/')[0].trim();
}

/** Numerischer Teil eines Lernfeld-Codes, z. B. "LF11a" -> 11, "LF3" -> 3. */
function nummer(lernfeld) {
  const treffer = ersterWert(lernfeld).match(/^LF(\d+)/i);
  return treffer ? Number(treffer[1]) : null;
}

/** Fachrichtungs-Suffix eines Lernfeld-Codes, z. B. "LF11a" -> "a", "LF3" -> ''. */
function suffix(lernfeld) {
  const treffer = ersterWert(lernfeld).match(/^LF\d+([a-d])$/i);
  return treffer ? treffer[1].toLowerCase() : '';
}

/**
 * Sortier-Schlüssel für einen Lernfeld-Wert. Rein für eine stabile,
 * nachvollziehbare Reihenfolge gedacht – keine fachliche Aussage über die
 * Wichtigkeit einzelner Lernfelder.
 */
export function lernfeldSortSchluessel(lernfeld, eigeneFachrichtung = '') {
  const n = nummer(lernfeld);
  if (n === null) return [1, 0, 0, ersterWert(lernfeld) || '~'];
  const s = suffix(lernfeld);
  const eigeneSuffix = Object.entries(SUFFIX_ZU_FACHRICHTUNG)
    .find(([, fr]) => fr === eigeneFachrichtung)?.[0] || '';
  const suffixRang = !s ? 0 : s === eigeneSuffix ? 1 : 2;
  return [0, n, suffixRang, s];
}

/** Vergleichsfunktion für Array.sort auf Basis von lernfeldSortSchluessel. */
export function vergleicheLernfeld(a, b, eigeneFachrichtung = '') {
  const sa = lernfeldSortSchluessel(a, eigeneFachrichtung);
  const sb = lernfeldSortSchluessel(b, eigeneFachrichtung);
  for (let i = 0; i < sa.length; i += 1) {
    if (sa[i] < sb[i]) return -1;
    if (sa[i] > sb[i]) return 1;
  }
  return 0;
}

/** Anzeige-Titel für eine Lernfeld-Gruppe (bewusst ohne erfundene Lernfeld-Namen). */
export function lernfeldTitel(lernfeld) {
  if (!lernfeld || lernfeld === 'KEIN_LF') return 'Sonstige Prüfungsbereiche';
  return lernfeld;
}

/**
 * Gruppiert eine Modul-Liste nach ihrem `lernfeld`-Wert und liefert die
 * Gruppen in kanonischer Reihenfolge (LF1…LF9, dann LF10-12 – eigene
 * Fachrichtung zuerst –, `KEIN_LF`/unbekannt am Ende).
 */
export function gruppiereNachLernfeld(module = [], eigeneFachrichtung = '') {
  const gruppen = new Map();
  for (const m of module) {
    const key = m.lernfeld || 'KEIN_LF';
    if (!gruppen.has(key)) gruppen.set(key, []);
    gruppen.get(key).push(m);
  }
  return [...gruppen.entries()]
    .sort(([a], [b]) => vergleicheLernfeld(a, b, eigeneFachrichtung))
    .map(([lernfeld, module_]) => ({ lernfeld, titel: lernfeldTitel(lernfeld), module: module_ }));
}
