#!/usr/bin/env node
// Prüft alle Fragen & Module gegen das Schema aus docs/08-Datenformate.md.
// Exit-Code 0 = OK, 1 = Fehler gefunden. Aufruf: node scripts/validate-content.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { readCsvFile } from '../src/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(__dirname, '..', '..', 'content');

const QUESTION_COLUMNS = [
  'id', 'fachrichtung', 'modul_id', 'thema', 'typ', 'frage',
  'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'schwierigkeit', 'quelle',
];
const GUELTIGE_TYPEN = new Set(['SC', 'MC', 'FT']);
const GUELTIGE_SCHWIERIGKEIT = new Set(['leicht', 'mittel', 'schwer']);
const GUELTIGE_FACHRICHTUNG = new Set(['FIAE', 'FISI', 'DPA', 'DVK', 'ALLE', '']);

const fehler = [];
function fehlerMelden(msg) { fehler.push(msg); }

const modules = readCsvFile(path.join(contentDir, 'modules.csv')).records;
const modulIds = new Set(modules.map((m) => m.modul_id));
if (modules.length === 0) fehlerMelden('modules.csv ist leer oder fehlt');

const fachrichtungen = readCsvFile(path.join(contentDir, 'fachrichtungen.csv')).records;
if (fachrichtungen.length === 0) fehlerMelden('fachrichtungen.csv ist leer oder fehlt');

const questionsDir = path.join(contentDir, 'questions');
const files = fs.existsSync(questionsDir)
  ? fs.readdirSync(questionsDir).filter((f) => f.endsWith('.csv')).sort()
  : [];

const alleIds = new Map(); // id -> Datei
let gesamtFragen = 0;

for (const file of files) {
  const { header, records } = readCsvFile(path.join(questionsDir, file));
  if (header.length !== QUESTION_COLUMNS.length || QUESTION_COLUMNS.some((c, i) => header[i] !== c)) {
    fehlerMelden(`${file}: Kopfzeile weicht vom Schema ab: ${header.join(';')}`);
  }

  records.forEach((r, i) => {
    const zeile = i + 2; // +1 Header, +1 1-basiert
    gesamtFragen += 1;

    if (alleIds.has(r.id)) {
      fehlerMelden(`${file}:${zeile} doppelte id "${r.id}" (bereits in ${alleIds.get(r.id)})`);
    } else {
      alleIds.set(r.id, file);
    }
    if (!r.modul_id || !modulIds.has(r.modul_id)) {
      fehlerMelden(`${file}:${zeile} modul_id "${r.modul_id}" existiert nicht in modules.csv (id=${r.id})`);
    }
    if (!GUELTIGE_TYPEN.has(r.typ)) {
      fehlerMelden(`${file}:${zeile} ungueltiger typ "${r.typ}" (id=${r.id})`);
    }
    if (!GUELTIGE_SCHWIERIGKEIT.has(r.schwierigkeit)) {
      fehlerMelden(`${file}:${zeile} ungueltige schwierigkeit "${r.schwierigkeit}" (id=${r.id})`);
    }
    if (!GUELTIGE_FACHRICHTUNG.has(r.fachrichtung)) {
      fehlerMelden(`${file}:${zeile} ungueltige fachrichtung "${r.fachrichtung}" (id=${r.id})`);
    }
    for (const feld of ['frage', 'antwort', 'erklaerung', 'thema', 'quelle']) {
      if (!r[feld] || !r[feld].trim()) {
        fehlerMelden(`${file}:${zeile} Feld "${feld}" ist leer (id=${r.id})`);
      }
    }

    const optionen = [r.option_a, r.option_b, r.option_c, r.option_d];
    if (r.typ === 'FT') {
      if (optionen.some((o) => o && o.trim())) {
        fehlerMelden(`${file}:${zeile} FT-Frage hat nicht-leere Optionsspalten (id=${r.id})`);
      }
    } else if (r.typ === 'SC') {
      const antwort = (r.antwort || '').trim().toLowerCase();
      if (!/^[a-d]$/.test(antwort)) {
        fehlerMelden(`${file}:${zeile} SC-Antwort "${r.antwort}" ist kein einzelner Buchstabe a-d (id=${r.id})`);
      }
      const fehlendeOpt = ['a', 'b', 'c', 'd'].filter((_, idx) => !optionen[idx] || !optionen[idx].trim());
      if (fehlendeOpt.length) {
        fehlerMelden(`${file}:${zeile} SC-Frage hat leere Optionsspalten [${fehlendeOpt}] (id=${r.id})`);
      }
    } else if (r.typ === 'MC') {
      const buchstaben = (r.antwort || '').split(',').map((s) => s.trim().toLowerCase());
      if (buchstaben.length < 2 || buchstaben.some((b) => !/^[a-d]$/.test(b))) {
        fehlerMelden(`${file}:${zeile} MC-Antwort "${r.antwort}" ungueltig (id=${r.id})`);
      }
      const fehlendeOpt = ['a', 'b', 'c', 'd'].filter((_, idx) => !optionen[idx] || !optionen[idx].trim());
      if (fehlendeOpt.length) {
        fehlerMelden(`${file}:${zeile} MC-Frage hat leere Optionsspalten [${fehlendeOpt}] (id=${r.id})`);
      }
    }
  });
}

console.log(`Geprüft: ${files.length} Fragen-Dateien, ${gesamtFragen} Fragen, ${modules.length} Module, ${fachrichtungen.length} Fachrichtungen.`);

if (fehler.length > 0) {
  console.error(`\n✗ VALIDIERUNG FEHLGESCHLAGEN – ${fehler.length} Problem(e):\n`);
  for (const f of fehler) console.error(' -', f);
  process.exit(1);
} else {
  console.log('\n✓ VALIDIERUNG OK – keine Probleme gefunden.');
  process.exit(0);
}
