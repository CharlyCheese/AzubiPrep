import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ page }) => { await unterdrueckeOnboardingPopups(page); });

test('Die lokale Notizsuche überträgt weder Suchbegriff noch Notizinhalte und behält die Treffer beim Rückweg', async ({ page }) => {
  const sentinel = 'Merkprobe4618';
  const title = 'Synthetische Merkhilfe';
  const secret = 'Privater Beispielinhalt';
  await page.addInitScript(({ title, sentinel, secret }) => {
    localStorage.setItem('azubiprep.notizen', JSON.stringify([
      { id: 'note-test', titel: title, inhalt: `${sentinel} – ${secret}`, erstelltAm: '2026-01-02' },
      { id: 'note-andere', titel: 'Andere Merkhilfe', inhalt: 'Andere Notiz', erstelltAm: '2026-01-02' },
    ]));
  }, { title, sentinel, secret });
  const requests = [];
  page.on('request', request => requests.push([request.url(), request.postData(), request.headers().referer].join(' ')));
  await page.goto('/suche');
  const main = page.getByRole('main');
  const scope = main.getByLabel('Suchbereich');
  await scope.selectOption('notizen');
  await main.getByRole('searchbox').fill(sentinel);
  await main.getByRole('button', { name: 'Suchen', exact: true }).click();
  const hit = main.getByRole('link', { name: title });
  await expect(hit).toBeVisible();
  await page.reload();
  await expect(hit).toBeVisible();
  await hit.click();
  await expect(main.getByRole('heading', { name: title })).toBeVisible();
  await expect(main.getByRole('heading', { name: 'Andere Merkhilfe' })).toHaveCount(0);
  await main.getByRole('link', { name: /Suchergebnisse/ }).click();
  await expect(main.getByRole('searchbox')).toHaveValue(sentinel);
  await expect(hit).toBeVisible();
  await scope.selectOption('alle');
  await expect(main.getByRole('searchbox')).toHaveValue('');
  const log = decodeURI(requests.join('\n'));
  for (const text of [sentinel, title, secret, 'note-test', '/api/suche/']) expect(log).not.toContain(text);
});

test('Bei einem Profilwechsel verschwinden lokale Treffer und der private Suchbegriff', async ({ page }) => {
  await page.addInitScript(() => {
    const note = (id, titel) => [{ id, titel, inhalt: 'Merkfall', erstelltAm: '2026-01-02' }];
    localStorage.setItem('azubiprep.notizen', JSON.stringify(note('gast-1', 'Gastbeispiel')));
    localStorage.setItem('azubiprep.notizen.konto.probe', JSON.stringify(note('probe-1', 'Kontobeispiel')));
  });
  await page.route('**/api/benachrichtigungen', route => route.fulfill({ json: { ungelesen: 0 } }));
  await page.goto('/suche?typ=notizen');
  const main = page.getByRole('main');
  const box = main.getByRole('searchbox');
  await box.fill('Merkfall');
  await box.press('Enter');
  await expect(main.getByRole('link', { name: 'Gastbeispiel' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Kontobeispiel' })).toHaveCount(0);
  await box.fill('Privater Entwurf');
  await page.evaluate(() => {
    localStorage.setItem('azubiprep.auth', JSON.stringify({ token: 'synthetisch', user: { id: 'probe', rolle: 'azubi' } }));
    window.dispatchEvent(new Event('azubiprep-auth'));
  });
  await page.getByRole('dialog').getByRole('button', { name: "Los geht's" }).click();
  await expect(box).toHaveValue('');
  await expect(main.getByRole('link', { name: 'Gastbeispiel' })).toHaveCount(0);
  await box.fill('Merkfall');
  await box.press('Enter');
  await expect(main.getByRole('link', { name: 'Kontobeispiel' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Gastbeispiel' })).toHaveCount(0);
});

test('Alle Bereiche zeigt passende Funktionen und eigene Notizen auch bei einer unterbrochenen Inhaltssuche', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('azubiprep.notizen', JSON.stringify([
    { id: 'lokales-beispiel', titel: 'Mein Übungsblatt', inhalt: 'Mein Tagesplan für die Prüfung' },
  ])));
  let available = false;
  await page.route('**/api/suche/inhalte?**', route => {
    expect(new URL(route.request().url()).searchParams.get('q')).toBe('Tagesplan');
    if (!available) return route.fulfill({ status: 503, json: { error: 'Testunterbrechung' } });
    return route.fulfill({ json: { total: 0, page: 1, pageSize: 6, results: [] } });
  });
  await page.goto('/suche?q=Tagesplan');
  const main = page.getByRole('main');
  await expect(main.getByRole('link', { name: 'Lernkalender' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Mein Übungsblatt' })).toBeVisible();
  await expect(main.getByRole('alert')).toContainText('Testunterbrechung');
  available = true;
  await main.getByRole('button', { name: 'Erneut suchen' }).click();
  await expect(main.getByRole('alert')).toHaveCount(0);
  await expect(main.getByRole('link', { name: 'Mein Übungsblatt' })).toBeVisible();
});

for (const [theme, width, term, title, url] of [
  ['light', 320, 'Tagesplan', 'Lernkalender', '/kalender'],
  ['dark', 390, 'Dunkelmodus', 'Einstellungen', '/einstellungen'],
]) {
  test(`App-Funktionen öffnen und Suchbereich wiederfinden (${theme}, ${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/dashboard');
    await page.getByRole('navigation', { name: 'Schnellnavigation' }).getByRole('link', { name: 'Suche' }).click();
    const main = page.getByRole('main');
    await main.getByLabel('Suchbereich').selectOption('funktionen');
    await main.getByRole('searchbox').fill(term);
    await main.getByRole('searchbox').press('Enter');
    const result = main.getByRole('link', { name: title });
    await expect(result).toHaveAttribute('href', url);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await result.click();
    await expect(page).toHaveURL(new RegExp(url + '$'));
    await main.getByRole('link', { name: /Suchergebnisse/ }).click();
    await expect(main.getByLabel('Suchbereich')).toHaveValue('funktionen');
    await expect(result).toBeVisible();
  });
}

test('Rollenabhängige Suchtreffer folgen der Berechtigung im Menü', async ({ page }) => {
  await page.route('**/api/benachrichtigungen', route => route.fulfill({ json: { ungelesen: 0 } }));
  await page.goto('/suche?q=verwalten&typ=funktionen');
  const main = page.getByRole('main');
  const author = main.getByRole('link', { name: 'Fragenpflege' });
  const admin = main.getByRole('link', { name: 'Nutzerverwaltung' });
  await expect(author).toHaveCount(0);
  await expect(admin).toHaveCount(0);
  for (const role of ['autor', 'admin']) {
    await page.evaluate(role => {
      localStorage.setItem('azubiprep.auth', JSON.stringify({ token: 'synthetisch', user: { rolle: role } }));
      window.dispatchEvent(new Event('azubiprep-auth'));
    }, role);
    await expect(author).toBeVisible();
    await expect(admin).toHaveCount(role === 'admin' ? 1 : 0);
  }
});

test('Die Suche führt zur kurzen Führung und bei aktivierten Konten zur Passwort-Hilfe', async ({ page }) => {
  let accountsEnabled = false;
  await page.route('**/api/status', route => route.fulfill({ json: { syncAktiviert: accountsEnabled } }));
  const main = page.getByRole('main');
  await page.goto('/suche?typ=funktionen&q=Passwort+vergessen');
  await expect(main.getByText('Keine Treffer in diesem Suchbereich.')).toBeVisible();
  accountsEnabled = true;
  await page.reload();
  await main.getByRole('link', { name: 'Passwort zurücksetzen' }).click();
  await expect(main.getByRole('heading', { name: 'Passwort zurücksetzen' })).toBeVisible();
  await main.getByRole('link', { name: /Suchergebnisse/ }).click();
  await expect(main.getByRole('searchbox')).toHaveValue('Passwort vergessen');
  await main.getByRole('searchbox').fill('Kurze Führung');
  await main.getByRole('searchbox').press('Enter');
  await main.getByRole('link', { name: 'Willkommen' }).click();
  await expect(page.getByRole('button', { name: /Kurze Führung/ })).toBeVisible();
  await page.getByRole('link', { name: /Suchergebnisse/ }).click();
  await expect(main.getByRole('searchbox')).toHaveValue('Kurze Führung');
});

test('Eine Werkstatt-Lektion ist aus der allgemeinen Suche direkt erreichbar', async ({ page }) => {
  await page.goto('/suche?q=Bilder+und+Ordnerpfade');
  const main = page.getByRole('main');
  const lesson = main.getByRole('link', { name: 'Bilder und Ordnerpfade' });
  await expect(lesson).toHaveAttribute('href', '/frontendkurs?lektion=bilder');
  await lesson.click();
  await expect(main.getByRole('heading', { name: 'Bilder und Ordnerpfade', exact: true })).toBeVisible();
  await main.getByRole('link', { name: /Suchergebnisse/ }).click();
  await expect(lesson).toBeVisible();
});

for (const [scope, query, title, target] of [
  ['glossar', 'SQL', 'SQL', /\/theorie\?modus=glossary&thema=/],
  ['theorie', 'Arbeitsplätze', 'Arbeitsplätze nach Kundenwunsch ausstatten', /\/theorie\?thema=field%3ALF2/],
  ['lernreise', 'eigene Rolle', 'Unternehmen, Kunden und die eigene Rolle', /\/lernreise\/fiae\/common-lf1-role/],
]) {
  test(`Treffer im Bereich ${scope} öffnet das konkrete Thema`, async ({ page }) => {
    await page.goto(`/suche?${new URLSearchParams({ q: query, typ: scope })}`);
    const main = page.getByRole('main');
    await main.getByRole('link', { name: title, exact: true }).click();
    await expect(page).toHaveURL(target);
    await expect(main.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await main.getByRole('link', { name: /Suchergebnisse/ }).click();
    await expect(main.getByLabel('Suchbereich')).toHaveValue(scope);
    await expect(main.getByRole('searchbox')).toHaveValue(query);
  });
}

test('Fragen jenseits der ersten hundert lassen sich öffnen und wiederfinden', async ({ page }) => {
  await page.goto('/suche?q=Welche&typ=fragen');
  const main = page.getByRole('main');
  const jump = main.getByLabel('Direkt zu Seite');
  await jump.fill('20');
  await jump.press('Enter');
  await expect(main.getByText(/Seite 20 von/)).toBeVisible();
  const first = main.getByRole('listitem').first();
  const title = await first.getByRole('heading').innerText();
  await first.getByRole('link', { name: 'Diese Frage üben' }).click();
  await expect(main.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await main.getByRole('link', { name: /Suchergebnisse/ }).click();
  await expect(main.getByText(/Seite 20 von/)).toBeVisible();
  await expect(first.getByRole('heading')).toHaveText(title);
});
