import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JS17_LESSONS, js17CourseFiles } from '../../frontend/src/pilot/js17-course.js';
import { JS16_LESSONS, js16CourseFiles } from '../../frontend/src/pilot/js16-course.js';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
async function open(page, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url); await openWorkshopTools(page);
  page.on('dialog', dialog => dialog.accept());
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toBeVisible();
}
async function select(page, id) { await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption(id); }
async function load(page, files) {
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'projekt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, entry: 'index.html', files })) });
  await expect(page.getByRole('alert')).toContainText('eingelesen');
}
async function grade(page, passed) {
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText(passed ? 'Dieser eingereichte Stand hat die Pflichtprüfung bestanden' : 'Noch offene Pflichtkriterien:');
}
async function code(page, source) {
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'js/uebung.js', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code js/uebung.js', exact: true }).fill(source);
}
for (const lesson of JS17_LESSONS) test(`${lesson.id}: Starter offen, Lösung und gleichwertige Alternative`, async ({ page }, info) => {
  await open(page); await select(page, lesson.id); await grade(page, false);
  await load(page, js17CourseFiles(lesson)); await grade(page, true);
  const files = js17CourseFiles(lesson);
  files['js/uebung.js'].content = `/* Eigene Formatierung */\n${lesson.solution.replaceAll('"', "'")}`;
  if (lesson.id === 'js17-for') files['js/uebung.js'].content = lesson.solution.replace('index = index + 1', 'index++').replace('summe = summe + liste[index]', 'summe += liste[index]');
  if (lesson.id === 'js17-forof') files['js/uebung.js'].content = 'function zaehleAb(liste,grenze) { let n=0; for(let i=0;i<liste.length;i++){if(liste[i]>=grenze){n=n+1;}} return n; } const anzahl=zaehleAb(zahlen,mindestwert);console.log(anzahl);';
  if (lesson.id === 'js17-kopien') files['js/uebung.js'].content = 'const kopie={name:vorlage.name,preisCent:vorlage.preisCent,bestand:vorlage.bestand+1};const originalBestand=vorlage.bestand;console.log(originalBestand);console.log(kopie.bestand);';
  if (lesson.id === 'js17-aufgabenprojekt') files['js/uebung.js'].content = lesson.solution.replace('{ offen: 0, restMinuten: 0, titel: [] }','{ titel: [], restMinuten: 0, offen: 0 }').replace('!aufgabe.erledigt','aufgabe.erledigt === false');
  await load(page, files); await grade(page, true);
  if (lesson.id === 'js17-aufgabenprojekt') {
    await page.getByRole('button', { name: 'Lernen', exact: true }).click();
    await page.getByRole('region', { name: 'Lektionstext', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath('kapitel17-aufgaben.png') });
  }
});

test('Indexgrenzen, Zähler, Stopwert, Reihenfolge und falsche Objektschlüssel werden erkannt', async ({ page }) => {
  test.setTimeout(60000); await open(page);
  const mutations = [
    ['js17-arraystart', s => s.replace('lernziele.length - 1', 'lernziele.length')],
    ['js17-for', s => s.replace('index < liste.length', 'index <= liste.length')],
    ['js17-forof', s => s.replace('wert >= grenze', 'wert > grenze')],
    ['js17-while', s => s.replace('wert < ziel', 'wert <= ziel')],
    ['js17-abbrechen', s => s.replace('if (wert === 0) { break; }', 'if (wert === 0) { continue; }')],
    ['js17-abbrechen', s => s.replace('if (wert < 0) { continue; }', '')],
    ['js17-zahlenprojekt', s => s.replace('wert > 0', 'wert >= 0')],
    ['js17-objekte', s => s.replace('produkt[eigenschaft]', 'produkt.eigenschaft')],
    ['js17-produkte', s => s.replace('produkt.preisCent * produkt.bestand', 'produkt.preisCent')],
    ['js17-aufgabenprojekt', s => s.replace('if (!aufgabe.erledigt)', 'if (aufgabe.erledigt)')],
    ['js17-aufgabenprojekt', s => s.replace('ergebnis.titel.push(aufgabe.titel);', 'ergebnis.titel.unshift(aufgabe.titel);')],
  ];
  for (const [id, mutate] of mutations) {
    const lesson=JS17_LESSONS.find(item=>item.id===id);
    await select(page,id); await load(page,js17CourseFiles(lesson)); await code(page,mutate(lesson.solution)); await grade(page,false);
  }
});

test('Unabhängige Prüfdaten verhindern bestandene Aufgaben nach Mutation der Eingabearrays und Objekte', async ({ page }) => {
  await open(page); await select(page,'js17-for'); await load(page,js17CourseFiles(JS17_LESSONS[2]));
  await code(page,JS17_LESSONS[2].solution.replace('return summe;', 'liste[0] = 999; return summe;')); await grade(page,false);
  await select(page,'js17-kopien'); await load(page,js17CourseFiles(JS17_LESSONS[8]));
  await code(page,JS17_LESSONS[8].solution.replace('{ ...vorlage }','vorlage')); await grade(page,false);
  await select(page,'js17-aufgabenprojekt'); await load(page,js17CourseFiles(JS17_LESSONS[10]));
  await code(page,JS17_LESSONS[10].solution.replace('ergebnis.titel.push(aufgabe.titel);', 'ergebnis.titel.push(aufgabe.titel); aufgabe.erledigt = true;')); await grade(page,false);
  await code(page,JS17_LESSONS[10].solution); await grade(page,true);
});

test('Auch Objektzugriffe während der Probe bleiben im begrenzten Interpreter', async ({ page }) => {
  await open(page); await select(page,'js17-aufgabenprojekt'); const lesson=JS17_LESSONS[10]; await load(page,js17CourseFiles(lesson));
  await code(page,lesson.solution.replace('function werteAufgabenAus(liste) {', 'function werteAufgabenAus(liste) { if(liste !== aufgaben) { return { get offen() { while(true){} } }; }'));
  await grade(page,false); await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Zeitgrenze');
  await code(page,lesson.solution); await grade(page,true);
});

test('Strukturierte Testdaten ausführen und sichern; ältere Prüfung und 82 Projekte erhalten', async ({ page }) => {
  await open(page); await select(page,'js16-tarifbausteine'); await load(page,js16CourseFiles(JS16_LESSONS.at(-1))); await grade(page,true);
  await select(page,'js17-aufgabenprojekt'); const files=js17CourseFiles(JS17_LESSONS.at(-1)); await load(page,files); await grade(page,true);
  await page.getByRole('button',{name:'Vorschau / Konsole',exact:true}).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Noch keine Ausgabe.');
  await page.getByRole('button',{name:'Kursprogramm ausführen',exact:true}).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('2\n35\nHTML üben\nJavaScript testen');
  await page.getByRole('checkbox',{name:'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen'}).check();
  await expect(page.frameLocator('iframe[title="Dein Projekt"]').locator('[data-azubi-course-output] pre')).toHaveText('2\n35\nHTML üben\nJavaScript testen');
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  const download=page.waitForEvent('download'); await page.getByRole('button',{name:'Sicherung exportieren (JSON)',exact:true}).click();
  expect(JSON.parse(await readFile(await(await download).path(),'utf8')).files).toEqual(files);
  await page.reload(); await openWorkshopTools(page); await select(page,'js17-aufgabenprojekt'); await page.getByRole('button',{name:'Prüfen',exact:true}).click();
  await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await select(page,'js16-tarifbausteine'); await page.getByRole('button',{name:'Prüfen',exact:true}).click();
  await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await expect(page.getByRole('combobox',{name:'Lektion',exact:true}).locator('option')).toHaveCount(82);
});

test('Electron: strukturierte Daten prüfen und nach vollständigem Neustart fortsetzen', async ({},info) => {
  test.setTimeout(90000); const desktop=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../desktop');
  const env={...process.env,DATABASE_URL:''}; delete env.ELECTRON_RUN_AS_NODE;
  const options={executablePath:path.join(desktop,'node_modules/electron/dist/electron.exe'),args:[desktop,`--user-data-dir=${info.outputPath('profile')}`],env}; let app;
  try {
    app=await _electron.launch(options); let page=await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page,`${new URL(page.url()).origin}/frontendkurs`); await select(page,'js17-aufgabenprojekt'); await load(page,js17CourseFiles(JS17_LESSONS.at(-1))); await grade(page,true);
    await page.getByRole('button',{name:'Vorschau / Konsole',exact:true}).click(); await page.getByRole('button',{name:'Kursprogramm ausführen',exact:true}).click();
    await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('2\n35\nHTML üben\nJavaScript testen');
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert'); await app.close(); app=null;
    app=await _electron.launch(options); page=await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page,`${new URL(page.url()).origin}/frontendkurs`); await select(page,'js17-aufgabenprojekt'); await page.getByRole('button',{name:'Prüfen',exact:true}).click();
    await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  } finally { if(app) await app.close(); }
});
