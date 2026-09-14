// Prueft Level (Schwellen, Titel), XP-Regeln und Abzeichen (Phase 3).
import {
  levelAusXp,
  naechsteStufe,
  LEVEL_STUFEN,
  XP_REGELN,
  BEHERRSCHT_AB,
  BADGES,
  badgeById,
  badgesMitStatus,
  vergibBadges,
} from '../src/utils/gamification.js';

let fehler = 0;
function pruefe(name, ist, soll) {
  if (ist !== soll) { console.log(`FEHLER ${name}: ist=${ist} soll=${soll}`); fehler++; }
}

pruefe('Level bei 0 XP', levelAusXp(0).level, 1);
pruefe('Titel bei 0 XP', levelAusXp(0).titel, 'Lehrling');
pruefe('Level bei 74 XP', levelAusXp(74).level, 1);
pruefe('Level bei 75 XP', levelAusXp(75).level, 2);
pruefe('Level bei 150 XP', levelAusXp(150).level, 3);
pruefe('Level bei 300 XP', levelAusXp(300).level, 4);
pruefe('Level bei 4800 XP', levelAusXp(4800).level, 8);
pruefe('naechste Stufe bei 0', naechsteStufe(0).level, 2);
pruefe('naechste Stufe bei max', naechsteStufe(4800), null);
pruefe('Anzahl Stufen', LEVEL_STUFEN.length, 8);
pruefe('XP-Basis richtig', XP_REGELN.frageRichtig, 5);
pruefe('XP schwer Bonus', XP_REGELN.frageSchwer, 3);
pruefe('XP Tagesziel', XP_REGELN.tagesziel, 30);

// Abzeichen
pruefe('Beherrscht-Schwelle', BEHERRSCHT_AB, 80);
pruefe('Anzahl Abzeichen', BADGES.length, 10);
pruefe('Abzeichen-IDs eindeutig', new Set(BADGES.map((b) => b.id)).size, BADGES.length);
pruefe('Abzeichen vollstaendig', BADGES.every((b) => b.symbol && b.titel && b.beschreibung && b.ziel > 0), true);
pruefe('badgeById unbekannt', badgeById('gibt-es-nicht'), null);

const leer = { xp: 0, eventLog: {}, badges: {} };
pruefe('keine Abzeichen ohne Aktivitaet', vergibBadges(leer).length, 0);
pruefe('Fortschritt gesperrtes Abzeichen', Math.round(badgesMitStatus(leer).find((b) => b.id === 'zehn-richtige').fortschritt * 100), 0);

const eins = { xp: 5, eventLog: { 'frage:F1': true }, badges: {} };
pruefe('erstes Abzeichen', vergibBadges(eins).join(','), 'erster-schritt');
pruefe('Abzeichen nicht doppelt', vergibBadges(eins).length, 0);
pruefe('Abzeichen mit Zeitstempel', typeof eins.badges['erster-schritt'], 'string');

const viel = { xp: 500, eventLog: {}, badges: {} };
for (let i = 0; i < 50; i++) viel.eventLog[`frage:F${i}`] = true;
viel.eventLog['quiz:1'] = true;
viel.eventLog['exam:1'] = true;
const neuViel = vergibBadges(viel);
pruefe('mehrere Abzeichen gleichzeitig', neuViel.length, 6);
pruefe('Level-Abzeichen ab Level 4', neuViel.includes('aufsteiger'), true);
pruefe('kein Grossmeister bei 500 XP', neuViel.includes('grossmeister'), false);
pruefe('Statusliste vollstaendig', badgesMitStatus(viel).length, BADGES.length);
pruefe('erreichte Abzeichen gezaehlt', badgesMitStatus(viel).filter((b) => b.erreicht).length, 6);

console.log(fehler === 0 ? 'GAMIFICATION-LEVEL OK' : `${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);