import { CALCULATION_TOPICS, calculationSheet } from './src/utils/journeyCalculation.js';
import { PRACTICE_TOPICS, practiceSteps } from './src/utils/journeyPractices.js';
import { LAB_TOPICS, LAB_STEPS } from './src/utils/journeyLabs.js';
import { NETWORK_TOPIC, NETWORK_CASES, DIAGNOSES } from './src/utils/journeyNetwork.js';
import { WORKPLACE_TOPIC, DEVICES } from './src/utils/journeyWorkplace.js';

function modelMetadata(topicId, label, steps) {
  return [topicId, {
    labels: [label, ...steps.map(step => step.title)],
    passages: steps.flatMap(step => [step.text, ...step.fields.map(field => field.label)]),
  }];
}

// Static exercise labels and instructions. All rows are keyed by the actual
// topic ID so only a model attached to a released journey topic can be found.
export const journeyPracticeSearchMetadata = Object.fromEntries([
  ...CALCULATION_TOPICS.map(topicId => {
    const sheet = calculationSheet(topicId);
    return [topicId, {
      labels: ['Kalkulation und Rechenhilfe', 'Kalkulationstabelle', sheet.title],
      passages: [sheet.task, ...sheet.rows.map(row => row.label)],
    }];
  }),
  ...PRACTICE_TOPICS.map(id => modelMetadata(id, 'Praktische Übung · Praxisprotokoll', practiceSteps(id))),
  ...LAB_TOPICS.map(id => modelMetadata(id, 'Lernlabor', LAB_STEPS[id])),
  [NETWORK_TOPIC, {
    labels: ['Netzwerklabor', 'Clientverbindung im Modell prüfen', 'Netzplan'],
    passages: [...NETWORK_CASES.map(item => item.title), ...Object.values(DIAGNOSES)],
  }],
  [WORKPLACE_TOPIC, {
    labels: ['Einrichtungsübung', 'Büroarbeitsplatz im Modell einrichten', 'Übergabeprotokoll'],
    passages: ['Dateiablage vorbereiten und testen', ...DEVICES.map(item => item.title)],
  }],
]);
