import { describe, expect, it } from 'vitest';
import { buildIndex, searchIndex, RAG_LIMITS } from '../src/rag-index.js';

describe('Lokaler lexikalischer RAG-Index', () => {
  it('findet fachlich passende Textstellen mit tatsächlichen PDF-Seiten', () => {
    const index = buildIndex(['HTML strukturiert Inhalte einer Webseite. Eine Hauptueberschrift beschreibt das zentrale Thema und Absaetze enthalten den laufenden Text.', 'Eine IPv4 Netzmaske beschreibt die Aufteilung einer Netzwerkadresse. Subnetting teilt Netzwerke in kleinere Bereiche. Diese Netzwerkadresse ist ein synthetisches Beispiel.']);
    const hits = searchIndex(index, 'IPv4 Netzmaske Subnetting');
    expect(hits[0].page).toBe(2); expect(hits[0].text).toContain('Subnetting'); expect(searchIndex(index, 'Apfelkuchen Zimt')).toHaveLength(0);
  });
  it('begrenzt Abschnitte und erhält Seiten auch bei leeren Zwischenblättern', () => {
    const index = buildIndex(['Ein langer Testabschnitt mit Netzwerktechnik und Subnetting. '.repeat(60), '', 'CSS gestaltet Schrift und Farben einer Webseite. Die Selektoren bestimmen, welche Elemente eine Regel erhalten und wie eine Seite gestaltet wird.']);
    expect(index.chunks.every(chunk => chunk.text.length <= RAG_LIMITS.chunkChars)).toBe(true);
    expect(searchIndex(index, 'CSS Schrift Farben')[0].page).toBe(3); expect(index.emptyPages).toBe(1);
  });
  it('erkennt fehlenden Text, Quoten und unbekannte Indexversionen', () => {
    expect(() => buildIndex([''])).toThrow(/lesbarer Text/);
    expect(() => buildIndex(['x'.repeat(RAG_LIMITS.pageChars + 1)])).toThrow();
    expect(() => searchIndex({ schema: 99 }, 'Test')).toThrow(/Index/);
  });
  it('behandelt technische Begriffe wie constructor ohne geerbte Objektwerte', () => {
    const index = JSON.parse(JSON.stringify(buildIndex(['Ein constructor erstellt in diesem synthetischen Beispiel eine neue Instanz. Der constructor ist ein besonderer Bestandteil einer Klasse.', 'Ein anderer Abschnitt beschreibt die Struktur von HTML Seiten und ihre Ueberschriften. Beide Bereiche dienen ausschliesslich als oeffentliche Testdaten.'])));
    const hits = searchIndex(index, 'constructor'); expect(hits.length).toBeGreaterThan(0); expect(hits.every(hit => Number.isFinite(hit.score))).toBe(true);
  });
});
