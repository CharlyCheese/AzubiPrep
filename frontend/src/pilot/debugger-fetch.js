export const FETCH_LIMITS = Object.freeze({
  fixtures: 8, path: 128, bodyBytes: 16384, fixtureBytes: 65536,
  delayMs: 30000, pending: 8, requests: 64, operations: 256, deliveredBytes: 262144, controllers:64,
});

function validFixturePath(path) {
  if (typeof path !== 'string' || path.length > FETCH_LIMITS.path || !path.startsWith('/uebung/')) return false;
  const parts = path.slice(1).split('/');
  return parts.length <= 8 && parts.every(part => /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,62}$/.test(part) && !part.endsWith('.') && !['node_modules', 'local-rag', 'local-ai'].includes(part.toLowerCase()));
}

// Only explicitly supplied exercise definitions enter a project. This function
// never resolves a URL, opens a file, or interprets the body as executable code.
export function checkFetchFixtures(value) {
  if (value === undefined) return { schema: 1, routes: [] };
  const record = item => !!item && typeof item === 'object' && !Array.isArray(item) && [Object.prototype, null].includes(Object.getPrototypeOf(item));
  const fields = (item, names) => record(item) && Object.keys(item).length === names.length && names.every(name => Object.hasOwn(item, name) && Object.hasOwn(Object.getOwnPropertyDescriptor(item, name), 'value'));
  if (!fields(value, ['schema', 'routes']) || value.schema !== 1 || !Array.isArray(value.routes) || value.routes.length > FETCH_LIMITS.fixtures) throw new Error('Übungsantworten benötigen Schema 1 und höchstens acht Einträge.');
  const paths = new Set(), routes = [];
  for (const route of value.routes) {
    if (!record(route)) throw new Error('Ungültige Übungsantwort.');
    const kindField = Object.getOwnPropertyDescriptor(route, 'kind');
    const kind = kindField && Object.hasOwn(kindField, 'value') ? kindField.value : undefined;
    const names = kind === 'http' ? ['path', 'kind', 'status', 'delayMs', 'body'] : kind === 'network-error' ? ['path', 'kind', 'delayMs'] : [];
    if (!names.length || !fields(route, names)) throw new Error('Übungsantworten benötigen HTTP-Daten oder einen simulierten Transportfehler ohne Zusatzfelder.');
    if (!validFixturePath(route.path) || paths.has(route.path)) throw new Error('Übungspfade müssen eindeutig sein und mit /uebung/ beginnen; URLs, private und besondere Pfadteile sind nicht erlaubt.');
    if (!Number.isSafeInteger(route.delayMs) || route.delayMs < 0 || route.delayMs > FETCH_LIMITS.delayMs) throw new Error('Die Wartezeit einer Übungsantwort muss zwischen 0 und 30000 Millisekunden liegen.');
    paths.add(route.path);
    if (kind === 'network-error') {
      routes.push({ path: route.path, kind, delayMs: route.delayMs });
      continue;
    }
    if (!Number.isSafeInteger(route.status) || !(route.status >= 200 && route.status <= 299 || route.status >= 400 && route.status <= 599)) throw new Error('HTTP-Status: 200–299 oder 400–599 verwenden. Weiterleitungen sind nicht freigegeben.');
    if (typeof route.body !== 'string' || route.body.length > FETCH_LIMITS.bodyBytes || new TextEncoder().encode(route.body).length > FETCH_LIMITS.bodyBytes) throw new Error('Eine Übungsantwort darf höchstens 16 KiB Text enthalten.');
    if ([204, 205].includes(route.status) && route.body !== '') throw new Error('HTTP 204 und 205 benötigen einen leeren Antworttext.');
    routes.push({ path: route.path, kind, status: route.status, delayMs: route.delayMs, body: route.body });
  }
  const result = { schema: 1, routes };
  if (new TextEncoder().encode(JSON.stringify(result)).length > FETCH_LIMITS.fixtureBytes) throw new Error('Die Übungsantworten dürfen zusammen höchstens 64 KiB umfassen.');
  return result;
}

// Serialized into QuickJS. Deferred native Promises and response records remain
// private in that VM; the host sees only a request ID and its bounded delay.
export function installDebugFetch(core, emit, limits, fixtures, promises, data) {
  const stringify = JSON.stringify, create = Object.create, define = Object.defineProperty;
  const integer = Number.isSafeInteger, TypeErrorClass = TypeError, ErrorClass=Error;
  const own=Object.hasOwn,descriptor=Object.getOwnPropertyDescriptor,prototype=Object.getPrototypeOf;
  const routes = new Map(), pending = new Map(), responses = new Map(), controllers=new Map(), signals=new Map();
  let nextId = 0, requestCount=0, operations = 0, deliveredBytes = 0;
  const fail = text => { emit(stringify({ error: text })); core.abort(text); };
  const guard = () => { core.guard(); if (++operations > limits.operations) fail('Übungsantworten: Operationsgrenze erreicht.'); };
  const send = message => { if (emit(stringify(message)) !== true) fail('Die Brücke für Übungsantworten wurde beendet oder abgewiesen.'); };
  function size(value) {
    let bytes = 0;
    for (let index = 0; index < value.length; index++) {
      const code = value.charCodeAt(index);
      if (code < 128) bytes++;
      else if (code < 2048) bytes += 2;
      else if (code >= 55296 && code <= 56319 && index + 1 < value.length && value.charCodeAt(index + 1) >= 56320 && value.charCodeAt(index + 1) <= 57343) { bytes += 4; index++; }
      else bytes += 3;
    }
    return bytes;
  }
  function validPath(path) {
    if (typeof path !== 'string' || path.length > limits.path || !path.startsWith('/uebung/')) return false;
    const parts = path.slice(1).split('/');
    return parts.length <= 8 && parts.every(part => /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,62}$/.test(part) && !part.endsWith('.') && !['node_modules', 'local-rag', 'local-ai'].includes(part.toLowerCase()));
  }
  for (const route of fixtures.routes) routes.set(route.path, { kind: route.kind, status: route.status, delayMs: route.delayMs, body: route.body, bytes: route.kind === 'http' ? size(route.body) : 0 });
  function construct(args){
    guard();if(args.length||controllers.size>=limits.controllers)fail('AbortController benötigt keine Argumente; höchstens64 pro Sitzung.');
    const handle=create(null),signal=create(null),state={signal,aborted:false,reason:undefined};controllers.set(handle,state);signals.set(signal,state);return handle;
  }
  function abort(state){
    if(state.aborted)return;state.aborted=true;const error=new ErrorClass('Die Übungsanfrage wurde abgebrochen.');define(error,'name',{value:'AbortError'});state.reason=error;
    for(const [id,entry] of pending)if(entry.signal===state){pending.delete(id);send({action:'cancel',id});entry.deferred.reject(error);}
  }
  function call(args) {
    guard();
    if(args.length<1||args.length>2||!validPath(args[0]))fail('fetch benötigt einen einfachen /uebung/-Pfad als Text; URLs und Objektkonvertierung sind nicht freigegeben.');
    let signal;
    if(args[1]!==undefined){const options=args[1];if(!options||typeof options!=='object'||![null,Object.prototype].includes(prototype(options))||Object.keys(options).length!==1||!own(options,'signal'))fail('fetch-Optionen: ausschließlich {signal: eigenesSignal} verwenden.');const field=descriptor(options,'signal');if(!own(field,'value')||!signals.has(field.value))fail('fetch benötigt ein eigenes AbortSignal.');signal=signals.get(field.value);}
    if(++requestCount>limits.requests||!signal?.aborted&&pending.size>=limits.pending)fail('Anfragegrenze erreicht (acht offen,64 pro Sitzung).');
    const deferred=promises.deferred();if(signal?.aborted){deferred.reject(signal.reason);return deferred.promise;}
    const route=routes.get(args[0]),id=++nextId;pending.set(id,{route,deferred,signal});
    send({action:'schedule',id,delay:route?route.delayMs:0});return deferred.promise;
  }
  function dispatch(id) {
    core.guard();
    const entry = pending.get(id);
    if (!integer(id) || !entry) fail('Die Übungsanfrage ist nicht mehr verfügbar.');
    pending.delete(id);
    const { route, deferred } = entry;
    if (!route || route.kind === 'network-error') {
      deferred.reject(new TypeErrorClass(route ? 'Die Übungsabfrage ist fehlgeschlagen (simulierter Transportfehler).' : 'Für diesen Pfad ist keine Übungsantwort definiert.'));
      return;
    }
    if (deliveredBytes + route.bytes > limits.deliveredBytes) fail('Gesamtgrenze der ausgelieferten Übungsantworten erreicht (256 KiB).');
    deliveredBytes += route.bytes;
    const handle = create(null);
    responses.set(handle, { status: route.status, body: route.body, nullBody: route.status === 204 || route.status === 205, used: false, signal:entry.signal });
    deferred.resolve(handle);
    core.guard();
  }
  function ref(target, key) {
    core.guard();
    const control=controllers.get(target),signal=signals.get(target);
    if(control||signal){if(control&&key!=='signal'||signal&&!['aborted','reason'].includes(key))fail('Abort-Zustand unterstützt nur signal, aborted und reason.');return define(create(null),'value',{get(){guard();return control?control.signal:signal[key];},set(){fail('Abort-Zustände sind nur lesbar.');}});}
    const response = responses.get(target);
    if (!response || !['status', 'ok', 'bodyUsed'].includes(key)) fail('Übungsantworten bieten status, ok, bodyUsed sowie direkte text/json-Aufrufe.');
    return define(create(null), 'value', {
      get() { guard(); return key === 'status' ? response.status : key === 'ok' ? response.status >= 200 && response.status <= 299 : response.used; },
      set() { fail('Die Eigenschaften einer Übungsantwort sind nur lesbar.'); },
    });
  }
  function bound(target, key) {
    core.guard();
    const control=controllers.get(target);
    if(control){if(key!=='abort')fail('AbortController unterstützt nur den direkten abort-Aufruf.');return(...args)=>{guard();if(args.length)fail('Eigene Abbruchgründe sind noch nicht freigegeben.');abort(control);};}
    const response = responses.get(target);
    if (!response || !['text', 'json'].includes(key)) fail('Bei Übungsantworten sind nur direkte text/json-Aufrufe freigegeben.');
    return (...args) => {
      guard();
      if (args.length) fail('text/json benötigt keine Argumente.');
      const deferred = promises.deferred();
      if (response.used) {
        deferred.reject(new TypeErrorClass('Der Antworttext wurde bereits gelesen.'));
        return deferred.promise;
      }
      if(!response.nullBody&&response.signal?.aborted){deferred.reject(response.signal.reason);return deferred.promise;}
      if (!response.nullBody) response.used = true;
      // Fixtures arrive fully buffered. Native Promise reactions still wait for
      // the current call to finish; no simulated stream or host job is exposed.
      try {
        deferred.resolve(key === 'text' ? response.body : data.parse(response.body));
      } catch (error) {
        // Bounded JSON can fail fatally. Do not turn resource or policy failure
        // into a catchable body rejection while converting ordinary SyntaxError.
        promises.reportFailure(error);
        core.guard();
        deferred.reject(error);
      }
      core.guard();
      return deferred.promise;
    };
  }
  return { call, dispatch, construct, has: value => responses.has(value)||controllers.has(value)||signals.has(value), ref, bound };
}

export function initialFetchProject() {
  return {
    schema: 1, mode: 'module', entry: 'main.js',
    html: '<h1>Kontrollierte Übungsdaten laden</h1>\n<p>Alle Antworten stammen aus diesem Projekt. Es gibt keine echte Netzverbindung.</p>\n<button id="erfolg" type="button">Erfolg laden</button>\n<button id="http" type="button">HTTP 404 ausprobieren</button>\n<button id="transport" type="button">Transportfehler ausprobieren</button>\n<button id="json" type="button">Ungültiges JSON ausprobieren</button>\n<p id="status">Wähle eine Übungsantwort.</p>',
    css: 'body { font-family: sans-serif; padding: 16px; color: #163344; background-color: #f3f7fa; }\nbutton { margin: 4px; padding: 10px; }\n#status { padding: 12px; border-width: 1px; border-style: solid; border-color: #28776b; }',
    fixtures: { schema: 1, routes: [
      { path: '/uebung/erfolg', kind: 'http', status: 200, delayMs: 600, body: '{"text":"Die Übungsdaten sind bereit."}' },
      { path: '/uebung/fehlt', kind: 'http', status: 404, delayMs: 600, body: '{"text":"Die Aufgabe wurde nicht gefunden."}' },
      { path: '/uebung/transport', kind: 'network-error', delayMs: 600 },
      { path: '/uebung/ungueltig', kind: 'http', status: 200, delayMs: 600, body: '{"text":' },
    ] },
    files: { 'main.js': `const status = document.getElementById("status");
async function laden(pfad) {
  status.textContent = "Übungsdaten werden geladen …";
  try {
    const antwort = await fetch(pfad);
    console.log("HTTP-Status: " + antwort.status);
    // HTTP-Fehler lehnen fetch nicht automatisch ab.
    if (!antwort.ok) {
      throw new Error("HTTP-Fehler " + antwort.status);
    }
    const daten = await antwort.json();
    if (!daten || typeof daten !== "object" || typeof daten.text !== "string") {
      throw new Error("Die Antwort hat nicht das erwartete Datenformat.");
    }
    status.textContent = daten.text;
    console.log("Antwort gelesen: " + antwort.bodyUsed);
  } catch (fehler) {
    status.textContent = fehler.name + ": " + fehler.message;
    console.log("Fehler behandelt: " + fehler.name);
  } finally {
    console.log("Dieser Ladevorgang ist abgeschlossen.");
  }
}
document.getElementById("erfolg").addEventListener("click", () => {
  laden("/uebung/erfolg");
});
document.getElementById("http").addEventListener("click", () => {
  laden("/uebung/fehlt");
});
document.getElementById("transport").addEventListener("click", () => {
  laden("/uebung/transport");
});
document.getElementById("json").addEventListener("click", () => {
  laden("/uebung/ungueltig");
});` },
  };
}

export function initialAbortProject(){
  const base=initialFetchProject();
  return {...base,html:'<h1>Aktuelle Antworten behalten</h1>\n<p>Starte zuerst langsam, dann schnell. Die alte Anfrage wird abgebrochen. Eine Anfragenummer schützt zusätzlich den aktuellen Zustand.</p>\n<button id="langsam" type="button">Langsam laden</button><button id="schnell" type="button">Schnell laden</button><button id="abbrechen" type="button">Anfrage abbrechen</button>\n<p id="status">Noch keine Anfrage.</p><p id="daten">Noch keine Daten.</p>',fixtures:{schema:1,routes:[{path:'/uebung/langsam',kind:'http',status:200,delayMs:2500,body:'{"text":"Langsame Antwort"}'},{path:'/uebung/schnell',kind:'http',status:200,delayMs:100,body:'{"text":"Schnelle Antwort"}'}]},files:{'main.js':`const status = document.getElementById("status");
const daten = document.getElementById("daten");
let aktuelleNummer = 0;
let controller;
async function laden(pfad) {
  aktuelleNummer++;
  const meineNummer = aktuelleNummer;
  if (controller) controller.abort();
  controller = new AbortController();
  const signal = controller.signal;
  status.textContent = "Wird geladen …";
  try {
    const antwort = await fetch(pfad, { signal });
    if (!antwort.ok) throw new Error("HTTP-Fehler " + antwort.status);
    const inhalt = await antwort.json();
    if (meineNummer !== aktuelleNummer) return;
    if (!inhalt || typeof inhalt.text !== "string") throw new Error("Unpassendes Datenformat");
    daten.textContent = inhalt.text;
    status.textContent = "Antwort übernommen.";
    console.log(inhalt.text);
  } catch (fehler) {
    if (meineNummer !== aktuelleNummer) return;
    status.textContent = fehler.name === "AbortError" ? "Anfrage abgebrochen." : fehler.message;
  } finally {
    if (meineNummer === aktuelleNummer) {
      controller = undefined;
      console.log("Aktuelle Anfrage abgeschlossen.");
    }
  }
}
document.getElementById("langsam").addEventListener("click", () => {
  laden("/uebung/langsam");
});
document.getElementById("schnell").addEventListener("click", () => {
  laden("/uebung/schnell");
});
document.getElementById("abbrechen").addEventListener("click", () => {
  if (controller) controller.abort();
});`}};
}
