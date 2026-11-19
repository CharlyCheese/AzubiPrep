import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TIMER_LIMITS, createDebugTimerQueue, installDebugTimers, initialTimerProject, validTimerSnapshot } from '../../frontend/src/pilot/debugger-timers.js';
import { compileDebugger, compileDebugProject } from '../../frontend/src/pilot/debugger-compiler.js';
import { parseDebugHTML } from '../../frontend/src/pilot/debugger-dom-parse.js';
import { startDebugger } from '../../frontend/src/pilot/debugger.js';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';
test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const region = p => p.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = p => region(p).getByLabel('Debugstatus', { exact: true });
const button = (p, name) => region(p).getByRole('button', { name, exact: true });
const output = p => region(p).getByLabel('Debugkonsole', { exact: true });
const view = p => p.frameLocator('iframe[title="Gestaltete Debugvorschau"]');
const project = source => ({ schema: 1, mode: 'module', entry: 'main.js', css: 'body { color: #163344; }', html: '<p id="text">Start</p><button id="cancel" type="button">Abbrechen</button>', files: { 'main.js': source } });
async function open(page, url = '/frontendkurs/debugger') { await unterdrueckeOnboardingPopups(page); await page.goto(url); await openDebugger(page); await region(page).getByLabel('Debugmodus', { exact: true }).selectOption('dom'); }
async function load(page, p = initialTimerProject()) { page.once('dialog', d => d.accept()); await region(page).getByLabel('Modulsicherung lesen', { exact: true }).setInputFiles({ name: 'timer-probe.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(p)) }); await expect(region(page).getByLabel('Eigener Debugcode', { exact: true })).toHaveValue(p.files[p.entry]); }
async function start(page) { await button(page, 'Debuggen starten').click(); await expect(status(page)).toContainText('Angehalten'); }
async function go(page) { await button(page, 'Weiter / bis zum nächsten Haltepunkt').click(); }
async function idle(page) { await expect(status(page)).toContainText('Bereit für Klicks'); }
async function fire(page, name) { await view(page).getByRole('button', { name, exact: true }).click(); await expect(status(page)).toContainText('Ereignisstart'); await go(page); await idle(page); }
function artifact(p) { const a = compileDebugProject(p, undefined, { dom: true }); a.dom = { tree: parseDebugHTML(p.html), eventPoint: a.points.at(-1).id }; return a; }
async function raw(page, source, options = {}) {
  let a; try { a = artifact(typeof source === 'string' ? project(source) : source); } catch (error) { return [{ type: 'error', text: error.message }]; }
  const asset = fs.readdirSync(path.join(repo, 'frontend/dist/assets')).find(n => /^debugger\.worker-.*\.js$/.test(n));
  return page.evaluate(({ artifact, asset, options }) => new Promise(resolve => {
    const worker = new Worker('/assets/' + asset, { type: 'module' }), events = []; let command = 0, wake, early = false;
    const finish = () => { clearTimeout(timeout); clearTimeout(wake); worker.terminate(); resolve(events); };
    const timeout = setTimeout(() => { events.push({ type: 'timeout' }); finish(); }, 14000);
    const send = fields => worker.postMessage({ type: 'control', session: 'timer', revision: 'rev', commandId: ++command, ...fields });
    worker.onmessage = ({ data }) => {
      events.push(data);
      if (data.type === 'paused') send({ pauseId: data.pauseId, mode: 'continue' });
      if (data.type === 'idle') {
        if (!data.timers.pending || options.stopAtIdle) finish();
        else if (options.early && !early) { early = true; send({ timer: true }); }
        else wake = setTimeout(() => send({ timer: true }), Math.ceil(data.timers.nextDelay));
      }
      if (['error', 'done'].includes(data.type)) finish();
    };
    worker.postMessage({ type: 'start', session: 'timer', revision: 'rev', artifact, limits: {} });
  }), { artifact: a, asset, options });
}
function model() {
  let now = 0, fatal = ''; const callbacks = new Set(), events = [], queue = createDebugTimerQueue(() => now);
  const core = { guard() { if (fatal) throw Error(fatal); }, abort(t) { fatal = t; throw Error(t); }, registered: fn => callbacks.has(fn), invoke: (fn, args) => fn(...args) };
  const m = installDebugTimers(core, text => { const data = JSON.parse(text); events.push(data); if (data.error) return false; if (data.action === 'schedule') queue.schedule(data.id, data.delay); else queue.cancel(data.id); return true; }, TIMER_LIMITS);
  return { queue, events, set: (...args) => m.call('setTimeout', args), clear: (...args) => m.call('clearTimeout', args), callback(fn = () => {}) { callbacks.add(fn); return fn; }, tick(ms) { now += ms; }, fire() { const id = queue.take(); if (id !== null) { m.dispatch(id); queue.endTask(); } return id; } };
}

test('Timerbeispiel: planen, abbrechen, erneut planen und Callback schrittweise ausführen', async ({ page }) => {
  await open(page); page.once('dialog', d => d.accept()); await button(page, 'Timerbeispiel laden').click(); await start(page); await go(page); await idle(page); await expect(region(page).getByLabel('CSS-Hinweise')).toHaveCount(0);
  await fire(page, 'Meldung planen'); await expect(region(page).getByLabel('Geplante Timer', { exact: true })).toContainText('1');
  await fire(page, 'Meldung abbrechen'); await expect(region(page).getByLabel('Geplante Timer', { exact: true })).toContainText('0'); await page.waitForTimeout(3200); await idle(page); await expect(output(page)).not.toContainText('Die Wartezeit ist vorbei!');
  await fire(page, 'Meldung planen'); await expect(status(page)).toContainText('Timerstart'); await expect(output(page)).not.toContainText('Die Wartezeit ist vorbei!'); await expect(region(page).getByLabel('Debug-Aufrufkette')).toContainText('zeigeMeldung'); await expect(region(page).getByRole('region', { name: 'Debugvariablen' })).toContainText('Die Wartezeit ist vorbei!');
  await button(page, 'Debug-Haltepunkt main.js Zeile 8 Spalte 3').click(); await go(page); await expect(status(page)).toContainText('main.js:8:3. Angehalten · Haltepunkt'); await expect(view(page).locator('#meldung')).toContainText('Meldung geplant');
  await button(page, 'Einzelner Schritt').click(); await expect(view(page).locator('#meldung')).toHaveText('Die Wartezeit ist vorbei!'); await button(page, 'Funktion verlassen').click(); await idle(page); await expect(output(page)).toContainText('Die Wartezeit ist vorbei!');
});

test('Timerreihenfolge, Zusatzargumente, lebende Closures und Abbruch stimmen mit nativem JavaScript überein', async ({ page }) => {
  await open(page);
  const source = `const log = []; let wert = 1; const obj = {zahl: 3};
const cancelled = setTimeout(() => { log.push("falsch"); }, 0); clearTimeout(cancelled); clearTimeout(cancelled); clearTimeout(999); clearTimeout();
setTimeout((a,b) => { log.push(a + b + obj.zahl + wert); setTimeout(() => { log.push("verschachtelt"); console.log(log.join("|")); }, 0); }, 0, 2, 4);
setTimeout(() => { log.push("zweiter"); }, 0);
wert = 8; obj.zahl = 5; log.push("synchron");`;
  const native = await page.evaluate(() => new Promise(resolve => { const log = []; let wert = 1; const obj = { zahl: 3 }; const id = setTimeout(() => log.push('falsch'), 0); clearTimeout(id); clearTimeout(id); clearTimeout(999); clearTimeout(); setTimeout((a, b) => { log.push(a + b + obj.zahl + wert); setTimeout(() => { log.push('verschachtelt'); resolve(log.join('|')); }, 0); }, 0, 2, 4); setTimeout(() => log.push('zweiter'), 0); wert = 8; obj.zahl = 5; log.push('synchron'); }));
  const events = await raw(page, source); expect(events.at(-1).type).toBe('idle'); expect(events.filter(e => e.type === 'log').map(e => e.text)).toEqual([native]); expect(events.filter(e => e.type === 'paused' && e.cause === 'timer')).toHaveLength(3);
  const cancelOther = await raw(page, 'let second;let first=setTimeout(()=>{clearTimeout(first);clearTimeout(second);console.log("nur erster");},0);second=setTimeout(()=>{console.log("falsch");},0);'); expect(cancelOther.filter(e => e.type === 'log').map(e => e.text)).toEqual(['nur erster']);
});

test('Timeruhr: Fälligkeit, gleiche Fristen, eingefrorene Zeit und verschachtelte Mindestwartezeit', () => {
  let now = 0; const q = createDebugTimerQueue(() => now); q.schedule(1, 100); q.schedule(2, 50); q.schedule(3, 50); now = 49; expect(q.take()).toBeNull(); q.pause(); now = 5000; expect(q.snapshot().nextDelay).toBe(1); expect(q.take()).toBeNull(); q.resume(); now++; expect(q.take()).toBe(2); q.endTask(); expect(q.take()).toBe(3); q.endTask(); q.cancel(1); expect(q.snapshot()).toEqual({ pending: 0, nextDelay: null });
  const nested = createDebugTimerQueue(() => now); nested.schedule(1, 0);
  for (let id = 1; id <= 6; id++) { expect(nested.take()).toBe(id); nested.schedule(id + 1, 0); nested.endTask(); }
  expect(nested.snapshot().nextDelay).toBe(4); now += 3; expect(nested.take()).toBeNull(); now++; expect(nested.take()).toBe(7); nested.endTask(); nested.schedule(8, 0); expect(nested.take()).toBe(8);
  expect(validTimerSnapshot({ pending: 0, nextDelay: 0 })).toBe(false); expect(validTimerSnapshot({ pending: 17, nextDelay: 1 })).toBe(false); expect(validTimerSnapshot({ pending: 1, nextDelay: NaN })).toBe(false); expect(validTimerSnapshot({ pending: 1, nextDelay: 30000 })).toBe(true);
});

test('Timergrenzen: offene Einträge, Gesamtregistrierungen, Aufrufe, Ausführungen und Argumente', () => {
  let m = model(), fn = m.callback(); for (let i = 0; i < 16; i++) m.set(fn, 0); expect(m.queue.snapshot().pending).toBe(16); expect(() => m.set(fn, 0)).toThrow(/Registrierungsgrenze/); expect(() => m.clear(1)).toThrow(/Registrierungsgrenze/);
  m = model(); fn = m.callback(); for (let i = 0; i < 128; i++) { const id = m.set(fn, 0); if (i < 127) m.clear(id); } expect(() => m.set(fn, 0)).toThrow(/Registrierungsgrenze/);
  m = model(); for (let i = 0; i < 256; i++) m.clear(123); expect(() => m.clear(123)).toThrow(/Operationsgrenze/);
  m = model(); fn = m.callback(); for (let i = 0; i < 64; i++) { m.set(fn, 0); expect(m.fire()).not.toBeNull(); } m.set(fn, 0); expect(() => m.fire()).toThrow(/Ausführungsgrenze/);
  m = model(); let received; fn = m.callback((...args) => { received = args; }); const object = { a: 1 }; m.set(fn, -4.5, object, 2, 3, 4, 5, 6, 7, 8); m.fire(); expect(received[0]).toBe(object); expect(received.length).toBe(8); expect(() => m.set(fn, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9)).toThrow(/Zusatzargumente/);
  m = model(); fn = m.callback(); m.set(fn, 30000); m.set(fn, 2.9); expect(m.queue.snapshot().nextDelay).toBe(2); expect(() => m.set(fn, 30000.1)).toThrow(/Wartezeit/);
  expect(m.events.every(e => Object.keys(e).every(k => ['action','id','delay','error'].includes(k)))).toBe(true);
});

test('Echte Laufzeit: unter/auf/über den Timerbudgets und endgültige Schutzabbrüche', async ({ page }) => {
  test.setTimeout(90000); await open(page);
  for (const [source, expected] of [
    ['const ids=[];for(let i=0;i<16;i++){ids.push(setTimeout(()=>{},30000));}for(const id of ids){clearTimeout(id);}console.log("16");', '16'],
    ['for(let i=0;i<128;i++){clearTimeout(setTimeout(()=>{},0));}console.log("128/256");', '128/256'],
    ['let n=0;function tick(){n++;if(n<64){setTimeout(tick,0);}else{console.log(n);}}setTimeout(tick,0);', '64'],
    ['setTimeout((a,b,c,d,e,f,g,h)=>{console.log(a+h);},undefined,1,2,3,4,5,6,7,8);', '9'],
  ]) { const events = await raw(page, source); expect(events.at(-1).type, JSON.stringify(events.at(-1))).toBe('idle'); expect(events.filter(e => e.type === 'log').map(e => e.text)).toEqual([expected]); }
  for (const [source, message] of [
    ['try{for(let i=0;i<17;i++){setTimeout(()=>{},0);}}catch(e){}console.log("verboten");', /Registrierungsgrenze/],
    ['for(let i=0;i<128;i++){const id=setTimeout(()=>{},0);if(i<127){clearTimeout(id);}}setTimeout(()=>{},0);', /Registrierungsgrenze/],
    ['try{for(let i=0;i<257;i++){clearTimeout(0);}}finally{console.log("verboten");}', /Operationsgrenze/],
    ['function tick(){setTimeout(tick,0);}setTimeout(tick,0);', /Ausführungsgrenze/],
    ['setTimeout(()=>{},30000.1);', /Wartezeit/],
  ]) { const events = await raw(page, source); expect(events.at(-1).type).toBe('error'); expect(events.at(-1).text).toMatch(message); expect(events.filter(e => e.type === 'log').map(e => e.text)).not.toContain('verboten'); }
});

test('Timer halten Zeit und andere Timer an; Quellhaltepunkt und Callbackübertritt sind sichtbar', async ({ page }) => {
  await open(page); await load(page, project('const id = setTimeout(() => {\n  console.log("erster");\n}, 1000);\nsetTimeout(() => { console.log("zweiter"); }, 1300);\nconsole.log("geplant");'));
  await start(page); await button(page, 'Debug-Haltepunkt main.js Zeile 5 Spalte 1').click(); await go(page); await expect(status(page)).toContainText('main.js:5:1'); await page.waitForTimeout(1600); await expect(output(page)).toHaveText('Noch keine Ausgabe.'); await expect(status(page)).toContainText('Haltepunkt');
  await go(page); await expect(status(page)).toContainText('Timerstart'); await page.waitForTimeout(1600); await expect(output(page)).toHaveText('geplant'); await expect(region(page).getByLabel('Geplante Timer')).toContainText('Timerzeit angehalten'); await go(page); await expect(status(page)).toContainText('Timerstart'); await expect(output(page)).toHaveText('geplant\nerster'); await go(page); await idle(page); await expect(output(page)).toHaveText('geplant\nerster\nzweiter');
});

test('Timeraufbereitung wahrt lokale Namen, Imports, Argumentreihenfolge und noch nicht unterstützte Grenzen', async ({ page }) => {
  await open(page);
  for (const source of ['const alias=setTimeout;', 'window.setTimeout(()=>{},0);', 'setTimeout.call(null,()=>{},0);', 'setInterval(()=>{},0);', 'queueMicrotask(()=>{});', '__azubi_dbg_checkpoint.dispatchTimer(1,0);']) expect(() => artifact(project(source))).toThrow();
  expect(() => compileDebugger({ schema: 1, name: 'main.js', source: 'setTimeout(()=>{},0);' })).toThrow();
  const p = project('import {setTimeout} from "./own.js";console.log(setTimeout(4));'); p.files['own.js'] = 'export function setTimeout(value){return value+2;}';
  for (const [source, expected] of [[p, '6'], ['function own(clearTimeout){return clearTimeout(4);}const setTimeout=n=>n*2;console.log(own(setTimeout));', '8'], ['let x=0;function delay(){x++;return 0;}setTimeout((value)=>{console.log(value+":"+x);},delay(),x++);', '1:2']]) { const events = await raw(page, source); expect(events.at(-1).type).toBe('idle'); expect(events.filter(e => e.type === 'log').map(e => e.text)).toEqual([expected]); }
  const tdz = await raw(page, 'setTimeout(()=>{},0);let setTimeout;'); expect(tdz.at(-1).type).toBe('error');
});

test('Timer verbieten Textprogramme, Hostfunktionen, Konvertierung und weiterhin unfreigegebene Rechte', async ({ page }) => {
  test.setTimeout(60000); await open(page);
  for (const source of ['setTimeout("console.log(1)",0);', 'setTimeout({},0);', 'setTimeout(()=>{},"2");', 'setTimeout(()=>{},NaN);', 'setTimeout(()=>{},Infinity);', 'setTimeout(()=>{},{valueOf:()=>0});', 'clearTimeout({});', 'clearTimeout(1.5);', 'setTimeout(()=>{},0,1,2,3,4,5,6,7,8,9);']) { const events = await raw(page, source); expect(events.at(-1).type, source).toBe('error'); }
  const events = await raw(page, 'setTimeout(()=>{throw new Error("Probe");},0);'); expect(events.at(-1).type).toBe('error'); expect(events.at(-1).text).toContain('Timer-Callback');
  const early = await raw(page, 'setTimeout(()=>{console.log("einmal");},300);', { early: true }); expect(early.some(e => e.timerWait)).toBe(true); expect(early.filter(e => e.type === 'log').map(e => e.text)).toEqual(['einmal']);
});

test('Timer und Klicks teilen einen Befehlsweg; Abbrechen während Timerwartezeit und Haltepunktsänderungen', async ({ page }) => {
  await open(page); await load(page, project('const id=setTimeout(()=>{console.log("timer");},30000);\ndocument.getElementById("cancel").addEventListener("click",()=>{clearTimeout(id);console.log("abgebrochen");});'));
  await start(page); await go(page); await idle(page);
  const points = region(page).getByRole('button', { name: /^Debug-Haltepunkt/ }); for (let i = 0; i < 3; i++) { await points.first().click(); await points.first().click(); }
  await fire(page, 'Abbrechen'); await expect(region(page).getByLabel('Geplante Timer')).toContainText('0'); await idle(page); await expect(output(page)).toHaveText('abgebrochen'); await expect(region(page).getByLabel('Debugfehler')).toHaveCount(0);
});

test('Controller serialisiert Timer hinter Bestätigungen und verwirft frühe/veraltete Weckungen', () => {
  const original = { Worker: globalThis.Worker, setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout };
  const workers = [], scheduled = new Map(), events = []; let next = 0, run;
  class FakeWorker { constructor() { this.sent = []; workers.push(this); } terminate() { this.terminated = true; } postMessage(data) { this.sent.push(data); } }
  globalThis.Worker = FakeWorker;
  globalThis.setTimeout = (fn, ms) => { const id = ++next; scheduled.set(id, { fn, ms }); return id; };
  globalThis.clearTimeout = id => scheduled.delete(id);
  try {
    const p = project('console.log("fertig");'), a = artifact(p);
    run = startDebugger({ ...p, mode: 'dom' }, e => events.push(e)); workers[0].onmessage({ data: { artifact: a } });
    const worker = workers[1], initial = worker.sent[0]; let seq = 0;
    const emit = data => worker.onmessage({ data: { ...data, session: initial.session, revision: initial.revision, seq: ++seq } });
    const controls = () => worker.sent.filter(x => x.type === 'control');
    const end = a.points.find(p => p.end), scopes = end.scopes.map(s => ({ id: s.id, values: [] }));
    run.breakpoints([]); emit({ type: 'running', remaining: 1000 }); emit({ type: 'final', snapshot: { point: end.id, frames: [{ id: 0, functionId: 0, point: end.id, scopes }], scopes, truncated: false } });
    emit({ type: 'idle', remaining: 999, timers: { pending: 1, nextDelay: 0 } });
    const wake = [...scheduled.values()].find(t => t.ms === 0).fn; wake(); expect(run.event({ id: 1 })).toBe(false); expect(controls()).toHaveLength(1);
    emit({ type: 'ack', commandId: 1 }); expect(controls().at(-1)).toMatchObject({ commandId: 2, timer: true });
    emit({ type: 'ack', commandId: 2 }); emit({ type: 'idle', timerWait: true, remaining: 999, timers: { pending: 1, nextDelay: 0.4 } });
    const currentWake = [...scheduled.values()].find(t => t.ms === 1).fn;
    expect(run.event({ id: 1 })).toBe(true); currentWake(); expect(controls()).toHaveLength(3); expect(controls().at(-1)).toMatchObject({ event: { id: 1 } }); expect(controls().at(-1).timer).toBeUndefined();
    emit({ type: 'ack', commandId: 3 }); emit({ type: 'running', remaining: 999 }); emit({ type: 'idle', remaining: 998, timers: { pending: 1, nextDelay: 10 } });
    const finalWake = [...scheduled.values()].find(t => t.ms === 10).fn; finalWake(); expect(controls().at(-1)).toMatchObject({ commandId: 4, timer: true });
    emit({ type: 'ack', commandId: 4 }); emit({ type: 'running', remaining: 998 }); emit({ type: 'idle', remaining: 997, timers: { pending: 0, nextDelay: null } });
    expect(events.filter(e => e.type === 'error')).toEqual([]); run.stop(); wake(); currentWake(); finalWake(); expect(controls()).toHaveLength(4); expect(worker.terminated).toBe(true); expect(scheduled.size).toBe(0);
  } finally { run?.dispose(); Object.assign(globalThis, original); }
});

test('Stop, Fehler, neue Quelle, Navigation und Reload verwerfen Timer; Sicherung enthält nur Quellen', async ({ page }, info) => {
  await open(page); const p = project('setTimeout(()=>{console.log("spät");},2000);'); await load(page, p); await start(page); await go(page); await idle(page);
  const download = page.waitForEvent('download'); await button(page, 'Modulprojekt exportieren (JSON)').click(); const file = await download, target = info.outputPath('originale.json'); await file.saveAs(target); expect(JSON.parse(fs.readFileSync(target, 'utf8'))).toEqual(p);
  await button(page, 'Debuggen stoppen').click(); await page.waitForTimeout(2100); await expect(output(page)).toHaveText('Noch keine Ausgabe.'); await expect(region(page).getByLabel('Geplante Timer')).toHaveCount(0); expect(page.workers()).toHaveLength(0);
  await start(page); await go(page); await idle(page); await region(page).getByLabel('Eigener Debugcode').fill('console.log("neu");'); await expect(status(page)).toContainText('Quellstand bereit'); expect(page.workers()).toHaveLength(0); await start(page); await go(page); await idle(page); await expect(output(page)).toHaveText('neu');
  await load(page, p); await start(page); await go(page); await idle(page); await page.goto('/frontendkurs'); expect(page.workers()).toHaveLength(0); await page.goto('/frontendkurs/debugger'); await openDebugger(page); await expect(region(page).getByLabel('Geplante Timer')).toHaveCount(0); await start(page); await go(page); await idle(page); await page.reload(); await openDebugger(page); await expect(output(page)).toHaveText('Noch keine Ausgabe.');
});

test('Schmale Ansicht und Tastatur: Timer planen, Timerstart erreichen und Stop bedienen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await open(page); await load(page); await start(page); await go(page); await idle(page);
  await view(page).getByRole('button', { name: 'Meldung planen', exact: true }).focus(); await page.keyboard.press('Enter'); await expect(status(page)).toContainText('Ereignisstart'); await go(page); await expect(status(page)).toContainText('Timerstart'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await button(page, 'Weiter / bis zum nächsten Haltepunkt').focus(); await page.keyboard.press('Enter'); await idle(page); await expect(output(page)).toContainText('Die Wartezeit ist vorbei!'); await button(page, 'Debuggen stoppen').focus(); await page.keyboard.press('Enter'); await expect(status(page)).toContainText('gestoppt');
});

test('Electron: echter Timer-Callback, Stop und Projektfortsetzung ohne laufende Timer nach Neustart @desktop', async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron'); test.setTimeout(60000); const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE; env.DATABASE_URL = ''; env.AZUBIPREP_KI_ENABLED = 'false'; env.AZUBIPREP_CHATGPT_ENABLED = 'false'; let app;
  const launch = () => _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), '--user-data-dir=' + info.outputPath('profil')], env });
  try {
    app = await launch(); let page = await app.firstWindow(); await page.waitForURL(/^http:/); await open(page, new URL(page.url()).origin + '/frontendkurs/debugger'); await load(page); await start(page); await go(page); await idle(page); await fire(page, 'Meldung planen'); await expect(status(page)).toContainText('Timerstart'); await go(page); await idle(page); await expect(output(page)).toContainText('Die Wartezeit ist vorbei!'); await fire(page, 'Meldung planen'); await expect(page.locator('.pilot-status')).toHaveText('Gespeichert'); await app.close(); app = null;
    app = await launch(); page = await app.firstWindow(); await page.waitForURL(/^http:/); await open(page, new URL(page.url()).origin + '/frontendkurs/debugger'); await expect(region(page).getByLabel('Eigener Debugcode')).toHaveValue(initialTimerProject().files['main.js']); await expect(region(page).getByLabel('Geplante Timer')).toHaveCount(0); await page.waitForTimeout(3200); await expect(output(page)).toHaveText('Noch keine Ausgabe.'); await start(page); await go(page); await idle(page); await expect(region(page).getByLabel('Geplante Timer')).toContainText('0');
  } finally { await app?.close(); }
});
