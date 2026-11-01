import { parseHTML } from './preview.js';
import { checkFiles, resolvePath } from './project.js';

export function validAdvancedSnapshot(data) {
  let count = 0; let characters = 0;
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const walk = (node, depth) => {
    if (!object(node) || ++count > 3000 || depth > 32) return false;
    if (Object.hasOwn(node, 'text')) { if(typeof node.text!=='string'||node.text.length>4000)return false;characters+=node.text.length;return characters<=64000; }
    return Number.isSafeInteger(node.id) && node.id > 0 && typeof node.tag === 'string' && node.tag.length < 40 && object(node.attrs) && Object.keys(node.attrs).length <= 20 && Object.values(node.attrs).every(value => typeof value === 'string' && value.length <= 300) && typeof node.value === 'string' && node.value.length <= 2000 && ['checked','disabled','required'].every(key => typeof node[key] === 'boolean') && Array.isArray(node.children) && node.children.length <= 3000 && node.children.every(child => walk(child, depth + 1));
  };
  return object(data) && walk(data.tree,0) && object(data.store) && Object.keys(data.store).length <= 20 && Object.values(data.store).every(value=>typeof value==='string'&&value.length<=65536) && (data.focus===null||data.focus===undefined||Number.isSafeInteger(data.focus)&&data.focus>0) && typeof data.title==='string'&&data.title.length<=200&&typeof data.path==='string'&&data.path.length<=1000;
}

export function advancedProgram(files, entry = 'index.html') {
  checkFiles(files);
  const doc = parseHTML(files[entry]?.content || '');
  const scripts = [...doc.querySelectorAll('script')];
  if (scripts.length !== 1 || scripts[0].textContent.trim() || scripts[0].hasAttribute('async')) throw new Error('Genau eine externe Skriptdatei als Einstieg verwenden.');
  if (!['','module','text/javascript','application/javascript'].includes(scripts[0].getAttribute('type') || '')) throw new Error('Der Skripttyp muss JavaScript oder module sein.');
  const path = resolvePath(entry, scripts[0].getAttribute('src'));
  if (!path || !files[path] || !/\.[jt]sx?$/.test(path)) throw new Error('Die verknüpfte JS-/TS-/TSX-Datei fehlt.');
  if (!scripts[0].hasAttribute('defer') && scripts[0].getAttribute('type') !== 'module') throw new Error('defer oder type="module" am Einstieg verwenden.');
  let store = {};
  if (files['uebungsspeicher.json']) {
    store = JSON.parse(files['uebungsspeicher.json'].content);
    if (!store || typeof store !== 'object' || Array.isArray(store) || Object.keys(store).length > 20 || Object.values(store).some(value => typeof value !== 'string' || value.length > 65536)) throw new Error('Ungültiger Übungsspeicher.');
  }
  return { entry: path, html: files[entry].content, react: /\.[jt]sx$/.test(path), store };
}

export function startAdvanced(files, entry, lesson, onEvent, { check = false, scenario = 'ok' } = {}) {
  const program = advancedProgram(files, entry);
  let worker; let compiler = new Worker(new URL('./advanced-compiler.worker.js', import.meta.url), { type: 'module' });
  let active = true; let timer; let pending = []; let busy = true; let logs = 0;
  const fail = text => { if (!active) return; onEvent({ type: 'error', text }); dispose(); };
  const arm = ms => { clearTimeout(timer); timer = setTimeout(() => fail('Zeitgrenze erreicht. Die Übung wurde beendet.'), ms); };
  const dispose = () => { active = false; clearTimeout(timer); compiler?.terminate(); worker?.terminate(); pending = []; };
  arm(15000);
  compiler.onerror = event => { event.preventDefault(); fail('Die lokale Übersetzung konnte nicht abgeschlossen werden.'); };
  compiler.onmessage = ({ data }) => {
    if (!active) return;
    compiler.terminate(); compiler = null;
    if (data.error || data.diagnostics?.length) { fail(data.error || data.diagnostics.join('\n')); return; }
    onEvent({ type: 'types', text: /\.tsx?$/.test(program.entry) ? 'strict-Typprüfung bestanden.' : 'JavaScript übersetzt; keine TypeScript-Typprüfung erforderlich.' });
    worker = new Worker(new URL('./advanced.worker.js', import.meta.url), { type: 'module' });
    worker.onerror = event => { event.preventDefault(); fail('Die begrenzte Ausführung wurde beendet.'); };
    worker.onmessageerror = () => fail('Ungültige Antwort der Lernumgebung.');
    worker.onmessage = ({ data }) => {
      if (!active) return;
      if (data.type === 'error') { fail(String(data.text).slice(0, 2000)); return; }
      if (data.type === 'log' && (++logs > 80 || typeof data.text !== 'string' || data.text.length > 1000)) { fail('Ausgabegrenze erreicht.'); return; }
      if (data.type === 'snapshot') {
        if (JSON.stringify(data).length > 1048576 || !validAdvancedSnapshot(data)) { fail('Ungültige oder zu große DOM-Ausgabe.'); return; }
      }
      if (['log','snapshot','checked','ready'].includes(data.type)) onEvent(data);
      if (data.type === 'ready') { clearTimeout(timer); busy = false; next(); }
    };
    arm(6000);
    worker.postMessage({ type: 'start', ...program, compiled: data.compiled, lesson: lesson.id, check, scenario });
  };
  compiler.postMessage({ files });
  function next() {
    if (!active || busy || !pending.length || !worker) return;
    busy = true; arm(4500); worker.postMessage({ type: 'event', event: pending.shift() });
  }
  return { dispose, stop: () => { onEvent({ type: 'stopped' }); dispose(); }, event(event) { if (!active) return; if(pending.length>=20){fail('Zu viele gleichzeitige Eingaben. Bitte Projekt neu starten.');return;} pending.push(event); next(); } };
}

export async function checkAdvanced(files, lesson, entry, signal, manual) {
  const results = [];
  if (!lesson.documentStep) {
    const outcome = await new Promise((resolve, reject) => {
      if (signal?.aborted) { reject(new DOMException('Abgebrochen', 'AbortError')); return; }
      let checked = false; let run;
      const abort = () => { run?.dispose(); reject(new DOMException('Abgebrochen', 'AbortError')); };
      const finish = value => { signal?.removeEventListener('abort', abort); run?.dispose(); resolve(value); };
      try { run = startAdvanced(files, entry, lesson, event => {
        if (event.type === 'checked') checked = event.checked === true;
        if (event.type === 'error') finish({ passed: false, text: event.text });
        if (event.type === 'ready') finish({ passed: checked, text: checked ? 'Die festen Funktions-/Daten-/DOM-Teilprüfungen bestehen.' : 'Feste Teilprüfung offen: Namen, Rückgaben, Grenzfälle und geforderte Oberfläche vergleichen.' });
      }, { check: true }); } catch (error) { finish({ passed: false, text: error.message }); }
      signal?.addEventListener('abort', abort, { once: true });
    });
    results.push({ rule: 'advanced-program', ...outcome, message: outcome.text });
  }
  if (lesson.manualStep || lesson.documentStep) {
    const protocol = files['pruefprotokoll.md']?.content.trim() || '';
    const passed = manual === true && protocol.length > 100 && !protocol.endsWith('Eigene Erklärung und offene Grenzen:');
    results.push({ rule: 'advanced-protocol', passed, message: passed ? 'Eigenes Prüfprotokoll vorhanden; manuelle Durchführung wurde von dir bestätigt. Inhalt und Belege sind damit nicht unabhängig geprüft.' : 'Eigenes Prüfprotokoll mit tatsächlichen Soll-/Istwerten, Belegen und Grenzen ergänzen und die manuelle Durchführung bestätigen.' });
  }
  return results;
}
