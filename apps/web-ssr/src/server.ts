import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment.js';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.get('/health', (_req, res) => res.status(200).send('ok'));
const angularApp = new AngularNodeAppEngine();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Internal API proxy (SSR server) ----
const API_BASE =
  process.env['INTERNAL_API_BASE_URL'] || 'http://customer-api:3000';

app.use("/internal-api", async (req, res) => {
  try {
    const backendPath = req.originalUrl.replace(
      '/internal-api',
      '/api'
    );
    const url = new URL(backendPath, API_BASE);

    console.log(`Proxying request to: ${url.toString()}`);
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
    }
    // Avoid forwarding host header
    delete headers["host"];

    const body =
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : JSON.stringify(req.body ?? {});

    const resp = await fetch(url.toString(), {
      method: req.method,
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body,
    });

    const text = await resp.text();
    res.status(resp.status);

    // Try to return JSON if possible, else plain
    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (e: any) {
    res.status(500).json({ error: "SSR proxy failed", detail: e?.message });
  }
});
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});


/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const rawPort = (process.env['PORT'] ?? '4000').toString();
  const port = Number.parseInt(rawPort.replace(/[^\d]/g, ''), 10) || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
