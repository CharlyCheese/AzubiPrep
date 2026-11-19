import { compileDebugger, compileDebugProject } from './debugger-compiler.js';
import { checkDebugProject, checkDOMProject } from './debugger-project.js';
import { parseDebugHTML } from './debugger-dom-parse.js';
import { prepareDebugTypeScript } from './debugger-typescript.js';
let accepted=false;
self.onmessage=async({data})=>{
  if(accepted)return;accepted=true;
  try{
    let artifact;
    if(['module','dom'].includes(data.draft?.mode)){
      const dom=data.draft.mode==='dom',project=dom?checkDOMProject(data.draft):checkDebugProject(data.draft);
      const typed=Object.keys(project.files).some(name=>/\.tsx?$/.test(name));
      const files=typed?prepareDebugTypeScript(project.files,(await import('virtual:course-types')).default,{react:project.react===true}):project.files;
      artifact=compileDebugProject({...project,mode:'module',files},data.limits,{dom,react:project.react===true});
      // Erasure preserves every original UTF-16 position; displayed/exported
      // sources stay original, never substituted with generated JavaScript.
      artifact.sources=project.files;
      if(typed)artifact.typesChecked=true;
      if(project.react){artifact.dom={tree:parseDebugHTML('<div id="root"></div>'),eventPoint:artifact.points.at(-1).id};}
      if(dom){artifact.dom={tree:parseDebugHTML(project.html),eventPoint:artifact.points.at(-1).id};if(project.fixtures!==undefined)artifact.fixtures=project.fixtures;}
    }else artifact=compileDebugger(data.draft,data.limits);
    self.postMessage({type:'compiled',artifact});
  }
  catch(error){self.postMessage({type:'error',text:String(error.message).slice(0,2000)});}
  self.close();
};
