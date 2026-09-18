// Testet Prüfungsgenerierung und -auswertung (backend/src/exam.js) mit
// einem kleinen, selbst gebauten Fragenbestand statt der echten CSV-Daten
// – das hält den Test schnell, unabhängig vom aktuellen Fragenbestand und
// deterministisch überprüfbar.
import { describe, it, expect } from 'vitest';
import { generierePruefung, auswertePruefung } from '../src/exam.js';

function baueContent(fragen) {
  const questionsById = new Map(fragen.map((f) => [f.id, f]));
  const fachrichtungenByCode = new Map([
    ['FIAE', { code: 'FIAE', name: 'Anwendungsentwicklung' }],
    ['FISI', { code: 'FISI', name: 'Systemintegration' }],
  ]);
  return { questionsById, fachrichtungenByCode };
}

const beispielFragen = [
  { id: 'F1', fachrichtung: 'FIAE', modul_id: 'FIAE-PRG', thema: 'OOP', typ: 'SC', frage: '...', optionen: {}, antwort: 'a', schwierigkeit: 'leicht' },
  { id: 'F2', fachrichtung: 'FIAE', modul_id: 'FIAE-DB', thema: 'SQL', typ: 'SC', frage: '...', optionen: {}, antwort: 'b', schwierigkeit: 'mittel' },
  { id: 'F3', fachrichtung: 'ALLE', modul_id: 'WISO', thema: 'Recht', typ: 'MC', frage: '...', optionen: {}, antwort: 'a,c', schwierigkeit: 'schwer' },
  { id: 'F4', fachrichtung: 'FISI', modul_id: 'FISI-NET', thema: 'Netz', typ: 'FT', frage: '...', optionen: {}, antwort: 'DNS', schwierigkeit: 'mittel' },
];

describe('generierePruefung', () => {
  it('wirft einen Fehler bei unbekannter/fehlender Fachrichtung', () => {
    const content = baueContent(beispielFragen);
    expect(() => generierePruefung(content, { fachrichtung: 'UNBEKANNT', anzahl: 10 })).toThrow();
    expect(() => generierePruefung(content, { fachrichtung: undefined, anzahl: 10 })).toThrow();
  });

  it('liefert nur Fragen der Fachrichtung plus gemeinsame ALLE-Fragen', () => {
    const content = baueContent(beispielFragen);
    const pruefung = generierePruefung(content, { fachrichtung: 'FIAE', anzahl: 10 });
    const ids = pruefung.fragen.map((f) => f.id).sort();
    // F1+F2 (FIAE) + F3 (ALLE) gehören dazu, F4 (FISI) nicht.
    expect(ids).toEqual(['F1', 'F2', 'F3']);
  });

  it('begrenzt die Anzahl auf das Minimum aus Wunsch und verfügbaren Fragen', () => {
    const content = baueContent(beispielFragen);
    const pruefung = generierePruefung(content, { fachrichtung: 'FIAE', anzahl: 2 });
    expect(pruefung.anzahl).toBe(2);
    expect(pruefung.fragen).toHaveLength(2);
  });

  it('erzwingt mindestens 1 und höchstens 200 Fragen, auch bei ungültiger Eingabe', () => {
    const content = baueContent(beispielFragen);
    const zuWenig = generierePruefung(content, { fachrichtung: 'FIAE', anzahl: -5 });
    expect(zuWenig.anzahl).toBeGreaterThanOrEqual(1);

    const keineZahl = generierePruefung(content, { fachrichtung: 'FIAE', anzahl: Number.NaN });
    expect(keineZahl.anzahl).toBe(3); // Fallback 40, aber nur 3 Fragen verfügbar
  });

  it('filtert nach Schwierigkeit, wenn gesetzt', () => {
    const content = baueContent(beispielFragen);
    const pruefung = generierePruefung(content, { fachrichtung: 'FIAE', anzahl: 10, schwierigkeit: 'mittel' });
    expect(pruefung.fragen.every((f) => f.schwierigkeit === 'mittel')).toBe(true);
    expect(pruefung.fragen.map((f) => f.id)).toEqual(['F2']);
  });

  it('wirft einen Fehler, wenn der Schwierigkeitsfilter den Pool auf null reduziert', () => {
    const content = baueContent(beispielFragen);
    expect(() =>
      generierePruefung(content, { fachrichtung: 'FISI', anzahl: 10, schwierigkeit: 'leicht' }),
    ).toThrow();
  });

  it('gibt an FrageKarte übergebene Fragen ohne die Musterlösung (antwort) zurück', () => {
    const content = baueContent(beispielFragen);
    const pruefung = generierePruefung(content, { fachrichtung: 'FIAE', anzahl: 10 });
    for (const f of pruefung.fragen) {
      expect(f).not.toHaveProperty('antwort');
    }
  });
});

describe('auswertePruefung', () => {
  it('wirft einen Fehler bei leerer/fehlender Antwortliste', () => {
    const content = baueContent(beispielFragen);
    expect(() => auswertePruefung(content, { fragen: [] })).toThrow();
    expect(() => auswertePruefung(content, {})).toThrow();
  });

  it('berechnet die Punktzahl korrekt und ignoriert unbekannte IDs', () => {
    const content = baueContent(beispielFragen);
    const ergebnis = auswertePruefung(content, {
      fragen: [
        { id: 'F1', antwort: 'a' }, // richtig
        { id: 'F2', antwort: 'a' }, // falsch (richtig wäre b)
        { id: 'GHOST', antwort: 'a' }, // unbekannte ID -> wird übersprungen
      ],
    });
    expect(ergebnis.gesamt).toBe(2);
    expect(ergebnis.richtig).toBe(1);
    expect(ergebnis.scoreProzent).toBe(50);
  });

  it('markiert als bestanden, wenn die Bestehensgrenze (50 %) erreicht ist', () => {
    const content = baueContent(beispielFragen);
    const ergebnis = auswertePruefung(content, {
      fragen: [
        { id: 'F1', antwort: 'a' },
        { id: 'F2', antwort: 'b' },
      ],
    });
    expect(ergebnis.scoreProzent).toBe(100);
    expect(ergebnis.bestanden).toBe(true);
  });

  it('markiert als nicht bestanden unter der Bestehensgrenze', () => {
    const content = baueContent(beispielFragen);
    const ergebnis = auswertePruefung(content, {
      fragen: [
        { id: 'F1', antwort: 'falsch' },
        { id: 'F2', antwort: 'falsch' },
      ],
    });
    expect(ergebnis.bestanden).toBe(false);
  });

  it('gruppiert Ergebnisse korrekt nach Modul und Fragetyp', () => {
    const content = baueContent(beispielFragen);
    const ergebnis = auswertePruefung(content, {
      fragen: [
        { id: 'F1', antwort: 'a' },
        { id: 'F3', antwort: 'a,c' },
      ],
    });
    expect(ergebnis.proModul['FIAE-PRG']).toEqual({ richtig: 1, gesamt: 1 });
    expect(ergebnis.proModul['WISO']).toEqual({ richtig: 1, gesamt: 1 });
    expect(ergebnis.proTyp['SC']).toEqual({ richtig: 1, gesamt: 1 });
    expect(ergebnis.proTyp['MC']).toEqual({ richtig: 1, gesamt: 1 });
  });

  it('sortiert Module in Stärken (>= 60 %) bzw. Schwächen (< 60 %)', () => {
    const content = baueContent(beispielFragen);
    const ergebnis = auswertePruefung(content, {
      fragen: [
        { id: 'F1', antwort: 'a' }, // FIAE-PRG richtig -> 100 % -> Stärke
        { id: 'F2', antwort: 'falsch' }, // FIAE-DB falsch -> 0 % -> Schwäche
      ],
    });
    expect(ergebnis.staerken.map((s) => s.modulId)).toEqual(['FIAE-PRG']);
    expect(ergebnis.schwaechen.map((s) => s.modulId)).toEqual(['FIAE-DB']);
  });
});
