const TRACE_DATA = Object.freeze({ two: Object.freeze([2, 3]), empty: Object.freeze([]), zero: Object.freeze([0]) });

// Nur das feste, redaktionelle Beispiel modellieren. Kein Editorcode, eval,
// Function, Gastobjekt oder zusätzlicher Zugriff auf Browser-/App-Schnittstellen.
export function guidedSumTrace(corrected = false, example = 'two') {
  if (typeof corrected !== 'boolean' || !Object.hasOwn(TRACE_DATA, example)) throw new Error('Unbekanntes Spurbeispiel.');
  const list = TRACE_DATA[example];
  const source = [
    'function summe(liste) {',
    '  let total = 0;',
    `  for (let i = 0; i ${corrected ? '<' : '<='} liste.length; i++) {`,
    '    total += liste[i];',
    '  }',
    '  return total;',
    '}',
    `console.log(summe(${JSON.stringify(list)}));`,
  ];
  const frames = [];
  const format = value => String(value);
  const scope = (total, i, loop = false, initialized = true) => [
    { name: 'liste', value: JSON.stringify(list), type: 'Array' },
    { name: 'liste.length', value: String(list.length), type: 'number' },
    { name: 'total', value: initialized ? format(total) : 'noch nicht initialisiert', type: initialized ? 'number' : '—' },
    ...(loop ? [{ name: 'i', value: String(i), type: 'number' }, { name: 'liste[i]', value: format(list[i]), type: typeof list[i] }] : []),
  ];
  const push = (line, message, variables, inside = true, output = null) => frames.push({ line, message, variables, stack: inside ? ['summe(liste)', '<global>'] : ['<global>'], output });
  push(8, 'Vor dem Funktionsaufruf. Mit einem Schritt betrittst du im Modell summe.', [], false);
  push(2, 'Vor let total = 0. Der Parameter ist vorhanden; total wird erst jetzt initialisiert.', scope(undefined, 0, false, false));
  let total = 0;
  push(3, 'Vor der Schleifeninitialisierung. total ist 0; i wird gleich mit 0 angelegt.', scope(total));
  for (let i = 0; i <= list.length + 1; i++) {
    const enters = corrected ? i < list.length : i <= list.length;
    push(3, `Bedingung mit i = ${i}: ${enters ? 'wahr, der Schleifenkörper folgt' : 'falsch, die Schleife endet'}.`, scope(total, i, true));
    if (!enters) break;
    push(4, `Vor der Addition: total = ${format(total)}, liste[i] = ${format(list[i])}.`, scope(total, i, true));
    total += list[i];
    push(3, `Die Addition ist ausgeführt: total = ${format(total)}. Als Nächstes erhöht i++ den Index.`, scope(total, i, true));
  }
  push(6, 'Vor return. Der Schleifenblock ist verlassen; sein let i gehört nicht mehr zum sichtbaren lokalen Scope.', scope(total));
  push(8, `summe hat ${format(total)} zurückgegeben. console.log gibt den Wert gleich aus.`, [], false);
  push(null, 'Das feste Beispiel ist beendet.', [], false, format(total));
  return { source, frames };
}
