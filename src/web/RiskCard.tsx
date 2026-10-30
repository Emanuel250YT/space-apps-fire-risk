import type { RiskLevel, RiskResponse } from '@/shared/contract';

const LEVEL_LABELS: Record<RiskLevel, string> = { low: 'Riesgo bajo', moderate: 'Riesgo moderado', high: 'Riesgo alto' };

const decimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
// Dates are UTC calendar days (`YYYY-MM-DD` parses as UTC midnight), so format them in UTC too.
const dayFormat = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' });

export function RiskCard({ risk }: { risk: RiskResponse }) {
  const { factors, points } = risk;
  const rows = [
    { label: 'Temperatura máxima', value: `${decimal.format(factors.maxTemperatureC)} °C`, points: points.temperature },
    { label: 'Humedad relativa', value: `${decimal.format(factors.humidityPercent)} %`, points: points.humidity },
    { label: 'Lluvia, últimos 7 días', value: `${decimal.format(factors.rainLast7DaysMm)} mm`, points: points.rain },
    { label: 'Viento', value: `${decimal.format(factors.windSpeedMs)} m/s`, points: points.wind },
  ];

  return (
    <article className="card">
      <header className="card-header">
        <div>
          <p className="muted">
            {risk.place.region} · Datos del {dayFormat.format(new Date(risk.date))}
          </p>
          <h2>{risk.place.name}</h2>
        </div>
        <p className={`level level-${risk.level}`}>{LEVEL_LABELS[risk.level]}</p>
      </header>

      <p className="score">
        <strong>{risk.score}</strong> de {risk.maxScore} puntos
      </p>

      <ul className="factors" role="list">
        {rows.map((row) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <span className={row.points > 0 ? 'points points-on' : 'points'}>+{row.points}</span>
          </li>
        ))}
      </ul>

      <p className="source">
        Fuente:{' '}
        <a href={risk.source.url} target="_blank" rel="noreferrer">
          {risk.source.name}
        </a>
        , que publica con unos días de demora; descargado el {dayFormat.format(new Date(risk.source.fetchedAt))}. Índice
        ilustrativo para la demo: no es un índice oficial de peligro de incendio.
      </p>
    </article>
  );
}
