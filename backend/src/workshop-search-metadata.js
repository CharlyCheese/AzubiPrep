import { readFile } from 'node:fs/promises';
import path from 'node:path';

const catalogs = new Map();

async function readCatalog(file, loadSource) {
  try {
    const json = await readFile(file, 'utf8');
    return JSON.parse(json);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // A source checkout also supports starting the backend before the first frontend build.
    return loadSource();
  }
}

function loadCatalog(file, loadSource) {
  if (!catalogs.has(file)) {
    catalogs.set(file, readCatalog(file, loadSource).catch(error => {
      catalogs.delete(file);
      throw error;
    }));
  }
  return catalogs.get(file);
}

export function loadWorkshopSearchMetadata(frontendDist) {
  return loadCatalog(path.join(frontendDist, 'workshop-search.json'), async () =>
    (await import('../../frontend/workshop-search.mjs')).workshopSearchMetadata);
}

export function loadJourneyPracticeSearchMetadata(frontendDist) {
  return loadCatalog(path.join(frontendDist, 'journey-practice-search.json'), async () =>
    (await import('../../frontend/journey-practice-search.mjs')).journeyPracticeSearchMetadata);
}
