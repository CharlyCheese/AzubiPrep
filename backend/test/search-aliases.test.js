import { describe, expect, it } from 'vitest';
import { IT_ALIASES, DEFAULT_ALIASES, ALIAS_LIMITS, createSearchAliases } from '../src/search-aliases.js';
import { searchPlan, scoreSearch, comparisonCovered, repairSearchText } from '../src/search-query.js';
import { buildIndex, searchIndex } from '../src/rag-index.js';

describe('Gemeinsame IT-Abkürzungsauflösung', () => {
  it('führt eine belegte zentrale Liste mit eindeutigen vollständigen Langformen', () => {
    expect(IT_ALIASES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(IT_ALIASES.map(entry => entry.abbreviation.toLowerCase())).size).toBe(IT_ALIASES.length);
    const forms = IT_ALIASES.flatMap(entry => entry.forms.map(form => form.toLowerCase()));
    expect(new Set(forms).size).toBe(forms.length);
    for (const entry of IT_ALIASES) {
      expect(entry.source).toMatch(/^https:\/\//);
      for (const form of entry.forms) {
        expect(DEFAULT_ALIASES.normalize(form)).toBe(entry.abbreviation);
        expect(DEFAULT_ALIASES.normalize(form.toUpperCase().replaceAll(' ', '- '))).toBe(entry.abbreviation);
      }
    }
  });
  it('findet alle zentralen Paare in beiden Richtungen mit unveränderten alten Indextexten', () => {
    for (const entry of IT_ALIASES) {
      const pages = [entry.abbreviation, entry.forms[0]].map(value => `${value} ist hier der untersuchte Fachbegriff. Diese selbst geschriebene synthetische Seite dient nur der Prüfung eines Suchäquivalents ohne neue fachliche Aussagen.`);
      const index = JSON.parse(JSON.stringify(buildIndex(pages))); const before = JSON.stringify(index);
      const short = searchIndex(index, `Erkläre ${entry.abbreviation}`), long = searchIndex(index, `Erkläre ${entry.forms[0]}`);
      expect(short.map(hit => hit.page), entry.abbreviation).toEqual(long.map(hit => hit.page));
      expect(new Set(short.map(hit => hit.page)), entry.abbreviation).toEqual(new Set([1, 2]));
      expect(JSON.stringify(index)).toBe(before);
    }
  });
  it('ersetzt längste Formen zuerst und erhält Wortgrenzen sowie technische Unterschiede', () => {
    expect(DEFAULT_ALIASES.normalize('Wireless Local Area Network / Relational Database Management System / Hypertext Transfer Protocol Secure / JavaScript Object Notation')).toBe('WLAN / RDBMS / HTTPS / JSON');
    expect(DEFAULT_ALIASES.normalize('XDomain Name System / Domain Name Systematik / Domain_Name_System')).toBe('XDomain Name System / Domain Name Systematik / Domain_Name_System');
    for (const [a, b] of [['HTTP', 'HTTPS'], ['RAM', 'ROM'], ['IPv4', 'IPv6'], ['SSL', 'TLS'], ['WLAN', 'LAN'], ['DBMS', 'RDBMS']]) {
      expect(scoreSearch(searchPlan(a, [b.toLowerCase()]), [b.toLowerCase()]).score, `${a}/${b}`).toBe(0);
      expect(scoreSearch(searchPlan(b, [a.toLowerCase()]), [a.toLowerCase()]).score, `${b}/${a}`).toBe(0);
    }
    expect(repairSearchText('Cascading- Style Sheets')).toBe('CSS');
  });
  it('lernt nur passende explizite Klammerdefinitionen aus dem übergebenen Kontext', () => {
    const aliases = createSearchAliases(['Wir verwenden Test Driven Development (TDD).', 'ETL (Extract Transform Load) wird hier erklärt.']);
    expect(aliases.learnedCount).toBe(2);
    expect(aliases.normalize('test-driven-development und Extract Transform Load')).toBe('TDD und ETL');
    expect(DEFAULT_ALIASES.normalize('Test Driven Development')).toBe('Test Driven Development');
    expect(createSearchAliases().learnedCount).toBe(0);
    expect(createSearchAliases(['Test Driven Development (XYZ)']).learnedCount).toBe(0);
    expect(createSearchAliases(['Vorhergehende Dokumentationsrichtlinien beschreiben nachfolgende Implementierungsanforderungen des Test Driven Development (TDD).']).normalize('Test Driven Development')).toBe('TDD');
    const query = 'Unterschied zwischen Test Driven Development und RAM?';
    const hit = scoreSearch(searchPlan(query, ['tdd'], aliases), ['tdd']);
    expect(comparisonCovered(query, [hit], aliases)).toBe(false);
  });
  it('verwirft Konflikte und schützt bekannte sowie mehrdeutige Kürzel vor Umdefinition', () => {
    const aliases = createSearchAliases(['Test Driven Development (TDD). Test Data Design (TDD). Control Policy Unit (CPU). Media Access Control (MAC). Network Attached Storage (NAS). Content Management System (CMS).']);
    expect(aliases.learnedCount).toBe(0);
    expect(aliases.normalize('Test Driven Development / Control Policy Unit / Media Access Control / Network Attached Storage')).toBe('Test Driven Development / Control Policy Unit / Media Access Control / Network Attached Storage');
    expect(aliases.normalize('Central Processing Unit')).toBe('CPU');
    const overwrite = createSearchAliases(['Database Management System (DMS). Relational Database Management System (RDMS). Security Information and Event Management (SIAEM).']);
    expect(overwrite.learnedCount).toBe(0);
    expect(overwrite.normalize('Database Management System / Relational Database Management System / Security Information and Event Management')).toBe('DBMS / RDBMS / SIEM');
    const collision = createSearchAliases(['Identity Privacy and Management (IPAM). Identity Privacy and Management (IPM).']);
    expect(collision.learnedCount).toBe(0);
  });
  it('begrenzt Erkennung und Ergebnis, ohne fremden oder vorherigen Kontext zu übernehmen', () => {
    const definitions = Array.from({ length: ALIAS_LIMITS.learned + 20 }, (_, n) => { const letters = ['Q', String.fromCharCode(65 + Math.floor(n / 26)), String.fromCharCode(65 + n % 26)]; return `${letters.map(letter => `${letter}wort`).join(' ')} (${letters.join('')})`; });
    expect(createSearchAliases(definitions).learnedCount).toBe(ALIAS_LIMITS.learned);
    const full = createSearchAliases([...definitions.slice(0, ALIAS_LIMITS.learned - 1), 'Alpha Beta and Gamma (ABAG).', 'Alpha Beta and Gamma (ABG).']);
    expect(full.learnedCount).toBe(ALIAS_LIMITS.learned - 1);
    expect(full.normalize('Alpha Beta and Gamma')).toBe('Alpha Beta and Gamma');
    const first = createSearchAliases(['Test Driven Development (TDD)']);
    const second = createSearchAliases(['Andere Unterlagen ohne Definition.']);
    expect(first.normalize('Test Driven Development')).toBe('TDD');
    expect(second.normalize('Test Driven Development')).toBe('Test Driven Development');
    expect(createSearchAliases(['x'.repeat(100000)]).learnedCount).toBe(0);
  });
});
