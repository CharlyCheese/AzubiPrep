import { resolvePath } from './project.js';

export function parseHTML(source) {
  const template = document.createElement('template');
  template.innerHTML = source;
  return template.content;
}
const TAGS = new Set('p h1 h2 h3 h4 h5 h6 a ul ol li img header nav main footer article section aside div span strong em b i br hr figure figcaption blockquote code pre dl dt dd'.split(' '));
const PROPS = new Set('color background-color font-size font-family font-weight font-style text-align text-decoration line-height letter-spacing margin margin-top margin-bottom margin-left margin-right padding padding-top padding-bottom padding-left padding-right border border-color border-width border-style border-radius width max-width min-width height max-height display list-style-type'.split(' '));
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function cleanCSS(source, warnings = []) {
  if (source.length > 131072) throw new Error('CSS zu groß.');
  const sheet = new CSSStyleSheet();
  if (/@import|@font-face|url\s*\(/i.test(source)) warnings.push('CSS-Ressourcen und Imports sind im Pilot gesperrt.');
  sheet.replaceSync(source);
  if (sheet.cssRules.length > 300) throw new Error('Zu viele CSS-Regeln (höchstens 300).');
  const result = [];
  for (const rule of sheet.cssRules) {
    if (rule.type !== CSSRule.STYLE_RULE || rule.selectorText.length > 300 || !/^[a-z\d_#. ,>+~*-]+$/i.test(rule.selectorText)) { warnings.push('Diese CSS-Regel ist im Pilot nicht freigegeben.'); continue; }
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

export function buildPreview(files, path) {
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
    if (tag === 'a') {
      const href = node.getAttribute('href');
      const target = resolvePath(path, href);
      if (target && files[target]?.kind === 'text' && /\.html$/i.test(target)) {
        attrs.push(`href="#" data-pilot-target="${escape(target)}" data-pilot-fragment="${escape(href.split('#')[1] || '')}"`);
      } else { attrs.push('href="#" data-pilot-blocked="true"'); warnings.push(`Linkziel fehlt oder ist gesperrt: ${href || '(leer)'}`); }
    }
    if (tag === 'img') {
      const target = resolvePath(path, node.getAttribute('src'));
      if (target && files[target]?.kind === 'image') {
        imageDataSize += files[target].content.length;
        if (imageDataSize > 15 * 1024 * 1024) throw new Error('Zu viele Bilddaten in einer Vorschauseite. Bitte weniger Bilder gleichzeitig einbinden.');
        attrs.push(`src="${escape(files[target].content)}"`);
      }
      else warnings.push(`Bild nicht gefunden oder gesperrt: ${node.getAttribute('src') || '(leer)'}`);
    }
    if (['img', 'br', 'hr'].includes(tag)) return `<${tag} ${attrs.join(' ')}>`;
    return `<${tag} ${attrs.join(' ')}>${Array.from(node.childNodes, (child) => render(child, depth + 1)).join('')}</${tag}>`;
  }
  const body = Array.from(root.childNodes, (node) => render(node)).join('');
  const csp = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  return { html: `<!doctype html><html lang="de"><head><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><style>${styles.join('\n')}</style></head><body>${body}</body></html>`, nodes, styles: rawStyles, warnings: [...new Set(warnings)] };
}
