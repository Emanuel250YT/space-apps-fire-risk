import type { RiskFactors, RiskLevel, RiskPoints } from '@/shared/contract';
import type { DailyWeather } from '@/shared/dataset';

/** Days of rain summed into the dryness factor. */
const RAIN_WINDOW_DAYS = 7;

/** Four factors, up to 2 points each. */
export const MAX_SCORE = 8;

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  maxScore: number;
  date: string;
  factors: RiskFactors;
  points: RiskPoints;
}

/**
 * An illustrative fire-risk index for the demo, not an official one (such as
 * the Canadian FWI): a hot, dry, rainless and windy latest day adds points.
 */
export function assessRisk(days: DailyWeather[]): RiskAssessment {
  if (days.length === 0) throw new Error('assessRisk needs at least one day of data');

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const rain = sorted.slice(-RAIN_WINDOW_DAYS).reduce((total, day) => total + day.precipitationMm, 0);

  const factors: RiskFactors = {
    maxTemperatureC: latest.maxTemperatureC,
    humidityPercent: latest.humidityPercent,
    rainLast7DaysMm: Math.round(rain * 10) / 10,
    windSpeedMs: latest.windSpeedMs,
  };
  const points: RiskPoints = {
    temperature: pointsFromAbove(factors.maxTemperatureC, 25, 30),
    humidity: pointsFromBelow(factors.humidityPercent, 50, 30),
    rain: pointsFromBelow(rain, 10, 2),
    wind: pointsFromAbove(factors.windSpeedMs, 3, 6),
  };
  const score = points.temperature + points.humidity + points.rain + points.wind;

  return { level: levelFor(score), score, maxScore: MAX_SCORE, date: latest.date, factors, points };
}

/** 1 point from `one` up, 2 from `two` up. */
function pointsFromAbove(value: number, one: number, two: number): number {
  return value >= two ? 2 : value >= one ? 1 : 0;
}

/** 1 point from `one` down, 2 from `two` down. */
function pointsFromBelow(value: number, one: number, two: number): number {
  return value <= two ? 2 : value <= one ? 1 : 0;
}

function levelFor(score: number): RiskLevel {
  return score >= 5 ? 'high' : score >= 3 ? 'moderate' : 'low';
}
