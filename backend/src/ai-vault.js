import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { AiError } from './ai-error.js';

const inside = (root, value) => { const relative = path.relative(root, value); return !relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep)); };
async function noLinks(target) {
  for (let current = target; ; current = path.dirname(current)) {
    try { const stat = await fs.lstat(current); if (stat.isSymbolicLink() || (current === target && stat.isFile() && stat.nlink !== 1)) throw Error('link'); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (path.dirname(current) === current) break;
  }
}
export function protectCredentials(value, decrypt = false) {
  if (process.platform !== 'win32') return Promise.resolve(value);
  return new Promise((resolve, reject) => {
    const operation = decrypt ? 'Unprotect' : 'Protect';
    const script = `$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Security; $data=[Convert]::FromBase64String([Console]::In.ReadToEnd()); [Console]::Out.Write([Convert]::ToBase64String([Security.Cryptography.ProtectedData]::${operation}($data,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)))`;
    const child = spawn(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32/WindowsPowerShell/v1.0/powershell.exe'), ['-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = ''; let failed = false;
    const timer = setTimeout(() => { failed = true; child.kill(); }, 10000);
    child.stdout.on('data', chunk => { output += chunk; if (output.length > 512000) { failed = true; child.kill(); } });
    child.stderr.on('data', () => {}); child.stdin.on('error', () => {});
    child.on('error', () => { clearTimeout(timer); reject(new AiError('credentials', 'Der geschützte lokale Zugangsspeicher ist nicht verfügbar.', 503)); });
    child.on('close', code => { clearTimeout(timer); if (code || failed || !/^[A-Za-z0-9+/=\s]+$/.test(output)) reject(new AiError('credentials', 'Die lokalen Zugangsdaten konnten nicht geschützt verarbeitet werden.', 503)); else resolve(Buffer.from(output.trim(), 'base64')); });
    child.stdin.end(Buffer.from(value).toString('base64'));
  });
}
export function createAiVault(settings, protect = protectCredentials) {
  const root = path.resolve(settings.aiDir); const file = path.join(root, 'accounts.json');
  if (path.dirname(root) === root || inside(root, settings.projectRoot) || (inside(settings.projectRoot, root) && !inside(path.join(settings.projectRoot, 'local-ai'), root)) || [settings.contentDir, settings.frontendDist, settings.ragDir, path.join(settings.projectRoot, 'docs'), path.join(settings.projectRoot, 'frontend'), path.join(settings.projectRoot, 'backend')].filter(Boolean).some(dir => inside(dir, root) || inside(root, dir))) throw new AiError('credentials', 'Der Zugangsspeicher muss außerhalb öffentlicher Bereiche und privater Lernunterlagen liegen.', 503);
  async function ensure() { await noLinks(root); await fs.mkdir(root, { recursive: true, mode: 0o700 }); await noLinks(root); }
  async function load() {
    try {
      await ensure(); await noLinks(file); const handle = await fs.open(file, 'r');
      let envelope;
      try { const stat = await handle.stat(); if (!stat.isFile() || stat.size > 512000 || stat.nlink !== 1 || (process.platform !== 'win32' && (stat.mode & 0o077))) throw Error('permissions'); envelope = JSON.parse(await handle.readFile('utf8')); }
      finally { await handle.close(); }
      if (envelope.schema !== 1 || envelope.protection !== (process.platform === 'win32' ? 'dpapi' : 'owner-only') || typeof envelope.data !== 'string') throw Error('envelope');
      const value = JSON.parse((await protect(Buffer.from(envelope.data, 'base64'), true)).toString('utf8'));
      if (value.schema !== 1 || !/^urn:uuid:[a-f0-9-]{36}$/.test(value.hostId) || !Array.isArray(value.accounts) || value.accounts.length > 8) throw Error('schema');
      return value;
    } catch (e) { if (e.code === 'ENOENT') return { schema: 1, hostId: `urn:uuid:${randomUUID()}`, accounts: [], activeId: null }; throw new AiError('credentials', 'Die geschützten ChatGPT-Zugangsdaten konnten nicht gelesen werden. Es wurden keine Daten überschrieben.', 503); }
  }
  async function save(value) {
    await ensure(); await noLinks(file); const temporary = path.join(root, `${randomUUID()}.tmp`);
    const bytes = Buffer.from(JSON.stringify(value)); if (bytes.length > 256000) throw new AiError('credentials', 'Zu viele lokale Kontodaten.', 400);
    const data = (await protect(bytes)).toString('base64');
    try { await fs.writeFile(temporary, JSON.stringify({ schema: 1, protection: process.platform === 'win32' ? 'dpapi' : 'owner-only', data }), { mode: 0o600, flag: 'wx' }); await fs.rename(temporary, file); }
    finally { await fs.unlink(temporary).catch(e => { if (e.code !== 'ENOENT') throw e; }); }
  }
  async function locked(run) {
    await ensure(); const canonical = await fs.realpath(root); const key = process.platform === 'win32' ? canonical.toLowerCase() : canonical;
    const port = 20000 + parseInt(createHash('sha256').update(`chatgpt:${key}`).digest('hex').slice(0, 8), 16) % 40000;
    const server = net.createServer(socket => socket.destroy()); server.maxConnections = 1;
    await new Promise((resolve, reject) => { server.once('error', () => reject(new AiError('busy', 'Ein anderer lokaler Vorgang verwendet gerade den ChatGPT-Zugang.', 409))); server.listen({ port, host: '127.0.0.1', exclusive: true }, resolve); });
    try { return await run(); } finally { await new Promise(resolve => server.close(resolve)); }
  }
  return { load, save, locked };
}
