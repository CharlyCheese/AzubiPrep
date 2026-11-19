import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { browserUrl, needsBuild, isWebRunning } from '../scripts/start-web.mjs';

const directories = [];
afterEach(() => {
  vi.unstubAllGlobals();
  for (const dir of directories.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe('Lokaler Webstart', () => {
  it('öffnet lokale Wildcard-Adressen und IPv6 mit gültiger Browseradresse', () => {
    expect(browserUrl('0.0.0.0', 3456)).toBe('http://127.0.0.1:3456');
    expect(browserUrl('::1', 3456)).toBe('http://[::1]:3456');
  });
  it('erkennt fehlende Builds sowie geänderte öffentliche Dateien', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'azubiprep-webstart-'));
    directories.push(dir);
    const dist = path.join(dir, 'dist');
    expect(needsBuild(dir, dist)).toBe(true);
    fs.mkdirSync(dist);
    fs.writeFileSync(path.join(dist, 'index.html'), '<html></html>');
    expect(needsBuild(dir, dist)).toBe(false);
    fs.mkdirSync(path.join(dir, 'public'));
    const asset = path.join(dir, 'public', 'hilfe.txt');
    fs.writeFileSync(asset, 'Neu');
    const future = new Date(Date.now() + 5000);
    fs.utimesSync(asset, future, future);
    expect(needsBuild(dir, dist)).toBe(true);
  });
  it('verwechselt eine API ohne Weboberfläche nicht mit der fertigen Webversion', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new globalThis.Response(JSON.stringify({ status: 'ok', fragenAnzahl: 7000, modulAnzahl: 26, fachrichtungAnzahl: 4 })))
      .mockResolvedValueOnce(new globalThis.Response('Nicht gefunden', { status: 404 })));
    expect(await isWebRunning('http://127.0.0.1:3456')).toBe(false);
  });
  it.each(['.env', '.env.local', '.env.production', '.env.production.local', 'advanced-vendor.mjs', 'course-template/package-lock.json'])('erkennt geänderte Build-Eingabe %s', (name) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'azubiprep-webstart-'));
    directories.push(dir);
    const dist = path.join(dir, 'dist');
    fs.mkdirSync(dist);
    fs.writeFileSync(path.join(dist, 'index.html'), '<html></html>');
    const input = path.join(dir, name);
    fs.mkdirSync(path.dirname(input), { recursive: true });
    fs.writeFileSync(input, 'Test');
    const baseline = new Date(Date.now() + 2000);
    fs.utimesSync(path.join(dist, 'index.html'), baseline, baseline);
    expect(needsBuild(dir, dist)).toBe(false);
    const future = new Date(Date.now() + 5000);
    fs.utimesSync(input, future, future);
    expect(needsBuild(dir, dist)).toBe(true);
  });
  it('erkennt gelöschte öffentliche Dateien über den Ordnerzeitstempel', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'azubiprep-webstart-'));
    directories.push(dir);
    const dist = path.join(dir, 'dist');
    const assets = path.join(dir, 'public');
    fs.mkdirSync(dist);
    fs.mkdirSync(assets);
    const asset = path.join(assets, 'alt.txt');
    fs.writeFileSync(asset, 'Alt');
    const index = path.join(dist, 'index.html');
    fs.writeFileSync(index, '<html></html>');
    const built = new Date(Date.now() + 1000);
    fs.utimesSync(index, built, built);
    expect(needsBuild(dir, dist)).toBe(false);
    fs.unlinkSync(asset);
    const changed = new Date(Date.now() + 5000);
    fs.utimesSync(assets, changed, changed);
    expect(needsBuild(dir, dist)).toBe(true);
  });
  it('erkennt eine vorhandene Webversion einschließlich API', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new globalThis.Response(JSON.stringify({ status: 'ok', fragenAnzahl: 7000, modulAnzahl: 26, fachrichtungAnzahl: 4 })))
      .mockResolvedValueOnce(new globalThis.Response('<html></html>', { headers: { 'content-type': 'text/html' } })));
    expect(await isWebRunning('http://127.0.0.1:3456')).toBe(true);
  });
});
