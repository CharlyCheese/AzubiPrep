#!/usr/bin/env node
// Bindender Check für den Agent-Briefs-Workflow (siehe ORCHESTRATOR.md).
//
// Prüft rein mechanisch, ohne Interpretation:
//   1. Jede ID in DONE.md hat eine passende Brief-Datei.
//   2. Keine ID steht gleichzeitig in STATUS.md (offen) und DONE.md (fertig).
//   3. Jede Brief-Datei mit "Status: done" im Kopf ist in DONE.md gelistet.
//
// Exit-Code 0 = sauber, 1 = mindestens ein Problem gefunden.
//
// Aufruf: node scripts/check-agent-briefs.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const briefsDir = path.join(projectRoot, 'docs', 'agent-briefs');
const statusPath = path.join(briefsDir, 'STATUS.md');
const donePath = path.join(briefsDir, 'DONE.md');

const ID_MUSTER = /\[([A-Z]+-\d+)\]/g;

function leseIdsAusListe(dateiPfad) {
  if (!fs.existsSync(dateiPfad)) return new Set();
  const inhalt = fs.readFileSync(dateiPfad, 'utf8');
  const ids = new Set();
  for (const match of inhalt.matchAll(ID_MUSTER)) {
    ids.add(match[1]);
  }
  return ids;
}

function briefDateiFuerId(id) {
  const dateien = fs.readdirSync(briefsDir);
  return dateien.find((f) => f.startsWith(`${id}-`) && f.endsWith('.md'));
}

function alleBriefDateien() {
  return fs
    .readdirSync(briefsDir)
    .filter((f) => f.endsWith('.md') && f !== 'STATUS.md' && f !== 'DONE.md' && f !== '_TEMPLATE.md');
}

function statusAusBriefDatei(dateiname) {
  const inhalt = fs.readFileSync(path.join(briefsDir, dateiname), 'utf8');
  const treffer = inhalt.match(/^Status:\s*(\w+)/m);
  return treffer ? treffer[1] : null;
}

function idAusBriefDateiname(dateiname) {
  const treffer = dateiname.match(/^([A-Z]+-\d+)-/);
  return treffer ? treffer[1] : null;
}

function main() {
  const probleme = [];

  if (!fs.existsSync(briefsDir)) {
    console.error(`FEHLER: Ordner fehlt: ${path.relative(projectRoot, briefsDir)}`);
    process.exit(1);
  }

  const statusIds = leseIdsAusListe(statusPath);
  const doneIds = leseIdsAusListe(donePath);

  // 1. Jede DONE-ID hat eine Brief-Datei.
  for (const id of doneIds) {
    const datei = briefDateiFuerId(id);
    if (!datei) {
      probleme.push(`[${id}] steht in DONE.md, aber es gibt keine Brief-Datei "${id}-*.md" in docs/agent-briefs/.`);
    }
  }

  // 2. Keine ID gleichzeitig offen und fertig.
  for (const id of statusIds) {
    if (doneIds.has(id)) {
      probleme.push(`[${id}] steht sowohl in STATUS.md (offen) als auch in DONE.md (fertig) – bitte aus STATUS.md entfernen.`);
    }
  }

  // 3. Jede Brief-Datei mit "Status: done" ist in DONE.md gelistet.
  for (const dateiname of alleBriefDateien()) {
    const status = statusAusBriefDatei(dateiname);
    const id = idAusBriefDateiname(dateiname);
    if (status === 'done' && id && !doneIds.has(id)) {
      probleme.push(`Brief "${dateiname}" hat "Status: done", aber [${id}] fehlt in DONE.md.`);
    }
  }

  if (probleme.length > 0) {
    console.error(`\n[check-agent-briefs] ${probleme.length} Problem(e) gefunden:\n`);
    for (const p of probleme) console.error(`  - ${p}`);
    console.error('\nArchivierung ist nicht vollständig – Task gilt NICHT als abgeschlossen (siehe ORCHESTRATOR.md Abschnitt 4).\n');
    process.exit(1);
  }

  console.log(`[check-agent-briefs] OK – ${doneIds.size} erledigte Task(s) archiviert, ${statusIds.size} offen, alles konsistent.`);
  process.exit(0);
}

main();
