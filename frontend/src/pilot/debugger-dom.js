export const DOM_LIMITS = Object.freeze({ htmlBytes:16384, nodes:128, depth:16, snapshotBytes:32768, textBytes:16384, field:2048, listeners:128, events:64, writes:2048 });
export const DOM_TAGS = Object.freeze(['body','main','section','article','div','p','span','h1','h2','h3','h4','h5','h6','button','label','ul','ol','li','strong','em','br','hr']);
export const DOM_ATTRS = Object.freeze(['id','class','title','aria-label']);
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
    if(Object.keys(node).length!==5||!Number.isSafeInteger(node.id)||node.id<1||node.id>DOM_LIMITS.nodes||ids.has(node.id)||!DOM_TAGS.includes(node.tag)||!object(node.attrs)||Object.keys(node.attrs).some(key=>!DOM_ATTRS.includes(key))||Object.values(node.attrs).some(value=>typeof value!=='string'||value.length>DOM_LIMITS.field)||typeof node.disabled!=='boolean'||node.tag!=='button'&&node.disabled||!Array.isArray(node.children)||node.children.length>DOM_LIMITS.nodes)return false;
    ids.add(node.id);for(const value of Object.values(node.attrs))text+=new TextEncoder().encode(value).length;
    return text<=DOM_LIMITS.textBytes&&node.children.every(child=>walk(child,depth+1));
  }
  return walk(tree,0)&&tree.tag==='body'&&new TextEncoder().encode(JSON.stringify(tree)).length<=DOM_LIMITS.snapshotBytes;
}
export const initialDebugHTML = '<h1>Mein Klickzähler</h1>\n<button id="plus">Eins dazu</button>\n<p id="stand">Stand: 0</p>';
export const initialDOMProject = () => ({schema:1,mode:'module',entry:'main.js',html:initialDebugHTML,files:{'main.js':'const anzeige = document.querySelector("#stand");\nconst button = document.getElementById("plus");\nlet stand = 0;\nbutton.addEventListener("click", event => {\n  stand += 1;\n  anzeige.textContent = "Stand: " + stand;\n  console.log(stand);\n});\n'}});

// Runs entirely inside QuickJS. Handles have no public properties. All access
// passes the private debugger ref/bound gates, never a host DOM object.
export function installDebugDOM(tree, core, emit, limits) {
  const stringify=JSON.stringify,string=String,define=Object.defineProperty,apply=Reflect.apply;
  const weak=new WeakMap(),get=WeakMap.prototype.get,has=WeakMap.prototype.has,set=WeakMap.prototype.set;
  const nodes=new Map();let writes=0,events=0,listeners=0;
  const fail=text=>{emit(stringify({error:text}));core.abort(text);},guard=()=>core.guard();
  const brand=(handle,value)=>{apply(set,weak,[handle,value]);return handle;};
  const make=value=>brand(Object.create(null),value);
  const read=handle=>apply(get,weak,[handle]);
  const owned=handle=>(typeof handle==='object'&&handle!==null)&&apply(has,weak,[handle]);
  const text=value=>{if(value!==null&&['object','function','symbol'].includes(typeof value))fail('DOM-Text benötigt einen primitiven Wert.');const result=string(value);if(result.length>limits.field)fail('DOM-Textgrenze erreicht.');return result;};
  function build(source,parent){
    if(Object.hasOwn(source,'text'))return {text:source.text};
    const node={id:source.id,tag:source.tag,attrs:{...source.attrs},disabled:source.disabled,parent,children:[],listeners:[],handle:null,classes:null};
    node.handle=make({kind:'node',node});nodes.set(node.id,node);node.children=source.children.map(child=>build(child,node));return node;
  }
  const root=build(tree,null),document=make({kind:'document'});
  const content=node=>Object.hasOwn(node,'text')?node.text:node.children.map(content).join('');
  const snapshot=node=>Object.hasOwn(node,'text')?{text:node.text}:{id:node.id,tag:node.tag,attrs:{...node.attrs},disabled:node.disabled,children:node.children.map(snapshot)};
  function publish(){guard();if(emit(stringify(snapshot(root)))!==true)fail('DOM-Darstellungsgrenze erreicht.');}
  function changed(){if(++writes>limits.writes)fail('DOM-Schreibgrenze erreicht.');publish();}
  function elements(node,include=false){const result=[];function walk(n){if(!Object.hasOwn(n,'text')){result.push(n);for(const child of n.children)walk(child);}}if(include)walk(node);else for(const child of node.children)walk(child);return result;}
  function query(target,selector,all){
    selector=text(selector);if(!/^(?:#[a-zA-Z_][\w-]*|\.[a-zA-Z_][\w-]*|[a-zA-Z][a-zA-Z0-9]*)$/.test(selector))fail('Im DOM-Pilot bitte #id, .klasse oder einen Tagnamen verwenden.');
    const list=elements(target.kind==='document'?root:target.node,target.kind==='document').filter(node=>selector[0]==='#'?node.attrs.id===selector.slice(1):selector[0]==='.'?(node.attrs.class||'').split(/[\t\n\f\r ]+/).includes(selector.slice(1)):node.tag===selector.toLowerCase()).map(node=>node.handle);
    return all?list:list[0]||null;
  }
  function token(value){const result=text(value);if(!result||/[\t\n\f\r ]/.test(result))fail('Bitte einen einzelnen Klassennamen verwenden.');return result;}
  function ref(handle,key){
    guard();const target=read(handle);
    return define({},'value',{
      get(){guard();if(target.kind==='document'&&key==='body')return root.handle;
        if(target.kind==='event'){
          const e=target.event;if(key==='type')return 'click';if(key==='target')return e.target.handle;if(key==='currentTarget')return e.current?.handle||null;if(key==='bubbles')return true;if(key==='defaultPrevented')return e.prevented;
        }
        if(target.kind==='node'){
          const node=target.node;if(key==='textContent')return content(node);if(key==='id')return node.attrs.id||'';if(key==='className')return node.attrs.class||'';if(key==='tagName')return node.tag.toUpperCase();if(key==='disabled'&&node.tag==='button')return node.disabled;
          if(key==='classList'){if(!node.classes)node.classes=make({kind:'classes',node});return node.classes;}
        }
        fail('Dieser DOM-/Ereigniszugriff ist im Pilot nicht unterstützt.');
      },
      set(value){guard();if(target.kind!=='node')fail('Dieser DOM-/Ereigniswert ist nur lesbar.');const node=target.node;
        if(key==='textContent'){const valueText=value===null||value===undefined?'':text(value);for(const child of node.children)if(!Object.hasOwn(child,'text'))child.parent=null;node.children=valueText?[{text:valueText}]:[];}
        else if(key==='id'||key==='className')node.attrs[key==='id'?'id':'class']=text(value);
        else if(key==='disabled'&&node.tag==='button')node.disabled=!!value;
        else fail('Diese DOM-Zuweisung ist nicht unterstützt.');changed();
      },
    });
  }
  function bound(handle,key){
    guard();const target=read(handle),kind=target.kind;
    const methods=kind==='document'?['querySelector','querySelectorAll','getElementById']:kind==='node'?['querySelector','querySelectorAll','addEventListener','removeEventListener']:kind==='classes'?['add','remove','toggle','contains']:kind==='event'?['preventDefault','stopPropagation','stopImmediatePropagation']:[];
    if(!methods.includes(key))fail('Diese DOM-/Ereignismethode ist nicht unterstützt.');
    return (...args)=>{
      guard();if(key==='querySelector'||key==='querySelectorAll'){if(args.length!==1)fail('Ein Selektor erforderlich.');return query(target,args[0],key==='querySelectorAll');}
      if(key==='getElementById'){if(args.length!==1)fail('Eine Element-ID erforderlich.');const id=text(args[0]);return id?elements(root,true).find(node=>node.attrs.id===id)?.handle||null:null;}
      if(kind==='classes'){
        const node=target.node,current=[...new Set((node.attrs.class||'').split(/[\t\n\f\r ]+/).filter(Boolean))],tokens=(key==='toggle'?args.slice(0,1):args).map(token);
        if(key==='contains'){if(args.length!==1)fail('Ein Klassenname erforderlich.');return current.includes(tokens[0]);}
        if(key==='toggle'){
          if(args.length<1||args.length>2)fail('Klassentoggle benötigt Namen und optional Boolean.');const name=tokens[0],next=args.length===2?!!args[1]:!current.includes(name),index=current.indexOf(name);if(next&&index>=0||!next&&index<0)return next;if(next)current.push(name);else current.splice(index,1);node.attrs.class=text(current.join(' '));changed();return next;
        }
        if(!tokens.length&&!Object.hasOwn(node.attrs,'class'))return;
        for(const name of tokens){const index=current.indexOf(name);if(key==='add'&&index<0)current.push(name);if(key==='remove'&&index>=0)current.splice(index,1);}node.attrs.class=text(current.join(' '));changed();return;
      }
      if(kind==='event'){if(args.length)fail('Ereignismethode ohne Argumente verwenden.');if(key==='preventDefault')target.event.prevented=true;else{target.event.stopped=true;if(key==='stopImmediatePropagation')target.event.immediate=true;}return;}
      if(args.length<2||args.length>3||args[0]!=='click'||args.length===3&&args[2]!==false&&args[2]!==undefined||!core.registered(args[1]))fail('Nur click mit eigener registrierter Funktion ohne Listeneroptionen ist unterstützt.');
      const node=target.node,fn=args[1],existing=node.listeners.find(item=>item.active&&item.fn===fn);
      if(key==='addEventListener'){if(existing)return;if(++listeners>limits.listeners)fail('Listenergrenze erreicht.');node.listeners.push({fn,active:true});}
      else if(existing)existing.active=false;
    };
  }
  function dispatch(id){
    guard();if(++events>limits.events)fail('Klickgrenze erreicht.');const node=nodes.get(id);if(!node)fail('Unbekanntes Vorschauziel.');
    const path=[];for(let at=node;at;at=at.parent)path.push(at);if(path.at(-1)!==root)fail('Element gehört nicht mehr zur Vorschau.');if(path.some(item=>item.tag==='button'&&item.disabled))return;
    const state={target:node,current:null,prevented:false,stopped:false,immediate:false},event=make({kind:'event',event:state});
    try{for(const current of path){state.current=current;for(const item of current.listeners.slice()){if(item.active)core.invoke(item.fn,[event],current.handle);if(state.immediate)break;}if(state.stopped)break;}}finally{state.current=null;}
  }
  return {document,has:owned,ref,bound,dispatch,publish};
}

