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

function serveStatic(rawUrl: string, res: ServerResponse): void {
  const pathname = decodeURIComponent(new URL(rawUrl, 'http://localhost').pathname);
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
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  if (!handleApi(req, res)) serveStatic(req.url ?? '/', res);
}).listen(PORT, () => {
  console.log(`Fire risk demo on http://localhost:${PORT}`);
});
