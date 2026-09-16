// Lädt und indiziert alle Inhalte (Fragen/Module/Fachrichtungen + Theorie).
// Wird beim Start und bei POST /api/admin/reload aufgerufen (Ergebnis wird
// danach nur noch aus dem In-Memory-Store gelesen – siehe docs/10-Architektur.md).
//
// Zwei Quellen, ein identisches Rückgabeformat (DB-002):
//  - Ist DATABASE_URL gesetzt UND die questions-Tabelle ist befüllt, wird
//    aus PostgreSQL geladen (siehe backend/db/schema.sql).
//  - Sonst (keine DB konfiguriert, DB leer, oder DB-Zugriff schlägt fehl)
//    wird wie bisher aus content/*.csv geladen – das ist die Fallback-
//    Garantie: die App funktioniert immer ohne Datenbank.
// Beide Pfade liefern exakt dieselbe Struktur, damit der Rest des Backends
// (und das Frontend) den Unterschied nie merkt (Repository-Seam).
import fs from 'node:fs';
import path from 'node:path';
import { readCsvFile } from './csv.js';
import { isDbAktiviert, query } from './db.js';

const QUESTION_COLUMNS = [
  'id', 'fachrichtung', 'modul_id', 'thema', 'typ', 'frage',
  'option_a', 'option_b', 'option_c', 'option_d',
  'antwort', 'erklaerung', 'schwierigkeit', 'quelle',
];
const GUELTIGE_TYPEN = new Set(['SC', 'MC', 'FT']);
const GUELTIGE_SCHWIERIGKEIT = new Set(['leicht', 'mittel', 'schwer']);

/**
 * Lädt Inhalte – versucht bei konfigurierter DB zuerst den DB-Pfad, fällt
 * bei fehlender/leerer/nicht erreichbarer DB automatisch auf CSV zurück.
 * `quelle` im Rückgabewert zeigt, welcher Pfad tatsächlich genutzt wurde
 * (nützlich für Diagnose/Logging, ändert sonst nichts am Verhalten).
 */
export async function loadContent(contentDir) {
  if (isDbAktiviert()) {
    try {
      const ausDb = await loadContentFromDb(contentDir);
      if (ausDb) return ausDb;
    } catch (err) {
      console.warn('[content] DB-Ladepfad fehlgeschlagen, falle auf CSV zurück:', err.message);
    }
  }
  return loadContentFromCsv(contentDir);
}

/** Lädt Theorie-Markdown (unabhängig von der Content-Quelle, bleiben Dateien). */
function ladeTheorie(contentDir) {
  const theorieDir = path.join(contentDir, 'theorie');
  const theorieByModul = new Map();
  if (fs.existsSync(theorieDir)) {
    for (const file of fs.readdirSync(theorieDir).filter((f) => f.endsWith('.md'))) {
      const modulId = file.replace(/\.md$/, '');
      theorieByModul.set(modulId, fs.readFileSync(path.join(theorieDir, file), 'utf-8'));
    }
  }
  return theorieByModul;
}

/**
 * DB-Ladepfad (DB-002). Gibt `null` zurück, wenn die questions-Tabelle noch
 * leer ist (z. B. Schema angelegt, aber `migrate-content-to-db.mjs` noch
 * nicht gelaufen) – der Aufrufer fällt dann auf CSV zurück, statt eine
 * leere App auszuliefern.
 */
async function loadContentFromDb(contentDir) {
  const { rows: fachrichtungenRaw } = await query('SELECT code, name, beschreibung FROM fachrichtungen');
  const { rows: modulesRaw } = await query('SELECT modul_id, fachrichtung, code, titel, beschreibung FROM modules');
  // CONTENT-001: 'deaktiviert' blendet eine Frage aus dem aktiven
  // Lernbestand aus (Ersatz für ein hartes DELETE über die Autoren-UI),
  // bleibt aber in der Tabelle selbst erhalten (jederzeit reaktivierbar).
  const { rows: questionsRaw } = await query(`
    SELECT id, fachrichtung, modul_id, thema, typ, frage,
           option_a, option_b, option_c, option_d,
           antwort, erklaerung, schwierigkeit, quelle, quelldatei
    FROM questions
    WHERE review_status != 'deaktiviert'
    ORDER BY id
  `);

  if (questionsRaw.length === 0) return null;

  const warnungen = [];

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

  for (const r of questionsRaw) {
    const modul = modulesById.get(r.modul_id);
    if (!modul) {
      warnungen.push(`DB: modul_id "${r.modul_id}" (Frage ${r.id}) existiert nicht in modules`);
    }
    if (!GUELTIGE_TYPEN.has(r.typ)) {
      warnungen.push(`DB: ungueltiger typ "${r.typ}" (Frage ${r.id})`);
    }
    if (!GUELTIGE_SCHWIERIGKEIT.has(r.schwierigkeit)) {
      warnungen.push(`DB: ungueltige schwierigkeit "${r.schwierigkeit}" (Frage ${r.id})`);
    }

    const frage = {
      id: r.id,
      fachrichtung: r.fachrichtung,
      modul_id: r.modul_id,
      thema: r.thema,
      typ: r.typ,
      frage: r.frage,
      optionen: [r.option_a, r.option_b, r.option_c, r.option_d],
      antwort: r.antwort,
      erklaerung: r.erklaerung,
      schwierigkeit: r.schwierigkeit,
      quelle: r.quelle,
      quelldatei: r.quelldatei || '',
    };
    questionsById.set(r.id, frage);
    if (!questionsByModul.has(r.modul_id)) questionsByModul.set(r.modul_id, []);
    questionsByModul.get(r.modul_id).push(frage);
  }

  return {
    geladenAm: new Date().toISOString(),
    quelle: 'db',
    warnungen,
    fachrichtungenByCode,
    modulesById,
    questionsById,
    questionsByModul,
    theorieByModul: ladeTheorie(contentDir),
    gesamtFragen: questionsById.size,
  };
}

/** Unveränderter CSV-Ladepfad (Fallback, Default ohne DB). */
function loadContentFromCsv(contentDir) {
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

  const gesamtFragen = questionsById.size;

  return {
    geladenAm: new Date().toISOString(),
    quelle: 'csv',
    warnungen,
    fachrichtungenByCode,
    modulesById,
    questionsById,
    questionsByModul,
    theorieByModul: ladeTheorie(contentDir),
    gesamtFragen,
  };
}

/** Fragenanzahl einer Fachrichtung inkl. gemeinsamer ALLE-Fragen. */
export function fragenAnzahlFachrichtung(content, code) {
  return fragenFuerFachrichtung(content, code).length;
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
