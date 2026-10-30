import { mkdir, writeFile } from 'node:fs/promises';
import type { DailyWeather, NasaDataset } from '@/shared/dataset';
import { PLACES } from '@/shared/places';

/*
 * Downloads recent NASA POWER daily data for every place, once, into
 * data/nasa-power.json. The app only reads that file, so the demo never
 * depends on NASA's API (or the venue's wifi) while it runs.
 */

const POWER_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const PARAMETERS = ['T2M_MAX', 'RH2M', 'PRECTOTCORR', 'WS2M'] as const;
/** POWER publishes with a few days' delay: ask for three weeks to keep a full week after dropping missing days. */
const LOOKBACK_DAYS = 21;
/** What POWER returns for a day it has no data for yet. */
const FILL_VALUE = -999;
const OUTPUT_DIR = 'data';
const OUTPUT_FILE = `${OUTPUT_DIR}/nasa-power.json`;

type Parameter = (typeof PARAMETERS)[number];

interface PowerResponse {
  properties: { parameter: Record<Parameter, Record<string, number>> };
}

/** `YYYYMMDD`, the format POWER takes and returns. */
function powerDate(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll('-', '');
}

async function fetchDays(lat: number, lon: number, start: string, end: string): Promise<DailyWeather[]> {
  const url = new URL(POWER_URL);
  url.search = new URLSearchParams({
    parameters: PARAMETERS.join(','),
    community: 'AG',
    latitude: String(lat),
    longitude: String(lon),
    start,
    end,
    format: 'JSON',
  }).toString();

  const response = await fetch(url);
  if (!response.ok) throw new Error(`NASA POWER answered ${response.status} for ${lat},${lon}`);
  const { parameter } = ((await response.json()) as PowerResponse).properties;

  return Object.keys(parameter.T2M_MAX)
    .map((day) => ({
      date: `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`,
      maxTemperatureC: parameter.T2M_MAX[day],
      humidityPercent: parameter.RH2M[day],
      precipitationMm: parameter.PRECTOTCORR[day],
      windSpeedMs: parameter.WS2M[day],
    }))
    .filter((day) =>
      [day.maxTemperatureC, day.humidityPercent, day.precipitationMm, day.windSpeedMs].every(
        (value) => typeof value === 'number' && value !== FILL_VALUE,
      ),
    );
}

const end = new Date();
end.setUTCDate(end.getUTCDate() - 1);
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - LOOKBACK_DAYS);

const places: NasaDataset['places'] = {};
// One place at a time, to be gentle with a free public API.
for (const place of PLACES) {
  const days = await fetchDays(place.lat, place.lon, powerDate(start), powerDate(end));
  if (days.length === 0) throw new Error(`NASA POWER has no complete days for ${place.id} yet`);
  places[place.id] = days;
  console.log(`${place.id}: ${days.length} days, latest ${days[days.length - 1].date}`);
}

const dataset: NasaDataset = {
  source: 'NASA POWER',
  sourceUrl: 'https://power.larc.nasa.gov/',
  fetchedAt: new Date().toISOString(),
  places,
};
await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_FILE, `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`Wrote ${OUTPUT_FILE}`);
