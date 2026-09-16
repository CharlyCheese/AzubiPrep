#!/usr/bin/env node
// DB-002: Migriert content/*.csv einmalig (und wiederholbar/idempotent)
// nach PostgreSQL (Tabellen fachrichtungen, modules, questions – siehe
// backend/db/schema.sql). Danach kann backend/src/content.js aus der DB
// laden; ohne diesen Lauf bleiben die Tabellen leer und der bestehende
// CSV-Ladepfad ist weiter aktiv (Fallback, siehe content.js).
//
// Aufruf: DATABASE_URL=postgresql://... node scripts/migrate-content-to-db.mjs
// Wiederholtes Ausführen ist sicher: alle Schreiboperationen sind Upserts
// (ON CONFLICT ... DO UPDATE) nach dem Primärschlüssel, keine Duplikate.
//
// review_status: Standardmäßig 'geprueft' (Stand 2026-09-16: OPS-002 hat
// den kompletten Bestand von 1623 Fragen geprüft, siehe
// docs/agent-briefs/OPS-002-ki-fachreview-methodik.md). Für einen späteren
// Lauf mit frisch hinzugefügten, noch ungeprüften Fragen kann der Wert
// über INITIAL_REVIEW_STATUS=ungeprueft überschrieben werden. Bewusst
// ASCII-Werte (ungeprueft/geprueft statt ungeprüft/geprüft) – ein Umlaut
// in einer DB-Check-Constraint ist über Editoren/Kodierungen hinweg
// fragil (siehe schema.sql).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { readCsvFile } from '../src/csv.js';
import { isDbAktiviert, query, schliessen } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = process.env.CONTENT_DIR
  ? path.resolve(process.env.CONTENT_DIR)
  : path.resolve(__dirname, '..', '..', 'content');

const initialReviewStatus = process.env.INITIAL_REVIEW_STATUS || 'geprueft';
const GUELTIGE_REVIEW_STATUS = new Set(['ungeprueft', 'geprueft', 'gemeldet', 'korrigiert']);

async function main() {
  if (!isDbAktiviert()) {
    console.error('FEHLER: Keine DATABASE_URL gesetzt. Migration abgebrochen.');
    process.exit(1);
  }
  if (!GUELTIGE_REVIEW_STATUS.has(initialReviewStatus)) {
    console.error(`FEHLER: INITIAL_REVIEW_STATUS "${initialReviewStatus}" ist ungültig.`);
    process.exit(1);
  }

  const fachrichtungen = readCsvFile(path.join(contentDir, 'fachrichtungen.csv')).records;
  const modules = readCsvFile(path.join(contentDir, 'modules.csv')).records;

  console.log(`Migriere ${fachrichtungen.length} Fachrichtung(en) …`);
  for (const f of fachrichtungen) {
    await query(
      `INSERT INTO fachrichtungen (code, name, beschreibung)
       VALUES ($1, $2, $3)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, beschreibung = EXCLUDED.beschreibung`,
      [f.code, f.name, f.beschreibung || ''],
    );
  }

  console.log(`Migriere ${modules.length} Modul(e) …`);
  for (const m of modules) {
    await query(
      `INSERT INTO modules (modul_id, fachrichtung, code, titel, beschreibung)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (modul_id) DO UPDATE SET
         fachrichtung = EXCLUDED.fachrichtung,
         code = EXCLUDED.code,
         titel = EXCLUDED.titel,
         beschreibung = EXCLUDED.beschreibung`,
      [m.modul_id, m.fachrichtung, m.code, m.titel, m.beschreibung || ''],
    );
  }

  const questionsDir = path.join(contentDir, 'questions');
  const files = fs.existsSync(questionsDir)
    ? fs.readdirSync(questionsDir).filter((f) => f.endsWith('.csv')).sort()
    : [];

  let gesamt = 0;
  for (const file of files) {
    const { records } = readCsvFile(path.join(questionsDir, file));
    console.log(`Migriere ${records.length} Frage(n) aus ${file} …`);
    for (const r of records) {
      const modul = modules.find((m) => m.modul_id === r.modul_id);
      const fachrichtung = (r.fachrichtung && r.fachrichtung.trim())
        || (modul ? modul.fachrichtung : '');
      await query(
        `INSERT INTO questions (
           id, fachrichtung, modul_id, thema, typ, frage,
           option_a, option_b, option_c, option_d,
           antwort, erklaerung, schwierigkeit, quelle, quelldatei,
           review_status, geprueft_am, geprueft_von, aktualisiert_am
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now(),$17,now())
         ON CONFLICT (id) DO UPDATE SET
           fachrichtung = EXCLUDED.fachrichtung,
           modul_id = EXCLUDED.modul_id,
           thema = EXCLUDED.thema,
           typ = EXCLUDED.typ,
           frage = EXCLUDED.frage,
           option_a = EXCLUDED.option_a,
           option_b = EXCLUDED.option_b,
           option_c = EXCLUDED.option_c,
           option_d = EXCLUDED.option_d,
           antwort = EXCLUDED.antwort,
           erklaerung = EXCLUDED.erklaerung,
           schwierigkeit = EXCLUDED.schwierigkeit,
           quelle = EXCLUDED.quelle,
           quelldatei = EXCLUDED.quelldatei,
           aktualisiert_am = now()
         -- review_status/geprueft_am/geprueft_von bewusst NICHT im
         -- ON CONFLICT-Zweig überschrieben: ein späterer Migrationslauf
         -- (z. B. nach CSV-Korrekturen) soll einen bereits gesetzten
         -- Review-Status (auch 'gemeldet' aus BE-003) nicht zurücksetzen.`,
        [
          r.id, fachrichtung, r.modul_id, r.thema, r.typ, r.frage,
          r.option_a, r.option_b, r.option_c, r.option_d,
          r.antwort, r.erklaerung, r.schwierigkeit, r.quelle, file,
          initialReviewStatus, 'CONTENT-002-Migration',
        ],
      );
      gesamt += 1;
    }
  }

  console.log(`Fertig: ${gesamt} Fragen, ${modules.length} Module, ${fachrichtungen.length} Fachrichtungen migriert.`);
  await schliessen();
}

main().catch((err) => {
  console.error('FEHLER bei der Migration:', err.message);
  process.exit(1);
});
