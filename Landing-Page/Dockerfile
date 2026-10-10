# syntax=docker/dockerfile:1
#
# Kin&d landing page — Next.js 16 (App Router) on adapter-free standalone output.

# ---- deps ----
# Split from the build stage so the npm layer stays cached until the lockfile
# actually changes; editing a component doesn't re-resolve the tree.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The one build arg: the origin the "Get plan" CTA points at. NEXT_PUBLIC_* is
# inlined into the client bundle at build time, so it cannot be a runtime
# variable — Railway passes service variables through to the build. Empty keeps
# the CTA on this origin; see src/lib/app-url.ts and DEPLOYMENT.md.
ARG NEXT_PUBLIC_APP_URL=""
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# NOTE: no secrets beyond that, and none should be added. Build args bake into
# image layers and are readable by anyone who pulls the image.
#
# No font needs the network: the display face is vendored in src/fonts and the
# body sans is a system stack, so nothing is fetched from fonts.googleapis.com
# at build time or at runtime.
RUN npm run build

# ---- runtime ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# `output: 'standalone'` traces exactly the modules server.js imports, so the
# runtime image carries those instead of the whole node_modules tree. The two
# folders below are NOT included in that trace and must be copied by hand —
# see output.md in node_modules/next/dist/docs.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Run unprivileged. The node image ships a `node` user already.
USER node

# EXPOSE IS DOCUMENTATION ONLY. It does not open a port, does not set $PORT, and
# is not what Railway's proxy targets.
#
# What actually decides the port: Railway injects PORT=8080 into the container
# (it does NOT show up in `railway variables`), server.js binds to it, and
# Railway's proxy connects to the service's *target port* in
# Settings -> Networking -> Public Networking. Those two must agree or you get
# 502 Bad Gateway. The defaults below match Railway's injection; HOSTNAME must
# be 0.0.0.0 or the server binds to localhost and is unreachable from outside
# the container.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
