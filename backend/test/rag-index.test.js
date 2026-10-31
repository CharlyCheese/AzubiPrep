import { describe, expect, it } from 'vitest';
import { buildIndex, searchIndex, RAG_LIMITS } from '../src/rag-index.js';

describe('Lokaler lexikalischer RAG-Index', () => {
  it('nutzt neue explizite Definitionen nur im Indexkontext und ohne erneutes Aufbereiten', () => {
    const pages = ['Test Driven Development (TDD) beschreibt hier ein synthetisches Vorgehen. Dieser Abschnitt führt ausdrücklich beide Schreibweisen des Testbegriffs ein.', 'Test Driven Development wird auf dieser synthetischen Seite näher erläutert. Hier steht absichtlich keine Abkürzung; der Zusammenhang stammt allein aus der anderen Seite.'];
    const index = JSON.parse(JSON.stringify(buildIndex(pages))); const before = JSON.stringify(index);
    const a = searchIndex(index, 'TDD'), b = searchIndex(index, 'Test Driven Development');
    expect(a.map(hit => hit.page)).toEqual(b.map(hit => hit.page)); expect(new Set(a.map(hit => hit.page))).toEqual(new Set([1, 2]));
    const other = buildIndex([pages[1]]); expect(searchIndex(other, 'TDD')).toHaveLength(0);
    expect(JSON.stringify(index)).toBe(before);
  });
  it('findet IoT und Internet of Things in alten Indizes gleich, ohne Quellen umzuschreiben', () => {
    const pages = ['IoT vernetzt Geräte mit Sensoren und Aktoren. Dieser synthetische Abschnitt beschreibt ein vernetztes Messgerät und die Übertragung seiner Daten.', 'Internet- of Things verbindet Geräte. Dieser synthetische Abschnitt verwendet absichtlich nur den ausgeschriebenen Fachbegriff für vernetzte Sensoren und Aktoren.', 'Das Internet verbindet viele Netzwerke. Dieser synthetische Abschnitt beschreibt allgemeine Verbindungen und enthält keinen speziellen Gerätebegriff.'];
    const index = JSON.parse(JSON.stringify(buildIndex(pages))); const before = JSON.stringify(index);
    const queries = ['Was ist IoT?', 'Was ist Internet of Things?', 'Was ist INTERNET-OF-THINGS?'];
    const hits = queries.map(query => searchIndex(index, query));
    expect(hits[0].map(hit => hit.page)).toEqual(hits[1].map(hit => hit.page));
    expect(hits[1].map(hit => hit.page)).toEqual(hits[2].map(hit => hit.page));
    expect(new Set(hits[0].map(hit => hit.page))).toEqual(new Set([1, 2]));
    expect(hits[0].find(hit => hit.page === 2).text).toBe(pages[1]);
    expect(JSON.stringify(index)).toBe(before);
  });
  it('findet getrennte Vergleichsseiten trotz Plural, Umlaut und getrenntem zusammengesetztem Begriff', () => {
    const index = buildIndex([
      'Eine Gewerkschaft bündelt die Interessen von Arbeitnehmern. Diese synthetische Seite beschreibt Beschäftigte und ihre gemeinsame Interessenvertretung.',
      'Ein Arbeitgeberverband bündelt die Interessen von Unternehmen. Arbeitgeberverbände verhandeln über Arbeitsbedingungen. Diese Seite beschreibt nur die Arbeitgeberseite.',
    ]);
    const hits = searchIndex(JSON.parse(JSON.stringify(index)), 'Unterschied zwischen Gewerkschaften und Arbeitgeber Verbund?');
    expect(new Set(hits.map(hit => hit.page))).toEqual(new Set([1, 2]));
  });
  it('erhält die zweite Vergleichsseite auch vor einer Grenze mit vielen Treffern zur ersten Seite', () => {
    const index = buildIndex([
      ...Array.from({ length: 13 }, (_, n) => `Eine Gewerkschaft vertritt Arbeitnehmer und Arbeitnehmerinnen. Die Interessen von Beschäftigten bilden das Thema der synthetischen Seite ${n}.`),
      ...Array.from({ length: 20 }, (_, n) => `Ein Arbeitgeberverband vertritt Unternehmen und ihre Interessen. Die Arbeitgeberverbände bilden das Thema der synthetischen Seite ${n}.`),
    ]);
    const hits = searchIndex(index, 'Unterschied zwischen Gewerkschaft und Arbeitgeberverband?');
    expect(hits.some(hit => hit.page <= 13)).toBe(true); expect(hits.some(hit => hit.page > 13)).toBe(true);
  });
  it('findet ein zusammengeschriebenes Suchwort auch bei getrennter Quellschreibweise', () => {
    const index = buildIndex(['Arbeitgeber Verbände bündeln die Interessen von Unternehmen. Diese synthetische Seite erläutert die gemeinsame Interessenvertretung auf Arbeitgeberseite und ihre grundsätzliche Aufgabe.']);
    expect(searchIndex(index, 'Arbeitgeberverband')).toHaveLength(1);
  });
  it('erkennt Silbentrennungen in alten Indizes, ohne Originaltext oder Seiten zu ändern', () => {
    const pages = ['Eine Gewerk- schaft vertritt die Interessen von Beschäftigten. Dieser synthetische Seitentext enthält absichtlich eine PDF-Silbentrennung mitten im Wort.', 'Arbeitgeberver- bände vertreten die Interessen von Unternehmen. Diese synthetische Seite beschreibt die Interessenvertretung der Arbeitgeber im Tarifrecht.'];
    const index = JSON.parse(JSON.stringify(buildIndex(pages))); const before = JSON.stringify(index);
    const hits = searchIndex(index, 'Unterschied zwischen Gewerkschaften und Arbeitgeber Verbund?');
    expect(new Set(hits.map(hit => hit.page))).toEqual(new Set([1, 2])); expect(hits.find(hit => hit.page === 2).text).toContain('Arbeitgeberver- bände'); expect(JSON.stringify(index)).toBe(before);
  });
  it('findet fachlich passende Textstellen mit tatsächlichen PDF-Seiten', () => {
    const index = buildIndex(['HTML strukturiert Inhalte einer Webseite. Eine Hauptueberschrift beschreibt das zentrale Thema und Absaetze enthalten den laufenden Text.', 'Eine IPv4 Netzmaske beschreibt die Aufteilung einer Netzwerkadresse. Subnetting teilt Netzwerke in kleinere Bereiche. Diese Netzwerkadresse ist ein synthetisches Beispiel.']);
    const hits = searchIndex(index, 'IPv4 Netzmaske Subnetting');
    expect(hits[0].page).toBe(2); expect(hits[0].text).toContain('Subnetting'); expect(searchIndex(index, 'Apfelkuchen Zimt')).toHaveLength(0);
  });
  it('erhält Akronyme beim Ergänzen einer reparierten Suchsicht', () => {
    const index = buildIndex(['Eine SQL- basierte Anwendung verarbeitet Daten. Eine TCP- basierte Verbindung transportiert Daten. Eine API- basierte Schnittstelle verbindet Dienste in diesem synthetischen Test.']);
    for (const query of ['SQL', 'TCP', 'API']) expect(searchIndex(index, query), query).toHaveLength(1);
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
