import { cleanCSS } from './preview.js';

export const DEBUG_CSS_BYTES = 16384;
export function checkDebugCSS(source) {
  if (typeof source !== 'string' || new TextEncoder().encode(source).length > DEBUG_CSS_BYTES) throw new Error('Bitte CSS bis 16 KiB verwenden.');
  return source;
}
export function prepareDebugCSS(source) {
  const warnings = [];
  const css = cleanCSS(checkDebugCSS(source), warnings);
  return { css, warnings: [...new Set(warnings)] };
}
export function checkDebugCSSFile(file) {
  if (!file || !/^[a-zA-Z0-9_-][a-zA-Z0-9_. -]{0,100}\.css$/i.test(file.name) || file.webkitRelativePath && file.webkitRelativePath !== file.name || !Number.isSafeInteger(file.size) || file.size < 0 || file.size > DEBUG_CSS_BYTES) throw new Error('Bitte eine einzelne CSS-Datei mit einfachem Namen bis 16 KiB auswählen; private oder verschachtelte Pfade werden nicht gelesen.');
}
export const initialCSSProject = () => ({
  schema: 1, mode: 'module', entry: 'main.js',
  html: '<h1>Klassen sichtbar umschalten</h1>\n<button id="umschalten">Farbe wechseln</button>\n<p id="karte" class="karte">Meine gestaltete Karte</p>',
  css: 'body { font-family: system-ui; padding: 12px; }\n.karte { color: #17324d; background-color: #dbeafe; padding: 24px; border-width: 2px; border-style: solid; border-color: #2563eb; border-radius: 12px; }\n.karte.aktiv { color: #ffffff; background-color: #166534; border-color: #14532d; }\n',
  files: { 'main.js': 'const karte = document.querySelector("#karte");\nconst button = document.querySelector("#umschalten");\nbutton.addEventListener("click", () => {\n  karte.classList.toggle("aktiv");\n  console.log(karte.className);\n});\n' },
});
