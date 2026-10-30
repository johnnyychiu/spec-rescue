import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConfig, type AppConfig } from './config.js';
import { RescueRun, exportMarkdown } from './team.js';
import type { Infer } from './provider.js';

const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));
const mime: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function json(res: ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
async function body(req: IncomingMessage): Promise<unknown> {
  let length = 0; const chunks: Buffer[] = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 52000) throw new Error('body-too-large');
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createApp(options: { config?: AppConfig; infer?: Infer } = {}) {
  const config = options.config || readConfig();
  const runs = new Map<string, RescueRun>();
  const streams = new Set<ServerResponse>();
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'");
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/api/config') {
        json(res, 200, { ready: config.ready, model: config.model, missing: config.missing }); return;
      }
      if (req.method === 'POST' && url.pathname === '/api/runs') {
        if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) {
          json(res, 403, { error: 'Cross-origin requests are not allowed.' }); return;
        }
        if (!req.headers['content-type']?.startsWith('application/json')) { json(res, 415, { error: 'Send application/json.' }); return; }
        if (!config.ready) { json(res, 503, { error: 'Configure the model endpoint and API key before starting a run.', missing: config.missing }); return; }
        let data: unknown;
        try { data = await body(req); } catch (error) {
          json(res, error instanceof Error && error.message === 'body-too-large' ? 413 : 400, { error: 'Invalid JSON or request body too large.' }); return;
        }
        const brief = (data as { brief?: unknown } | null)?.brief;
        if (typeof brief !== 'string' || brief.trim().length < 10 || brief.length > 12000) {
          json(res, 400, { error: 'Enter a brief between 10 and 12,000 characters.' }); return;
        }
        // Check after the asynchronous body read so simultaneous requests cannot race past the cap.
        if ([...runs.values()].filter(run => run.snapshot().status === 'running').length >= 2) {
          json(res, 429, { error: 'Two runs are already active. Please wait for one to finish.' }); return;
        }
        // Keep a bounded amount of in-memory history. Never evict an active run.
        if (runs.size >= 20) {
          const oldest = [...runs].find(([, value]) => value.snapshot().status !== 'running');
          if (oldest) runs.delete(oldest[0]);
        }
        const run = new RescueRun(brief.trim(), config, options.infer);
        runs.set(run.snapshot().id, run);
        json(res, 201, { id: run.snapshot().id });
        run.start(); return;
      }
      const match = /^\/api\/runs\/([a-f0-9-]+)(?:\/(events|export))?$/.exec(url.pathname);
      if (req.method === 'GET' && match) {
        const run = runs.get(match[1]);
        if (!run) { json(res, 404, { error: 'Run not found. Runs are stored in memory and disappear on restart.' }); return; }
        if (match[2] === 'export') {
          if (run.snapshot().status !== 'completed') { json(res, 409, { error: 'The final specification is not ready yet.' }); return; }
          res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'attachment; filename="spec-rescue.md"', 'Cache-Control': 'no-store' });
          res.end(exportMarkdown(run.snapshot())); return;
        }
        if (match[2] === 'events') {
          res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
          streams.add(res);
          const push = (snapshot: ReturnType<RescueRun['snapshot']>) => {
            if (res.writableEnded) return;
            res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
            if (snapshot.status !== 'running') res.end();
          };
          const unsubscribe = run.subscribe(push);
          const heartbeat = setInterval(() => { if (!res.writableEnded) res.write(': keepalive\n\n'); }, 15000);
          res.on('close', () => { unsubscribe(); clearInterval(heartbeat); streams.delete(res); });
          push(run.snapshot()); return;
        }
        json(res, 200, run.snapshot()); return;
      }
      if (url.pathname.startsWith('/api/')) { json(res, 404, { error: 'Endpoint not found.' }); return; }
      if (req.method !== 'GET' && req.method !== 'HEAD') { json(res, 405, { error: 'Method not allowed.' }); return; }
      const decoded = decodeURIComponent(url.pathname);
      const file = resolve(publicDirectory, decoded === '/' ? 'index.html' : `.${decoded}`);
      if (!file.startsWith(resolve(publicDirectory) + sep) || decoded.split('/').some(part => part.startsWith('.'))) {
        json(res, 404, { error: 'Not found.' }); return;
      }
      try {
        const contents = await readFile(file);
        res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(req.method === 'HEAD' ? undefined : contents);
      } catch { json(res, 404, { error: 'Not found.' }); }
    } catch { if (!res.headersSent) json(res, 500, { error: 'Request failed. Please retry.' }); else res.end(); }
  });
  server.on('close', () => { for (const stream of streams) stream.end(); });
  return { server, runs };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4317);
  const host = process.env.HOST || '127.0.0.1';
  const config = readConfig();
  const { server } = createApp({ config });
  server.listen(port, host, () => {
    console.log(`Spec Rescue: http://${host}:${port}`);
    console.log(`Model: ${config.model}; ${config.ready ? 'configured' : `configuration missing: ${config.missing.join(', ')}`}`);
  });
  server.on('error', () => { console.error('Cannot start Spec Rescue. Check HOST and PORT.'); process.exitCode = 1; });
}
