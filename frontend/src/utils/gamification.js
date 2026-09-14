// Gamification-Konfiguration: XP-Regeln und Level-Stufen (Daten, kein Code).

export const XP_REGELN = {
  frageRichtig: 5,
  frageSchwer: 3,
  fehlerSpaeterRichtig: 5,
  quizAbgeschlossen: 25,
  pruefungAbgeschlossen: 50,
  tagesziel: 30,
};

export const ZIELE_STANDARD = { tag: 10, woche: 3 };

export const LEVEL_STUFEN = [
  { level: 1, minXp: 0, titel: 'Lehrling' },
  { level: 2, minXp: 75, titel: 'Novize' },
  { level: 3, minXp: 150, titel: 'Adept' },
  { level: 4, minXp: 300, titel: 'Magier' },
  { level: 5, minXp: 600, titel: 'Archmagier' },
  { level: 6, minXp: 1200, titel: 'Großmeister' },
  { level: 7, minXp: 2400, titel: 'Prüfungsweiser' },
  { level: 8, minXp: 4800, titel: 'Legende' },
];

export function levelAusXp(xp) {
  let aktuell = LEVEL_STUFEN[0];
  for (const stufe of LEVEL_STUFEN) {
    if (xp >= stufe.minXp) aktuell = stufe;
  }
  return aktuell;
}

export function naechsteStufe(xp) {
  return LEVEL_STUFEN.find((s) => s.minXp > xp) || null;
}

// ---- Modul-Status ----
/** Ab dieser Erfolgsquote gilt ein Modul als beherrscht. */
export const BEHERRSCHT_AB = 80;

// ---- Abzeichen (Phase 3) ----
// Regel: erreicht, sobald wert(game) >= ziel. Damit sind Bedingung und
// Fortschrittsanzeige (gesperrte Abzeichen) aus derselben Konfiguration ableitbar.
function anzahlEreignisse(game, praefix) {
  return Object.keys(game?.eventLog || {}).filter((k) => k.startsWith(praefix)).length;
}

const level = (game) => levelAusXp(game?.xp || 0).level;

export const BADGES = [
  { id: 'erster-schritt', symbol: '🌱', titel: 'Erster Schritt', beschreibung: 'Erste Frage richtig beantwortet.', ziel: 1, wert: (g) => anzahlEreignisse(g, 'frage:') },
  { id: 'zehn-richtige', symbol: '✅', titel: 'Zehn Richtige', beschreibung: '10 Fragen richtig beantwortet.', ziel: 10, wert: (g) => anzahlEreignisse(g, 'frage:') },
  { id: 'fuenfzig-richtige', symbol: '💪', titel: 'Fünfzig Richtige', beschreibung: '50 Fragen richtig beantwortet.', ziel: 50, wert: (g) => anzahlEreignisse(g, 'frage:') },
  { id: 'hundert-richtige', symbol: '🎯', titel: 'Hundert Richtige', beschreibung: '100 Fragen richtig beantwortet.', ziel: 100, wert: (g) => anzahlEreignisse(g, 'frage:') },
  { id: 'erste-quizrunde', symbol: '📘', titel: 'Erste Quizrunde', beschreibung: 'Ein Quiz vollständig abgeschlossen.', ziel: 1, wert: (g) => anzahlEreignisse(g, 'quiz:') },
  { id: 'zehn-quizrunden', symbol: '📚', titel: 'Zehn Quizrunden', beschreibung: '10 Quizrunden abgeschlossen.', ziel: 10, wert: (g) => anzahlEreignisse(g, 'quiz:') },
  { id: 'erste-pruefung', symbol: '🎓', titel: 'Erste Prüfung', beschreibung: 'Eine Prüfungssimulation abgeschlossen.', ziel: 1, wert: (g) => anzahlEreignisse(g, 'exam:') },
  { id: 'tagesziel-serie', symbol: '🔥', titel: 'Tagesziel-Serie', beschreibung: 'An 3 Tagen das Tagesziel erreicht.', ziel: 3, wert: (g) => anzahlEreignisse(g, 'tagesziel:') },
  { id: 'aufsteiger', symbol: '⭐', titel: 'Aufsteiger', beschreibung: 'Level 4 (Magier) erreicht.', ziel: 4, wert: (g) => level(g) },
  { id: 'grossmeister', symbol: '🏆', titel: 'Großmeister', beschreibung: 'Level 6 (Großmeister) erreicht.', ziel: 6, wert: (g) => level(g) },
];

export function badgeById(id) {
  return BADGES.find((b) => b.id === id) || null;
}

export function badgeErreicht(badge, game) {
  return badge.wert(game) >= badge.ziel;
}

/** Alle Abzeichen mit Status, Zeitstempel und Fortschritt (0..1) fuer die Anzeige. */
export function badgesMitStatus(game) {
  const erreichte = game?.badges || {};
  return BADGES.map((b) => ({
    id: b.id,
    symbol: b.symbol,
    titel: b.titel,
    beschreibung: b.beschreibung,
    ziel: b.ziel,
    ist: Math.min(b.ziel, b.wert(game)),
    erreicht: badgeErreicht(b, game),
    am: erreichte[b.id] || null,
    fortschritt: b.ziel ? Math.min(1, b.wert(game) / b.ziel) : 0,
  }));
}

/** Vergibt alle neu erreichten Abzeichen (mutiert game.badges) und liefert deren IDs. */
export function vergibBadges(game) {
  if (!game.badges) game.badges = {};
  const neu = [];
  for (const b of BADGES) {
    if (!game.badges[b.id] && badgeErreicht(b, game)) {
      game.badges[b.id] = new Date().toISOString();
      neu.push(b.id);
    }
  }
  return neu;
}