// Begrenzte Rechengrammatik: Daten werden niemals als JavaScript ausgeführt.
export const MAX_CELL_LENGTH = 160;
const MAX_VALUE = 1e12;
const fail = message => { throw new Error(message); };
const bounded = value => {
  if (!Number.isFinite(value) || Math.abs(value) > MAX_VALUE) fail('Das Ergebnis ist zu groß oder nicht berechenbar.');
  return Object.is(value, -0) ? 0 : value;
};
// Exakte rationale Zwischenwerte verhindern binäre Halb-Cent-Fehler.
// Größenbegrenzung auch für Zähler/Nenner, damit Formeln endlich bleiben.
function fraction(n, d = 1n) {
  if (d === 0n) fail('Durch null kann nicht geteilt werden. Prüfe die Bezugsgröße.');
  if (d < 0n) { n = -n; d = -d; }
  let a = n < 0n ? -n : n; let b = d;
  while (b) { const rest = a % b; a = b; b = rest; }
  n /= a; d /= a;
  if ((n < 0n ? -n : n) > BigInt(MAX_VALUE) * d) fail('Das Ergebnis ist zu groß oder nicht berechenbar.');
  if (n.toString(2).length > 900 || d.toString(2).length > 900) fail('Die Formel ist rechnerisch zu groß. Vereinfache den Rechenweg.');
  return { n, d };
}
function decimal(text) {
  const [whole, tail = ''] = text.replace(',', '.').split('.');
  return fraction(BigInt((whole || '0') + tail), 10n ** BigInt(tail.length));
}
const asNumber = value => bounded(Number(value.n) / Number(value.d));
function operation(op, left, right) {
  if (op === '+') return fraction(left.n * right.d + right.n * left.d, left.d * right.d);
  if (op === '-') return fraction(left.n * right.d - right.n * left.d, left.d * right.d);
  if (op === '*') return fraction(left.n * right.n, left.d * right.d);
  return fraction(left.n * right.d, left.d * right.n);
}
function rounded(value, digits) {
  const scale = 10n ** BigInt(digits);
  const numerator = (value.n < 0n ? -value.n : value.n) * scale;
  const integer = numerator / value.d + (numerator % value.d * 2n >= value.d ? 1n : 0n);
  return fraction((value.n < 0n ? -1n : 1n) * integer, scale);
}

function parse(expression, resolve) {
  if (typeof expression !== 'string' || expression.length > MAX_CELL_LENGTH) fail('Eine Eingabe darf höchstens 160 Zeichen enthalten.');
  let source = expression.trim().toUpperCase();
  if (!source) fail('Hier fehlt noch eine Zahl oder Formel.');
  const formula = source.startsWith('=');
  if (formula) source = source.slice(1);
  if (!formula && !/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(source)) fail('Beginne eine Formel mit =. Zahlen bitte ohne Tausendertrennzeichen eingeben.');
  const tokens = [];
  const pattern = /\s*(\d+(?:[.,]\d+)?|[.,]\d+|[A-Z]+\d*|[+\-*/();:])/y;
  let offset = 0;
  while (offset < source.length) {
    if (!source.slice(offset).trim()) break;
    pattern.lastIndex = offset;
    const match = pattern.exec(source);
    if (!match) fail('Dieses Zeichen gehört nicht zu einer unterstützten Formel.');
    tokens.push(match[1]); offset = pattern.lastIndex;
  }
  let cursor = 0; let depth = 0;
  const peek = () => tokens[cursor];
  const take = expected => { if (tokens[cursor++] !== expected) fail(`In der Formel fehlt „${expected}“.`); };
  const primary = () => {
    if (++depth > 24) fail('Die Formel ist zu stark verschachtelt.');
    try {
      const token = tokens[cursor++];
      if (token === '+' || token === '-') { const value = primary(); return fraction(token === '-' ? -value.n : value.n, value.d); }
      if (token === '(') { const value = sum(); take(')'); return value; }
      if (/^(?:\d|[.,])/.test(token || '')) return decimal(token);
      if (/^B\d{1,2}$/.test(token || '')) return resolve(token);
      if (['SUMME', 'SUM', 'RUNDEN', 'ROUND'].includes(token)) {
        take('('); const args = [];
        do {
          if (args.length) take(';');
          if (['SUMME', 'SUM'].includes(token) && /^B\d{1,2}$/.test(peek() || '') && tokens[cursor + 1] === ':') {
            const start = Number(tokens[cursor++].slice(1)); take(':');
            const last = tokens[cursor++];
            if (!/^B\d{1,2}$/.test(last || '')) fail('Ein Bereich benötigt zwei Zelladressen, zum Beispiel B3:B6.');
            const end = Number(last.slice(1));
            if (start < 1 || end < start || end > 12) fail('Dieser Zellbereich ist ungültig.');
            for (let row = start; row <= end; row++) args.push(resolve(`B${row}`));
          } else args.push(sum());
        } while (peek() === ';');
        take(')');
        if (['SUMME', 'SUM'].includes(token)) return args.reduce((total, value) => operation('+', total, value), fraction(0n));
        if (args.length !== 2 || args[1].d !== 1n || args[1].n < 0n || args[1].n > 6n) fail('RUNDEN benötigt eine Zahl und 0 bis 6 Nachkommastellen.');
        return rounded(args[0], Number(args[1].n));
      }
      fail(token ? `„${token}“ ist hier keine unterstützte Zahl, Zelle oder Funktion.` : 'Die Formel ist noch unvollständig.');
    } finally { depth--; }
  };
  const product = () => {
    let value = primary();
    while (peek() === '*' || peek() === '/') {
      const op = tokens[cursor++]; const right = primary();
      value = operation(op, value, right);
    }
    return value;
  };
  const sum = () => {
    let value = product();
    while (peek() === '+' || peek() === '-') {
      const op = tokens[cursor++]; const right = product();
      value = operation(op, value, right);
    }
    return value;
  };
  const value = sum();
  if (cursor !== tokens.length) fail('Die Formel enthält einen unerwarteten Zusatz. Funktionsargumente trennst du mit ;.');
  return value;
}

function evaluateInternal(cells, initial = {}) {
  const cache = new Map(Object.entries(initial)); const visiting = new Set();
  if (!cells || typeof cells !== 'object' || Array.isArray(cells) || Object.keys(cells).length > 12) return {};
  const resolve = id => {
    if (!/^B(?:[1-9]|1[0-2])$/.test(id) || !Object.hasOwn(cells, id)) fail(`Zelle ${id} ist in dieser Tabelle nicht vorhanden.`);
    if (cache.has(id)) { const result = cache.get(id); if (result.error) fail(result.error); return result.value; }
    if (visiting.has(id)) fail(`Kreisbezug bei ${id}: Eine Formel verweist auf sich selbst oder ihre Abhängigkeit.`);
    visiting.add(id);
    try { const value = parse(cells[id], resolve); cache.set(id, { value }); return value; }
    catch (error) { cache.set(id, { error: error.message }); throw error; }
    finally { visiting.delete(id); }
  };
  for (const id of Object.keys(cells)) {
    try { resolve(id); } catch (error) { cache.set(id, { error: error.message }); }
  }
  return Object.fromEntries(cache);
}

export function evaluateCells(cells) {
  return Object.fromEntries(Object.entries(evaluateInternal(cells)).map(([id, result]) => [id, result.error ? result : { value: asNumber(result.value) }]));
}

export function calculateExpression(expression, cells = {}) {
  if (typeof expression !== 'string') return { error: 'Gib eine Rechnung als Text ein.' };
  const values = evaluateInternal(cells);
  try {
    return { value: asNumber(parse(expression.trim().startsWith('=') ? expression : `=${expression}`, id => {
      if (!Object.hasOwn(values, id)) fail(`Zelle ${id} ist nicht vorhanden.`);
      if (values[id].error) fail(values[id].error);
      return values[id].value;
    })) };
  } catch (error) { return { error: error.message }; }
}

const row = (label, unit, initial = '', formula = '') => ({ label, unit, initial, formula });
const SHEETS = {
  'common-pm-costs': {
    title: 'Projektkosten berechnen',
    task: 'Berechne die direkten Personalkosten, den Gemeinkostenzuschlag darauf und die gesamten Selbstkosten. Runde berechnete Geldbeträge auf Cent. Der Stundensatz enthält hier noch keine Gemeinkosten.',
    rows: [row('Aufwand', 'h', '80'), row('Direkter Personalkostensatz', '€/h', '35'), row('Fremdkosten', '€', '400'), row('Gemeinkostenzuschlag auf Personalkosten', '%', '20'), row('Personalkosten', '€', '', '=RUNDEN(B1*B2;2)'), row('Gemeinkosten', '€', '', '=RUNDEN(B5*B4/100;2)'), row('Selbstkosten gesamt', '€', '', '=RUNDEN(SUMME(B3;B5:B6);2)')],
    inputs: 4,
  },
  'common-pm-pricing': {
    title: 'Verkaufspreis und Gewinn berechnen',
    task: 'Leite aus Selbstkosten und Gewinnaufschlag den Nettoverkaufspreis ab. Berechne dann Gewinnmarge, vorgegebene Umsatzsteuer und Bruttopreis. Die Umsatzsteuer gehört im Modell nicht zum Gewinn.',
    rows: [row('Selbstkosten', '€', '3760'), row('Gewinnaufschlag auf Selbstkosten', '%', '25'), row('Vorgegebener Umsatzsteuersatz', '%', '19'), row('Kalkulierter Gewinn', '€', '', '=RUNDEN(B1*B2/100;2)'), row('Nettoverkaufspreis', '€', '', '=RUNDEN(SUMME(B1;B4);2)'), row('Gewinnmarge am Nettoverkaufspreis', '%', '', '=B4/B5*100'), row('Umsatzsteuer', '€', '', '=RUNDEN(B5*B3/100;2)'), row('Bruttoverkaufspreis', '€', '', '=RUNDEN(SUMME(B5;B7);2)')],
    inputs: 3,
  },
  'common-pm-feasibility': {
    title: 'Gewinnschwelle und Amortisation berechnen',
    task: 'Berechne Stückdeckungsbeitrag, rechnerische Gewinnschwelle, Periodenergebnis und einfache Amortisationszeit. Bei unteilbaren Leistungen muss eine gebrochene Gewinnschwelle zur nächsten ganzen Menge aufgerundet werden. Das Modell berücksichtigt keine Zinsen und unterstellt gleichmäßige jährliche Netto-Rückflüsse.',
    rows: [row('Fixkosten der Periode', '€', '12000'), row('Nettoverkaufspreis je Stück', '€/Stück', '150'), row('Variable Kosten je Stück', '€/Stück', '90'), row('Absatzmenge der Periode', 'Stück', '250'), row('Investition', '€', '6000'), row('Jährlicher Netto-Rückfluss', '€/Jahr', '3000'), row('Stückdeckungsbeitrag', '€/Stück', '', '=RUNDEN(B2-B3;2)'), row('Rechnerische Gewinnschwelle', 'Stück', '', '=B1/B7'), row('Periodenergebnis', '€', '', '=RUNDEN(B4*B7-B1;2)'), row('Einfache Amortisationszeit', 'Jahre', '', '=B5/B6')],
    inputs: 6,
  },
};

export function calculationSheet(topicId) { return Object.hasOwn(SHEETS, topicId) ? SHEETS[topicId] : null; }
export function createCalculation(topicId) {
  const sheet = calculationSheet(topicId);
  return sheet ? { cells: Object.fromEntries(sheet.rows.map((item, i) => [`B${i + 1}`, item.initial])) } : null;
}
export function validCalculation(topicId, value) {
  const template = createCalculation(topicId);
  const plain = item => item && typeof item === 'object' && !Array.isArray(item) && [Object.prototype, null].includes(Object.getPrototypeOf(item));
  return Boolean(template && plain(value) && Object.keys(value).length === 1 && plain(value.cells)
    && Object.keys(value.cells).length === Object.keys(template.cells).length
    && Object.entries(value.cells).every(([id, text]) => Object.hasOwn(template.cells, id) && typeof text === 'string' && text.length <= MAX_CELL_LENGTH));
}

export function checkCalculation(topicId, cells) {
  const sheet = calculationSheet(topicId);
  if (!sheet || !validCalculation(topicId, { cells })) return { passed: false, error: 'Diese Tabelle gehört nicht zum Thema.' };
  const internal = evaluateInternal(cells); const inputs = {};
  try {
    for (let index = 1; index <= sheet.inputs; index++) {
      const id = `B${index}`;
      if (internal[id]?.error) fail(`${id}: ${internal[id].error}`);
      inputs[id] = internal[id];
      const value = asNumber(inputs[id].value);
      if (value < 0) fail(`${id}: Das vorgegebene Modell erwartet eine nicht negative Eingabe.`);
      if (sheet.rows[index - 1].unit === '%' && value > 1000) fail(`${id}: Bitte verwende einen nachvollziehbaren Prozentsatz bis 1000.`);
    }
    if (topicId === 'common-pm-feasibility') {
      if (rounded(operation('-', inputs.B2.value, inputs.B3.value), 2).n <= 0n) fail('Bei einem Stückdeckungsbeitrag von null oder darunter gibt es hier keine endliche Gewinnschwelle.');
      if (inputs.B6.value.n <= 0n) fail('Die einfache Amortisation benötigt einen positiven jährlichen Netto-Rückfluss.');
      if (inputs.B4.value.d !== 1n) fail('Die Absatzmenge muss in diesem Stückmodell ganzzahlig sein.');
    }
    // Nur die Vorgaben übernehmen: fehlerhafte Ergebniszellen dürfen die
    // unabhängige Musterrechnung nicht verändern.
    const modelCells = Object.fromEntries(sheet.rows.map((item, index) => [`B${index + 1}`, item.formula || cells[`B${index + 1}`]]));
    const expected = evaluateInternal(modelCells, inputs);
    if (topicId === 'common-pm-pricing' && expected.B5?.value?.n <= 0n) fail('Die Marge benötigt einen positiven Nettoverkaufspreis.');
    const results = sheet.rows.slice(sheet.inputs).map((_, index) => {
      const id = `B${index + sheet.inputs + 1}`;
      if (expected[id].error) fail(`${id}: ${expected[id].error}`);
      const value = asNumber(expected[id].value);
      const actual = internal[id].error ? internal[id] : { value: asNumber(internal[id].value) };
      const money = sheet.rows[Number(id.slice(1)) - 1].unit.startsWith('€');
      const correct = !actual?.error && Math.abs(actual.value - value) < (money ? 0.0000001 : 0.005000001);
      const error = actual?.error || (!correct && money && Math.abs(actual.value - value) < 0.01
        ? 'Runde den berechneten Geldbetrag mit RUNDEN(...;2) auf Cent. Die Anzeige ist bereits gerundet, der Formelwert noch nicht.' : undefined);
      return { id, correct, expected: value, actual: actual?.value, error };
    });
    const outcome = { passed: results.every(result => result.correct), results };
    if (topicId === 'common-pm-feasibility') {
      const threshold = expected.B8.value;
      outcome.minimumWholeUnits = Number(threshold.n / threshold.d + (threshold.n % threshold.d === 0n ? 0n : 1n));
    }
    return outcome;
  } catch (error) { return { passed: false, error: error.message }; }
}
