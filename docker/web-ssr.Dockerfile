FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/web-ssr/package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/web-ssr/ ./
# Builds browser + server bundles for SSR
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Only copy the dist output + minimal package metadata
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
# Install only prod deps (SSR runtime needs them)
RUN npm ci --omit=dev
EXPOSE 4000
# Angular SSR output usually generates server entry under dist/<project>/server/server.mjs
CMD ["node", "dist/web-ssr/server/server.mjs"]
