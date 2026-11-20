// Gemeinsame fachliche Operationen der lokalen API und der öffentlichen PWA.
import { EXAM_PASS_PERCENT, fragenAnzahlFachrichtung, moduleFuerFachrichtung } from './public-content.js';
import { pruefeAntwort, musterloesungFT } from './answer.js';
import { generierePruefung, auswertePruefung } from './exam.js';
import { describeTheoryTopic, findTheoryTopic, listTheory, publicTheorySources } from './theory.js';
import { buildPublicSearchIndex, searchPublicContent, SEARCH_TYPES } from './public-search.js';

const get = (path, run) => ({ method: 'GET', path, run });
const post = (path, run) => ({ method: 'POST', path, run });

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

export function publicContentOperations(store, journey, loadSearchCatalogs) {
  const searchIndexes = new WeakMap();
  return [
    get('/theorie', ({ query }) => listTheory(store.get(), query)),
    get('/theorie/themen/:id', ({ params, query }) => {
      const content = store.get();
      const topic = findTheoryTopic(content, params.id);
      if (!topic) fail(404, 'Thema nicht gefunden');
      const result = describeTheoryTopic(content, topic, query);
      if (topic.kind === 'module') result.reading = content.theorieByModul?.get(topic.moduleIds[0]) || '';
      return result;
    }),
    get('/suche/inhalte', async ({ query }) => {
      const q = typeof query.q === 'string' ? query.q.trim() : '';
      if (q.length < 2 || q.length > 200) fail(400, 'Bitte gib einen Suchbegriff mit 2 bis 200 Zeichen ein.');
      const { typ, seite, limit } = query;
      if (typ && typ !== 'alle' && !SEARCH_TYPES.includes(typ)) fail(400, 'Diese Trefferart ist unbekannt.');
      const content = store.get();
      if (!searchIndexes.has(content)) {
        const [workshop, practices] = await loadSearchCatalogs();
        searchIndexes.set(content, buildPublicSearchIndex(content, journey, workshop, practices));
      }
      return searchPublicContent(searchIndexes.get(content), { q, typ, seite, limit });
    }),
    get('/health', () => {
      const content = store.get();
      return { status: 'ok', geladenAm: content.geladenAm, fragenAnzahl: content.gesamtFragen,
        modulAnzahl: content.modulesById.size, fachrichtungAnzahl: content.fachrichtungenByCode.size, warnungen: content.warnungen.length };
    }),
    get('/konstanten', () => ({
      fachrichtungen: [...store.get().fachrichtungenByCode.keys()], fragetypen: ['SC', 'MC', 'FT'],
      schwierigkeiten: ['leicht', 'mittel', 'schwer'], bestehensgrenzeProzent: EXAM_PASS_PERCENT,
    })),
    get('/fachrichtungen', () => {
      const content = store.get();
      return [...content.fachrichtungenByCode.values()].map(f => ({ ...f, fragenAnzahl: fragenAnzahlFachrichtung(content, f.code) }));
    }),
    get('/module', ({ query }) => {
      const content = store.get();
      const modules = query.fachrichtung ? moduleFuerFachrichtung(content, String(query.fachrichtung)) : [...content.modulesById.values()];
      return modules.map(m => ({ ...m, fragenAnzahl: (content.questionsByModul.get(m.modul_id) || []).length }));
    }),
    get('/module/:modulId', ({ params }) => {
      const content = store.get();
      const module = content.modulesById.get(params.modulId);
      if (!module) fail(404, 'Modul nicht gefunden');
      const questions = content.questionsByModul.get(module.modul_id) || [];
      const verteilung = { SC: 0, MC: 0, FT: 0, leicht: 0, mittel: 0, schwer: 0 };
      for (const f of questions) {
        verteilung[f.typ] = (verteilung[f.typ] || 0) + 1;
        verteilung[f.schwierigkeit] = (verteilung[f.schwierigkeit] || 0) + 1;
      }
      return { ...module, fragenAnzahl: questions.length, verteilung, theorie: content.theorieByModul.get(module.modul_id) || '' };
    }),
    get('/fragen', ({ query }) => {
      const content = store.get();
      const { modulId, fachrichtung, typ, schwierigkeit, limit } = query;
      let questions = modulId ? [...(content.questionsByModul.get(String(modulId)) || [])] : [...content.questionsById.values()];
      if (fachrichtung) questions = questions.filter(f => f.fachrichtung === fachrichtung);
      if (typ) questions = questions.filter(f => f.typ === typ);
      if (schwierigkeit) questions = questions.filter(f => f.schwierigkeit === schwierigkeit);
      const count = Number.parseInt(limit, 10);
      return count > 0 ? questions.slice(0, count) : questions;
    }),
    get('/fragen/:id', ({ params }) => {
      const question = store.get().questionsById.get(params.id);
      if (!question) fail(404, 'Frage nicht gefunden');
      return question;
    }),
    post('/fragen/:id/pruefen', ({ params, body }) => {
      const question = store.get().questionsById.get(params.id);
      if (!question) fail(404, 'Frage nicht gefunden');
      const answer = body?.antwort;
      if (answer == null || String(answer).trim() === '') fail(400, 'Antwort fehlt');
      const { richtig } = pruefeAntwort(question, answer);
      const erwartet = question.typ === 'FT' ? musterloesungFT(question) : question.antwort;
      return { frageId: question.id, typ: question.typ, richtig, erwartet, erklaerung: question.erklaerung, nutzerAntwort: answer };
    }),
    get('/suche', ({ query }) => {
      const content = store.get();
      const q = String(query.q || '').trim().toLowerCase();
      if (q.length < 2) fail(400, 'Suchbegriff zu kurz (mind. 2 Zeichen)');
      const module = [...content.modulesById.values()]
        .filter(m => `${m.titel} ${m.beschreibung}`.toLowerCase().includes(q)).slice(0, 50);
      const fragen = [...content.questionsById.values()]
        .filter(f => `${f.frage} ${f.erklaerung} ${f.thema}`.toLowerCase().includes(q)).slice(0, 100);
      return { q, module, fragen };
    }),
  ];
}

export function publicExamOperations(store) {
  return [
    post('/pruefung/generieren', ({ body }) => {
      const { fachrichtung, anzahl, gewichtung, schwierigkeit } = body || {};
      return generierePruefung(store.get(), {
        fachrichtung, anzahl: Number(anzahl), gewichtung: gewichtung && typeof gewichtung === 'object' ? gewichtung : {}, schwierigkeit,
      });
    }),
    post('/pruefung/auswerten', ({ body }) => auswertePruefung(store.get(), { fragen: body?.fragen })),
  ];
}

export function publicJourneyOperations(journey) {
  return [
    get('/fiae', () => journey.getSummary()),
    get('/fiae/progress-catalog', () => journey.getProgressCatalog()),
    get('/fiae/topics/:topicId', ({ params }) => journey.getTopic(params.topicId)),
    post('/fiae/topics/:topicId/check', ({ params, body }) => journey.check(params.topicId, body)),
    post('/fiae/topics/:topicId/evaluate', ({ params, body }) => journey.evaluate(params.topicId, body)),
  ];
}

// Liefert ausschließlich Fundstellen des veröffentlichten Katalogs.
export function readPublicSources(content, query) {
  const topicId = query.thema || 'search';
  const topic = topicId === 'search' ? null : findTheoryTopic(content, topicId);
  if (topicId !== 'search' && !topic) fail(404, 'Thema nicht gefunden');
  const q = String(query.q || '').trim();
  if (q.length > 200 || (!topic && q.length < 3)) fail(400, 'Bitte gib eine Frage mit 3 bis 200 Zeichen ein.');
  return publicTheorySources(content, topic, q || topic.title);
}
