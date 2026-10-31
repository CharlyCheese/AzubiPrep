import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JS16_LESSONS, js16CourseFiles } from '../../frontend/src/pilot/js16-course.js';
import { JS15_LESSONS, js15CourseFiles } from '../../frontend/src/pilot/js15-course.js';
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
for (const lesson of JS16_LESSONS) test(`${lesson.id}: Starter offen, Lösung und Alternative bestehen`, async ({ page }, info) => {
  await open(page); await select(page, lesson.id); await grade(page, false);
  await load(page, js16CourseFiles(lesson)); await grade(page, true);
  const files = js16CourseFiles(lesson);
  files['js/uebung.js'].content = `/* Andere Formatierung */\n${lesson.solution.replaceAll('"', "'")}`;
  if (lesson.id === 'js16-parameter') files['js/uebung.js'].content = 'function begruesse(name) { console.log(`Hallo ${name}!`); } begruesse(vorname);';
  if (lesson.id === 'js16-rueckgabewege') files['js/uebung.js'].content = 'function benenneAlter(jahre) { if(Number.isInteger(jahre) && jahre>=0 && jahre<=120) { if(jahre>=18) {return "Volljährig";} else {return "Minderjährig";} } else {return "Ungültig";} } console.log(benenneAlter(testAlter));';
  if (lesson.id === 'js16-blockreparatur') files['js/uebung.js'].content = 'function rabattPreis(preis,aktiv) { if(aktiv) {return preis-2;} return preis; } console.log(rabattPreis(listenPreis,rabattAktiv)); console.log(typeof abzug);';
  await load(page, files); await grade(page, true);
  if (lesson.id === 'js16-tarifbausteine') {
    await page.getByRole('button', { name: 'Lernen', exact: true }).click();
    await page.getByRole('region', { name: 'Lektionstext', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath('kapitel16-funktionen.png') });
  }
});

test('Fehlende Aufrufe, globale Abhängigkeit, console.log statt return und Bereichsfehler bleiben offen', async ({ page }) => {
  test.setTimeout(60000); await open(page);
  const mutations = [
    ['js16-aufrufen', s => s.replace('zeigeStart();\nzeigeStart();', '')],
    ['js16-parameter', s => s.replace('"Hallo " + person + "!"', '"Hallo " + vorname + "!"')],
    ['js16-argumente', s => s.replace('verfuegbar - kosten', 'kosten - verfuegbar')],
    ['js16-rueckgabe', s => s.replace('return zahl * 2;', 'console.log(zahl * 2);')],
    ['js16-rueckgabe', s => s.replace('return zahl * 2;', 'return\n  zahl * 2;')],
    ['js16-rueckgabewege', s => s.replace('return "Volljährig";', '')],
    ['js16-standardwerte', s => s.replace('return warenwert + versandPreis;', 'return warenwert + (versandPreis || 3);')],
    ['js16-lokal', s => s.replace('const punkte = wert + 5;', 'punkte = wert + 5;')],
    ['js16-blockreparatur', s => s.replace('let ergebnis = preis;', 'let ergebnis;')],
    ['js16-bausteine', s => s.replace('return stueckPreis * anzahl;', 'return grundpreis * menge;')],
    ['js16-bausteine', s => s.replace('return stueckPreis * anzahl;', 'console.log("zusätzlich"); return stueckPreis * anzahl;')],
    ['js16-tarifbausteine', s => s.replace('zahl >= minimum', 'zahl >= 0')],
    ['js16-tarifbausteine', s => s.replace('alter < 18', 'alter <= 18')],
  ];
  for (const [id, mutate] of mutations) {
    const lesson = JS16_LESSONS.find(item => item.id === id);
    await select(page,id); await load(page,js16CourseFiles(lesson));
    await code(page,mutate(lesson.solution)); await grade(page,false);
  }
});

test('Zeitgrenze und Fehlermeldung gelten auch bei erst im Prüfer aufgerufenen Funktionen', async ({ page }) => {
  await open(page); await select(page,'js16-rueckgabe'); await load(page,js16CourseFiles(JS16_LESSONS[3]));
  await code(page, 'function verdopple(zahl) { if (zahl === eingabe) { return zahl * 2; } while(true){} } const ergebnis=verdopple(eingabe);console.log(ergebnis);');
  await grade(page,false); await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Zeitgrenze');
  await code(page, 'function verdopple(zahl) { if (zahl === eingabe) { return zahl * 2; } return unbekannt; } const ergebnis=verdopple(eingabe);console.log(ergebnis);');
  await grade(page,false); await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Prüfaufruf fehlgeschlagen');
  await code(page, 'function verdopple(zahl) { if (zahl !== eingabe) { Promise.resolve().then(() => { while(true){} }); } return zahl*2; } const ergebnis=verdopple(eingabe);console.log(ergebnis);');
  await grade(page,false); await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Nachlaufende Arbeit');
  await code(page, 'function verdopple(zahl) { if (zahl !== eingabe) { Promise.resolve().then(() => console.log("Zusätzlich")); } return zahl*2; } const ergebnis=verdopple(eingabe);console.log(ergebnis);');
  await grade(page,false); await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Nachlaufende Arbeit');
  await code(page,JS16_LESSONS[3].solution); await grade(page,true);
});

test('Alle Projekte erhalten ältere Ergebnisse; Funktionsprojekt lässt sich ausführen und sichern', async ({ page }) => {
  await open(page); await select(page,'js15-tarifprojekt'); await load(page,js15CourseFiles(JS15_LESSONS.at(-1))); await grade(page,true);
  await select(page,'js16-tarifbausteine'); const files=js16CourseFiles(JS16_LESSONS.at(-1)); await load(page,files); await grade(page,true);
  await page.getByRole('button',{name:'Vorschau / Konsole',exact:true}).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Noch keine Ausgabe.');
  await page.getByRole('button',{name:'Kursprogramm ausführen',exact:true}).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Gesamt: 24 Euro');
  await page.getByRole('checkbox',{name:'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen'}).check();
  await expect(page.frameLocator('iframe[title="Dein Projekt"]').locator('[data-azubi-course-output] pre')).toHaveText('Gesamt: 24 Euro');
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  const download=page.waitForEvent('download'); await page.getByRole('button',{name:'Sicherung exportieren (JSON)',exact:true}).click();
  const snapshot=JSON.parse(await readFile(await(await download).path(),'utf8')); expect(snapshot.files).toEqual(files);
  await page.reload(); await openWorkshopTools(page); await select(page,'js16-tarifbausteine'); await page.getByRole('button',{name:'Prüfen',exact:true}).click();
  await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await select(page,'js15-tarifprojekt'); await page.getByRole('button',{name:'Prüfen',exact:true}).click();
  await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await expect(page.getByRole('combobox',{name:'Lektion',exact:true}).locator('option')).toHaveCount(82);
});

test('Electron: Funktionen separat prüfen, normal ausführen und nach Neustart fortsetzen', async ({},info) => {
  test.setTimeout(90000);
  const desktop=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../desktop');
  const env={...process.env,DATABASE_URL:''}; delete env.ELECTRON_RUN_AS_NODE;
  const options={executablePath:path.join(desktop,'node_modules/electron/dist/electron.exe'),args:[desktop,`--user-data-dir=${info.outputPath('profile')}`],env};
  let app;
  try {
    app=await _electron.launch(options); let page=await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page,`${new URL(page.url()).origin}/frontendkurs`); await select(page,'js16-tarifbausteine');
    await load(page,js16CourseFiles(JS16_LESSONS.at(-1))); await grade(page,true);
    await page.getByRole('button',{name:'Vorschau / Konsole',exact:true}).click(); await page.getByRole('button',{name:'Kursprogramm ausführen',exact:true}).click();
    await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Gesamt: 24 Euro');
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert'); await app.close(); app=null;
    app=await _electron.launch(options); page=await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page,`${new URL(page.url()).origin}/frontendkurs`); await select(page,'js16-tarifbausteine'); await page.getByRole('button',{name:'Prüfen',exact:true}).click();
    await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  } finally {if(app) await app.close();}
});
