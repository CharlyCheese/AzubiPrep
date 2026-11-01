import { compileDebugger, compileDebugProject } from './debugger-compiler.js';
import { checkDOMProject } from './debugger-project.js';
import { parseDebugHTML } from './debugger-dom-parse.js';
let accepted=false;
self.onmessage=({data})=>{
  if(accepted)return;accepted=true;
  try{
    let artifact;
    if(data.draft?.mode==='dom'){const project=checkDOMProject(data.draft);artifact=compileDebugProject({...project,mode:'module'},data.limits,{dom:true});artifact.dom={tree:parseDebugHTML(project.html),eventPoint:artifact.points.at(-1).id};}
    else artifact=data.draft?.mode==='module'?compileDebugProject(data.draft,data.limits):compileDebugger(data.draft,data.limits);
    self.postMessage({type:'compiled',artifact});
  }
  catch(error){self.postMessage({type:'error',text:String(error.message).slice(0,2000)});}
  self.close();
};
