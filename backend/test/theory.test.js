import { describe, expect, it } from 'vitest';
import { THEORY_FIELDS, listTheory, findTheoryTopic, publicTheorySources } from '../src/theory.js';
import { theorySections, SPECIAL_FIELDS } from '../src/theory-outline.js';

function fixture() {
  const modulesById = new Map([['HW', { modul_id: 'HW', titel: 'Hardware', fachrichtung: 'ALLE', lernfeld: 'LF2' }], ['WISO', { modul_id: 'WISO', titel: 'Wirtschaft', fachrichtung: 'ALLE', lernfeld: 'KEIN_LF' }]]);
  const questionsById = new Map();
  for (let n = 0; n < 55; n++) questionsById.set(`F${n}`, { id: `F${n}`, modul_id: 'HW', lernfeld: n === 0 ? 'LF3' : 'LF2', thema: `RAM Speicher ${n}`, frage: 'Wozu dient RAM?', erklaerung: 'RAM speichert laufende Programme und Daten im Arbeitsspeicher.' });
  questionsById.set('W1', { id: 'W1', modul_id: 'WISO', lernfeld: 'KEIN_LF', thema: 'Ausbildung', frage: 'Welche Rolle hat der Betrieb?', erklaerung: 'Ausbildung findet im Betrieb und in der Berufsschule statt.' });
  return { modulesById, questionsById, theorieByModul: new Map([['HW', '# Hardware\nRAM ist Arbeitsspeicher.']]) };
}
describe('Öffentlicher Theorie- und Glossarkatalog', () => {
  it('verwendet zentrale und im ausgewählten Kontext erklärte Abkürzungen in Quellen und Glossar', () => {
    const content = fixture(); content.questionsById.clear(); content.theorieByModul.clear();
    for (const [id, title] of [['D1', 'Domain Name System'], ['D2', 'DNS'], ['T1', 'Test Driven Development (TDD)'], ['T2', 'Test Driven Development']]) content.questionsById.set(id, { id, modul_id: 'HW', lernfeld: 'LF2', thema: title, frage: `Erkläre ${title}.`, erklaerung: `${title} ist ein selbst geschriebener synthetischer Testbegriff.` });
    for (const [short, long] of [['DNS', 'Domain Name System'], ['TDD', 'Test Driven Development']]) {
      const a = publicTheorySources(content, null, short, 6), b = publicTheorySources(content, null, long, 6);
      expect(a.sources.length).toBeGreaterThan(0); expect(a.sources.map(s => s.text)).toEqual(b.sources.map(s => s.text));
      expect(listTheory(content, { mode: 'glossary', q: short }).topics.map(t => t.id)).toEqual(listTheory(content, { mode: 'glossary', q: long }).topics.map(t => t.id));
    }
    expect(publicTheorySources(content, findTheoryTopic(content, 'module:WISO'), 'TDD', 6).sources).toHaveLength(0);
    const separate = fixture(); separate.questionsById.clear(); separate.theorieByModul.set('HW', 'Test Driven Development ohne ausgeschriebene Klammerdefinition.');
    expect(publicTheorySources(separate, null, 'TDD', 6).sources).toHaveLength(0);
    expect(publicTheorySources(content, null, 'Unterschied zwischen Test Driven Development und QUUXUNBEKANNT?', 6).state).toBe('partial_match');
  });
  it('findet IoT und Internet of Things in beiden Richtungen in Quellen und Glossar', () => {
    const content = fixture(); content.questionsById.clear(); content.theorieByModul.clear();
    for (const [id, title] of [['I1', 'IoT'], ['I2', 'Internet of Things']]) content.questionsById.set(id, { id, modul_id: 'HW', lernfeld: 'LF2', thema: title, frage: `Was bedeutet ${title}?`, erklaerung: `${title} vernetzt Geräte mit Sensoren und Aktoren.` });
    const queries = ['Erkläre IoT', 'Erkläre Internet of Things', 'Erkläre INTERNET-OF-THINGS'];
    const sources = queries.map(query => publicTheorySources(content, null, query, 6));
    expect(sources.every(result => result.state === 'ready')).toBe(true);
    expect(sources[0].sources.map(s => s.text)).toEqual(sources[1].sources.map(s => s.text));
    expect(sources[1].sources.map(s => s.text)).toEqual(sources[2].sources.map(s => s.text));
    const topics = ['IoT', 'Internet of Things', 'INTERNET-OF-THINGS'].map(q => listTheory(content, { mode: 'glossary', q }).topics);
    expect(topics[0].map(t => t.id)).toEqual(topics[1].map(t => t.id)); expect(topics[1].map(t => t.id)).toEqual(topics[2].map(t => t.id));
    expect(topics[0].map(t => t.title).sort()).toEqual(['Internet of Things', 'IoT']);
  });
  it('prüft nur tatsächlich übergebene Ausschnitte und hält bei langen Fragen Platz für die Erklärung frei', () => {
    const content = fixture(); content.theorieByModul.clear();
    content.questionsById = new Map([['LONG', { id: 'LONG', modul_id: 'WISO', thema: 'Tarifrecht', frage: 'Ein synthetischer Kontextabschnitt. '.repeat(32), erklaerung: 'Gewerkschaft vertritt Beschäftigte. Arbeitgeberverband vertritt Arbeitgeber.' }]]);
    const result = publicTheorySources(content, findTheoryTopic(content, 'module:WISO'), 'Unterschied zwischen Gewerkschaft und Arbeitgeberverband?', 6);
    expect(result.state).toBe('ready'); expect(result.sources[0].text).toContain('Gewerkschaft vertritt'); expect(result.sources[0].text).toContain('Arbeitgeberverband vertritt');
    const second = fixture(); second.theorieByModul.clear(); second.questionsById = new Map([['CUT', { id: 'CUT', modul_id: 'WISO', thema: 'Tarifrecht', frage: 'Gewerkschaft', erklaerung: 'Synthetischer Kontext. '.repeat(70) + ' Arbeitgeberverband vertritt Arbeitgeber.' }]]);
    expect(publicTheorySources(second, findTheoryTopic(second, 'module:WISO'), 'Unterschied zwischen Gewerkschaft und Arbeitgeberverband?', 6).state).toBe('partial_match');
  });
  it('bevorzugt konkrete Vergleichsbegriffe gegenüber generischen Fragewörtern', () => {
    const content = fixture();
    content.theorieByModul.set('WISO', 'Eine Gewerkschaft bündelt die Interessen der Arbeitnehmer. Ein Arbeitgeberverband bündelt die Interessen der Unternehmen. Beide können miteinander Tarifverträge aushandeln.');
    content.questionsById.set('NOISE', { id: 'NOISE', modul_id: 'WISO', thema: 'Finanzierung', frage: 'Was ist der Unterschied zwischen Eigenkapital und Fremdkapital?', erklaerung: 'Fremdkapital sind Schulden.' });
    const result = publicTheorySources(content, findTheoryTopic(content, 'module:WISO'), 'Unterschied zwischen Gewerkschaften und Arbeitgeber Verbund?', 6);
    expect(result.sources.length).toBeGreaterThan(0); expect(result.sources[0].text).toContain('Interessen'); expect(result.sources.every(source => !source.text.includes('Fremdkapital'))).toBe(true);
    expect(publicTheorySources(content, findTheoryTopic(content, 'module:WISO'), 'Unterschied zwischen Gewerkschaft und QUUXBLAHUNBEKANNT?', 6).state).toBe('partial_match');
  });
  it('gliedert gemeinsame und fachrichtungsspezifische Lernfelder statt nur eine Gesamtfrage anzubieten', () => {
    const content = fixture();
    for (const [field] of [...THEORY_FIELDS, ...SPECIAL_FIELDS]) {
      const topic = findTheoryTopic(content, `field:${field}`); const sections = theorySections(topic);
      expect(sections.length).toBeGreaterThanOrEqual(5); expect(sections.length).toBeLessThanOrEqual(8);
      expect(new Set(sections.map(section => section.id)).size).toBe(sections.length);
      expect(sections.every(section => section.keywords.length > 20)).toBe(true);
    }
    const lf2 = listTheory(content, { field: 'LF2' }).topics.find(topic => topic.id === 'field:LF2');
    expect(lf2.sections.map(section => section.title).join(' ')).toMatch(/Kundenwünsche.*Hardware.*Software.*nachhaltig.*Angebote.*Beschaffung.*übergeben.*auswerten/);
    const fisi = listTheory(content, { fachrichtung: 'FISI' }); expect(fisi.topics.some(topic => topic.id === 'field:LF10b')).toBe(true); expect(fisi.topics.some(topic => topic.id === 'field:LF10a')).toBe(false);
    expect(theorySections(findTheoryTopic(content, 'module:HW'))).toEqual([]);
  });
  it('trennt amtliche Lernfeldeinstiege von vorhandenen Modulen und Fragenthemen', () => {
    const content = fixture(); const overview = listTheory(content);
    expect(THEORY_FIELDS.find(field => field[0] === 'LF2')[1]).toBe('Arbeitsplätze nach Kundenwunsch ausstatten');
    expect(overview.topics.some(topic => topic.id === 'field:LF1')).toBe(true); expect(overview.topics.every(topic => topic.kind !== 'term')).toBe(true);
    const glossary = listTheory(content, { mode: 'glossary', field: 'LF3' }); expect(glossary.total).toBe(1); expect(glossary.topics[0].practice).toEqual({ id: 'F0', moduleId: 'HW' });
    expect(listTheory(content, { module: 'WISO' }).topics.some(topic => topic.id === 'module:WISO')).toBe(true);
  });
  it('begrenzt große Listen, filtert Begriffe und erhält stabile IDs über Neuladen', () => {
    const content = fixture(); const first = listTheory(content, { mode: 'glossary', module: 'HW' }); const second = listTheory(content, { mode: 'glossary', module: 'HW', page: '2' });
    expect(first.total).toBe(55); expect(first.topics).toHaveLength(24); expect(second.topics).toHaveLength(24); expect(first.topics[0].id).not.toBe(second.topics[0].id);
    const search = listTheory(content, { mode: 'glossary', q: 'Speicher 54' }); expect(search.total).toBe(1);
    expect(listTheory(fixture(), { mode: 'glossary', q: 'Speicher 54' }).topics[0].id).toBe(search.topics[0].id);
    expect(findTheoryTopic(content, search.topics[0].id)?.title).toBe('RAM Speicher 54');
  });
  it('sucht nur in öffentlichen App-Inhalten und kennzeichnet Lücken ohne Scheinergebnis', () => {
    const content = fixture(); const topic = findTheoryTopic(content, 'module:HW');
    const result = publicTheorySources(content, topic, 'RAM Arbeitsspeicher'); expect(result.sources.length).toBeGreaterThan(0); expect(result.sources.length).toBeLessThanOrEqual(3); expect(result.sources.every(source => source.kind === 'public' && source.url === '/lernen/HW')).toBe(true);
    expect(publicTheorySources(content, topic, 'QUUXUNBEKANNT').sources).toEqual([]);
    expect(publicTheorySources(content, findTheoryTopic(content, 'module:WISO'), 'RAM').sources).toEqual([]);
    content.theorieByModul.set('HW', 'SynthetischerKurztextBegriff steht nur im öffentlichen Kurztext.');
    expect(publicTheorySources(content, null, 'SynthetischerKurztextBegriff').sources[0].label).toBe('App-Kurztext · HW');
  });
  it('filtert Fachrichtungen und erhält gemeinsame Lernfeldeinstiege', () => {
    const content = fixture(); content.modulesById.set('AE', { modul_id: 'AE', titel: 'Programmierung', fachrichtung: 'FIAE', lernfeld: 'LF11a' });
    const result = listTheory(content, { fachrichtung: 'FISI' });
    expect(result.topics.some(topic => topic.id === 'field:LF1')).toBe(true); expect(result.topics.some(topic => topic.id === 'module:HW')).toBe(true);
    expect(result.topics.some(topic => topic.id === 'module:AE')).toBe(false); expect(result.modules.some(module => module.id === 'AE')).toBe(false);
  });
  it('verweist bei zusammengefassten Begriffen nur auf Fragen der gewählten Fachrichtung und des Moduls', () => {
    const content = fixture();
    content.modulesById.set('DPA-TEST', { modul_id: 'DPA-TEST', fachrichtung: 'DPA', titel: 'Daten', lernfeld: 'LF5' });
    content.modulesById.set('AE-TEST', { modul_id: 'AE-TEST', fachrichtung: 'FIAE', titel: 'Software', lernfeld: 'LF5' });
    content.questionsById.set('D1', { id: 'D1', modul_id: 'DPA-TEST', thema: 'SQL', lernfeld: 'LF5' });
    content.questionsById.set('A1', { id: 'A1', modul_id: 'AE-TEST', thema: 'SQL', lernfeld: 'LF5' });
    for (const filter of [{ fachrichtung: 'FIAE' }, { module: 'AE-TEST' }]) {
      const result = listTheory(content, { ...filter, mode: 'glossary', q: 'SQL' });
      expect(result.topics[0].questionCount).toBe(1); expect(result.topics[0].practice).toEqual({ id: 'A1', moduleId: 'AE-TEST' });
    }
  });
});
