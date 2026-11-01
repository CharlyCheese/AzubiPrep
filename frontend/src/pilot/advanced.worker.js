import variant from '@jitl/quickjs-singlefile-browser-release-sync';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import vendor from 'virtual:course-vendor';
import { installCourseDOM } from './advanced-dom.js';
import { ADVANCED_CHECKS } from './advanced-exercises.js';

let vm; let runtime; let controller; let records; let deadline; let emitted = 0; let chars = 0; let outputLimit = false;
let busy = false;
const send = data => self.postMessage(data);
function guestString(value, maximum) {
  if(vm.typeof(value)!=='string')throw new Error('Ungültige Textausgabe');
  const size=vm.getProp(value,'length');let length;try{length=vm.getNumber(size);}finally{size.dispose();}
  if(length>maximum)throw new Error('Ausgabegrenze erreicht');
  return vm.getString(value);
}
function evaluate(source, name = 'uebung.js') {
  const result = vm.evalCode(source, name, { type: 'global' });
  if (result.error) {
    let message = 'Ausführungsfehler';
    try {
      // Error conversion is bounded and executed only inside the guest.
      const format = vm.evalCode('(value)=>(String(value)+"\\n"+String(value && value.stack || "")).slice(0,2000)');
      if (!format.error) { const text = vm.callFunction(format.value, vm.undefined, result.error); if (!text.error) { if (vm.typeof(text.value) === 'string') message = guestString(text.value,2000); text.value.dispose(); } else text.error.dispose(); format.value.dispose(); } else format.error.dispose();
    } finally { result.error.dispose(); }
    throw new Error(message);
  }
  return result.value;
}
function call(name, argument) {
  const fn = vm.getProp(controller, name);
  const arg = argument === undefined ? null : evaluate('(' + JSON.stringify(argument) + ')', 'ereignisdaten.js');
  try {
    const result = vm.callFunction(fn, controller, ...(arg ? [arg] : []));
    if (result.error) { result.error.dispose(); throw new Error('Übungsmodell: ' + name + ' fehlgeschlagen oder Grenze erreicht.'); }
    return result.value;
  } finally { fn.dispose(); arg?.dispose(); }
}
function settle() {
  let jobs = 0;
  for (let cycle = 0; cycle < 30; cycle++) {
    while (runtime.hasPendingJob()) {
      if (++jobs > 1000) throw new Error('Jobgrenze erreicht');
      const result = runtime.executePendingJobs(1);
      if (result.error) { result.error.dispose(); throw new Error('Asynchroner Ausführungsfehler'); }
    }
    const value = call('flush'); const count = vm.getNumber(value); value.dispose();
    if (!count && !runtime.hasPendingJob()) return;
  }
  throw new Error('Jobgrenze erreicht');
}
function snapshot() {
  const value = call('snapshot');
  try { const text=guestString(value,1048576); send({ ...JSON.parse(text), type: 'snapshot' }); }
  finally { value.dispose(); }
}
self.onmessage = async ({ data }) => {
  if (busy) return;
  busy = true;
  deadline = performance.now() + 3000;
  try {
    if (data.type === 'start' && !runtime) {
      if (!Array.isArray(data.compiled) || data.compiled.length > 50 || typeof data.html !== 'string' || data.html.length > 131072) throw new Error('Ungültiges Programm');
      const quickJS = await newQuickJSWASMModuleFromVariant(variant);
      deadline = performance.now() + 3000;
      runtime = quickJS.newRuntime(); runtime.setMemoryLimit(96 * 1024 * 1024); runtime.setMaxStackSize(256 * 1024); runtime.setInterruptHandler(() => outputLimit || performance.now() >= deadline);
      vm = runtime.newContext();
      const emit = vm.newFunction('emit', value => {
        if (vm.typeof(value) !== 'string' || ++emitted > 80) { outputLimit = true; return vm.undefined; }
        let text;try{text=guestString(value,1000);}catch{outputLimit=true;return vm.undefined;} chars += text.length;
        if (chars > 32000) { outputLimit = true; return vm.undefined; }
        send({ type: 'log', text }); return vm.undefined;
      });
      vm.setProp(vm.global, '__emit', emit); emit.dispose();
      records = evaluate('(()=>{const emit=__emit;delete globalThis.__emit;const records=[];const text=v=>typeof v==="object"&&v!==null?"[Objekt]":String(v).slice(0,1000);const log=(...args)=>{const line=args.slice(0,20).map(text).join(" ");if(records.length<80)records.push(line);emit(line);};globalThis.console=Object.freeze({log,error:log,warn:log});return records;})()');
      evaluate(vendor.dom, 'lokales-dom.js').dispose();
      controller = evaluate('(' + installCourseDOM.toString() + ')(' + JSON.stringify(data.html) + ',' + JSON.stringify(data.store || {}) + ',' + JSON.stringify(data.scenario || 'ok') + ',' + JSON.stringify(crypto.randomUUID()) + ')', 'dom-modell.js');
      if (data.react) { evaluate(vendor.react, 'lokales-react.js').dispose(); evaluate('globalThis.React=__libraries.React;').dispose(); }
      const modules = vm.getProp(controller, 'modules'); vm.setProp(vm.global, '__courseModules', modules); modules.dispose();
      const code = String.raw`(()=>{const definitions=Object.create(null),cache=Object.create(null); const builtins=__courseModules; delete globalThis.__courseModules; ${data.react ? 'Object.assign(builtins,{react:__libraries.React,"react-dom/client":__libraries.ReactDOM,"react-router-dom":__libraries.Router});' : ''}
        function resolve(from,target){if(Object.hasOwn(builtins,target))return target;if(!/^\.\.?\//.test(target))throw new Error("Modul nicht freigegeben: "+target);const parts=from.split("/");parts.pop();for(const p of target.split("/")){if(p==="..") {if(!parts.length)throw new Error("Projektgrenze");parts.pop();}else if(p&&p!==".")parts.push(p);}const path=parts.join("/");for(const p of [path,path+".js",path+".ts",path+".tsx",path+"/index.js"])if(Object.hasOwn(definitions,p))return p;throw new Error("Modul fehlt: "+target);}
        function load(name){if(Object.hasOwn(builtins,name))return builtins[name];if(cache[name])return cache[name].exports;if(!Object.hasOwn(definitions,name))throw new Error("Modul fehlt");const module={exports:{}};cache[name]=module;definitions[name](module,module.exports,target=>load(resolve(name,target)));return module.exports;}
        ${data.compiled.filter(item => item.module).map(item => 'definitions[' + JSON.stringify(item.name) + ']=function(module,exports,require){\n' + item.code + '\n};').join('\n')}
        globalThis.__entry=${data.compiled.some(item => item.name === data.entry && item.module) ? 'load(' + JSON.stringify(data.entry) + ')' : '{}'};
      })();`;
      evaluate(code, 'projektmodule.js').dispose();
      for (const item of data.compiled.filter(item => !item.module && item.name === data.entry)) evaluate(item.code, item.name).dispose();
      settle();
      if (data.react) evaluate('if(typeof __entry.default==="function"){__libraries.ReactDOM.flushSync(()=>__libraries.ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(__entry.default)));}else if(!document.getElementById("root")?.childNodes.length){throw new Error("Standardexport oder gemounteter React-Einstieg fehlt");}', data.entry).dispose();
      settle();
      if (data.check) {
        const check = ADVANCED_CHECKS[data.lesson];
        if (!check) throw new Error('Keine feste Prüfung für diese Lektion');
        // Promise tests are observed within QuickJS; no guest Promise crosses out.
        const testRunner = vm.getProp(controller, 'tests');
        const flush = vm.getProp(controller, 'flush');
        const probe = evaluate('(__logs,__tests,__flush)=>{globalThis.__verdict={done:false,passed:false}; Promise.resolve().then(async()=>{ ' + check + '\n}).then(value=>{__verdict.done=true;__verdict.passed=value===true;},()=>{__verdict.done=true;});}', 'aufgabenpruefung.js');
        const started = vm.callFunction(probe, vm.undefined, records, testRunner, flush); probe.dispose(); testRunner.dispose(); flush.dispose();
        if (started.error) { started.error.dispose(); throw new Error('Prüfung konnte nicht gestartet werden'); } started.value.dispose();
        settle();
        const verdict = evaluate('__verdict.done===true && __verdict.passed===true');
        const checked = vm.typeof(verdict) === 'boolean' && vm.getNumber(verdict) === 1; verdict.dispose();
        send({ type: 'checked', checked });
      }
      snapshot(); send({ type: 'ready' });
    } else if (data.type === 'event' && controller) {
      call('dispatch', data.event).dispose(); settle(); snapshot(); send({ type: 'ready' });
    }
  } catch (error) { send({ type: 'error', text: performance.now() >= deadline ? 'Zeitgrenze erreicht.' : String(error.message).slice(0, 2000) }); self.close(); }
  finally { busy = false; }
};
