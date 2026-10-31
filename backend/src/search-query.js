// Begrenzte, deterministische Abfragehilfe; keine Modell-/Netzwerkzugriffe und
// keine Änderung gespeicherter Dokumenttexte oder bestehender Indexversionen.
import { DEFAULT_ALIASES } from './search-aliases.js';
const ignored = new Set(('aber als am an auch auf aus bei bis das dass dem den der des die diese dieser dieses doch du durch ein eine einer eines einem einen er es für fuer hat haben ich im in ist ja kann kein keine mit nach nicht noch nur oder ohne sind so soll sollen und uns unter vom von vor war was welche welcher welches wenn werden wie wir wird wo zu zum zur ' +
  'bitte mir mich erkläre erklaere erklären erklaeren erklärung erklaerung erklären unterschied unterschiede unterschieds unterscheiden unterscheidet unterscheide zwischen vergleiche vergleichen vergleich gegenüber gegenueber versus vs genauer ausführlich ausfuehrlich kurz beispiel beispiele bedeutung bedeutet eigentlich bitte mal denn genau wieso warum weshalb worin besteht bestehen gibt sich etwas alles über ueber frage fragen theorie konkrete konkreter wesentliche wesentlichen').split(' '));
export function searchAliasText(text, aliases = DEFAULT_ALIASES) {
  return aliases.normalize(text);
}
function normalized(text, aliases) { return searchAliasText(text, aliases).toLowerCase().replaceAll('ä', 'ae').replaceAll('ö', 'oe').replaceAll('ü', 'ue').replaceAll('ß', 'ss').normalize('NFKD').replace(/\p{M}/gu, ''); }
function tokens(text, aliases) {
  return [...normalized(text, aliases).matchAll(/[\p{L}\p{N}]+/gu)].map(match => ({ word: match[0], start: match.index, end: match.index + match[0].length })).filter(item => item.word.length >= 2 && item.word.length <= 60 && !ignored.has(item.word));
}
function words(text, aliases) {
  return tokens(text, aliases).map(item => item.word);
}
function stem(word, aliases) {
  if (aliases.isAcronym(word)) return word;
  let value = word.replaceAll('ae', 'a').replaceAll('oe', 'o').replaceAll('ue', 'u');
  for (let n = 0; n < 2 && value.length >= 5; n++) {
    const ending = ['ern', 'em', 'en', 'er', 'es', 'e', 's'].find(suffix => value.endsWith(suffix) && value.length - suffix.length >= 4);
    if (!ending) break; value = value.slice(0, -ending.length);
  }
  return value;
}
function oneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0; let j = 0; let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + Number(i < a.length || j < b.length) <= 1;
}
export function searchQueryInfo(query) {
  const original = String(query);
  // Nur der eindeutige Tarifparteien-Kontext erhält diesen Begriffshinweis;
  // ein beliebiger wirtschaftlicher oder technischer Verbund bleibt unverändert.
  const corrected = /gewerkschaft/i.test(original) ? original.replace(/\barbeitgeber[ \t-]*verbund(?:e|es|en)?\b/gi, 'Arbeitgeberverband') : original;
  return { query: corrected, note: corrected === original ? '' : 'Suchhinweis: Im Vergleich mit Gewerkschaften wurde „Arbeitgeberverbund“ als „Arbeitgeberverband“ verstanden.' };
}
export function repairSearchText(text, aliases = DEFAULT_ALIASES) {
  let value = searchAliasText(text, aliases).replace(/(?<=\p{L})\u00ad(?=\p{L})/gu, '');
  for (let pass = 0; pass < 4; pass++) {
    const next = value.replace(/(\p{L}{2,})[-\u00ad\u2010\u2011]\s+(\p{Ll}{2,})/gu, (all, left, right) => ['und', 'oder', 'sowie'].includes(right) ? all : left + right);
    if (next === value) break; value = next;
  }
  return searchAliasText(value, aliases);
}
export function searchPlan(query, vocabulary, aliases = DEFAULT_ALIASES) {
  const text = normalized(searchQueryInfo(query).query.slice(0, 3000), aliases); const raw = tokens(text, aliases).slice(0, 24);
  const entries = [...new Set(vocabulary)].filter(word => typeof word === 'string' && word.length <= 60).map(word => ({ word, stem: stem(word, aliases) }));
  const byStem = new Map();
  for (const entry of entries) { if (!byStem.has(entry.stem)) byStem.set(entry.stem, []); byStem.get(entry.stem).push(entry.word); }
  function variants(word, compound = false) {
    const key = stem(word, aliases); const exact = byStem.get(key) || [];
    if (exact.length) return exact.slice(0, 6).map(value => ({ word: value, weight: value === word ? 1 : 0.95 }));
    if (aliases.isAcronym(word) || key.length < 7) return [];
    const matches = [];
    for (const entry of entries.slice(0, 60000)) {
      if (oneEdit(key, entry.stem)) matches.push({ word: entry.word, weight: 0.75 });
      if (matches.length === 6) break;
    }
    if (matches.length || compound) return matches;
    // Getrennte Quellschreibweisen müssen innerhalb derselben Textstelle
    // vollständig vorkommen; sie sind keine zwei frei austauschbaren Treffer.
    for (let split = 4; split <= word.length - 4; split++) {
      const left = byStem.get(stem(word.slice(0, split), aliases)); const right = byStem.get(stem(word.slice(split), aliases));
      if (left?.length && right?.length) matches.push({ partGroups: [left.slice(0, 6), right.slice(0, 6)], weight: 0.85 });
      if (matches.length === 6) break;
    }
    return matches;
  }
  const concepts = [];
  for (let position = 0; position < raw.length; position++) {
    const adjacent = position + 1 < raw.length && /^[ \t-]+$/.test(text.slice(raw[position].end, raw[position + 1].start));
    const joined = adjacent ? variants(raw[position].word + raw[position + 1].word, true) : [];
    if (joined.length) { concepts.push({ positions: [position, position + 1], variants: joined }); position++; }
    else concepts.push({ positions: [position], variants: variants(raw[position].word) });
  }
  return concepts;
}
export function scoreSearch(plan, documentWords) {
  const set = documentWords instanceof Set ? documentWords : new Set(documentWords);
  const matched = []; let score = 0;
  for (const concept of plan) {
    const weight = Math.max(0, ...concept.variants.filter(variant => (variant.partGroups || [[variant.word]]).every(group => group.some(word => set.has(word)))).map(variant => variant.weight));
    if (weight) { matched.push(...concept.positions); score += weight; }
  }
  return { matched, score };
}
export function comparisonGroups(query, aliases = DEFAULT_ALIASES) {
  const question = searchAliasText(searchQueryInfo(query).query, aliases).split('\n')[0];
  if (!/\b(?:untersch(?:ied|eid)\w*|vergleich\w*|vs\.?|versus|gegenüber|gegenueber)\b/i.test(question)) return [];
  const between = /\bzwischen\s+/i.exec(question); const start = between ? between.index + between[0].length : 0;
  const separatorPattern = /\bunterscheid(?:et|en|e|est)\b/i.test(question) ? /\s+(?:und|oder|vs\.?|versus|gegenüber|gegenueber|mit|zu|von)\s+/i : /\s+(?:und|oder|vs\.?|versus|gegenüber|gegenueber|mit|zu)\s+/i;
  const separator = separatorPattern.exec(question.slice(start));
  if (!separator) return [];
  const middle = start + separator.index; const rightStart = middle + separator[0].length;
  const rightHead = question.slice(rightStart).split(/\s+(?:bei|beim|in|hinsichtlich|bezüglich|bezueglich|für|fuer|unter|auf|mit)\s+/i)[0];
  const offset = words(question.slice(0, start), aliases).length; const left = words(question.slice(start, middle), aliases).length; const right = words(rightHead, aliases).length;
  if (!left || !right) return [];
  return [Array.from({ length: Math.min(left, Math.max(0, 24 - offset)) }, (_, n) => offset + n), Array.from({ length: Math.min(right, Math.max(0, 24 - offset - left)) }, (_, n) => offset + left + n)];
}
export function comparisonCovered(query, hits, aliases = DEFAULT_ALIASES) {
  const groups = comparisonGroups(query, aliases); const covered = new Set(hits.flatMap(hit => hit.matched || []));
  return !groups.length || groups.every(group => group.length > 0 && group.every(position => covered.has(position)));
}
export function diverseSearchHits(hits, limit, compatible = () => true) {
  const remaining = [...hits]; const selected = []; const covered = new Set();
  while (remaining.length && selected.length < limit) {
    let best = -1; let bestScore = -Infinity;
    remaining.forEach((hit, index) => {
      if (!compatible(hit, selected)) return;
      const score = (hit.matched || []).filter(position => !covered.has(position)).length * 1000 + hit.score;
      if (score > bestScore) { best = index; bestScore = score; }
    });
    if (best < 0) break;
    const [hit] = remaining.splice(best, 1); selected.push(hit); (hit.matched || []).forEach(position => covered.add(position));
  }
  return selected;
}
