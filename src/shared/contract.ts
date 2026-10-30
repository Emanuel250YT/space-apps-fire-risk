/**
 * The API contract, agreed before writing either side: the server returns
 * exactly these shapes and the web app reads nothing else.
 */

export interface Place {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface RiskFactors {
  maxTemperatureC: number;
  humidityPercent: number;
  rainLast7DaysMm: number;
  windSpeedMs: number;
}

/** Points (0–2) each factor adds to the score. */
export interface RiskPoints {
  temperature: number;
  humidity: number;
  rain: number;
  wind: number;
}

/** `GET /api/places` */
export interface PlacesResponse {
  places: Place[];
}

/** `GET /api/risk?place=<id>` */
export interface RiskResponse {
  place: Place;
  level: RiskLevel;
  score: number;
  maxScore: number;
  /** The day the factors describe, `YYYY-MM-DD`. */
  date: string;
  factors: RiskFactors;
  points: RiskPoints;
  source: {
    name: string;
    url: string;
    fetchedAt: string;
  };
}

/** The body of any non-2xx response. */
export interface ErrorResponse {
  error: string;
}
