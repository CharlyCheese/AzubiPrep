import packageText from '../../course-template/package.json?raw';
import lockText from '../../course-template/package-lock.json?raw';
import configText from '../../course-template/tsconfig.json?raw';
import readmeText from '../../course-template/README.md?raw';
import modelText from '../../course-template/model.js?raw';
import testsText from '../../course-template/tests/model.test.js?raw';
import mainText from '../../course-template/main.tsx?raw';
import appText from '../../course-template/App.tsx?raw';
import { checkFiles, downloadZip, resolvePath } from './project.js';
import { parseHTML } from './preview.js';

export function advancedTemplate(files) {
  checkFiles(files);
  const file = content => ({kind:'text',content});
  const result = { 'App.tsx':file(appText), 'main.tsx':file(mainText), 'model.js':file(modelText), 'tests/model.test.js':file(testsText), ...files,
    'package.json':file(packageText), 'package-lock.json':file(lockText), 'tsconfig.json':file(configText),
    'VORLAGE.md':file(readmeText), '.gitignore':file('node_modules/\ndist/\n.env*\nlocal-rag/\nlocal-ai/\n*.pdf\n'),
  };
  const src=parseHTML(files['index.html']?.content||'').querySelector('script')?.getAttribute('src');
  const entry=resolvePath('index.html',src);
  if(entry&&/from\s*['"]node:test['"]/.test(files[entry]?.content||'')) {
    result['tests/lernaufgabe.test.js']=file(files[entry].content.replace(/(['"])\.\/(model|data)\.js\1/g,(_match,quote,name)=>quote+'../'+name+'.js'+quote));
    delete result[entry];
    result['index.html']=file('<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Modelltests</title></head><body><main><h1>Modelltests</h1><p>npm test führt tests/lernaufgabe.test.js aus. Die Tests sind kein Browserskript.</p></main></body></html>');
  }
  if(entry&&/\.[jt]sx$/.test(entry)&&!entry.endsWith('main.tsx')) {
    result['index.html']=file(files['index.html'].content.replace(src,'main.tsx'));
    result['main.tsx']=file(mainText.replace("'./App'", JSON.stringify('./'+entry.replace(/\.tsx?$/,''))));
  }
  return checkFiles(result);
}
export function downloadAdvancedTemplate(files){downloadZip(advancedTemplate(files));}
