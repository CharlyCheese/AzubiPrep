import { LAB_TOPICS, LAB_STEPS } from '../../frontend/src/utils/journeyLabs.js';
import { PRACTICE_TOPICS, practiceSteps } from '../../frontend/src/utils/journeyPractices.js';
import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadJourney } from '../../backend/src/journey.js';
import { readCsvFile } from '../../backend/src/csv.js';
import { journeyStorageKey, createJourneyState, reduceJourney, exportJourney } from '../../frontend/src/store/journeyStore.js';
import { NETWORK_TOPIC } from '../../frontend/src/utils/journeyNetwork.js';
import { WORKPLACE_TOPIC } from '../../frontend/src/utils/journeyWorkplace.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const service = loadJourney(path.join(repo, 'content'));
const allTopics = service.getSummary().readyTopics.map(item => service.getTopic(item.id));
const firstLab = allTopics.findIndex(topic => topic.fieldId === 'LF7');
const earlierTopics = allTopics.slice(0, firstLab);
const topics = allTopics.slice(firstLab);
const lastLab = allTopics.find(topic => topic.id === LAB_TOPICS[2]);
const route = topic => `/lernreise/fiae/${topic.id}`;
const answers = topic => Object.fromEntries(readCsvFile(path.join(repo, `content/learning-journey/questions/${topic.id}.v1.csv`)).records.map(row => [row.id, row.antwort]));
const rawOf = (page, topic) => page.evaluate(async ({ id, key }) => window.azubiDesktop?.journey
  ? window.azubiDesktop.journey.load(id) : localStorage.getItem(key), { id: topic.id, key: journeyStorageKey(topic.id) });
const saved = page => expect(page.locator('.journey-status')).toHaveText('Gespeichert');

function stateAt(topic, phase = 'result') {
  const answerMap = answers(topic);
  let state = createJourneyState(topic);
  const act = action => { state = reduceJourney(state, action, topic); };
  if (phase === 'theory') return { ...state, revision: 1 };
  topic.blocks.forEach(() => act({ type: 'read-block' }));
  for (const questionId of topic.quiz.questionIds) {
    const answer = answerMap[questionId];
    act({ type: 'select-answer', questionId, answer });
    act({ type: 'quiz-feedback', feedback: service.check(topic.id, { version: topic.version, questionId, answer }) });
    act({ type: 'next-quiz' });
  }
  if (phase === 'reflection') return { ...state, revision: 1 };
  topic.interview.forEach(item => { if (topic.id === WORKPLACE_TOPIC && item.practice) {
    for (const [field, value] of Object.entries({ device: 'office', software: 'approved', account: 'standard', displays: '2', updated: true })) act({ type: 'workplace-action', action: { type: 'configure', field, value } });
    for (const type of ['create-folder', 'create-file', 'open-file', 'check']) act({ type: 'workplace-action', action: { type } });
  } else if (topic.id === NETWORK_TOPIC && item.practice) {
    for (let i = 0; i < 3; i++) {
      act({ type: 'network-action', action: { type: 'test' } });
      for (const [field, value] of Object.entries({ linked: true, ip: '192.0.2.25', prefix: '24', gateway: '192.0.2.1', dns: '192.0.2.53', diagnosis: ['link', 'address', 'dns'][i] })) act({ type: 'network-action', action: { type: 'configure', field, value } });
      act({ type: 'network-action', action: { type: 'test' } }); act({ type: 'network-action', action: { type: 'finish' } });
    }
  } else if (PRACTICE_TOPICS.includes(topic.id) && item.practice) {
    for (const [i, step] of practiceSteps(topic.id).entries()) {
      for (const field of step.fields) act({ type: 'practice-action', action: { type: 'answer', field: field.key, value: field.expected } });
      if (topic.fieldId === 'LF5' && i < 4) act({ type: 'practice-action', action: { type: 'preview' } });
      if (topic.fieldId === 'LF5' && i === 4) {
        act({ type: 'practice-action', action: { type: 'code', value: SOLUTION } });
        act({ type: 'practice-action', action: { type: 'code-result', source: SOLUTION, passed: true } });
      } else act({ type: 'practice-action', action: { type: 'check' } });
      act({ type: 'practice-action', action: { type: 'next' } });
    }
  } else if (LAB_TOPICS.includes(topic.id) && item.practice) {
    for (let stage=0; stage<3; stage++) {
      for (const field of LAB_STEPS[topic.id][stage].fields) act({type:'lab-action',action:{type:'answer',field:field.key,value:String(field.expected)}});
      if(stage!==1) act({type:'lab-action',action:{type:'check'}});
      else if(topic.fieldId==='LF7') {act({type:'lab-action',action:{type:'code',value:CONTROL}});act({type:'lab-action',action:{type:'code-result',source:CONTROL,passed:true}});}
      else if(topic.fieldId==='LF8') {act({type:'lab-action',action:{type:'send'}});act({type:'lab-action',action:{type:'request-edit',field:'payload',value:reportPayload()}});act({type:'lab-action',action:{type:'send'}});act({type:'lab-action',action:{type:'send'}});act({type:'lab-action',action:{type:'request-edit',field:'payload',value:reportPayload(31)}});act({type:'lab-action',action:{type:'send'}});}
      else for(let i=0;i<3;i++){act({type:'lab-action',action:{type:'probe'}});for(const [field,value] of Object.entries({dns:'198.51.100.10',running:true,policy:'staff',diagnosis:['dns','service','policy'][i]})) act({type:'lab-action',action:{type:'configure',field,value}});act({type:'lab-action',action:{type:'probe'}});act({type:'lab-action',action:{type:'finish-case'}});}
      act({type:'lab-action',action:{type:'next'}});
    }
  } act({ type: 'reflection-reveal' }); act({ type: 'reflection-done', ...(item.practice ? { practiceConfirmed: true } : {}) }); });
  topic.cards.forEach(() => { act({ type: 'card-reveal' }); act({ type: 'card-rate', rating: 'known' }); });
  const attemptId = randomUUID();
  act({ type: 'start-exam', attemptId });
  topic.exam.questionIds.forEach((questionId, index) => {
    const correct = answerMap[questionId];
    const answer = phase === 'failed' && index < 2 ? (correct === 'a' ? 'b' : 'a') : correct;
    act({ type: 'select-answer', questionId, answer });
    if (index < 7) act({ type: 'next-exam' });
  });
  if (phase === 'exam') return { ...state, revision: 1 };
  const result = service.evaluate(topic.id, { version: topic.version, attemptId, answers: topic.exam.questionIds.map(questionId => ({ questionId, answer: state.exam.answers[questionId] })) });
  act({ type: 'exam-result', result, completedAt: new Date().toISOString() });
  return { ...state, revision: 1 };
}

async function setup(page) {
  await unterdrueckeOnboardingPopups(page);
  await page.route('**/api/ai/**', handler => handler.abort());
  await page.goto('/lernreise?fr=FIAE');
}
async function seed(page, states) {
  await page.evaluate(async items => {
    for (const { key, state } of items) {
      const raw = JSON.stringify(state);
      if (window.azubiDesktop?.journey) await window.azubiDesktop.journey.save({ topicId: state.topicId, raw, expectedRaw: null });
      else localStorage.setItem(key, raw);
    }
  }, states.map(state => ({ key: journeyStorageKey(state.topicId), state })));
}
async function clickSaved(page, topic, name) {
  const before = JSON.parse(await rawOf(page, topic))?.revision ?? 0;
  await page.getByRole('button', { name, exact: true }).click();
  await expect.poll(async () => JSON.parse(await rawOf(page, topic))?.revision ?? 0).toBeGreaterThan(before);
  await saved(page);
}
async function choose(page, topic, questionId) {
  const before = JSON.parse(await rawOf(page, topic)).revision;
  await page.locator(`input[name="${questionId}"][value="${answers(topic)[questionId]}"]`).check();
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).revision).toBeGreaterThan(before);
}

async function configure(page, topic, label, value) {
  const before = JSON.parse(await rawOf(page, topic)).revision;
  await page.getByRole('combobox', { name: label, exact: true }).selectOption(value);
  await expect.poll(async () => JSON.parse(await rawOf(page, topic)).revision).toBeGreaterThan(before); await saved(page);
}

const SOLUTION = 'function available(quantity, requested) { if (!Number.isInteger(quantity) || !Number.isInteger(requested) || quantity < 0 || requested < 0 || quantity > 1000 || requested > 1000) return null; return requested <= quantity; }';

const CONTROL='function control(t,c) { if(c !== true || !Number.isFinite(t) || t < -20 || t > 80) return "fault"; return t >= 30 ? "on" : "off"; }';
const reportPayload=(total=30)=>JSON.stringify({batchId:'demo-01',rows:[{region:'Nord',total},{region:'Süd',total:5}]});
async function fillSaved(page,topic,name,value) {const before=JSON.parse(await rawOf(page,topic)).revision;await page.getByRole('textbox',{name,exact:true}).fill(value);await expect.poll(async()=>JSON.parse(await rawOf(page,topic)).revision).toBeGreaterThan(before);await saved(page);}
async function completeLab(page,topic) {
 for(let stage=0;stage<3;stage++) {
  for(const f of LAB_STEPS[topic.id][stage].fields) {if(f.kind==='number') await fillSaved(page,topic,f.label,String(f.expected).replace('.',','));else await configure(page,topic,f.label,f.expected);}
  if(stage!==1) await clickSaved(page,topic,topic.fieldId==='LF8'&&stage===0?'Bericht erzeugen und prüfen':'Schritt prüfen');
  else if(topic.fieldId==='LF7') {await fillSaved(page,topic,'Deine Steuerfunktion',CONTROL);await clickSaved(page,topic,'Steuerung ausführen und prüfen');await expect(page.getByText('Alle Steuerungsproben bestanden.',{exact:true})).toBeVisible();}
  else if(topic.fieldId==='LF8') {await clickSaved(page,topic,'Anfrage im Modell senden');await expect(page.getByText('Antwort 422:',{exact:false})).toBeVisible();await fillSaved(page,topic,'JSON-Anfrage',reportPayload());await clickSaved(page,topic,'Anfrage im Modell senden');await clickSaved(page,topic,'Anfrage im Modell senden');await fillSaved(page,topic,'JSON-Anfrage',reportPayload(31));await clickSaved(page,topic,'Anfrage im Modell senden');await expect(page.getByText('Fehler, Erfolg, Wiederholung und Konflikt geprüft; Empfängerbestand stimmt.',{exact:true})).toBeVisible();}
  else for(let i=0;i<3;i++){await clickSaved(page,topic,'Befund abrufen');await configure(page,topic,'Ursache des Ausgangsfehlers',['dns','service','policy'][i]);await configure(page,topic,['DNS-Zieladresse','Dienstbetrieb','Portalzugriff'][i],['198.51.100.10','true','staff'][i]);await clickSaved(page,topic,'Dienst erneut prüfen');await clickSaved(page,topic,'Dienstfall abschließen');}
  await clickSaved(page,topic,stage===2?'Lernlabor abschließen':'Geprüften Laborschritt übernehmen');
 }
}

async function captureLab(page, topic, info, title, prefix) {
  await page.getByRole('region', { name: `Lernlabor: ${title}`, exact: true }).screenshot({ path: info.outputPath(`${prefix}-labor-mobil.png`) });
  const next = page.getByRole('button', { name: 'Geprüften Laborschritt übernehmen', exact: true });
  await next.scrollIntoViewIfNeeded(); await next.focus(); await expect(next).toBeFocused();
  expect(await next.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); })).toBe(true);
  await page.screenshot({ path: info.outputPath(`${prefix}-ansicht-mobil.png`) });
  await page.keyboard.press('Enter'); await expect.poll(async () => JSON.parse(await rawOf(page, topic)).lab.stage).toBe(2); await saved(page);
}

async function openLab(page, id) {
  const topic = topics.find(t => t.id === id);
  await setup(page); await seed(page, allTopics.slice(0, allTopics.indexOf(topic)).map(t => stateAt(t)));
  await seed(page, [stateAt(topic, 'reflection')]); await page.goto(route(topic)); await saved(page);
  await clickSaved(page, topic, 'Kernpunkte ansehen'); await clickSaved(page, topic, 'Verglichen – weiter');
  for (const f of LAB_STEPS[id][0].fields) {
    if (f.kind === 'number') await fillSaved(page, topic, f.label, String(f.expected));
    else await configure(page, topic, f.label, f.expected);
  }
  await clickSaved(page, topic, id === LAB_TOPICS[1] ? 'Bericht erzeugen und prüfen' : 'Schritt prüfen');
  await clickSaved(page, topic, 'Geprüften Laborschritt übernehmen'); return topic;
}

for (const field of ['LF7', 'LF8', 'LF9', 'LF10a', 'LF11a', 'LF12a']) test(`${field}: frühere Etappen bleiben Voraussetzung`, async ({ page }) => {
  await setup(page); const topic = topics.find(t => t.fieldId === field);
  await seed(page, [stateAt(allTopics[allTopics.indexOf(topic) - 1])]); await page.goto(route(topic));
  await expect(page.getByRole('heading', { name: 'Zuerst die Grundlage abschließen' })).toBeVisible();
  expect(await rawOf(page, topic)).toBeNull();
});

test('LF7: echte Steuerfunktion, falsche Reaktion, Zeitgrenze, mobile Tastatur und Wiederaufnahme', async ({ page }, info) => {
  test.setTimeout(120_000); const topic = await openLab(page, LAB_TOPICS[0]);
  const next = page.getByRole('button', { name: 'Geprüften Laborschritt übernehmen', exact: true });
  for (const source of ['function control(){return "off";}', 'let faulted=false; function control(t,c){ if(faulted)return "fault"; if(c!==true||!Number.isFinite(t)||t< -20||t>80){faulted=true;return "fault";} return t>=30?"on":"off";}', 'function control(){while(true){}}']) {
    await fillSaved(page, topic, 'Deine Steuerfunktion', source);
    await clickSaved(page, topic, 'Steuerung ausführen und prüfen');
    await expect(page.getByText('Die Steuerung braucht eine Korrektur.', { exact: true })).toBeVisible(); await expect(next).toBeDisabled();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await fillSaved(page, topic, 'Deine Steuerfunktion', CONTROL);
  await page.getByRole('button', { name: 'Steuerung ausführen und prüfen', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByText('Alle Steuerungsproben bestanden.', { exact: true })).toBeVisible(); await saved(page);
  const backup = exportJourney(JSON.parse(await rawOf(page, topic)), topic);
  await fillSaved(page, topic, 'Deine Steuerfunktion', 'function control(){return "on";}'); await expect(next).toBeDisabled();
  await page.getByText('Nachlesen, Sicherung und Quellen', { exact: true }).click();
  await page.getByLabel('Lernreise-Sicherung einlesen').setInputFiles({ name: 'lf7-labor.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await clickSaved(page, topic, 'Diesen Reisestand ersetzen'); await page.reload(); await saved(page);
  await expect(page.getByRole('textbox', { name: 'Deine Steuerfunktion', exact: true })).toHaveValue(CONTROL); await expect(next).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await captureLab(page, topic, info, 'Sensorsteuerung', 'lf7');
});

test('LF8: Fehler bleiben atomar, Wiederholung dupliziert nichts und Stand bleibt nach Neuladen', async ({ page }, info) => {
  test.setTimeout(90_000); const topic = await openLab(page, LAB_TOPICS[1]);
  const receiver = page.getByRole('table', { name: 'Tatsächlicher Empfängerbestand im Modell', exact: true });
  const send = async status => { await clickSaved(page, topic, 'Anfrage im Modell senden'); await expect(page.getByText(`Antwort ${status}:`, { exact: false })).toBeVisible(); };
  await send(422); await expect(receiver.locator('tbody tr')).toHaveCount(0);
  await configure(page, topic, 'Senderrolle', 'denied'); await send(401);
  await configure(page, topic, 'Senderrolle', 'allowed'); await configure(page, topic, 'Transport', 'http'); await send(426);
  await configure(page, topic, 'Transport', 'https'); await fillSaved(page, topic, 'JSON-Anfrage', '{'); await send(400);
  await fillSaved(page, topic, 'JSON-Anfrage', reportPayload()); await send(201); const before = await receiver.innerText();
  await fillSaved(page, topic, 'JSON-Anfrage', JSON.stringify({ rows: [{ region: 'Süd', total: 5 }, { region: 'Nord', total: 30 }], batchId: 'demo-01' })); await send(200);
  expect(await receiver.innerText()).toBe(before); await expect(receiver.locator('tbody tr')).toHaveCount(2);
  await fillSaved(page, topic, 'JSON-Anfrage', reportPayload(31)); await send(409); expect(await receiver.innerText()).toBe(before);
  await page.reload(); await saved(page); expect(await receiver.innerText()).toBe(before);
  await expect(page.getByRole('button', { name: 'Geprüften Laborschritt übernehmen', exact: true })).toBeEnabled();
  await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await captureLab(page, topic, info, 'Datenübertragung', 'lf8');
});

test('LF7: Prüfergebnis wartet auf gleichzeitig gespeicherte Reflexionsnotiz', async ({ page }) => {
  test.setTimeout(90_000); const topic = await openLab(page, LAB_TOPICS[0]);
  await fillSaved(page, topic, 'Deine Steuerfunktion', CONTROL);
  await page.evaluate(() => {
    const original = navigator.locks.request.bind(navigator.locks);
    navigator.locks.request = async (...args) => {
      if (window.holdJourneyWrite) await new Promise(resolve => { window.releaseJourneyWrite = resolve; });
      return original(...args);
    };
  });
  await page.getByRole('button', { name: 'Steuerung ausführen und prüfen', exact: true }).click();
  await page.evaluate(() => { window.holdJourneyWrite = true; });
  await page.getByLabel('Deine Antwort (optional, nur lokal)', { exact: true }).fill('Synthetische Notiz während der Modellprüfung.');
  await expect(page.locator('.journey-status')).not.toHaveText('Gespeichert');
  await expect(page.getByText(/✓ Rückgabe .*Fehler-\/Wiederanlaufproben bestätigt/)).toHaveCount(15);
  await expect(page.getByRole('button', { name: 'Prüfung stoppen', exact: true })).toHaveCount(0);
  await page.evaluate(() => { window.holdJourneyWrite = false; window.releaseJourneyWrite(); });
  await expect(page.getByText('Alle Steuerungsproben bestanden.', { exact: true })).toBeVisible(); await saved(page);
  const state = JSON.parse(await rawOf(page, topic)); expect(state.lab.codePassed).toBe(true);
  expect(state.reflection.drafts[topic.interview[1].id]).toContain('Synthetische Notiz');
  await page.reload(); await saved(page); await expect(page.getByText('Alle Steuerungsproben bestanden.', { exact: true })).toBeVisible();
});

test('LF9: gesperrte Gäste genügen bei kaputtem Dienst nicht als Nachweis', async ({ page }, info) => {
  test.setTimeout(90_000); const topic = await openLab(page, LAB_TOPICS[2]);
  const finish = page.getByRole('button', { name: 'Dienstfall abschließen', exact: true });
  await expect(page.getByRole('combobox', { name: 'DNS-Zieladresse', exact: true })).toBeDisabled();
  await clickSaved(page, topic, 'Befund abrufen'); await expect(finish).toBeDisabled();
  await configure(page, topic, 'Ursache des Ausgangsfehlers', 'dns'); await configure(page, topic, 'DNS-Zieladresse', '198.51.100.10');
  await expect(finish).toBeDisabled(); await clickSaved(page, topic, 'Dienst erneut prüfen'); await clickSaved(page, topic, 'Dienstfall abschließen');
  await clickSaved(page, topic, 'Befund abrufen');
  await expect(page.getByText('Mitarbeiterprobe: Portal nicht erreichbar.', { exact: true })).toBeVisible();
  await expect(page.getByRole('status').getByText('Gastprobe: kein Portalzugriff.', { exact: false })).toBeVisible(); await expect(finish).toBeDisabled();
  await configure(page, topic, 'Ursache des Ausgangsfehlers', 'service'); await configure(page, topic, 'Dienstbetrieb', 'true');
  await clickSaved(page, topic, 'Dienst erneut prüfen'); await clickSaved(page, topic, 'Dienstfall abschließen');
  await clickSaved(page, topic, 'Befund abrufen'); await expect(page.getByText('Gastprobe: Portal unerwartet erreichbar.', { exact: true })).toBeVisible();
  await configure(page, topic, 'Ursache des Ausgangsfehlers', 'policy'); await configure(page, topic, 'Portalzugriff', 'staff');
  await clickSaved(page, topic, 'Dienst erneut prüfen'); await clickSaved(page, topic, 'Dienstfall abschließen'); await page.reload(); await saved(page);
  await expect(page.getByText('Alle drei Dienstfälle erfolgreich geprüft.', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await captureLab(page, topic, info, 'Netzwerk und Dienste', 'lf9');
});
for (const [index, topic] of topics.entries()) {
  test(`${topic.title}: vollständiger Lernablauf, passende Auswertung und Fortsetzung`, async ({ page }) => {
    test.setTimeout(120_000);
    await setup(page); await seed(page, [...earlierTopics, ...topics.slice(0, index)].map(item => stateAt(item)));
    const originals = await Promise.all([...earlierTopics, ...topics.slice(0, index)].map(item => rawOf(page, item)));
    await page.goto('/lernreise?fr=FIAE');
    await page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${route(topic)}$`));
    await clickSaved(page, topic, 'Abschnitt beginnen');
    await clickSaved(page, topic, 'Gelesen – weiter');
    await page.reload(); await saved(page);
    await expect(page.getByRole('heading', { name: topic.blocks[1].title, exact: true })).toBeVisible();
    await clickSaved(page, topic, 'Gelesen – weiter'); await clickSaved(page, topic, 'Gelesen – weiter'); await clickSaved(page, topic, 'Gelesen – zum Quiz');
    for (const [i, questionId] of topic.quiz.questionIds.entries()) {
      await choose(page, topic, questionId); await clickSaved(page, topic, 'Antwort prüfen');
      await expect(page.getByRole('region', { name: 'Aktueller Lernschritt' })).toContainText('Richtig.');
      await clickSaved(page, topic, i === 5 ? 'Weiter zur Selbstreflexion' : 'Nächste Frage');
    }
    for (const [i, item] of topic.interview.entries()) {
      if (item.practice && LAB_TOPICS.includes(topic.id)) {
        await expect(page.getByRole('region', { name: 'Praktischer Arbeitsauftrag' })).toBeVisible();
        await completeLab(page, topic);
      } else if (item.practice) {
        const project = page.getByRole('region', { name: 'Praktischer Projektauftrag' });
        await expect(project).toContainText(item.practice.task);
        for (const step of item.practice.checklist) await expect(project).toContainText(step);
        await page.getByLabel('Deine Antwort (optional, nur lokal)').fill('Meine Beobachtung zum Projektauftrag.');
        await expect.poll(async () => JSON.parse(await rawOf(page, topic)).reflection.drafts[item.id]).toBe('Meine Beobachtung zum Projektauftrag.');
      }
      await clickSaved(page, topic, 'Kernpunkte ansehen');
      const next = i === 2 ? 'Verglichen – zu den Karteikarten' : 'Verglichen – weiter';
      if (item.practice) {
        await expect(page.getByRole('button', { name: next, exact: true })).toBeDisabled();
        await page.getByLabel(item.practice.confirmation, { exact: true }).check();
        await page.reload(); await saved(page);
        await expect(page.getByRole('button', { name: next, exact: true })).toBeDisabled();
        await page.getByLabel(item.practice.confirmation, { exact: true }).check();
      }
      await clickSaved(page, topic, next);
    }
    for (const card of topic.cards) { await clickSaved(page, topic, 'Kartenantwort zeigen'); await clickSaved(page, topic, 'Gewusst – weiter'); }
    await clickSaved(page, topic, 'Mini-Test beginnen');
    for (const [i, questionId] of topic.exam.questionIds.entries()) {
      await choose(page, topic, questionId);
      if (i < 7) await clickSaved(page, topic, 'Nächste Testfrage');
    }
    await clickSaved(page, topic, 'Mini-Test abgeben');
    await expect(page.getByText('8 von 8 richtig (100 %).', { exact: false })).toBeVisible();
    const final = JSON.parse(await rawOf(page, topic));
    expect(final.exam.result.objectives).toHaveLength(topic.objectives.length);
    expect(final.bestResult.passed).toBe(true);
    expect(await Promise.all([...earlierTopics, ...topics.slice(0, index)].map(item => rawOf(page, item)))).toEqual(originals);
    await page.reload(); await saved(page);
    await expect(page.getByRole('heading', { name: 'Deine Auswertung' })).toBeVisible();
    if (topic.fieldReview && topic.fieldId.endsWith('a')) {
      await page.getByText('Bestätigten Projektauftrag nachlesen', { exact: true }).click();
      await expect(page.getByText('Meine Beobachtung zum Projektauftrag.', { exact: true })).toBeVisible();
    }
    if (topic.nextTopic) await expect(page.getByRole('link', { name: `Nächstes Thema: ${topic.nextTopic.title}` })).toBeVisible();
    await page.getByRole('link', { name: 'Zur Lernreise', exact: true }).click();
    await expect(page.getByText(`${topic.fieldId}: ${topics.slice(0, index + 1).filter(t => t.fieldId === topic.fieldId).length} von ${topics.filter(t => t.fieldId === topic.fieldId).length} Themen bestanden.`, { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: `${topic.fieldId} in der Lernreise abgeschlossen`, exact: true })).toHaveCount(topic.fieldReview ? 1 : 0);
    const completion = page.getByRole('region', { name: 'FIAE-Abschluss' });
    if (topic.nextTopic) {
      await expect(completion).toHaveCount(0);
    } else {
      await expect(completion).toContainText('alle 94 Themenchecks bestanden');
      await page.setViewportSize({ width: 390, height: 844 });
      await completion.getByText('Meine Lernziele und Ergebnisse ansehen').focus();
      await page.keyboard.press('Enter');
      await completion.locator('summary').filter({ hasText: /^LF12a ·/ }).click();
      await expect(completion.getByText(topic.objectives[0].text, { exact: false })).toBeVisible();
      await expect(completion.locator('li')).toHaveCount(248);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
  });
}

test('LF12a: Sechs von acht im letzten Thema lassen den Gesamtabschluss offen', async ({ page }) => {
  const final = allTopics.at(-1);
  await setup(page);
  await seed(page, allTopics.map(topic => stateAt(topic, topic.id === final.id ? 'failed' : 'result')));
  await page.goto('/lernreise?fr=FIAE');
  await expect(page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true })).toHaveAttribute('href', route(final));
  await expect(page.getByRole('region', { name: 'FIAE-Abschluss' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Lernreise fortsetzen', exact: true }).click();
  await expect(page.getByText('6 von 8 richtig (75 %).', { exact: false })).toBeVisible();
  await clickSaved(page, final, 'Mini-Test wiederholen');
  await expect(page.getByRole('button', { name: 'Mini-Test beginnen' })).toBeVisible();
});

test('Electron: 94 Themen und die drei Lernlabore überstehen vollständigen Neustart', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron-Matrix'); test.setTimeout(90_000);
  const profile = info.outputPath('lf789-complete-profile');
  const launch = async () => {
    const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') }; delete env.ELECTRON_RUN_AS_NODE;
    const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/); const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.route('**/api/ai/**', handler => handler.abort()); return { app, page, origin };
  };
  let first; let second;
  try {
    first = await launch(); await seed(first.page, allTopics.map(item => stateAt(item))); const originals = await Promise.all(allTopics.map(item => rawOf(first.page, item)));
    await first.page.goto(`${first.origin}/lernreise?fr=FIAE`); await expect(first.page.getByRole('heading', { name: 'FIAE-Lernreise abgeschlossen', exact: true })).toBeVisible();
    await first.app.close(); first.app = null;
    second = await launch(); await second.page.goto(`${second.origin}${route(lastLab)}`); await saved(second.page);
    expect(await Promise.all(allTopics.map(item => rawOf(second.page, item)))).toEqual(originals);
    await second.page.getByText('Lernlabor nachlesen', { exact: true }).click();
    await expect(second.page.getByText('Lernlabor erfolgreich abgeschlossen.', { exact: false })).toBeVisible();
    await expect(second.page.getByRole('button', { name: 'Schritt prüfen', exact: true })).toHaveCount(0);
    await clickSaved(second.page, lastLab, 'Mini-Test wiederholen');
    expect(JSON.parse(await rawOf(second.page, lastLab)).lab.done).toBe(true);
    expect(JSON.parse(await rawOf(second.page, lastLab)).lastExamMarks).toEqual(Array(8).fill(true));
    await second.page.goto(`${second.origin}/lernreise?fr=FIAE`);
    const completion = second.page.getByRole('region', { name: 'FIAE-Abschluss' });
    await completion.getByText('Meine Lernziele und Ergebnisse ansehen').click();
    await completion.locator('summary').filter({ hasText: /^LF9 ·/ }).click();
    await expect(completion.getByText(lastLab.objectives[0].text, { exact: false })).toContainText('richtig');
    expect(await Promise.all(allTopics.filter(item => item !== lastLab).map(item => rawOf(second.page, item)))).toEqual(originals.filter((_, index) => allTopics[index] !== lastLab));
  } finally { await second?.app?.close(); await first?.app?.close(); }
});

