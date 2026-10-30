export const LIMITS = Object.freeze({ files: 50, file: 2 * 1024 * 1024, total: 10 * 1024 * 1024, text: 128 * 1024, depth: 8 });
const textTypes = /\.(html|css)$/i;
const imageTypes = /\.(png|jpe?g|webp)$/i;
const excluded = /^(?:\.git|\.env.*|node_modules|local-rag)$/i;
export const isText = (name) => textTypes.test(name);
export const isExcluded = (name) => name.split('/').some((part) => excluded.test(part));

export function checkPath(name) {
  if (typeof name !== 'string' || !name || name.length > 220 || /[\\\x00-\x1f:#?%]/.test(name) || name.startsWith('/')) throw new Error('Ungültiger relativer Dateipfad.');
  const parts = name.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || part.trim() !== part) || parts.length > LIMITS.depth + 1) throw new Error('Der Pfad verlässt das Projekt oder ist zu tief.');
  return name;
}

export function resolvePath(from, value) {
  if (!value || /^[a-z][a-z\d+.-]*:|^[/\\]|[\\\x00-\x1f]/i.test(value)) return null;
  let raw;
  try { raw = decodeURIComponent(value.split(/[?#]/)[0]); } catch { return null; }
  if (/^[a-z][a-z\d+.-]*:|^[/\\]|[\\\x00-\x1f]/i.test(raw)) return null;
  if (!raw) return from;
  const parts = from.split('/').slice(0, -1);
  for (const part of raw.split('/')) {
    if (part === '..') { if (!parts.length) return null; parts.pop(); }
    else if (part && part !== '.') parts.push(part);
  }
  try { return checkPath(parts.join('/')); } catch { return null; }
}

export function imageMime(bytes) {
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((v, i) => bytes[i] === v)) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  throw new Error('Das Bild ist kein unterstütztes PNG-, JPEG- oder WebP-Bild.');
}

export function imagePixels(bytes, mime) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0; let height = 0;
  if (mime === 'image/png' && bytes.length >= 24) { width = v.getUint32(16); height = v.getUint32(20); }
  if (mime === 'image/jpeg') {
    let offset = 2;
    while (offset + 4 < bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      if (offset + 2 >= bytes.length) break;
      const marker = bytes[offset++];
      if (marker === 0xda || marker === 0xd9) break;
      const length = v.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && length >= 7) { height = v.getUint16(offset + 3); width = v.getUint16(offset + 5); break; }
      offset += length;
    }
  }
  if (mime === 'image/webp' && bytes.length >= 30) {
    const type = String.fromCharCode(...bytes.slice(12, 16));
    if (type === 'VP8X' && !(bytes[20] & 2)) { width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16); height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16); }
    if (type === 'VP8 ' && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42) { width = v.getUint16(26, true) & 16383; height = v.getUint16(28, true) & 16383; }
    if (type === 'VP8L' && bytes[20] === 47) { width = 1 + ((bytes[21] | (bytes[22] << 8)) & 16383); height = 1 + (((bytes[22] >> 6) | (bytes[23] << 2) | (bytes[24] << 10)) & 16383); }
  }
  if (!width || !height || width > 4096 || height > 4096 || width * height > 16000000) throw new Error('Bildabmessungen ungültig oder zu groß (höchstens 4096 Pixel je Seite und 16 Millionen Pixel).');
  return width * height;
}

export function checkFiles(files, { requireHTML = true } = {}) {
  if (!files || typeof files !== 'object' || Array.isArray(files)) throw new Error('Projektdateien fehlen.');
  const entries = Object.entries(files);
  if (!entries.length || entries.length > LIMITS.files) throw new Error('Ein Projekt benötigt 1 bis 50 Dateien.');
  let total = 0; let pixels = 0;
  for (const [name, file] of entries) {
    checkPath(name);
    if (isExcluded(name)) throw new Error(`Private Datei nicht erlaubt: ${name}`);
    if (!file || typeof file.content !== 'string') throw new Error(`Dateiinhalt fehlt: ${name}`);
    let size;
    if (isText(name) && file.kind === 'text') {
      size = new TextEncoder().encode(file.content).length;
      if (size > LIMITS.text) throw new Error(`Textdatei zu groß: ${name}`);
    } else if (imageTypes.test(name) && file.kind === 'image') {
      const match = file.content.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z\d+/]*={0,2})$/);
      if (!match || match[2].length > Math.ceil(LIMITS.file / 3) * 4) throw new Error(`Ungültiges Bild: ${name}`);
      let bytes;
      try { bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0)); } catch { throw new Error(`Ungültiges Bild: ${name}`); }
      if (imageMime(bytes) !== match[1]) throw new Error(`Bildtyp stimmt nicht: ${name}`);
      pixels += imagePixels(bytes, match[1]);
      size = bytes.length;
    } else throw new Error(`Im Pilot nicht unterstützter Dateityp: ${name}`);
    if (size > LIMITS.file) throw new Error(`Datei zu groß: ${name}`);
    total += size;
  }
  if (total > LIMITS.total) throw new Error('Projekt größer als 10 MiB.');
  if (pixels > 16000000) throw new Error('Projektbilder überschreiten zusammen 16 Millionen Pixel.');
  if (requireHTML && !entries.some(([name]) => /\.html$/i.test(name))) throw new Error('Eine HTML-Seite fehlt.');
  return files;
}

export async function importFiles(list, { partial = false, onSkip = () => {} } = {}) {
  if (list.length > 5000) throw new Error('Dieser Ordner enthält zu viele Einträge. Bitte nur den Projektordner auswählen.');
  const selected = Array.from(list);
  const rooted = selected.every((file) => file.webkitRelativePath?.includes('/'));
  const roots = new Set(selected.map((file) => file.webkitRelativePath?.split('/')[0]));
  const result = {};
  let total = 0;
  for (const file of selected) {
    let name = file.webkitRelativePath || file.name;
    if (isExcluded(name)) { onSkip(); continue; }
    if (rooted && roots.size === 1) name = name.split('/').slice(1).join('/');
    if (isExcluded(name) || !(textTypes.test(name) || imageTypes.test(name))) { onSkip(); continue; }
    checkPath(name);
    if (Object.hasOwn(result, name)) throw new Error(`Doppelter Pfad: ${name}. Bitte den ganzen Ordner auswählen.`);
    if (Object.keys(result).length >= LIMITS.files) throw new Error('Bitte höchstens 50 unterstützte Projektdateien auswählen.');
    if (file.size > LIMITS.file || (isText(name) && file.size > LIMITS.text)) throw new Error(`Datei zu groß: ${name}`);
    total += file.size;
    if (total > LIMITS.total) throw new Error('Projekt größer als 10 MiB.');
    if (isText(name)) result[name] = { kind: 'text', content: await file.text() };
    else {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mime = imageMime(bytes);
      let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);
      result[name] = { kind: 'image', content: `data:${mime};base64,${btoa(binary)}` };
    }
  }
  if (!Object.keys(result).length) throw new Error('Keine unterstützten Projektdateien gefunden. Im HTML-/CSS-Pilot sind HTML, CSS, PNG, JPEG und WebP möglich.');
  return checkFiles(result, { requireHTML: !partial });
}

export function newStand() { return crypto.randomUUID(); }
export function downloadProject(project, name = 'mein-lernprojekt.json') {
  const files = checkFiles(project.files);
  const entry = project.entry && files[project.entry] && /\.html$/i.test(project.entry) ? project.entry : Object.keys(files).find((name) => /\.html$/i.test(name));
  const url = URL.createObjectURL(new Blob([JSON.stringify({ format: 'azubiprep-pilot', version: 1, entry, files }, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importProject(file) {
  if (file.size > 15 * 1024 * 1024) throw new Error('Projektdatei zu groß.');
  const data = JSON.parse(await file.text());
  if (data.format !== 'azubiprep-pilot' || data.version !== 1) throw new Error('Unbekanntes Projektformat.');
  const files = checkFiles(data.files);
  if (data.entry !== undefined && (typeof data.entry !== 'string' || !files[data.entry] || !/\.html$/i.test(data.entry))) throw new Error('Ungültige Projektstartseite.');
  return { files, entry: data.entry };
}

export function downloadFile(name, file) {
  const data = file.kind === 'text' ? file.content : Uint8Array.from(atob(file.content.split(',')[1]), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement('a'); a.href = url; a.download = name.split('/').pop(); a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Nur Export eigener geprüfter Dateien; kein Entpacken fremder Archive.
export function projectZip(files) {
  checkFiles(files);
  const encoder = new TextEncoder(); const chunks = []; const central = []; let offset = 0;
  const header = (length) => { const bytes = new Uint8Array(length); return { bytes, view: new DataView(bytes.buffer) }; };
  for (const [name, file] of Object.entries(files)) {
    const filename = encoder.encode(name);
    const data = file.kind === 'text' ? encoder.encode(file.content) : Uint8Array.from(atob(file.content.split(',')[1]), (c) => c.charCodeAt(0));
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
    crc = (crc ^ 0xffffffff) >>> 0;
    const local = header(30); const v = local.view;
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x800, true); v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, filename.length, true);
    chunks.push(local.bytes, filename, data);
    const entry = header(46); const c = entry.view;
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, filename.length, true); c.setUint32(42, offset, true);
    central.push(entry.bytes, filename); offset += local.bytes.length + filename.length + data.length;
  }
  const size = central.reduce((n, entry) => n + entry.length, 0); const end = header(22); const e = end.view;
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, Object.keys(files).length, true); e.setUint16(10, Object.keys(files).length, true); e.setUint32(12, size, true); e.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end.bytes], { type: 'application/zip' });
}
export function downloadZip(files) {
  const url = URL.createObjectURL(projectZip(files));
  const a = document.createElement('a'); a.href = url; a.download = 'mein-lernprojekt.zip'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
