import { resolvePath } from './project.js';

export function parseHTML(source) {
  const template = document.createElement('template');
  template.innerHTML = source;
  return template.content;
}
const TAGS = new Set('p h1 h2 h3 h4 h5 h6 a ul ol li img header nav main footer article section aside div span strong em b i br hr figure figcaption blockquote code pre dl dt dd'.split(' '));
for (const tag of ['form', 'label', 'input', 'textarea', 'select', 'option', 'optgroup', 'fieldset', 'legend', 'button']) TAGS.add(tag);
const INPUT_TYPES = new Set(['text', 'email', 'tel', 'number', 'checkbox', 'radio', 'submit', 'reset', 'button']);
const PROPS = new Set('color background-color font-size font-family font-weight font-style text-align text-decoration line-height letter-spacing margin margin-top margin-bottom margin-left margin-right padding padding-top padding-bottom padding-left padding-right border border-color border-width border-style border-radius width max-width min-width height max-height display list-style-type'.split(' '));
for (const prop of 'box-sizing min-height overflow overflow-x overflow-y overflow-wrap word-break white-space flex flex-direction flex-wrap flex-basis flex-grow flex-shrink justify-content align-items align-content align-self gap row-gap column-gap grid-template-columns grid-template-rows grid-template-areas grid-area grid-column grid-row grid-auto-rows position top right bottom left inset z-index aspect-ratio object-fit outline outline-width outline-style outline-color outline-offset opacity transform transition transition-property transition-duration transition-timing-function transition-delay'.split(' ')) PROPS.add(prop);
for (const side of ['top', 'right', 'bottom', 'left']) for (const part of ['width', 'style', 'color']) PROPS.add(`border-${side}-${part}`);
for (const axis of ['row', 'column']) for (const end of ['start', 'end']) PROPS.add(`grid-${axis}-${end}`);
for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) PROPS.add(`border-${corner}-radius`);
for (const prop of ['white-space-collapse', 'text-wrap-mode', 'text-decoration-line', 'text-decoration-style', 'text-decoration-color', 'text-decoration-thickness']) PROPS.add(prop);
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function cleanCSS(source, warnings = []) {
  if (source.length > 131072) throw new Error('CSS zu groß.');
  const sheet = new CSSStyleSheet();
  if (/@import|@font-face|url\s*\(/i.test(source)) warnings.push('CSS-Ressourcen und Imports sind im Pilot gesperrt.');
  sheet.replaceSync(source);
  let count = 0;
  function renderRules(rules, depth = 0) {
    const result = [];
    if (depth > 4) throw new Error('CSS-Medienregeln zu tief verschachtelt.');
    for (const rule of rules) {
      if (++count > 300) throw new Error('Zu viele CSS-Regeln (höchstens 300).');
      if (rule.type === CSSRule.MEDIA_RULE) {
        const clause = '\\(\\s*(?:(?:min|max)-width\\s*:\\s*\\d+(?:\\.\\d+)?(?:px|em|rem)|prefers-reduced-motion\\s*:\\s*(?:reduce|no-preference))\\s*\\)';
        if (!new RegExp(`^${clause}(?:\\s+and\\s+${clause})*$`, 'i').test(rule.conditionText)) { warnings.push('Diese Medienbedingung ist in der Werkstatt nicht freigegeben.'); continue; }
        result.push(`@media ${rule.conditionText}{${renderRules(rule.cssRules, depth + 1)}}`);
        continue;
      }
      const selector = rule.selectorText?.replace(/:(?:focus-visible|focus-within|focus|hover|root)\b/g, '');
      if (rule.type !== CSSRule.STYLE_RULE || rule.cssRules?.length || rule.selectorText.length > 300 || !/^[a-z\d_#. ,>+~*-]+$/i.test(selector)) { warnings.push('Diese CSS-Regel ist in der Werkstatt nicht freigegeben.'); continue; }
    const declarations = [];
    for (const property of rule.style) {
      const value = rule.style.getPropertyValue(property);
      if (!PROPS.has(property) || /[\\<>]|url\s*\(|(?:image|paint|element|var)\s*\(/i.test(value) || value.length > 250) { warnings.push(`CSS-Eigenschaft ${property} wird in der Vorschau nicht verwendet.`); continue; }
      declarations.push(`${property}:${value}${rule.style.getPropertyPriority(property) ? '!important' : ''}`);
    }
      result.push(`${rule.selectorText}{${declarations.join(';')}}`);
    }
    return result.join('\n');
  }
  return renderRules(sheet.cssRules);
}

export function activeStyleRules(rules, matches) {
  return Array.from(rules).flatMap(rule => rule.type === CSSRule.MEDIA_RULE
    ? matches(rule.conditionText) ? activeStyleRules(rule.cssRules, matches) : []
    : rule.type === CSSRule.STYLE_RULE ? [rule] : []);
}

export function buildPreview(files, path, scriptOutput) {
  const source = files[path]?.content || '';
  const root = parseHTML(source);
  const warnings = [];
  let count = 0;
  let imageDataSize = 0;
  const nodes = {};
  const styles = [];
  const rawStyles = [];
  for (const link of root.querySelectorAll('link[rel~="stylesheet"]')) {
    const cssPath = resolvePath(path, link.getAttribute('href'));
    const css = cssPath && files[cssPath];
    if (css?.kind === 'text' && /\.css$/i.test(cssPath)) { styles.push(cleanCSS(css.content, warnings)); rawStyles.push({ path: cssPath, content: css.content }); }
    else warnings.push(`Stylesheet nicht gefunden oder gesperrt: ${link.getAttribute('href')}`);
  }
  for (const style of root.querySelectorAll('style')) { styles.push(cleanCSS(style.textContent, warnings)); rawStyles.push({ path, content: style.textContent }); }
  function render(node, depth = 0) {
    if (++count > 1500 || depth > 40) throw new Error('Vorschau zu komplex (maximal 1500 Knoten, Tiefe 40).');
    if (node.nodeType === Node.TEXT_NODE) return escape(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.localName;
    if (tag === 'input' && !INPUT_TYPES.has((node.getAttribute('type') || 'text').toLowerCase())) { warnings.push('Dieser Eingabetyp ist in der Formularübung nicht freigegeben.'); return ''; }
    if (!TAGS.has(tag)) {
      if (!['title', 'meta', 'link', 'style'].includes(tag)) warnings.push(`Element ${tag} ist im Pilot nicht freigegeben.`);
      return '';
    }
    const id = String(count);
    nodes[id] = { path, html: node.outerHTML.slice(0, 2000), tag };
    const attrs = [`data-pilot-node="${id}"`];
    for (const name of ['id', 'class', 'title', 'lang', 'alt']) {
      if (node.hasAttribute(name)) attrs.push(`${name}="${escape(node.getAttribute(name))}"`);
    }
    if (node.hasAttribute('style')) attrs.push(`style="${escape(cleanCSS(`x{${node.getAttribute('style')}}`, warnings).replace(/^x\{|\}$/g, ''))}"`);
    if (Array.from(node.attributes).some((a) => a.name.startsWith('on'))) warnings.push('Ereignisattribute sind gesperrt.');
    const formAttrs = {
      label: ['for'], input: ['type', 'name', 'value', 'min', 'max', 'step', 'placeholder', 'aria-describedby'],
      textarea: ['name', 'rows', 'cols', 'placeholder', 'aria-describedby'], select: ['name', 'aria-describedby'],
      option: ['value'], optgroup: ['label'], button: ['type', 'name', 'value', 'aria-describedby'],
    };
    for (const name of formAttrs[tag] || []) if (node.hasAttribute(name)) attrs.push(`${name}="${escape(node.getAttribute(name).slice(0, 1000))}"`);
    if (['input', 'textarea', 'select', 'option', 'optgroup', 'button', 'fieldset', 'form'].includes(tag)) {
      for (const name of ['required', 'disabled', 'readonly', 'checked', 'selected', 'multiple', 'novalidate', 'formnovalidate']) if (node.hasAttribute(name)) attrs.push(name);
    }
    if (tag === 'form') {
      attrs.push('autocomplete="off"');
      if (/^(get|post)$/i.test(node.getAttribute('method') || '')) attrs.push(`method="${node.getAttribute('method').toLowerCase()}"`);
      warnings.push('Formularvorschau: Abgabeziele werden entfernt; die Sandbox und CSP sperren den Versand. Eingaben bleiben flüchtig.');
    }
    if (tag === 'input' || tag === 'textarea') attrs.push('autocomplete="off"');
    if (Array.from(node.attributes).some(attr => /^(?:action|formaction|form|target|formtarget|autofocus)$/i.test(attr.name))) warnings.push('Formularziele, externe Formzuordnung und automatischer Fokus werden nicht übernommen.');
    if (tag === 'a') {
      const href = node.getAttribute('href');
      const target = resolvePath(path, href);
      if (target && files[target]?.kind === 'text' && /\.html$/i.test(target)) {
        attrs.push(`href="#" data-pilot-target="${escape(target)}" data-pilot-fragment="${escape(href.split('#')[1] || '')}"`);
      } else { attrs.push('href="#" data-pilot-blocked="true"'); warnings.push(`Linkziel fehlt oder ist gesperrt: ${href || '(leer)'}`); }
    }
    if (tag === 'img') {
      for (const attr of ['width', 'height']) if (/^[1-9]\d{0,3}$/.test(node.getAttribute(attr) || '')) attrs.push(`${attr}="${node.getAttribute(attr)}"`);
      const target = resolvePath(path, node.getAttribute('src'));
      if (target && files[target]?.kind === 'image') {
        imageDataSize += files[target].content.length;
        if (imageDataSize > 15 * 1024 * 1024) throw new Error('Zu viele Bilddaten in einer Vorschauseite. Bitte weniger Bilder gleichzeitig einbinden.');
        attrs.push(`src="${escape(files[target].content)}"`);
      }
      else warnings.push(`Bild nicht gefunden oder gesperrt: ${node.getAttribute('src') || '(leer)'}`);
    }
    if (['img', 'br', 'hr', 'input'].includes(tag)) return `<${tag} ${attrs.join(' ')}>`;
    return `<${tag} ${attrs.join(' ')}>${Array.from(node.childNodes, (child) => render(child, depth + 1)).join('')}</${tag}>`;
  }
  const body = Array.from(root.childNodes, (node) => render(node)).join('');
  // Only display bounded primitive strings; no user HTML or extra execution.
  let output = '';
  if (scriptOutput !== undefined) {
    if (!Array.isArray(scriptOutput) || scriptOutput.length > 80 || scriptOutput.some(line => typeof line !== 'string' || line.length > 1000) || scriptOutput.reduce((total, line) => total + line.length, 0) > 32000) throw new Error('Kursausgabe überschreitet die Anzeigegrenze.');
    output = `<aside data-azubi-course-output aria-label="Gespiegelte Kursausgabe" style="display:block;padding:16px;margin:20px 8px;border:2px solid #0f766e;background:#f0fdfa;color:#134e4a;font:16px/1.5 sans-serif;text-align:left"><strong>JavaScript-Ausgabe · Lernhilfe der App</strong><p>Diese Texte stammen aus der Kurskonsole. Die App blendet sie hier ein; console.log verändert selbst kein HTML.</p><pre style="display:block;white-space:pre-wrap;overflow-wrap:anywhere;color:inherit;background:transparent"><span>${scriptOutput.length ? scriptOutput.map(line => escape(line).replace(/\r/g, '&#13;')).join('\n') : 'Noch keine Ausgabe. Starte das Kursprogramm bewusst.'}</span></pre></aside>`;
  }
  const csp = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  const viewport = root.querySelector('meta[name="viewport" i]')?.getAttribute('content') || '';
  const viewportMeta = /width\s*=\s*device-width/i.test(viewport) ? '<meta name="viewport" content="width=device-width, initial-scale=1">' : '';
  return { html: `<!doctype html><html lang="de"><head><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer">${viewportMeta}<style>${styles.join('\n')}</style></head><body>${body}${output}</body></html>`, nodes, styles: rawStyles, warnings: [...new Set(warnings)] };
}
