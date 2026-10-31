import { describe, expect, it } from 'vitest';
import { THEORY_FIELDS, listTheory, findTheoryTopic, publicTheorySources } from '../src/theory.js';

function fixture() {
  const modulesById = new Map([['HW', { modul_id: 'HW', titel: 'Hardware', fachrichtung: 'ALLE', lernfeld: 'LF2' }], ['WISO', { modul_id: 'WISO', titel: 'Wirtschaft', fachrichtung: 'ALLE', lernfeld: 'KEIN_LF' }]]);
  const questionsById = new Map();
  for (let n = 0; n < 55; n++) questionsById.set(`F${n}`, { id: `F${n}`, modul_id: 'HW', lernfeld: n === 0 ? 'LF3' : 'LF2', thema: `RAM Speicher ${n}`, frage: 'Wozu dient RAM?', erklaerung: 'RAM speichert laufende Programme und Daten im Arbeitsspeicher.' });
  questionsById.set('W1', { id: 'W1', modul_id: 'WISO', lernfeld: 'KEIN_LF', thema: 'Ausbildung', frage: 'Welche Rolle hat der Betrieb?', erklaerung: 'Ausbildung findet im Betrieb und in der Berufsschule statt.' });
  return { modulesById, questionsById, theorieByModul: new Map([['HW', '# Hardware\nRAM ist Arbeitsspeicher.']]) };
}
describe('Öffentlicher Theorie- und Glossarkatalog', () => {
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
