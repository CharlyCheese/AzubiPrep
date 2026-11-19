export const REACT_LIMITS = Object.freeze({
  elements: 2048, operations: 4096, callbacks: 2048, hooks: 2048,
  dataNodes: 128, dataDepth: 16, dependencies: 32,
  tasks: 512, pendingTasks: 32, flushCycles: 32,
});

export const initialReactDebugProject = () => ({
  schema: 1, mode: 'module', entry: 'App.jsx', react: true,
  files: { 'App.jsx': `import { useState, useEffect } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  useEffect(() => {
    console.log("Effekt für Stand", count);
    return () => {
      console.log("Aufräumen für Stand", count);
    };
  }, [count]);
  return <main>
    <h1>Mein React-Zähler</h1>
    <label htmlFor="name">Dein Name</label>
    <input id="name" type="text" value={name} onChange={event => {
      setName(event.target.value);
    }} />
    <button type="button" onClick={() => {
      setCount(previous => previous + 1);
    }}>Eins dazu</button>
    <p>Hallo {name}! Stand: {count}</p>
  </main>;
}
` },
});

// Trusted bootstrap, serialized into QuickJS before the React vendor bundle.
// These guest globals are exclusively for the libraries. The React compiler
// rejects learner references to document/window and the scheduler globals.
export function installDebugReactEnvironment(bounds) {
  const DOM = globalThis.__DOM;
  delete globalThis.__DOM;
  const { document } = DOM.parseHTML('<html><head></head><body><div id="root"></div></body></html>');
  Object.assign(globalThis, { document, window: globalThis, self: globalThis });
  for (const name of Object.keys(DOM)) if (/^(?:HTML|SVG|Node|Element|Event|CustomEvent|Document|Text)/.test(name)) globalThis[name] = DOM[name];
  globalThis.navigator = Object.freeze({ userAgent: 'AzubiPrep-React-Debugmodell' });
  globalThis.HTMLIFrameElement ||= class {};
  globalThis.performance = Object.freeze({ now: () => Date.now() });
  document.oninput = null;
  Object.defineProperty(DOM.HTMLInputElement.prototype, 'type', {
    get() { return this.getAttribute('type') || 'text'; },
    set(value) { this.setAttribute('type', String(value)); }, configurable: true,
  });
  // React temporarily saves/restores input.name while initializing controls.
  // Linkedom returns null for an absent name; browsers return an empty string.
  Object.defineProperty(DOM.HTMLInputElement.prototype, 'name', {
    get() { return this.getAttribute('name') || ''; },
    set(value) { this.setAttribute('name', String(value)); }, configurable: true,
  });
  const inputValue = Object.getOwnPropertyDescriptor(DOM.HTMLInputElement.prototype, 'value');
  Object.defineProperty(DOM.HTMLInputElement.prototype, 'value', {
    get() { return inputValue.get.call(this); },
    set(value) { inputValue.set.call(this, String(value).replace(/[\r\n]/g, '')); }, configurable: true,
  });
  const textareaValue = Object.getOwnPropertyDescriptor(DOM.HTMLTextAreaElement.prototype, 'value');
  Object.defineProperty(DOM.HTMLTextAreaElement.prototype, 'value', {
    get() { return textareaValue.get.call(this); },
    set(value) { textareaValue.set.call(this, String(value).replace(/\r\n?/g, '\n')); }, configurable: true,
  });
  Object.defineProperty(document, 'activeElement', { get: () => document.body });
  const tasks = new Map(); let nextTask = 0, executed = 0;
  let abort = text => { throw new Error(text); };
  globalThis.setTimeout = fn => {
    if (typeof fn !== 'function' || ++nextTask > bounds.tasks || tasks.size >= bounds.pendingTasks) abort('React-Bibliotheksaufgabengrenze erreicht.');
    tasks.set(nextTask, fn); return nextTask;
  };
  globalThis.clearTimeout = id => { tasks.delete(id); };
  return Object.freeze({
    document, Event: DOM.Event,
    attachAbort(fn) { abort = fn; },
    flush() {
      const current = [...tasks.values()]; tasks.clear();
      for (const fn of current) {
        if (++executed > bounds.tasks) abort('React-Bibliotheksaufgabengrenze erreicht.');
        fn();
      }
      return current.length;
    },
  });
}

// Trusted adapter, serialized after the React vendor bundle. Neither the raw
// libraries nor Linkedom nodes pass through its learner-facing facades.
// The worker sets __azubi_dbg_react_environment to the bootstrap return value.
export function installDebugReact(core, emit, bounds, domLimits, allowedTags) {
  const environment = globalThis.__azubi_dbg_react_environment;
  const { React, ReactDOM } = globalThis.__libraries;
  delete globalThis.__azubi_dbg_react_environment;
  delete globalThis.__libraries;
  const { document, Event } = environment;
  environment.attachAbort(core.abort);
  const stringify = JSON.stringify, string = String, own = Object.hasOwn;
  const descriptor = Object.getOwnPropertyDescriptor, prototype = Object.getPrototypeOf;
  const objectPrototype = Object.prototype, arrayPrototype = Array.prototype;
  const elements = new WeakMap(), components = new WeakMap(), setters = new WeakMap();
  const facadeFunctions = new WeakSet(), stateSetters = new WeakSet(), ids = new WeakMap();
  let nodes = new Map(), nextId = 0, elementCount = 0, operations = 0, callbacks = 0, hooks = 0, events = 0;
  let root = null, mounted = false, published = null;
  const fail = text => core.abort(text);
  const tick = () => { core.guard(); if (++operations > bounds.operations) fail('React-Arbeitsgrenze erreicht.'); };
  const forbidden = key => ['__proto__', 'prototype', 'constructor', 'toString', 'valueOf', 'toJSON'].includes(key) || key.startsWith('__azubi_dbg');
  const isUserFunction = fn => core.registered(fn) && !facadeFunctions.has(fn) && !core.isAsync(fn);
  const requireFunction = fn => { if (!isUserFunction(fn)) fail('React benötigt eine eigene synchrone instrumentierte Funktion.'); return fn; };
  const invoke = (fn, args = []) => {
    tick(); requireFunction(fn);
    if (++callbacks > bounds.callbacks) fail('React-Aufrufgrenze erreicht.');
    return core.invoke(fn, args);
  };
  const facade = fn => { core.allowCallback(fn); facadeFunctions.add(fn); return fn; };
  function bytes(value) {
    let size = 0;
    for (let i = 0; i < value.length; i++) {
      const c = value.charCodeAt(i);
      if (c < 128) size++; else if (c < 2048) size += 2;
      else if (c >= 55296 && c <= 56319 && i + 1 < value.length && value.charCodeAt(i + 1) >= 56320 && value.charCodeAt(i + 1) <= 57343) { size += 4; i++; }
      else size += 3;
    }
    return size;
  }
  // Validation deliberately preserves object/array identity, including the
  // previous state supplied to a functional updater. No getters are evaluated.
  function validateData(value, props = false) {
    const ancestors = new WeakSet(); let count = 0, textBytes = 0;
    function visit(item, depth) {
      if (++count > bounds.dataNodes || depth > bounds.dataDepth) fail('React-Datengrenze erreicht.');
      if (item === null || ['undefined', 'number', 'boolean'].includes(typeof item)) return;
      if (typeof item === 'string') {
        textBytes += bytes(item); if (item.length > domLimits.field || textBytes > domLimits.textBytes) fail('React-Textgrenze erreicht.'); return;
      }
      if (props && elements.has(item)) return;
      // Custom props preserve both ordinary registered learner callbacks and
      // branded state setters. Hook/library facades are not general callbacks.
      if (props && typeof item === 'function') { if (!stateSetters.has(item)) requireFunction(item); return; }
      if (typeof item !== 'object' || elements.has(item) || ![null, objectPrototype, arrayPrototype].includes(prototype(item)) || ancestors.has(item) || Array.isArray(item) && item.length > bounds.dataNodes) fail('React-Zustand benötigt begrenzte eigene Daten ohne Zyklen.');
      if (Object.getOwnPropertySymbols(item).length) fail('Symbolfelder sind in React-Daten nicht unterstützt.');
      ancestors.add(item);
      for (const key of Object.keys(item)) {
        if (forbidden(key)) fail('Dieses React-Datenfeld ist nicht unterstützt.');
        const field = descriptor(item, key); if (!field || !own(field, 'value')) fail('React-Daten dürfen keine Getter enthalten.');
        visit(field.value, depth + 1);
      }
      ancestors.delete(item);
    }
    visit(value, 0); return value;
  }
  function wrapElement(raw) {
    if (++elementCount > bounds.elements) fail('React-Elementgrenze erreicht.');
    const handle = Object.freeze(Object.create(null)); elements.set(handle, raw); return handle;
  }
  function unwrapChild(value, state = { count: 0 }, depth = 0) {
    if (++state.count > domLimits.nodes || depth > domLimits.depth) fail('React-Kindergrenze erreicht.');
    if (value === null || ['undefined', 'boolean', 'number'].includes(typeof value)) return value;
    if (typeof value === 'string') { validateData(value); return value; }
    if (elements.has(value)) return elements.get(value);
    if (!Array.isArray(value) || value.length > domLimits.nodes) fail('React-Kinder benötigen Elemente, Text oder begrenzte Listen.');
    const result = [];
    for (let i = 0; i < value.length; i++) {
      const field = descriptor(value, string(i));
      if (field && !own(field, 'value')) fail('React-Kinder dürfen keine Getter enthalten.');
      result.push(unwrapChild(field?.value, state, depth + 1));
    }
    return result;
  }
  function component(fn) {
    requireFunction(fn);
    if (!components.has(fn)) components.set(fn, props => {
      const safe = Object.create(null);
      for (const key of Object.keys(props)) safe[key] = validateData(props[key], true);
      return unwrapChild(invoke(fn, [Object.freeze(safe)]));
    });
    return components.get(fn);
  }
  const textControl = node => node?.localName === 'input' || node?.localName === 'textarea';
  const disabled = node => !!node.disabled || node.hasAttribute('disabled');
  const readOnly = node => !!node.readOnly || node.hasAttribute('readonly');
  const valueText = (node, value) => {
    if (typeof value !== 'string' || value.length > domLimits.field) fail('Ungültige React-Texteingabe.');
    return node.localName === 'input' ? value.replace(/[\r\n]/g, '') : value.replace(/\r\n?/g, '\n');
  };
  function nodeView(node) {
    return Object.freeze({ id: string(node?.id || ''), tagName: string(node?.tagName || ''), value: textControl(node) ? string(node.value || '') : '' });
  }
  function eventView(event) {
    const view = {
      type: string(event.type), target: nodeView(event.target), currentTarget: nodeView(event.currentTarget),
      bubbles: !!event.bubbles, cancelable: !!event.cancelable, defaultPrevented: !!event.defaultPrevented,
      preventDefault: facade(() => { event.preventDefault(); view.defaultPrevented = !!event.defaultPrevented; }),
      stopPropagation: facade(() => { event.stopPropagation(); }),
    };
    return Object.seal(view);
  }
  function intrinsicProp(tag, key, value) {
    if (['onClick', 'onInput', 'onChange', 'onSubmit'].includes(key)) {
      if (key === 'onSubmit' && tag !== 'form' || ['onInput', 'onChange'].includes(key) && !['input', 'textarea'].includes(tag)) fail('Dieses React-Ereignis passt nicht zum Element.');
      requireFunction(value); return event => invoke(value, [eventView(event)]);
    }
    if (key === 'disabled') { if (!['button', 'input', 'textarea'].includes(tag) || typeof value !== 'boolean') fail('disabled benötigt ein Steuerelement und einen Wahrheitswert.'); return value; }
    if (key === 'readOnly') { if (!['input', 'textarea'].includes(tag) || typeof value !== 'boolean') fail('readOnly benötigt ein Textfeld und einen Wahrheitswert.'); return value; }
    if (key === 'type') {
      if (!(tag === 'input' && value === 'text' || tag === 'button' && ['button', 'submit'].includes(value))) fail('Dieser React-Eingabetyp ist nicht unterstützt.');
      return value;
    }
    const valid = ['id', 'className', 'title', 'aria-label'].includes(key)
      || key === 'htmlFor' && tag === 'label'
      || ['placeholder', 'value', 'defaultValue'].includes(key) && ['input', 'textarea'].includes(tag);
    if (!valid || typeof value !== 'string') fail('Dieses React-Attribut ist nicht unterstützt oder benötigt Text.');
    validateData(value); return value;
  }
  const createElement = facade((type, props, ...children) => {
    tick(); const intrinsic = typeof type === 'string';
    if (intrinsic && (type === 'body' || !allowedTags.includes(type))) fail('Dieses JSX-Element ist nicht freigegeben.');
    if (!intrinsic) requireFunction(type);
    if (props !== null && props !== undefined && (typeof props !== 'object' || Array.isArray(props) || ![null, objectPrototype].includes(prototype(props)))) fail('React-Props benötigen eigene Daten.');
    validateData(props, true);
    if (children.length > domLimits.nodes) fail('React-Kindergrenze erreicht.');
    const output = Object.create(null);
    for (const key of Object.keys(props || {})) {
      const field = descriptor(props, key);
      if (!field || !own(field, 'value') || forbidden(key) || ['ref', 'children', 'dangerouslySetInnerHTML', 'style'].includes(key)) fail('Dieses React-Prop ist nicht freigegeben.');
      const value = field.value;
      if (key === 'key') {
        if (!['string', 'number'].includes(typeof value)) fail('React-Schlüssel benötigen Text oder Zahlen.');
        validateData(value); output.key = value;
      } else output[key] = intrinsic ? intrinsicProp(type, key, value) : validateData(value, true);
    }
    if (intrinsic && ['input', 'br', 'hr'].includes(type) && children.length) fail('Dieses JSX-Element unterstützt keine Kinder.');
    if (intrinsic && type === 'textarea' && children.length) fail('textarea bitte mit value oder defaultValue verwenden.');
    if (own(output, 'value') && own(output, 'defaultValue')) fail('Bitte value oder defaultValue verwenden.');
    // Custom component props retain opaque children. Only the trusted intrinsic
    // boundary unwraps them to React elements, so props never contain fibers.
    const resolved = intrinsic ? children.map(child => unwrapChild(child)) : children.map(child => validateData(child, true));
    return wrapElement(React.createElement(intrinsic ? type : component(type), output, ...resolved));
  });
  const useState = facade((...args) => {
    tick(); if (++hooks > bounds.hooks || args.length > 1) fail('React-Hookgrenze erreicht.');
    const initial = args[0];
    const source = typeof initial === 'function' ? (requireFunction(initial), () => validateData(invoke(initial))) : validateData(initial);
    const [value, setter] = React.useState(source);
    if (!setters.has(setter)) {
      const safeSetter = facade((...values) => {
        tick(); if (values.length !== 1) fail('React-Zustand benötigt genau einen Wert oder Updater.');
        const next = values[0];
        if (typeof next === 'function') { requireFunction(next); setter(previous => validateData(invoke(next, [previous]))); }
        else setter(validateData(next));
      });
      stateSetters.add(safeSetter); setters.set(setter, safeSetter);
    }
    return [validateData(value), setters.get(setter)];
  });
  const useEffect = facade((...args) => {
    tick(); if (++hooks > bounds.hooks || args.length < 1 || args.length > 2) fail('React-Hookgrenze erreicht.');
    const [effect, deps] = args; requireFunction(effect);
    if (deps !== undefined) {
      if (!Array.isArray(deps) || deps.length > bounds.dependencies) fail('useEffect benötigt eine begrenzte Abhängigkeitsliste.');
      for (let i = 0; i < deps.length; i++) {
        const field = descriptor(deps, string(i));
        if (field && !own(field, 'value') || field?.value !== null && !['undefined', 'string', 'number', 'boolean'].includes(typeof field?.value)) fail('Effektabhängigkeiten müssen primitive Werte sein.');
      }
      validateData(deps);
    }
    React.useEffect(() => {
      const cleanup = invoke(effect);
      if (cleanup === undefined) return;
      requireFunction(cleanup); return () => { invoke(cleanup); };
    }, deps);
  });
  const facades = Object.freeze({ createElement, useState, useEffect });
  function snapshot() {
    core.guard(); const current = new Map(); let count = 0, textBytes = 0;
    const text = value => { if (value.length > domLimits.field || (textBytes += bytes(value)) > domLimits.textBytes) fail('React-DOM-Textgrenze erreicht.'); return value; };
    function walk(node, depth) {
      if (++count > domLimits.nodes || depth > domLimits.depth) fail('React-DOM-Grenze erreicht.');
      if (node.nodeType === 3) return { text: text(string(node.textContent)) };
      if (node.nodeType !== 1 || !allowedTags.includes(node.localName) || node.localName === 'body' && depth !== 0) fail('Ungültiges React-Vorschauelement.');
      if (!ids.has(node)) { if (++nextId > domLimits.nodes) fail('React-DOM-Knotengrenze erreicht (auch frühere Elemente zählen).'); ids.set(node, nextId); }
      const id = ids.get(node); current.set(id, node); const attrs = Object.create(null);
      for (const attr of node.attributes) {
        if (['disabled', 'readonly'].includes(attr.name)) continue;
        if (!['id', 'class', 'title', 'aria-label', 'for', 'placeholder', 'value', 'type'].includes(attr.name)) fail('Nicht freigegebenes React-DOM-Attribut.');
        attrs[attr.name] = text(string(attr.value));
      }
      const children = [...node.childNodes].filter(child => child.nodeType !== 8).map(child => walk(child, depth + 1));
      return { id, tag: node.localName, attrs, disabled: ['button', 'input', 'textarea'].includes(node.localName) && disabled(node),
        ...(textControl(node) ? { control: { value: text(valueText(node, string(node.value || ''))), readOnly: readOnly(node) } } : {}), children };
    }
    const value = stringify(walk(document.body, 0));
    if (bytes(value) > domLimits.snapshotBytes) fail('React-Vorschaugrenze erreicht.');
    nodes = current; return value;
  }
  function publish() {
    const value = snapshot();
    if (value === published) return;
    if (emit(value) !== true) fail('React-Vorschau konnte nicht übernommen werden.');
    published = value;
  }
  function connected(node) { for (let current = node; current; current = current.parentNode) if (current === document.body) return true; return false; }
  function fire(node, type) {
    tick(); if (++events > domLimits.events) fail('React-Ereignisgrenze erreicht.');
    const event = new Event(type, { bubbles: true, cancelable: type === 'click' || type === 'submit' });
    if (type === 'click') Object.assign(event, { button: 0, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false });
    node.dispatchEvent(event); return event;
  }
  function setInput(node, value) {
    let owner = prototype(node), field;
    while (owner && !(field = descriptor(owner, 'value'))) owner = prototype(owner);
    if (!field?.set) fail('Dieses React-Textfeld kann keine Eingabe übernehmen.');
    field.set.call(node, value);
  }
  function dispatch(event, point) {
    tick(); core.prepareJob(point);
    if (!mounted) fail('Die React-Vorschau ist nicht mehr eingebunden.');
    const node = nodes.get(event.id), type = event.type || 'click';
    if (!node || !connected(node)) fail('Unbekanntes React-Vorschauziel.');
    const edits = (event.values || []).map(item => {
      const field = nodes.get(item.id);
      if (!field || !connected(field) || !textControl(field) || disabled(field) || readOnly(field)) fail('Dieses React-Feld kann keine Eingabe übernehmen.');
      return { field, value: valueText(field, item.value) };
    });
    ReactDOM.flushSync(() => {
      for (const { field, value } of edits) if (string(field.value || '') !== value) { setInput(field, value); fire(field, 'input'); fire(field, 'change'); }
      if (type === 'commit') return;
      let target = node;
      if (type === 'enter') {
        if (node.localName !== 'input' || disabled(node)) return;
        const form = node.closest('form'); if (!form) return;
        target = form.querySelector('button:not([type="button"])') || form;
      }
      if (type === 'submit' || type === 'enter' && target.localName === 'form') { if (target.localName !== 'form') fail('Absenden benötigt ein React-Formular.'); fire(target, 'submit'); return; }
      if (type !== 'click' && type !== 'enter') fail('Unbekanntes React-Ereignis.');
      for (let at = target; at && at !== document.body; at = at.parentNode) if (['button', 'input', 'textarea'].includes(at.localName) && disabled(at)) return;
      const clicked = fire(target, 'click'), button = target.closest('button');
      if (!clicked.defaultPrevented && button && connected(button) && !disabled(button) && (button.getAttribute('type') || 'submit') === 'submit') { const form = button.closest('form'); if (form) fire(form, 'submit'); }
    });
  }
  return Object.freeze({
    facades, createElement, has: value => elements.has(value),
    ref() { fail('React-Elemente sind undurchsichtige Darstellungswerte.'); },
    binding(name) { if (!own(facades, name)) fail('Dieser React-Export ist nicht freigegeben.'); return facades[name]; },
    mount(fn, point) { tick(); if (root) fail('Die React-Wurzel ist bereits eingebunden.'); core.prepareJob(point); root = ReactDOM.createRoot(document.getElementById('root')); mounted = true; ReactDOM.flushSync(() => root.render(React.createElement(component(fn)))); },
    dispatch, snapshot, publish,
    flush() { core.guard(); return environment.flush(); },
    unmount(point) { tick(); if (!mounted) fail('Die React-Wurzel ist bereits entfernt.'); core.prepareJob(point); ReactDOM.flushSync(() => root.unmount()); mounted = false; },
  });
}
