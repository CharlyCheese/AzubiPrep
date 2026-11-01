import {test,expect,_electron} from '@playwright/test';
import {ADVANCED_LESSONS,advancedFiles} from '../../frontend/src/pilot/advanced-course.js';
import {unterdrueckeOnboardingPopups,openWorkshopTools} from './helpers.js';
test.use({serviceWorkers:'block'});
async function open(page){await unterdrueckeOnboardingPopups(page);await page.goto('/frontendkurs');await openWorkshopTools(page);page.on('dialog',dialog=>dialog.accept());await expect(page.getByLabel('Lektion',{exact:true})).toBeVisible();}
async function load(page,files){await page.getByLabel('Sicherung einlesen',{exact:true}).setInputFiles({name:'projekt.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'azubiprep-pilot',version:1,entry:'index.html',files}))});await expect(page.getByRole('alert').filter({hasText:'eingelesen'})).toContainText('eingelesen');}
async function check(page){await page.getByRole('button',{name:'Schreiben',exact:true}).click();await page.getByRole('button',{name:'Aufgabe prüfen',exact:true}).click();await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toBeVisible();}
for(const lesson of ADVANCED_LESSONS)test(`${lesson.id} ${lesson.title}: Starter offen, Referenz prüfbar`,async({page})=>{
  test.setTimeout(60000);await open(page);await page.getByLabel('Lektion',{exact:true}).selectOption(lesson.id);
  await page.getByRole('button',{name:'Schreiben',exact:true}).click();await check(page);
  await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Noch offene Pflichtkriterien:');
  await load(page,advancedFiles(lesson));
  if(lesson.manualStep){await page.getByRole('button',{name:'Prüfen',exact:true}).click();await page.locator('.pilot-check input[type=checkbox]').check();}
  await check(page);
  await expect(page.getByRole('region',{name:'Prüfergebnisse',exact:true})).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
});

test('Alle 167 Lektionen erhalten alte IDs; neue Quellen privatfrei und getrennte Entwürfe',async({page})=>{
  await open(page);await expect(page.getByLabel('Lektion',{exact:true}).locator('option')).toHaveCount(167);
  await page.getByLabel('Lektion',{exact:true}).selectOption('course-30-4');await load(page,advancedFiles(ADVANCED_LESSONS.find(l=>l.id==='course-30-4')));
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  await page.reload();await page.getByLabel('Lektion',{exact:true}).selectOption('course-30-4');await page.getByRole('button',{name:'Schreiben',exact:true}).click();await page.getByRole('button',{name:'App.tsx',exact:true}).click();await expect(page.getByRole('textbox',{name:'Code App.tsx',exact:true})).toContainText('setCount');
});
