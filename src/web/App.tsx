import { useEffect, useState } from 'react';
import type { Place, RiskResponse } from '@/shared/contract';
import { fetchPlaces, fetchRisk } from '@/web/api';
import { RiskCard } from '@/web/RiskCard';

const REPO_URL = 'https://github.com/Emanuel250YT/space-apps-fire-risk';

export function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaces().then(setPlaces, () => setError('No pudimos cargar los lugares.'));
  }, []);

  useEffect(() => {
    if (!placeId) return;
    // A slow answer for a place that is no longer selected must not overwrite the current one.
    let current = true;
    fetchRisk(placeId).then(
      (result) => {
        if (current) {
          setRisk(result);
          setError(null);
        }
      },
      () => {
        if (current) setError('No pudimos calcular el riesgo para ese lugar.');
      },
    );
    return () => {
      current = false;
    };
  }, [placeId]);

  return (
    <main className="page">
      <header>
        <p className="eyebrow">
          <span className="dot" aria-hidden="true" />
          NASA Space Apps Challenge · Demo
        </p>
        <h1>
          Riesgo de incendio <mark>en 10 segundos</mark>
        </h1>
        <p className="lead">Elegí un lugar de Salta y mirá su riesgo con el último día publicado por NASA POWER.</p>
      </header>

      <section aria-labelledby="places-title">
        <h2 id="places-title" className="label">
          Lugar
        </h2>
        <div className="places">
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              className="place"
              aria-pressed={place.id === placeId}
              onClick={() => setPlaceId(place.id)}
            >
              {place.name}
            </button>
          ))}
        </div>
      </section>

      <div aria-live="polite">
        {error ? (
          <p className="error">{error}</p>
        ) : risk ? (
          <RiskCard risk={risk} />
        ) : (
          <p className="hint">Elegí un lugar para ver su riesgo.</p>
        )}
      </div>

      <footer className="footer">
        Emanuel Guzman · <a href={REPO_URL}>Código en GitHub</a>
      </footer>
    </main>
  );
}
