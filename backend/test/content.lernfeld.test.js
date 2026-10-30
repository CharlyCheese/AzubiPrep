import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/db.js', () => ({
  isDbAktiviert: () => true,
  query: vi.fn(),
}));

import { query } from '../src/db.js';
import { loadContent } from '../src/content.js';

describe('Lernfelder aus dem DB-Ladepfad', () => {
  it('selektiert Frage-Lernfelder und verwendet das Modul nur ohne Überschreibung', async () => {
    query.mockImplementation(async (sql) => {
      if (sql.includes('FROM fachrichtungen')) return { rows: [] };
      if (sql.includes('FROM modules')) return { rows: [{ modul_id: 'M', lernfeld: 'LF11a' }] };
      if (sql.includes('FROM questions')) {
        // Prüft die tatsächliche Projektion; SELECT ohne lernfeld verliert den Wert.
        expect(sql.slice(0, sql.indexOf('FROM'))).toMatch(/\blernfeld\b/);
        const base = { modul_id: 'M', typ: 'SC', schwierigkeit: 'mittel' };
        return { rows: [{ ...base, id: 'A', lernfeld: 'LF12a' }, { ...base, id: 'B', lernfeld: '' }] };
      }
      throw new Error('Unerwartete Abfrage');
    });
    const content = await loadContent('nicht-vorhandenes-content-testverzeichnis');
    expect(content.quelle).toBe('db');
    expect(content.questionsById.get('A').lernfeld).toBe('LF12a');
    expect(content.questionsById.get('B').lernfeld).toBe('LF11a');
  });
});
