import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createAiVault, protectCredentials } from '../src/ai-vault.js';
const roots = [];
afterEach(async () => { for (const root of roots.splice(0)) { expect(path.dirname(await fs.realpath(root))).toBe(await fs.realpath(os.tmpdir())); expect(path.basename(root)).toMatch(/^azubiprep-vault-test-/); await fs.rm(root, { recursive: true, force: true }); } });
async function fixture() { const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-vault-test-'))); roots.push(root); const settings = { projectRoot: path.join(root, 'app'), aiDir: path.join(root, 'secure'), contentDir: path.join(root, 'app/content'), frontendDist: path.join(root, 'app/frontend/dist'), ragDir: path.join(root, 'private-material') }; return { root, settings }; }
describe('Geschützter lokaler KI-Zugangsspeicher', () => {
  it('übernimmt in einem frischen Profil weder Konten noch Hostkennung eines anderen Profils', async () => {
    const first = await fixture(), second = await fixture(); const a = createAiVault(first.settings), b = createAiVault(second.settings);
    const existing = await a.load(); existing.accounts = [{ id: 'synthetic-existing', accessToken: 'synthetic-secret' }]; existing.activeId = 'synthetic-existing'; await a.save(existing);
    const fresh = await b.load(); expect(fresh.accounts).toEqual([]); expect(fresh.activeId).toBeNull(); expect(fresh.hostId).not.toBe(existing.hostId);
    await b.save(fresh); expect(await b.load()).toEqual(fresh); expect(await a.load()).toEqual(existing);
  });
  it('speichert synthetische Daten geschützt und erhält Host/Konto nach Neustart', async () => {
    const { settings } = await fixture(); const vault = createAiVault(settings); const data = await vault.load(); data.accounts.push({ id: 'synthetic', accessToken: 'synthetic-secret' });
    await vault.save(data); expect(await createAiVault(settings).load()).toEqual(data);
    const disk = await fs.readFile(path.join(settings.aiDir, 'accounts.json'), 'utf8'); expect(disk).not.toContain('synthetic-secret');
    const plain = Buffer.from('synthetic-roundtrip'); expect(await protectCredentials(await protectCredentials(plain), true)).toEqual(plain);
  });
  it('weist öffentliche Pfade, Materialpfade und beschädigte bestehende Ablage zurück', async () => {
    const { settings } = await fixture();
    for (const aiDir of [settings.projectRoot, settings.contentDir, settings.frontendDist, settings.ragDir]) expect(() => createAiVault({ ...settings, aiDir })).toThrow();
    const vault = createAiVault(settings); await vault.save(await vault.load());
    const file = path.join(settings.aiDir, 'accounts.json'); await fs.writeFile(file, 'synthetic-corrupt');
    await expect(vault.load()).rejects.toMatchObject({ code: 'credentials' }); expect(await fs.readFile(file, 'utf8')).toBe('synthetic-corrupt');
  });
  it('weist Verzeichnisverknüpfung und mehrfach verlinkte Zugangsdaten ab', async () => {
    const { settings, root } = await fixture(); const other = path.join(root, 'other'); await fs.mkdir(other);
    await fs.symlink(other, settings.aiDir, process.platform === 'win32' ? 'junction' : 'dir');
    await expect(createAiVault(settings).load()).rejects.toMatchObject({ code: 'credentials' }); await fs.unlink(settings.aiDir);
    await fs.mkdir(settings.aiDir); const target = path.join(other, 'synthetic.json'); await fs.writeFile(target, '{}'); await fs.link(target, path.join(settings.aiDir, 'accounts.json'));
    await expect(createAiVault(settings).load()).rejects.toMatchObject({ code: 'credentials' });
  });
  it('verhindert parallele Änderung durch eine zweite lokale Instanz', async () => {
    const { settings } = await fixture(); const first = createAiVault(settings), second = createAiVault(settings);
    let release, entered; const gate = new Promise(resolve => { release = resolve; }); const ready = new Promise(resolve => { entered = resolve; });
    const pending = first.locked(async () => { entered(); await gate; }); await ready;
    await expect(second.locked(async () => {})).rejects.toMatchObject({ code: 'busy' }); release(); await pending;
  });
});
