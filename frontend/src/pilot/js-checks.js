import { parseHTML } from './preview.js';
import { resolvePath } from './project.js';
import { checkJsDraft } from './js-draft.js';
import { JS_EXERCISES } from './js-exercises.js';
import { evaluateJs } from './js-runner.js';

export function jsProgram(files, entry) {
  const source = files[entry]?.content;
  if (!/\.html$/i.test(entry || '') || typeof source !== 'string') throw new Error('Wähle eine vorhandene HTML-Projektstartseite.');
  const dom = parseHTML(source);
  const scripts = Array.from(dom.querySelectorAll('script'));
  const script = scripts[0];
  if (scripts.length !== 1 || !script.hasAttribute('defer') || script.hasAttribute('async') || !['', 'text/javascript', 'application/javascript'].includes(script.getAttribute('type') || '') || script.textContent.trim()) throw new Error('Für diese Aufgabe genau ein externes script mit src und defer, ohne Inline-Code, async oder Modulmodus verwenden.');
  const head = source.replace(/<!--[\s\S]*?-->/g, '').match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i);
  if (!head || !Array.from(parseHTML(head[1]).querySelectorAll('script')).some(node => node.getAttribute('src') === script.getAttribute('src'))) throw new Error('Das externe script gehört in dieser Aufgabe in den head.');
  const path = resolvePath(entry, script.getAttribute('src'));
  if (!path || !/\.js$/i.test(path) || files[path]?.kind !== 'text') throw new Error('Der relative script-src-Pfad muss auf deine vorhandene .js-Datei zeigen.');
  const draft = checkJsDraft({ schema: 1, name: path.split('/').at(-1), source: files[path].content });
  return { path, draft };
}

export async function checkJsLesson(files, lesson, entry, signal) {
  let program;
  try { program = jsProgram(files, entry); }
  catch (error) { return [{ rule: 'js-link', passed: false, file: entry, message: error.message }]; }
  const results = [{ rule: 'js-link', passed: true, file: entry, message: `Externe Datei ${program.path} mit defer verknüpft. Ausführung nur in der Kurskonsole.` }];
  const exercise = JS_EXERCISES[lesson.id];
  for (let caseIndex = 0; caseIndex < exercise.inputs.length; caseIndex++) {
    const result = await evaluateJs(program.draft, { id: lesson.id, caseIndex, check: true }, signal);
    const ran = result.reason === 'success';
    results.push({ rule: 'js-run', passed: ran, file: program.path, message: ran ? `Test ${caseIndex + 1}: Programm und Prüfaufrufe ohne Ausführungsfehler beendet.` : `Test ${caseIndex + 1}: ${result.reason === 'time' ? 'Zeitgrenze erreicht.' : result.reason === 'check-jobs' ? 'Nachlaufende Arbeit im Prüfaufruf ist für diese Aufgabe nicht zugelassen.' : result.reason === 'check' ? 'Prüfaufruf fehlgeschlagen; geforderte Namen und Rückgabewege prüfen.' : 'Ausführung beendet oder fehlerhaft.'} ${result.details || ''}` });
    results.push({ rule: 'js-result', passed: ran && result.checked, file: program.path, message: ran && result.checked ? `Test ${caseIndex + 1}: Werte, Ausgabetypen und geforderte Bindungen passen.` : `Test ${caseIndex + 1}: Vergleiche Aufgabe, Namen, Ausgabetypen und Reihenfolge.${lesson.chapter === 18 ? ' Rückgaben auch bei leeren Listen prüfen, Eingaben unverändert lassen und Fehlerfälle gezielt behandeln.' : lesson.chapter === 16 ? ' Funktionen auch mit anderen Argumenten aufrufen, Rückgaben und Anzahl der Konsolenmeldungen prüfen.' : ' Jede geforderte Ausgabe einzeln protokollieren.'} Eingaben: ${JSON.stringify(exercise.inputs[caseIndex])}.` });
    if (!ran || !result.checked) break;
  }
  return results;
}
