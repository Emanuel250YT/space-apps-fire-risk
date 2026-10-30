import type { ErrorResponse, Place, PlacesResponse, RiskResponse } from '@/shared/contract';

const BASE = import.meta.env.BASE_URL;
/** GitHub Pages has no server: that build reads the API answers as JSON files written by `npm run build:pages`. */
const STATIC_API = import.meta.env.VITE_STATIC_API === 'true';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new Error(body?.error ?? `Request to ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchPlaces(): Promise<Place[]> {
  const path = STATIC_API ? `${BASE}api/places.json` : `${BASE}api/places`;
  return (await getJson<PlacesResponse>(path)).places;
}

export function fetchRisk(placeId: string): Promise<RiskResponse> {
  const id = encodeURIComponent(placeId);
  return getJson<RiskResponse>(STATIC_API ? `${BASE}api/risk/${id}.json` : `${BASE}api/risk?place=${id}`);
}
