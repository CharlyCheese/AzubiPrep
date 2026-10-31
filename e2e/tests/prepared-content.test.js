import { test, expect } from '@playwright/test';
import vm from 'node:vm';
import { transform, build } from '../../frontend/node_modules/esbuild/lib/main.js';
import { PREPARED_CHAPTERS, PREPARED_LESSONS } from '../../frontend/src/pilot/prepared/catalog.js';
import { reportSolution } from '../../frontend/src/pilot/prepared/ch19.js';
import { validTasksCode } from '../../frontend/src/pilot/prepared/ch22.js';
import { validateTopicsCode } from '../../frontend/src/pilot/prepared/ch24.js';
import { modularCatalogue, brokenCatalogue } from '../../frontend/src/pilot/prepared/ch28.js';
import { typedPlanner } from '../../frontend/src/pilot/prepared/ch29.js';
import { reactPlanner } from '../../frontend/src/pilot/prepared/ch30.js';
import { portalSolution } from '../../frontend/src/pilot/prepared/ch31.js';

// Nur feste redaktionelle Referenzen, niemals eingereichten Lerncode ausführen.
const run = (source, expression) => JSON.parse(vm.runInNewContext(`${source}\nJSON.stringify(${expression})`, {}, { timeout: 1000 }));
test('Inhaltskatalog vollständig, eindeutig und ohne fingierte Prüfungen', () => {
  expect(PREPARED_CHAPTERS.map(item => item.number)).toEqual(Array.from({ length: 14 }, (_, i) => 18 + i));
  expect(PREPARED_LESSONS).toHaveLength(85);
  expect(new Set(PREPARED_LESSONS.map(item => item.id)).size).toBe(85);
  for (const chapter of PREPARED_CHAPTERS) {
    expect(chapter.lessons.length).toBeGreaterThanOrEqual(4);
    for (const lesson of chapter.lessons) {
      for (const field of ['title', 'goal', 'prerequisite', 'example', 'task', 'solution']) expect(lesson[field].trim().length, `${lesson.id}/${field}`).toBeGreaterThan(10);
      expect(lesson.explain.length).toBeGreaterThanOrEqual(2);
      expect(lesson.hints).toHaveLength(2);
      expect(lesson.criteria.length).toBeGreaterThanOrEqual(2);
      expect(lesson.status).toContain('Abnahme offen');
      expect(lesson).not.toHaveProperty('passed');
      expect(lesson.reference).toMatch(/^https:\/\/(developer\.mozilla\.org|developer\.chrome\.com|git-scm\.com|docs\.npmjs\.com|vite\.dev|nodejs\.org|www\.w3\.org|www\.typescriptlang\.org|react\.dev|reactrouter\.com)\//);
    }
  }
});

test('Arrayreferenzen: Leerfälle, Grenzen, numerische Ordnung und Mutation', () => {
  const units = PREPARED_CHAPTERS[0].lessons;
  for (const lesson of units) expect(() => new vm.Script(lesson.solution)).not.toThrow();
  expect(run(units[3].solution, 'positiveQuadrate([-2,0,3,4])')).toEqual([9,16]);
  expect(run(units[4].solution, '[hatOffene([]), fertig([]), ersteOffene([]) === undefined]')).toEqual([false,false,true]);
  expect(run(units[5].solution, 'gesamt([])')).toBe(0);
  expect(run(units[5].solution, '(function(){const list=[{minutes:10},{minutes:2},{minutes:2}];const result=nachDauer(list);return [result.map(x=>x.minutes),list.map(x=>x.minutes),result!==list];})()')).toEqual([[2,2,10],[10,2,2],true]);
  expect(run(units[6].solution, '[0,-1,1.5,NaN,"15"].map(x=>{try{pruefeDauer(x);return false;}catch{return true;}})')).toEqual([true,true,true,true,true]);
});

test('Projektbericht mit neuen Daten, inklusiver Grenze und unveränderter Eingabe', () => {
  expect(run(reportSolution, 'report([],20)')).toEqual({ titles: [], count: 0, minutes: 0 });
  expect(run(reportSolution, '(function(){const tasks=[{title:"A",minutes:10,done:true},{title:"A",minutes:10,done:false},{title:"B",minutes:11,done:false}];const before=JSON.stringify(tasks);return [report(tasks,10),JSON.stringify(tasks)===before];})()')).toEqual([{ titles: ['A'], count: 1, minutes: 10 },true]);
});

test('Taskschema und Katalogschema an allen vereinbarten Grenzen', () => {
  const task = '{id:"1",title:"A",minutes:1,done:false}';
  expect(run(validTasksCode, `[validTasks([]),validTasks(null),validTasks([${task}]),validTasks([${task},${task}])]`)).toEqual([true,false,true,false]);
  for (const minutes of ['0','241','1.5','"20"']) expect(run(validTasksCode, `validTasks([{id:"1",title:"A",minutes:${minutes},done:false}])`)).toBe(false);
  expect(run(validTasksCode, 'validTasks([{id:"1",title:"A",minutes:240,done:false}])')).toBe(true);
  expect(run(validateTopicsCode, '[80,81].map(n=>validTopics([{id:"1",title:"A".repeat(n),category:"Web"}]))')).toEqual([true,false]);
  expect(run(validateTopicsCode, '[40,41].map(n=>validTopics([{id:"1",title:"A",category:"B".repeat(n)}]))')).toEqual([true,false]);
  expect(run(validateTopicsCode, '[validTopics(null),validTopics([]),validTopics([{id:"1",title:" ",category:"Web"}]),validTopics(Array.from({length:201},(_,i)=>({id:String(i),title:"A",category:"Web"})))]')).toEqual([false,true,false,false]);
});

test('Fehlersuchaufgabe deckt OR-Fehler auf; modulare Reparatur hat vollständigen Importgraph', async () => {
  const brokenSelect = brokenCatalogue.slice(brokenCatalogue.indexOf('function selectTopics'), brokenCatalogue.indexOf('function render'));
  const example = '[{id:"x",title:"CSS",category:"Web"}]';
  expect(run(brokenSelect, `selectTopics(${example},"CSS","Netzwerk").length`)).toBe(1);
  const sections = [...modularCatalogue.matchAll(/^\/\/ (model|data|view|request|app)\.js[^\n]*\n/gm)];
  const files = Object.fromEntries(sections.map((match, i) => [`${match[1]}.js`, modularCatalogue.slice(match.index + match[0].length, sections[i + 1]?.index)]));
  const result = await build({ stdin: { contents: 'import "./app.js";', resolveDir: '/' }, bundle: true, write: false, plugins: [{ name: 'course-files', setup(builder) {
    builder.onResolve({ filter: /^\.\// }, args => ({ path: args.path.slice(2), namespace: 'course' }));
    builder.onLoad({ filter: /.*/, namespace: 'course' }, args => ({ contents: files[args.path], loader: 'js' }));
  } }] });
  expect(result.outputFiles[0].text).toContain('Katalog wird geladen');
});

test('TypeScript- und React-Referenzen syntaktisch übersetzbar; keine Typprüfung behauptet', async () => {
  for (const lesson of PREPARED_CHAPTERS.find(item => item.number === 29).lessons) await transform(lesson.solution, { loader: 'ts' });
  for (const source of [typedPlanner, reactPlanner, portalSolution]) expect((await transform(source, { loader: source === typedPlanner ? 'ts' : 'tsx' })).code.length).toBeGreaterThan(100);
});

test('Promise-/HTTP-Referenz unterscheidet Fehler von erfolgreicher Leerquelle', async () => {
  const lesson = PREPARED_CHAPTERS.find(item => item.number === 24).lessons[4];
  const context = vm.createContext({});
  vm.runInContext(lesson.solution, context);
  const evaluate = expression => vm.runInContext(expression, context, { timeout: 1000 });
  expect(await evaluate('loadTopics(async()=>({ok:true,json:async()=>[]})).then(x=>x.length)')).toBe(0);
  for (const adapter of [
    'async()=>({ok:false,status:503})',
    'async()=>({ok:true,json:async()=>null})',
    'async()=>({ok:true,json:async()=>{throw new Error("JSON")}})',
    'async()=>{throw new Error("Netz")}',
  ]) expect(await evaluate(`loadTopics(${adapter}).then(()=>false,()=>true)`)).toBe(true);
});
