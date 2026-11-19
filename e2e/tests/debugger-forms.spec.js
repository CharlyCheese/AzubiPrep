import {test,expect,_electron} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {initialFormProject,DOM_LIMITS,installDebugDOM,validDOMTree,validDOMEvent} from '../../frontend/src/pilot/debugger-dom.js';
import {parseDebugHTML} from '../../frontend/src/pilot/debugger-dom-parse.js';
import {compileDebugProject} from '../../frontend/src/pilot/debugger-compiler.js';
import {unterdrueckeOnboardingPopups,openDebugger} from './helpers.js';

test.use({serviceWorkers:'block'});
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const region=p=>p.getByRole('region',{name:'Debugger-Technikpilot',exact:true});
const status=p=>region(p).getByLabel('Debugstatus',{exact:true});
const button=(p,name)=>region(p).getByRole('button',{name,exact:true});
const output=p=>region(p).getByLabel('Debugkonsole',{exact:true});
const view=p=>p.frameLocator('iframe[title="Gestaltete Debugvorschau"]');
const preview=p=>region(p).getByRole('region',{name:'DOM-Debugvorschau',exact:true});
async function open(page,url='/frontendkurs/debugger'){await unterdrueckeOnboardingPopups(page);await page.goto(url);await openDebugger(page);await region(page).getByLabel('Debugmodus',{exact:true}).selectOption('dom');}
async function load(page,project=initialFormProject()){
 page.once('dialog',d=>d.accept());await region(page).getByLabel('Modulsicherung lesen',{exact:true}).setInputFiles({name:'form-probe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});await expect(region(page).getByLabel('Eigener Debugcode',{exact:true})).toHaveValue(project.files[project.entry]);
}
async function start(page){await button(page,'Debuggen starten').click();await expect(status(page)).toContainText('Angehalten');}
async function go(page){await button(page,'Weiter / bis zum nächsten Haltepunkt').click();}
async function idle(page){await expect(status(page)).toContainText('Bereit für Klicks');}
async function event(page,action){await action();await expect(status(page)).toContainText('Ereignisstart');}
function artifact(project){const a=compileDebugProject(project,undefined,{dom:true});a.dom={tree:parseDebugHTML(project.html),eventPoint:a.points.at(-1).id};return a;}
function find(tree,id){if(tree.attrs?.id===id)return tree;for(const child of tree.children||[]){const found=find(child,id);if(found)return found;}return null;}
async function raw(page,project,actions,options={}){
 const a=artifact(project),asset=fs.readdirSync(path.join(repo,'frontend/dist/assets')).find(n=>/^debugger\.worker-.*\.js$/.test(n));
 return page.evaluate(({artifact,asset,actions,options})=>new Promise(resolve=>{
  const worker=new Worker('/assets/'+asset,{type:'module'}),events=[];let command=0,index=0;
  const finish=()=>{clearTimeout(timer);worker.terminate();resolve(events);};const timer=setTimeout(()=>{events.push({type:'timeout'});finish();},12000);
  worker.onmessage=({data})=>{events.push(data);const control=body=>worker.postMessage({type:'control',session:'forms',revision:'rev',commandId:++command,...body});
   if(data.type==='paused'){
    if(options.duplicate)worker.postMessage({type:'control',session:'forms',revision:'rev',commandId:command+1,event:actions[0]});
    control({pauseId:data.pauseId,mode:'continue'});
   }
   if(data.type==='idle'){
    if(index<actions.length){
     if(options.badFirst&&index===0)for(const event of options.badFirst)worker.postMessage({type:'control',session:'forms',revision:'rev',commandId:command+1,event});
     control({event:actions[index++]});
    }else finish();
   }
   if(data.type==='error'||data.type==='done')finish();
  };worker.postMessage({type:'start',session:'forms',revision:'rev',artifact,limits:{}});
 }),{artifact:a,asset,actions,options});
}

test('Formular: eigener Beispielstart, Textentwurf, input/change-Halt, Submit und Leerprüfung derselben VM',async({page})=>{
 await open(page);page.once('dialog',d=>d.accept());await button(page,'Formularbeispiel laden').click();await start(page);await expect(view(page).getByLabel('Dein Name')).toBeDisabled();await go(page);await idle(page);
 await view(page).getByLabel('Dein Name').fill('Alex');await expect(region(page).getByLabel('Offene Eingaben')).toContainText('1 offene Eingabe');await expect(view(page).locator('#hinweis')).toHaveText('Gib einen Namen ein.');await expect(output(page)).toHaveText('Noch keine Ausgabe.');
 await event(page,()=>button(page,'Eingabe übernehmen').click());await expect(view(page).getByLabel('Dein Name')).toHaveValue('Alex');await expect(view(page).getByLabel('Dein Name')).toBeDisabled();await expect(view(page).locator('#hinweis')).toHaveText('Gib einen Namen ein.');
 await button(page,'Einzelner Schritt').click();await expect(status(page)).toContainText('main.js:6:');await button(page,'Einzelner Schritt').click();await expect(view(page).locator('#hinweis')).toHaveText('Eingabe: Alex');await go(page);await idle(page);await expect(output(page)).toHaveText('Bestätigt: Alex');
 await event(page,()=>view(page).getByRole('button',{name:'Begrüßen'}).click());await expect(view(page).locator('#ausgabe')).toBeEmpty();await go(page);await idle(page);await expect(view(page).locator('#ausgabe')).toHaveText('Hallo Alex!');await expect(output(page)).toContainText('Formular verarbeitet: Alex');
 await view(page).getByLabel('Dein Name').fill('   ');await event(page,()=>view(page).getByRole('button',{name:'Begrüßen'}).click());await go(page);await idle(page);await expect(view(page).locator('#ausgabe')).toHaveText('Bitte gib zuerst deinen Namen ein.');await expect(page).toHaveURL(/\/frontendkurs\/debugger$/);
});

test('Strukturelle Vorschau: Label, textarea-Zeilenumbruch, Enter-Submit, ursprüngliche Texte und programmatisches value',async({page})=>{
 const p={schema:1,mode:'module',entry:'main.js',html:'<form id="f"><label for="n">Name</label><input id="n" value="Start"><label for="t">Notiz</label><textarea id="t">Vorlage</textarea><button>Absenden</button></form><p id="out"></p>',files:{'main.js':'const n=document.getElementById("n");const t=document.getElementById("t");const f=document.getElementById("f");n.value="Programm";t.value="Laufwert";n.addEventListener("input",e=>console.log(e.type,e.target.value));t.addEventListener("change",e=>console.log(e.type,e.target.value,t.textContent));f.addEventListener("submit",e=>{e.preventDefault();console.log("submit",e.submitter.tagName,n.value);});'}};
 await open(page);await load(page,p);await start(page);await go(page);await idle(page);const n=preview(page).getByLabel('Name',{exact:true}),t=preview(page).getByLabel('Notiz',{exact:true});await expect(n).toHaveValue('Programm');await expect(t).toHaveValue('Laufwert');await expect(output(page)).toHaveText('Noch keine Ausgabe.');await preview(page).getByText('Name',{exact:true}).click();await expect(n).toBeFocused();await t.fill('Zeile 1');await t.press('End');await t.press('Enter');await t.pressSequentially('Zeile 2');await expect(t).toHaveValue('Zeile 1\nZeile 2');await idle(page);await event(page,()=>button(page,'Eingabe übernehmen').click());await go(page);await idle(page);await expect(output(page)).toContainText('change Zeile 1\nZeile 2 Vorlage');await n.fill('Ada');await event(page,()=>n.press('Enter'));await go(page);await idle(page);await expect(output(page)).toContainText('input Ada\nsubmit BUTTON Ada');
});

test('Native Referenz: Typidentität, nicht abbrechbare input/change, submitter und Click-Defaultaktion',async({page})=>{
 await open(page);const html='<form id="f"><input id="n"><button id="b">Los</button></form>';
 const source='const f=document.getElementById("f");const n=document.getElementById("n");const b=document.getElementById("b");const shared=e=>{e.preventDefault();console.log(e.type,e.target.id,e.currentTarget.id,e.bubbles,e.cancelable,e.defaultPrevented);};n.addEventListener("input",shared);n.addEventListener("change",shared);n.addEventListener("input",shared);n.removeEventListener("click",shared);f.addEventListener("input",shared);b.addEventListener("click",shared);f.addEventListener("submit",e=>{console.log(e.type,e.target.id,e.submitter.id,e.cancelable);e.preventDefault();console.log(e.defaultPrevented);});';
 const native=await page.evaluate(({html,source})=>{const doc=document.implementation.createHTMLDocument('reference');doc.body.innerHTML=html;const logs=[];new Function('document','console',source)(doc,{log:(...a)=>logs.push(a.join(' '))});const n=doc.getElementById('n');n.value='Ada';n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));doc.getElementById('b').click();doc.getElementById('f').dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:doc.getElementById('b')}));return logs;},{html,source});
 const p={schema:1,mode:'module',entry:'main.js',html,files:{'main.js':source}},tree=parseDebugHTML(html);
 // The reference ends with an explicit SubmitEvent. First compare the cancelled
 // click without that trace, then test a button default action without cancellation.
 const events=await raw(page,p,[{id:find(tree,'n').id,type:'commit',values:[{id:find(tree,'n').id,value:'Ada'}]},{id:find(tree,'b').id}],{duplicate:true});expect(events.at(-1).type,JSON.stringify(events.at(-1))).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(native.slice(0,-2));
 const source2=source.replace('b.addEventListener("click",shared);','');const result=await raw(page,{...p,files:{'main.js':source2}},[{id:find(tree,'b').id}]);expect(result.at(-1).type).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['submit f b true','true']);
});

test('Parser/Snapshot: nur Textfelder, erlaubte Attribute und enges Ereignisschema mit exakten Textgrenzen',()=>{
 for(const html of ['<input type="file">','<input type="password">','<input type="checkbox">','<input name="x">','<input form="f">','<input oninput="x()">','<form action="https://example.org">','<form method="post">','<button formaction="/">x</button>','<input required>','<textarea autofocus></textarea>','<input value="'+ 'a'.repeat(2049)+'">'])expect(()=>parseDebugHTML(html),html).toThrow();
 const tree=parseDebugHTML('<form><label for="n">Name</label><input id="n" type="text" value="Anfang" readonly><textarea disabled>A\nB</textarea><button type="submit">Los</button></form>');expect(validDOMTree(tree)).toBe(true);expect(find(tree,'n').control).toEqual({value:'Anfang',readOnly:true});
 for(const mutate of [t=>{find(t,'n').control.value='a'.repeat(2049);},t=>{find(t,'n').control.extra=1;},t=>{find(t,'n').attrs.type='file';},t=>{find(t,'n').control.value='x\ny';},t=>{t.attrs.action='/';},t=>{find(t,'n').control.readOnly='false';}]){const t=structuredClone(tree);mutate(t);expect(validDOMTree(t)).toBe(false);}
 expect(validDOMEvent({id:1,type:'commit',values:[{id:2,value:'a'.repeat(2048)}]})).toBe(true);
 for(const bad of [{id:0},{id:129},{id:1,type:'load'},{id:1,type:'commit'},{id:1,values:[{id:2,value:'a'.repeat(2049)}]},{id:1,values:[{id:2,value:'x'},{id:2,value:'y'}]},{id:1,values:[{id:2,value:'x',path:'x'}]},{id:1,values:[{id:2,value:2}]},{id:1,source:'x'}])expect(validDOMEvent(bad),JSON.stringify(bad)).toBe(false);
 for(const length of [8191,8192,8193]){const values=Array.from({length:8},(_,i)=>({id:i+1,value:'ä'.repeat(Math.min(1024,Math.max(0,length-i*1024)))}));if(length===8193)values.push({id:9,value:'ä'});expect(validDOMEvent({id:1,type:'commit',values})).toBe(length<=8192);}
});

test('Native Parserreferenz: textarea-Entities/erste Zeile und HTML-type-Großschreibung',async({page})=>{
 const cases=['<textarea id="t">&amp; &lt;b&gt;</textarea>','<textarea id="t">\nStart</textarea>','<textarea id="t">\r\nStart\r\nEnde</textarea>','<textarea id="t">&#10;A</textarea>','<textarea id="t"><b>&amp;amp; &copy; &#x1f600;</textarea>','<textarea id="t">\n\nZwei</textarea>','<input id="t" type="TEXT" value="a&#10;b">','<input id="t" type="Text" value="&lt;b&gt;">','<input id="t" type="">','<button id="t" type="SUBMIT">Los</button>','<button id="t" type="Button">Los</button>','<button id="t" type="">Los</button>'];
 for(const html of cases){const native=await page.evaluate(html=>{const d=document.implementation.createHTMLDocument('synthetic');d.body.innerHTML=html;const e=d.getElementById('t');return {value:e.value,text:e.textContent,type:e.type};},html);const t=find(parseDebugHTML(html),'t');if(t.control){expect(t.control.value,html).toBe(native.value);expect(t.children.map(c=>c.text).join(''),html).toBe(native.text);}expect(t.attrs.type??(t.tag==='input'?'text':t.tag==='button'?'submit':undefined),html).toBe(t.tag==='textarea'?undefined:native.type);}
 for(const type of ['FILE','Password','checkbox'])expect(()=>parseDebugHTML('<input type="'+type+'">')).toThrow();
});

test('Worker: fremde/doppelte Ereignisse, gesperrte Felder, keine Host-/Form-API und flüchtige Livewerte',async({page})=>{
 await open(page);const p=initialFormProject(),tree=parseDebugHTML(p.html),id=find(tree,'name').id;
 const valid={id,type:'commit',values:[{id,value:'Sicher'}]};const events=await raw(page,p,[valid],{badFirst:[{...valid,source:'x'},{...valid,type:'fetch'},{...valid,values:[{id,value:'x'.repeat(2049)}]},{...valid,values:[{id,value:'x'},{id,value:'y'}]}],duplicate:true});expect(events.at(-1).type).toBe('idle');expect(events.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['Bestätigt: Sicher']);
 for(const attr of ['disabled','readonly']){const q={...p,html:p.html.replace('type="text"','type="text" '+attr)};const result=await raw(page,q,[valid]);expect(result.at(-1).type).toBe('error');expect(result.at(-1).text).toContain('Nutzereingabe');expect(result.filter(e=>e.type==='log')).toHaveLength(0);}
 for(const source of ['document.getElementById("begruessung").submit();','document.getElementById("begruessung").requestSubmit();','document.getElementById("name").files;','document.getElementById("name").ownerDocument;']){const r=await raw(page,{...p,files:{'main.js':source}},[]);expect(r.at(-1).type).toBe('error');}
 const r=await raw(page,p,[{id:1,type:'commit',values:[{id:1,value:'falsch'}]}]);expect(r.at(-1).type).toBe('error');
});

test('Modellgrenzen: value-Normalisierung, Textarea-dirty und gemeinsame Ereignis-/Schreibgrenze',()=>{
 function create(){const sent=[],core={guard(){},abort(text){throw new Error(text);},registered:fn=>typeof fn==='function',invoke:(fn,args,target)=>Reflect.apply(fn,target,args)};const tree=parseDebugHTML('<form id="f"><input id="n"><textarea id="t">Start</textarea><button id="b">Los</button></form>');const model=installDebugDOM(tree,core,text=>{const data=JSON.parse(text);sent.push(data);return !data.error&&validDOMTree(data);},DOM_LIMITS);const get=id=>model.bound(model.document,'getElementById')(id);return {model,get,sent,tree};}
 const a=create(),n=a.get('n'),t=a.get('t');a.model.ref(n,'value').value='a\r\nb';expect(a.model.ref(n,'value').value).toBe('ab');a.model.ref(t,'textContent').value='Vorlage\r\nB';expect(a.model.ref(t,'value').value).toBe('Vorlage\nB');a.model.ref(t,'value').value='Live';a.model.ref(t,'textContent').value='Anders';expect(a.model.ref(t,'value').value).toBe('Live');a.model.ref(n,'value').value=null;expect(a.model.ref(n,'value').value).toBe('');a.model.ref(n,'value').value=undefined;expect(a.model.ref(n,'value').value).toBe('undefined');
 for(const length of [2047,2048]){a.model.ref(n,'value').value='x'.repeat(length);expect(a.model.ref(n,'value').value).toHaveLength(length);}expect(()=>{a.model.ref(n,'value').value='x'.repeat(2049);}).toThrow('Textgrenze');
 const b=create(),id=find(b.tree,'n').id;let calls=0;for(const type of ['input','change'])b.model.bound(b.get('n'),'addEventListener')(type,()=>calls++);for(let i=0;i<32;i++)b.model.dispatch(id,'commit',[{id,value:String(i)}]);expect(calls).toBe(64);expect(()=>b.model.dispatch(id,'commit',[{id,value:'Ende'}])).toThrow('Ereignisgrenze');expect(calls).toBe(64);
 const c=create();for(let i=0;i<2048;i++)c.model.ref(c.get('n'),'value').value='x';expect(c.sent).toHaveLength(2048);expect(()=>{c.model.ref(c.get('n'),'value').value='x';}).toThrow('Schreibgrenze');
});

test('Controller: Eingaben nur in Idle, eigener Payload, falsche Revision und unzulässige Größen',async()=>{
 const {startDebugger}=await import('../../frontend/src/pilot/debugger.js');const original=globalThis.Worker;
 class Fake{static all=[];constructor(){this.messages=[];Fake.all.push(this);}postMessage(data){this.messages.push(data);}terminate(){this.terminated=true;}}
 globalThis.Worker=Fake;let run;
 try{
  const p=initialFormProject(),a=artifact(p),received=[];run=startDebugger({...p,mode:'dom'},e=>received.push(e));const input={id:1,type:'commit',values:[{id:find(a.dom.tree,'name').id,value:'Original'}]};expect(run.event(input)).toBe(false);Fake.all[0].onmessage({data:{artifact:a}});const worker=Fake.all[1],initial=worker.messages[0],base={session:initial.session,revision:initial.revision};let seq=0;const send=data=>worker.onmessage({data:{...data,...base,seq:++seq}});
  send({type:'running',remaining:1000});const point=a.points.find(x=>x.end),scopes=point.scopes.map(s=>({id:s.id,values:s.names.map(name=>({name,type:'uninitialized',display:'noch nicht initialisiert'}))})),snapshot={point:point.id,truncated:false,scopes,frames:[{id:0,functionId:0,point:point.id,scopes}]};send({type:'final',snapshot});send({type:'idle',remaining:900,timers:{pending:0,nextDelay:null}});
  for(const event of [{...input,values:[{id:2,value:'x'.repeat(2049)}]},{...input,type:'load'},{...input,values:[{id:2,value:'x'},{id:2,value:'y'}]}])expect(run.event(event)).toBe(false);
  expect(run.event(input)).toBe(true);input.values[0].value='VERÄNDERT';const command=worker.messages.at(-1);expect(command.event.values[0].value).toBe('Original');expect(run.event(input)).toBe(false);
  worker.onmessage({data:{type:'error',text:'FREMD',...base,revision:'fremd',seq:seq+1}});expect(received.at(-1).type).toBe('idle');send({type:'ack',commandId:command.commandId});send({type:'running',remaining:900});expect(run.event(input)).toBe(false);send({type:'idle',remaining:850,timers:{pending:0,nextDelay:null}});expect(run.event({id:1,type:'commit',values:[]})).toBe(true);run.stop();expect(worker.terminated).toBe(true);expect(run.event(input)).toBe(false);
 }finally{run?.dispose();globalThis.Worker=original;}
});

test('Enter- und Submit-Semantik: Defaultbutton, readonly, Mehrfeldsperre, Buttontypen und Batch vor Handlern',async({page})=>{
 await open(page);
 const cases=[
  ['<form id="f"><input id="a"><button id="b" disabled>Los</button></form>',[]],
  ['<form id="f"><input id="a" readonly></form>',['submit null']],
  ['<form id="f"><input id="a"><input id="z"></form>',[]],
  ['<form id="f"><input id="a"></form>',['submit null']],
  ['<form id="f"><input id="a"><button id="b" type="button">Kein Submit</button></form>',['submit null']],
  ['<form id="f"><input id="a"><button id="b"><span>Los</span></button></form>',['submit b']],
 ];
 for(const [html,expected] of cases){const t=parseDebugHTML(html),p={schema:1,mode:'module',entry:'main.js',html,files:{'main.js':'document.getElementById("f").addEventListener("submit",e=>{e.preventDefault();console.log(e.type,e.submitter===null?"null":e.submitter.id);});'}};const result=await raw(page,p,[{id:find(t,'a').id,type:'enter'}]);expect(result.at(-1).type,JSON.stringify(result.at(-1))).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(expected);}
 const html='<form id="f"><input id="a"><input id="b"><button id="s">Los</button></form>',tree=parseDebugHTML(html),p={schema:1,mode:'module',entry:'main.js',html,files:{'main.js':'const a=document.getElementById("a");const b=document.getElementById("b");a.addEventListener("input",e=>console.log(a.value,b.value));document.getElementById("f").addEventListener("submit",e=>{e.preventDefault();console.log("submit");});'}};
 const result=await raw(page,p,[{id:1,type:'commit',values:[{id:find(tree,'a').id,value:'A'},{id:find(tree,'b').id,value:'B'}]},{id:find(tree,'s').id}]);expect(result.at(-1).type).toBe('idle');expect(result.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['A B','submit']);
 // Changing value from JavaScript is silent, including primitive trim().
 const program=await raw(page,{...p,files:{'main.js':'const a=document.getElementById("a");a.addEventListener("input",()=>console.log("NICHT"));a.value="  Text  ".trim();console.log(a.value);'}},[]);expect(program.at(-1).type).toBe('idle');expect(program.filter(e=>e.type==='log').map(e=>e.text)).toEqual(['Text']);
});

test('Formvorschau: kein Netz/Navigation, Enter-Defaultbutton, Doppelsperre und mobile Tastatur',async({page})=>{
 await page.setViewportSize({width:390,height:844});const requests=[];page.on('request',r=>{if(r.url().includes('__form_probe__'))requests.push(r.url());});await open(page);await load(page);await start(page);await go(page);await idle(page);await view(page).getByLabel('Dein Name').fill('Tastatur');await event(page,()=>view(page).getByLabel('Dein Name').press('Enter'));await go(page);await idle(page);await expect(view(page).locator('#ausgabe')).toHaveText('Hallo Tastatur!');
 await view(page).getByRole('button',{name:'Begrüßen'}).evaluate(b=>{b.click();b.click();});await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await expect(output(page)).toHaveText('Bestätigt: Tastatur\nFormular verarbeitet: Tastatur\nFormular verarbeitet: Tastatur');
 await view(page).locator('form').evaluate(f=>f.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true})));await expect(status(page)).toContainText('Ereignisstart');await go(page);await idle(page);await expect(page).toHaveURL(/\/frontendkurs\/debugger$/);expect(await view(page).locator('body').evaluate(b=>b.ownerDocument.URL)).toBe('about:srcdoc');expect(requests).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await button(page,'Debuggen stoppen').focus();await page.keyboard.press('Enter');await expect(status(page)).toContainText('gestoppt');await expect(view(page).getByLabel('Dein Name')).toBeDisabled();
});

test('Quellen sichern und neu laden: kein Livewert, kein Eingabeentwurf und passiver Neustart',async({page},info)=>{
 await open(page);const p=initialFormProject();await load(page,p);await start(page);await go(page);await idle(page);await view(page).getByLabel('Dein Name').fill('NUR_LIVE');await event(page,()=>button(page,'Eingabe übernehmen').click());await go(page);await idle(page);const download=page.waitForEvent('download');await button(page,'Modulprojekt exportieren (JSON)').click();const file=await download;const filename=info.outputPath('originale.json');await file.saveAs(filename);const data=JSON.parse(fs.readFileSync(filename,'utf8'));expect(data).toEqual(p);expect(JSON.stringify(data)).not.toContain('NUR_LIVE');await view(page).getByLabel('Dein Name').fill('NUR_ENTWURF');await page.reload();await openDebugger(page);await expect(page.locator('iframe[title="Gestaltete Debugvorschau"]')).toHaveCount(0);await start(page);await go(page);await idle(page);await expect(view(page).getByLabel('Dein Name')).toHaveValue('');await expect(output(page)).toHaveText('Noch keine Ausgabe.');
});

test('Electron: Formular mit Originalquellen, echte Handler und vollständiger Neustart @desktop',async({},info)=>{
 test.skip(process.platform!=='win32','Windows-Electron');test.setTimeout(60000);const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;env.DATABASE_URL='';env.AZUBIPREP_KI_ENABLED='false';env.AZUBIPREP_CHATGPT_ENABLED='false';const profile=info.outputPath('profil');let app;
 const launch=()=>_electron.launch({executablePath:path.join(repo,'desktop/node_modules/electron/dist/electron.exe'),args:[path.join(repo,'desktop'),'--user-data-dir='+profile],env});
 try{app=await launch();let page=await app.firstWindow();await page.waitForURL(/^http:/);let origin=new URL(page.url()).origin;await open(page,origin+'/frontendkurs/debugger');await load(page);await start(page);await go(page);await idle(page);await view(page).getByLabel('Dein Name').fill('Desktop');await event(page,()=>view(page).getByRole('button',{name:'Begrüßen'}).click());await go(page);await idle(page);await expect(view(page).locator('#ausgabe')).toHaveText('Hallo Desktop!');await expect(page.locator('.pilot-status')).toContainText('Gespeichert');await app.close();app=null;
 app=await launch();page=await app.firstWindow();await page.waitForURL(/^http:/);origin=new URL(page.url()).origin;await open(page,origin+'/frontendkurs/debugger');await expect(region(page).getByLabel('HTML für Debugvorschau')).toHaveValue(initialFormProject().html);await expect(page.locator('iframe[title="Gestaltete Debugvorschau"]')).toHaveCount(0);await start(page);await go(page);await idle(page);await expect(view(page).getByLabel('Dein Name')).toHaveValue('');await expect(output(page)).toHaveText('Noch keine Ausgabe.');
 }finally{await app?.close();}
});
