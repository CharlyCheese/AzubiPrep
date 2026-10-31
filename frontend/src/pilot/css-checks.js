import { buildPreview, cleanCSS, parseHTML } from './preview.js';
import { resolvePath } from './project.js';

// Der Browser entscheidet die Kaskade. Kein eigener, unvollständiger CSS-Parser
// und kein Ausführen des eingereichten Quelltexts im Anwendungsdokument.
export function checkCssLesson(files, lesson, entry) {
  const messages = {
    'css-selectors': 'Nutze Selektorliste, Nachfahren- und Kindselektor. Prüfe navy für h1/h2 und main-Absätze, maroon im footer, lightyellow am direkten main-Absatz und Transparenz am verschachtelten Absatz.',
    'css-order': 'Behalte zwei normale .hinweis-Farbregeln mit navy und maroon. Der Hinweisabsatz muss durch die später stehende navy-Regel navy werden.',
    'css-specificity': 'Ein eindeutiger Absatz #einstieg.hinweis muss durch die frühere navy-ID-Regel die spätere maroon-Klassenregel überstimmen.',
    'css-inheritance': 'main braucht navy, serif und lightyellow. Sein direkter Absatz muss Farbe/Schrift erben; ein enthaltenes em braucht direkt maroon und einen transparenten eigenen Hintergrund.',
    'css-transfer': 'Prüfe die Vererbung und das maroon-em auf beiden Seiten: main in navy/serif/lightyellow, keine direkten Farb-/Schriftregeln am jeweiligen Übungsabsatz, transparenter em-Hintergrund.',
  };
  const ruleId = lesson.rules.find(rule => Object.hasOwn(messages, rule));
  if (!ruleId) return null;
  const pages = ruleId === 'css-transfer' ? Object.keys(files).filter(name => /\.html$/i.test(name)) : [entry];
  const duplicateIds = ruleId === 'css-specificity' ? Object.keys(files).filter(name => /\.html$/i.test(name) && parseHTML(files[name]?.content || '').querySelectorAll('[id="einstieg"]').length > 1) : [];
  let passed = pages.length > 0 && !duplicateIds.length;
  const failed = [...duplicateIds];
  for (const page of pages) {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.setAttribute('sandbox', 'allow-same-origin'); // absichtlich ohne allow-scripts
    frame.setAttribute('aria-hidden', 'true');
    frame.title = 'Interne CSS-Pflichtprüfung';
    try {
      const source = files[page]?.content || '';
      const original = parseHTML(source);
      const rules = Array.from(original.querySelectorAll('link[rel~="stylesheet"]')).flatMap(link => {
        const path = resolvePath(page, link.getAttribute('href'));
        const file = files[path];
        if (!/\.css$/i.test(path || '') || file?.kind !== 'text') return [];
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(cleanCSS(file.content));
        return Array.from(sheet.cssRules);
      });
      // Ausschließlich dieselbe bereinigte, netzwerklose Vorschau wie im Editor.
      // CSP sperrt zusätzlich Skripte, Formulare und Fremdressourcen.
      const preview = buildPreview(files, page);
      document.body.append(frame);
      const doc = frame.contentDocument;
      doc.open(); doc.write(preview.html); doc.close();
      const win = frame.contentWindow;
      const all = selector => Array.from(doc.querySelectorAll(selector));
      const value = (node, prop) => node ? win.getComputedStyle(node).getPropertyValue(prop) : '';
      const navy = node => value(node, 'color') === 'rgb(0, 0, 128)';
      const maroon = node => value(node, 'color') === 'rgb(128, 0, 0)';
      const yellow = node => value(node, 'background-color') === 'rgb(255, 255, 224)';
      const clear = node => value(node, 'background-color') === 'rgba(0, 0, 0, 0)';
      const matches = (node, selector) => { try { return Boolean(node?.matches(selector)); } catch { return false; } };
      const direct = (node, prop) => rules.some(rule => matches(node, rule.selectorText) && rule.style?.getPropertyValue(prop));
      const selectors = rule => rule.selectorText.split(',').map(part => part.trim());
      const coloredRules = rules.filter(rule => rule.style?.color);
      const normal = !original.querySelector('[style], style') && rules.every(rule => rule.type === CSSRule.STYLE_RULE && Array.from(rule.style).every(prop => !rule.style.getPropertyPriority(prop)));
      // Bei gleicher Endfarbe könnte eine andere Regel die Arbeit übernehmen.
      // Eine kurzzeitige Testfarbe belegt, dass DIESE Deklaration entscheidet.
      // Die Regeln stehen in derselben Reihenfolge wie in buildPreview().
      const controls = (rule, prop, nodes) => {
        const live = doc.styleSheets[0]?.cssRules[rules.indexOf(rule)]?.style;
        if (!live || !nodes.length || nodes.some(node => !node)) return false;
        const before = live.getPropertyValue(prop);
        const priority = live.getPropertyPriority(prop);
        try {
          live.setProperty(prop, 'fuchsia', priority);
          return nodes.every(node => value(node, prop) === 'rgb(255, 0, 255)');
        } finally { live.setProperty(prop, before, priority); }
      };
      const withoutColor = (rule, check) => {
        const live = doc.styleSheets[0]?.cssRules[rules.indexOf(rule)]?.style;
        if (!live) return false;
        const before = live.color; const priority = live.getPropertyPriority('color');
        try { live.removeProperty('color'); return check(); }
        finally { live.setProperty('color', before, priority); }
      };
      const intro = doc.querySelector('main > p');
      let ok = false;
      if (ruleId === 'css-selectors') {
        const h1 = doc.querySelector('h1'); const h2 = doc.querySelector('h2');
        const mainParagraphs = all('main p'); const foot = all('footer p'); const nested = all('main section p');
        const group = coloredRules.some(rule => selectors(rule).some(s => matches(h1, s) && !matches(h2, s)) && selectors(rule).some(s => matches(h2, s) && !matches(h1, s)) && controls(rule, 'color', [h1, h2]));
        const descendant = coloredRules.some(rule => selectors(rule).some(s => /[^\s>+~]\s+[^>+~\s]/.test(s) && mainParagraphs.every(node => matches(node, s))) && controls(rule, 'color', mainParagraphs));
        const child = rules.some(rule => rule.style?.backgroundColor && selectors(rule).some(s => s.includes('>') && matches(intro, s)) && controls(rule, 'background-color', [intro]));
        ok = normal && group && descendant && child && navy(h1) && navy(h2) && mainParagraphs.length >= 2 && mainParagraphs.every(navy) && foot.length > 0 && foot.every(maroon) && yellow(intro) && nested.length > 0 && nested.every(clear);
      } else if (ruleId === 'css-order') {
        const same = coloredRules.filter(rule => rule.selectorText === '.hinweis');
        const idColor = coloredRules.some(rule => selectors(rule).some(s => s.includes('#') && matches(intro, s)));
        ok = normal && !idColor && matches(intro, '.hinweis') && same.some(rule => rule.style.color === 'maroon') && same.at(-1)?.style.color === 'navy' && navy(intro) && controls(same.at(-1), 'color', [intro]);
      } else if (ruleId === 'css-specificity') {
        const id = coloredRules.findIndex(rule => rule.selectorText === '#einstieg' && rule.style.color === 'navy');
        const cls = coloredRules.findLastIndex((rule, index) => index > id && rule.selectorText === '.hinweis' && rule.style.color === 'maroon');
        ok = normal && matches(intro, '#einstieg.hinweis') && all('[id="einstieg"]').length === 1 && id >= 0 && cls > id && navy(intro) && controls(coloredRules[id], 'color', [intro])
          && withoutColor(coloredRules[id], () => maroon(intro) && controls(coloredRules[cls], 'color', [intro]));
      } else {
        const mains = all('main');
        ok = normal && mains.length === 1 && mains.every(main => navy(main) && value(main, 'font-family') === 'serif' && yellow(main)) && all('main > p').some(p => {
          const emphases = Array.from(p.querySelectorAll('em')).filter(node => node.textContent.trim());
          return p.textContent.trim() && !direct(p, 'color') && !direct(p, 'font-family') && navy(p) && value(p, 'font-family') === 'serif' && emphases.some(em => direct(em, 'color') && maroon(em) && clear(em));
        });
      }
      if (!ok) { passed = false; failed.push(page); }
    } finally { frame.remove(); }
  }
  return { rule: ruleId, passed, file: failed.join(', ') || entry, message: passed ? 'Die CSS-Technik und die verlangten Browserwerte sind erfüllt. Begründe das Ergebnis zusätzlich in deiner Selbstprüfung.' : messages[ruleId] };
}
