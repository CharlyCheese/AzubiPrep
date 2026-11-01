import { checkDebugProject } from './debugger-project.js';
import { validDOMTree } from './debugger-dom.js';
export const DEBUG_LIMITS = Object.freeze({
  sourceBytes: 65536, sourceLines: 512, astNodes: 8192, astDepth: 64, points: 1024,
  generatedBytes: 262144, identifiers: 128, bindings: 64, scopes: 32, frames: 32,
  checkpointHits: 10000, pauses: 2000, messages: 4096, protocolBytes: 2097152,
  snapshotBytes: 32768, snapshotUnits: 8192, valueChars: 80,
  queue: 1, prepareMs: 15000, startupMs: 10000, activeMs: 1000,
  watchdogSlackMs: 500, idleMs: 300000,
  heapBytes: 16777216, stackBytes: 65536, wasmInitialPages: 256, wasmMaxPages: 512,
  logLines: 80, logChars: 32000, logLineChars: 1000,
});

// Tests may only lower budgets; no caller can enlarge the production limits.
export function debuggerLimits(overrides = {}) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) throw new Error('Ungültige Debuggrenzen.');
  const result = { ...DEBUG_LIMITS };
  for (const [key, value] of Object.entries(overrides)) {
    if (!Object.hasOwn(DEBUG_LIMITS, key) || !Number.isSafeInteger(value) || value < 1 || value > DEBUG_LIMITS[key]) throw new Error('Ungültige Debuggrenze: ' + key);
    result[key] = value;
  }
  return Object.freeze(result);
}
export const encodedSize = text => new TextEncoder().encode(text).length;
export const debugSourceLines = source => source.split(/\r\n|[\n\r\u2028\u2029]/);
export function validDebugId(value) { return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value); }

export function validateDebugArtifact(artifact, limits) {
  const module = artifact?.mode === 'module';
  if (artifact?.mode !== undefined && !module) throw new Error('Ungültiger Debugmodus.');
  if (module) {
    const project = checkDebugProject({ schema: 1, mode: 'module', entry: artifact.name, files: artifact.sources });
    if (!artifact.modules || typeof artifact.modules !== 'object' || Array.isArray(artifact.modules) || Object.keys(artifact.modules).length !== Object.keys(project.files).length || Object.keys(project.files).some(name => typeof artifact.modules[name] !== 'string') || Object.keys(artifact.modules).some(name => !Object.hasOwn(project.files, name)) || artifact.code !== artifact.modules[artifact.name]) throw new Error('Ungültige Modulquellen.');
    if (Object.values(artifact.modules).reduce((sum, code) => sum + encodedSize(code), 0) > limits.generatedBytes || Object.values(project.files).reduce((sum, source) => sum + encodedSize(source), 0) > limits.sourceBytes || !artifact.stats || artifact.stats.nodes > limits.astNodes) throw new Error('Projektgrenze erreicht.');
    if (!Number.isSafeInteger(artifact.stats.nodes) || artifact.stats.nodes < 1 || Object.values(project.files).reduce((sum, source) => sum + debugSourceLines(source).length, 0) > limits.sourceLines) throw new Error('Ungültige Projektgröße.');
  }
  if (!artifact || typeof artifact !== 'object' || artifact.schema !== 1 || typeof artifact.name !== 'string' || !module && !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,59}\.js$/.test(artifact.name)
    || typeof artifact.code !== 'string' || encodedSize(artifact.code) > limits.generatedBytes || artifact.helper !== '__azubi_dbg_checkpoint'
    || !Array.isArray(artifact.functions) || !artifact.functions.length || artifact.functions.length > limits.astNodes
    || artifact.functions.some((item, index) => !item || item.id !== index || typeof item.name !== 'string' || item.name.length > limits.identifiers)
    || !Array.isArray(artifact.points) || !artifact.points.length || artifact.points.length > limits.points) throw new Error('Ungültiges Debugprogramm.');
  for (const [index, point] of artifact.points.entries()) {
    if (!point || point.id !== index || !Number.isSafeInteger(point.line) || point.line < 1 || point.line > limits.sourceLines || !Number.isSafeInteger(point.column) || point.column < 1 || typeof point.end !== 'boolean'
      || !Number.isSafeInteger(point.functionId) || !artifact.functions[point.functionId] || !['statement', 'iteration', 'entry', 'return', 'context', 'throw', 'catch', 'finally'].includes(point.kind)
      || point.end && point.functionId !== 0 || !Array.isArray(point.scopes) || point.scopes.length > limits.scopes) throw new Error('Ungültige Quellzuordnung.');
    for (const scope of point.scopes) if (!scope || !Number.isSafeInteger(scope.id) || scope.id < 0 || scope.id >= limits.astNodes || typeof scope.label !== 'string' || scope.label.length > 160 || typeof scope.captured !== 'boolean' || !Array.isArray(scope.names) || scope.names.length > limits.astNodes || scope.names.some(name => typeof name !== 'string' || name.length > limits.identifiers)) throw new Error('Ungültiger Scope.');
    if (module && (!Object.hasOwn(artifact.sources, point.file) || point.line > debugSourceLines(artifact.sources[point.file]).length || point.end && point.file !== artifact.name)) throw new Error('Ungültige Modulposition.');
  }
  if (module && artifact.points.filter(point => point.end).length !== 1) throw new Error('Ungültiges Modulende.');
  if (module && artifact.functions.some(item => item.id > 0 && !Object.hasOwn(artifact.sources, item.file))) throw new Error('Ungültige Funktionsdatei.');
  if(artifact.dom&&(!module||!validDOMTree(artifact.dom.tree)||!Number.isSafeInteger(artifact.dom.eventPoint)||!artifact.points[artifact.dom.eventPoint]?.synthetic||artifact.points[artifact.dom.eventPoint].kind!=='context'||artifact.points[artifact.dom.eventPoint].functionId!==0||artifact.points[artifact.dom.eventPoint].scopes.length))throw new Error('Ungültiges DOM-Programm.');
  if(artifact.points.some(point=>point.synthetic&&(!artifact.dom||point.id!==artifact.dom.eventPoint)))throw new Error('Ungültiger Ereigniscaller.');
  return artifact;
}

export function validateDebugSnapshot(snapshot, point, limits, artifact) {
  if (!snapshot || snapshot.point !== point.id || typeof snapshot.truncated !== 'boolean' || !Array.isArray(snapshot.frames) || !snapshot.frames.length || snapshot.frames.length > limits.frames) return false;
  let count = 0, previous = -1;
  const scopesValid = (scopes, meta) => Array.isArray(scopes) && scopes.length === meta.scopes.length && scopes.every((scope, index) => scope && scope.id === meta.scopes[index].id && Array.isArray(scope.values) && (scope.values.length === meta.scopes[index].names.length || snapshot.truncated) && scope.values.every((value, i) => {
    if (++count > limits.bindings || !value || value.name !== meta.scopes[index].names[i] || typeof value.display !== 'string' || value.display.length > (value.type === 'string' ? limits.valueChars + 1 : 32)) return false;
    return ['number', 'string', 'boolean', 'undefined', 'null', 'uninitialized', 'opaque'].includes(value.type);
  }));
  for (const [index, frame] of snapshot.frames.entries()) {
    const meta = artifact?.points[frame?.point];
    if (!frame || !Number.isSafeInteger(frame.id) || frame.id <= previous || frame.id > limits.checkpointHits || index === 0 && (frame.id !== 0 || frame.functionId !== 0)
      || index > 0 && frame.functionId === 0 || !meta || meta.functionId !== frame.functionId || !scopesValid(frame.scopes, meta)) return false;
    previous = frame.id;
  }
  const top = snapshot.frames.at(-1);
  return point.kind !== 'context' && top.point === point.id && top.functionId === point.functionId && JSON.stringify(snapshot.scopes) === JSON.stringify(top.scopes);
}

// This helper executes only in QuickJS. Learner syntax cannot access its name,
// methods or captured intrinsics. Snapshots never inspect objects/functions;
// explicit learner data references use the restricted private ref helper.
export function installDebugger(pause, emit, limits) {
  const stringify = JSON.stringify;
  const slice = Function.prototype.call.bind(String.prototype.slice);
  const string = String, is = Object.is;
  const object = Object, descriptor = Object.getOwnPropertyDescriptor, define = Object.defineProperty;
  const has = Reflect.has, set = Reflect.set, ownProperty = Object.hasOwn;
  const ErrorClass = Error, TypeErrorClass = TypeError;
  const errorClasses = Object.freeze({ Error, TypeError, RangeError, ReferenceError, SyntaxError, URIError, EvalError });
  const errorPrototype = Error.prototype, prototypeOf = Object.getPrototypeOf;
  const internalErrorPrototype = globalThis.InternalError?.prototype;
  const isPrototypeOf = Object.prototype.isPrototypeOf;
  const isArray = Array.isArray, apply = Reflect.apply;
  const arrayMethods = Object.freeze({
    push: Array.prototype.push, pop: Array.prototype.pop, shift: Array.prototype.shift,
    unshift: Array.prototype.unshift, slice: Array.prototype.slice,
    includes: Array.prototype.includes, indexOf: Array.prototype.indexOf, join: Array.prototype.join,
  });
  const callbackMethods = Object.freeze({ map: Array.prototype.map, filter: Array.prototype.filter,
    forEach: Array.prototype.forEach, some: Array.prototype.some, every: Array.prototype.every,
    find: Array.prototype.find, reduce: Array.prototype.reduce });
  const callbacks = new WeakSet(), weakAdd = WeakSet.prototype.add, weakHas = WeakSet.prototype.has;
  const primitiveKey = Symbol.toPrimitive;
  const registered = value => typeof value === 'function' && apply(weakHas, callbacks, [value]);
  const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor', 'toString', 'valueOf', 'toJSON', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__']);
  let hits = 0, nextFrame = 0, fatal = '', dom = null;
  const abort = text => { if (!fatal) fatal = text; throw new ErrorClass(fatal); };
  const guard = () => { if (fatal) throw new ErrorClass(fatal); };
  const frames = [{ id: 0, functionId: 0, point: null, scopes: [] }];
  const format = value => {
    if (value === null) return { type: 'null', display: 'null' };
    if (typeof value === 'string') return { type: 'string', display: slice(value, 0, limits.valueChars) + (value.length > limits.valueChars ? '…' : '') };
    if (typeof value === 'number') return { type: 'number', display: is(value, -0) ? '-0' : string(value) };
    if (typeof value === 'boolean' || typeof value === 'undefined') return { type: typeof value, display: string(value) };
    return { type: 'opaque', display: '[Nicht inspiziert]' };
  };
  Object.defineProperty(globalThis, 'console', { value: Object.freeze({ log: (...args) => {
    let line = ''; for (let i = 0; i < args.length && i < 20; i++) line += (i ? ' ' : '') + (typeof args[i] === 'string' ? slice(args[i], 0, limits.logLineChars) : args[i] === null ? 'null' : ['number', 'boolean', 'undefined'].includes(typeof args[i]) ? string(args[i]) : '[Nicht inspiziert]');
    emit(slice(line, 0, limits.logLineChars));
  } }), writable: false, configurable: false });
  const checkpoint = (point, scopes) => {
    guard();
    if (++hits > limits.checkpointHits) abort('Kontrollpunktgrenze erreicht.');
    const current = frames[frames.length - 1]; current.point = point; current.scopes = scopes;
    const views = frames.map(frame => ({ id: frame.id, functionId: frame.functionId, point: frame.point, scopes: frame.scopes.map(scope => ({ id: scope[0], values: [] })) }));
    const result = { point, frames: views, scopes: views[views.length - 1].scopes, truncated: false };
    let units = stringify(result).length;
    if (units > limits.snapshotUnits - 128) abort('Zustandsgrenze erreicht.');
    const truncate = () => { if (!result.truncated) { result.truncated = true; units--; } };
    let count = 0;
    for (let f = frames.length - 1; f >= 0; f--) for (let i = frames[f].scopes.length - 1; i >= 0; i--) {
      const scope = frames[f].scopes[i], entry = views[f].scopes[i];
      for (const [name, read] of scope[1]) {
        if (count >= limits.bindings) { truncate(); break; }
        let value; try { value = format(read()); } catch { value = { type: 'uninitialized', display: 'noch nicht initialisiert' }; }
        const item = { name, ...value };
        // The top frame's scopes are also serialized through result.scopes.
        // Count exact JSON codeunits (including escaping and commas), without
        // repeatedly serializing all values already collected in the snapshot.
        const added = (stringify(item).length + (entry.values.length ? 1 : 0)) * (f === frames.length - 1 ? 2 : 1);
        count++;
        if (units + added > limits.snapshotUnits - 128) { truncate(); break; }
        entry.values.push(item); units += added;
      }
    }
    return pause(stringify(result));
  };
  checkpoint.enter = function(functionId) {
    guard();
    if (frames.length >= limits.frames || ++nextFrame > limits.checkpointHits) abort('Aufrufgrenze erreicht.');
    const frame = { id: nextFrame, functionId, point: null, scopes: [] }; frames.push(frame); return frame.id;
  };
  checkpoint.leave = function(id) {
    if (frames.length <= 1 || frames[frames.length - 1].id !== id) throw new ErrorClass('Ungültige Aufrufkette.');
    frames.pop();
  };
  checkpoint.call = function(point, scopes, fn, args) {
    guard();
    const current = frames[frames.length - 1]; current.point = point; current.scopes = scopes;
    if (typeof fn !== 'function') throw new TypeErrorClass('Dieser Wert ist keine Funktion.');
    if (!registered(fn)) abort('Nur instrumentierte Funktionen sind aufrufbar.');
    return fn(...args);
  };
  checkpoint.ref = function(target, key, strict) {
    guard();
    // Learner reference evaluation happens once. The VM's own assignment and
    // increment operators drive this private reference, preserving RHS order.
    if (typeof key === 'object' && key !== null || typeof key === 'function' || typeof key === 'symbol') abort('Objektschlüssel noch nicht unterstützt.');
    key = string(key);
    if (key.startsWith('__azubi_dbg') || forbiddenKeys.has(key)) abort('Dieser Datenzugriff ist nicht unterstützt.');
    if(dom?.has(target))return dom.ref(target,key,strict);
    const nativeError = target !== null && typeof target === 'object' && apply(isPrototypeOf, errorPrototype, [target]);
    if (nativeError) {
      if (key !== 'name' && key !== 'message') abort('Bei Fehlern sind nur name und message lesbar.');
      return define({}, 'value', {
        get() {
          let current = target;
          while (current) { const own = descriptor(current, key); if (own) { if (!ownProperty(own, 'value') || typeof own.value !== 'string') abort('Unsicheres Fehlerfeld.'); return own.value; } current = prototypeOf(current); }
          return undefined;
        },
        set() { abort('Fehlerfelder sind im Debugger nur lesbar.'); },
      });
    }
    const checked = () => {
      if (target === null || target === undefined) throw new TypeErrorClass('Datenzugriff auf null/undefined.');
      if (typeof target === 'function') abort('Funktionszugriff nicht unterstützt.');
      const box = object(target), own = descriptor(box, key);
      if (!own && has(box, key) || own && (!ownProperty(own, 'value') || typeof own.value === 'function' && !registered(own.value))) abort('Nur eigene Datenfelder werden unterstützt.');
      return { box, own };
    };
    return define({}, 'value', {
      get() { const { own } = checked(); return own?.value; },
      set(value) {
        const { box } = checked();
        if (typeof value === 'function' && !registered(value)) abort('Nur instrumentierte Funktionswerte werden unterstützt.');
        if (!set(box, key, value, target) && strict) throw new TypeErrorClass('Dieses Datenfeld ist nicht beschreibbar.');
      },
    });
  };
  checkpoint.method = function(target, name) {
    // Resolve the receiver before evaluating arguments, and keep that exact
    // array if argument evaluation later assigns a different lexical value.
    guard();
    if (!isArray(target) || !ownProperty(arrayMethods, name) || descriptor(target, name)) abort('Nur freigegebene native Array-Methoden werden unterstützt.');
    const method = arrayMethods[name];
    return (...args) => apply(method, target, args);
  };
  checkpoint.allowCallback = function(fn) {
    guard();
    if (typeof fn !== 'function') abort('Ungültiger instrumentierter Callback.');
    if (!registered(fn)) {
      // Function values may flow through aliases/parameters/data. Block their
      // unsupported coercion at the value, including inside native join, so
      // generated source never becomes learner-visible. Identity is unchanged.
      define(fn, primitiveKey, { value: () => abort('Funktionswerte sind nicht als Text oder Zahl verwendbar.') });
      apply(weakAdd, callbacks, [fn]);
    }
    return fn;
  };
  checkpoint.bound = function(point, scopes, target, key) {
    guard();
    if(dom?.has(target)){
      if(key.startsWith('__azubi_dbg')||forbiddenKeys.has(key))abort('Dieser DOM-Aufruf ist nicht unterstützt.');
      const method=dom.bound(target,key);return(...args)=>{const current=frames[frames.length-1];current.point=point;current.scopes=scopes;guard();return method(...args);};
    }
    let fn, native = false, callback = false;
    if (isArray(target) && !descriptor(target, key) && ownProperty(arrayMethods, key)) { fn = arrayMethods[key]; native = true; }
    else if (isArray(target) && !descriptor(target, key) && ownProperty(callbackMethods, key)) { fn = callbackMethods[key]; native = true; callback = true; }
    else fn = checkpoint.ref(target, key, false).value;
    return (...args) => {
      const current = frames[frames.length - 1]; current.point = point; current.scopes = scopes;
      guard();
      if ((!native && typeof fn !== 'function') || (callback && typeof args[0] !== 'function')) throw new TypeErrorClass('Dieser Wert ist keine Funktion.');
      if ((!native && !registered(fn)) || (callback && !registered(args[0]))) abort('Nur instrumentierte Funktionen sind aufrufbar.');
      return apply(fn, target, args);
    };
  };
  checkpoint.callbackMethod = function(point, scopes, target, name) {
    guard();
    if (!isArray(target) || !ownProperty(callbackMethods, name) || descriptor(target, name)) abort('Nur freigegebene Array-Callbacks werden unterstützt.');
    const method = callbackMethods[name];
    return (...args) => {
      guard();
      if (!registered(args[0])) abort('Nur instrumentierte Callbacks werden unterstützt.');
      const current = frames[frames.length - 1]; current.point = point; current.scopes = scopes;
      return apply(method, target, args);
    };
  };
  checkpoint.guard = guard;
  checkpoint.abort = abort;
  checkpoint.registered = registered;
  checkpoint.invoke = (fn,args,target) => {guard();if(!registered(fn))abort('Nur registrierte Ereignisfunktionen sind erlaubt.');return apply(fn,target,args);};
  checkpoint.attachDOM = model => {dom=model;define(globalThis,'document',{value:model.document,writable:false,configurable:false});};
  checkpoint.dispatchDOM = (id,point) => {guard();if(!dom||frames.length!==1)abort('Ereigniszustand ungültig.');frames[0].point=point;frames[0].scopes=[];dom.dispatch(id);};
  checkpoint.failure = function(error) {
    guard();
    // QuickJS resource exceptions can be caught by JS. Classify them before
    // source catch/finally can suppress them, without reading their properties.
    if (internalErrorPrototype && error !== null && typeof error === 'object' && prototypeOf(error) === internalErrorPrototype) abort('Interpreter-/Speichergrenze erreicht.');
  };
  checkpoint.error = function(name, args) {
    guard();
    if (!ownProperty(errorClasses, name) || args.length > 1) abort('Dieser Fehlerkonstruktor ist nicht unterstützt.');
    return new errorClasses[name](...args);
  };
  return checkpoint;
}
