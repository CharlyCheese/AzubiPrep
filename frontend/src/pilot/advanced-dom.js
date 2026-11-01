// This entire function is converted to source and runs INSIDE QuickJS.
// It never receives native DOM objects or host functions.
export function installCourseDOM(html, seed, scenario, sessionId = '00000000-0000-4000-8000-000000000000') {
  const DOM = globalThis.__DOM;
  delete globalThis.__DOM;
  const { document } = DOM.parseHTML(html);
  Object.assign(globalThis, { document, window: globalThis, self: globalThis });
  for (const name of Object.keys(DOM)) if (/^(?:HTML|SVG|Node|Element|Event|CustomEvent|Document|Text)/.test(name)) globalThis[name] = DOM[name];
  globalThis.addEventListener = document.addEventListener.bind(document);
  globalThis.removeEventListener = document.removeEventListener.bind(document);
  globalThis.dispatchEvent = document.dispatchEvent.bind(document);
  globalThis.navigator = { userAgent: 'AzubiPrep-Lernmodell' };
  globalThis.URL = class {
    constructor(value, base = 'http://uebung.invalid/') {
      value=String(value);base=String(base);const origin=(value.match(/^https?:\/\/[^/]+/)||base.match(/^https?:\/\/[^/]+/)||['http://uebung.invalid'])[0];
      let path=value.replace(/^https?:\/\/[^/]+/,'');if(!path.startsWith('/'))path='/'+path;
      this.origin=origin;this.pathname=path.split(/[?#]/)[0]||'/';this.search=path.includes('?')?'?'+path.split('?')[1].split('#')[0]:'';this.hash=path.includes('#')?'#'+path.split('#')[1]:'';this.href=origin+this.pathname+this.search+this.hash;
    }
    toString(){return this.href;}
  };
  globalThis.location = { pathname: '/', search: '', hash: '', href: 'http://uebung.invalid/', origin: 'http://uebung.invalid' };
  globalThis.history = { state: null, replaceState(state, unused, url) { this.state = state; if (url) location.pathname = String(url).split(/[?#]/)[0]; }, pushState(state, unused, url) { this.replaceState(state, unused, url); }, go() {} };
  globalThis.HTMLIFrameElement ||= class {};
  document.oninput = null;
  Object.defineProperty(DOM.HTMLInputElement.prototype, 'type', { get() { return this.getAttribute('type') || 'text'; }, set(value) { this.setAttribute('type',String(value)); }, configurable: true });
  Object.defineProperty(DOM.HTMLFormElement, Symbol.hasInstance, { value: node => node instanceof DOM.HTMLElement && node.localName === 'form' });
  Object.defineProperty(DOM.HTMLOptionElement.prototype, 'value', { get() { return this.hasAttribute('value') ? this.getAttribute('value') : this.textContent; }, set(value) { this.setAttribute('value',String(value)); }, configurable: true });
  Object.defineProperty(DOM.HTMLSelectElement.prototype, 'value', {
    get() { return this.querySelector('option[selected]')?.value ?? this.querySelector('option')?.value ?? ''; },
    set(value) { const options=[...this.options]; for(const option of options)option.removeAttribute('selected'); options.find(option=>option.value===String(value))?.setAttribute('selected',''); },
    configurable: true,
  });
  let counter = 0;
  globalThis.crypto = { randomUUID: () => sessionId.slice(0,24) + (++counter).toString(16).padStart(12,'0') };
  globalThis.performance = { now: () => Date.now() };
  const timers = new Map(); let timerId = 0;
  globalThis.setTimeout = fn => { if (timers.size > 100) throw new Error('Zu viele Übungsjobs'); const id = ++timerId; timers.set(id, fn); return id; };
  globalThis.clearTimeout = id => timers.delete(id);
  globalThis.requestAnimationFrame = fn => setTimeout(() => fn(performance.now()));
  globalThis.cancelAnimationFrame = clearTimeout;
  let focused = null;
  DOM.HTMLElement.prototype.focus = function () { focused = this; };
  Object.defineProperty(document, 'activeElement', { get: () => focused || document.body });
  DOM.HTMLElement.prototype.setCustomValidity = function (value) { this.__customError = String(value); };
  DOM.HTMLElement.prototype.checkValidity = function () { return !this.__customError && (!this.required || !!String(this.value || '').trim()); };
  DOM.HTMLElement.prototype.reportValidity = DOM.HTMLElement.prototype.checkValidity;
  DOM.HTMLElement.prototype.reset = function () { for (const input of this.querySelectorAll('input,textarea')) { input.value = ''; input.checked = false; } };
  const store = Object.assign(Object.create(null), seed || {});
  globalThis.localStorage = Object.freeze({
    getItem: key => Object.hasOwn(store, String(key)) ? store[String(key)] : null,
    setItem: (key, value) => { key = String(key); value = String(value); if (scenario === 'quota' || value.length > 65536 || !Object.hasOwn(store,key) && Object.keys(store).length >= 20) throw new Error('Übungsspeicher voll'); store[key] = value; },
    removeItem: key => { delete store[String(key)]; }, clear: () => { for (const key of Object.keys(store)) delete store[key]; },
  });
  const fixture = [{ id: 'html', title: 'HTML-Grundlagen', category: 'Web' }, { id: 'css', title: 'CSS-Layout', category: 'Web' }, { id: 'dns', title: 'DNS verstehen', category: 'Netzwerk' }];
  class AbortController {
    constructor() { this.signal = new DOM.EventTarget(); this.signal.aborted = false; }
    abort() { if(this.signal.aborted)return;this.signal.aborted = true;this.signal.dispatchEvent(new DOM.Event('abort')); }
  }
  globalThis.AbortController = AbortController;
  globalThis.fetch = globalThis.request = async (url, options = {}) => {
    if (url !== './topics.json') throw new Error('Nur ./topics.json ist als lokales Übungsziel erlaubt.');
    if (options.signal?.aborted) { const error = new Error('Abgebrochen'); error.name = 'AbortError'; throw error; }
    if (scenario === 'network') throw new Error('Vorbereiteter Anfragefehler');
    return await new Promise((resolve,reject)=>{
      const abort=()=>{const error=new Error('Abgebrochen');error.name='AbortError';reject(error);};
      options.signal?.addEventListener('abort',abort,{once:true});
      setTimeout(()=>{options.signal?.removeEventListener('abort',abort);if(options.signal?.aborted){abort();return;}resolve({ ok: scenario !== 'http', status: scenario === 'http' ? 503 : 200, json: async () => { if (scenario === 'json') throw new Error('Vorbereiteter JSON-Fehler'); return scenario === 'schema' ? null : scenario === 'empty' ? [] : fixture.map(item => ({ ...item })); } });});
    });
  };
  // Native Node tests are a small guest-only compatibility layer, never Node.
  const tests = [];
  const equal = (a, b) => { if (a !== b) throw new Error('Werte ungleich'); };
  const assert = { equal, strictEqual: equal, deepEqual(a, b) { equal(JSON.stringify(a), JSON.stringify(b)); }, deepStrictEqual(a, b) { equal(JSON.stringify(a), JSON.stringify(b)); }, ok(value) { if (!value) throw new Error('Erwartung falsch'); }, async rejects(fn, pattern) { try { await fn(); } catch (error) { if (pattern && !pattern.test(error.message)) throw error; return; } throw new Error('Ablehnung fehlt'); } };
  const test = (title, fn) => { tests.push({ title, fn }); };
  let nodeId = 0; const ids = new WeakMap(); let nodes = new Map();
  const stringify = JSON.stringify;
  return {
    modules: { 'node:test': { __esModule: true, default: test }, 'node:assert/strict': { __esModule: true, default: assert } },
    async tests() { if (!tests.length) throw new Error('Keine Tests registriert'); for (const test of tests) { await test.fn(); console.log('Bestanden: ' + test.title); } return tests.length; },
    flush() { const current = [...timers.values()]; timers.clear(); for (const fn of current) fn(); return current.length; },
    dispatch(event) {
      const node = nodes.get(event.id);
      if (!node || !['input','change','click','submit'].includes(event.type)) throw new Error('Unbekanntes Übungsereignis');
      if (typeof event.value === 'string') { const setter=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(node),'value')?.set; if(setter)setter.call(node,event.value.slice(0,2000));else node.value=event.value.slice(0,2000); }
      if (typeof event.checked === 'boolean') node.checked = event.checked;
      const dispatched=new DOM.Event(event.type, { bubbles: true, cancelable: true });
      if(event.type==='click')Object.assign(dispatched,{button:0,ctrlKey:false,metaKey:false,shiftKey:false,altKey:false});
      node.dispatchEvent(dispatched);
    },
    snapshot() {
      nodes = new Map(); let count = 0; let chars = 0;
      const walk = (node, depth) => {
        if (++count > 3000 || depth > 32) throw new Error('DOM-Grenze erreicht');
        if (node.nodeType === 3) { const text = String(node.textContent).slice(0, 4000); chars += text.length; if (chars > 64000) throw new Error('Textgrenze erreicht'); return { text }; }
        if (node.nodeType !== 1) return null;
        if (!ids.has(node)) ids.set(node, ++nodeId);
        const id = ids.get(node); nodes.set(id, node);
        const attrs = {};
        for (const attr of node.attributes) if (['id','type','role','for','aria-label','aria-invalid','aria-live','placeholder','min','max','step','maxlength','tabindex'].includes(attr.name)) attrs[attr.name] = String(attr.value).slice(0, 300);
        return { id, tag: node.localName, attrs, value: String(node.value || '').slice(0, 2000), checked: !!node.checked, disabled: !!node.disabled, required: !!node.required, children: [...node.childNodes].map(child => walk(child, depth + 1)).filter(Boolean) };
      };
      return stringify({ tree: walk(document.body, 0), store, focus: focused ? ids.get(focused) : null, title: String(document.title).slice(0, 200), path: location.pathname });
    },
  };
}
