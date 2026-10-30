# Space Apps fire risk MVP

A hackathon-sized demo for the talk *Desarrollo Competitivo* (NASA Space Apps Challenge) by Emanuel Guzman.

**Live demo:** https://emanuel250.dev.ar/space-apps-fire-risk/

It applies the talk's advice in a few hundred lines:

- **One flow:** pick a place, see its fire risk for the latest day in one click.
- **NASA data prepared ahead of time:** `npm run data` downloads [NASA POWER](https://power.larc.nasa.gov/) daily
  data once into `data/nasa-power.json`. The app only reads that file, so the demo works without NASA's API or wifi.
- **The JSON contract first:** `src/shared/contract.ts` is shared by the server and the web app.
- **Deployable as one process:** `npm run build && npm start`.

The index is **illustrative, not an official fire danger rating**: the latest day's maximum temperature, relative
humidity, wind and the last 7 days of rain add up to 2 points each (`src/domain/risk.ts`). POWER publishes with a few
days' delay, so the latest day is usually 2–3 days old; the card says which day it describes.

The preset places are in Salta, Argentina (`src/shared/places.ts`).

## Commands

```bash
npm install
npm run data        # refresh the NASA POWER cache (no API key needed)
npm run dev         # web app + API on http://localhost:5173
npm test            # unit tests for the risk rules
npm run typecheck
npm run build       # web app into dist/
npm start           # production server (API + dist/) on http://localhost:8787, or $PORT
npm run build:pages # static build for GitHub Pages (see below)
```

## GitHub Pages

Pages only serves files, so `npm run build:pages` also writes every API answer into `dist/api/` as JSON
(`places.json` and `risk/<id>.json`), built from the same code as the server. With `VITE_STATIC_API=true` the web app
reads those files instead of calling the server; `BASE_PATH` sets the `/<repo>/` prefix Pages serves the site under.

`.github/workflows/pages.yml` runs the type-check and tests, builds and deploys on every push to `main`. It uses the
committed `data/nasa-power.json`: to refresh the demo, run `npm run data` and push.

## Layout

| Path | What |
| --- | --- |
| `scripts/fetch-nasa-data.ts` | Downloads NASA POWER data for every place into `data/nasa-power.json` |
| `src/shared/` | The API contract, the cache's shape and the preset places |
| `src/domain/risk.ts` | The risk rules: pure, unit-tested |
| `scripts/build-static-api.ts` | Writes the API answers as JSON files for the GitHub Pages build |
| `src/server/risk-service.ts` | Reads the cache and builds the risk answer for a place |
| `src/server/api.ts` | `GET /api/places` and `GET /api/risk?place=<id>`, read from the cache |
| `src/server/main.ts` | Production server: the API plus the built web app |
| `src/web/` | React app: the place picker and the risk card |

In development, `vite.config.ts` mounts the same API handler inside Vite's dev server, so there is one process and one
port. Imports use the `@/` alias (`src/`), resolved by Vite, Vitest and `tsx` from `tsconfig.json`.

## Credits

Weather data: NASA Langley Research Center (LaRC) POWER Project, funded through the NASA Earth Science Directorate
Applied Science Program. Font: Open Sauce One (SIL OFL 1.1).
