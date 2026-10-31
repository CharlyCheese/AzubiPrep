import { createHash } from 'node:crypto';
import { terms } from './rag-index.js';
import { SPECIAL_FIELDS, theorySections } from './theory-outline.js';
import { searchPlan, scoreSearch, comparisonCovered, diverseSearchHits, repairSearchText, searchAliasText } from './search-query.js';
import { createSearchAliases } from './search-aliases.js';

// Öffentliche Orientierung, keine Gliederung aus privaten Unterlagen.
// KMK-Rahmenlehrplan, Beschluss 13.12.2019 (gemeinsame Lernfelder).
export const THEORY_FIELDS = [
  ['LF1', 'Das Unternehmen und die eigene Rolle im Betrieb beschreiben', ['WISO']],
  ['LF2', 'Arbeitsplätze nach Kundenwunsch ausstatten', ['HARDWARE']],
  ['LF3', 'Clients in Netzwerke einbinden', ['NETZ-GRUND']],
  ['LF4', 'Schutzbedarfsanalyse im eigenen Arbeitsbereich durchführen', ['IT-SEC-GRUND']],
  ['LF5', 'Software zur Verwaltung von Daten anpassen', ['FIAE-PRG', 'FIAE-DB', 'DPA-DB']],
  ['LF6', 'Serviceanfragen bearbeiten', ['FISI-BET', 'PM']],
  ['LF7', 'Cyber-physische Systeme ergänzen', ['DVK-IOT', 'DVK-AUT']],
  ['LF8', 'Daten systemübergreifend bereitstellen', ['FIAE-DB', 'DPA-DB']],
  ['LF9', 'Netzwerke und Dienste bereitstellen', ['NETZ-GRUND', 'DVK-NET']],
];
const cache = new WeakMap();
const primaryField = value => /^LF\d+[a-d]?$/i.test(String(value).split('/')[0]) ? String(value).split('/')[0] : '';
const fieldOf = (question, module) => primaryField(question?.lernfeld || module?.lernfeld) || (module?.modul_id === 'WISO' ? 'WISO' : module?.modul_id === 'PM' ? 'PM' : 'SONSTIGES');
const compareFields = (a, b) => a.localeCompare(b, 'de', { numeric: true });
export function theoryCatalog(content) {
  if (cache.has(content)) return cache.get(content);
  const modules = content.modulesById || new Map(); const questions = [...(content.questionsById?.values() || [])];
  const topics = new Map();
  for (const [field, title, moduleIds] of THEORY_FIELDS) topics.set(`field:${field}`, { id: `field:${field}`, field, title, moduleIds: moduleIds.filter(id => modules.has(id)), kind: 'overview', questionIds: [] });
  for (const [field, title] of SPECIAL_FIELDS) topics.set(`field:${field}`, { id: `field:${field}`, field, title, moduleIds: [...modules.values()].filter(module => primaryField(module.lernfeld) === field).map(module => module.modul_id), kind: 'overview', questionIds: [] });
  for (const module of modules.values()) topics.set(`module:${module.modul_id}`, { id: `module:${module.modul_id}`, field: fieldOf(null, module), title: module.titel, moduleIds: [module.modul_id], kind: 'module', questionIds: [] });
  for (const question of questions) {
    const module = modules.get(question.modul_id); if (!module) continue;
    const title = String(question.thema || '').trim() || module.titel;
    const field = fieldOf(question, module);
    const id = `term:${createHash('sha256').update(`${field}\0${title.normalize('NFKC').toLocaleLowerCase('de')}`).digest('hex').slice(0, 20)}`;
    if (!topics.has(id)) topics.set(id, { id, field, title, moduleIds: [], kind: 'term', questionIds: [] });
    const topic = topics.get(id); topic.questionIds.push(question.id);
    if (!topic.moduleIds.includes(question.modul_id)) topic.moduleIds.push(question.modul_id);
    topics.get(`module:${module.modul_id}`).questionIds.push(question.id);
    topics.get(`field:${field}`)?.questionIds.push(question.id);
  }
  const result = { topics, modules, questions };
  cache.set(content, result); return result;
}
export function findTheoryTopic(content, id) { return theoryCatalog(content).topics.get(id); }
export function listTheory(content, filters = {}) {
  const catalog = theoryCatalog(content);
  const glossary = filters.mode === 'glossary';
  let topics = [...catalog.topics.values()].filter(topic => glossary ? topic.kind === 'term' : topic.kind !== 'term');
  if (filters.field) topics = topics.filter(topic => topic.field === filters.field);
  if (filters.module) topics = topics.filter(topic => topic.moduleIds.includes(filters.module));
  const matchesDirection = module => !filters.fachrichtung || module.fachrichtung === 'ALLE' || module.fachrichtung === filters.fachrichtung;
  if (filters.fachrichtung) topics = topics.filter(topic => topic.kind === 'overview' ? !/[a-d]$/.test(topic.field) || ({ a: 'FIAE', b: 'FISI', c: 'DPA', d: 'DVK' })[topic.field.at(-1)] === filters.fachrichtung : topic.moduleIds.some(id => matchesDirection(catalog.modules.get(id))));
  const aliases = createSearchAliases(topics.map(topic => topic.title));
  const query = terms(searchAliasText(String(filters.q || '').slice(0, 200), aliases));
  if (query.length) topics = topics.filter(topic => { const original = `${topic.title} ${topic.field} ${topic.moduleIds.join(' ')}`; const text = [...terms(original), ...terms(searchAliasText(original, aliases))]; return query.every(word => text.some(value => value.includes(word))); });
  topics.sort((a, b) => compareFields(a.field, b.field) || a.title.localeCompare(b.title, 'de'));
  const page = Math.min(10000, Math.max(1, parseInt(filters.page, 10) || 1)); const size = 24;
  const fields = [...new Set([...catalog.topics.values()].map(topic => topic.field))].sort(compareFields).map(id => ({ id, title: [...THEORY_FIELDS, ...SPECIAL_FIELDS].find(field => field[0] === id)?.[1] || (id === 'WISO' ? 'Wirtschafts- und Sozialkunde' : id === 'PM' ? 'Projektmanagement' : id) }));
  const pageTopics = topics.slice((page - 1) * size, page * size).map(({ questionIds, ...topic }) => {
    const matching = questionIds.filter(id => {
      const question = content.questionsById.get(id);
      return (!filters.module || question.modul_id === filters.module) && matchesDirection(catalog.modules.get(question.modul_id));
    });
    return { ...topic, sections: theorySections(topic), questionCount: matching.length, practice: matching.length ? { id: matching[0], moduleId: content.questionsById.get(matching[0]).modul_id } : null };
  });
  return {
    fields, modules: [...catalog.modules.values()].filter(matchesDirection).map(module => ({ id: module.modul_id, title: module.titel, fachrichtung: module.fachrichtung })),
    topics: pageTopics, total: topics.length, page, pageSize: size,
    glossaryTotal: [...catalog.topics.values()].filter(topic => topic.kind === 'term').length,
  };
}
export function publicTheorySources(content, topic, query, limit = 3) {
  limit = Number.isInteger(limit) ? Math.max(1, Math.min(limit, 6)) : 3;
  const catalog = theoryCatalog(content);
  const questionIds = new Set(topic?.questionIds || []);
  const candidates = [];
  for (const question of catalog.questions) {
    if (topic && !(questionIds.has(question.id) || (topic.kind === 'overview' && topic.moduleIds.includes(question.modul_id)))) continue;
    const text = String(question.erklaerung || '').trim(); if (!text) continue;
    const excerpt = `${String(question.thema || '').slice(0, 100)}: ${String(question.frage || '').slice(0, 220)}\n${text}`.slice(0, 1000);
    candidates.push({ text: excerpt, label: `App-Lerninhalt · ${question.modul_id}`, url: `/lernen/${encodeURIComponent(question.modul_id)}`, preferred: false });
  }
  // Vorhandene öffentliche Kurztexte dienen ergänzend als Kontext, nicht als
  // Behauptung einer neuen Fachprüfung oder eines vollständigen Lehrbuchs.
  for (const moduleId of topic ? topic.moduleIds : catalog.modules.keys()) {
    const text = content.theorieByModul?.get(moduleId) || '';
    for (let start = 0; start < text.length; start += 900) {
      const excerpt = text.slice(start, start + 1000);
      candidates.push({ text: excerpt, label: `App-Kurztext · ${moduleId}`, url: `/lernen/${encodeURIComponent(moduleId)}`, preferred: true });
    }
  }
  const aliases = createSearchAliases(candidates.map(candidate => candidate.text));
  for (const candidate of candidates) candidate.words = new Set([...terms(candidate.text), ...terms(repairSearchText(candidate.text, aliases))]);
  const vocabulary = new Set(candidates.flatMap(candidate => [...candidate.words])); const plan = searchPlan(query, vocabulary, aliases);
  const ranked = candidates.map(candidate => ({ ...candidate, ...scoreSearch(plan, candidate.words) })).filter(candidate => candidate.score > 0).map(candidate => ({ ...candidate, score: candidate.score + Number(candidate.preferred) * 0.1 }));
  const selected = diverseSearchHits(ranked, limit, (candidate, chosen) => !chosen.some(source => source.text === candidate.text));
  if (!comparisonCovered(query, selected, aliases)) return { sources: [], state: 'partial_match' };
  const sources = selected.map(({ words: _words, preferred: _preferred, ...candidate }, index) => ({ id: `S${index + 1}`, ...candidate, kind: 'public' }));
  return { sources, state: sources.length ? 'ready' : 'no_match' };
}
