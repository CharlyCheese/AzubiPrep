#!/usr/bin/env node
// Repariert bekannte Spaltenverschiebungen in den Fragen-CSVs: entsteht durch
// ein unquotiertes ";" innerhalb von "erklaerung" (siehe docs/08-Datenformate.md,
// Abschnitt "Wichtige Stolperfalle"). Erkennt Zeilen mit mehr als 14 Feldern,
// führt die überzähligen Felder wieder in "erklaerung" zusammen und schreibt
// die Datei mit korrektem Quoting neu.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseRowsRaw, writeCsv } from '../src/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(__dirname, '..', '..', 'content');
const questionsDir = path.join(contentDir, 'questions');

const HEADER = [
  'id', 'fachrichtung', 'modul_id', 'thema', 'typ', 'frage',
  'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'schwierigkeit', 'quelle',
];

let gesamtRepariert = 0;
const dateiSummary = {};

if (fs.existsSync(questionsDir)) {
  for (const file of fs.readdirSync(questionsDir).filter((f) => f.endsWith('.csv')).sort()) {
    const filePath = path.join(questionsDir, file);
    let text = fs.readFileSync(filePath, 'utf-8');
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

    // Quote-bewusster Tokenizer (derselbe wie der eigentliche Parser): schon
    // korrekt gequotete Felder mit ";" darin werden NICHT erneut aufgespalten.
    const rows = parseRowsRaw(text).filter(
      (r) => !(r.length === 1 && r[0].trim() === '') && !r[0].trim().startsWith('#'),
    );
    const [header, ...rest] = rows;
    if (header.join(';') !== HEADER.join(';')) {
      console.warn(`! ${file}: Kopfzeile weicht ab, wird trotzdem verarbeitet`);
    }

    let repariert = 0;
    const records = rest.map((row) => {
      let fields = row;
      if (fields.length > HEADER.length) {
        const extra = fields.length - HEADER.length;
        // Überzählige Felder direkt nach "antwort" (Index 10) gehören zu "erklaerung".
        const kopf = fields.slice(0, 11);
        const mitte = fields.slice(11, 11 + extra + 1).join(';');
        const rest2 = fields.slice(11 + extra + 1);
        fields = [...kopf, mitte, ...rest2];
        repariert += 1;
      }
      const obj = {};
      HEADER.forEach((key, i) => { obj[key] = fields[i] ?? ''; });
      return obj;
    });

    if (repariert > 0) {
      fs.writeFileSync(filePath, writeCsv(HEADER, records), 'utf-8');
      dateiSummary[file] = repariert;
      gesamtRepariert += repariert;
    }
  }
}

if (gesamtRepariert > 0) {
  console.log(`Repariert: ${gesamtRepariert} Zeile(n) in ${Object.keys(dateiSummary).length} Datei(en):`);
  for (const [f, n] of Object.entries(dateiSummary)) console.log(`  - ${f}: ${n}`);
} else {
  console.log('Keine Spaltenverschiebungen gefunden – nichts zu reparieren.');
}
