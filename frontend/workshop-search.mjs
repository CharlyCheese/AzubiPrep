import { LESSONS } from './src/pilot/course.js';

// Only published lesson text belongs in the catalog. Projects and saved drafts live separately.
export const workshopSearchMetadata = LESSONS.map(({ id, chapter, title, task, prerequisite, goal, explain }) => ({
  id, chapter, title, task,
  theory: [prerequisite, goal, ...[explain].flat()].filter(Boolean).join(' '),
}));
