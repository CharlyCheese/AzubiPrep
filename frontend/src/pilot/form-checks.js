import { parseHTML } from './preview.js';
import { withLayoutPreview, cssContrast } from './layout-checks.js';

function inspectForm({ doc, win, rules }, form, step, width) {
  const all = (selector, root = doc) => Array.from(root === doc ? doc.querySelectorAll(selector) : win.Element.prototype.querySelectorAll.call(root, selector));
  const native = (node, key) => {
    if (!(node instanceof win.HTMLFormElement)) return node[key];
    for (let proto = Object.getPrototypeOf(node); proto; proto = Object.getPrototypeOf(proto)) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (descriptor) return descriptor.get ? descriptor.get.call(node) : descriptor.value;
    }
  };
  const get = (node, prop) => win.getComputedStyle(node).getPropertyValue(prop);
  const rect = node => win.Element.prototype.getBoundingClientRect.call(node);
  const text = node => Boolean(node && native(node, 'textContent').trim());
  const background = node => {
    for (let parent = node; parent; parent = native(parent, 'parentElement')) {
      const color = get(parent, 'background-color');
      if (color.startsWith('rgb(')) return color;
      if (!/^rgba\([^)]*,\s*0\)$/.test(color)) return color;
    }
    return 'rgb(255, 255, 255)';
  };
  const visible = node => {
    if (node instanceof win.HTMLFormElement && get(node, 'display') === 'contents') return all('input,textarea,select,button', node).some(child => visible(child));
    if (!node || !rect(node).width || !rect(node).height || rect(node).left < -2 || rect(node).top < -2 || rect(node).right > doc.documentElement.clientWidth + 2) return false;
    for (let parent = node; parent; parent = native(parent, 'parentElement')) {
      if (get(parent, 'display') === 'none' || /hidden|collapse/.test(get(parent, 'visibility')) || Number(get(parent, 'opacity')) < .1) return false;
      if (/hidden|clip/.test(get(parent, 'overflow-x')) && (native(parent, 'scrollWidth') > native(parent, 'clientWidth') + 2 || rect(node).left < rect(parent).left - 2 || rect(node).right > rect(parent).right + 2)) return false;
      if (/hidden|clip/.test(get(parent, 'overflow-y')) && (native(parent, 'scrollHeight') > native(parent, 'clientHeight') + 2 || rect(node).top < rect(parent).top - 2 || rect(node).bottom > rect(parent).bottom + 2)) return false;
    }
    return true;
  };
  const readableText = node => {
    if (!node) return false;
    const walker = doc.createTreeWalker(node, win.NodeFilter.SHOW_TEXT);
    for (let part = walker.nextNode(); part; part = walker.nextNode()) {
      if (!part.textContent.trim() || !visible(part.parentElement)) continue;
      const range = doc.createRange(); range.selectNodeContents(part);
      const bounds = range.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0 && cssContrast(get(part.parentElement, 'color'), background(part.parentElement)) >= 4.5) return true;
    }
    return false;
  };
  const fields = all('input,textarea,select', form).filter(node => !['submit', 'reset', 'button'].includes(node.type));
  const inputs = type => fields.filter(node => node.localName === 'input' && node.type === type);
  const uniqueId = id => id && all('[id]').filter(node => win.Element.prototype.getAttribute.call(node, 'id') === id).length === 1;
  const labelled = field => field.form === form && field.name.trim() && !field.matches(':disabled') && !field.readOnly && visible(field) && (!field.id || uniqueId(field.id)) && Array.from(field.labels || []).some(label => visible(label) && readableText(label));
  const submitters = all('button,input', form).filter(node => node.form === form && node.type === 'submit' && !node.matches(':disabled') && visible(node) && (node.localName === 'button' ? readableText(node) : node.value.trim() && cssContrast(get(node, 'color'), background(node)) >= 4.5));
  const name = inputs('text')[0]; const email = inputs('email')[0]; const phone = inputs('tel')[0]; const number = inputs('number')[0];
  const message = fields.find(node => node.localName === 'textarea'); const select = fields.find(node => node.localName === 'select');
  const radios = inputs('radio'); const checkbox = inputs('checkbox')[0];
  const issues = [];
  if (!visible(form) || !name || !labelled(name) || !submitters.length) issues.push('Ein erreichbares Formular braucht ein wirklich beschriftetes, benanntes Textfeld und einen verständlichen Abgabeknopf.');
  if (fields.some(field => !labelled(field))) issues.push('Jedes Eingabefeld braucht einen Namen und ein sichtbares, tatsächlich verbundenes Label; IDs müssen eindeutig sein. Felder müssen bedienbar bleiben.');
  if (step >= 1 && (!email || !phone || !number || !message)) issues.push('Die Typen email, tel und number sowie eine textarea fehlen noch oder wurden durch andere Felder ersetzt.');
  let radioGroup = [];
  if (step >= 2) {
    radioGroup = radios.filter(node => node.name && node.name === radios[0]?.name);
    const fieldset = radioGroup[0]?.closest('fieldset');
    const legend = fieldset && Array.from(fieldset.children).find(node => node.localName === 'legend');
    const options = select ? Array.from(select.options) : [];
    const choices = options.filter(option => option.value.trim() && text(option) && !option.matches(':disabled'));
    const hasOptions = select && !select.multiple && options[0]?.value === '' && choices.length >= 2 && new Set(choices.map(option => option.value)).size >= 2;
    const distinct = radioGroup.length >= 2 && new Set(radioGroup.map(node => node.value)).size === radioGroup.length && radioGroup.every(node => node.value.trim() && node.closest('fieldset') === fieldset);
    if (!hasOptions || !checkbox || !distinct || !readableText(legend) || !visible(legend)) issues.push('Benötigt werden select mit leerem Anfangseintrag und zwei Werten, eine unabhängige Checkbox sowie zwei gleichnamige Radiofelder mit verschiedenen Werten in fieldset/legend.');
    if (radioGroup.length >= 2 && checkbox) {
      radioGroup[0].checked = true; radioGroup[1].checked = true; checkbox.checked = true;
      if (radioGroup[0].checked || !radioGroup[1].checked || !checkbox.checked) issues.push('Die Radioauswahl muss sich gegenseitig ausschließen; die Checkbox bleibt unabhängig.');
    }
  }
  if (step >= 3 && email && number && message && select && name && phone && checkbox && radioGroup.length >= 2) {
    const mandatory = [name, email, number, message, select];
    if (mandatory.some(node => !node.required || !node.willValidate) || !radioGroup.some(node => node.required) || phone.required || checkbox.required) issues.push('Pflicht sind Name, E-Mail, Zahl, Nachricht, Thema und eine Zeitwahl; Telefon und Materialliste bleiben freiwillig.');
    if (win.Element.prototype.hasAttribute.call(form, 'novalidate') || submitters.some(node => node.formNoValidate)) issues.push('Die native Abgabeprüfung darf nicht mit novalidate/formnovalidate abgeschaltet werden.');
    const valid = node => win.HTMLInputElement.prototype.checkValidity.call(node);
    number.value = '0'; const low = number.validity.rangeUnderflow && !valid(number);
    number.value = '9'; const high = number.validity.rangeOverflow && !valid(number);
    number.value = '1.5'; const fractional = number.validity.stepMismatch && !valid(number);
    number.value = '1'; const lower = valid(number); number.value = '8'; const upper = valid(number);
    if (!low || !high || !fractional || !lower || !upper) issues.push('Die Browsergrenzen müssen ganze Platzzahlen 1–8 zulassen und 0, 9 und 1,5 zurückweisen. Prüfe min/max/step.');
    email.value = 'falsch@'; const malformed = email.validity.typeMismatch && !valid(email);
    email.value = 'probe@example.invalid'; const address = valid(email);
    if (!malformed || !address) issues.push('Das E-Mail-Feld muss ein unvollständiges Format ablehnen und eine syntaktisch gültige Beispieladresse annehmen.');
    for (const node of fields) {
      if (node.localName === 'select') node.value = '';
      else if (['radio', 'checkbox'].includes(node.type)) node.checked = false;
      else node.value = '';
    }
    if (win.HTMLFormElement.prototype.checkValidity.call(form)) issues.push('Der leere Stand muss durch die Pflichtregeln ungültig sein.');
    name.value = 'Beispiel'; email.value = 'probe@example.invalid'; number.value = '2'; message.value = 'Eine Frage zur gemeinsamen Übung.';
    select.value = Array.from(select.options).find(option => option.value.trim() && !option.matches(':disabled'))?.value || '';
    radioGroup[0].checked = true;
    if (!win.HTMLFormElement.prototype.checkValidity.call(form)) issues.push('Der synthetische gültige Stand muss ohne freiwilliges Telefon/Materialliste bestehen. Prüfe zusätzliche oder widersprüchliche Einschränkungen.');
  }
  if (step >= 4 && number) {
    const refs = (number.getAttribute('aria-describedby') || '').trim().split(/\s+/).filter(Boolean);
    if (!refs.length || refs.some(id => !uniqueId(id) || !readableText(doc.getElementById(id)) || !visible(doc.getElementById(id)))) issues.push('aria-describedby am Zahlenfeld muss auf vorhandene, sichtbare und eindeutig benannte Hinweistexte verweisen.');
    if (doc.documentElement.scrollWidth > doc.documentElement.clientWidth + 2 || !visible(form) || fields.some(node => !visible(node))) issues.push(`Das Formular oder seine Pflichtinhalte passen bei ${width}px noch nicht sichtbar in die Ansicht.`);
    if (fields.filter(node => !['checkbox', 'radio'].includes(node.type)).some(node => cssContrast(get(node, 'color'), background(node)) < 4.5)) issues.push('Die eingegebenen Texte müssen sich lesbar vom Hintergrund der Felder abheben.');
    const focusTargets = [...fields, ...submitters];
    const focusGood = focusTargets.every(node => {
      node.blur(); const before = get(node, 'outline'); node.focus({ preventScroll: true });
      doc.body.getBoundingClientRect(); for (const animation of doc.getAnimations()) { try { animation.finish(); } catch { /* Begrenzte Zustandsprüfung. */ } }
      return doc.activeElement === node && get(node, 'outline') !== before && parseFloat(get(node, 'outline-width')) >= 2 && !/none|hidden/.test(get(node, 'outline-style')) && cssContrast(get(node, 'outline-color'), background(node)) >= 3 && rules.some(rule => /:focus\b/.test(rule.selectorText) && node.matches(rule.selectorText) && (rule.style.outline || rule.style.outlineWidth));
    });
    if (!focusGood) issues.push('Alle Eingaben und Abgabeknöpfe brauchen erreichbaren, sichtbar veränderten Tastaturfokus mit mindestens 2px Outline.');
  }
  return [...new Set(issues)];
}

export async function checkFormLesson(files, lesson, entry) {
  if (lesson.formStep === undefined) return null;
  const step = lesson.formStep;
  const pages = step === 5 ? Object.keys(files).filter(name => /\.html$/i.test(name)) : [entry];
  const candidates = pages.filter(page => parseHTML(files[page]?.content || '').querySelector('main form'));
  if (!candidates.length) return { rule: 'html-form', passed: false, file: entry, message: 'Ergänze das verlangte Formular im Hauptinhalt der gewählten Seite.' };
  let errors = []; let errorFile = candidates[0];
  for (const page of candidates) {
    const original = parseHTML(files[page]?.content || '');
    const wrongOwner = Array.from(original.querySelectorAll('[form]')).some(node => {
      const owner = Element.prototype.closest.call(node, 'form'); const id = owner && Element.prototype.getAttribute.call(owner, 'id');
      return !id || Element.prototype.getAttribute.call(node, 'form') !== id || Array.from(original.querySelectorAll('[id]')).filter(item => Element.prototype.getAttribute.call(item, 'id') === id).length !== 1;
    });
    if (wrongOwner) { errors = ['Die externe Formzuordnung per form-Attribut wird hier nicht unterstützt. Ordne die Eingaben ihrem umschließenden Formular zu.']; errorFile = page; continue; }
    const byForm = [];
    for (const width of step >= 4 ? [360, 1280] : [1280]) {
      const result = await withLayoutPreview(files, page, { width, focus: true }, scene => {
        const forms = Array.from(scene.doc.querySelectorAll('main form'));
        const results = forms.map(form => inspectForm(scene, form, step, width));
        return results.length ? results : [['Formular fehlt in der bereinigten Vorschau.']];
      });
      result.forEach((issues, index) => { byForm[index] = [...(byForm[index] || []), ...issues]; });
    }
    if (byForm.some(issues => !issues.length)) return { rule: 'html-form', passed: true, file: page, message: 'Beschriftung, eingeführte Formulartechniken und Browserverhalten erfüllen den Auftrag. Ergänze die menschliche Selbstprüfung; es wurde nichts gesendet.' };
    errors = [...new Set(byForm[0])]; errorFile = page;
  }
  return { rule: 'html-form', passed: false, file: errorFile, message: errors.join(' ') };
}
