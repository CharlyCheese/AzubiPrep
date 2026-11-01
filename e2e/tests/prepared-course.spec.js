import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from '../../frontend/node_modules/esbuild/lib/main.js';
import { READING_CHAPTERS as PREPARED_CHAPTERS } from '../../frontend/src/pilot/prepared/catalog.js';
import { plannerHtml } from '../../frontend/src/pilot/prepared/shared.js';
import { plannerSolution } from '../../frontend/src/pilot/prepared/ch23.js';
import { reactPlanner } from '../../frontend/src/pilot/prepared/ch30.js';
import { portalSolution } from '../../frontend/src/pilot/prepared/ch31.js';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
async function open(page) {
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  await page.getByRole('button', { name: 'Kapitel 19–31 lesen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Weitere Kurskapitel' })).toBeVisible();
}

test('Alle 77 Lektionen lesbar; keine Laufzeit/Prüfung/KI aus der Inhaltsfassung', async ({ page }) => {
  test.setTimeout(120000);
  let aiCalls = 0; await page.route('**/api/ai/**', route => { aiCalls++; return route.fulfill({ json: {} }); });
  await open(page);
  const callsOnOpen = aiCalls;
  await expect(page.getByText('Inhaltsfassung · Kapitel 19–31 · 77 Referenzlektionen', { exact: true })).toBeVisible();
  for (const chapter of PREPARED_CHAPTERS) {
    await page.getByLabel('Kapitel der Inhaltsfassung', { exact: true }).selectOption(String(chapter.number));
    await expect(page.getByLabel('Lektion der Inhaltsfassung', { exact: true }).locator('option')).toHaveCount(chapter.lessons.length);
    for (const lesson of chapter.lessons) {
      await page.getByLabel('Lektion der Inhaltsfassung', { exact: true }).selectOption(lesson.id);
      await expect(page.getByRole('heading', { name: lesson.title, exact: true })).toBeVisible();
      await expect(page.getByText('Lesefassung · praktische Übungen in der Lektionsauswahl', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Aufgabe prüfen', exact: true })).toHaveCount(0);
      await expect(page.locator('iframe')).toHaveCount(0);
    }
  }
  expect(aiCalls).toBe(callsOnOpen);
});

test('Mobil, gestufte Hinweise, Lösung, Download und Navigation per Tastatur', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 }); await open(page);
  const hint = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Schrittweise Hinweise' }) });
  await hint.locator(':scope > summary').focus(); await page.keyboard.press('Enter');
  await hint.getByRole('button', { name: 'Nächsten Hinweis zeigen' }).click();
  await expect(hint.locator('p')).toHaveCount(1);
  await hint.getByRole('button', { name: 'Nächsten Hinweis zeigen' }).click();
  await expect(hint.locator('p')).toHaveCount(2);
  const solution = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Musterlösung bewusst ansehen' }) });
  expect(await solution.evaluate(node => node.open)).toBe(false);
  await solution.locator(':scope > summary').press('Enter');
  await expect(solution.locator('pre')).toContainText('Erwartung für die Beispieldaten');
  expect(await solution.locator('pre').textContent()).toContain('\n');
  await page.getByText('Lektion mit Lösung als Text mitnehmen', { exact: true }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Lektion einschließlich Lösung herunterladen' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('kapitel-19-lektion-1.txt');
  const text = await fs.readFile(await download.path(), 'utf8');
  expect(text).toContain('Lesefassung · praktische Übungen in der Lektionsauswahl'); expect(text).toContain('Erwartung für die Beispieldaten');
  await page.getByRole('button', { name: 'Nächste Lektion →' }).click();
  await expect(page.getByRole('heading', { name: 'Auswertung in kleinen Bausteinen bauen' })).toBeFocused();
  expect(await page.locator('details').filter({ has: page.locator('summary', { hasText: 'Musterlösung bewusst ansehen' }) }).evaluate(node => node.open)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),await page.locator('.prepared-course').evaluate(root=>JSON.stringify([...root.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1||e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName,text:e.textContent.slice(0,100),client:e.clientWidth,scroll:e.scrollWidth}))))).toBe(true);
  await page.screenshot({ path: info.outputPath('inhaltsfassung-mobil.png') });
});

test('Zurück erhält bisherigen Entwurf und die 90 eingebundenen Übungen', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  await expect(page.getByLabel('Lektion', { exact: true }).locator('option')).toHaveCount(167);
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Code index.html', exact: true });
  await editor.fill('<h1>Mein synthetischer Entwurf</h1><p>Erhalten</p>');
  await page.getByRole('button', { name: 'Kapitel 19–31 lesen', exact: true }).click();
  await page.getByRole('button', { name: '← Zurück zu den Übungen 1–31' }).click();
  await expect(editor).toHaveValue('<h1>Mein synthetischer Entwurf</h1><p>Erhalten</p>');
  await expect(page.getByLabel('Lektion', { exact: true }).locator('option')).toHaveCount(167);
});

test('Fehlender Inhaltschunk lässt Rückweg und Entwurf bedienbar', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  await page.route('**/assets/PreparedCourse-*.js', route => route.abort());
  await page.getByRole('button', { name: 'Kapitel 19–31 lesen', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('konnten nicht geladen');
  await page.getByRole('button', { name: '← Zurück zu den Übungen 1–31' }).click();
  await expect(page.getByLabel('Lektion', { exact: true }).locator('option')).toHaveCount(167);
  await expect(page.getByRole('button', { name: 'Kapitel 19–31 lesen', exact: true })).toBeFocused();
});

test('Wechsel während Prüfung übernimmt keinen abgebrochenen Prüfstand', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    buttons.find(button => button.textContent === 'Aufgabe prüfen').click();
    buttons.find(button => button.textContent === 'Kapitel 19–31 lesen').click();
  });
  await expect(page.getByRole('region', { name: 'Weitere Kurskapitel' })).toBeVisible();
  await page.getByRole('button', { name: '← Zurück zu den Übungen 1–31' }).click();
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toHaveCount(0);
});

// Autorenreferenzen auf frischen, synthetischen Seiten prüfen. Dies ist kein
// Nachweis für die noch fehlende Ausführung beliebigen Lerncodes in der Werkstatt.
test('Lernplan-Referenz: IDs, Fokus, sichere Ausgabe und Persistenz', async ({ page }) => {
  const html = plannerHtml.replace(/<script[^>]*>.*?<\/script>/s, '');
  await page.route('**/reference-plan', route => route.fulfill({ contentType: 'text/html', body: html }));
  async function load() { await page.goto('/reference-plan'); await page.addScriptTag({ content: plannerSolution }); }
  await load();
  for (const minutes of ['20', '30']) {
    await page.getByLabel('Lernziel', { exact: true }).fill('<strong>Gleicher Titel</strong>');
    await page.getByLabel('Minuten', { exact: true }).fill(minutes); await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();
  }
  await expect(page.locator('#tasks li')).toHaveCount(2); await expect(page.locator('#tasks strong')).toHaveCount(0);
  await page.getByRole('button', { name: 'Erledigen: <strong>Gleicher Titel</strong>', exact: true }).first().click();
  await expect(page.locator('#summary')).toHaveText('1 offen · 30 Minuten');
  await expect(page.getByRole('button', { name: 'Wieder öffnen: <strong>Gleicher Titel</strong>', exact: true })).toBeFocused();
  await load(); await expect(page.locator('#tasks li')).toHaveCount(2); await expect(page.locator('#summary')).toHaveText('1 offen · 30 Minuten');
  await page.evaluate(() => localStorage.setItem('lernplan-v1', '{kaputt'));
  await load(); await expect(page.locator('#message')).toContainText('unverändert');
  expect(await page.evaluate(() => localStorage.getItem('lernplan-v1'))).toBe('{kaputt');
});

async function reactBundle(source) {
  const frontend = fileURLToPath(new URL('../../frontend/', import.meta.url));
  const guard = PREPARED_CHAPTERS.find(chapter => chapter.number === 29).lessons[4].solution.replace('function isTask', 'export function isTask');
  const result = await build({
    stdin: { contents: source + '\nimport { createRoot } from "react-dom/client"; createRoot(document.getElementById("root")).render(<App />);', loader: 'tsx', resolveDir: frontend },
    absWorkingDir: frontend, bundle: true, write: false, format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'course-validation', setup(builder) {
      builder.onResolve({ filter: /^\.\/validation$/ }, () => ({ path: 'validation.ts', namespace: 'course' }));
      builder.onLoad({ filter: /.*/, namespace: 'course' }, () => ({ contents: guard, loader: 'ts' }));
    } }],
  });
  return result.outputFiles[0].text;
}
for (const [name, source] of [['React-Lernplan', reactPlanner], ['Abschlussportal', portalSolution]]) {
  test(`${name}: Referenz mit tatsächlichem Zustand, Routen und Fehlererholung`, async ({ page }) => {
    const bundle = await reactBundle(source);
    await page.route('**/*', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="de"><head><title>Referenztest</title></head><body><div id="root"></div></body></html>' }));
    await page.goto('/'); await page.addScriptTag({ content: bundle });
    await page.getByLabel('Lernziel', { exact: true }).fill('Neues Testziel');
    await page.getByLabel('Minuten', { exact: true }).fill('25'); await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();
    await expect(page.getByText('1 offen · 25 Minuten', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Neues Testziel', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Lernziel im Detail' })).toBeFocused();
    await page.getByRole('link', { name: 'Zur Übersicht', exact: true }).click();
    await page.getByRole('button', { name: 'Erledigen: Neues Testziel', exact: true }).click();
    await expect(page.getByText('0 offen · 0 Minuten', { exact: true })).toBeVisible();
    if (name === 'Abschlussportal') {
      await page.getByRole('link', { name: 'Lernkatalog', exact: true }).click();
      await expect(page.getByText('3 Treffer', { exact: true })).toBeVisible();
      await page.getByLabel('Titel suchen', { exact: true }).fill(' CSS '); await expect(page.getByText('1 Treffer', { exact: true })).toBeVisible();
      await page.getByLabel('Vorbereiteten Ladefehler testen').check(); await expect(page.getByText('Katalog nicht verfügbar. Erneut versuchen.', { exact: true })).toBeVisible();
      await page.getByLabel('Vorbereiteten Ladefehler testen').uncheck(); await expect(page.getByText('1 Treffer', { exact: true })).toBeVisible();
    }
  });
}


test('Mobile Lesefassung bricht lange Datentokens und Downloads bei verschiedenen Schriftmaßen um',async({page})=>{
 test.setTimeout(60000);await page.setViewportSize({width:390,height:844});await open(page);await page.getByRole('button',{name:'Nächste Lektion →',exact:true}).click();const heading=page.getByRole('heading',{name:'Auswertung in kleinen Bausteinen bauen'});await expect(heading).toBeFocused();
 for(const font of ['Arial','Tahoma','monospace'])for(const width of [320,390]){await page.setViewportSize({width,height:844});await page.evaluate(font=>{document.documentElement.style.setProperty('--font',font);document.documentElement.style.fontSize='18px';},font);await page.getByText('Lektion mit Lösung als Text mitnehmen',{exact:true}).click();const download=page.getByRole('button',{name:'Lektion einschließlich Lösung herunterladen'});await expect(download).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),JSON.stringify({font,width})).toBe(true);const overflow=await page.locator('.prepared-course li, .prepared-course .btn').evaluateAll(nodes=>nodes.filter(e=>e.offsetParent!==null&&e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));expect(overflow,JSON.stringify({font,width})).toEqual([]);await page.getByText('Lektion mit Lösung als Text mitnehmen',{exact:true}).click();}
});
