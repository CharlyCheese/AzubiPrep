// Kleine, bewusst konservative Quelltexterkennung, kein HTML-Validator.
// Keine Dateipfade öffnen; ausschließlich ausdrücklich freigegebener Text.
const isSpace = char => [' ', '\t', '\n', '\r', '\f'].includes(char);
const skipSpace = (source, start) => { let end = start; while (isSpace(source[end])) end++; return end; };
function tagEnd(source, start, closing) {
  let cursor = start;
  while (cursor < source.length) {
    const next = skipSpace(source, cursor);
    if (source[next] === '>') return next;
    if (!closing && source[next] === '/' && source[next + 1] === '>') return next + 1;
    if (closing || next === cursor) return null;
    const attribute = source.slice(next).match(/^[a-z_:][a-z0-9_.:-]*/i);
    if (!attribute) return null;
    const afterName = next + attribute[0].length;
    cursor = skipSpace(source, afterName);
    if (source[cursor] !== '=') { cursor = afterName; continue; }
    cursor = skipSpace(source, cursor + 1);
    const quote = source[cursor];
    // Gültige unquotierte Werte bleiben ebenfalls außerhalb dieses engen
    // Musters. Insbesondere Quotes darin nicht als Wertbeginn missdeuten.
    if (quote !== '"' && quote !== "'") return null;
    const end = source.indexOf(quote, cursor + 1);
    if (end < 0) return null;
    cursor = end + 1;
  }
  return null;
}
function rawEnd(source, start, name) {
  for (let cursor = source.indexOf('</', start); cursor >= 0; cursor = source.indexOf('</', cursor + 2)) {
    const afterName = cursor + name.length + 2;
    if (source.slice(cursor + 2, afterName).toLowerCase() !== name) continue;
    const separator = source[afterName];
    if (separator !== '>' && separator !== '/' && !isSpace(separator)) return null;
    const end = skipSpace(source, afterName);
    return source[end] === '>' ? end : null;
  }
  return null;
}
function headingTags(source) {
  const headings = [];
  let position = 0;
  while (position < source.length) {
    const start = source.indexOf('<', position);
    if (start < 0) break;
    if (source.startsWith('<!--', start)) {
      const end = source.indexOf('-->', start + 4);
      if (end < 0) return null;
      const comment = source.slice(start + 4, end);
      if (comment.startsWith('>') || comment.startsWith('->') || comment.includes('--')) return null;
      position = end + 3; continue;
    }
    if (source.slice(start, start + 9).toLowerCase() === '<!doctype') {
      const value = skipSpace(source, start + 9);
      const end = skipSpace(source, value + 4);
      if (value === start + 9 || source.slice(value, value + 4).toLowerCase() !== 'html' || source[end] !== '>') return null;
      position = end + 1; continue;
    }
    const match = source.slice(start).match(/^<(\/?)([a-z][a-z0-9:-]*)/i);
    if (!match) return null;
    const name = match[2].toLowerCase(); const closing = match[1] === '/';
    const afterName = start + match[0].length;
    const end = tagEnd(source, afterName, closing);
    if (end === null) return null;
    // Bei fremden Namensräumen, Sonder-Einfügemodi und komplexem Rawtext
    // lieber keinen festen Hinweis als eine scheinbar vollständige Analyse.
    if (['script', 'noscript', 'plaintext', 'xmp', 'iframe', 'noembed', 'noframes', 'template', 'svg', 'math', 'table', 'select', 'frameset'].includes(name)) return null;
    if (!closing && ['title', 'textarea', 'style'].includes(name)) {
      const close = rawEnd(source, end + 1, name);
      if (close === null) return null;
      position = close + 1; continue;
    }
    if (name === 'h1') {
      const raw = source.slice(start, end + 1);
      if (skipSpace(source, afterName) !== end) return null;
      headings.push({ start, end: end + 1, closing, raw });
    }
    position = end + 1;
  }
  return headings;
}

export function headingCodeHint(files) {
  for (const file of files) {
    if (!file.complete || !/\.html$/i.test(file.path)) continue;
    const tags = headingTags(file.content);
    if (!tags || tags.length !== 2 || tags.some(tag => tag.closing)) continue;
    const content = file.content.slice(tags[0].end, tags[1].start);
    if (!content.trim() || content.includes('<')) continue;
    const correction = content.length <= 350 ? `\n\nWenn beide Tags deine eine Hauptüberschrift umschließen sollen, lautet nur dieser Ausschnitt:\n${tags[0].raw}${content}</h1>` : '\n\nWenn beide Tags deine eine Hauptüberschrift umschließen sollen, ändere das zweite <h1> zu </h1>.';
    return `In ${file.path} stehen zwei öffnende h1-Tags (Start-Tags) und kein schließendes h1-Tag (End-Tag). <h1> öffnet die Überschrift; </h1> schließt sie. Beim End-Tag steht / vor h1.${correction}\n\nDeinen eigenen Text kannst du behalten. Browser wenden bei fehlerhaftem HTML eigene Regeln zur Fehlerbehandlung an und können zum Beispiel Elemente automatisch schließen oder anders einordnen. Deshalb kann die Vorschau plausibel aussehen, obwohl der Quelltext Fehler enthält. Die entstehende Struktur kann von deiner Absicht abweichen; deine Quelldatei wird dadurch nicht korrigiert. Das ist ein begrenzter Codehinweis, keine vollständige HTML-Syntaxprüfung.`;
  }
  return null;
}
