import { parseHTML, Element } from 'linkedom';
import { DOM_ATTRS, DOM_LIMITS, DOM_TAGS, checkDebugHTML, validDOMTree } from './debugger-dom.js';
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
  // Linkedom is a local parser, never a browser document/resource loader.
  for(const element of document.querySelectorAll('*')){
    const tag=element.localName.toLowerCase();if(!['html','head',...DOM_TAGS].includes(tag))throw new Error('HTML-Element '+tag+' ist im ersten DOM-Pilot nicht unterstützt.');
    for(const attr of element.attributes)if(!DOM_ATTRS.includes(attr.name)&&!(tag==='button'&&['type','disabled'].includes(attr.name)))throw new Error('HTML-Attribut '+attr.name+' ist im DOM-Pilot nicht unterstützt.');
    if(tag==='button'&&element.hasAttribute('type')&&element.getAttribute('type')!=='button')throw new Error('Bitte Buttons ohne Formularaktion verwenden (type="button").');
  }
  function walk(node,depth){
    if(++count>DOM_LIMITS.nodes||depth>DOM_LIMITS.depth)throw new Error('HTML-Knoten-/Tiefengrenze erreicht.');
    if(node.nodeType===3)return {text:node.textContent};
    if(node.nodeType!==1)return null;
    const attrs={};for(const key of DOM_ATTRS)if(node.hasAttribute(key))attrs[key]=key==='class'&&classes.has(node)?classes.get(node):node.getAttribute(key);
    return {id:++id,tag:node.localName.toLowerCase(),attrs,disabled:node.hasAttribute('disabled'),children:[...node.childNodes].filter(child=>child.nodeType===1||child.nodeType===3).map(child=>walk(child,depth+1))};
  }
  const tree=walk(document.body,0);if(!validDOMTree(tree))throw new Error('HTML-Darstellung überschreitet die DOM-Grenzen.');return tree;
}
