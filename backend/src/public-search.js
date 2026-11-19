import { DEFAULT_ALIASES } from './search-aliases.js';
import { publicSearchDocuments } from './public-search-documents.js';

export const SEARCH_TYPES = ['fragen', 'module', 'theorie', 'glossar', 'lernreise', 'werkstatt'];
const typeWords = {
  fragen: 'Frage Fragen Quiz Prüfungsfrage', module: 'Modul Module',
  theorie: 'Theorie', glossar: 'Glossar Begriff Fachbegriff',
  lernreise: 'Lernreise Lernabschnitt', werkstatt: 'Werkstatt Frontendkurs Lektion',
};
const commonWords = new Set('an als am auf aus bei das dem den der des die du ein eine einer einem einen er es fuer hat im in ist mit oder sich sind und von was welche welcher welches wie wird wo zu zum zur'.split(' '));

function normalize(value) {
  return value.toLowerCase().replaceAll('ä', 'ae').replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue').replaceAll('ß', 'ss').normalize('NFKD').replace(/\p{M}/gu, '')
    .replace(/\bc\+\+/g, 'cpp').replace(/\bc#/g, 'csharp').replace(/\.net\b/g, 'dotnet')
    .replace(/\b(?:lernfeld|lf)[\s-]*(\d+[a-d]?)\b/g, 'lf$1')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function canonical(value) {
  return normalize(DEFAULT_ALIASES.normalize(value))
    .replace(/\bdatensicherung(?:en)?\b|\bbackups\b/g, 'backup')
    .replace(/\bkennwort\b/g, 'passwort')
    .replace(/\bsubnetzbildung\b/g, 'subnetting')
    .replace(/\bwi ?fi\b/g, 'wlan');
}

// Build once per content snapshot. Postings carry each document's best field
// weight. The three-letter lookup also finds German compounds without scanning
// the question bank or the entire vocabulary for each search.
export function buildPublicSearchIndex(content, journey, workshop, practices = {}) {
  const documents = [];
  const postings = new Map();
  const fragments = new Map();
  for (const entry of publicSearchDocuments(content, journey, workshop, practices)) {
    const position = documents.length;
    const weights = new Map();
    const add = (value, weight) => {
      if (!value) return;
      const raw = normalize(value);
      const equivalent = canonical(value);
      const text = raw === equivalent ? raw : raw + ' ' + equivalent;
      for (const word of text.split(' ')) {
        if (word && !weights.has(word)) weights.set(word, weight);
      }
    };
    add(entry.title, 12);
    add(entry.keywords?.join('\n'), 8);
    add(entry.description, 5);
    add(entry.id, 4);
    add(entry.context, 4);
    add(typeWords[entry.type], 3);
    add(entry.passages?.join('\n'), 2);
    add(entry.extra?.join('\n'), 1);
    for (const [word, weight] of weights) {
      if (!postings.has(word)) {
        postings.set(word, []);
        const unique = new Set();
        for (let i = 0; i + 3 <= word.length; i++) unique.add(word.slice(i, i + 3));
        for (const part of unique) {
          if (!fragments.has(part)) fragments.set(part, []);
          fragments.get(part).push(word);
        }
      }
      postings.get(word).push(position, weight);
    }
    const { keywords, extra, passages, shortId, ...result } = entry;
    documents.push({ result, title: canonical(entry.title), id: normalize(entry.id), shortId: shortId && normalize(shortId), passages: passages?.filter(Boolean) || [] });
  }
  return { documents, postings, fragments };
}

function matchingDocuments(index, word) {
  const scores = new Map();
  const variants = word.length < 3 ? [word] : index.fragments.get(word.slice(0, 3)) || [];
  const field = /^lf\d+[a-d]?$/.test(word);
  for (const variant of variants) {
    // The glossary's opaque topic hashes are exact identifiers. Their digits
    // and hexadecimal letters must not create accidental subject matches.
    if (variant !== word && /^[a-f0-9]{20}$/.test(variant)) continue;
    // LF1 is not the same stage as LF10–12; LF10 can include LF10a–d.
    if (field && variant !== word && !(variant.slice(0, -1) === word && /[a-d]$/.test(variant))) continue;
    let factor = 0;
    if (variant === word) factor = 1;
    else if (variant.startsWith(word)) factor = 0.75;
    else if (word.length >= 4 && variant.includes(word)) factor = 0.55;
    if (!factor) continue;
    const hits = index.postings.get(variant) || [];
    for (let i = 0; i < hits.length; i += 2) {
      const position = hits[i];
      scores.set(position, Math.max(scores.get(position) || 0, hits[i + 1] * factor));
    }
  }
  return scores;
}

function intersect(scores, hits) {
  for (const [position, score] of scores) {
    if (hits.has(position)) scores.set(position, score + hits.get(position));
    else scores.delete(position);
  }
}

function matchConcept(index, word) {
  const hits = matchingDocuments(index, word);
  if (!hits.size && word.length >= 8 && word.length <= 60) {
    // German compounds can be written as separate words in an exercise. Only
    // split at known vocabulary on BOTH sides, with optional linking -s/-es.
    for (let split = 4; split <= word.length - 4; split++) {
      const right = word.slice(split);
      if (!index.postings.has(right)) continue;
      const head = word.slice(0, split);
      for (const left of new Set([head, head.replace(/(?:es|s)$/, '')])) {
        if (left.length < 4 || !index.postings.has(left)) continue;
        const combined = matchingDocuments(index, left);
        intersect(combined, matchingDocuments(index, right));
        if (combined.size) return { hits: combined, parts: [left, right] };
      }
    }
  }
  return { hits, parts: [word] };
}

function excerpt(doc, words) {
  let text = doc.result.description || '';
  if (!words.every(word => doc.title.includes(word))) {
    let best = 0;
    for (const passage of doc.passages) {
      for (const sentence of passage.split(/(?<=[.!?])\s+|\n/u)) {
        const normalized = canonical(sentence);
        const matches = words.filter(word => normalized.includes(word));
        if (matches.length <= best) continue;
        best = matches.length;
        const offset = Math.max(0, normalized.indexOf(matches[0]) - 70);
        text = offset > 20 ? '…' + sentence.slice(offset).replace(/^\S*\s/u, '') : sentence;
        if (best === words.length) break;
      }
      if (best === words.length) break;
    }
  }
  const compact = text.trim().replace(/\s+/g, ' ');
  return compact.length > 220 ? compact.slice(0, 219).trimEnd() + '…' : compact;
}

export function searchPublicContent(index, { q, typ, seite, limit }) {
  const phrase = canonical(q);
  const allWords = [...new Set(phrase.split(' ').filter(Boolean))];
  const meaningful = allWords.filter(word => !commonWords.has(word));
  const words = meaningful.length ? meaningful : allWords;
  const excerptWords = [];
  let scores = null;
  for (const word of words) {
    const { hits, parts } = matchConcept(index, word);
    excerptWords.push(...parts);
    if (scores === null) scores = hits;
    else intersect(scores, hits);
    if (!scores.size) break;
  }
  const counts = Object.fromEntries(SEARCH_TYPES.map(type => [type, 0]));
  const matches = [];
  for (const [position, score] of scores || []) {
    const doc = index.documents[position];
    counts[doc.result.type]++;
    if (typ && typ !== 'alle' && doc.result.type !== typ) continue;
    let bonus = doc.result.type === 'fragen' ? 0 : 1;
    if (doc.id === phrase || doc.shortId === phrase) bonus += 80;
    else if (doc.title === phrase) bonus += 60;
    else if (doc.title.startsWith(phrase)) bonus += 15;
    else if (doc.title.includes(phrase)) bonus += 10;
    matches.push({ position, score: score + bonus });
  }
  matches.sort((a, b) => b.score - a.score || a.position - b.position);
  const pageSize = Math.min(50, positiveInteger(limit, 8));
  const page = Math.min(positiveInteger(seite, 1), Math.max(1, Math.ceil(matches.length / pageSize)));
  const results = matches.slice((page - 1) * pageSize, page * pageSize).map(({ position }) => {
    const doc = index.documents[position];
    return { ...doc.result, description: excerpt(doc, excerptWords) };
  });
  return { q, counts, total: matches.length, page, pageSize, results };
}

function positiveInteger(input, fallback) {
  const value = Number(input);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}
