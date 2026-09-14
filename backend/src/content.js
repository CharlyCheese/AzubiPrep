// Lädt und indiziert alle Inhalte (CSV + Markdown) aus CONTENT_DIR.
// Wird beim Start und bei POST /api/admin/reload aufgerufen (stateless,
// In-Memory-Store – siehe docs/10-Architektur.md).
import fs from 'node:fs';
import path from 'node:path';
import { readCsvFile } from './csv.js';

const QUESTION_COLUMNS = [
  'id', 'fachrichtung', 'modul_id', 'thema', 'typ', 'frage',
  'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'schwierigkeit', 'quelle',
];
const GUELTIGE_TYPEN = new Set(['SC', 'MC', 'FT']);
const GUELTIGE_SCHWIERIGKEIT = new Set(['leicht', 'mittel', 'schwer']);

export function loadContent(contentDir) {
  const warnungen = [];

  const fachrichtungenRaw = readCsvFile(path.join(contentDir, 'fachrichtungen.csv')).records;
  const modulesRaw = readCsvFile(path.join(contentDir, 'modules.csv')).records;

  const fachrichtungenByCode = new Map();
  for (const f of fachrichtungenRaw) {
    fachrichtungenByCode.set(f.code, { code: f.code, name: f.name, beschreibung: f.beschreibung });
  }

  const modulesById = new Map();
  for (const m of modulesRaw) {
    modulesById.set(m.modul_id, {
      modul_id: m.modul_id,
      fachrichtung: m.fachrichtung,
      code: m.code,
      titel: m.titel,
      beschreibung: m.beschreibung,
    });
  }

  const questionsById = new Map();
  const questionsByModul = new Map();

  const questionsDir = path.join(contentDir, 'questions');
  const files = fs.existsSync(questionsDir)
    ? fs.readdirSync(questionsDir).filter((f) => f.endsWith('.csv')).sort()
    : [];

  for (const file of files) {
    const filePath = path.join(questionsDir, file);
    const { header, records } = readCsvFile(filePath);
    const headerOk = QUESTION_COLUMNS.every((c, i) => header[i] === c) && header.length === QUESTION_COLUMNS.length;
    if (!headerOk) {
      warnungen.push(`${file}: Kopfzeile weicht vom Schema ab (${header.join(';')})`);
    }
    for (const r of records) {
      const modul = modulesById.get(r.modul_id);
      const fachrichtung = (r.fachrichtung && r.fachrichtung.trim())
        || (modul ? modul.fachrichtung : '');

      if (!modul) {
        warnungen.push(`${file}: modul_id "${r.modul_id}" (Frage ${r.id}) existiert nicht in modules.csv`);
      }
      if (!GUELTIGE_TYPEN.has(r.typ)) {
        warnungen.push(`${file}: ungueltiger typ "${r.typ}" (Frage ${r.id})`);
      }
      if (!GUELTIGE_SCHWIERIGKEIT.has(r.schwierigkeit)) {
        warnungen.push(`${file}: ungueltige schwierigkeit "${r.schwierigkeit}" (Frage ${r.id})`);
      }
      if (questionsById.has(r.id)) {
        warnungen.push(`${file}: doppelte id "${r.id}"`);
      }

      const frage = {
        id: r.id,
        fachrichtung,
        modul_id: r.modul_id,
        thema: r.thema,
        typ: r.typ,
        frage: r.frage,
        optionen: [r.option_a, r.option_b, r.option_c, r.option_d],
        antwort: r.antwort,
        erklaerung: r.erklaerung,
        schwierigkeit: r.schwierigkeit,
        quelle: r.quelle,
        quelldatei: file,
      };
      questionsById.set(r.id, frage);
      if (!questionsByModul.has(r.modul_id)) questionsByModul.set(r.modul_id, []);
      questionsByModul.get(r.modul_id).push(frage);
    }
  }

  // Theorie (optional, je Modul)
  const theorieDir = path.join(contentDir, 'theorie');
  const theorieByModul = new Map();
  if (fs.existsSync(theorieDir)) {
    for (const file of fs.readdirSync(theorieDir).filter((f) => f.endsWith('.md'))) {
      const modulId = file.replace(/\.md$/, '');
      theorieByModul.set(modulId, fs.readFileSync(path.join(theorieDir, file), 'utf-8'));
    }
  }

  const gesamtFragen = questionsById.size;

  return {
    geladenAm: new Date().toISOString(),
    warnungen,
    fachrichtungenByCode,
    modulesById,
    questionsById,
    questionsByModul,
    theorieByModul,
    gesamtFragen,
  };
}

/** Fragenanzahl einer Fachrichtung inkl. gemeinsamer ALLE-Fragen. */
export function fragenAnzahlFachrichtung(content, code) {
  let n = 0;
  for (const f of content.questionsById.values()) {
    if (f.fachrichtung === code || f.fachrichtung === 'ALLE') n += 1;
  }
  return n;
}

/** Module einer Fachrichtung inkl. gemeinsamer ALLE-Module. */
export function moduleFuerFachrichtung(content, code) {
  return [...content.modulesById.values()].filter(
    (m) => m.fachrichtung === code || m.fachrichtung === 'ALLE',
  );
}

/** Fragen, die zu einer Fachrichtung gehören (eigene + ALLE). */
export function fragenFuerFachrichtung(content, code) {
  return [...content.questionsById.values()].filter(
    (f) => f.fachrichtung === code || f.fachrichtung === 'ALLE',
  );
}
