import { checkJsDraft } from './js-draft.js';
import { checkDebugCSS } from './debugger-css.js';
import { checkDebugHTML } from './debugger-dom.js';
export const MODULE_FILES = 16;
export const MODULE_BYTES = 64 * 1024;
export const MODULE_PATH = 128;
const privatePart = part => part.startsWith('.') || ['node_modules', 'local-rag', 'local-ai'].includes(part.toLowerCase());
const component = part => /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,62}$/.test(part) && !part.endsWith('.') && !privatePart(part);
export function checkModulePath(name) {
  if (typeof name !== 'string' || name.length > MODULE_PATH) throw new Error('Modulpfad zu lang oder ungültig.');
  const parts = name.split('/');
  if (parts.length > 8 || parts.some(part => !component(part))) throw new Error('Bitte einfache Modulpfade ohne private oder besondere Pfadteile verwenden.');
  checkJsDraft({ schema: 1, name: parts.at(-1), source: '' });
  return name;
}
export const initialDebugProject = () => ({ schema: 1, mode: 'module', entry: 'main.js', files: {
  'main.js': 'import { verdoppeln } from "./berechnung.js";\nconst ergebnis = verdoppeln(3);\nconsole.log(ergebnis);\n',
  'berechnung.js': 'export function verdoppeln(zahl) {\n  return zahl * 2;\n}\n',
} });
export function checkDebugProject(value) {
  if (!value || value.schema !== 1 || value.mode !== 'module' || typeof value.entry !== 'string' || !value.files || typeof value.files !== 'object' || Array.isArray(value.files)) throw new Error('Ungültiges Modulprojekt.');
  const entries = Object.entries(value.files);
  if (!entries.length || entries.length > MODULE_FILES) throw new Error('Bitte 1 bis 16 JavaScript-Dateien verwenden.');
  const files = {}, names = new Set(); let size = 0;
  for (const [name, source] of entries) {
    checkModulePath(name);
    checkJsDraft({ schema: 1, name: name.split('/').at(-1), source });
    if (names.has(name.toLowerCase())) throw new Error('Dateinamen müssen auch ohne Groß-/Kleinschreibung eindeutig sein.');
    names.add(name.toLowerCase()); size += new TextEncoder().encode(source).length;
    if (size > MODULE_BYTES) throw new Error('Das Modulprojekt darf insgesamt höchstens 64 KiB Quelltext enthalten.');
    files[name] = source;
  }
  for (const name of names) { const parts = name.split('/'); parts.pop(); while (parts.length) { if (names.has(parts.join('/'))) throw new Error('Ein Modulpfad ist zugleich Datei und Ordner.'); parts.pop(); } }
  if (!Object.hasOwn(files, value.entry)) throw new Error('Die Modulstartdatei fehlt.');
  return { schema: 1, mode: 'module', entry: value.entry, files, ...(value.html===undefined?{}:{html:checkDebugHTML(value.html)}), ...(value.css===undefined?{}:{css:checkDebugCSS(value.css)}) };
}
export function checkDOMProject(value){const project=checkDebugProject({...value,mode:'module'});return {...project,mode:'dom',html:checkDebugHTML(value.html)};}
export function resolveDebugImport(base, requested, files) {
  checkModulePath(base);
  if (!Object.hasOwn(files, base) || typeof requested !== 'string' || requested.length > MODULE_PATH || !/^(?:\.\/|\.\.\/)/.test(requested)) throw new Error('Nur relative Imports aus diesem Modulprojekt sind erlaubt.');
  const parts = base.split('/'); parts.pop();
  for (const part of requested.split('/')) {
    if (part === '.') continue;
    if (part === '..') { if (!parts.length) throw new Error('Import verlässt die Projektwurzel.'); parts.pop(); }
    else { if (!component(part)) throw new Error('Nicht unterstützter Importpfad.'); parts.push(part); }
  }
  const name = checkModulePath(parts.join('/'));
  if (!Object.hasOwn(files, name)) throw new Error('Importierte Projektdatei fehlt: ' + name);
  return name;
}

// Metadata-only pass. No File.text() may happen before the complete selection
// has passed path/count/size checks. Non-JS/private files are never read.
export function folderDebugFiles(list) {
  if (!list.length || list.length > 10000) throw new Error('Bitte einen überschaubaren Modulordner auswählen.');
  const entries = [], names = new Set(); let root = null, skipped = 0, size = 0;
  for (const file of list) {
    const path = file.webkitRelativePath;
    if (typeof path !== 'string' || /[\\:\u0000]/.test(path)) throw new Error('Ungültige Ordnerpfade.');
    const parts = path.split('/');
    if (parts.length < 2 || !parts[0] || parts.at(-1) !== file.name) throw new Error('Ungültige Ordnerpfade.');
    if (root === null) root = parts[0];
    if (root !== parts[0]) throw new Error('Bitte genau einen Projektordner auswählen.');
    if (parts.some(part => part === '.' || part === '..' || !part)) throw new Error('Ungültige Ordnerpfade.');
    if (parts.some(privatePart) || !file.name.endsWith('.js')) { skipped++; continue; }
    const name = checkModulePath(parts.slice(1).join('/'));
    if (names.has(name.toLowerCase())) throw new Error('Doppelte Modulpfade.');
    names.add(name.toLowerCase());
    if (!Number.isSafeInteger(file.size) || file.size < 0) throw new Error('Ungültige Dateigröße.');
    size += file.size;
    if (entries.length >= MODULE_FILES || size > MODULE_BYTES) throw new Error('Modulordner überschreitet 16 Dateien oder 64 KiB.');
    entries.push({ file, name });
  }
  if (!entries.length) throw new Error('Keine geeigneten JavaScript-Dateien im Modulordner.');
  // Check file/directory collisions before reading, too.
  checkDebugProject({ schema: 1, mode: 'module', entry: entries[0].name, files: Object.fromEntries(entries.map(entry => [entry.name, ''])) });
  return { entries, skipped };
}
