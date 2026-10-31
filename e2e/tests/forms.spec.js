import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORM_LESSONS } from '../../frontend/src/pilot/form-course.js';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/src/pilot');
const code = ['project.js', 'preview.js', 'css-course.js', 'form-course.js', 'js-course.js', 'js15-course.js', 'js16-course.js', 'js17-course.js', 'course.js', 'css-checks.js', 'layout-checks.js', 'form-checks.js', 'validator.js'].map(file => fs.readFileSync(path.join(root, file), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
test.beforeEach(async ({ page }) => { await unterdrueckeOnboardingPopups(page); });

for (const item of FORM_LESSONS) test(`${item.id}: Lösung, gleichwertige Beschriftung, offener Starter`, async ({ page }) => {
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  const result = await page.evaluate(async ({ code, id }) => {
    const api = new Function(`${code}\nreturn {LESSONS,solutionFor,starterFor,validateProject};`)();
    const lesson = api.LESSONS.find(item => item.id === id); const files = api.solutionFor(lesson);
    const alternate = structuredClone(files);
    alternate['index.html'].content = alternate['index.html'].content.replaceAll('kontaktname', 'eigener-name').replace('<label for="eigener-name">Dein Name</label><input class="feld" id="eigener-name" name="eigener-name" type="text"', '<label>Kontaktperson<input class="feld" id="eigener-name" name="eigener-name" type="text"').replace(/(name="eigener-name" type="text"[^>]*>)/, '$1</label>');
    const missingLabels = structuredClone(files); missingLabels['index.html'].content = missingLabels['index.html'].content.replaceAll('<label ', '<span ').replaceAll('<label>', '<span>').replaceAll('</label>', '</span>');
    const check = async files => (await api.validateProject(files, lesson, 'form-test')).passed;
    return { solution: await check(files), alternate: await check(alternate), starter: await check(api.starterFor(lesson)), missingLabels: await check(missingLabels), frames: document.querySelectorAll('iframe').length };
  }, { code, id: item.id });
  expect(result).toEqual({ solution: true, alternate: true, starter: false, missingLabels: false, frames: 0 });
});

async function openForm(page, lesson = 'formular-projekt') {
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption(lesson);
  const files = await page.evaluate(({ code, id }) => { const api = new Function(`${code}\nreturn {LESSONS,solutionFor};`)(); return api.solutionFor(api.LESSONS.find(item => item.id === id)); }, { code, id: lesson });
  page.once('dialog', dialog => dialog.accept());
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'formular.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  return files;
}

test('Echte Vorschau: Labels, Auswahl, native Fehlermeldungen, Enter und gültige lokale Abgabe', async ({ page }) => {
  await openForm(page);
  const frame = page.frameLocator('iframe[title="Dein Projekt"]');
  await frame.locator('label[for="kontaktname"]').click();
  await expect(frame.getByLabel('Dein Name', { exact: true })).toBeFocused();
  await frame.getByRole('button', { name: 'Eingaben prüfen', exact: true }).click();
  await expect(page.getByText('Die Browserprüfung findet noch offene oder ungültige Felder. Korrigiere die angezeigte Eingabe. Es wurde nichts gesendet.', { exact: true })).toBeVisible();
  await expect(frame.locator('#kontaktname')).toBeFocused();
  await frame.locator('#kontaktname').fill('Beispiel');
  await frame.locator('#email').fill('falsch@');
  await frame.locator('#email').press('Enter');
  expect(await frame.locator('#email').evaluate(node => node.validity.typeMismatch)).toBe(true);
  await frame.locator('#email').fill('probe@example.invalid');
  await frame.locator('#plaetze').fill('1.5');
  expect(await frame.locator('#plaetze').evaluate(node => node.validity.stepMismatch)).toBe(true);
  await frame.locator('#plaetze').fill('2');
  await frame.locator('#nachricht').fill('Eine rein lokale Übung.\nNoch eine Zeile.');
  await frame.locator('#thema').selectOption('projekt');
  await frame.getByLabel('Vormittag', { exact: true }).check();
  await frame.getByLabel('Nachmittag', { exact: true }).check();
  await expect(frame.getByLabel('Vormittag', { exact: true })).not.toBeChecked();
  await frame.getByLabel('Materialliste gewünscht (freiwillig)', { exact: true }).check();
  await frame.getByRole('button', { name: 'Eingaben prüfen', exact: true }).click();
  await expect(page.getByText('Die lokale Browserprüfung ist bestanden. Es wurde nichts gesendet; deine Eingaben werden nicht gespeichert.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Element untersuchen', exact: true }).click();
  await expect(frame.locator('#kontaktname')).toHaveValue('');
  await expect(page).toHaveURL(/frontendkurs$/);
});

test('Formularprüfung erkennt falsche Grenzen, unsichtbare Labels und deaktivierte Scheinlösungen', async ({ page }) => {
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  const result = await page.evaluate(async code => {
    const api = new Function(`${code}\nreturn {LESSONS,solutionFor,validateProject};`)();
    const lesson = api.LESSONS.find(item => item.id === 'formular-projekt');
    const check = async (change, css = '') => { const files = api.solutionFor(lesson); change?.(files); files['css/style.css'].content += `\n${css}`; return (await api.validateProject(files, lesson, 'negative')).passed; };
    const replace = (from, to) => files => { files['index.html'].content = files['index.html'].content.replace(from, to); };
    return {
      wrongLabel: await check(replace('for="email"', 'for="nicht-da"')),
      duplicateId: await check(replace('<label for="email">', '<span id="email"></span><label for="email">')),
      disabled: await check(replace('name="email"', 'name="email" disabled')),
      readonly: await check(replace('name="email"', 'name="email" readonly')),
      noValidate: await check(replace('method="post"', 'method="post" novalidate')),
      wrongMax: await check(replace('max="8"', 'max="80"')),
      wrongStep: await check(replace('step="1"', 'step="any"')),
      optionalRequired: await check(replace('name="telefon"', 'name="telefon" required')),
      wrongGroup: await check(replace('name="zeit" value="nachmittag"', 'name="andere-zeit" value="nachmittag"')),
      duplicateChoices: await check(replace('value="projekt"', 'value="einstieg"')),
      noLegend: await check(replace('<legend>Gewünschte Zeit (Pflicht)</legend>', '')),
      missingHint: await check(replace('aria-describedby="platz-hilfe"', 'aria-describedby="nicht-da"')),
      hiddenLabel: await check(null, '.formular label {color:white;}'),
      hiddenChildLabel: await check(replace('> Vormittag</label>', '> <span style="display:none">Vormittag</span></label>')),
      invisibleText: await check(null, '.formular .feld {color:white;background-color:white;}'),
      wrongOwner: await check(replace('name="email"', 'name="email" form="anderes-formular"')),
      tooWide: await check(null, '.formular .feld {width:900px;}'),
      focusMissing: await check(null, 'input:focus-visible,textarea:focus-visible,select:focus-visible,button:focus-visible {outline:none;}'),
      nameClobbering: await check(replace('name="kontaktname"', 'name="reportValidity"')),
      contents: await check(null, '.formular {display:contents;}'),
      secondPage: await check(files => { const markup = files['index.html'].content.match(/<section class="formularbereich"[\s\S]*?<\/section>/)[0]; files['index.html'].content = files['index.html'].content.replace(markup, ''); files['ueber-uns.html'].content = files['ueber-uns.html'].content.replace('</main>', `${markup}</main>`); }),
      frames: document.querySelectorAll('iframe').length,
    };
  }, code);
  expect(result).toEqual({ wrongLabel: false, duplicateId: false, disabled: false, readonly: false, noValidate: false, wrongMax: false, wrongStep: false, optionalRequired: false, wrongGroup: false, duplicateChoices: false, noLegend: false, missingHint: false, hiddenLabel: false, hiddenChildLabel: false, invisibleText: false, wrongOwner: false, tooWide: false, focusMissing: false, nameClobbering: true, contents: true, secondPage: true, frames: 0 });
});

test('Formularziele, Uploads und direkte Abgabe bleiben gesperrt; Inspektor verträgt kollidierende Feldnamen', async ({ page }) => {
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('formular-projekt');
  const files = await page.evaluate(code => {
    const api = new Function(`${code}\nreturn {LESSONS,solutionFor};`)(); const files = api.solutionFor(api.LESSONS.find(item => item.id === 'formular-projekt'));
    files['index.html'].content = files['index.html'].content.replace('method="post"', 'method="post" action="https://example.invalid/collect" target="_top"').replace('name="kontaktname"', 'name="dataset"').replace('name="email"', 'name="closest"').replace('name="telefon"', 'name="matches"').replace('name="nachricht"', 'name="reportValidity"').replace('name="zeit"', 'name="parentElement"').replace('<button type="submit">', '<input type="file" name="datei"><button type="submit" formaction="http://127.0.0.1:11434/collect" formtarget="_blank">');
    return files;
  }, code);
  let outgoing = 0; const errors = [];
  page.on('request', request => { if (/example\.invalid|11434|\/api\/ai\//.test(request.url())) outgoing++; });
  page.on('pageerror', error => errors.push(error.message));
  page.once('dialog', dialog => dialog.accept());
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'sicheres-formular.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  const frame = page.frameLocator('iframe[title="Dein Projekt"]');
  await expect(frame.locator('input[type="file"]')).toHaveCount(0);
  await expect(frame.locator('form')).not.toHaveAttribute('action');
  await expect(frame.locator('form')).not.toHaveAttribute('target');
  await expect(frame.locator('button[type="submit"]')).not.toHaveAttribute('formaction');
  await frame.locator('form').evaluate(form => { form.dispatchEvent(new MouseEvent('click', { bubbles: true })); Object.getPrototypeOf(form).submit.call(form); Object.getPrototypeOf(form).requestSubmit.call(form); });
  // Playwrights eigene Rollenauflösung wird durch parentElement-Clobbering
  // gestört. Hier den nativen Klick prüfen; normale Bedienung ist oben erfasst.
  await frame.locator('button[type="submit"]').evaluate(button => HTMLElement.prototype.click.call(button));
  await expect(page.getByText(/Die Browserprüfung findet noch offene/)).toBeVisible();
  await page.getByRole('button', { name: 'Element untersuchen', exact: true }).click();
  const id = await frame.locator('form').evaluate(form => Element.prototype.getAttribute.call(form, 'data-pilot-node'));
  await page.getByLabel('Element per Tastatur untersuchen').selectOption(id);
  await expect(page.locator('.pilot-inspector')).toContainText('form in index.html');
  await expect(page.locator('.pilot-inspector')).toContainText('<form');
  expect(outgoing).toBe(0); expect(errors).toEqual([]);
  expect(page.context().pages()).toHaveLength(1);
  await expect(page.locator('iframe[title="Dein Projekt"]')).toHaveAttribute('sandbox', 'allow-same-origin');
  await expect(page).toHaveURL(/frontendkurs$/);
});

test('Alle Lektionen und alte Ergebnisse überstehen Neustart; getippte Vorschauwerte werden nicht exportiert', async ({ page }) => {
  const files = await openForm(page);
  const frame = page.frameLocator('iframe[title="Dein Projekt"]');
  await frame.locator('#kontaktname').fill('NUR_LOKALE_VORSCHAU_123');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sicherung exportieren (JSON)' }).click();
  const exported = fs.readFileSync(await (await download).path(), 'utf8');
  expect(exported).not.toContain('NUR_LOKALE_VORSCHAU_123');
  expect(JSON.parse(exported).files).toEqual(files);
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.', { exact: true })).toBeVisible();
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  await page.reload(); await openWorkshopTools(page);
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('formular-projekt');
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option')).toHaveCount(82);
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option:checked')).toContainText('Prüfung bestanden');
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await expect(frame.locator('#kontaktname')).toHaveValue('');
});
