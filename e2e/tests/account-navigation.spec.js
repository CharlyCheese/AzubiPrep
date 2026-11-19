import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const email = 'fachinformatik-musterkonto-mit-langem-namen@example.invalid';
const user = { id: 'synthetisch', email, rolle: 'azubi', fachrichtung: 'FIAE' };
const question = { id: 'MUSTER-001', modul_id: 'MUSTER', frage: 'Was gehört zum fiktiven Beispiel?', antwort: 'a', thema: 'Beispiel', schwierigkeit: 'leicht', review_status: 'ungeprueft' };

async function vorbereiten(page, rolle = null) {
  await unterdrueckeOnboardingPopups(page);
  if (rolle) await page.addInitScript(user => {
    localStorage.setItem('azubiprep.auth', JSON.stringify({ token: 'synthetisch', user }));
  }, { ...user, rolle });
  const requests = [];
  let current = { ...question };
  let attempts = 0;
  await page.route(url => url.pathname.startsWith('/api/'), async route => {
    const url = new URL(route.request().url());
    const path = url.pathname.slice(4);
    requests.push(path + url.search);
    let data;
    switch (path) {
      case '/status': data = { syncAktiviert: true }; break;
      case '/fachrichtungen': data = [{ code: 'FIAE', name: 'Anwendungsentwicklung' }]; break;
      case '/benachrichtigungen': data = { ungelesen: 0 }; break;
      case '/auth/register':
      case '/auth/login': data = { token: 'synthetisch', user }; break;
      case '/auth/passwort-reset-anfordern':
        if (++attempts === 1) return route.abort();
        data = { ok: true };
        break;
      case '/auth/passwort-reset':
        if (route.request().postDataJSON().token === 'abgelaufen') return route.fulfill({ status: 400, json: { error: 'Link abgelaufen.' } });
        data = { ok: true };
        break;
      case '/module': data = [{ modul_id: 'MUSTER', titel: 'Synthetisches Beispielmodul' }]; break;
      case '/admin/questions':
        data = url.searchParams.has('review_status') && current.review_status !== url.searchParams.get('review_status') ? [] : [current];
        break;
      case '/admin/questions/MUSTER-001':
        current = { ...current, ...route.request().postDataJSON() };
        data = current;
        break;
      case '/admin/users': data = [user]; break;
      case '/admin/users/synthetisch/passwort-reset':
        data = { token: 'fiktiver-einmallink', email, laeuftAbAm: '2027-01-01T10:00:00Z' };
        break;
      default: return route.fulfill({ status: 404, json: { error: 'Unbekannter Testendpunkt' } });
    }
    return route.fulfill({ json: data });
  });
  return requests;
}

async function erreichbar(element) {
  await expect(element).toBeVisible();
  expect(await element.evaluate(node => {
    const r = node.getBoundingClientRect();
    return r.left >= 0 && r.right <= innerWidth && r.height >= 44;
  })).toBe(true);
}

test('Anmeldung beim Start führt ins Dashboard und bleibt beim nächsten Start erhalten', async ({ page }) => {
  await vorbereiten(page);
  await page.goto('/');
  await page.getByText('Anmelden oder Konto erstellen', { exact: true }).click();
  await page.getByLabel('E-Mail').fill(email);
  await page.getByLabel('Passwort', { exact: true }).fill('Musterbeispiel1!');
  await page.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Zum Dashboard' })).toBeVisible();
  await expect(page.getByText('Anmelden oder Konto erstellen', { exact: true })).toHaveCount(0);
});

test('Konto über Profil, Registrierung und Anmeldung mit der Tastatur bedienen', async ({ page }) => {
  const requests = await vorbereiten(page);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/profil');
  await page.getByLabel('Anzeigename').fill('Übungsprofil');
  await page.getByLabel('Anzeigename').press('Enter');
  await expect(page.getByRole('status')).toContainText('gespeichert');
  await page.getByRole('link', { name: 'Anmelden oder registrieren' }).click();
  const konto = page.getByRole('region', { name: 'Konto & Synchronisierung' });
  await expect(konto.getByRole('heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(konto.getByLabel('E-Mail')).toBeFocused();
  await konto.getByRole('button', { name: /Noch kein Konto/ }).click();
  await konto.getByLabel('E-Mail').fill(email);
  await konto.getByLabel('Passwort', { exact: true }).fill('Musterbeispiel1!');
  await konto.getByRole('button', { name: 'Registrieren', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: "Los geht's" }).click();
  await expect(konto.getByText(email)).toBeVisible();
  await konto.getByRole('button', { name: 'Abmelden' }).click();
  await konto.getByLabel('E-Mail').fill(email);
  await konto.getByLabel('Passwort', { exact: true }).fill('Musterbeispiel1!');
  await konto.getByRole('button', { name: 'Anmelden', exact: true }).click();
  await expect(konto.getByText(email)).toBeVisible();
  expect(requests).toEqual(expect.arrayContaining(['/auth/register', '/auth/login']));
});

test('Passwortanfrage nach Verbindungsfehler wiederholen und zur Anmeldung gelangen', async ({ page }) => {
  await vorbereiten(page);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/profil#konto');
  await page.getByRole('link', { name: 'Passwort vergessen?' }).click();
  await page.getByLabel('E-Mail').fill(email);
  const submit = page.getByRole('button', { name: 'Admin benachrichtigen' });
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('erneut');
  await expect(page.getByLabel('E-Mail')).toHaveValue(email);
  await submit.click();
  await expect(page.getByRole('status')).toContainText('falls diese E-Mail-Adresse');
  await page.getByRole('link', { name: 'Zur Anmeldung' }).click();
  await expect(page.getByRole('heading', { name: 'Konto & Synchronisierung' })).toBeFocused();
  await page.goto('/passwort-zuruecksetzen?token=abgelaufen');
  await page.getByLabel('Neues Passwort').fill('FiktivesBeispiel1!');
  await page.getByRole('button', { name: 'Passwort setzen' }).click();
  await page.getByRole('link', { name: 'Neuen Link anfordern' }).click();
  await expect(page.getByLabel('E-Mail')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.goto('/passwort-zuruecksetzen?token=fiktiv');
  await page.getByLabel('Neues Passwort').fill('FiktivesBeispiel1!');
  await page.getByRole('button', { name: 'Passwort setzen' }).click();
  await expect(page.getByRole('status')).toContainText('Passwort wurde geändert');
});

test('Autor kann mobil filtern, bearbeiten, speichern und zur selben Frage zurückkehren', async ({ page }) => {
  const requests = await vorbereiten(page, 'autor');
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/autoren');
  await page.locator('summary').filter({ hasText: 'Modul und Review-Status' }).press('Enter');
  await page.getByLabel('Modul', { exact: true }).selectOption('MUSTER');
  await page.getByLabel('Review-Status').selectOption('geprueft');
  await expect(page.getByRole('status')).toContainText('Keine Fragen');
  await page.getByLabel('Review-Status').selectOption('ungeprueft');
  await page.getByLabel('Suche (ID, Frage, Thema)').fill('MUSTER-001');
  const edit = page.getByRole('button', { name: 'Bearbeiten: MUSTER-001' });
  await erreichbar(edit);
  await edit.press('Enter');
  await expect(page.getByRole('heading', { name: 'Bearbeiten: MUSTER-001' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Als geprüft markieren' })).toHaveCount(0);
  await page.getByLabel('Frage', { exact: true }).fill('Bearbeitete Musterfrage?');
  await page.getByRole('button', { name: 'Speichern' }).click();
  await expect(page.getByRole('status')).toContainText('Gespeichert');
  await page.getByRole('button', { name: 'Zur Fragenliste', exact: true }).click();
  await expect(edit).toBeFocused();
  await expect(page.getByText('Bearbeitete Musterfrage?')).toBeVisible();
  expect(requests).toContain('/module?fachrichtung=FIAE');
});

test('Admin findet mobil das Konto und kann den markierten Einmal-Link manuell kopieren', async ({ page }) => {
  await vorbereiten(page, 'admin');
  await page.setViewportSize({ width: 320, height: 700 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
  await page.goto('/nutzerverwaltung');
  const suche = page.getByLabel('Konto nach E-Mail suchen');
  await suche.fill('ohne-treffer');
  await expect(page.getByRole('status')).toContainText('Kein Konto');
  await suche.fill('musterkonto');
  const trigger = page.getByRole('button', { name: `Reset-Link erzeugen für ${email}` });
  await erreichbar(trigger);
  await trigger.press('Enter');
  const link = page.getByLabel(`Einmal-Link für ${email}`);
  await expect(link).toBeFocused();
  await page.getByRole('button', { name: 'Link kopieren' }).click();
  await expect(page.getByRole('status')).toContainText('markierten Link');
  await expect(link).toBeFocused();
  await page.getByRole('button', { name: 'Schließen', exact: true }).click();
  await expect(trigger).toBeFocused();
});

test('Gäste und Lernkonten erhalten einen Rückweg ohne Abruf geschützter Listen', async ({ page }) => {
  const requests = await vorbereiten(page);
  await page.goto('/nutzerverwaltung');
  await page.getByRole('link', { name: 'Zur Anmeldung' }).click();
  await expect(page.getByRole('heading', { name: 'Konto & Synchronisierung' })).toBeFocused();
  await page.evaluate(user => localStorage.setItem('azubiprep.auth', JSON.stringify({ token: 'synthetisch', user })), user);
  for (const path of ['/nutzerverwaltung', '/autoren']) {
    await page.goto(path);
    await expect(page.getByRole('link', { name: 'Zum Profil' })).toBeVisible();
  }
  expect(requests.filter(path => path.startsWith('/admin/'))).toEqual([]);
});
