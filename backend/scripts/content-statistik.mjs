#!/usr/bin/env node
// Erzeugt eine Kennzahlen-Übersicht des Contents (für PROJEKTSTATUS.md).
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readCsvFile } from '../src/csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(__dirname, '..', '..', 'content');

const modules = readCsvFile(path.join(contentDir, 'modules.csv')).records;
const fachrichtungen = readCsvFile(path.join(contentDir, 'fachrichtungen.csv')).records;
const questionsDir = path.join(contentDir, 'questions');
const files = fs.existsSync(questionsDir)
  ? fs.readdirSync(questionsDir).filter((f) => f.endsWith('.csv')).sort()
  : [];

let gesamt = 0;
const proModul = {};
const proTyp = { SC: 0, MC: 0, FT: 0 };
const proSchwierigkeit = { leicht: 0, mittel: 0, schwer: 0 };
const proFachrichtung = {};

for (const file of files) {
  const { records } = readCsvFile(path.join(questionsDir, file));
  const modulId = file.replace(/\.csv$/, '');
  proModul[modulId] = { gesamt: records.length, SC: 0, MC: 0, FT: 0 };
  for (const r of records) {
    gesamt += 1;
    proModul[modulId][r.typ] = (proModul[modulId][r.typ] || 0) + 1;
    proTyp[r.typ] = (proTyp[r.typ] || 0) + 1;
    proSchwierigkeit[r.schwierigkeit] = (proSchwierigkeit[r.schwierigkeit] || 0) + 1;
    const modul = modules.find((m) => m.modul_id === r.modul_id);
    const fa = (r.fachrichtung && r.fachrichtung.trim()) || modul?.fachrichtung || '';
    proFachrichtung[fa] = (proFachrichtung[fa] || 0) + 1;
  }
}

console.log(`Fragen gesamt: ${gesamt}`);
console.log(`Module: ${modules.length}`);
console.log(`Fachrichtungen: ${fachrichtungen.length}`);
console.log();
console.log('Typ-Verteilung:', proTyp);
console.log('Schwierigkeit-Verteilung:', proSchwierigkeit);
console.log();
console.log('Fragen je Fachrichtung (eigene, ohne ALLE addiert):');
for (const [fa, n] of Object.entries(proFachrichtung).sort()) {
  console.log(`  ${fa}: ${n}`);
}
const alle = proFachrichtung.ALLE || 0;
console.log();
console.log('Fragen je Fachrichtung (nutzbar = eigene + ALLE):');
for (const code of ['FIAE', 'FISI', 'DPA', 'DVK']) {
  const eigene = proFachrichtung[code] || 0;
  console.log(`  ${code}: eigene ${eigene} + ALLE ${alle} = ${eigene + alle}`);
}
console.log();
console.log('Fragen je Modul (SC/MC/FT):');
for (const [modulId, s] of Object.entries(proModul).sort()) {
  console.log(`  ${modulId}: ${s.gesamt} (${s.SC}/${s.MC}/${s.FT})`);
}
