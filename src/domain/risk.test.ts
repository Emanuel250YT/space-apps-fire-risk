import { describe, expect, it } from 'vitest';
import { assessRisk } from '@/domain/risk';
import type { DailyWeather } from '@/shared/dataset';

const day = (date: string, weather: Partial<DailyWeather> = {}): DailyWeather => ({
  date,
  maxTemperatureC: 20,
  humidityPercent: 70,
  precipitationMm: 5,
  windSpeedMs: 1,
  ...weather,
});

describe('assessRisk', () => {
  it('rates a hot, dry, windy week as high', () => {
    const week = ['01', '02', '03', '04', '05', '06', '07'].map((d) =>
      day(`2026-10-${d}`, { maxTemperatureC: 34, humidityPercent: 18, precipitationMm: 0, windSpeedMs: 7 }),
    );

    expect(assessRisk(week)).toMatchObject({ level: 'high', score: 8, maxScore: 8 });
  });

  it('rates a cool, humid, rainy day as low', () => {
    expect(assessRisk([day('2026-10-01', { precipitationMm: 30 })])).toMatchObject({ level: 'low', score: 0 });
  });

  it('describes the latest day, whatever the input order', () => {
    const result = assessRisk([day('2026-10-09', { maxTemperatureC: 31 }), day('2026-10-02')]);

    expect(result.date).toBe('2026-10-09');
    expect(result.points.temperature).toBe(2);
  });

  it('only counts the last 7 days of rain', () => {
    const days = [
      day('2026-10-01', { precipitationMm: 40 }),
      ...['02', '03', '04', '05', '06', '07', '08'].map((d) => day(`2026-10-${d}`, { precipitationMm: 0 })),
    ];

    expect(assessRisk(days).factors.rainLast7DaysMm).toBe(0);
  });

  it('refuses an empty history', () => {
    expect(() => assessRisk([])).toThrow();
  });
});
