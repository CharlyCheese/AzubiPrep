import { checkJsDraft } from './js-draft.js';

export function startJs(draft, onEvent, exercise) {
  checkJsDraft(draft);
  const worker = new Worker(new URL('./js-runner.worker.js', import.meta.url), { type: 'module', name: 'JavaScript-Uebung' });
  let active = true;
  let timer;
  let lines = 0; let characters = 0;
  const finish = (reason, details = '', checked = false) => {
    if (!active) return;
    active = false; clearTimeout(timer); worker.terminate();
    onEvent({ type: 'done', reason, details, checked });
  };
  const arm = (ms, reason) => { clearTimeout(timer); timer = setTimeout(() => finish(reason), ms); };
  arm(10000, 'startup');
  worker.onmessage = ({ data }) => {
    if (!active || !data || typeof data !== 'object') return;
    if (data.type === 'running') { arm(1500, 'time'); onEvent({ type: 'running' }); }
    if (data.type === 'log') {
      if (typeof data.text !== 'string' || data.text.length > 1000 || ++lines > 80 || (characters += data.text.length) > 32000) { finish('output'); return; }
      onEvent({ type: 'log', text: data.text });
    }
    if (data.type === 'done') finish(data.reason, typeof data.details === 'string' ? data.details.slice(0, 2000) : '', data.checked === true);
  };
  worker.onerror = event => { event.preventDefault(); finish('engine'); };
  worker.onmessageerror = () => finish('engine');
  worker.postMessage({ ...checkJsDraft(draft), ...(exercise ? { exercise } : {}) });
  return { stop: () => finish('manual'), dispose: () => { active = false; clearTimeout(timer); worker.terminate(); } };
}

export function evaluateJs(draft, exercise, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Prüfung abgebrochen.', 'AbortError')); return; }
    let run;
    const abort = () => { run?.dispose(); reject(new DOMException('Prüfung abgebrochen.', 'AbortError')); };
    run = startJs(draft, event => {
      if (event.type !== 'done') return;
      signal?.removeEventListener('abort', abort);
      resolve(event);
    }, exercise);
    signal?.addEventListener('abort', abort, { once: true });
  });
}
