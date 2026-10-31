// Rein synthetischer öffentlicher Testtext, keine fremden Dokumentinhalte.
export function syntheticPdf(pages = ['HTML beschreibt die Struktur von Webseiten. Eine Hauptueberschrift beginnt mit h1 und endet mit einem passenden Endtag. CSS gestaltet Farben und Schrift.']) {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const children = [];
  for (const text of pages) {
    const page = objects.length + 1; const content = page + 1; children.push(`${page} 0 R`);
    const escaped = text.replace(/[\\()]/g, char => '\\' + char).replace(/[^\x20-\x7e]/g, '?');
    const stream = `BT /F1 12 Tf 40 700 Td (${escaped}) Tj ET`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> >> /Contents ${content} 0 R >>`, `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  }
  objects[1] = `<< /Type /Pages /Kids [${children.join(' ')}] /Count ${children.length} >>`;
  let result = '%PDF-1.4\n'; const offsets = [0];
  for (let index = 0; index < objects.length; index++) { offsets.push(Buffer.byteLength(result)); result += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`; }
  const start = Buffer.byteLength(result); result += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) result += `${String(offset).padStart(10, '0')} 00000 n \n`;
  result += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return Buffer.from(result);
}
