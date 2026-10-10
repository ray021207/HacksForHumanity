# syntax=docker/dockerfile:1
#
# Kin&d — Next.js 16 (App Router). One image serves the whole product: the
# landing page at /, the wizard at /plan, the partner program at /partners and
# the API routes.
#
# This app does NOT set `output: 'standalone'` in next.config.ts, so the runtime
# stage keeps node_modules and runs `next start`. Switching it to standalone
# would shrink this image by a few hundred MB: set the config flag, then copy
# .next/standalone, .next/static and public instead of node_modules + .next.

# ---- deps ----
# Split from the build stage so the npm layer stays cached until the lockfile
# actually changes; editing a component doesn't re-resolve the tree.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- prod deps ----
# A second, dev-free install. Copying the build stage's node_modules into the
# runtime image instead would drag vite, vitest, eslint and the TS toolchain
# along with it — roughly a gigabyte of things the server never calls.
FROM node:24-alpine AS prod_deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NOTE: no secrets are needed here, and none should be added. ANTHROPIC_API_KEY
# and ELEVENLABS_API_KEY are read inside request handlers, not at module scope,
# so the build runs without them — and it must stay that way. Build args bake
# into image layers and are readable by anyone who pulls the image.
RUN npm run build

# ---- runtime ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=prod_deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts

# Run unprivileged. The node image ships a `node` user already.
USER node

# EXPOSE IS DOCUMENTATION ONLY. It does not open a port, does not set $PORT, and
# is not what Railway's proxy targets.
#
# Railway injects PORT=8080 into the container (it does NOT show up in
# `railway variables`), `next start` binds to it, and Railway's proxy connects
# to the service's *target port* in Settings -> Networking. Those two must agree
# or you get 502 Bad Gateway. HOSTNAME must be 0.0.0.0 or the server binds to
# localhost and is unreachable from outside the container.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["npm", "run", "start"]
