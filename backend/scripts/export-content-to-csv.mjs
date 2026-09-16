#!/usr/bin/env node
// DB-002: Exportiert den aktuellen DB-Stand (Tabellen fachrichtungen,
// modules, questions) zurück nach content/*.csv, im exakt gleichen
// Format wie der ursprüngliche CSV-Ladepfad erwartet.
//
// Zweck (siehe docs/agent-briefs/DB-002-content-datenbank-migration.md):
//  1. Fallback-Garantie – die App läuft immer ohne DB, die CSV muss dafür
//     den aktuellen DB-Stand widerspiegeln.
//  2. Git-versionierter, diff-barer Review-Snapshot – der unabhängige
//     CONTENT-Review (ORCHESTRATOR.md Abschnitt 1) prüft diese Datei.
//
// Aufruf: DATABASE_URL=postgresql://... node scripts/export-content-to-csv.mjs
// Empfehlung: vor jedem Release laufen lassen und den Diff committen.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { writeCsv } from '../src/csv.js';
import { isDbAktiviert, query, schliessen } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(__dirname, '..', '..', 'content');

const QUESTION_COLUMNS = [
  'id', 'fachrichtung', 'modul_id', 'thema', 'typ', 'frage',
  'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'schwierigkeit', 'quelle',
];
const FACHRICHTUNG_COLUMNS = ['code', 'name', 'beschreibung'];
const MODUL_COLUMNS = ['modul_id', 'fachrichtung', 'code', 'titel', 'beschreibung'];

async function main() {
  if (!isDbAktiviert()) {
    console.error('FEHLER: Keine DATABASE_URL gesetzt. Export abgebrochen (nichts zu exportieren).');
    process.exit(1);
  }

  const { rows: fachrichtungen } = await query(
    'SELECT code, name, beschreibung FROM fachrichtungen ORDER BY code',
  );
  const { rows: modules } = await query(
    'SELECT modul_id, fachrichtung, code, titel, beschreibung FROM modules ORDER BY modul_id',
  );
  const { rows: questions } = await query(`
    SELECT id, fachrichtung, modul_id, thema, typ, frage,
           option_a, option_b, option_c, option_d,
           antwort, erklaerung, schwierigkeit, quelle, quelldatei
    FROM questions
    ORDER BY quelldatei, id
  `);

  if (questions.length === 0) {
    console.error('FEHLER: questions-Tabelle ist leer – nichts zu exportieren. (Erst migrate-content-to-db.mjs laufen lassen?)');
    process.exit(1);
  }

  fs.writeFileSync(
    path.join(contentDir, 'fachrichtungen.csv'),
    writeCsv(FACHRICHTUNG_COLUMNS, fachrichtungen),
    'utf-8',
  );
  fs.writeFileSync(
    path.join(contentDir, 'modules.csv'),
    writeCsv(MODUL_COLUMNS, modules),
    'utf-8',
  );

  const questionsDir = path.join(contentDir, 'questions');
  fs.mkdirSync(questionsDir, { recursive: true });

  const byFile = new Map();
  for (const q of questions) {
    const file = q.quelldatei || `${q.modul_id}.csv`;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(q);
  }

  for (const [file, records] of byFile) {
    fs.writeFileSync(path.join(questionsDir, file), writeCsv(QUESTION_COLUMNS, records), 'utf-8');
  }

  console.log(`Export fertig: ${questions.length} Fragen in ${byFile.size} Datei(en), ${modules.length} Module, ${fachrichtungen.length} Fachrichtungen.`);
  console.log('Empfehlung: Diff gegen den letzten Git-Stand prüfen und committen.');
  await schliessen();
}

main().catch((err) => {
  console.error('FEHLER beim Export:', err.message);
  process.exit(1);
});
