import { afterEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import http from 'node:http';
import path from 'node:path';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { createJourneyAiService, JOURNEY_AI_LIMITS } from '../src/journey-ai.js';
import { AiError } from '../src/ai-error.js';
vi.mock('../src/config.js', () => ({ config: {} }));
import { createAiService } from '../src/ai.js';
import { loadJourney } from '../src/journey.js';

const topic = {
  id: 'common-lf1-role', version: '1.0.0', title: 'Unternehmen und Rollen',
  objectives: [{ id: 'goal-1', text: 'Leistung und Kundennutzen unterscheiden.' }, { id: 'goal-2', text: 'Rollen erklären.' }],
  caseStudy: { title: 'Öffentlicher Fall', text: 'Ein kleiner IT-Dienstleister richtet Arbeitsplätze ein.' },
  blocks: [{ id: 'block-1', title: 'Kundennutzen', objectiveIds: ['goal-1'], paragraphs: ['Eine Leistung kann ein eingerichteter Arbeitsplatz sein. Der Nutzen ist störungsfreies Arbeiten.'], takeaway: 'Leistung und Nutzen unterscheiden.', example: { title: 'Beispiel', text: 'Eingerichtete Rechner unterstützen die tägliche Arbeit.' }, misconception: { claim: 'Preis ist stets der Nutzen.', correction: 'Kunden wollen vor allem ihren Bedarf erfüllen.' } }],
  interview: [{ id: 'question-1', objectiveIds: ['goal-1'], blockIds: ['block-1'], prompt: 'Was unterscheidet Leistung und Nutzen?', keyPoints: ['Leistung ist das Angebot.', 'Nutzen erfüllt den Bedarf.'], acceptableAlternatives: ['Kundenvorteil statt Nutzen.'], misconceptions: ['Preis ist Nutzen.'], sampleAnswer: 'Der eingerichtete Rechner hilft beim Arbeiten.', followUp: 'Welchen Bedarf hat der Kunde?' }],
  exam: { questions: [{ frage: 'EXAM_SENTINEL', answer: 'SECRET_EXAM_ANSWER' }] },
};
const body = (changes = {}) => ({ topicId: topic.id, version: topic.version, kind: 'reflection', targetId: 'question-1', provider: 'qwen', model: 'qwen3:4b', useMaterial: false, ...changes });
const valid = () => ({ text: 'Du beschreibst den Kundenvorteil. Unterscheide noch die konkrete Leistung.', followUp: 'Welche Leistung ermöglicht das?', objectiveIds: ['goal-1'] });
function fixture(options = {}) {
  const generate = options.generate || vi.fn(async () => valid());
  const rag = options.rag || { retrieve: vi.fn(), assertCurrent: vi.fn() };
  const service = createJourneyAiService({ getTopic: id => id === topic.id ? topic : null, generate, rag, ...options });
  const start = changes => service.start(body(changes));
  const turn = (session, answer = 'Der Kunde möchte zuverlässig arbeiten.', requestId = randomUUID(), signal) => service.turn({ sessionId: session.sessionId, requestId, answer }, signal);
  return { service, start, turn, generate, rag };
}

describe('Flüchtige, begrenzte Lernreisegespräche', () => {
  it('startet mit fester Frage ohne Transport und lässt nur geprüfte Zielkontexte zu', async () => {
    const { service, start, generate, turn } = fixture();
    const session = start();
    expect(session).toMatchObject({ privacy: 'public', opening: topic.interview[0].prompt, maxTurns: 4, objectiveIds: ['goal-1'] });
    expect(generate).not.toHaveBeenCalled();
    await turn(session);
    const sent = generate.mock.calls[0][0];
    const input = JSON.parse(sent.messages[1].content);
    expect(input.learningContext.reflection.acceptableAlternatives).toEqual(topic.interview[0].acceptableAlternatives);
    expect(Object.keys(input.learningContext.reflection)).toEqual(['prompt', 'keyPoints', 'acceptableAlternatives']);
    expect(input.learningContext).not.toHaveProperty('blocks');
    expect(JSON.stringify(input)).not.toContain('misconceptions');
    expect(JSON.stringify(input)).not.toContain('sampleAnswer');
    expect(JSON.stringify(input)).not.toContain(topic.blocks[0].misconception.claim);
    expect(JSON.stringify(sent)).not.toContain('EXAM_SENTINEL');
    expect(JSON.stringify(sent)).not.toContain('goal-2');
    expect(sent.messages[0].content).toContain('gleichwertige');
    expect(sent.schema.additionalProperties).toBe(false);
    for (const change of [{ targetId: 'foreign' }, { version: '2.0.0' }, { provider: 'none' }, { model: 'qwen3:cloud' }, { context: topic }, { useMaterial: 'yes' }]) expect(() => start(change)).toThrow();
    expect(() => service.start({ ...body(), useMaterial: true, provider: 'chatgpt' })).toThrow();
  });
  it('begrenzt Theorie auf den gewählten Block', async () => {
    const { start, turn, generate } = fixture();
    const session = start({ kind: 'theory', targetId: 'block-1' });
    expect(session.opening).toContain('Kundennutzen');
    await turn(session, 'Erkläre den Unterschied einfacher.');
    const input = JSON.parse(generate.mock.calls[0][0].messages[1].content);
    expect(input.learningContext.blocks).toHaveLength(1);
    expect(input.learningContext).not.toHaveProperty('reflection');
    expect(generate.mock.calls[0][0].messages[0].content).toContain('aktuelle Frage');
    expect(generate.mock.calls[0][0].messages[0].content).toContain('angestrebte Wirkung');
    expect(generate.mock.calls[0][0].outputTokens).toBe(1400);
  });
  it.each(['Leistung: Einrichtung, Nutzen: verlässlich arbeiten.', 'Leistung und Nutzen sind dasselbe.', 'Ein startklarer Rechner hilft dem Team im Alltag.', 'Schreibe ein Kochrezept.'])('reicht Antworten unverändert an den Kernpunkte-Kontext weiter: %s', async answer => {
    const { start, turn, generate } = fixture();
    const result = await turn(start(), answer);
    const sent = generate.mock.calls[0][0];
    const input = JSON.parse(sent.messages[1].content);
    expect(input.currentContribution).toEqual({ question: topic.interview[0].prompt, answer });
    expect(sent.messages[0].content).toContain('höchstens drei kurzen Sätzen');
    expect(sent.messages[0].content).toContain('Prüfe den Sinn, nicht die Wortwahl');
    expect(sent.messages[0].content).toContain('vollständig fachlich gleichwertige Antwort braucht keine Verbesserung');
    expect(sent.messages[0].content).toContain('currentContribution.question ist die gestellte Lernfrage');
    expect(sent.messages[0].content).toContain('currentContribution.answer ist der Beitrag dazu');
    expect(sent.messages[0].content).toContain('Stilbeispiel für fachfremde Beiträge');
    expect(sent.messages[0].content).toContain('followUp wiederholt die gestellte Lernfrage');
    expect(sent.messages[0].content.length).toBeLessThan(1000);
    expect(Object.keys(input).at(-1)).toBe('currentContribution');
    expect(sent.outputTokens).toBe(600);
    expect(result).not.toHaveProperty('passed');
    expect(result).not.toHaveProperty('score');
  });
  it('bezieht den nächsten eigenen Beitrag auf die zuletzt gestellte Rückfrage', async () => {
    const { start, turn, generate } = fixture({ generate: vi.fn(async () => ({ ...valid(), text: 'MODEL_JUDGMENT_SENTINEL: Diese frühere Modellbewertung ist keine fachliche Quelle.' })) }); const session = start();
    await turn(session, 'Der Kunde möchte verlässlich arbeiten.');
    await turn(session, 'Dafür richten wir die Arbeitsplätze ein.');
    const input = JSON.parse(generate.mock.calls[1][0].messages[1].content);
    expect(input.currentContribution).toEqual({ question: valid().followUp, answer: 'Dafür richten wir die Arbeitsplätze ein.' });
    expect(input.conversation).toEqual([{ question: topic.interview[0].prompt, answer: 'Der Kunde möchte verlässlich arbeiten.' }]);
    expect(JSON.stringify(input)).not.toContain('MODEL_JUDGMENT_SENTINEL');
  });
  it('bindet Wiederholungen an Eingaben, zählt genau vier Turns und verhindert parallele Aufträge', async () => {
    let release;
    const generate = vi.fn(() => new Promise(resolve => { release = resolve; }));
    const { start, turn } = fixture({ generate });
    const session = start(); const requestId = randomUUID();
    const pending = turn(session, 'Eigene Antwort', requestId);
    await expect(turn(session, 'Eigene Antwort', requestId)).rejects.toMatchObject({ code: 'pending' });
    await expect(turn(session, 'Andere Antwort', requestId)).rejects.toMatchObject({ code: 'request' });
    await expect(turn(session)).rejects.toMatchObject({ code: 'busy' });
    release(valid()); const result = await pending;
    result.text = 'Manipulierter Rückgabewert';
    expect((await turn(session, 'Eigene Antwort', requestId)).text).not.toBe(result.text);
    expect(generate).toHaveBeenCalledTimes(1);
    generate.mockImplementation(async () => valid());
    for (let count = 2; count <= 4; count++) expect((await turn(session)).turn).toBe(count);
    await expect(turn(session)).rejects.toMatchObject({ code: 'turn_limit' });
    expect(generate).toHaveBeenCalledTimes(4);
  });
  it('verwirft verspätete Antworten nach Ende, Abbruch, Ablauf und Kontowechsel', async () => {
    for (const action of ['end', 'abort', 'expire', 'cancel']) {
      let release; let time = 100;
      const { service, start, turn } = fixture({ now: () => time, generate: () => new Promise(resolve => { release = resolve; }) });
      const session = start(); const controller = new AbortController();
      const pending = turn(session, 'Antwort', randomUUID(), controller.signal);
      if (action === 'end') service.end({ sessionId: session.sessionId });
      if (action === 'abort') controller.abort();
      if (action === 'expire') time += JOURNEY_AI_LIMITS.ttlMs;
      if (action === 'cancel') service.cancelAll();
      release(valid());
      await expect(pending).rejects.toMatchObject({ code: 'aborted' });
      await expect(turn(session)).rejects.toMatchObject({ code: 'session' });
    }
  });
  it('begrenzt Sitzungen und Lebensdauer ohne Persistenz', () => {
    let time = 100; const { start } = fixture({ now: () => time });
    for (let count = 0; count < 20; count++) start();
    expect(() => start()).toThrow();
    time += JOURNEY_AI_LIMITS.ttlMs;
    expect(() => start()).not.toThrow();
  });
  it('entfernt abgelaufene Sitzungen durch einen Timer auch ohne weiteren Aufruf', async () => {
    vi.useFakeTimers();
    try {
      let release;
      const { service, start, turn, generate } = fixture({ now: () => 100, generate: vi.fn(() => new Promise(resolve => { release = resolve; })) });
      const session = start(); const pending = turn(session);
      await vi.advanceTimersByTimeAsync(JOURNEY_AI_LIMITS.ttlMs);
      expect(generate.mock.calls[0][0].signal.aborted).toBe(true);
      release(valid()); await expect(pending).rejects.toMatchObject({ code: 'aborted' });
      expect(service.end({ sessionId: session.sessionId })).toEqual({ ended: true });
    } finally { vi.useRealTimers(); }
  });
  it('wiederholt dieselbe fehlgeschlagene Anfrage mit derselben Eingabe ohne zusätzlichen Turn', async () => {
    const generate = vi.fn().mockRejectedValueOnce(new AiError('timeout', 'Bitte erneut versuchen.', 504)).mockResolvedValue(valid());
    const { start, turn } = fixture({ generate }); const session = start(); const requestId = randomUUID();
    await expect(turn(session, 'Meine Antwort', requestId)).rejects.toMatchObject({ code: 'timeout' });
    await expect(turn(session, 'Geänderte Antwort', requestId)).rejects.toMatchObject({ code: 'request' });
    expect(await turn(session, 'Meine Antwort', requestId)).toMatchObject({ turn: 1, remainingTurns: 3 });
    expect(await turn(session, 'Meine Antwort', requestId)).toMatchObject({ turn: 1, remainingTurns: 3 });
    expect(generate).toHaveBeenCalledTimes(2);
  });
  it('weist fremde Felder, falsche Ziele und übergroße Ausgaben zurück', async () => {
    const malformed = [{ ...valid(), passed: true }, { ...valid(), objectiveIds: ['goal-2'] }, { ...valid(), objectiveIds: ['goal-1', 'goal-1'] }, { ...valid(), text: 'x'.repeat(4001) }, { ...valid(), followUp: 'x'.repeat(501) }, { ...valid(), text: '<script>alert(1)</script>' }, { ...valid(), text: '```js\nrun()\n```' }, { text: 'Text', objectiveIds: ['goal-1'] }];
    for (const value of malformed) {
      const { start, turn } = fixture({ generate: async () => value });
      await expect(turn(start())).rejects.toMatchObject({ code: 'response' });
    }
    const { service, start, turn, generate } = fixture(); const session = start();
    await expect(turn(session, 'x'.repeat(2001))).rejects.toMatchObject({ code: 'input' });
    await expect(service.turn({ sessionId: session.sessionId, requestId: randomUUID(), answer: 'Text', provider: 'chatgpt' })).rejects.toMatchObject({ code: 'input' });
    await expect(service.turn({ sessionId: session.sessionId, requestId: [randomUUID()], answer: 'Text' })).rejects.toMatchObject({ code: 'input' });
    await expect(service.turn({ sessionId: [session.sessionId], requestId: randomUUID(), answer: 'Text' })).rejects.toMatchObject({ code: 'input' });
    expect(() => service.end({ sessionId: [session.sessionId] })).toThrow();
    expect(generate).not.toHaveBeenCalled();
  });
  it.each(['qwen', 'chatgpt'])('verwirft reine Echos der Eingabe oder Lernfrage ohne fachliche Benotung (%s)', async provider => {
    for (const echoed of ['Meine eigene ANTWORT', topic.interview[0].prompt]) {
      const { start, turn } = fixture({ generate: async () => ({ ...valid(), text: `  ${echoed.toLowerCase().replaceAll(' ', '  ')}\n` }) });
      const session = start({ provider, model: provider === 'qwen' ? 'qwen3:4b' : 'synthetic' });
      await expect(turn(session, 'Meine eigene Antwort')).rejects.toMatchObject({ code: 'response', status: 502, message: expect.stringContaining('keine eigenständige Rückmeldung') });
    }
  });
  it('verwirft das Echo einer aktuellen Folgefrage und lässt dieselbe Anfrage wiederholen', async () => {
    const generate = vi.fn().mockResolvedValueOnce(valid()).mockResolvedValueOnce({ ...valid(), text: valid().followUp }).mockResolvedValue(valid());
    const { start, turn } = fixture({ generate }); const session = start(); const requestId = randomUUID();
    await turn(session);
    await expect(turn(session, 'Wir richten die Rechner ein.', requestId)).rejects.toMatchObject({ code: 'response' });
    expect(await turn(session, 'Wir richten die Rechner ein.', requestId)).toMatchObject({ turn: 2 });
  });
});

describe('Private Herkunft und Fehlergrenzen', () => {
  const source = { id: 'S1', label: 'PRIVATE_TITLE_SENTINEL', documentId: 'PRIVATE_DOCUMENT_SENTINEL', page: 17, text: 'SYNTHETIC_PRIVATE_SOURCE: Eine rein erfundene interne Erklärung mit ausreichend langem Wortlaut für die Schutzprüfung.' };
  const retrieval = { revision: 'synthetic-v1', state: 'ready', sources: [source] };
  it('bindet den ganzen Verlauf privat, prüft den Quellstand und liefert keine Quellenmetadaten', async () => {
    const rag = { retrieve: vi.fn(async () => retrieval), assertCurrent: vi.fn(async () => {}) };
    const { start, turn, generate } = fixture({ rag });
    const session = start({ useMaterial: true });
    const first = await turn(session); await turn(session, 'Und welches Beispiel passt dazu?');
    expect(first.privacy).toBe('local-private');
    expect(JSON.stringify(first)).not.toContain('PRIVATE_'); expect(first).not.toHaveProperty('sources');
    expect(rag.assertCurrent).toHaveBeenCalledTimes(5);
    expect(rag.retrieve.mock.calls[0][0]).toContain(topic.blocks[0].title);
    for (const [sent] of generate.mock.calls) {
      expect(sent.provider).toBe('qwen'); expect(sent.privateContext).toBe(true);
      expect(sent.messages[1].content).toContain('SYNTHETIC_PRIVATE_SOURCE');
      expect(sent.messages[1].content).not.toContain('PRIVATE_TITLE_SENTINEL');
      expect(JSON.parse(sent.messages[1].content).learningContext).not.toHaveProperty('blocks');
    }
    expect(JSON.parse(generate.mock.calls[1][0].messages[1].content).conversation).toHaveLength(1);
    const publicSession = start({ provider: 'chatgpt', model: 'gpt-synthetic' }); await turn(publicSession, 'Öffentliche Frage');
    const cloud = generate.mock.calls.at(-1)[0];
    expect(cloud.privateContext).toBe(false); expect(cloud.messages[1].content).not.toContain('SYNTHETIC_PRIVATE_SOURCE');
    expect(JSON.parse(cloud.messages[1].content).conversation).toEqual([]);
  });
  it('sperrt private Cloudanfragen vor Transport und private Originalübernahmen in Ausgaben', async () => {
    const rag = { retrieve: vi.fn(async () => retrieval), assertCurrent: vi.fn(async () => {}) };
    const { start, generate } = fixture({ rag });
    expect(() => start({ useMaterial: true, provider: 'chatgpt', model: 'gpt-synthetic' })).toThrow();
    expect(generate).not.toHaveBeenCalled(); expect(rag.retrieve).not.toHaveBeenCalled();
    for (const text of [source.text, source.label, source.documentId]) {
      const { start: privateStart, turn } = fixture({ rag, generate: async () => ({ ...valid(), text }) });
      await expect(turn(privateStart({ useMaterial: true }))).rejects.toMatchObject({ code: 'response' });
    }
  });
  it('sperrt kürzere private Originalzitate, normalisierte Metadaten und Quellenkennungen', async () => {
    const privateSource = { ...source, text: 'PRIVATE_SHORT_SENTINEL ist der geheime Lehrsatz. Weiterer synthetischer Testtext mit mehr als achtzig Zeichen Gesamtlänge.' };
    const rag = { retrieve: async () => ({ ...retrieval, sources: [privateSource] }), assertCurrent: async () => {} };
    for (const copied of ['PRIVATE_SHORT_SENTINEL ist der geheime Lehrsatz.', 'private_short_sentinel IST  der\n geheime   lehrsatz.', 'Laut [S1] ist der Zusammenhang klar.', 'Laut [ s 1 ] ist der Zusammenhang klar.', 'Die Quelle S1 erklärt es.', 'PRIVATE_title_sentinel', 'private_document_sentinel', 'Auf PDF-Seite 17 steht die Erklärung.']) {
      const { start, turn } = fixture({ rag, generate: async () => ({ ...valid(), text: copied }) });
      await expect(turn(start({ useMaterial: true }))).rejects.toMatchObject({ code: 'response' });
    }
    const { start, turn } = fixture({ rag, generate: async () => ({ ...valid(), followUp: 'private_short_sentinel ist der geheime lehrsatz.' }) });
    await expect(turn(start({ useMaterial: true }))).rejects.toMatchObject({ code: 'response' });
  });
  it('wechselt bei fehlenden oder veränderten Quellen nicht still auf öffentliche Daten', async () => {
    const { start, turn, generate } = fixture({ rag: { retrieve: async () => ({ sources: [] }) } });
    await expect(turn(start({ useMaterial: true }))).rejects.toMatchObject({ code: 'material_missing' });
    expect(generate).not.toHaveBeenCalled();
    let checks = 0;
    const f = fixture({ rag: { retrieve: async () => retrieval, assertCurrent: async () => { if (++checks === 2) throw new Error('PRIVATE_TITLE_SENTINEL'); } } });
    const privateSession = f.start({ useMaterial: true });
    const failure = await f.turn(privateSession).catch(error => error);
    expect(failure.code).toBe('material_changed'); expect(failure.message).not.toContain('PRIVATE_TITLE_SENTINEL');
    await expect(f.turn(privateSession)).rejects.toMatchObject({ code: 'session' });
  });
  it('verwirft einen privaten Verlauf bei neuer Materialrevision vor dem nächsten Transport', async () => {
    let revision = 'synthetic-v1';
    const rag = { retrieve: vi.fn(async () => ({ ...retrieval, revision })), assertCurrent: vi.fn(async token => { if (token.revision !== revision) throw new Error('PRIVATE_CHANGED_SENTINEL'); }) };
    const { start, turn, generate } = fixture({ rag }); const session = start({ useMaterial: true });
    await turn(session); revision = 'synthetic-v2';
    await expect(turn(session)).rejects.toMatchObject({ code: 'material_changed' });
    expect(generate).toHaveBeenCalledTimes(1);
    await expect(turn(session)).rejects.toMatchObject({ code: 'session' });
  });
  it('prüft private Cacheantworten erneut gegen Quellenänderung und Fingerprints', async () => {
    let changed = false;
    const token = { ...retrieval, used: [{ id: 'synthetic-doc', fingerprint: 'hash-1' }] };
    const rag = { retrieve: async () => token, assertCurrent: vi.fn(async entry => { expect(entry.used).toEqual(token.used); if (changed) throw new Error('PRIVATE_REMOVED_SENTINEL'); }) };
    const { start, turn, generate } = fixture({ rag }); const session = start({ useMaterial: true }); const requestId = randomUUID();
    await turn(session, 'Private Antwort', requestId);
    expect((await turn(session, 'Private Antwort', requestId)).turn).toBe(1);
    changed = true;
    await expect(turn(session, 'Private Antwort', requestId)).rejects.toMatchObject({ code: 'material_changed' });
    expect(generate).toHaveBeenCalledTimes(1);
    await expect(turn(session)).rejects.toMatchObject({ code: 'session' });
  });
  it('behandelt Kontingentfehler ohne Ersatzanbieter', async () => {
    const { start, turn, generate } = fixture({ generate: vi.fn(async () => { throw new AiError('usage_limit', 'Das Kontingent ist erschöpft.', 429); }) });
    await expect(turn(start({ provider: 'chatgpt', model: 'synthetic' }))).rejects.toMatchObject({ code: 'usage_limit', status: 429 });
    expect(generate).toHaveBeenCalledTimes(1);
  });
});

const WISO_IDS = ['training', 'employment', 'representation', 'social-security', 'pay', 'consumer', 'economy', 'change', 'career', 'europe'].map((suffix) => `common-wiso-${suffix}`);
const PM_IDS = ['project', 'stakeholders', 'methods', 'planning', 'schedule', 'costs', 'pricing', 'feasibility', 'control', 'closure'].map((suffix) => `common-pm-${suffix}`);
const LF2_IDS = ['requirements', 'hardware', 'software', 'workplace', 'comparison', 'procurement', 'handover'].map((suffix) => `common-lf2-${suffix}`);
const LF3_IDS = ['physical', 'protocols', 'addressing', 'services', 'access', 'diagnosis'].map((suffix) => `common-lf3-${suffix}`);
const LF456_IDS = ["common-lf4-goals","common-lf4-assets","common-lf4-privacy","common-lf4-assessment","common-lf4-measures","common-lf5-requirements","common-lf5-types","common-lf5-control","common-lf5-functions","common-lf5-objects","common-lf5-storage","common-lf5-sql","common-lf5-testing","common-lf6-intake","common-lf6-priority","common-lf6-diagnosis","common-lf6-solution","common-lf6-closure"];
const LF789_IDS = ["common-lf7-components", "common-lf7-signals", "common-lf7-extension", "common-lf7-logic", "common-lf7-verification", "common-lf8-sources", "common-lf8-formats", "common-lf8-queries", "common-lf8-interfaces", "common-lf8-integrity", "common-lf8-delivery", "common-lf9-requirements", "common-lf9-design", "common-lf9-services", "common-lf9-security", "common-lf9-monitoring", "common-lf9-handover"];
const SPECIAL_IDS = [
  ...['process', 'prototype', 'layout', 'forms', 'usability', 'value'].map(s => `fiae-lf10a-${s}`),
  ...['model', 'architecture', 'algorithms', 'data-access', 'security', 'testing', 'versions'].map(s => `fiae-lf11a-${s}`),
  ...['scope', 'alternatives', 'planning', 'implementation', 'acceptance', 'training', 'review'].map(s => `fiae-lf12a-${s}`),
];

const servers = [];
afterEach(async () => { for (const server of servers.splice(0)) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } });
describe('Gemeinsamer Anbietertransport', () => {
  const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../content');
  const journey = loadJourney(contentDir);
  const allTopics = journey.getSummary().readyTopics.map(entry => journey.getTopic(entry.id));

  it.each([...['goals', 'market', 'value-chain', 'organization', 'presentation'].map((suffix) => `common-lf1-${suffix}`), ...WISO_IDS, ...PM_IDS, ...LF2_IDS, ...LF3_IDS, ...LF456_IDS, ...LF789_IDS, ...SPECIAL_IDS])('bindet %s über den bestehenden Dienst ausschließlich an seinen geprüften öffentlichen Kontext', async (topicId) => {
    const actual = journey.getTopic(topicId);
    const first = journey.getTopic('common-lf1-role');
    const before = JSON.stringify(actual);
    // Ausschließlich injizierte Antworten: keine Konto-, Cloud- oder Privatdatenzugriffe.
    const cloud = { auth: {}, generate: vi.fn(async (input) => {
      const context = JSON.parse(input.messages[1].content).learningContext;
      return { done: true, message: { role: 'assistant', content: JSON.stringify({ text: 'Begründe deine Einordnung mit dem beschriebenen betrieblichen Fall.', followUp: 'Welche Beobachtung stützt deine Einordnung?', objectiveIds: context.objectives.map((item) => item.id) }) } };
    }) };
    const rag = { retrieve: vi.fn(), assertCurrent: vi.fn() };
    const ai = createAiService({ contentDir, aiEnabled: true }, rag, cloud);
    try {
      for (const [kind, targets, foreignTargets] of [['reflection', actual.interview, first.interview], ['theory', actual.blocks, first.blocks]]) {
        for (const target of targets) {
          const input = body({ topicId: actual.id, version: actual.version, kind, targetId: target.id, provider: 'chatgpt', model: 'synthetic' });
          const session = ai.journey.start(input);
          expect(session.objectiveIds).toEqual(target.objectiveIds);
          const result = await ai.journey.turn({ sessionId: session.sessionId, requestId: randomUUID(), answer: 'Wie lassen sich diese Ziele gegeneinander abwägen?' });
          const sent = cloud.generate.mock.calls.at(-1)[0];
          expect(sent.messages[0].content).not.toContain('LF1-Abschnitt');
          if (kind === 'theory') expect(sent.messages[0].content).toContain('Lernabschnitt');
          const context = JSON.parse(sent.messages[1].content).learningContext;
          expect(context).toMatchObject({ topicId: actual.id, version: actual.version, title: actual.title, kind, caseStudy: actual.caseStudy });
          expect(context.objectives).toEqual(actual.objectives.filter((objective) => target.objectiveIds.includes(objective.id)));
          if (kind === 'reflection') {
            expect(context.reflection).toEqual({ prompt: target.prompt, keyPoints: target.keyPoints, acceptableAlternatives: target.acceptableAlternatives });
            expect(context).not.toHaveProperty('blocks');
            expect(context.reflection).not.toHaveProperty('sampleAnswer');
          } else {
            expect(context.blocks).toEqual([{ id: target.id, title: target.title, paragraphs: target.paragraphs, takeaway: target.takeaway, example: target.example, misconception: target.misconception }]);
          }
          const serialized = JSON.stringify(context);
          expect(serialized).not.toContain(first.id);
          expect(context).not.toHaveProperty('fieldReview');
          expect(context).not.toHaveProperty('practice');
          expect(context).not.toHaveProperty('calculation');
          expect(context).not.toHaveProperty('worksheet');
          expect(context).not.toHaveProperty('workplace');
          expect(context).not.toHaveProperty('workplaceState');
          expect(context).not.toHaveProperty('network');
          expect(context).not.toHaveProperty('networkState');
          if (context.reflection) expect(context.reflection).not.toHaveProperty('practice');
          for (const question of allTopics.flatMap((entry) => [...entry.quiz.questions, ...entry.exam.questions])) {
            expect(serialized).not.toContain(question.id);
            expect(serialized).not.toContain(question.frage);
          }
          expect(result).toMatchObject({ privacy: 'public' });
          expect([...result.objectiveIds].sort()).toEqual([...target.objectiveIds].sort());
          expect(result).not.toHaveProperty('passed');
          expect(result).not.toHaveProperty('score');
          ai.journey.end({ sessionId: session.sessionId });
          expect(() => ai.journey.start({ ...input, targetId: foreignTargets[0].id })).toThrow();
          expect(() => ai.journey.start({ ...input, topicId: first.id })).toThrow();
          expect(() => ai.journey.start({ ...input, version: '0.9.0' })).toThrow();
        }
      }
      expect(cloud.generate).toHaveBeenCalledTimes(actual.interview.length + actual.blocks.length);
      expect(rag.retrieve).not.toHaveBeenCalled();
      expect(rag.assertCurrent).not.toHaveBeenCalled();
      expect(JSON.stringify(actual)).toBe(before);
    } finally { ai.cancel(); }
  });

  it.each([...['market', 'value-chain', 'organization', 'presentation'].map((suffix) => `common-lf1-${suffix}`), ...WISO_IDS, ...PM_IDS, ...LF2_IDS, ...LF3_IDS, ...LF456_IDS, ...LF789_IDS, ...SPECIAL_IDS])('hält lokale Ergänzungen für %s privat und vom nächsten öffentlichen Gespräch getrennt', async (topicId) => {
    const actual = journey.getTopic(topicId);
    const target = actual.interview[1];
    const rag = {
      retrieve: vi.fn(async () => ({ revision: 'synthetic-lf1', sources: [{ id: 'S1', label: 'PRIVATE_NEW_LF1_LABEL', documentId: 'PRIVATE_NEW_LF1_DOCUMENT', text: 'PRIVATE_NEW_LF1_TEXT: Diese erfundene lokale Ergänzung dient ausschließlich dem Test der Herkunftsgrenze.' }] })),
      assertCurrent: vi.fn(async () => {}),
    };
    const generate = vi.fn(async () => ({ text: 'Beschreibe den Zusammenhang anhand eines konkreten Beispiels.', followUp: 'Welche Begründung passt zu deinem Beispiel?', objectiveIds: target.objectiveIds }));
    const service = createJourneyAiService({ getTopic: (id) => id === actual.id ? actual : null, generate, rag });
    const input = body({ topicId: actual.id, version: actual.version, targetId: target.id, useMaterial: true });
    try {
      expect(() => service.start({ ...input, provider: 'chatgpt', model: 'synthetic' })).toThrow();
      expect(generate).not.toHaveBeenCalled();
      expect(rag.retrieve).not.toHaveBeenCalled();
      const local = service.start(input);
      const result = await service.turn({ sessionId: local.sessionId, requestId: randomUUID(), answer: 'Mein eigenes Beispiel aus einem erfundenen Betrieb.' });
      expect(result.privacy).toBe('local-private');
      const privateRequest = generate.mock.calls[0][0];
      expect(privateRequest).toMatchObject({ provider: 'qwen', privateContext: true });
      expect(privateRequest.messages[1].content).toContain('PRIVATE_NEW_LF1_TEXT');
      expect(privateRequest.messages[1].content).not.toContain('PRIVATE_NEW_LF1_LABEL');
      expect(JSON.stringify(result)).not.toContain('PRIVATE_NEW_LF1_');
      expect(result).not.toHaveProperty('passed');
      expect(result).not.toHaveProperty('practiceConfirmed');
      const publicSession = service.start({ ...input, useMaterial: false, provider: 'chatgpt', model: 'synthetic' });
      await service.turn({ sessionId: publicSession.sessionId, requestId: randomUUID(), answer: 'Ein neues öffentliches Beispiel.' });
      const publicRequest = generate.mock.calls[1][0];
      expect(publicRequest.privateContext).toBe(false);
      expect(publicRequest.messages[1].content).not.toContain('PRIVATE_NEW_LF1_');
      expect(JSON.parse(publicRequest.messages[1].content).conversation).toEqual([]);
    } finally { service.cancelAll(); }
  });

  it('verwendet echte Transportlogik mit synthetischem Loopback-Qwen und injiziertem Cloudmodell', async () => {
    const contentDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../content');
    const actual = loadJourney(contentDir).getTopic('common-lf1-role'); const objectiveId = actual.interview[0].objectiveIds[0];
    const reply = { text: 'Eine Einrichtung ist die Leistung; zuverlässiges Arbeiten ist der Nutzen.', followUp: 'Welchen Bedarf erfüllt das?', objectiveIds: [objectiveId] };
    const seen = [];
    let modelName = 'qwen3:4b'; let family = 'qwen3'; let truncated = false;
    const server = http.createServer(async (req, res) => {
      let raw = ''; for await (const chunk of req) raw += chunk;
      const payload = raw ? JSON.parse(raw) : null;
      seen.push({ url: req.url, body: payload });
      const content = payload?.format?.properties?.answer ? { answer: 'Ein synthetischer bestehender Lernhinweis.' } : reply;
      const value = req.url === '/api/tags' ? { models: [{ name: modelName, size: 100, digest: 'a'.repeat(64) }] } : req.url === '/api/show' ? { details: { family } } : { done: true, done_reason: truncated ? 'length' : 'stop', message: { role: 'assistant', thinking: 'PRIVATE_THINKING_SENTINEL', content: JSON.stringify(content) } };
      res.end(JSON.stringify(value));
    });
    servers.push(server); server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const cloud = { auth: {}, generate: vi.fn(async () => ({ done: true, message: { role: 'assistant', content: JSON.stringify(reply) } })) };
    const settings = { contentDir, aiEnabled: true, ollamaUrl: `http://127.0.0.1:${server.address().port}`, ollamaModel: 'qwen3:4b', aiTimeoutMs: 1000, aiStatusTimeoutMs: 1000 };
    const rag = { retrieve: vi.fn(async () => ({ revision: 'synthetic-v1', used: [], sources: [{ id: 'S1', label: 'PRIVATE_TRANSPORT_LABEL', page: 12, text: 'PRIVATE_TRANSPORT_TEXT: Ein erfundener Lerntext zur Prüfung des lokal gebundenen Transports.' }] })), assertCurrent: vi.fn(async () => {}) };
    const ai = createAiService(settings, rag, cloud);
    for (const provider of ['qwen', 'chatgpt']) {
      const session = ai.journey.start(body({ targetId: actual.interview[0].id, provider, model: provider === 'qwen' ? 'qwen3:4b' : 'synthetic' }));
      expect((await ai.journey.turn({ sessionId: session.sessionId, requestId: randomUUID(), answer: 'Mein eigener Gedanke' })).text).toBe(reply.text);
    }
    expect(seen.map(entry => entry.url)).toEqual(['/api/tags', '/api/show', '/api/chat']);
    const sent = seen.at(-1).body;
    expect(sent.stream).toBe(false); expect(sent.think).toBe(true); expect(sent.options.num_predict).toBe(4096); expect(sent).not.toHaveProperty('tools');
    expect(sent.messages[0].content).not.toContain('/no_think');
    expect(cloud.generate).toHaveBeenCalledTimes(1);
    expect(cloud.generate.mock.calls[0][0].messages[0].content).toContain('/no_think');
    expect(cloud.generate.mock.calls[0][0]).not.toHaveProperty('think');
    const privateSession = ai.journey.start(body({ targetId: actual.interview[0].id, useMaterial: true }));
    const privateReply = await ai.journey.turn({ sessionId: privateSession.sessionId, requestId: randomUUID(), answer: 'Eigene Frage mit lokaler Ergänzung' });
    expect(privateReply.privacy).toBe('local-private');
    expect(seen.at(-1).body.keep_alive).toBe(0);
    expect(seen.at(-1).body.messages[1].content).toContain('PRIVATE_TRANSPORT_TEXT');
    expect(seen.at(-1).body.messages[1].content).not.toContain('PRIVATE_TRANSPORT_LABEL');
    expect(JSON.stringify(cloud.generate.mock.calls)).not.toContain('PRIVATE_TRANSPORT_');
    expect(JSON.stringify(privateReply)).not.toContain('PRIVATE_TRANSPORT_');
    expect(JSON.stringify(privateReply)).not.toContain('PRIVATE_THINKING_SENTINEL');
    expect(seen.at(-1).body.think).toBe(true);
    const incompleteSession = ai.journey.start(body({ targetId: actual.interview[0].id }));
    const incompleteRequest = { sessionId: incompleteSession.sessionId, requestId: randomUUID(), answer: 'Mein eigener Gedanke' };
    truncated = true;
    await expect(ai.journey.turn(incompleteRequest)).rejects.toMatchObject({ code: 'response', status: 502 });
    truncated = false;
    expect(await ai.journey.turn(incompleteRequest)).toMatchObject({ turn: 1, remainingTurns: 3 });
    for (const variant of [{ name: 'qwen2.5:3b', family: 'qwen2' }, { name: 'qwen3:4b', family: 'qwen2' }, { name: 'qwen2.5:3b', family: 'qwen3' }]) {
      modelName = variant.name; family = variant.family;
      const other = ai.journey.start(body({ targetId: actual.interview[0].id, model: modelName }));
      await ai.journey.turn({ sessionId: other.sessionId, requestId: randomUUID(), answer: 'Mein eigener Gedanke' });
      expect(seen.at(-1).body).not.toHaveProperty('think');
      expect(seen.at(-1).body.options.num_predict).toBe(600);
    }
    modelName = 'qwen3:4b'; family = 'qwen3';
    const legacyStore = { get: () => ({ questionsById: new Map([['synthetic-question', { frage: 'Was ist ein Kundennutzen?', typ: 'SC', optionen: ['Wirkung', 'Lieferung'], antwort: 'a', erklaerung: 'Der Nutzen beschreibt die angestrebte Wirkung.' }]]) }) };
    await ai.help({ provider: 'qwen', model: modelName, intent: 'explain', context: { kind: 'quiz', questionId: 'synthetic-question' } }, legacyStore);
    expect(seen.at(-1).body.think).toBe(false);
    expect(seen.at(-1).body.options.num_predict).toBe(384);
    expect(seen.at(-1).body.messages[0].content).toContain('/no_think');
    const session = ai.journey.start(body({ targetId: actual.interview[0].id })); ai.cancel();
    await expect(ai.journey.turn({ sessionId: session.sessionId, requestId: randomUUID(), answer: 'Antwort' })).rejects.toMatchObject({ code: 'session' });
  });
});


describe('Synthetische LF2-Kontextgrenzen ohne Modellaufrufe', () => {
  it.each(LF2_IDS)('begrenzt Qwen und Cloud für %s auf jeden aktuellen Block oder jede Reflexion', async (id) => {
    const objectives = Array.from({ length: ['requirements', 'hardware', 'software', 'comparison'].some((suffix) => id.endsWith(suffix)) ? 2 : 3 }, (_, index) => ({ id: `${id}-goal-${index + 1}`, text: `Lernziel ${index + 1} erklären.` }));
    const actual = {
      ...structuredClone(topic), id, title: `Synthetisches Thema ${id}`, objectives,
      blocks: Array.from({ length: 4 }, (_, index) => ({ ...structuredClone(topic.blocks[0]), id: `${id}-block-${index + 1}`, title: `Aktueller Block ${index + 1}`, objectiveIds: [objectives[index % objectives.length].id], paragraphs: [`SYNTHETIC_THEORY_${id}_${index + 1}`] })),
      interview: Array.from({ length: 3 }, (_, index) => ({ ...structuredClone(topic.interview[0]), id: `${id}-reflection-${index + 1}`, objectiveIds: [objectives[index % objectives.length].id], blockIds: [`${id}-block-${index + 1}`], prompt: `SYNTHETIC_REFLECTION_${id}_${index + 1}` })),
      quiz: { questionIds: [`${id}-Q01`], questions: [{ id: `${id}-Q01`, frage: 'LF2_QUIZ_POOL_SENTINEL', antwort: 'QUIZ_ANSWER_SENTINEL' }] },
      exam: { questionIds: [`${id}-E01`], questions: [{ id: `${id}-E01`, frage: 'LF2_EXAM_POOL_SENTINEL', antwort: 'EXAM_ANSWER_SENTINEL', erklaerung: 'EXAM_SOLUTION_SENTINEL' }] },
      fieldReview: { fieldId: 'LF2', topicIds: LF2_IDS, completed: 'FIELD_REVIEW_SENTINEL' },
      workplace: { tested: true, label: 'WORKPLACE_SENTINEL' }, workplaceState: { passed: true, label: 'WORKPLACE_STATE_SENTINEL' },
    };
    actual.interview[1].practice = { task: 'PRACTICE_TASK_SENTINEL', checklist: ['PRACTICE_CHECKLIST_SENTINEL'], confirmation: 'PRACTICE_CONFIRMATION_SENTINEL' };
    const generate = vi.fn(async (input) => ({ text: 'Prüfe die Anforderungen aus dem Modellauftrag.', followUp: 'Welche Eigenschaft ist dafür relevant?', objectiveIds: JSON.parse(input.messages[1].content).learningContext.objectives.map((objective) => objective.id) }));
    const rag = { retrieve: vi.fn(), assertCurrent: vi.fn() };
    const service = createJourneyAiService({ getTopic: (topicId) => topicId === id ? actual : null, generate, rag });
    const before = JSON.stringify(actual);
    try {
      for (const provider of ['qwen', 'chatgpt']) for (const [kind, targets] of [['theory', actual.blocks], ['reflection', actual.interview]]) for (const target of targets) {
        const session = service.start(body({ topicId: id, kind, targetId: target.id, provider, model: provider === 'qwen' ? 'qwen3:4b' : 'synthetic' }));
        const result = await service.turn({ sessionId: session.sessionId, requestId: randomUUID(), answer: 'Erkläre den aktuellen Schritt.' });
        const input = generate.mock.calls.at(-1)[0];
        const context = JSON.parse(input.messages[1].content).learningContext;
        expect(input).toMatchObject({ provider, privateContext: false });
        expect(context.objectives).toEqual(objectives.filter((objective) => target.objectiveIds.includes(objective.id)));
        if (kind === 'theory') {
          expect(context.blocks).toEqual([{ id: target.id, title: target.title, paragraphs: target.paragraphs, takeaway: target.takeaway, example: target.example, misconception: target.misconception }]);
          expect(context).not.toHaveProperty('reflection');
          for (const other of actual.blocks.filter((block) => block.id !== target.id)) expect(JSON.stringify(context)).not.toContain(other.paragraphs[0]);
        } else {
          expect(context.reflection).toEqual({ prompt: target.prompt, keyPoints: target.keyPoints, acceptableAlternatives: target.acceptableAlternatives });
          expect(context).not.toHaveProperty('blocks');
          expect(context.reflection).not.toHaveProperty('sampleAnswer');
          expect(context.reflection).not.toHaveProperty('practice');
        }
        expect(JSON.stringify(input)).not.toMatch(/(?:POOL|ANSWER|SOLUTION|REVIEW|WORKPLACE|STATE|TASK|CHECKLIST|CONFIRMATION)_SENTINEL/);
        for (const key of ['quiz', 'exam', 'fieldReview', 'practice', 'workplace', 'workplaceState']) expect(context).not.toHaveProperty(key);
        expect(result).not.toHaveProperty('passed');
        expect(result).not.toHaveProperty('practiceConfirmed');
        service.end({ sessionId: session.sessionId });
      }
      expect(generate).toHaveBeenCalledTimes(14);
      expect(rag.retrieve).not.toHaveBeenCalled();
      expect(rag.assertCurrent).not.toHaveBeenCalled();
      expect(JSON.stringify(actual)).toBe(before);
    } finally { service.cancelAll(); }
  });
});

describe('Synthetische LF3–LF12a-Kontextgrenzen ohne Modellaufrufe', () => {
  it.each([...LF3_IDS, ...LF456_IDS, ...LF789_IDS, ...SPECIAL_IDS])('begrenzt Qwen und Cloud für %s auf jeden aktuellen Block oder jede Reflexion', async (id) => {
    const fieldId = id.split('-')[1].toUpperCase();
    const fieldIds = [...LF3_IDS, ...LF456_IDS, ...LF789_IDS, ...SPECIAL_IDS].filter((topicId) => topicId.split('-')[1] === id.split('-')[1]);
    const objectives = Array.from({ length: 2 }, (_, index) => ({ id: `${id}-goal-${index + 1}`, text: `Lernziel ${index + 1} erklären.` }));
    const actual = {
      ...structuredClone(topic), id, title: `Synthetisches Thema ${id}`, objectives,
      blocks: Array.from({ length: 4 }, (_, index) => ({ ...structuredClone(topic.blocks[0]), id: `${id}-block-${index + 1}`, title: `Aktueller Block ${index + 1}`, objectiveIds: [objectives[index % objectives.length].id], paragraphs: [`SYNTHETIC_THEORY_${id}_${index + 1}`] })),
      interview: Array.from({ length: 3 }, (_, index) => ({ ...structuredClone(topic.interview[0]), id: `${id}-reflection-${index + 1}`, objectiveIds: [objectives[index % objectives.length].id], blockIds: [`${id}-block-${index + 1}`], prompt: `SYNTHETIC_REFLECTION_${id}_${index + 1}` })),
      quiz: { questionIds: [`${id}-Q01`], questions: [{ id: `${id}-Q01`, frage: 'LF3_QUIZ_POOL_SENTINEL', antwort: 'QUIZ_ANSWER_SENTINEL' }] },
      exam: { questionIds: [`${id}-E01`], questions: [{ id: `${id}-E01`, frage: 'LF3_EXAM_POOL_SENTINEL', antwort: 'EXAM_ANSWER_SENTINEL', erklaerung: 'EXAM_SOLUTION_SENTINEL' }] },
      fieldReview: { fieldId, topicIds: fieldIds, completed: 'FIELD_REVIEW_SENTINEL' },
      practice: { code: 'PRIVATE_PRACTICE_CODE_SENTINEL', testedCode: 'PRIVATE_TESTED_CODE_SENTINEL', answers: 'PRIVATE_PRACTICE_ANSWERS_SENTINEL', checked: true, done: true },
      lab: { source: 'LAB_CODE_SENTINEL', requests: [{ payload: 'LAB_PAYLOAD_SENTINEL' }], cases: ['LAB_CASES_SENTINEL'] },
      practiceState: { rows: ['PRIVATE_DATABASE_ROWS_SENTINEL'], protocol: ['PRIVATE_SERVICE_PROTOCOL_SENTINEL'], assessment: 'PRIVATE_SECURITY_ASSESSMENT_SENTINEL' },
      network: { tested: true, label: 'NETWORK_SENTINEL' }, networkState: { passed: true, label: 'NETWORK_STATE_SENTINEL' },
    };
    actual.interview[1].practice = { task: 'PRACTICE_TASK_SENTINEL', checklist: ['PRACTICE_CHECKLIST_SENTINEL'], confirmation: 'PRACTICE_CONFIRMATION_SENTINEL' };
    const generate = vi.fn(async (input) => ({ text: 'Prüfe die Anforderungen aus dem Modellauftrag.', followUp: 'Welche Eigenschaft ist dafür relevant?', objectiveIds: JSON.parse(input.messages[1].content).learningContext.objectives.map((objective) => objective.id) }));
    const rag = { retrieve: vi.fn(), assertCurrent: vi.fn() };
    const service = createJourneyAiService({ getTopic: (topicId) => topicId === id ? actual : null, generate, rag });
    const before = JSON.stringify(actual);
    try {
      for (const provider of ['qwen', 'chatgpt']) for (const [kind, targets] of [['theory', actual.blocks], ['reflection', actual.interview]]) for (const target of targets) {
        const session = service.start(body({ topicId: id, kind, targetId: target.id, provider, model: provider === 'qwen' ? 'qwen3:4b' : 'synthetic' }));
        const result = await service.turn({ sessionId: session.sessionId, requestId: randomUUID(), answer: 'Erkläre den aktuellen Schritt.' });
        const input = generate.mock.calls.at(-1)[0];
        const context = JSON.parse(input.messages[1].content).learningContext;
        expect(input).toMatchObject({ provider, privateContext: false });
        expect(context.objectives).toEqual(objectives.filter((objective) => target.objectiveIds.includes(objective.id)));
        if (kind === 'theory') {
          expect(context.blocks).toEqual([{ id: target.id, title: target.title, paragraphs: target.paragraphs, takeaway: target.takeaway, example: target.example, misconception: target.misconception }]);
          expect(context).not.toHaveProperty('reflection');
          for (const other of actual.blocks.filter((block) => block.id !== target.id)) expect(JSON.stringify(context)).not.toContain(other.paragraphs[0]);
        } else {
          expect(context.reflection).toEqual({ prompt: target.prompt, keyPoints: target.keyPoints, acceptableAlternatives: target.acceptableAlternatives });
          expect(context).not.toHaveProperty('blocks');
          expect(context.reflection).not.toHaveProperty('sampleAnswer');
          expect(context.reflection).not.toHaveProperty('practice');
        }
        expect(JSON.stringify(input)).not.toMatch(/(?:POOL|ANSWER|ANSWERS|CODE|SOLUTION|REVIEW|NETWORK|STATE|TASK|CHECKLIST|CONFIRMATION|ROWS|PROTOCOL|ASSESSMENT|PAYLOAD|CASES)_SENTINEL/);
        for (const key of ['quiz', 'exam', 'fieldReview', 'practice', 'practiceState', 'lab', 'network', 'networkState']) expect(context).not.toHaveProperty(key);
        expect(Object.keys(context).sort()).toEqual(['topicId', 'version', 'title', 'kind', 'objectives', 'caseStudy', kind === 'theory' ? 'blocks' : 'reflection'].sort());
        expect(result).not.toHaveProperty('passed');
        expect(result).not.toHaveProperty('practiceConfirmed');
        expect(result).not.toHaveProperty('done');
        expect(result).not.toHaveProperty('checked');
        service.end({ sessionId: session.sessionId });
      }
      expect(generate).toHaveBeenCalledTimes(14);
      expect(rag.retrieve).not.toHaveBeenCalled();
      expect(rag.assertCurrent).not.toHaveBeenCalled();
      expect(JSON.stringify(actual)).toBe(before);
    } finally { service.cancelAll(); }
  });
});
