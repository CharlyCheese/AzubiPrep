// Robuster CSV-Parser für das AzubiPrep-Content-Format.
// Regeln (siehe docs/08-Datenformate.md):
//  - Trennzeichen: Semikolon ";"
//  - Encoding: UTF-8 (optional mit BOM)
//  - Werte mit ";", '"' oder Zeilenumbrüchen stehen in doppelten Anführungszeichen,
//    "" innerhalb eines gequoteten Werts ist ein escapetes Anführungszeichen.
//  - Leere Zeilen und Zeilen mit führendem "#" werden ignoriert (Kommentare).
import fs from 'node:fs';

const DELIMITER = ';';
const QUOTE = '"';

/** Parst rohen CSV-Text (inkl. Kopfzeile) in ein Array von Objekten. */
export function parseCsv(text) {
  const rows = parseRowsRaw(text);
  if (rows.length === 0) return { header: [], records: [] };
  const [header, ...rest] = rows;
  const records = rest
    .filter((row) => !(row.length === 1 && row[0].trim() === '')) // leere Zeile
    .filter((row) => !row[0].trim().startsWith('#')) // Kommentarzeile
    .map((row) => {
      const obj = {};
      header.forEach((key, i) => {
        obj[key] = row[i] !== undefined ? row[i] : '';
      });
      return obj;
    });
  return { header, records };
}

/** Liest und parst eine CSV-Datei (UTF-8, BOM wird entfernt). */
export function readCsvFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf-8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM entfernen
  return parseCsv(text);
}

/**
 * Zerlegt CSV-Rohtext in Zeilen von Feldarrays (state machine, quote-fest).
 * Exportiert (u. a. für scripts/repair-ft-rows.mjs), damit Reparatur-Tools
 * dieselbe quote-bewusste Tokenisierung nutzen wie der eigentliche Parser –
 * sonst würden bereits korrekt gequotete Felder beim erneuten Lauf zerstört.
 */
export function parseRowsRaw(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];

    if (inQuotes) {
      if (char === QUOTE) {
        if (text[i + 1] === QUOTE) {
          field += QUOTE;
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === QUOTE) {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === DELIMITER) {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (char === '\r') {
      i += 1;
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }
  // letzte Zeile ohne abschließenden Zeilenumbruch
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

/** Schreibt Records (Array von Objekten) als CSV-Text gemäß den Grundregeln. */
export function writeCsv(header, records) {
  const lines = [header.join(DELIMITER)];
  for (const record of records) {
    const line = header.map((key) => quoteIfNeeded(record[key] ?? '')).join(DELIMITER);
    lines.push(line);
  }
  return lines.join('\n') + '\n';
}

function quoteIfNeeded(value) {
  const str = String(value);
  if (str.includes(DELIMITER) || str.includes(QUOTE) || str.includes('\n') || str.includes('\r')) {
    return QUOTE + str.replace(/"/g, '""') + QUOTE;
  }
  return str;
}
