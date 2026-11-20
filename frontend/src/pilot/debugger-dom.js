export const DOM_LIMITS = Object.freeze({ htmlBytes:16384, nodes:128, depth:16, snapshotBytes:32768, textBytes:16384, field:2048, listeners:128, events:64, writes:2048 });
export const DOM_TAGS = Object.freeze(['body','main','section','article','div','p','span','h1','h2','h3','h4','h5','h6','button','label','ul','ol','li','strong','em','br','hr','form','input','textarea']);
export const DOM_ATTRS = Object.freeze(['id','class','title','aria-label']);
export const isTextControl = tag => tag==='input'||tag==='textarea';
export function validDOMAttribute(tag,key,value){
  if(DOM_ATTRS.includes(key))return true;
  if(key==='for')return tag==='label';
  if(key==='placeholder')return isTextControl(tag);
  if(key==='value')return tag==='input';
  return key==='type'&&(tag==='input'?value==='text':tag==='button'&&['button','submit'].includes(value));
}
// Shared by both sides of the Worker boundary. No arbitrary DOM/event payloads.
export function validDOMEvent(event){
  if(!event||typeof event!=='object'||Array.isArray(event)||Object.keys(event).some(key=>!['id','type','values'].includes(key))||!Number.isSafeInteger(event.id)||event.id<1||event.id>DOM_LIMITS.nodes)return false;
  if(event.type!==undefined&&!['click','commit','enter','submit'].includes(event.type))return false;
  if(event.values===undefined)return event.type!=='commit';
  if(!Array.isArray(event.values)||event.values.length>DOM_LIMITS.nodes)return false;
  const seen=new Set();let bytes=0;
  return event.values.every(item=>{
    if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).length!==2||!Object.hasOwn(item,'id')||!Object.hasOwn(item,'value')||!Number.isSafeInteger(item.id)||item.id<1||item.id>DOM_LIMITS.nodes||seen.has(item.id)||typeof item.value!=='string'||item.value.length>DOM_LIMITS.field)return false;
    seen.add(item.id);bytes+=new TextEncoder().encode(item.value).length;return bytes<=DOM_LIMITS.textBytes;
  });
}
export function checkDebugHTML(html) {
  if(typeof html!=='string'||new TextEncoder().encode(html).length>DOM_LIMITS.htmlBytes)throw new Error('Bitte HTML bis 16 KiB verwenden.');
  return html;
}
export function validDOMTree(tree) {
  const ids=new Set();let count=0,text=0;
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  function walk(node,depth){
    if(!object(node)||++count>DOM_LIMITS.nodes||depth>DOM_LIMITS.depth)return false;
    if(Object.hasOwn(node,'text')){if(Object.keys(node).length!==1||typeof node.text!=='string'||node.text.length>DOM_LIMITS.field)return false;text+=new TextEncoder().encode(node.text).length;return text<=DOM_LIMITS.textBytes;}
    const control=isTextControl(node.tag);
    if(Object.keys(node).length!==(control?6:5)||!Number.isSafeInteger(node.id)||node.id<1||node.id>DOM_LIMITS.nodes||ids.has(node.id)||!DOM_TAGS.includes(node.tag)||node.tag==='body'&&depth!==0||!object(node.attrs)||Object.entries(node.attrs).some(([key,value])=>!validDOMAttribute(node.tag,key,value)||typeof value!=='string'||value.length>DOM_LIMITS.field)||typeof node.disabled!=='boolean'||!['button','input','textarea'].includes(node.tag)&&node.disabled||!Array.isArray(node.children)||node.children.length>DOM_LIMITS.nodes||['br','hr'].includes(node.tag)&&node.children.length)return false;
    if(control){if(!object(node.control)||Object.keys(node.control).length!==2||typeof node.control.value!=='string'||node.control.value.length>DOM_LIMITS.field||typeof node.control.readOnly!=='boolean'||/\r/.test(node.control.value)||node.tag==='input'&&(/\n/.test(node.control.value)||node.children.length)||node.tag==='textarea'&&node.children.some(child=>!Object.hasOwn(child,'text')))return false;text+=new TextEncoder().encode(node.control.value).length;}
    ids.add(node.id);for(const value of Object.values(node.attrs))text+=new TextEncoder().encode(value).length;
    return text<=DOM_LIMITS.textBytes&&node.children.every(child=>walk(child,depth+1));
  }
  return walk(tree,0)&&tree.tag==='body'&&new TextEncoder().encode(JSON.stringify(tree)).length<=DOM_LIMITS.snapshotBytes;
}
export const initialDebugHTML = '<h1>Mein Klickzähler</h1>\n<button id="plus">Eins dazu</button>\n<p id="stand">Stand: 0</p>';
export const initialDOMProject = () => ({schema:1,mode:'module',entry:'main.js',html:initialDebugHTML,files:{'main.js':'const anzeige = document.querySelector("#stand");\nconst button = document.getElementById("plus");\nlet stand = 0;\nbutton.addEventListener("click", event => {\n  stand += 1;\n  anzeige.textContent = "Stand: " + stand;\n  console.log(stand);\n});\n'}});
export const initialFormProject = () => ({schema:1,mode:'module',entry:'main.js',html:'<h1>Eine persönliche Begrüßung</h1>\n<form id="begruessung">\n  <label for="name">Dein Name</label>\n  <input id="name" type="text" placeholder="Zum Beispiel Alex">\n  <button type="submit">Begrüßen</button>\n</form>\n<p id="hinweis">Gib einen Namen ein.</p>\n<p id="ausgabe"></p>',css:'form {display:flex; flex-direction:column; gap:12px; max-width:360px} input, button {font-size:16px; padding:10px} #ausgabe {color:green; font-weight:bold}',files:{'main.js':'const formular = document.getElementById("begruessung");\nconst feld = document.getElementById("name");\nconst hinweis = document.getElementById("hinweis");\nconst ausgabe = document.getElementById("ausgabe");\nfeld.addEventListener("input", event => {\n  hinweis.textContent = "Eingabe: " + event.target.value;\n});\nfeld.addEventListener("change", event => {\n  console.log("Bestätigt:", event.target.value);\n});\nformular.addEventListener("submit", event => {\n  event.preventDefault();\n  const name = feld.value.trim();\n  if (name === "") {\n    ausgabe.textContent = "Bitte gib zuerst deinen Namen ein.";\n  } else {\n    ausgabe.textContent = "Hallo " + name + "!";\n  }\n  console.log("Formular verarbeitet:", name);\n});\n'}});
export const initialElementsProject = () => ({schema:1,mode:'module',entry:'main.js',html:'<h1>Meine Aufgabenliste</h1>\n<form id="formular">\n  <label for="titel">Neue Aufgabe</label>\n  <input id="titel" type="text" placeholder="Zum Beispiel HTML wiederholen">\n  <button type="submit">Aufgabe hinzufügen</button>\n</form>\n<p id="hinweis">Füge deine erste Aufgabe hinzu.</p>\n<ul id="aufgaben"></ul>',css:'form {display:flex; flex-direction:column; gap:10px; max-width:400px} input, button {font-size:16px; padding:10px} ul {padding-left:0; list-style-type:none} .aufgabe {display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; border-width:1px; border-style:solid; border-color:gray; padding:12px; margin-bottom:10px} .aufgabe span {overflow-wrap:anywhere; min-width:0}',files:{'main.js':`const formular = document.getElementById("formular");
const feld = document.getElementById("titel");
const liste = document.getElementById("aufgaben");
const hinweis = document.getElementById("hinweis");
formular.addEventListener("submit", event => {
  event.preventDefault();
  const titel = feld.value.trim();
  if (titel === "") {
    hinweis.textContent = "Bitte gib einen Aufgabentitel ein.";
    return;
  }
  const eintrag = document.createElement("li");
  eintrag.className = "aufgabe";
  const text = document.createElement("span");
  text.textContent = titel;
  const entfernen = document.createElement("button");
  entfernen.type = "button";
  entfernen.textContent = "Entfernen";
  entfernen.addEventListener("click", () => {
    eintrag.remove();
    hinweis.textContent = liste.querySelectorAll("li").length + " Aufgaben";
    console.log("Entfernt:", titel);
  });
  eintrag.append(text, entfernen);
  liste.append(eintrag);
  feld.value = "";
  hinweis.textContent = liste.querySelectorAll("li").length + " Aufgaben";
  console.log("Hinzugefügt:", titel);
});
`}});

// Runs entirely inside QuickJS. Handles have no public properties. All access
// passes the private debugger ref/bound gates, never a host DOM object.
export function installDebugDOM(tree, core, emit, limits, allowedTags=[]) {
  const stringify=JSON.stringify,string=String,define=Object.defineProperty,apply=Reflect.apply;
  const weak=new WeakMap(),get=WeakMap.prototype.get,has=WeakMap.prototype.has,set=WeakMap.prototype.set;
  const nodes=new Map();let writes=0,events=0,listeners=0,nextId=1;
  const fail=text=>{emit(stringify({error:text}));core.abort(text);},guard=()=>core.guard();
  const brand=(handle,value)=>{apply(set,weak,[handle,value]);return handle;};
  const make=value=>brand(Object.create(null),value);
  const read=handle=>apply(get,weak,[handle]);
  const owned=handle=>(typeof handle==='object'&&handle!==null)&&apply(has,weak,[handle]);
  const text=value=>{if(value!==null&&['object','function','symbol'].includes(typeof value))fail('DOM-Text benötigt einen primitiven Wert.');const result=string(value);if(result.length>limits.field)fail('DOM-Textgrenze erreicht.');return result;};
  const textLeaf=value=>({text:value,bytes:byteLength(value)});
  function build(source,parent){
    if(Object.hasOwn(source,'text'))return textLeaf(source.text);
    const node={id:source.id,tag:source.tag,attrs:{...source.attrs},disabled:source.disabled,...(source.control?{control:{...source.control},dirty:false}:{}),parent,children:[],listeners:[],handle:null,classes:null};
    node.handle=make({kind:'node',node});nodes.set(node.id,node);nextId=Math.max(nextId,node.id+1);node.children=source.children.map(child=>build(child,node));return node;
  }
  const root=build(tree,null),document=make({kind:'document'});
  const content=node=>Object.hasOwn(node,'text')?node.text:node.children.map(content).join('');
  const snapshot=node=>Object.hasOwn(node,'text')?{text:node.text}:{id:node.id,tag:node.tag,attrs:{...node.attrs},disabled:node.disabled,...(node.control?{control:{...node.control}}:{}),children:node.children.map(snapshot)};
  const valueText=(node,value)=>node.tag==='input'?text(value).replace(/[\r\n]/g,''):text(value).replace(/\r\n?/g,'\n');
  function byteLength(value){let bytes=0;for(let i=0;i<value.length;i++){const c=value.charCodeAt(i);if(c<128)bytes++;else if(c<2048)bytes+=2;else if(c>=55296&&c<=56319&&i+1<value.length&&value.charCodeAt(i+1)>=56320&&value.charCodeAt(i+1)<=57343){bytes+=4;i++;}else bytes+=3;}return bytes;}
  // The map retains detached element identities/listeners. Count its whole
  // forest, including current text leaves, rather than only the rendered root.
  function checkForest(){
    let count=nodes.size,bytes=0;
    for(const node of nodes.values()){
      let depth=0;for(let at=node.parent;at;at=at.parent)if(++depth>limits.depth)fail('DOM-Tiefengrenze erreicht.');
      const values=Object.values(node.attrs);if(node.control)values.push(node.control.value);
      for(const child of node.children)if(Object.hasOwn(child,'text')){
        count++;if(depth+1>limits.depth)fail('DOM-Tiefengrenze erreicht.');
        if(child.text.length>limits.field)fail('DOM-Textgrenze erreicht.');
        bytes+=child.bytes;
      }
      if(count>limits.nodes)fail('DOM-Knotengrenze erreicht (auch abgetrennte Elemente zählen).');
      for(const value of values){if(value.length>limits.field)fail('DOM-Textgrenze erreicht.');bytes+=byteLength(value);}
      if(bytes>limits.textBytes)fail('DOM-Gesamttextgrenze erreicht (auch abgetrennte Elemente zählen).');
    }
  }
  function connected(node){
    while(node.parent)node=node.parent;
    return node===root;
  }
  function publish(visible=true){
    guard();checkForest();
    if(visible && emit(stringify(snapshot(root)))!==true)fail('DOM-Darstellungsgrenze erreicht.');
  }
  function changed(visible){if(++writes>limits.writes)fail('DOM-Schreibgrenze erreicht.');publish(visible);}
  function elements(node,include=false){const result=[];function walk(n){if(!Object.hasOwn(n,'text')){result.push(n);for(const child of n.children)walk(child);}}if(include)walk(node);else for(const child of node.children)walk(child);return result;}
  function query(target,selector,all){
    selector=text(selector);if(!/^(?:#[a-zA-Z_][\w-]*|\.[a-zA-Z_][\w-]*|[a-zA-Z][a-zA-Z0-9]*)$/.test(selector))fail('Im DOM-Pilot bitte #id, .klasse oder einen Tagnamen verwenden.');
    const list=elements(target.kind==='document'?root:target.node,target.kind==='document').filter(node=>selector[0]==='#'?node.attrs.id===selector.slice(1):selector[0]==='.'?(node.attrs.class||'').split(/[\t\n\f\r ]+/).includes(selector.slice(1)):node.tag===selector.toLowerCase()).map(node=>node.handle);
    return all?list:list[0]||null;
  }
  function token(value){const result=text(value);if(!result||/[\t\n\f\r ]/.test(result))fail('Bitte einen einzelnen Klassennamen verwenden.');return result;}
  function detach(node){if(!node.parent)return;const parent=node.parent;parent.children.splice(parent.children.indexOf(node),1);node.parent=null;}
  function elementArgument(value){const data=owned(value)?read(value):null;if(data?.kind!=='node')fail('Ein eigenes Modellelement erforderlich.');return data.node;}
  function insert(parent,args,replace=false){
    if(['input','textarea','br','hr'].includes(parent.tag))fail('Dieses Modellelement unterstützt keine eingefügten Kinder.');
    const items=args.map(value=>owned(value)?elementArgument(value):textLeaf(text(value)));
    for(const node of items)if(!Object.hasOwn(node,'text')){if(node===root||ancestry(parent).includes(node))fail('Ungültige DOM-Hierarchie: Wurzel oder Vorfahr kann hier nicht eingefügt werden.');}
    // Detach arguments before clearing the target: arguments can be descendants
    // of children that replaceChildren is about to detach. Repeated handles keep
    // only their final position, like conversion through a native fragment.
    const visible=connected(parent)||items.some(node=>!Object.hasOwn(node,'text')&&connected(node));
    for(const node of items)if(!Object.hasOwn(node,'text'))detach(node);
    if(replace){for(const child of parent.children)if(!Object.hasOwn(child,'text'))child.parent=null;parent.children=[];}
    for(const node of items){if(!Object.hasOwn(node,'text')){detach(node);node.parent=parent;}parent.children.push(node);}
    if(items.length||replace)changed(visible);
  }
  function ref(handle,key){
    guard();const target=read(handle);
    return define({},'value',{
      get(){guard();if(target.kind==='document'&&key==='body')return root.handle;
        if(target.kind==='event'){
          const e=target.event;if(key==='type')return e.type;if(key==='target')return e.target.handle;if(key==='currentTarget')return e.current?.handle||null;if(key==='bubbles')return true;if(key==='cancelable')return e.cancelable;if(key==='defaultPrevented')return e.prevented;if(key==='submitter'&&e.type==='submit')return e.submitter?.handle||null;
        }
        if(target.kind==='node'){
          const node=target.node;if(key==='textContent')return content(node);if(key==='id')return node.attrs.id||'';if(key==='className')return node.attrs.class||'';if(key==='tagName')return node.tag.toUpperCase();if(key==='disabled'&&['button','input','textarea'].includes(node.tag))return node.disabled;
          if(key==='parentNode')return node.parent?.handle||null;if(key==='isConnected')return connected(node);
          if(key==='value'&&node.control)return node.control.value;if(key==='readOnly'&&node.control)return node.control.readOnly;if(key==='type'&&node.tag==='button')return node.attrs.type||'submit';if(key==='type'&&node.tag==='input')return 'text';
          if(key==='classList'){if(!node.classes)node.classes=make({kind:'classes',node});return node.classes;}
        }
        fail('Dieser DOM-/Ereigniszugriff ist im Pilot nicht unterstützt.');
      },
      set(value){guard();if(target.kind!=='node')fail('Dieser DOM-/Ereigniswert ist nur lesbar.');const node=target.node;
        if(key==='textContent'){if(['input','br','hr'].includes(node.tag))fail('Dieses Modellelement unterstützt keinen Textinhalt; für input bitte value verwenden.');const next=value===null||value===undefined?'':text(value);for(const child of node.children)if(!Object.hasOwn(child,'text'))child.parent=null;node.children=next?[textLeaf(next)]:[];if(node.tag==='textarea'&&!node.dirty)node.control.value=valueText(node,next);}
        else if(key==='id'||key==='className')node.attrs[key==='id'?'id':'class']=text(value);
        else if(key==='value'&&node.control){node.control.value=valueText(node,value===null?'':value);node.dirty=true;}
        else if(key==='readOnly'&&node.control)node.control.readOnly=!!value;
        else if(key==='disabled'&&['button','input','textarea'].includes(node.tag))node.disabled=!!value;
        else if(key==='type'&&['button','input'].includes(node.tag)){const type=text(value).toLowerCase()||(node.tag==='input'?'text':'submit');if(node.tag==='input'?type!=='text':!['button','submit'].includes(type))fail('Dieser Eingabe-/Buttontyp ist im Modell nicht unterstützt.');node.attrs.type=type;}
        else fail('Diese DOM-Zuweisung ist nicht unterstützt.');changed(connected(node));
      },
    });
  }
  function bound(handle,key){
    guard();const target=read(handle),kind=target.kind;
    const methods=kind==='document'?['querySelector','querySelectorAll','getElementById','createElement']:kind==='node'?['querySelector','querySelectorAll','addEventListener','removeEventListener','append','appendChild','replaceChildren','remove','removeChild']:kind==='classes'?['add','remove','toggle','contains']:kind==='event'?['preventDefault','stopPropagation','stopImmediatePropagation']:[];
    if(!methods.includes(key))fail('Diese DOM-/Ereignismethode ist nicht unterstützt.');
    return (...args)=>{
      guard();if(key==='querySelector'||key==='querySelectorAll'){if(args.length!==1)fail('Ein Selektor erforderlich.');return query(target,args[0],key==='querySelectorAll');}
      if(key==='getElementById'){if(args.length!==1)fail('Eine Element-ID erforderlich.');const id=text(args[0]);return id?elements(root,true).find(node=>node.attrs.id===id)?.handle||null:null;}
      if(key==='createElement'){
        if(args.length!==1)fail('createElement benötigt genau einen unterstützten HTML-Tagnamen ohne Optionen.');
        const tag=text(args[0]).toLowerCase();if(tag==='body'||!allowedTags.includes(tag))fail('Dieses HTML-Element darf im DOM-Modell nicht erzeugt werden.');
        if(nodes.size>=limits.nodes||nextId>limits.nodes)fail('DOM-Knotengrenze erreicht (auch abgetrennte Elemente zählen).');
        const node=build({id:nextId,tag,attrs:{},disabled:false,children:[],...(['input','textarea'].includes(tag)?{control:{value:'',readOnly:false}}:{})},null);changed(false);return node.handle;
      }
      if(kind==='node'&&['append','appendChild','replaceChildren','remove','removeChild'].includes(key)){
        const node=target.node;
        if(key==='remove'){if(args.length)fail('remove ohne Argumente verwenden.');if(node===root)fail('Die feste DOM-Modellwurzel kann nicht entfernt werden.');if(node.parent){const visible=connected(node);detach(node);changed(visible);}return;}
        if(key==='removeChild'){if(args.length!==1)fail('removeChild benötigt genau ein eigenes Kindelement.');const child=elementArgument(args[0]);if(child.parent!==node)fail('removeChild benötigt ein direktes Kindelement.');detach(child);changed(connected(node));return child.handle;}
        if(key==='appendChild'){if(args.length!==1)fail('appendChild benötigt genau ein eigenes Element.');const child=elementArgument(args[0]);insert(node,[child.handle]);return child.handle;}
        insert(node,args,key==='replaceChildren');return;
      }
      if(kind==='classes'){
        const node=target.node,current=[...new Set((node.attrs.class||'').split(/[\t\n\f\r ]+/).filter(Boolean))],tokens=(key==='toggle'?args.slice(0,1):args).map(token);
        if(key==='contains'){if(args.length!==1)fail('Ein Klassenname erforderlich.');return current.includes(tokens[0]);}
        if(key==='toggle'){
          if(args.length<1||args.length>2)fail('Klassentoggle benötigt Namen und optional Boolean.');const name=tokens[0],next=args.length===2?!!args[1]:!current.includes(name),index=current.indexOf(name);if(next&&index>=0||!next&&index<0)return next;if(next)current.push(name);else current.splice(index,1);node.attrs.class=text(current.join(' '));changed(connected(node));return next;
        }
        if(!tokens.length&&!Object.hasOwn(node.attrs,'class'))return;
        for(const name of tokens){const index=current.indexOf(name);if(key==='add'&&index<0)current.push(name);if(key==='remove'&&index>=0)current.splice(index,1);}node.attrs.class=text(current.join(' '));changed(connected(node));return;
      }
      if(kind==='event'){if(args.length)fail('Ereignismethode ohne Argumente verwenden.');if(key==='preventDefault'){if(target.event.cancelable)target.event.prevented=true;}else{target.event.stopped=true;if(key==='stopImmediatePropagation')target.event.immediate=true;}return;}
      if(args.length<2||args.length>3||!['click','input','change','submit'].includes(args[0])||args.length===3&&args[2]!==false&&args[2]!==undefined||!core.registered(args[1]))fail('Nur click/input/change/submit mit eigener registrierter Funktion ohne Listeneroptionen ist unterstützt.');
      const node=target.node,type=args[0],fn=args[1],existing=node.listeners.find(item=>item.active&&item.fn===fn&&item.type===type);
      if(key==='addEventListener'){if(existing)return;if(++listeners>limits.listeners)fail('Listenergrenze erreicht.');node.listeners.push({type,fn,active:true});}
      else if(existing)existing.active=false;
    };
  }
  function ancestry(node){const path=[];for(let at=node;at;at=at.parent)path.push(at);return path;}
  function pathOf(node){const path=ancestry(node);if(path.at(-1)!==root)fail('Element gehört nicht mehr zur Vorschau.');return path;}
  function fire(node,type,submitter=null){
    guard();if(++events>limits.events)fail('Klickgrenze/Ereignisgrenze erreicht.');const path=ancestry(node);
    const state={type,cancelable:type==='click'||type==='submit',submitter,target:node,current:null,prevented:false,stopped:false,immediate:false},event=make({kind:'event',event:state});
    try{for(const current of path){state.current=current;for(const item of current.listeners.slice()){if(item.active&&item.type===type)core.invoke(item.fn,[event],current.handle);if(state.immediate)break;}if(state.stopped)break;}}finally{state.current=null;}
    return state;
  }
  function dispatch(id,type='click',values=[]){
    guard();const node=nodes.get(id);if(!node)fail('Unbekanntes Vorschauziel.');const path=pathOf(node);
    // Validate the whole batch before applying the first value. Limits/schema
    // are additionally checked in both host/Worker protocol endpoints.
    const edits=values.map(item=>{const field=nodes.get(item.id);if(!field?.control||field.disabled||field.control.readOnly)fail('Dieses Feld kann keine Nutzereingabe übernehmen.');pathOf(field);return {field,value:valueText(field,item.value)};});
    const changedFields=[];
    for(const {field,value} of edits){if(field.control.value!==value){field.control.value=value;field.dirty=true;changed(true);changedFields.push(field);}}
    for(const field of changedFields){fire(field,'input');fire(field,'change');}
    if(type==='commit')return;
    if(type==='submit'){if(node.tag!=='form')fail('Submit benötigt ein Formular.');fire(node,'submit');return;}
    if(type==='enter'){
      if(node.tag!=='input'||node.disabled)return;
      const form=path.find(item=>item.tag==='form');if(!form)return;
      const button=elements(form).find(item=>item.tag==='button'&&(item.attrs.type||'submit')==='submit');
      if(button){if(!button.disabled)dispatch(button.id);}else if(elements(form).filter(item=>item.tag==='input').length===1)fire(form,'submit');return;
    }
    if(type!=='click')fail('Unbekannter Ereignistyp.');
    if(path.some(item=>['button','input','textarea'].includes(item.tag)&&item.disabled))return;
    const event=fire(node,'click'),button=path.find(item=>item.tag==='button');
    if(!event.prevented&&button&&!button.disabled&&(button.attrs.type||'submit')==='submit'){
      const current=ancestry(button),form=current.at(-1)===root&&current.find(item=>item.tag==='form');if(form)fire(form,'submit',button);
    }
  }
  return {document,has:owned,ref,bound,dispatch,publish};
}

