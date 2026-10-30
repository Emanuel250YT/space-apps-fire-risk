import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildRiskResponse, readDataset } from '@/server/risk-service';
import type { ErrorResponse, PlacesResponse, RiskResponse } from '@/shared/contract';
import { PLACES } from '@/shared/places';

function sendJson(res: ServerResponse, status: number, body: PlacesResponse | RiskResponse | ErrorResponse): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function sendRisk(res: ServerResponse, placeId: string | null): void {
  const place = PLACES.find((candidate) => candidate.id === placeId);
  if (!place) return sendJson(res, 404, { error: `Unknown place: ${placeId ?? '(none)'}` });

  const dataset = readDataset();
  const risk = dataset && buildRiskResponse(dataset, place);
  if (!risk) return sendJson(res, 503, { error: 'No cached NASA data: run `npm run data`' });

  sendJson(res, 200, risk);
}

/** Answers `/api/*`; returns false for anything else so the caller can serve the web app. */
export function handleApi(req: IncomingMessage, res: ServerResponse): boolean {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return false;

  if (req.method !== 'GET') sendJson(res, 405, { error: 'Only GET is supported' });
  else if (url.pathname === '/api/places') sendJson(res, 200, { places: PLACES });
  else if (url.pathname === '/api/risk') sendRisk(res, url.searchParams.get('place'));
  else sendJson(res, 404, { error: `No route for ${url.pathname}` });
  return true;
}
