/** One day of NASA POWER data for a place, with fill values already dropped. */
export interface DailyWeather {
  /** `YYYY-MM-DD` */
  date: string;
  maxTemperatureC: number;
  humidityPercent: number;
  precipitationMm: number;
  windSpeedMs: number;
}

/** The cache that `npm run data` writes and the server reads: `data/nasa-power.json`. */
export interface NasaDataset {
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  /** Daily weather by place id. */
  places: Record<string, DailyWeather[]>;
}
