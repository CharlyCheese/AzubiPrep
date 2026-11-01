import { parseHTML, cleanCSS } from './preview.js';
import { resolvePath } from './project.js';
import { VALIDATOR_VERSION } from './course.js';
import { checkCssLesson } from './css-checks.js';
import { checkLayoutLesson } from './layout-checks.js';
import { checkFormLesson } from './form-checks.js';
import { checkJsLesson } from './js-checks.js';

function pageData(files, name) {
  const source = files[name]?.content || '';
  const dom = parseHTML(source);
  const styles = Array.from(dom.querySelectorAll('link[rel~="stylesheet"]')).map((node) => resolvePath(name, node.getAttribute('href'))).filter((path) => path && /\.css$/i.test(path) && files[path]?.kind === 'text');
  return { name, source, dom, styles };
}
export async function validateProject(files, lesson, stand, startPage = 'index.html', { signal, manual = false } = {}) {
  if (lesson.advanced) {
    const { checkAdvanced } = await import('./advanced-runtime.js');
    const results = await checkAdvanced(files, lesson, startPage, signal, manual);
    return { stand, startPage, lesson: lesson.id, lessonVersion: lesson.version, validatorVersion: VALIDATOR_VERSION, manual, at: new Date().toISOString(), results, passed: results.length > 0 && results.every(result => result.passed) };
  }
  if (lesson.jsStep) {
    const results = await checkJsLesson(files, lesson, startPage, signal);
    return { stand, startPage, lesson: lesson.id, lessonVersion: lesson.version, validatorVersion: VALIDATOR_VERSION, at: new Date().toISOString(), results, passed: results.every(result => result.passed) };
  }
  const pages = Object.keys(files).filter((name) => /\.html$/i.test(name)).map((name) => pageData(files, name));
  const first = pages.find((p) => p.name === startPage) || pages[0];
  const dom = first?.dom;
  const nonempty = (node) => Boolean(node?.textContent.trim());
  const linked = (page, target) => Array.from(page.dom.querySelectorAll('a[href]')).some((a) => nonempty(a) && resolvePath(page.name, a.getAttribute('href')) === target.name);
  const image = (page) => Array.from(page.dom.querySelectorAll('img')).some((img) => {
    const name = resolvePath(page.name, img.getAttribute('src'));
    return name?.includes('/') && files[name]?.kind === 'image' && Boolean(img.getAttribute('alt')?.trim());
  });
  const semantic = (page) => ['header', 'nav', 'main', 'footer'].every((tag) => page.dom.querySelector(tag));
  const declarations = first?.styles.flatMap((path) => {
    const sheet = new CSSStyleSheet(); sheet.replaceSync(cleanCSS(files[path].content)); return Array.from(sheet.cssRules);
  }) || [];
  const cssFor = (selector, property, inherited = false, classOnly = false) => declarations.some((rule) => {
    try {
      return Array.from(dom?.querySelectorAll(selector) || []).some((node) => {
        if (classOnly && !(rule.selectorText.match(/\.[a-z_-][\w-]*/gi) || []).some((name) => node.classList.contains(name.slice(1)))) return false;
        if (node.matches(rule.selectorText)) return Boolean(rule.style.getPropertyValue(property));
        if (inherited) {
          for (let parent = node.parentElement; parent; parent = parent.parentElement) if (parent.matches(rule.selectorText) && rule.style.getPropertyValue(property)) return true;
          if (/^(?:body|html)$/.test(rule.selectorText.trim()) && rule.style.getPropertyValue(property)) return true;
        }
        return false;
      });
    } catch { return false; }
  });
  const complete = (p) => /<!doctype\s+html\s*>/i.test(p.source) && /<html\b[^>]*\blang\s*=\s*(?:"[^"]+"|'[^']+'|[^\s>]+)/i.test(p.source) && /<head[\s>]/i.test(p.source) && /<body[\s>]/i.test(p.source) && nonempty(p.dom.querySelector('title')) && p.dom.querySelector('meta[charset="utf-8" i]');
  const checks = {
    document: [pages.length > 0 && pages.every(complete), 'Jede HTML-Seite braucht Dokumenttyp, Sprache, head mit UTF-8/Titel und body.'],
    heading: [nonempty(dom?.querySelector('h1')), 'Eine Hauptüberschrift mit Inhalt fehlt.'],
    paragraph: [nonempty(dom?.querySelector('p')), dom?.querySelector('pre')
      ? 'Du verwendest <pre>. Dieses HTML-Element ist für vorformatierten Text gedacht und erhält Zeilenumbrüche und Leerzeichen, etwa bei einem Vers. Diese Aufgabe übt einen Textabsatz mit <p>; dieses Lernziel ist noch offen. Deinen <pre>-Text darfst du zusätzlich behalten.'
      : 'Diese Aufgabe verlangt einen Textabsatz mit <p> und eigenem Inhalt. Dieses Lernziel ist noch offen.'],
    list: [(dom?.querySelectorAll('ul > li, ol > li').length || 0) >= 2, 'Eine Liste mit mindestens zwei li-Einträgen fehlt.'],
    links: [pages.some((a) => pages.some((b) => a !== b && linked(a, b) && linked(b, a))), 'Zwei HTML-Seiten müssen sich mit verständlichen Linktexten gegenseitig verlinken.'],
    image: [first && image(first), 'Ein vorhandenes Bild aus einem Unterordner mit beschreibendem alt-Text fehlt.'],
    semantic: [first && semantic(first) && nonempty(dom?.querySelector('main h2')), 'header, nav, main mit h2-Unterüberschrift und footer fehlen oder sind unvollständig.'],
    css: [first?.styles.length > 0 && pages.every((p) => p.styles.some((style) => first.styles.includes(style))) && cssFor('h1', 'color', true) && cssFor('p', 'font-family', true), 'Alle HTML-Seiten brauchen dieselbe CSS-Datei; gestalte h1-Farbe und Absatzschrift.'],
    class: [cssFor('[class]', 'background-color', false, true), 'Eine vorhandene Klasse braucht eine passende Klassenregel für background-color.'],
    project: [pages.length >= 2 && pages.every((p) => semantic(p) && image(p) && nonempty(p.dom.querySelector('main p')) && nonempty(p.dom.querySelector('h1'))), 'Jede Projektseite braucht semantische Bereiche, Überschrift, Absatz im main und ein beschreibend ausgezeichnetes Bild.'],
  };
  const success = {
    document: 'Die verlangte Dokumenthülle ist auf allen HTML-Seiten vorhanden.',
    heading: 'Eine Hauptüberschrift mit Inhalt ist vorhanden.',
    paragraph: 'Ein Textabsatz mit <p> und eigenem Inhalt ist vorhanden.',
    list: 'Eine Liste mit mindestens zwei Einträgen ist vorhanden.',
    links: 'Zwei Seiten sind gegenseitig mit verständlichen Linktexten verknüpft.',
    image: 'Ein vorhandenes Bild aus einem Unterordner besitzt einen beschreibenden Alternativtext.',
    semantic: 'Die verlangten semantischen Bereiche und die Unterüberschrift sind vorhanden.',
    css: 'Gemeinsames Stylesheet, Überschriftsfarbe und Absatzschrift sind vorhanden.',
    class: 'Eine vorhandene Klasse wird durch eine passende Klassenregel gestaltet.',
    project: 'Die verlangten Inhalte sind auf beiden Projektseiten vorhanden.',
  };
  const results = lesson.rules.filter(rule => !rule.startsWith('css-') && rule !== 'html-form').map((rule) => ({ rule, passed: Boolean(checks[rule][0]), message: checks[rule][0] ? success[rule] : checks[rule][1], file: first?.name || '(keine HTML-Datei)' }));
  const cssCheck = checkCssLesson(files, lesson, first?.name || startPage);
  if (cssCheck) results.push(cssCheck);
  const layoutCheck = await checkLayoutLesson(files, lesson, first?.name || startPage);
  if (layoutCheck) results.push(...layoutCheck);
  const formCheck = await checkFormLesson(files, lesson, first?.name || startPage);
  if (formCheck) results.push(formCheck);
  if (lesson.rules.includes('document')) {
    const item = results.find((result) => result.rule === 'document');
    if (!item.passed) item.file = pages.filter((p) => !complete(p)).map((p) => p.name).join(', ') || '(keine HTML-Datei)';
  }
  if (lesson.rules.includes('css')) {
    const item = results.find((result) => result.rule === 'css');
    const missing = pages.filter((p) => !p.styles.some((style) => first?.styles.includes(style)));
    if (missing.length) item.file = missing.map((p) => p.name).join(', ');
  }
  if (lesson.rules.includes('project')) {
    const item = results.find((result) => result.rule === 'project');
    const incomplete = pages.filter((p) => !(semantic(p) && image(p) && nonempty(p.dom.querySelector('main p')) && nonempty(p.dom.querySelector('h1'))));
    if (incomplete.length) item.file = incomplete.map((p) => p.name).join(', ');
  }
  // Zusätzliche eindeutige Pfadfehler aller Seiten, auch wenn eine andere Referenz korrekt ist.
  for (const page of pages) for (const node of page.dom.querySelectorAll('a[href], img[src], link[rel~="stylesheet"][href]')) {
    const value = node.getAttribute(node.localName === 'img' ? 'src' : 'href');
    const target = resolvePath(page.name, value);
    if (!target || !files[target]) {
      const near = Object.keys(files).find((name) => name.toLowerCase() === target?.toLowerCase());
      const at = page.source.indexOf(value);
      const line = at >= 0 && at === page.source.lastIndexOf(value) ? page.source.slice(0, at).split('\n').length : null;
      results.push({ rule: 'path', passed: false, file: page.name, line, message: `Ziel fehlt oder ist gesperrt: ${value}.${near ? ` Groß-/Kleinschreibung prüfen: ${near}` : ''}` });
    }
  }
  return { stand, startPage: first?.name, lesson: lesson.id, lessonVersion: lesson.version, validatorVersion: VALIDATOR_VERSION, at: new Date().toISOString(), results, passed: results.every((r) => r.passed) };
}
