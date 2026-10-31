import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { securityHeaders, jsWorkerAssetHeaders } from '../src/sicherheit.js';

describe('JavaScript-Worker CSP', () => {
  const app = express();
  let root;
  beforeAll(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-worker-csp-'));
    await fs.mkdir(path.join(root, 'assets'));
    await fs.writeFile(path.join(root, 'index.html'), '<!doctype html><title>Synthetic app</title>');
    await fs.writeFile(path.join(root, 'assets', 'js-runner.worker-abc_123.js'), '/* synthetic worker */');
    app.use(securityHeaders());
    app.use(express.static(root, { setHeaders: jsWorkerAssetHeaders }));
    app.get('*', (_req, res) => res.sendFile(path.join(root, 'index.html')));
  });
  afterAll(async () => {
    if (root && path.dirname(root) === path.resolve(os.tmpdir()) && path.basename(root).startsWith('azubiprep-worker-csp-')) await fs.rm(root, { recursive: true, force: true });
  });
  it('erlaubt ausschließlich WASM auf dem lokalen Worker und sperrt Verbindungen/Unterworker', async () => {
    const response = await request(app).get('/assets/js-runner.worker-abc_123.js');
    const csp = response.headers['content-security-policy'];
    expect(csp).toContain("script-src 'self' 'wasm-unsafe-eval'");
    expect(csp).toContain("connect-src 'none'");
    expect(csp).toContain("worker-src 'none'");
    expect(csp).not.toContain("'unsafe-eval'");
  });
  it.each(['/', '/frontendkurs', '/assets/app-123.js', '/assets/js-runner.worker-NOT_EXISTING.js', '/assets/js-runner.worker-abc.js/other', '/api/health'])('behält strenge App-Header für %s', async path => {
    const response = await request(app).get(path);
    const csp = response.headers['content-security-policy'];
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain('wasm-unsafe-eval');
    expect(csp).not.toContain("'unsafe-eval'");
    expect(response.headers['content-type']).toContain('text/html');
  });
});
