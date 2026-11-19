// Feste Veröffentlichungsverträge für die drei FIAE-Lernfelder.
const fields = [
  ['LF10a', 'FIAE-UX', [
    ["process", ["model", "needs", "improve"], ["common-lf1-value-chain", "common-lf8-delivery", "common-lf9-handover"]],
    ["prototype", ["flow", "prototype"], ["fiae-lf10a-process"]],
    ["layout", ["structure", "implement"], ["fiae-lf10a-prototype", "common-lf5-objects"]],
    ["forms", ["access", "validation", "privacy"], ["fiae-lf10a-layout", "common-lf4-privacy"]],
    ["usability", ["tasks", "evaluate"], ["fiae-lf10a-forms", "common-lf5-testing"]],
    ["value", ["costs", "balance"], ["fiae-lf10a-usability", "common-lf2-procurement"]],
  ]],
  ['LF11a', 'FIAE-PRG', [
    ["model", ["derive", "model"], ["fiae-lf10a-value", "common-lf5-objects"]],
    ["architecture", ["responsibilities", "interfaces", "method"], ["fiae-lf11a-model"]],
    ["algorithms", ["structure", "algorithm", "compare"], ["fiae-lf11a-architecture", "common-lf5-functions"]],
    ["data-access", ["implement", "interface", "atomic"], ["fiae-lf11a-algorithms", "common-lf8-integrity"]],
    ["security", ["validation", "authorization", "errors"], ["fiae-lf11a-data-access", "common-lf9-security"]],
    ["testing", ["unit", "integration", "evidence"], ["fiae-lf11a-security", "common-lf5-testing"]],
    ["versions", ["version", "review", "iteration"], ["fiae-lf11a-testing", "common-lf8-interfaces"]],
  ]],
  ['LF12a', 'FIAE-PRO', [
    ["scope", ["clarify", "criteria", "constraints"], ["fiae-lf11a-versions", "common-lf1-presentation"]],
    ["alternatives", ["compare", "cost", "agreement"], ["fiae-lf12a-scope", "common-lf2-procurement", "common-lf4-assessment"]],
    ["planning", ["schedule", "resources", "risk"], ["fiae-lf12a-alternatives"]],
    ["implementation", ["track", "change", "quality"], ["fiae-lf12a-planning"]],
    ["acceptance", ["evidence", "present", "protocol"], ["fiae-lf12a-implementation"]],
    ["training", ["guide", "handover", "support"], ["fiae-lf12a-acceptance"]],
    ["review", ["compare", "quality", "learn"], ["fiae-lf12a-training", "fiae-lf10a-value"]],
  ]],
];
export const specializationTopics = fields.flatMap(([fieldId, csvModuleId, topics]) =>
  topics.map(([suffix, goals, prerequisites]) => {
    const id = `fiae-${fieldId.toLowerCase()}-${suffix}`;
    return {
      id, fieldId, scope: 'specialization', csvFieldId: fieldId, csvModuleId,
      topicFile: `topics/${id}.v1.json`, questionFile: `questions/${id}.v1.csv`,
      prerequisites, objectiveIds: goals.map(goal => `${id}-${goal}`),
      questionPrefix: `LJ-${fieldId.toUpperCase()}-${suffix.toUpperCase()}`,
    };
  })
);

export const specializationStages = fields.map(([fieldId]) => [
  fieldId, specializationTopics.filter(topic => topic.fieldId === fieldId).map(topic => topic.id),
]);
