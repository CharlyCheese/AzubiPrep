import { describe, expect, it } from 'vitest';
import { searchPlan, scoreSearch, comparisonCovered, diverseSearchHits, searchQueryInfo } from '../src/search-query.js';

describe('Begrenzte Suchnormalisierung', () => {
  it('erkennt Internet of Things als ein IoT-Konzept mit konsistenten Vergleichspositionen', () => {
    for (const spelling of ['Internet of Things', 'INTERNET OF THINGS', 'Internet-of-Things', 'Internet- of Things', 'Internet\nof\tThings']) {
      expect(scoreSearch(searchPlan(`Erkläre ${spelling}`, ['iot']), ['iot']).matched).toEqual([0]);
    }
    const query = 'Unterschied zwischen Internet of Things und RAM?';
    const plan = searchPlan(query, ['iot', 'ram']);
    expect(comparisonCovered(query, [scoreSearch(plan, ['iot'])])).toBe(false);
    expect(comparisonCovered(query, [scoreSearch(plan, ['iot', 'ram'])])).toBe(true);
    const wrapped = 'Unterschied zwischen Internet\nof Things und RAM?';
    expect(comparisonCovered(wrapped, [scoreSearch(searchPlan(wrapped, ['iot', 'ram']), ['iot'])])).toBe(false);
    for (const query of ['Internet', 'Internet of Thing', 'Internet of Thingsystem', 'XInternet of Things']) {
      expect(scoreSearch(searchPlan(query, ['iot']), ['iot']).score, query).toBe(0);
    }
    expect(scoreSearch(searchPlan('Internet of Things', ['internet']), ['internet']).score).toBe(0);
  });
  it('versteht Wortformen und die getrennte nahe Schreibweise ohne fest verdrahtete Fachantwort', () => {
    const vocabulary = ['gewerkschaft', 'arbeitgeberverbaenden', 'arbeitnehmer', 'unternehmen'];
    const plan = searchPlan('Was ist der Unterschied zwischen Gewerkschaften und Arbeitgeber Verbund?', vocabulary);
    expect(plan).toHaveLength(2); expect(scoreSearch(plan, vocabulary).matched).toEqual([0, 1]);
    expect(scoreSearch(plan, ['gewerkschaft']).matched).toEqual([0]);
  });
  it('setzt technische Kurzbegriffe und ähnliche Vertretungsgremien nicht gleich', () => {
    expect(scoreSearch(searchPlan('ROM', ['ram']), ['ram']).score).toBe(0);
    expect(scoreSearch(searchPlan('Betriebsrat', ['arbeitgeberverband', 'gewerkschaft']), ['gewerkschaft']).score).toBe(0);
    expect(searchPlan('Bitte erkläre mir den Unterschied', ['tarifvertrag'])).toEqual([]);
    expect(searchQueryInfo('Arbeitgeber Verbund ohne Tarifvergleich').note).toBe('');
    expect(searchQueryInfo('Gewerkschaft und Arbeitgeber Verbund').note).toContain('Arbeitgeberverband');
    const unrelated = ['gewerkschaft', 'arbeitgeber', 'verbund'];
    const query = 'Unterschied zwischen Gewerkschaft und Arbeitgeber Verbund';
    expect(comparisonCovered(query, [scoreSearch(searchPlan(query, unrelated), unrelated)])).toBe(false);
  });
  it('verlangt bei einem erkannten Vergleich Belege für beide Seiten', () => {
    const query = 'Unterschied zwischen RAM und ROM?';
    expect(comparisonCovered(query, [{ matched: [0] }])).toBe(false);
    expect(comparisonCovered(query, [{ matched: [0] }, { matched: [1] }])).toBe(true);
    const hits = diverseSearchHits([{ score: 20, matched: [0] }, { score: 19, matched: [0] }, { score: 1, matched: [1] }], 2);
    expect(hits.map(hit => hit.matched)).toEqual([[0], [1]]);
  });
  it('zählt Kontextwörter und gemeinsame Oberbegriffe nicht als Ersatz für fehlende Vergleichsbegriffe', () => {
    for (const [query, vocabulary] of [
      ['Unterschied zwischen Gewerkschaft und Arbeitgeberverband bei Arbeitszeit', ['gewerkschaft', 'arbeitszeit']],
      ['Vergleiche Gewerkschaft mit Arbeitgeberverband', ['gewerkschaft']],
      ['Wie unterscheidet sich eine Gewerkschaft von einem Arbeitgeberverband?', ['gewerkschaft']],
      ['Wie unterscheiden sich dynamischem RAM und statischem RAM?', ['ram']],
      ['Unterschied zwischen Arbeitgeber und Verband', ['arbeitgeberverband']],
    ]) {
      const hit = scoreSearch(searchPlan(query, vocabulary), vocabulary);
      expect(comparisonCovered(query, [hit]), query).toBe(false);
    }
    const query = 'Vergleiche Gewerkschaft mit Arbeitgeberverband bei Arbeitszeit';
    const vocabulary = ['gewerkschaft', 'arbeitgeberverband'];
    expect(comparisonCovered(query, [scoreSearch(searchPlan(query, vocabulary), vocabulary)])).toBe(true);
  });
  it('findet Genitivformen und verlangt bei aufgeteilten Quellbegriffen beide Wortteile', () => {
    expect(scoreSearch(searchPlan('Inhalt des Speichers', ['speicher']), ['speicher']).score).toBeGreaterThan(0);
    expect(scoreSearch(searchPlan('Leistung des Computers', ['computer']), ['computer']).score).toBeGreaterThan(0);
    expect(scoreSearch(searchPlan('Aufbau der Netze', ['netz']), ['netz']).score).toBeGreaterThan(0);
    const plan = searchPlan('Arbeitgeberverband', ['arbeitgeber', 'verbaende']);
    expect(scoreSearch(plan, ['arbeitgeber', 'verbaende']).score).toBeGreaterThan(0);
    expect(scoreSearch(plan, ['arbeitgeber']).score).toBe(0);
    const split = searchPlan('Arbeitgeberverband', ['arbeiten', 'arbeit', 'geberverbaende']);
    expect(scoreSearch(split, ['arbeit', 'geberverbaende']).score).toBeGreaterThan(0);
    expect(scoreSearch(split, ['arbeit']).score).toBe(0);
  });
  it('begrenzt lange Abfragen und Trefferlisten', () => {
    const plan = searchPlan('datenbank '.repeat(1000), ['datenbank', 'datenbanken']);
    expect(plan.length).toBeLessThanOrEqual(24); expect(plan.every(concept => concept.variants.length <= 6)).toBe(true);
    expect(diverseSearchHits(Array.from({ length: 100 }, (_, n) => ({ score: n, matched: [0] })), 6)).toHaveLength(6);
  });
});
