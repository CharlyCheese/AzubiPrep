// Serialisierung von Notizen in ein Notepad-/Editor-freundliches Textformat.
// Format je Notiz (mehrere Blöcke durch Zeile "===NOTE===" getrennt):
//
//   ===NOTE===
//   Titel: Subnetting-Merkregel
//   Modul: FISI-NET
//   Inhalt:
//   /24 = 255.255.255.0
//   ...

const TRENNER = '===NOTE===';

/** Notizen -> Text (für Export/Download). */
export function notizenToText(notizen = []) {
  const kopf = [
    '# AzubiPrep – Lernnotizen',
    `# Exportiert am ${new Date().toLocaleString('de-DE')}`,
    '# Format: Blöcke beginnen mit "===NOTE==="; Felder "Titel:", "Modul:", dann "Inhalt:".',
    '',
  ].join('\n');

  const bloecke = notizen.map((n) => {
    return [
      TRENNER,
      `Titel: ${n.titel || ''}`,
      `Modul: ${n.modulId || ''}`,
      'Inhalt:',
      n.inhalt || '',
    ].join('\n');
  });

  return `${kopf}\n${bloecke.join('\n\n')}\n`;
}

/** Text -> Notizen (für Import). Robust gegenüber manuellen Änderungen. */
export function textToNotizen(text = '') {
  const zeilen = String(text).replace(/\r\n/g, '\n').split('\n');
  const notizen = [];
  let aktuell = null;

  const abschliessen = () => {
    if (!aktuell) return;
    // Führende/abschließende Leerzeilen im Inhalt trimmen
    aktuell.inhalt = aktuell.inhalt.replace(/^\n+/, '').replace(/\s+$/, '');
    if (aktuell.titel || aktuell.inhalt) {
      notizen.push({
        titel: aktuell.titel,
        modulId: aktuell.modulId,
        inhalt: aktuell.inhalt,
      });
    }
    aktuell = null;
  };

  let imInhalt = false;
  for (const rohe of zeilen) {
    const zeile = rohe;
    if (zeile.trim() === TRENNER) {
      abschliessen();
      aktuell = { titel: '', modulId: '', inhalt: '' };
      imInhalt = false;
      continue;
    }
    if (!aktuell) continue; // Text vor dem ersten Block (Kommentare) ignorieren

    if (!imInhalt && /^Titel\s*:/i.test(zeile)) {
      aktuell.titel = zeile.replace(/^Titel\s*:/i, '').trim();
      continue;
    }
    if (!imInhalt && /^Modul\s*:/i.test(zeile)) {
      aktuell.modulId = zeile.replace(/^Modul\s*:/i, '').trim();
      continue;
    }
    if (!imInhalt && /^Inhalt\s*:\s*$/i.test(zeile)) {
      imInhalt = true;
      continue;
    }
    if (imInhalt) {
      aktuell.inhalt += (aktuell.inhalt ? '\n' : '') + zeile;
    }
  }
  abschliessen();
  return notizen;
}

/** Hilfsfunktion: Datei-Download im Browser auslösen. */
export function downloadTextDatei(dateiname, inhalt) {
  const blob = new Blob([inhalt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
