import { createElement, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { validDOMTree, DOM_LIMITS } from '../pilot/debugger-dom.js';
import { prepareDebugCSS } from '../pilot/debugger-css.js';

// This document is constant: no learner HTML, CSS or JavaScript is interpolated.
const FRAME_DOCUMENT = '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; style-src \'unsafe-inline\'; connect-src \'none\'; img-src \'none\'; font-src \'none\'; media-src \'none\'; frame-src \'none\'; object-src \'none\'; worker-src \'none\'; base-uri \'none\'; form-action \'none\'"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body></body></html>';
const BASE_CSS = 'html{color-scheme:light}body{margin:12px;font:16px/1.5 system-ui;color:#17202a;background:#fff;overflow-wrap:anywhere}button,input,textarea{font:inherit;padding:.45rem .8rem;max-width:100%;box-sizing:border-box}input,textarea{min-width:0}';

function renderNode(node,key,options){
  if(Object.hasOwn(node,'text'))return node.text;
  const {active,styled,drafts,prefix}=options;
  const props={key,'data-debug-node':node.id,title:node.attrs.title,'aria-label':node.attrs['aria-label']};
  if(styled){props.id=node.attrs.id;props.className=node.attrs.class;}
  else if(node.control&&node.attrs.id)props.id=prefix+node.attrs.id;
  if(node.tag==='label')props.htmlFor=node.attrs.for?(styled?'':prefix)+node.attrs.for:undefined;
  // All actual buttons are inert buttons. Submit is a VM model default action.
  if(node.tag==='button'){props.type='button';props.disabled=!active||node.disabled;}
  if(node.tag==='form'){props.autoComplete='off';props.noValidate=true;}
  if(node.control){
    Object.assign(props,{value:drafts[node.id]??node.control.value,disabled:!active||node.disabled,readOnly:node.control.readOnly,placeholder:node.attrs.placeholder,autoComplete:'off',maxLength:DOM_LIMITS.field,onChange:()=>{}});
    if(node.tag==='input')props.type='text';
    return createElement(node.tag,props);
  }
  return createElement(node.tag==='body'?'div':node.tag,props,...node.children.map((child,index)=>renderNode(child,child.id??'text-'+index,options)));
}
function treeNodes(tree){const nodes=new Map();function walk(node){if(!Object.hasOwn(node,'text')){nodes.set(node.id,node);node.children.forEach(walk);}}walk(tree);return nodes;}

// Only trusted parent code handles native events. Source JavaScript never runs
// in this document, and only bounded primitive values cross the VM boundary.
function usePreviewBridge(surface,tree,active,cycle,send,edit){
  const latest=useRef(null),blocked=useRef(true);
  latest.current={active,send,edit,nodes:treeNodes(tree)};
  useLayoutEffect(()=>{blocked.current=!active;},[active,cycle,surface]);
  useLayoutEffect(()=>{
    if(!surface)return;
    const target=event=>{
      if(event.target?.nodeType!==1||!Node.prototype.contains.call(surface,event.target))return null;
      const element=Element.prototype.closest.call(event.target,'[data-debug-node]');
      if(!element||!Node.prototype.contains.call(surface,element))return null;
      const id=Number(Element.prototype.getAttribute.call(element,'data-debug-node'));
      return latest.current.nodes.has(id)?{id,node:latest.current.nodes.get(id),element}:null;
    };
    const dispatch=(id,type)=>{if(blocked.current||!latest.current.active)return;blocked.current=true;if(!latest.current.send(id,type))blocked.current=false;};
    const click=event=>{
      const found=target(event);
      // Native focus/caret/label activation is editing, not a debug dispatch.
      if(found&&(found.node.control||Element.prototype.closest.call(found.element,'label'))){if(!latest.current.active)event.preventDefault();return;}
      event.preventDefault();event.stopPropagation();if(found)dispatch(found.id,'click');
    };
    const input=event=>{
      event.stopPropagation();const found=target(event);
      if(found?.node.control&&!blocked.current&&latest.current.active&&!found.node.disabled&&!found.node.control.readOnly)latest.current.edit(found.id,event.target.value);
    };
    const submit=event=>{event.preventDefault();event.stopPropagation();const found=target(event);if(found?.node.tag==='form')dispatch(found.id,'submit');};
    const keydown=event=>{const found=target(event);if(event.key==='Enter'&&!event.isComposing&&found?.node.tag==='input'){event.preventDefault();event.stopPropagation();dispatch(found.id,'enter');}};
    const handlers={click,input,submit,keydown};for(const [type,handler] of Object.entries(handlers))surface.addEventListener(type,handler,true);
    return()=>{blocked.current=true;for(const [type,handler] of Object.entries(handlers))surface.removeEventListener(type,handler,true);};
  },[surface]);
}

function StyledFrame({tree,css,active,send,edit,drafts,cycle}){
  const [doc,setDoc]=useState(null);
  const prepared=useMemo(()=>{try{return prepareDebugCSS(css);}catch(error){return {css:'',warnings:[error.message]};}},[css]);
  usePreviewBridge(doc?.body??null,tree,active,cycle,send,edit);
  useLayoutEffect(()=>{
    if(!doc)return;
    const body=doc.body;
    for(const name of ['id','class','title','aria-label']){if(Object.hasOwn(tree.attrs,name))body.setAttribute(name,tree.attrs[name]);else body.removeAttribute(name);}
    body.setAttribute('data-debug-node',String(tree.id));
  },[doc,tree]);
  return <>
    {prepared.warnings.length>0&&<div role="status" aria-label="CSS-Hinweise"><p>Einige Regeln werden in dieser Vorschau nicht verwendet:</p><ul>{prepared.warnings.map(text=><li key={text}>{text}</li>)}</ul></div>}
    <iframe className="debug-dom-frame" title="Gestaltete Debugvorschau" sandbox="allow-same-origin" referrerPolicy="no-referrer" srcDoc={FRAME_DOCUMENT} onLoad={event=>{const next=event.currentTarget.contentDocument;if(next?.body&&next.head)setDoc(next);}}/>
    {doc&&<>{createPortal(<style>{BASE_CSS+'\n'+prepared.css}</style>,doc.head)}{createPortal(tree.children.map((child,index)=>renderNode(child,child.id??'text-'+index,{active,styled:true,drafts})),doc.body)}</>}
  </>;
}
function StructuralView({tree,active,cycle,send,edit,drafts,prefix}){
  const [surface,setSurface]=useState(null);
  usePreviewBridge(surface,tree,active,cycle,send,edit);
  return <div ref={setSurface} className="debug-dom-preview">{renderNode(tree,0,{active,styled:false,drafts,prefix})}</div>;
}
function Preview({tree,active,onClick,onEvent,css,cycle}){
  const [drafts,setDrafts]=useState({}),[message,setMessage]=useState('');const prefix=useId()+'-debug-';
  const nodes=treeNodes(tree),controls=[...nodes.values()].filter(node=>node.control);
  const editable=id=>{const node=nodes.get(Number(id));return node?.control&&!node.disabled&&!node.control.readOnly;};
  const pending=Object.entries(drafts).filter(([id,value])=>editable(id)&&nodes.get(Number(id)).control.value!==value).map(([id,value])=>({id:Number(id),value}));
  useLayoutEffect(()=>{setDrafts(old=>{const next=Object.fromEntries(Object.entries(old).filter(([id])=>editable(id)));return Object.keys(next).length===Object.keys(old).length?old:next;});},[tree]);
  const gate=useRef(false);useLayoutEffect(()=>{gate.current=!active;},[active,cycle]);
  function edit(id,value){if(value.length>DOM_LIMITS.field){setMessage('Bitte höchstens 2048 Zeichen pro Eingabe verwenden.');return;}setMessage('');setDrafts(old=>({...old,[id]:value}));}
  function send(id,type){
    if(gate.current||!active)return false;
    gate.current=true;const event={id,type,...(pending.length||type==='commit'?{values:pending}:{})};
    const accepted=onEvent?onEvent(event):type==='click'&&onClick?.(id)!==false;
    if(accepted){setDrafts({});setMessage('');}else{gate.current=false;setMessage('Ereignis konnte nicht übernommen werden. Prüfe die Eingabegrenzen und den Debugstatus.');}
    return !!accepted;
  }
  return <section aria-label="DOM-Debugvorschau">
    <h3>HTML-Debugvorschau</h3>
    <p className="small">{active?'Bereit: Klicke ein Element, um seine Klickhandler zu debuggen.':'Klicks und Eingaben sind während Vorbereitung, Ausführung und Pause gesperrt.'} {css.trim()?'Eigene CSS-Regeln gelten ausschließlich im gesonderten Vorschaurahmen.':'Ohne CSS zeigt die Vorschau Struktur und Text.'}</p>
    {controls.length>0&&<div className="debug-input-help"><p>1. Text als Entwurf eingeben. 2. „Eingabe übernehmen“ wählen. 3. Mit „Weiter“ die Handler verfolgen.</p><details><summary>Unterschied zum normalen Browser</summary><p className="small">Hier sammeln wir den Text zuerst als Entwurf. Übernehmen löst für jedes geänderte Feld einmal <code>input</code> und danach <code>change</code> aus. Im normalen Browser entsteht <code>input</code> bereits beim Tippen, <code>change</code> erst beim Bestätigen bzw. Verlassen. Vorschauklicks und Absenden übernehmen offene Eingaben vorher. Klicks auf Textfelder und Labels dienen hier der Texteingabe. Programmatisches <code>value = …</code> löst keine Eingabeereignisse aus.</p></details><button className="btn btn-ghost" disabled={!active||!pending.length} onClick={()=>send(tree.id,'commit')}>Eingabe übernehmen</button><span role="status" aria-label="Offene Eingaben"> {pending.length} offene Eingabe{pending.length===1?'':'n'}</span></div>}
    {message&&<p role="alert">{message}</p>}
    {css.trim()?<StyledFrame tree={tree} css={css} cycle={cycle} active={active} send={send} edit={edit} drafts={drafts}/>:<StructuralView tree={tree} cycle={cycle} active={active} send={send} edit={edit} drafts={drafts} prefix={prefix}/>}
    <details><summary>Elementzustand: IDs, Klassen und Eingabewerte</summary><pre>{JSON.stringify(tree,null,2)}</pre></details>
  </section>;
}
export default function DebugDOMPreview({tree,active,onClick,onEvent,css='',cycle=0}){
  if(!tree||!validDOMTree(tree))return null;
  return <Preview tree={tree} active={active} onClick={onClick} onEvent={onEvent} css={css} cycle={cycle}/>;
}
