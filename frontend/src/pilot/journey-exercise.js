// Feste öffentliche Testfälle. Nur die vorhandene QuickJS-Laufzeit führt Code aus.
export const JOURNEY_CODE_ID = 'journey-lf5-available';
export const JOURNEY_CODE_CASES = [
  [8, 3, true], [2, 5, false], [4, 4, true], [0, 0, true], [1000, 1000, true],
  [0, 1, false], [-1, 1, null], [3, 1.5, null], ['3', 1, null], [1001, 1, null],
  [3, -1, null], [3, 1001, null], [1.5, 1, null], [3, '1', null], [null, 1, null],
  [3, null, null], [true, 1, null], [3, false, null],
].map(([quantity, requested, expected]) => ({ quantity, requested, expected }));
export const JOURNEY_EXERCISES = {
  [JOURNEY_CODE_ID]: { inputs: JOURNEY_CODE_CASES, probe: 'typeof available === "function" && available(input.quantity, input.requested) === input.expected' },
  'journey-lf7-control': { inputs: [
    [-20, true, 'off'], [20, true, 'off'], [29.9, true, 'off'], [30, true, 'on'], [35, true, 'on'], [80, true, 'on'],
    [-20.1, true, 'fault'], [80.1, true, 'fault'], [35, false, 'fault'], [20, false, 'fault'],
    ['35', true, 'fault'], [null, true, 'fault'], [true, true, 'fault'], [35, 'true', 'fault'], [35, 1, 'fault'],
  ].map(([temperature, connected, expected]) => ({ temperature, connected, expected })),
  probe: 'typeof control === "function" && control(input.temperature, input.connected) === input.expected && control(NaN, true) === "fault" && control(Infinity, true) === "fault" && control(-Infinity, true) === "fault" && control(undefined, true) === "fault" && control(20, true) === "off"' },
};
export const CONTROL_CASES = JOURNEY_EXERCISES['journey-lf7-control'].inputs;
