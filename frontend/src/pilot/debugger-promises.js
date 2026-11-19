export const PROMISE_LIMITS = Object.freeze({ promises: 128, operations: 512, jobs: 512 });

// All Promise values, reactions and observation records stay inside QuickJS.
// Native jobs are drained individually by the worker with true Asyncify waiting.
export function installDebugPromises(core, emit, limits, observe) {
  const Native = Promise, then = Native.prototype.then, final = Native.prototype.finally;
  const resolve = Native.resolve, reject = Native.reject, apply = Reflect.apply;
  const descriptor = Object.getOwnPropertyDescriptor, prototype = Object.getPrototypeOf, own = Object.hasOwn;
  const stringify = JSON.stringify, handle = Object.create(null), records = new Map();
  let operations = 0;
  const fail = text => { emit(stringify({ error: text })); core.abort(text); };
  const guard = () => { core.guard(); if (++operations > limits.operations) fail('Promise-Operationsgrenze erreicht.'); };
  function checkValue(value) {
    if (records.has(value) || value === null || !['object','function'].includes(typeof value)) return value;
    // No user-created proxies/getters can enter through the supported syntax.
    // Still reject thenable hooks before the native resolving algorithm sees them.
    for (let object = value; object !== null; object = prototype(object)) {
      const field = descriptor(object, 'then');
      if (field) { if (!own(field, 'value') || typeof field.value === 'function') fail('Eigene Thenables sind im Debugger noch nicht unterstützt.'); break; }
    }
    return value;
  }
  function track(promise) {
    core.guard();
    if (records.has(promise)) return promise;
    if (records.size >= limits.promises) fail('Promise-Anzahlgrenze erreicht (128 pro Sitzung).');
    const id = observe('track', promise);
    if (!Number.isSafeInteger(id) || id < 0 || id >= limits.promises) fail('Promise-Beobachtung wurde abgewiesen.');
    records.set(promise, id);
    return promise;
  }
  function adopt(value, owner) {
    checkValue(value);
    // Native resolution attaches reactions to an adopted Promise. Self-resolution
    // instead rejects the owner and must remain observable as unhandled.
    if (records.has(value) && value !== owner) observe('handled', records.get(value));
    return value;
  }
  function invoke(fn, args) {
    try { return core.invoke(fn, args, undefined); }
    catch (error) {
      // Native Promise algorithms turn throws into rejections. Classify VM
      // resource errors before that conversion so learner catch cannot hide them.
      reportFailure(error);
      throw error;
    }
  }
  function reportFailure(error){try{core.failure(error);}catch{fail(core.failureReason()||'Promise-Ausführung durch Interpreter-/Speichergrenze beendet.');}}
  function trackReturn(value){if(value!==null&&typeof value==='object'&&prototype(value)===Native.prototype)track(value);return value;}
  function awaitValue(value){checkValue(value);if(records.has(value))observe('handled',records.get(value));return value;}
  function deferred(){
    guard();let fulfil,decline;const promise=track(new Native((a,b)=>{fulfil=a;decline=b;}));
    return {promise,resolve(value){guard();fulfil(adopt(value,promise));},reject(value){guard();decline(value);}};
  }
  function construct(args) {
    guard(); if (args.length !== 1 || !core.registered(args[0])) fail('new Promise benötigt eine eigene Executor-Funktion.');
    if (records.size >= limits.promises) fail('Promise-Anzahlgrenze erreicht (128 pro Sitzung).');
    let promise;
    promise = new Native((fulfil, decline) => {
      let settled = false;
      const accept = core.allowCallback(value => { guard(); if (settled) return; settled = true; fulfil(adopt(value,promise)); });
      const refuse = core.allowCallback(value => { guard(); if (settled) return; settled = true; decline(value); });
      invoke(args[0], [accept, refuse]);
    });
    core.guard(); return track(promise);
  }
  function callback(fn, owner, noArguments = false) {
    if (typeof fn !== 'function') return undefined;
    if (!core.registered(fn)) fail('Promise-Handler benötigen eigene Funktionen.');
    return value => { core.guard(); const result = invoke(fn, noArguments ? [] : [value]); core.guard(); return adopt(result,owner()); };
  }
  function bound(target, key) {
    core.guard();
    if (target === handle) {
      if (!['resolve','reject'].includes(key)) fail('Promise unterstützt hier resolve und reject.');
      return (...args) => { guard(); if (args.length > 1) fail('Promise.resolve/reject erwartet höchstens einen Wert.'); return track(apply(key === 'resolve' ? resolve : reject, Native, [key === 'resolve' ? checkValue(args[0]) : args[0]])); };
    }
    if (!records.has(target) || !['then','catch','finally'].includes(key)) fail('Bei Promises sind then, catch und finally freigegeben.');
    return (...args) => {
      guard(); if (args.length > (key === 'then' ? 2 : 1)) fail('Zu viele Promise-Handlerargumente.');
      let child;
      const owner=()=>child;
      const handlers = key === 'then' ? [callback(args[0],owner), callback(args[1],owner)] : key === 'catch' ? [undefined, callback(args[0],owner)] : [callback(args[0],owner,true)];
      observe('handled', records.get(target));
      child=track(apply(key === 'finally' ? final : then, target, handlers));return child;
    };
  }
  function ref() { fail('Promise-Methoden bitte direkt aufrufen; innere Werte und Methodenaliase sind nicht zugänglich.'); }
  return { handle, construct, bound, ref, has: value => value === handle || records.has(value), track, checkValue, adopt, reportFailure, trackReturn, awaitValue, deferred, deny:fail };
}

export function initialPromiseProject() {
  return { schema: 1, mode: 'module', entry: 'main.js',
    html: '<h1>Ein Ergebnis kommt später</h1>\n<button id="erfolg" type="button">Erfolg ausprobieren</button>\n<button id="fehler" type="button">Fehler ausprobieren</button>\n<p id="status">Wähle einen Ablauf.</p>',
    css: 'body { font-family: sans-serif; padding: 16px; color: #163344; background-color: #f3f7fa; }\nbutton { margin: 4px; padding: 10px; }',
    files: { 'main.js': `const status = document.getElementById("status");
function ergebnisSpaeter(erfolgreich) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (erfolgreich) {
        resolve("Die Übungsdaten sind bereit.");
      } else {
        reject(new Error("Die Übungsabfrage ist fehlgeschlagen."));
      }
    }, 600);
  });
}

function starten(erfolgreich) {
  status.textContent = "Wird geladen …";
  ergebnisSpaeter(erfolgreich)
    .then(text => {
      status.textContent = text;
      console.log("Erfolg: " + text);
      return "Weiterverarbeitet";
    })
    .catch(fehler => {
      status.textContent = fehler.message;
      console.log("Fehler behandelt");
    })
    .finally(() => {
      console.log("Dieser Ablauf ist abgeschlossen.");
    });
  console.log("Die Anfrage wurde geplant.");
}
document.getElementById("erfolg").addEventListener("click", () => {
  starten(true);
});
document.getElementById("fehler").addEventListener("click", () => {
  starten(false);
});` } };
}

export function initialAsyncProject() {
  const project=initialPromiseProject();
  project.html=project.html.replace('Ein Ergebnis kommt später','Auf ein Ergebnis warten');
  project.files['main.js']=`const status = document.getElementById("status");
function ergebnisSpaeter(erfolgreich) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (erfolgreich) {
        resolve("Die Übungsdaten sind bereit.");
      } else {
        reject(new Error("Die Übungsabfrage ist fehlgeschlagen."));
      }
    }, 600);
  });
}
async function starten(erfolgreich) {
  status.textContent = "Wird geladen …";
  try {
    const text = await ergebnisSpaeter(erfolgreich);
    status.textContent = text;
    console.log("Erfolg: " + text);
  } catch (fehler) {
    status.textContent = fehler.message;
    console.log("Fehler behandelt");
  } finally {
    console.log("Dieser Ablauf ist abgeschlossen.");
  }
}
document.getElementById("erfolg").addEventListener("click", () => {
  starten(true);
  console.log("Die Anfrage wurde geplant.");
});
document.getElementById("fehler").addEventListener("click", () => {
  starten(false);
});`;
  return project;
}
