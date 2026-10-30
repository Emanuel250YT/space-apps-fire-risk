import { readFileSync } from 'node:fs';
import { assessRisk } from '@/domain/risk';
import type { Place, RiskResponse } from '@/shared/contract';
import type { NasaDataset } from '@/shared/dataset';

/** Written by `npm run data`. Nothing here ever calls NASA live. */
export const DATASET_FILE = 'data/nasa-power.json';

export function readDataset(): NasaDataset | null {
  try {
    return JSON.parse(readFileSync(DATASET_FILE, 'utf8')) as NasaDataset;
  } catch {
    return null;
  }
}

/**
 * The `/api/risk` answer for one place, or null when the cache has no days for it.
 * Shared by the API server and the static GitHub Pages build, so both serve the same contract.
 */
export function buildRiskResponse(dataset: NasaDataset, place: Place): RiskResponse | null {
  const days = dataset.places[place.id];
  if (!days?.length) return null;

  return {
    place,
    ...assessRisk(days),
    source: { name: dataset.source, url: dataset.sourceUrl, fetchedAt: dataset.fetchedAt },
  };
}
