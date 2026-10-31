export const RAG_LIMITS = Object.freeze({ pdfBytes: 128 * 1024 * 1024, totalPdfBytes: 512 * 1024 * 1024, documents: 8, pages: 2500, pageChars: 20000, textChars: 12000000, chunks: 16000, indexBytes: 64 * 1024 * 1024, chunkChars: 1000, overlap: 120, sources: 3 });
import { searchPlan, diverseSearchHits, repairSearchText } from './search-query.js';
import { createSearchAliases } from './search-aliases.js';

export class RagError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
const stops = new Set('aber alle als also am an auch auf aus bei bis das dass dem den der des die dies diese dieser dieses doch du durch ein eine einer eines einem einen er es etwas für fuer hat haben hier ich im in ist ja kann kein keine mit nach nicht noch nur oder ohne sind so soll sollen und uns unter vom von vor war was welche welcher welches wenn werden wie wir wird wo zu zum zur'.split(' '));
export function terms(text) {
  const words = String(text).toLowerCase().replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss').normalize('NFKD').replace(/\p{M}/gu, '').match(/[\p{L}\p{N}]+/gu) || [];
  return words.filter(word => word.length >= 2 && word.length <= 60 && !stops.has(word));
}
export function buildIndex(pages) {
  if (!Array.isArray(pages) || !pages.length || pages.length > RAG_LIMITS.pages) throw new RagError('pages', 'Die PDF hat keine unterstützte Seitenanzahl.');
  const chunks = []; const frequencies = Object.create(null); let total = 0; let emptyPages = 0;
  for (let page = 0; page < pages.length; page++) {
    if (typeof pages[page] !== 'string' || pages[page].length > RAG_LIMITS.pageChars) throw new RagError('text_limit', 'Der Seitentext überschreitet die Verarbeitungsgrenze.');
    const text = pages[page].normalize('NFKC').replace(/-\s*\n\s*(?=\p{Ll})/gu, '').replace(/\s+/g, ' ').trim();
    total += text.length;
    if (total > RAG_LIMITS.textChars) throw new RagError('text_limit', 'Der Textbestand ist für diesen lokalen Index zu groß.');
    if (text.length < 40) emptyPages++;
    for (let start = 0; start < text.length;) {
      let end = Math.min(start + RAG_LIMITS.chunkChars, text.length);
      if (end < text.length) { const boundary = text.lastIndexOf(' ', end); if (boundary > start + RAG_LIMITS.chunkChars / 2) end = boundary; }
      const content = text.slice(start, end).trim(); const words = terms(content);
      if (words.length >= 4) {
        const counts = Object.create(null);
        for (const word of words) counts[word] = (counts[word] || 0) + 1;
        for (const word of Object.keys(counts)) frequencies[word] = (frequencies[word] || 0) + 1;
        chunks.push({ page: page + 1, start, end, text: content, counts, length: words.length });
        if (chunks.length > RAG_LIMITS.chunks) throw new RagError('index_limit', 'Zu viele Textabschnitte für diesen lokalen Index.');
      }
      if (end === text.length) break;
      start = Math.max(start + 1, end - RAG_LIMITS.overlap);
    }
  }
  if (total < 100 || !chunks.length) throw new RagError('no_text', 'Kein ausreichender lesbarer Text gefunden. Für gescannte PDFs wäre eine gesonderte OCR-Erkennung nötig.');
  return { schema: 1, method: 'bm25-1', pages: pages.length, emptyPages, chunks, frequencies, averageLength: chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length };
}
export function searchIndex(index, query, aliases) {
  if (index.schema !== 1 || index.method !== 'bm25-1' || !Array.isArray(index.chunks) || index.chunks.length > RAG_LIMITS.chunks || !index.frequencies || !index.averageLength) throw new RagError('index', 'Der lokale Index ist nicht lesbar. Bitte das Material neu aufbereiten.', 409);
  aliases ||= createSearchAliases(index.chunks.map(chunk => chunk.text));
  // Alte Indizes können PDF-Silbentrennungen enthalten. Ausschließlich die
  // flüchtige Suchsicht reparieren; gespeicherte Texte und Seiten bleiben gleich.
  const frequencies = Object.assign(Object.create(null), index.frequencies);
  const chunks = index.chunks.map(chunk => {
    const repaired = repairSearchText(chunk.text, aliases); if (repaired === chunk.text) return chunk;
    const words = terms(repaired); const repairedCounts = Object.create(null);
    for (const word of words) repairedCounts[word] = (repairedCounts[word] || 0) + 1;
    // Ursprüngliche Tokens behalten (z. B. SQL bei „SQL- basierte“).
    const counts = Object.assign(Object.create(null), chunk.counts);
    for (const [word, count] of Object.entries(repairedCounts)) counts[word] = Math.max(count, counts[word] || 0);
    for (const word of Object.keys(counts)) if (!Object.hasOwn(chunk.counts, word)) frequencies[word] = (frequencies[word] || 0) + 1;
    return { ...chunk, counts, length: Object.values(counts).reduce((sum, count) => sum + count, 0) };
  });
  const averageLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0) / Math.max(1, chunks.length);
  const plan = searchPlan(query, Object.keys(frequencies), aliases);
  if (!plan.some(concept => concept.variants.length)) return [];
  const result = [];
  for (const chunk of chunks) {
    let score = 0; const matched = [];
    for (const concept of plan) {
      let best = 0;
      for (const variant of concept.variants) {
        const groups = variant.partGroups || [[variant.word]];
        const scores = groups.map(group => Math.max(0, ...group.map(word => {
          const count = Object.hasOwn(chunk.counts, word) ? chunk.counts[word] : 0;
          if (!count) return 0;
          const idf = Math.log(1 + (chunks.length - frequencies[word] + 0.5) / (frequencies[word] + 0.5));
          return idf * count * 2.2 / (count + 1.2 * (0.25 + 0.75 * chunk.length / averageLength));
        })));
        best = Math.max(best, variant.weight * Math.min(...scores));
      }
      if (best > 0) { score += best; matched.push(...concept.positions); }
    }
    if (matched.length && score > 0) result.push({ ...chunk, score, matched });
  }
  return diverseSearchHits(result, 12);
}
