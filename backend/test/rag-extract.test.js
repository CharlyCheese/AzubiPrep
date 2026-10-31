import { expect, it } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { extractPdf } from '../src/rag-extract.js';
import { syntheticPdf } from './fixtures/synthetic-pdf.js';

it('extrahiert synthetische PDF-Seiten lokal im begrenzten Kindprozess', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-rag-extract-'));
  try {
    const input = path.join(root, 'input.pdf'); const output = path.join(root, 'pages.json');
    await fs.writeFile(input, syntheticPdf(['Erste Testseite mit HTML und einer Hauptueberschrift.', 'Zweite Testseite mit CSS und Schriftgestaltung.']));
    await extractPdf(input, output);
    const value = JSON.parse(await fs.readFile(output, 'utf8'));
    expect(value.pages).toHaveLength(2); expect(value.pages[0]).toContain('Erste Testseite'); expect(value.pages[1]).toContain('Zweite Testseite');
    await expect(extractPdf(input, path.join(root, 'timeout.json'), { timeoutMs: 1 })).rejects.toMatchObject({ code: 'timeout' });
    expect((await fs.readdir(root)).includes('timeout.json')).toBe(false);
  } finally {
    const resolved = path.resolve(root); expect(path.dirname(resolved)).toBe(path.resolve(os.tmpdir())); expect(path.basename(resolved)).toMatch(/^azubiprep-rag-extract-/); await fs.rm(resolved, { recursive: true, force: true });
  }
});
