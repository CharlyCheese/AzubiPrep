import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fileURLToPath } from 'node:url';
import express from 'express';
import request from 'supertest';
import { loadContent } from '../src/content.js';
import { loadJourney } from '../src/journey.js';
import { buildContentRoutes } from '../src/routes/content.routes.js';
import { theoryCatalog } from '../src/theory.js';

// Read only the checked-in public content, even if the developer uses a DB.
vi.mock('../src/config.js', () => ({ config: { frontendDist: fileURLToPath(new URL('./fixtures', import.meta.url)) } }));
const contentDir = fileURLToPath(new URL('../../content', import.meta.url));
const search = (app, q, options = {}) => request(app).get('/api/suche/inhalte').query({ q, ...options }).expect(200);

describe('Öffentliche App-Suche', () => {
  let app, content, snapshot;
  beforeAll(async () => {
    content = await loadContent(contentDir);
    snapshot = content;
    app = express();
    app.use('/api', buildContentRoutes({ get: () => snapshot }, loadJourney(contentDir)));
  });

  it('liefert zu allen veröffentlichten Fragen echte Gesamtzahlen und Seiten auch hinter dem alten Limit', async () => {
    const page = (await search(app, 'Prüfungsfrage', { typ: 'fragen', seite: 3, limit: 50 })).body;
    expect(page.total).toBe(content.questionsById.size);
    expect(page.counts.fragen).toBe(page.total);
    expect(page.results).toHaveLength(50);
    const first = (await search(app, 'Prüfungsfrage', { typ: 'fragen', limit: 50 })).body;
    const ids = new Set(first.results.map(item => item.id));
    expect(page.results.every(item => !ids.has(item.id))).toBe(true);
    const id = [...content.questionsById.keys()].at(-1);
    const direct = (await search(app, id, { typ: 'fragen' })).body.results[0];
    expect(direct).toMatchObject({ id, url: `/quiz/${direct.modulId}?frage=${id}` });
    expect(direct).not.toHaveProperty('antwort');
  });

  it('löst Lernabschnitte, Werkstatt und Theorie-/Glossarthemen exakt auf', async () => {
    const journey = (await search(app, 'Reparaturstatus', { typ: 'lernreise' })).body.results;
    expect(journey.some(hit => hit.url === '/lernreise/fiae/common-lf1-role')).toBe(true);
    expect((await search(app, 'common-lf1-role')).body.results[0].id).toBe('common-lf1-role');
    const lesson = (await search(app, 'course-31-5', { typ: 'werkstatt' })).body.results[0];
    expect(lesson.url).toBe('/frontendkurs?lektion=course-31-5');
    const debuggerHit = (await search(app, 'Haltepunkte', { typ: 'werkstatt' })).body.results;
    expect(debuggerHit.some(hit => hit.url === '/frontendkurs/debugger')).toBe(true);
    const topic = [...theoryCatalog(content).topics.values()].filter(item => item.kind === 'term').at(-1);
    const terms = (await search(app, topic.title, { typ: 'glossar', limit: 50 })).body.results;
    expect(terms.find(hit => hit.id === topic.id)?.url).toContain(encodeURIComponent(topic.id));
    const detail = (await request(app).get('/api/theorie/themen/' + encodeURIComponent(topic.id)).expect(200)).body;
    expect(detail).toMatchObject({ id: topic.id, title: topic.title });
    expect(detail).not.toHaveProperty('questionIds');
    const module = (await request(app).get('/api/theorie/themen/module%3AFIAE-DB').expect(200)).body;
    expect(module.reading).toContain('Relationale Modellierung');
    const field = (await search(app, 'Lernfeld 1', { typ: 'theorie' })).body;
    expect(field.results[0].id).toBe('field:LF1');
    expect(field.results.some(hit => /^field:LF1\d/.test(hit.id))).toBe(false);
    await request(app).get('/api/theorie/themen/unknown').expect(404);
  });

  it('findet die interaktive Gewinnkalkulation und Werkzeuge anhand der veröffentlichten Übungsfelder', async () => {
    const pricing = 'common-pm-pricing';
    expect((await search(app, 'Gewinnkalkulation')).body.results[0].id).toBe(pricing);
    expect((await search(app, 'Kalkulationstabelle Gewinn', { typ: 'lernreise' })).body.results[0].id).toBe(pricing);
    const model = (await search(app, 'Netzwerklabor Netzplan', { typ: 'lernreise' })).body.results[0];
    expect(model.url).toBe('/lernreise/fiae/common-lf3-diagnosis');
  });

  it('verknüpft Wörter, Schreibweisen und technische Langformen und durchsucht öffentliche Erklärungen', async () => {
    const ids = async q => (await search(app, q, { typ: 'fragen' })).body.results.map(item => item.id);
    expect(await ids('Structured Query Language')).toEqual(await ids('SQL'));
    expect(await ids('Primärschlüssel')).toEqual(await ids('Primaerschluessel'));
    const results = (await search(app, 'Namensauflösung DNS', { typ: 'fragen', limit: 50 })).body;
    expect(results.total).toBeGreaterThan(0);
    expect(results.counts.fragen).toBeLessThan((await search(app, 'DNS', { typ: 'fragen' })).body.total);
    expect((await search(app, 'zzzzzznichtvorhanden')).body.total).toBe(0);
  });

  it('verwirft den alten Index nach einem Austausch des Contents und behält die frühere Suchroute bei', async () => {
    const legacy = (await request(app).get('/api/suche?q=Welche').expect(200)).body;
    expect(legacy.fragen).toHaveLength(100);
    const id = 'SYNTHETIC';
    const question = { id, modul_id: 'WISO', thema: 'Synthetisch', frage: 'Welche Bedeutung?', typ: 'FT', erklaerung: 'Eindeutiger Erklaerungstreffer.' };
    try {
      snapshot = { ...content, notes: ['PrivaterTestmarker'], questionsById: new Map([[id, { ...question, quelle: 'PrivaterTestmarker' }]]) };
      const found = (await search(app, 'Erklärungstreffer', { typ: 'fragen' })).body;
      expect(found.results).toMatchObject([{ id, description: question.erklaerung }]);
      expect((await search(app, 'Prüfungsfrage', { typ: 'fragen', seite: 999 })).body.page).toBe(1);
      expect((await search(app, 'PrivaterTestmarker')).body.total).toBe(0);
    } finally {
      snapshot = content;
    }
  });

  it('begrenzt Eingabe und Seitengröße', async () => {
    await request(app).get('/api/suche/inhalte?q=x').expect(400);
    await request(app).get('/api/suche/inhalte').query({ q: 'x'.repeat(201) }).expect(400);
    await request(app).get('/api/suche/inhalte?q=DNS&typ=notizen').expect(400);
    expect((await search(app, 'Prüfungsfrage', { limit: 10000 })).body.results).toHaveLength(50);
  });
});
