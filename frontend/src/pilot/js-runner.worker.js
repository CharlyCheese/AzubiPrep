import variant from '@jitl/quickjs-singlefile-browser-release-sync';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import { checkJsDraft } from './js-draft.js';
import { JS_EXERCISES } from './js-exercises.js';

// Only this trusted bootstrap crosses the interpreter boundary. Formatting runs
// IN QuickJS; arbitrary objects/getters are never dumped into the host.
const BOOTSTRAP = `(() => {
  const emit = globalThis.__emit;
  delete globalThis.__emit;
  const slice = Function.prototype.call.bind(String.prototype.slice);
  const string = String;
  const isArray = Array.isArray;
  const descriptor = Object.getOwnPropertyDescriptor;
  const records = [];
  const format = value => {
    const kind = typeof value;
    if (kind === 'string') return slice(value, 0, 1000);
    if (value === null || kind === 'undefined' || kind === 'boolean' || kind === 'number' || kind === 'bigint' || kind === 'symbol') return slice(string(value), 0, 1000);
    if (kind === 'function') return '[Funktion]';
    return isArray(value) ? '[Array]' : '[Objekt]';
  };
  const log = (...args) => {
    if (records.length < 80) {
      const value = args[0];
      records[records.length] = args.length === 1 && (value === null || ['string', 'number', 'boolean', 'undefined'].includes(typeof value))
        ? { kind: typeof value, value: typeof value === 'string' ? slice(value, 0, 1000) : value } : { kind: 'other' };
    }
    let line = '';
    for (let i = 0; i < args.length && i < 20 && line.length < 1000; i++) line += (i ? ' ' : '') + format(args[i]);
    emit(slice(line, 0, 1000));
  };
  Object.defineProperty(globalThis, 'console', { value: Object.freeze({ log, info: log, warn: log, error: log }), writable: false, configurable: false });
  const errorText = error => {
    if (typeof error !== 'object' || error === null) return format(error);
    let text = '';
    // Read data properties only: no user-provided getters/toString/toJSON.
    for (const key of ['message', 'stack']) {
      const own = descriptor(error, key);
      if (own && typeof own.value === 'string') text += (text ? '\\n' : '') + slice(own.value, 0, 1000);
    }
    return slice(text || 'Ein Fehler wurde ausgelöst.', 0, 2000);
  };
  return { errorText, check: (index, kind, expected) => {
    if (kind === 'count') return records.length === expected;
    const record = records[index];
    return !!record && record.kind === kind && (expected === undefined ? kind !== 'string' || record.value.length > 0 : record.value === expected);
  } };
})()`;

let accepted = false;
self.onmessage = async ({ data }) => {
  if (accepted) return;
  accepted = true;
  let runtime; let vm; let formatError; let checkConsole;
  let reason = ''; let lines = 0; let characters = 0;
  let deadline = Infinity;
  const expired = () => { if (!reason && performance.now() >= deadline) reason = 'time'; return Boolean(reason); };
  const send = value => self.postMessage(value);
  try {
    const draft = checkJsDraft(data);
    let exercise;
    if (data.exercise !== undefined) {
      if (!Object.hasOwn(JS_EXERCISES, data.exercise?.id) || !Number.isInteger(data.exercise.caseIndex)) throw new Error('exercise');
      exercise = JS_EXERCISES[data.exercise.id];
      if (data.exercise.caseIndex < 0 || data.exercise.caseIndex >= exercise.inputs.length) throw new Error('case');
    }
    const quickJS = await newQuickJSWASMModuleFromVariant(variant);
    runtime = quickJS.newRuntime();
    runtime.setMemoryLimit(16 * 1024 * 1024);
    runtime.setMaxStackSize(64 * 1024);
    runtime.setInterruptHandler(expired);
    vm = runtime.newContext();
    const emit = vm.newFunction('emit', message => {
      if (expired()) return vm.undefined;
      if (vm.typeof(message) !== 'string') { reason = 'output'; return vm.undefined; }
      const size = vm.getProp(message, 'length');
      let length;
      try { length = vm.getNumber(size); } finally { size.dispose(); }
      if (length > 1000 || lines >= 80 || characters + length > 32000) { reason = 'output'; return vm.undefined; }
      lines++; characters += length;
      send({ type: 'log', text: vm.getString(message) });
      return vm.undefined;
    });
    vm.setProp(vm.global, '__emit', emit); emit.dispose();
    const boot = vm.evalCode(BOOTSTRAP, 'konsole.js', { type: 'global' });
    if (boot.error) { boot.error.dispose(); throw new Error('bootstrap'); }
    formatError = vm.getProp(boot.value, 'errorText');
    checkConsole = vm.getProp(boot.value, 'check');
    boot.value.dispose();
    deadline = performance.now() + 1000;
    send({ type: 'running' });
    if (exercise) {
      const prefix = Object.entries(exercise.inputs[data.exercise.caseIndex]).map(([name, value]) => `const ${name} = ${JSON.stringify(value)};`).join('\n');
      const inputResult = vm.evalCode(prefix, 'testdaten.js', { type: 'global' });
      if (inputResult.error) { inputResult.error.dispose(); throw new Error('inputs'); }
      inputResult.value.dispose();
    }
    const errorText = error => {
      if (expired()) return '';
      const result = vm.callFunction(formatError, vm.undefined, error);
      if (result.error) { result.error.dispose(); return 'Fehlerdetails nicht verfügbar.'; }
      try { return vm.typeof(result.value) === 'string' ? vm.getString(result.value).slice(0, 2000) : 'Ausführung fehlgeschlagen.'; }
      finally { result.value.dispose(); }
    };
    const result = vm.evalCode(draft.source, draft.name, { type: 'global' });
    let details = '';
    if (result.error) {
      try { details = errorText(result.error); } finally { result.error.dispose(); }
      if (!reason) reason = 'error';
    } else result.value.dispose();
    let jobs = 0;
    while (!expired() && runtime.hasPendingJob() && jobs < 1000) {
      const pending = runtime.executePendingJobs(1);
      jobs++;
      if (pending.error) {
        try { details = errorText(pending.error); } finally { pending.error.dispose(); }
        if (!reason) reason = 'error';
      }
    }
    if (!reason && runtime.hasPendingJob()) reason = 'jobs';
    let checked = false;
    if (!expired() && exercise && data.exercise.check === true) {
      // Independent fixed guest data: learner mutations must not redefine the
      // expected input. Compound objects never cross back into the host.
      const snapshot = vm.evalCode(`(${JSON.stringify(exercise.inputs[data.exercise.caseIndex])})`, 'pruefdaten.js', { type: 'global' });
      if (snapshot.error) { snapshot.error.dispose(); throw new Error('snapshot'); }
      try {
        const probe = vm.evalCode(`(check, input) => (${exercise.probe})`, 'aufgabenpruefung.js', { type: 'global' });
        if (probe.error) {
          try { details = errorText(probe.error); if (!reason) reason = 'check'; } finally { probe.error.dispose(); }
        }
        else {
          let verdict;
          try { verdict = vm.callFunction(probe.value, vm.undefined, checkConsole, snapshot.value); } finally { probe.value.dispose(); }
          if (verdict.error) {
            try { details = errorText(verdict.error); if (!reason) reason = 'check'; } finally { verdict.error.dispose(); }
          }
          else { checked = vm.typeof(verdict.value) === 'boolean' && vm.getNumber(verdict.value) === 1; verdict.value.dispose(); }
        }
      } finally { snapshot.value.dispose(); }
    }
    expired();
    // Course probes require synchronous functions. New VM jobs scheduled only
    // during a hidden call must neither escape grading nor run after disposal.
    if (exercise && data.exercise.check === true && runtime.hasPendingJob()) {
      checked = false;
      if (!reason) {
        reason = 'check-jobs';
        details = 'Die Funktionsprüfung erwartet direkte Rückgabewerte ohne nachlaufende Aufgaben.';
      }
    }
    send({ type: 'done', reason: reason || 'success', details, checked });
  } catch {
    send({ type: 'done', reason: reason || 'engine', details: '' });
  } finally {
    // An unresponsive/OOM worker is also terminated by the owning controller.
    try { checkConsole?.dispose(); formatError?.dispose(); vm?.dispose(); runtime?.dispose(); } catch { /* worker is discarded */ }
    self.close();
  }
};
