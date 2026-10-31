import { describe, expect, it } from 'vitest';
import { headingCodeHint } from '../src/ai-html.js';

const hint = (content, complete = true) => headingCodeHint([{ path: 'index.html', content, complete }]);
describe('Begrenzte feste h1-Codehinweise', () => {
  it('unterscheidet zwei Start-Tags von End-Tags und behält den eigenen Inhalt', () => {
    const source = '<!doctype html><html lang="de"><head><title>Mein Projekt</title></head><body><h1>Mein eigener Titel<h1><p>Mein Absatz</p></body></html>';
    const result = hint(source);
    expect(result).toContain('zwei öffnende h1-Tags');
    expect(result).toContain('kein schließendes h1-Tag');
    expect(result).toContain('<h1>Mein eigener Titel</h1>');
    expect(result).not.toContain('Meine Hauptüberschrift');
    expect(result).toContain('eigene Regeln zur Fehlerbehandlung');
    expect(result).toContain('obwohl der Quelltext Fehler enthält');
    expect(result).toContain('Quelldatei wird dadurch nicht korrigiert');
    expect(result).toContain('keine vollständige HTML-Syntaxprüfung');
  });
  it('behandelt korrekte einzelne oder mehrere Überschriften nicht als Fehler', () => {
    for (const source of ['<h1>Mein Titel</h1>', '<h1>Erstes Thema</h1><h1>Zweites Thema</h1>', '&lt;h1&gt;Text&lt;h1&gt;', '<h1></h1>', '<h1>Ohne weitere Angaben']) expect(hint(source)).toBeNull();
  });
  it('zählt Kommentare, Attributwerte und RCDATA-/CSS-Inhalte nicht als h1-Tags', () => {
    for (const source of ['<!-- <h1>Text<h1> -->', '<div data-example="<h1>Text<h1>">Inhalt</div>', "<div data-example='<h1>Text<h1>'>Inhalt</div>", '<title><h1>Text<h1></title>', '<textarea><h1>Text<h1></textarea>', '<style>/* <h1>Text<h1> */</style>']) expect(hint(source)).toBeNull();
    expect(hint('<title>Beispiel mit <h1></title><h1>Eigener Titel<h1>')).toContain('<h1>Eigener Titel</h1>');
  });
  it('gibt bei unklaren Kontexten oder unvollständigen Ausschnitten keine feste Diagnose ab', () => {
    for (const source of ['<script>"<h1>Text<h1>"</script>', '<template><h1>Text<h1></template>', '<svg><h1>Text<h1></svg>', '<select><h1>Text<h1></select>', '<table><h1>Text<h1></table>', '<!-- nicht geschlossen <h1>Text<h1>', '<h1>Text<h1><div title="nicht geschlossen>', '<h1 class="titel">Text<h1>', '<h1>Text<em>hier</em><h1>', '<h1>Text<h1>weiter</h1>']) expect(hint(source)).toBeNull();
    expect(hint('<h1>Text<h1>', false)).toBeNull();
    expect(headingCodeHint([{ path: 'index.html', content: '<h1>Text<h1>' }])).toBeNull();
    expect(headingCodeHint([{ path: 'style.css', content: '<h1>Text<h1>', complete: true }])).toBeNull();
  });
  it('verwechselt Unicode-Abstände und Quotes in unquotierten Werten nicht mit HTML-Trennzeichen', () => {
    for (const source of ['<h1\u00a0>Titel<h1\u00a0>', '<h1\u2003>Titel<h1\u2003>', '<h1>Titel<h1><div data=x"foo></h1>"></div>', '<h1>Titel<h1><div data=x="foo></h1>"></div>', '<h1>Titel<h1><title>Rohtext</title attr></h1></title>', '<h1>Titel<h1><title>Rohtext</title\u00a0></h1></title>']) expect(hint(source)).toBeNull();
    expect(hint('<title>İ</title><h1\f>Titel<h1\f>')).toContain('zwei öffnende h1-Tags');
  });
  it('gibt für langen eigenen Text nur die minimale Tagänderung vor', () => {
    const result = hint(`<h1>${'Eigener Text '.repeat(40)}<h1>`);
    expect(result).toContain('ändere das zweite <h1> zu </h1>');
    expect(result).not.toContain('Eigener Text '.repeat(40));
  });
  it('lehnt abrupte oder verschachtelte Kommentare ab, statt darin echte End-Tags zu verschlucken', () => {
    for (const source of ['<h1>Titel<h1><!--></h1><!-- -->', '<h1>Titel<h1><!---></h1><!-- -->', '<h1>Titel<h1><!-- --!></h1><!-- -->', '<h1>Titel<h1><!-- <!-- --></h1>']) expect(hint(source)).toBeNull();
    expect(hint('<!-- Kurzer Hinweis --><h1>Eigener Titel<h1>')).toContain('<h1>Eigener Titel</h1>');
  });
});
