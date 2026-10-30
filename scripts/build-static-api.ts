import { mkdir, writeFile } from 'node:fs/promises';
import { buildRiskResponse, DATASET_FILE, readDataset } from '@/server/risk-service';
import type { PlacesResponse } from '@/shared/contract';
import { PLACES } from '@/shared/places';

/*
 * GitHub Pages only serves files, so this writes every API answer into dist/
 * as JSON: api/places.json and api/risk/<id>.json. The web app reads them when
 * it is built with VITE_STATIC_API=true. Run it after `vite build`.
 */

const OUTPUT_DIR = 'dist/api';

const dataset = readDataset();
if (!dataset) throw new Error(`No cached NASA data in ${DATASET_FILE}: run \`npm run data\``);

await mkdir(`${OUTPUT_DIR}/risk`, { recursive: true });
const places: PlacesResponse = { places: PLACES };
await writeFile(`${OUTPUT_DIR}/places.json`, JSON.stringify(places));

for (const place of PLACES) {
  const risk = buildRiskResponse(dataset, place);
  if (!risk) throw new Error(`No cached days for ${place.id}: run \`npm run data\``);
  await writeFile(`${OUTPUT_DIR}/risk/${place.id}.json`, JSON.stringify(risk));
}

console.log(`Wrote the static API for ${PLACES.length} places into ${OUTPUT_DIR}/`);
