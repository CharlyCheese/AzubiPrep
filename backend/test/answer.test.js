// Testet die Antwortauswertung (backend/src/answer.js) für alle drei
// Fragetypen. Das ist die Funktion, die entscheidet, ob eine Antwort im
// Quiz, in der Prüfung und in der Karteikarten-Auswertung als richtig
// zählt – ein Fehler hier wirkt sich sofort auf die Notenberechnung aus.
import { describe, it, expect } from 'vitest';
import { pruefeAntwort, musterloesungFT } from '../src/answer.js';

describe('pruefeAntwort – Single-Choice (SC)', () => {
  it('erkennt die richtige Antwort', () => {
    const frage = { typ: 'SC', antwort: 'b' };
    expect(pruefeAntwort(frage, 'b').richtig).toBe(true);
  });

  it('ist case-insensitiv (Frontend liefert teils Großbuchstaben)', () => {
    const frage = { typ: 'SC', antwort: 'b' };
    expect(pruefeAntwort(frage, 'B').richtig).toBe(true);
  });

  it('erkennt eine falsche Antwort', () => {
    const frage = { typ: 'SC', antwort: 'b' };
    expect(pruefeAntwort(frage, 'c').richtig).toBe(false);
  });

  it('lehnt eine leere Antwort ab', () => {
    const frage = { typ: 'SC', antwort: 'b' };
    expect(pruefeAntwort(frage, '').richtig).toBe(false);
  });
});

describe('pruefeAntwort – Multiple-Choice (MC)', () => {
  it('erkennt die richtige Kombination unabhängig von der Reihenfolge', () => {
    const frage = { typ: 'MC', antwort: 'a,c' };
    expect(pruefeAntwort(frage, 'c,a').richtig).toBe(true);
  });

  it('lehnt eine unvollständige Auswahl ab', () => {
    const frage = { typ: 'MC', antwort: 'a,c' };
    expect(pruefeAntwort(frage, 'a').richtig).toBe(false);
  });

  it('lehnt eine Auswahl mit einer zusätzlichen falschen Option ab', () => {
    const frage = { typ: 'MC', antwort: 'a,c' };
    expect(pruefeAntwort(frage, 'a,b,c').richtig).toBe(false);
  });

  it('ignoriert Leerzeichen um die Buchstaben', () => {
    const frage = { typ: 'MC', antwort: 'a,c' };
    expect(pruefeAntwort(frage, ' a , c ').richtig).toBe(true);
  });
});

describe('pruefeAntwort – Freitext (FT)', () => {
  it('akzeptiert exakte Übereinstimmung mit der Musterlösung', () => {
    const frage = { typ: 'FT', antwort: 'localhost' };
    expect(pruefeAntwort(frage, 'localhost').richtig).toBe(true);
  });

  it('akzeptiert eines von mehreren Synonymen (Pipe-getrennt)', () => {
    const frage = { typ: 'FT', antwort: 'localhost|127.0.0.1' };
    expect(pruefeAntwort(frage, '127.0.0.1').richtig).toBe(true);
  });

  it('ist case-insensitiv und ignoriert Satzzeichen/Diakritika', () => {
    const frage = { typ: 'FT', antwort: 'Prüfungsordnung' };
    expect(pruefeAntwort(frage, 'PRUEFUNGSORDNUNG').richtig).toBe(false);
    // "ü" wird zu "u" normalisiert (Diakritikum entfernt), nicht zu "ue" –
    // daher hier bewusst der tatsächlich erwartete Fall:
    expect(pruefeAntwort(frage, 'prufungsordnung.').richtig).toBe(true);
  });

  it('akzeptiert die Musterlösung auch als Teilstring einer längeren Antwort', () => {
    const frage = { typ: 'FT', antwort: 'DNS' };
    expect(pruefeAntwort(frage, 'Das ist der DNS Server').richtig).toBe(true);
  });

  it('lehnt eine leere Antwort ab', () => {
    const frage = { typ: 'FT', antwort: 'DNS' };
    expect(pruefeAntwort(frage, '').richtig).toBe(false);
  });
});

describe('musterloesungFT', () => {
  it('trennt mehrere Synonyme lesbar mit ODER', () => {
    const frage = { antwort: 'localhost|127.0.0.1' };
    expect(musterloesungFT(frage)).toBe('localhost ODER 127.0.0.1');
  });

  it('gibt eine einzelne Lösung unverändert zurück', () => {
    const frage = { antwort: 'DNS' };
    expect(musterloesungFT(frage)).toBe('DNS');
  });
});
