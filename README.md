# Customer CRUD Angular SSR

[![Web SSR CI](https://github.com/blitznihar/customer-crud-ng-ssr/actions/workflows/web-ssr-ci.yml/badge.svg)](https://github.com/blitznihar/customer-crud-ng-ssr/actions/workflows/web-ssr-ci.yml)
[![Customer API CI](https://github.com/blitznihar/customer-crud-ng-ssr/actions/workflows/customer-api-ci.yml/badge.svg)](https://github.com/blitznihar/customer-crud-ng-ssr/actions/workflows/customer-api-ci.yml)
[![License](https://img.shields.io/github/license/blitznihar/customer-crud-ng-ssr)](https://github.com/blitznihar/customer-crud-ng-ssr/blob/main/LICENSE)

This repository contains a Server-Side Rendered (SSR) Angular web app and a Node/Express API service. The web app renders pages on the server for faster first paint and better SEO, then hydrates on the client. The API is optional for local UI development; the app can still run without it.

## Why this is SSR

- The app is built with Angular SSR support (server entry and server routes).
- The SSR build produces a server bundle that is run with Node to render HTML on the server.
- After the initial server render, the client app hydrates in the browser.

### SSR-related files

- apps/web-ssr/src/main.server.ts (server entry point)
- apps/web-ssr/src/server.ts (Node/Express SSR server)
- apps/web-ssr/src/app/app.config.server.ts (server-only app config)
- apps/web-ssr/src/app/app.routes.server.ts (server routes)
- apps/web-ssr/src/main.ts (client entry for hydration)

## Project layout

- Web SSR app: apps/web-ssr
- API service: services/customer-api (optional)

## Run the web app (SSR)

From the web app folder:

```bash
cd apps/web-ssr
npm install
npm run start
```

Then open http://localhost:4200/.

### Build and serve SSR output

```bash
cd apps/web-ssr
npm install
npm run build
node dist/web-ssr/server/server.mjs
```

This runs the SSR server from the built output.

## Run the API (optional)

The API provides customer CRUD endpoints used by the UI. It is not required just to start and view the web app.

```bash
cd services/customer-api
npm install
npm run dev
```

## Scripts

### Web app

- `npm run start`: start Angular dev server
- `npm run build`: build SSR output

### API

- `npm run dev`: start the API in watch mode
- `npm run build`: compile TypeScript
- `npm run start`: run the compiled server

## Notes

- The web app is SSR-enabled; client hydration happens automatically after the server render.
- The API is optional for local development. You can run the UI without it.

## Kubernetes: API is internal-only

When deployed to Kubernetes, the Customer API is not exposed externally. It is only reachable from inside the cluster (and used by the SSR server). This keeps the API private while still allowing the web UI to function normally.

### Verify the API is reachable inside the cluster

From a temporary pod in the same namespace:

```bash
kubectl -n customer-ssr run tmp --rm -it --image=curlimages/curl --restart=Never -- \
	curl -s http://customer-api:3000/health
kubectl -n customer-ssr run tmp --rm -it --image=curlimages/curl --restart=Never -- \
	curl -s http://customer-api:3000/api/customers
```

You should see a successful response (e.g., `{"ok":true}` and a JSON list of customers).

### Verify the API is NOT reachable from outside the cluster

From your local machine (outside Kubernetes):

```bash
curl http://customer-api:3000/api/customers
curl http://localhost:3000/api/customers
```

Both should fail, because the API service is only exposed as a ClusterIP inside the Kubernetes network. The SSR web app can still call the API from the server side, so the UI works while the API remains private.
