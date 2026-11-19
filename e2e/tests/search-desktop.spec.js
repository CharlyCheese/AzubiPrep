import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('Desktop startet bei Willkommen und öffnet die gesuchte Werkstattlektion', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Desktop');
  test.setTimeout(60_000);
  const desktop = fileURLToPath(new URL('../../desktop/', import.meta.url));
  const env = {
    ...process.env, DATABASE_URL: '', AI_ENABLED: 'false',
    AZUBIPREP_RAG_DIR: info.outputPath('material'), AZUBIPREP_AI_DIR: info.outputPath('anbieter'),
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const app = await _electron.launch({
    executablePath: path.join(desktop, 'node_modules/electron/dist/electron.exe'),
    args: [path.resolve(desktop), `--user-data-dir=${info.outputPath('profil')}`], env,
  });
  try {
    const page = await app.firstWindow();
    await expect(page.getByRole('heading', { name: 'Willkommen bei AzubiPrep' })).toBeVisible();
    await page.getByRole('button', { name: /Ohne Konto weiter/ }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole('link', { name: 'Suche', exact: true }).click();
    await page.getByRole('searchbox').fill('Flexbox');
    await page.getByRole('button', { name: 'Suchen', exact: true }).click();
    await page.getByRole('link', { name: /Flexbox: Haupt- und Querachse/ }).click();
    await expect(page.getByRole('heading', { name: 'Flexbox: Haupt- und Querachse' })).toBeVisible();
    await page.getByRole('link', { name: '← Suchergebnisse' }).click();
    await expect(page.getByRole('searchbox')).toHaveValue('Flexbox');
  } finally {
    await app.close();
  }
});
