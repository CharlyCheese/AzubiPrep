import { createElement, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { validDOMTree } from '../pilot/debugger-dom.js';
import { prepareDebugCSS } from '../pilot/debugger-css.js';

// This document is constant: no learner HTML, CSS or JavaScript is interpolated.
const FRAME_DOCUMENT = '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; style-src \'unsafe-inline\'; connect-src \'none\'; img-src \'none\'; font-src \'none\'; media-src \'none\'; frame-src \'none\'; object-src \'none\'; worker-src \'none\'; base-uri \'none\'; form-action \'none\'"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body></body></html>';
const BASE_CSS = 'html{color-scheme:light}body{margin:12px;font:16px/1.5 system-ui;color:#17202a;background:#fff;overflow-wrap:anywhere}button{font:inherit;padding:.45rem .8rem}';

function renderNode(node,key,active,styled=false){
  if(Object.hasOwn(node,'text'))return node.text;
  const props={key,'data-debug-node':node.id,title:node.attrs.title,'aria-label':node.attrs['aria-label']};
  if(styled){props.id=node.attrs.id;props.className=node.attrs.class;}
  if(node.tag==='button'){props.type='button';props.disabled=!active||node.disabled;}
  return createElement(node.tag==='body'?'div':node.tag,props,...node.children.map((child,index)=>renderNode(child,child.id??'text-'+index,active,styled)));
}
function treeIds(tree){const ids=new Set();function walk(node){if(!Object.hasOwn(node,'text')){ids.add(node.id);node.children.forEach(walk);}}walk(tree);return ids;}

function StyledFrame({tree,css,active,onClick,cycle}){
  const [doc,setDoc]=useState(null);const frame=useRef(null),latest=useRef(null),blocked=useRef(true);
  latest.current={active,onClick,ids:treeIds(tree)};
  const prepared=useMemo(()=>{try{return prepareDebugCSS(css);}catch(error){return {css:'',warnings:[error.message]};}},[css]);
  useLayoutEffect(()=>{blocked.current=!active;},[active,cycle,doc]);
  useLayoutEffect(()=>{
    if(!doc)return;
    const body=doc.body;
    for(const name of ['id','class','title','aria-label']){if(Object.hasOwn(tree.attrs,name))body.setAttribute(name,tree.attrs[name]);else body.removeAttribute(name);}
    body.setAttribute('data-debug-node',String(tree.id));
  },[doc,tree]);
  useLayoutEffect(()=>{
    if(!doc)return;
    const body=doc.body;
    const click=event=>{
      event.preventDefault();event.stopPropagation();
      const current=latest.current;
      if(blocked.current||!current.active||frame.current?.contentDocument!==doc||event.target?.nodeType!==1)return;
      const element=Element.prototype.closest.call(event.target,'[data-debug-node]');
      if(!element||!Node.prototype.contains.call(body,element))return;
      const id=Number(Element.prototype.getAttribute.call(element,'data-debug-node'));
      if(!current.ids.has(id))return;
      blocked.current=true;current.onClick(id);
    };
    body.addEventListener('click',click,true);
    return()=>{blocked.current=true;body.removeEventListener('click',click,true);};
  },[doc]);
  return <>
    {prepared.warnings.length>0&&<div role="status" aria-label="CSS-Hinweise"><p>Einige Regeln werden in dieser Vorschau nicht verwendet:</p><ul>{prepared.warnings.map(text=><li key={text}>{text}</li>)}</ul></div>}
    <iframe ref={frame} className="debug-dom-frame" title="Gestaltete Debugvorschau" sandbox="allow-same-origin" referrerPolicy="no-referrer" srcDoc={FRAME_DOCUMENT} onLoad={event=>{const next=event.currentTarget.contentDocument;if(next?.body&&next.head)setDoc(next);}}/>
    {doc&&<>{createPortal(<style>{BASE_CSS+'\n'+prepared.css}</style>,doc.head)}{createPortal(tree.children.map((child,index)=>renderNode(child,child.id??'text-'+index,active,true)),doc.body)}</>}
  </>;
}
export default function DebugDOMPreview({tree,active,onClick,css='',cycle=0}){
  if(!tree||!validDOMTree(tree))return null;
  return <section aria-label="DOM-Debugvorschau">
    <h3>HTML-Debugvorschau</h3>
    <p className="small">{active?'Bereit: Klicke ein Element, um seine Klickhandler zu debuggen.':'Klicks sind während Vorbereitung, Ausführung und Pause gesperrt.'} {css.trim()?'Eigene CSS-Regeln gelten ausschließlich im gesonderten Vorschaurahmen.':'Ohne CSS zeigt die Vorschau Struktur und Text.'}</p>
    {css.trim()?<StyledFrame tree={tree} css={css} cycle={cycle} active={active} onClick={onClick}/>:<div className="debug-dom-preview" onClick={event=>{event.preventDefault();event.stopPropagation();if(!active)return;const target=event.target.closest('[data-debug-node]');if(target&&event.currentTarget.contains(target))onClick(Number(target.dataset.debugNode));}}>{renderNode(tree,0,active)}</div>}
    <details><summary>Elementzustand: IDs und Klassen</summary><pre>{JSON.stringify(tree,null,2)}</pre></details>
  </section>;
}
