import test from 'node:test';
import assert from 'node:assert/strict';
import { calculationSheet, createCalculation, validCalculation, evaluateCells, calculateExpression, checkCalculation, MAX_CELL_LENGTH } from '../../frontend/src/utils/journeyCalculation.js';

const id = suffix => `common-pm-${suffix}`;
function solved(suffix, changes = {}) {
  const sheet = calculationSheet(id(suffix));
  const cells = createCalculation(id(suffix)).cells;
  sheet.rows.forEach((row, i) => { if (row.formula) cells[`B${i + 1}`] = row.formula; });
  return { ...cells, ...changes };
}

test('Kostenfall rechnet mit Zellbezügen, Prozentbezug und Bereichen zu 3760 Euro', () => {
  const cells = solved('costs'); const values = evaluateCells(cells);
  assert.equal(values.B5.value, 2800); assert.equal(values.B6.value, 560); assert.equal(values.B7.value, 3760);
  assert.equal(checkCalculation(id('costs'), cells).passed, true);
  assert.equal(checkCalculation(id('costs'), { ...cells, B5: '2800', B6: '560', B7: '3760' }).passed, true);
});

test('Preisfall trennt Gewinnaufschlag, Marge und Umsatzsteuer', () => {
  const cells = solved('pricing'); const values = evaluateCells(cells);
  for (const [cell, expected] of Object.entries({ B4: 940, B5: 4700, B6: 20, B7: 893, B8: 5593 })) assert.equal(values[cell].value, expected);
  assert.equal(checkCalculation(id('pricing'), cells).passed, true);
  const wrong = checkCalculation(id('pricing'), { ...cells, B6: '=B4/B1*100' });
  assert.equal(wrong.passed, false); assert.equal(wrong.results.find(row => row.id === 'B6').correct, false);
});

test('Wirtschaftlichkeit trennt Deckungsbeitrag, Gewinnschwelle und Netto-Rückfluss', () => {
  const cells = solved('feasibility'); const values = evaluateCells(cells);
  for (const [cell, expected] of Object.entries({ B7: 60, B8: 200, B9: 3000, B10: 2 })) assert.equal(values[cell].value, expected);
  assert.equal(checkCalculation(id('feasibility'), cells).passed, true);
  const changed = { ...cells, B1: '12500' };
  assert.ok(Math.abs(evaluateCells(changed).B8.value - 208.3333333333) < 1e-8);
  assert.equal(checkCalculation(id('feasibility'), changed).passed, true);
  assert.equal(checkCalculation(id('feasibility'), changed).minimumWholeUnits, 209);
  assert.equal(checkCalculation(id('feasibility'), cells).minimumWholeUnits, 200);
  assert.equal(checkCalculation(id('feasibility'), { ...cells, B1: '12000,01' }).minimumWholeUnits, 201);
});

test('Abhängigkeiten werden bei geänderten Vorgaben neu berechnet; alte Handwerte fallen auf', () => {
  const cells = solved('costs', { B1: '100' });
  assert.equal(evaluateCells(cells).B7.value, 4600);
  assert.equal(checkCalculation(id('costs'), cells).passed, true);
  assert.equal(checkCalculation(id('costs'), { ...cells, B7: '3760' }).passed, false);
});

test('Grundrechenarten, Vorzeichen und Klammern besitzen feste Rangfolge', () => {
  for (const [expression, expected] of [['2+3*4', 14], ['(2+3)*4', 20], ['-(-2)+3', 5], ['3/2', 1.5], ['=SUMME(1;2*3;4)', 11]]) {
    assert.equal(calculateExpression(expression).value, expected);
  }
  assert.equal(calculateExpression('B1+B2', { B1: '2', B2: '=B1*3' }).value, 8);
});

test('Dezimalzeichen, Rundung und unterschiedliche gleichwertige Formeln', () => {
  assert.equal(calculateExpression('1,5+2.25').value, 3.75);
  assert.equal(calculateExpression('RUNDEN(1,005;2)').value, 1.01);
  assert.equal(calculateExpression('ROUND(-1.005;2)').value, -1.01);
  assert.equal(calculateExpression('RUNDEN(0,000000001;2)').value, 0);
  assert.equal(calculateExpression('RUNDEN(125;0)').value, 125);
  assert.equal(checkCalculation(id('costs'), solved('costs', { B7: '=(B6+B5)+B3' })).passed, true);
  for (const hours of ['1,005', '3,51', '80', '92,375']) assert.equal(checkCalculation(id('costs'), solved('costs', { B1: hours })).passed, true);
  for (const [suffix, changes] of [['feasibility', { B2: '150,004' }], ['pricing', { B1: '3760,004', B3: '1000' }], ['costs', { B3: '400,009' }]]) {
    assert.equal(checkCalculation(id(suffix), solved(suffix, changes)).passed, true);
  }
  const unrounded = checkCalculation(id('feasibility'), solved('feasibility', { B2: '150,004', B7: '=B2-B3' }));
  assert.equal(unrounded.results.find(row => row.id === 'B7').correct, false);
});

test('Leere Werte, falsche Zellen und Kreisbezüge geben nutzbare Fehler', () => {
  const values = evaluateCells({ B1: '=B2', B2: '=B1', B3: '', B4: '=B12' });
  assert.match(values.B1.error, /Kreisbezug/); assert.match(values.B2.error, /Kreisbezug/);
  assert.match(values.B3.error, /fehlt/); assert.match(values.B4.error, /nicht vorhanden/);
  assert.match(evaluateCells({ B1: '=B1+1' }).B1.error, /Kreisbezug/);
  assert.match(evaluateCells({ B1: '1+2' }).B1.error, /Beginne eine Formel/);
});

test('Halbe Centbeträge werden auch nach Rechenoperationen exakt kaufmännisch gerundet', () => {
  for (const [expression, expected] of [
    ['RUNDEN(1,5*99,99;2)', 149.99], ['RUNDEN(0,15*25,50;2)', 3.83],
    ['RUNDEN(-1,5*99,99;2)', -149.99], ['RUNDEN(1/3*3;2)', 1],
    ['RUNDEN(1,005-0,01;2)', 1], ['0,1+0,2-0,3', 0],
  ]) assert.equal(calculateExpression(expression).value, expected, expression);
  const cells = solved('costs', { B1: '1,5', B2: '99,99', B3: '0', B4: '0' });
  assert.equal(evaluateCells(cells).B5.value, 149.99);
  assert.equal(checkCalculation(id('costs'), cells).passed, true);
  const incorrect = checkCalculation(id('costs'), { ...cells, B5: '149,98', B7: '149,98' });
  assert.equal(incorrect.passed, false);
  assert.equal(incorrect.results[0].expected, 149.99);
  assert.equal(checkCalculation(id('costs'), solved('costs', { B1: '0,15', B2: '25,50' })).results[0].expected, 3.83);
});

test('Modellgrenzen verhindern Scheinerfolge bei negativen Werten oder fehlender Bezugsgröße', () => {
  for (const [suffix, changes, message] of [
    ['costs', { B1: '-2' }, /nicht negative/],
    ['pricing', { B1: '0' }, /positiven Netto/],
    ['feasibility', { B3: '150' }, /keine endliche/],
    ['feasibility', { B3: '160' }, /keine endliche/],
    ['feasibility', { B6: '0' }, /positiven jährlichen/],
    ['feasibility', { B4: '1,5' }, /ganzzahlig/],
  ]) {
    const result = checkCalculation(id(suffix), solved(suffix, changes));
    assert.equal(result.passed, false); assert.match(result.error, message);
  }
  assert.match(calculateExpression('2/0').error, /null/);
});

test('Formeln können keinen Code, Netzwerkzugriff oder externe Zellbezüge ausführen', () => {
  for (const expression of ['globalThis', 'process.exit()', 'fetch("https://example.org")', 'B1.constructor', 'B1["constructor"]', 'while(true){}', '1;alert(1)', 'WEBSERVICE(1)', '[Book]Sheet!B1', 'file:///secret', '=1+2//x', '1e309', 'Infinity', '=SUMME(B0:B12)', '=SUMME(B1:B99999)', '=RUNDEN(2;99)']) {
    assert.ok(calculateExpression(expression).error, expression);
  }
});

test('Ressourcengrenzen, fehlende Klammern und übergroße Ergebnisse werden abgefangen', () => {
  for (const expression of ['1'.repeat(MAX_CELL_LENGTH + 1), '('.repeat(30) + '1' + ')'.repeat(30), '999999999999*999999999999', '=SUMME(1;)', '(1+2', '1+']) assert.ok(calculateExpression(expression).error);
  assert.ok(calculateExpression(null).error);
});

test('Nur drei feste Tabellen besitzen einen strikt begrenzten Speichervertrag', () => {
  assert.equal(createCalculation('common-pm-project'), null);
  assert.equal(calculationSheet('__proto__'), null);
  const value = createCalculation(id('costs'));
  assert.equal(validCalculation(id('costs'), value), true);
  assert.equal(validCalculation(id('pricing'), value), false);
  assert.equal(validCalculation(id('costs'), { ...value, privateMaterial: 'x' }), false);
  assert.equal(validCalculation(id('costs'), { cells: { ...value.cells, B8: '1' } }), false);
  assert.equal(validCalculation(id('costs'), { cells: { ...value.cells, B1: 'x'.repeat(161) } }), false);
  assert.equal(checkCalculation(id('costs'), value.cells).passed, false);
});
