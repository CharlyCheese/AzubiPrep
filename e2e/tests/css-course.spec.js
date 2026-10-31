import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSS_LESSONS } from '../../frontend/src/pilot/css-course.js';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/src/pilot');
const code = ['project.js', 'preview.js', 'css-course.js', 'form-course.js', 'js-course.js', 'js15-course.js', 'js16-course.js', 'js17-course.js', 'course.js', 'css-checks.js', 'layout-checks.js', 'form-checks.js', 'validator.js'].map(file => fs.readFileSync(path.join(root, file), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
test.beforeEach(async ({ page }) => { await unterdrueckeOnboardingPopups(page); });

for (const item of CSS_LESSONS) test(`${item.id}: Lösung und Alternative bestehen, Starter und fehlende Technik bleiben offen`, async ({ page }) => {
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  const result = await page.evaluate(async ({ code, id }) => {
    const api = new Function(`${code}\nreturn { LESSONS, solutionFor, starterFor, validateProject };`)();
    const lesson = api.LESSONS.find(item => item.id === id);
    const solution = api.solutionFor(lesson);
    const alternate = structuredClone(solution);
    for (const file of Object.values(alternate)) if (file.kind === 'text') file.content = file.content.replaceAll('Wir lernen in kleinen Schritten', 'Wir entdecken neue Möglichkeiten').replaceAll('#17324d', 'rgb(23, 50, 77)');
    if (lesson.cssStep >= 19) for (const file of Object.values(alternate)) if (file.kind === 'text') file.content = file.content.replaceAll('karten', 'angebote').replaceAll('karte', 'angebot').replaceAll('merkkasten', 'zusatz').replaceAll('gruppenbild', 'zeichen');
    const noCSS = structuredClone(solution); noCSS['css/style.css'].content = '';
    const check = files => api.validateProject(files, lesson, 'css-suite');
    const valid = await check(solution); const alt = await check(alternate);
    return { valid: valid.passed, alternate: alt.passed, starter: (await check(api.starterFor(lesson))).passed, noCSS: (await check(noCSS)).passed,
      failed: valid.results.filter(item => !item.passed).map(item => ({ rule: item.rule, file: item.file })), frames: document.querySelectorAll('iframe').length };
  }, { code, id: item.id });
  expect(result, item.id).toEqual({ valid: true, alternate: true, starter: false, noCSS: false, failed: [], frames: 0 });
});

test('Layoutprüfung erkennt wirkungslose Vorgaben, abgeschnittene Inhalte und Fehler auf Seite zwei', async ({ page }) => {
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  const result = await page.evaluate(async code => {
    const api = new Function(`${code}\nreturn { LESSONS, solutionFor, validateProject };`)();
    const check = async (id, css, change) => {
      const lesson = api.LESSONS.find(item => item.id === id); const files = api.solutionFor(lesson);
      files['css/style.css'].content += `\n${css}`; change?.(files);
      return (await api.validateProject(files, lesson, 'negative')).passed;
    };
    return {
      overriddenRem: await check('relative-einheiten', 'main {max-width:800px;}'),
      overriddenEm: await check('relative-einheiten', '.karte {padding:16px;}'),
      narrowBox: await check('boxmodell', '.karte {width:50%;}'),
      hiddenText: await check('ueberlauf-karten', '.langtext {height:1px;overflow:hidden;}'),
      hiddenPageOverflow: await check('flex-umbruch', 'html, body {overflow-x:hidden;} .karten {width:1400px;}'),
      fakeGrid: await check('grid-spalten', '.karten {display:flex;}'),
      wrongArea: await check('grid-bereiche', '.merkkasten {grid-area:auto;}'),
      badgeOverlap: await check('positionierung', '.karte {padding-top:0;}'),
      wrongBreakpoint: await check('media-queries', '@media(min-width:30rem){.karten {grid-template-columns:repeat(3,1fr);}}'),
      fakeFocus: await check('tastaturfokus', 'nav a {outline:3px solid navy;outline-offset:3px;}'),
      weakFocus: await check('tastaturfokus', 'nav a:focus-visible {outline:1px solid navy;}'),
      hiddenAside: await check('responsive-website', 'aside {display:none;}'),
      hiddenCardBody: await check('responsive-website', '.karte p {height:1px;overflow:hidden;}'),
      reducedMotionIgnored: await check('reduzierte-bewegung', '@media(prefers-reduced-motion:reduce){.karte:hover .marke {transition:transform .3s;transform:translateY(-2px);}}'),
      missingSecondCard: await check('responsive-website', '', files => { files['ueber-uns.html'].content = files['ueber-uns.html'].content.replace(/<section class="karte">[\s\S]*?<\/section>/, ''); }),
      validWithoutMotion: await check('responsive-website', '.marke {transition:none;} .karte:hover .marke {transform:none;}'),
      missingSecondViewport: await check('media-queries', '', files => { files['ueber-uns.html'].content = files['ueber-uns.html'].content.replace(/<meta name="viewport"[^>]*>/, ''); }),
      brokenSecondImage: await check('flexible-inhalte', '', files => { files['ueber-uns.html'].content = files['ueber-uns.html'].content.replace('class="gruppenbild"', 'class="anderes-bild"'); }),
      hiddenHeading: await check('responsive-website', '.karte h2 {display:none;}'),
      croppedLine: await check('responsive-website', '.karte p {white-space:nowrap;overflow:hidden;}'),
      displacedText: await check('responsive-website', '.karte p {position:relative;left:-2000px;}'),
      displacedNav: await check('responsive-website', 'nav {position:relative;left:-2000px;}'),
      motionlessLesson: await check('reduzierte-bewegung', '.karte:hover .marke {transform:none;}'),
      excessiveDuration: await check('reduzierte-bewegung', '.marke {transition-duration:300s;}'),
      wrongCorner: await check('positionierung', '.marke {right:auto;left:.5rem;}'),
      validH3: await check('responsive-website', '', files => { for (const name of ['index.html', 'ueber-uns.html']) files[name].content = files[name].content.replace(/<h2>(HTML verstehen|CSS anwenden|Eigene Projekte|Pflanzen kennenlernen|Beete pflegen|Ernte teilen)<\/h2>/g, '<h3>$1</h3>'); }),
      validIntrinsicImage: await check('responsive-website', '.gruppenbild {aspect-ratio:auto;}', files => { for (const name of ['index.html', 'ueber-uns.html']) files[name].content = files[name].content.replace('width="32" height="32"', ''); }),
      displacedTop: await check('responsive-website', 'nav {position:relative;top:-2000px;}'),
      invisibleFocus: await check('tastaturfokus', 'nav a {opacity:0;}'),
      invisibleTitle: await check('responsive-website', '.karte h2 {color:rgb(245,247,250);}'),
    };
  }, code);
  expect(result).toEqual({ overriddenRem: false, overriddenEm: false, narrowBox: false, hiddenText: false, hiddenPageOverflow: false, fakeGrid: false, wrongArea: false, badgeOverlap: false, wrongBreakpoint: false, fakeFocus: false, weakFocus: false, hiddenAside: false, hiddenCardBody: false, reducedMotionIgnored: false, missingSecondCard: false, validWithoutMotion: true, missingSecondViewport: false, brokenSecondImage: false, hiddenHeading: false, croppedLine: false, displacedText: false, displacedNav: false, motionlessLesson: false, excessiveDuration: false, wrongCorner: false, validH3: true, validIntrinsicImage: true, displacedTop: false, invisibleFocus: false, invisibleTitle: false });
});

test('Erweiterte CSS-Bereinigung begrenzt Medienregeln, verschachtelte Angriffe und Ressourcen', async ({ page }) => {
  await page.goto('/frontendkurs'); await openWorkshopTools(page); let outside = 0;
  page.on('request', request => { if (/example\.invalid|11434/.test(request.url())) outside++; });
  const result = await page.evaluate(async code => {
    const api = new Function(`${code}\nreturn { LESSONS, solutionFor, validateProject, cleanCSS };`)();
    const allowed = api.cleanCSS('@media(min-width:60rem){.karten{display:grid;grid-template-columns:1fr 1fr}} nav a:focus-visible{outline:3px solid navy}');
    const shortHands = api.cleanCSS('p{white-space:pre-wrap;border-radius:1rem;text-decoration:underline;}');
    const blocked = api.cleanCSS('@import "https://example.invalid/x.css"; @media(min-width:1px){@font-face{font-family:x;src:url(https://example.invalid/a)} .karte{background-image:url(https://example.invalid/b)} @supports(display:grid){p{color:red}}} a:has(p){color:red}');
    let tooMany = false; let tooDeep = false;
    try { api.cleanCSS(`@media(min-width:1px){${'p{color:red}'.repeat(300)}}`); } catch { tooMany = true; }
    try { api.cleanCSS('@media(min-width:1px){'.repeat(6) + 'p{color:red}' + '}'.repeat(6)); } catch { tooDeep = true; }
    const lesson = api.LESSONS.find(item => item.id === 'responsive-website'); const files = api.solutionFor(lesson);
    files['index.html'].content += '<script>parent.localStorage.setItem("layout-escape","yes")</script><iframe src="http://127.0.0.1:11434"></iframe><img src="https://example.invalid/pixel" onerror="parent.location.href=\'https://example.invalid\'">';
    await api.validateProject(files, lesson, 'security');
    return { allowed: allowed.includes('@media') && allowed.includes(':focus-visible'), shortHands: shortHands.includes('white-space-collapse') && shortHands.includes('border-top-left-radius') && shortHands.includes('text-decoration-line'), blocked: /url\(|@font-face|@import|@supports|:has/.test(blocked), tooMany, tooDeep, escaped: localStorage.getItem('layout-escape'), frames: document.querySelectorAll('iframe').length };
  }, code);
  expect(result).toEqual({ allowed: true, shortHands: true, blocked: false, tooMany: true, tooDeep: true, escaped: null, frames: 0 }); expect(outside).toBe(0);
});

test('Endprojekt verhält sich in der echten Vorschau responsiv und berücksichtigt Tastatur/Bewegungswunsch', async ({ page }) => {
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('responsive-website');
  const files = await page.evaluate(code => { const api = new Function(`${code}\nreturn {LESSONS,solutionFor};`)(); return api.solutionFor(api.LESSONS.find(item => item.id === 'responsive-website')); }, code);
  page.once('dialog', dialog => dialog.accept());
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'responsive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  const frame = page.frameLocator('iframe[title="Dein Projekt"]');
  await page.getByLabel('Vorschaugröße').selectOption('375px');
  await expect(frame.locator('.karten')).toHaveCSS('display', 'grid');
  await expect.poll(() => frame.locator('.karte').evaluateAll(nodes => nodes.every((node, i) => !i || node.getBoundingClientRect().top >= nodes[i-1].getBoundingClientRect().bottom - 1))).toBe(true);
  await page.getByRole('combobox', { name: 'Projektseite', exact: true }).selectOption('ueber-uns.html');
  await expect(frame.locator('.gruppenbild')).toBeVisible();
  const link = frame.locator('nav a').first();
  await link.focus(); await page.keyboard.press('Tab');
  await expect(frame.locator('nav a').nth(1)).toBeFocused();
  await expect(frame.locator('nav a').nth(1)).toHaveCSS('outline-width', '3px');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await frame.locator('.karte').first().hover();
  await expect(frame.locator('.marke')).toHaveCSS('transition-duration', '0s');
  await expect(frame.locator('.marke')).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(frame.locator('.marke')).toHaveCSS('transition-duration', '0.3s');
  await expect(page.getByRole('status')).toHaveText('Gespeichert');
  await page.reload(); await openWorkshopTools(page);
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('responsive-website');
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option:checked')).toContainText('Prüfung bestanden');
});
