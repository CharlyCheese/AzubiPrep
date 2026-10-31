import { buildPreview, parseHTML, activeStyleRules } from './preview.js';

function cssRgb(value) {
  const parts = value.match(/^rgba?\(([^)]+)\)$/)?.[1].split(/[, /]+/).map(Number);
  return parts?.length >= 3 && parts.every(Number.isFinite) ? [...parts.slice(0, 3), parts[3] ?? 1] : null;
}
export function cssContrast(a, b) {
  const one = cssRgb(a); const two = cssRgb(b);
  if (!one || !two || one[3] !== 1 || two[3] !== 1) return 0;
  const luminance = rgb => rgb.slice(0, 3).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
  const x = luminance(one); const y = luminance(two);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export async function withLayoutPreview(files, page, options, inspect) {
  const frame = document.createElement('iframe');
  const previousFocus = document.activeElement;
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
  frame.title = 'Interne Layout-Pflichtprüfung';
  frame.style.cssText = `position:fixed;left:-100000px;top:0;width:${options.width}px;height:900px;border:0;pointer-events:none;`;
  try {
    const preview = buildPreview(files, page);
    document.body.append(frame);
    const doc = frame.contentDocument;
    doc.open(); doc.write(preview.html); doc.close();
    let imageTimer;
    let imagesReady;
    try {
      imagesReady = await Promise.race([
        Promise.all(Array.from(doc.images, image => image.decode().then(() => true, () => false))).then(values => values.every(Boolean)),
        new Promise(resolve => { imageTimer = setTimeout(() => resolve(false), 3000); }),
      ]);
    } finally { clearTimeout(imageTimer); }
    const win = frame.contentWindow;
    if (options.rootSize) doc.documentElement.style.fontSize = `${options.rootSize}px`;
    function configure(rules) {
      for (const rule of rules) {
        if (rule.type === CSSRule.MEDIA_RULE) {
          // Reproduzierbare Medieneinstellung; Breitenbedingungen bleiben echt.
          rule.media.mediaText = rule.conditionText.replace(/\(prefers-reduced-motion:\s*(reduce|no-preference)\)/g, (_, preference) => preference === (options.motion || 'no-preference') ? '(min-width: 0px)' : '(max-width: 0px)');
          configure(rule.cssRules);
        } else if (rule.type === CSSRule.STYLE_RULE) {
          // Nur der Prüfzustand wird normalisiert, niemals die Projektdatei.
          if (options.focus) rule.selectorText = rule.selectorText.replace(/:focus-visible\b/g, ':focus');
          if (options.hover) rule.selectorText = rule.selectorText.replace(/:hover\b/g, '.css-test-hover');
        }
      }
    }
    configure(doc.styleSheets[0].cssRules);
    if (options.hover) for (const node of doc.querySelectorAll('*')) node.classList.add('css-test-hover');
    doc.body.getBoundingClientRect();
    for (const animation of doc.getAnimations()) { try { animation.finish(); } catch { /* Keine endlosen Lernanimationen freigegeben. */ } }
    const rules = activeStyleRules(doc.styleSheets[0].cssRules, query => win.matchMedia(query).matches);
    return await inspect({ doc, win, rules, preview, imagesReady });
  } finally {
    frame.remove();
    if (document.activeElement !== previousFocus && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
}

function inspectLayout(scene, step, width) {
  const { doc, win, rules } = scene;
  const get = (node, prop) => node ? win.getComputedStyle(node).getPropertyValue(prop) : '';
  const box = node => node?.getBoundingClientRect();
  const num = (node, prop) => parseFloat(get(node, prop)) || 0;
  const all = (selector, root = doc) => Array.from(root.querySelectorAll(selector));
  const visible = node => {
    if (!node || !box(node).width || !box(node).height) return false;
    if (box(node).top < -2 || box(node).left < -2 || box(node).right > doc.documentElement.clientWidth + 2) return false;
    for (let parent = node; parent; parent = parent.parentElement) {
      if (get(parent, 'display') === 'none' || /hidden|collapse/.test(get(parent, 'visibility')) || Number(get(parent, 'opacity')) < .1) return false;
      if (/hidden|clip/.test(get(parent, 'overflow-y')) && (box(node).top < box(parent).top - 2 || box(node).bottom > box(parent).bottom + 2)) return false;
      if (/hidden|clip/.test(get(parent, 'overflow-y')) && parent.scrollHeight > parent.clientHeight + 2) return false;
      if (/hidden|clip/.test(get(parent, 'overflow-x')) && (parent.scrollWidth > parent.clientWidth + 2 || box(node).left < box(parent).left - 2 || box(node).right > box(parent).right + 2)) return false;
    }
    return true;
  };
  const background = node => {
    for (let parent = node; parent; parent = parent.parentElement) if (cssRgb(get(parent, 'background-color'))?.[3] === 1) return get(parent, 'background-color');
    return 'rgb(255, 255, 255)';
  };
  const declared = (node, prop, predicate = () => true) => rules.some(rule => {
    try { return node?.matches(rule.selectorText) && rule.style.getPropertyValue(prop) && predicate(rule.style.getPropertyValue(prop)); } catch { return false; }
  });
  const main = doc.querySelector('main');
  // Die Endprojekte dürfen Klassennamen frei wählen; Rollen werden strukturell erkannt.
  const cardHeading = 'h2,h3,h4,h5,h6';
  const cardNode = node => /^(section|article)$/.test(node.localName) && node.querySelector(cardHeading) && node.querySelector('p');
  const container = step >= 19 ? [main, ...all('main *')].filter(Boolean).find(node => Array.from(node.children).filter(cardNode).length >= 3) : doc.querySelector('.karten');
  const cards = container ? Array.from(container.children).filter(cardNode) : [];
  const aside = doc.querySelector('main aside');
  const nav = doc.querySelector('nav'); const links = all('nav a[href]');
  const image = doc.querySelector('main img'); const badge = doc.querySelector('.marke');
  const enoughCards = cards.length >= 3 && cards.every(card => visible(card) && all(cardHeading, card).some(heading => visible(heading) && heading.textContent.trim()));
  const cardColors = enoughCards && cards.every(card => cssContrast(get(card, 'color'), get(card, 'background-color')) >= 4.5);
  const readable = enoughCards && cards.every(card => all(cardHeading, card).every(heading => visible(heading) && cssContrast(get(heading, 'color'), background(heading)) >= (num(heading, 'font-size') >= 24 || num(heading, 'font-size') >= 18.67 && num(heading, 'font-weight') >= 700 ? 3 : 4.5)) && all('p', card).length && all('p', card).every(p => visible(p) && p.textContent.trim() && num(p, 'font-size') >= 16 && num(p, 'line-height') >= num(p, 'font-size') * 1.5 && cssContrast(get(p, 'color'), background(p)) >= 4.5));
  const inside = (inner, outer, tolerance = 2) => inner && outer && box(inner).left >= box(outer).left - tolerance && box(inner).right <= box(outer).right + tolerance;
  const layoutWidth = doc.documentElement.clientWidth;
  const noPageOverflow = doc.documentElement.scrollWidth <= layoutWidth + 2 && doc.body.scrollWidth <= layoutWidth + 2 && ![doc.documentElement, doc.body, main, container, ...cards].filter(Boolean).some(node => /hidden|clip/.test(get(node, 'overflow-x')));
  const sameRow = enoughCards && cards.every(card => Math.abs(box(card).top - box(cards[0]).top) < 2) && cards.slice(1).every((card, i) => box(card).left >= box(cards[i]).right + 1);
  const stacked = enoughCards && cards.slice(1).every((card, i) => box(card).top >= box(cards[i]).bottom - 1 && Math.abs(box(card).left - box(cards[0]).left) < 2);
  const gap = node => num(node, 'column-gap') > 0 && num(node, 'row-gap') > 0;
  const imageFits = scene.imagesReady && visible(image) && image.getAttribute('alt')?.trim() && inside(image, image.parentElement) && (step === 20 || box(image).width <= 320 + 2 && Math.abs(box(image).width - box(image).height) < 2);
  const flexNav = visible(nav) && links.length >= 3 && links.every(link => visible(link) && num(link, 'padding-top') > 0 && num(link, 'padding-left') > 0) && get(nav, 'display') === 'flex' && get(nav, 'flex-wrap') === 'wrap' && gap(nav);
  const viewport = /width\s*=\s*device-width/i.test(scene.preview.html) && Boolean(doc.querySelector('meta[name="viewport"]'));
  const responsiveGrid = get(container, 'display') === 'grid' && (width >= 960 ? sameRow : stacked) && noPageOverflow;
  const areaLayout = enoughCards && get(main, 'display') === 'grid' && get(aside, 'grid-area').split(' / ')[0] === 'info' && visible(aside) && box(aside).left >= box(container).right - 1;
  const badgeFits = visible(badge) && get(badge, 'position') === 'absolute' && get(cards[0], 'position') === 'relative' && inside(badge, cards[0]) && box(badge).top > box(cards[0]).top && box(badge).bottom <= box(cards[0].querySelector(cardHeading)).top + 1 && box(cards[0]).right - box(badge).right > 0 && box(cards[0]).right - box(badge).right < box(cards[0]).width / 4;
  const focusWorks = step >= 16 && links.length >= 3 && links.every(link => {
    if (!visible(link)) return false;
    link.blur();
    const before = ['outline-width', 'outline-style', 'outline-color', 'outline-offset'].map(prop => get(link, prop)).join('|');
    link.focus({ preventScroll: true });
    doc.body.getBoundingClientRect();
    for (const animation of doc.getAnimations()) { try { animation.finish(); } catch { /* Nur Endwerte des Prüfzustands. */ } }
    const after = ['outline-width', 'outline-style', 'outline-color', 'outline-offset'].map(prop => get(link, prop)).join('|');
    return before !== after && doc.activeElement === link && rules.some(rule => /:focus\b/.test(rule.selectorText) && link.matches(rule.selectorText) && (rule.style.outline || rule.style.outlineWidth)) && num(link, 'outline-width') >= 2 && !/none|hidden/.test(get(link, 'outline-style')) && num(link, 'outline-offset') > 0 && cssContrast(get(link, 'outline-color'), background(link)) >= 3;
  });
  const commonResponsive = enoughCards && readable && responsiveGrid && viewport && flexNav && visible(aside) && imageFits && focusWorks;
  let passed = false;
  if (step === 0) passed = cardColors && cards.every(card => declared(card, 'color', value => /#|rgb/i.test(value)) || declared(card, 'background-color', value => /#|rgb/i.test(value)));
  if (step === 1) passed = cardColors && readable;
  if (step === 2) passed = enoughCards && declared(main, 'max-width', value => /rem$/.test(value)) && num(main, 'max-width') > 0 && box(main).width < layoutWidth && Math.abs(box(main).left - (layoutWidth - box(main).right)) < 3 && cards.every(card => declared(card, 'padding-top', value => /em$/.test(value)));
  if (step === 3) passed = enoughCards && cards.every(card => get(card, 'box-sizing') === 'border-box' && num(card, 'padding-left') > 0 && num(card, 'border-left-width') > 0 && num(card, 'margin-bottom') > 0 && inside(card, container) && Math.abs(box(card).width - (container.clientWidth - num(container, 'padding-left') - num(container, 'padding-right'))) < 2);
  if (step === 4) {
    const prose = doc.querySelector('.langtext'); const pre = doc.querySelector('pre.code');
    passed = readable && noPageOverflow && visible(prose) && prose.scrollWidth <= prose.clientWidth + 2 && visible(pre) && pre.scrollWidth > pre.clientWidth + 2 && /auto|scroll/.test(get(pre, 'overflow-x'));
  }
  if (step === 5) passed = visible(doc.querySelector('.fluss')) && get(doc.querySelector('.fluss'), 'display') === 'block' && get(doc.querySelector('.fluss em'), 'display') === 'inline' && stacked;
  if (step === 6) { const em = doc.querySelector('.fluss em'); passed = visible(em) && get(em, 'display') === 'inline-block' && num(em, 'padding-top') > 0 && num(em, 'border-top-width') > 0; }
  if (step === 7) passed = enoughCards && get(container, 'display') === 'flex' && get(container, 'flex-direction') === 'row' && get(container, 'justify-content') === 'space-between' && gap(container) && sameRow;
  if (step === 8) passed = get(container, 'display') === 'flex' && get(container, 'flex-wrap') === 'wrap' && (width >= 960 ? sameRow : stacked) && noPageOverflow;
  if (step === 9) passed = flexNav && noPageOverflow && (width >= 960 ? sameRow : stacked);
  if (step === 10) passed = get(container, 'display') === 'grid' && gap(container) && sameRow && Math.max(...cards.map(card => box(card).width)) - Math.min(...cards.map(card => box(card).width)) < 2;
  if (step === 11) passed = areaLayout && sameRow && get(doc.querySelector('main > h2'), 'grid-area').split(' / ')[0] === 'titel' && get(doc.querySelector('.fluss'), 'grid-area').split(' / ')[0] === 'hinweis';
  if (step === 12) passed = sameRow && badgeFits;
  if (step === 13) passed = readable && areaLayout && sameRow && badgeFits && flexNav;
  if (step === 14) passed = viewport && responsiveGrid && visible(aside);
  if (step === 15) passed = viewport && responsiveGrid && imageFits && declared(image, 'height', value => value === 'auto');
  if (step === 16) passed = focusWorks;
  if (step === 17) passed = visible(badge) && num(badge, 'transition-duration') >= .1 && num(badge, 'transition-duration') <= .5;
  if (step === 18 || step === 20) passed = commonResponsive;
  if (step === 19) passed = enoughCards && readable && visible(aside) && visible(image) && Boolean(image.getAttribute('alt')?.trim()) && links.length >= 3;
  return { passed: Boolean(passed), mainMax: num(main, 'max-width'), mainSize: num(main, 'font-size'), cardPadding: num(cards[0], 'padding-top'), badgeTransform: get(badge, 'transform') };
}

export async function checkLayoutLesson(files, lesson, entry) {
  if (lesson.cssStep === undefined) return null;
  const step = lesson.cssStep;
  const pages = step >= 14 || [9, 13].includes(step) ? Object.keys(files).filter(name => /\.html$/i.test(name)) : [entry];
  const widths = [8, 9].includes(step) ? [360, 1280] : [14, 15, 18, 20].includes(step) ? [360, 768, 960, 1280] : [4].includes(step) ? [360] : [2].includes(step) ? [360, 1280] : [5, 6].includes(step) ? [768] : [1280];
  const failures = [];
  for (const page of pages) for (const width of widths) {
    const result = await withLayoutPreview(files, page, { width, focus: step >= 16, hover: step >= 17 }, scene => inspectLayout(scene, step, width));
    if (!result.passed) failures.push(`${page} (${width}px)`);
    if (step === 2 && width === 1280) {
      const scaled = await withLayoutPreview(files, page, { width, rootSize: 20 }, scene => inspectLayout(scene, step, width));
      if (!(scaled.mainMax > result.mainMax && scaled.mainSize > result.mainSize && scaled.cardPadding > result.cardPadding)) failures.push(`${page} (Wurzelschrift)`);
    }
    if (step === 17 || step === 18 || step === 20) {
      if (step === 17) {
        const still = await withLayoutPreview(files, page, { width }, scene => inspectLayout(scene, step, width));
        if (still.badgeTransform === result.badgeTransform) failures.push(`${page} (kein Hoverwechsel)`);
      }
      const reduced = await withLayoutPreview(files, page, { width, motion: 'reduce', hover: true, focus: true }, scene => {
        inspectLayout(scene, step, width);
        // Im freien Endprojekt ist auch eine vollständig bewegungsfreie Seite gültig.
        const targets = step === 20 ? Array.from(scene.doc.querySelectorAll('*')) : [scene.doc.querySelector('.marke')];
        return targets.every(node => node && Array.from(scene.win.getComputedStyle(node).transitionDuration.split(',')).every(value => parseFloat(value) === 0) && (step === 20 || scene.win.getComputedStyle(node).transform === 'none'));
      });
      if (!reduced) failures.push(`${page} (${width}px, reduzierte Bewegung)`);
    }
  }
  return [{ rule: 'css-layout', passed: failures.length === 0 && pages.length > 0, file: [...new Set(failures)].join(', ') || entry,
    message: failures.length ? `Die Browserdarstellung erfüllt den Auftrag noch nicht: ${lesson.task} Fokus- und Bewegungseinstellungen werden im Prüfkontext nachgestellt.` : 'Die verlangten CSS-Techniken, sichtbaren Inhalte und Browserwerte sind erfüllt. Ergänze die Selbstprüfung; Textqualität und vollständige Barrierefreiheit werden nicht automatisch bewertet.' }];
}
