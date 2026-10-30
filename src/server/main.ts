import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { handleApi } from '@/server/api';

/*
 * The production server: one process that answers the API and serves the
 * built web app from dist/, so deploying the MVP is `npm run build && npm start`.
 */

const PORT = Number(process.env.PORT ?? 8787);
const DIST_DIR = resolve('dist');
const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
};

function decodePathname(rawUrl: string): string | null {
  try {
    return decodeURIComponent(new URL(rawUrl, 'http://localhost').pathname);
  } catch {
    // A malformed escape such as "%E0%A4%A" or an unparsable URL such as "//".
    return null;
  }
}

function serveStatic(rawUrl: string, res: ServerResponse): void {
  const pathname = decodePathname(rawUrl);
  if (pathname === null) {
    res.writeHead(400).end();
    return;
  }
  let file = resolve(DIST_DIR, `.${pathname}`);
  // resolve() collapses "..", so anything outside dist/ is a request we refuse.
  if (file !== DIST_DIR && !file.startsWith(DIST_DIR + sep)) {
    res.writeHead(404).end();
    return;
  }
  // Unknown paths get the app itself, which has a single screen.
  if (!existsSync(file) || statSync(file).isDirectory()) file = resolve(DIST_DIR, 'index.html');
  if (!existsSync(file)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No build found: run `npm run build`');
    return;
  }

  res.writeHead(200, { 'Content-Type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file)
    .on('error', () => res.destroy())
    .pipe(res);
}

createServer((req, res) => {
  // One bad request must never take the demo down: answer 500 instead of crashing the process.
  try {
    if (!handleApi(req, res)) serveStatic(req.url ?? '/', res);
  } catch (error) {
    console.error('Request failed:', req.url, error);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
}).listen(PORT, () => {
  console.log(`Fire risk demo on http://localhost:${PORT}`);
});
