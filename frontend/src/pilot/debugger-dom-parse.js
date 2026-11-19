import { parseHTML, Element } from 'linkedom';
import { DOM_ATTRS, DOM_LIMITS, DOM_TAGS, checkDebugHTML, validDOMTree, validDOMAttribute, isTextControl } from './debugger-dom.js';
export function parseDebugHTML(source){
  checkDebugHTML(source);
  // Linkedom normalizes class attributes while parsing. Capture the decoded
  // original at its public setter so className reads retain browser spelling.
  // This synchronous operation lives only in the disposable preparation worker.
  const classes=new WeakMap(),descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'className');let document;
  try{
    Object.defineProperty(Element.prototype,'className',{...descriptor,set(value){classes.set(this,String(value));descriptor.set.call(this,value);}});
    ({document}=parseHTML('<!doctype html><html><body>'+source+'</body></html>'));
  }finally{Object.defineProperty(Element.prototype,'className',descriptor);}
  let id=0,count=0;
  const typeValue=(tag,value)=>value.toLowerCase()||(tag==='input'?'text':'submit');
  // Linkedom is a local parser, never a browser document/resource loader.
  for(const element of document.querySelectorAll('*')){
    const tag=element.localName.toLowerCase();if(!['html','head',...DOM_TAGS].includes(tag))throw new Error('HTML-Element '+tag+' ist im DOM-Pilot nicht unterstützt.');
    for(const attr of element.attributes)if(!validDOMAttribute(tag,attr.name,attr.name==='type'?typeValue(tag,attr.value):attr.value)&&!(attr.name==='disabled'&&['button','input','textarea'].includes(tag))&&!(attr.name==='readonly'&&isTextControl(tag)))throw new Error('HTML-Attribut '+attr.name+' ist im DOM-Pilot nicht unterstützt.');
    if(tag==='textarea'){
      // Linkedom leaves RCDATA entities and the first textarea newline intact.
      // Decode once using its ordinary text parser; literal '<' must remain
      // text, never markup. This is local parsing, not a browser/resource loader.
      const raw=element.textContent.replace(/\r\n?/g,'\n');
      const decoded=parseHTML('<span>'+raw.replace(/</g,'&lt;')+'</span>').document.firstChild.textContent;
      element.textContent=decoded.startsWith('\n')?decoded.slice(1):decoded;
    }
  }
  function walk(node,depth){
    if(++count>DOM_LIMITS.nodes||depth>DOM_LIMITS.depth)throw new Error('HTML-Knoten-/Tiefengrenze erreicht.');
    if(node.nodeType===3)return {text:node.textContent};
    if(node.nodeType!==1)return null;
    const tag=node.localName.toLowerCase(),attrs={};for(const key of [...DOM_ATTRS,'type','for','placeholder','value'])if(node.hasAttribute(key))attrs[key]=key==='class'&&classes.has(node)?classes.get(node):node.getAttribute(key);
    if(Object.hasOwn(attrs,'type'))attrs.type=typeValue(tag,attrs.type);
    const nodeId=++id,children=[...node.childNodes].filter(child=>child.nodeType===1||child.nodeType===3).map(child=>walk(child,depth+1));
    const control=isTextControl(tag)?{value:tag==='input'?(attrs.value||'').replace(/[\r\n]/g,''):node.textContent.replace(/\r\n?/g,'\n'),readOnly:node.hasAttribute('readonly')}:null;
    return {id:nodeId,tag,attrs,disabled:node.hasAttribute('disabled'),children,...(control?{control}:{})};
  }
  const tree=walk(document.body,0);if(!validDOMTree(tree))throw new Error('HTML-Darstellung überschreitet die DOM-Grenzen.');return tree;
}
