# Deployment

This repo holds **two** independent Next.js 16 apps, each with its own
lockfile, `next.config.ts` and `Dockerfile`:

| App | Path | Package | Phase |
| --- | --- | --- | --- |
| Kin&d landing page | `Landing-Page/` | `kind-landing` | **Ship first** |
| Raisee (the product) | repo root | `parenting-starters` | Ship second |

A Railway service pointed at the repo root builds the **root** Dockerfile — the
Raisee app — no matter which app you meant. That is the failure mode this file
exists to prevent: the landing page builds clean on its own (`npm run build` in
`Landing-Page/` passes), so a failed landing-page deploy is almost always a
service pointed at the wrong directory, not broken code.

So: **one service now.** The landing page owns the real domain. The app ships
later on its own service, on a subdomain, and the landing page's "Get plan"
button is what hands people over to it.

---

## Phase 1 — one service: the landing page

Create exactly one Railway service and set these four things. Config as code
(`Landing-Page/railway.json`) already pins the builder, start command,
healthcheck, restart policy and watch patterns — the dashboard only needs the
source wiring.

| Setting | Value | Why |
| --- | --- | --- |
| Service name | `kind-landing` | — |
| Source repo | `ray021207/HacksForHumanity` | — |
| Branch | `main` | Merge `landing-page` first. |
| **Root Directory** | `/Landing-Page` | Build context = the landing app, so `npm ci` reads *its* lockfile. |
| **Config-as-code path** | `/Landing-Page/railway.json` | Railway's config path does **not** follow Root Directory — it must be the absolute repo path. Leave it at the default `railway.json` and Railway looks at the repo root, finds nothing, and falls back to dashboard defaults. |
| Networking → target port | `8080` | The Dockerfile sets `PORT=8080`; proxy and container must agree or you get 502. |

CLI equivalent:

```bash
railway link                       # pick the project
railway add --service kind-landing
railway environment edit --service-config kind-landing source.rootDirectory /Landing-Page
railway up --service kind-landing

# The config-as-code path has no stable CLI field — set it in the dashboard:
# Service -> Settings -> Config-as-code -> /Landing-Page/railway.json
```

### Domains

Point the apex and `www` at this service (Railway → Service → Settings →
Networking → Custom Domain):

```
yourdomain.com      → kind-landing
www.yourdomain.com  → kind-landing
```

### Variables

None are required. The landing page has no API routes and reads no secrets.
One optional variable, covered below:

```
NEXT_PUBLIC_APP_URL = https://app.yourdomain.com   # unset in phase 1
```

---

## Phase 2 — the app, on its own subdomain

When Raisee is ready, add a **second** service against the same repo. Do not
reuse the landing service; they have different lockfiles, different build
network needs and different secrets.

First commit this as `railway.json` **at the repo root** (it does not exist
yet — phase 1 deliberately ships one service):

```json
{
	"$schema": "https://railway.com/railway.schema.json",
	"build": {
		"builder": "DOCKERFILE",
		"dockerfilePath": "Dockerfile",
		"watchPatterns": [
			"src/**",
			"public/**",
			"scripts/**",
			"tests/**",
			"package.json",
			"package-lock.json",
			"next.config.ts",
			"Dockerfile"
		]
	},
	"deploy": {
		"startCommand": "npm run start",
		"healthcheckPath": "/",
		"healthcheckTimeout": 120,
		"restartPolicyType": "ON_FAILURE",
		"restartPolicyMaxRetries": 3,
		"numReplicas": 1,
		"sleepApplication": false
	}
}
```

Those `watchPatterns` (and the `Landing-Page/**` ones in the landing config)
are what stop a copy edit on the landing page from rebuilding the app, and
vice versa.

| Setting | Value |
| --- | --- |
| Service name | `raisee-app` |
| Root Directory | `/` |
| Config-as-code path | `/railway.json` |
| Target port | `8080` |
| Domain | `app.yourdomain.com` |

Service variables (runtime, **never** build args — they are read inside
request handlers, and build args bake into image layers):

```
ANTHROPIC_API_KEY   = ...
ELEVENLABS_API_KEY  = ...
```

### Subdomain, not a path

`app.yourdomain.com` is the right shape here: two services, two images, two
deploy cadences, one DNS record each. Serving the app under
`yourdomain.com/app` would need the landing service to proxy every app request
through itself — one more hop, shared downtime, and Next rewrites in front of
an app that streams responses. Not worth it for a hackathon-to-production path.

### What "Get Started" does

The landing page's CTA ("Get plan", in `SearchBar` and `MobileSheet`) reads one
build-time variable, `Landing-Page/src/lib/app-url.ts`:

- **unset** (phase 1) → CTA stays local at `/plan`
- **set** to `https://app.yourdomain.com` (phase 2) → CTA crosses to the app

`NEXT_PUBLIC_*` is inlined at **build** time, not read at runtime, so setting
it on the landing service triggers a rebuild — that is expected, and it is a
public URL, not a secret.

---

## When a deploy fails

1. **Build log shows `vitest` / `tsx` / `@anthropic-ai/sdk` installing** —
   the service is building the root app. Root Directory is wrong.
2. **Build log ignores `Landing-Page/railway.json`** — the config path is
   still the default. It must be the absolute `/Landing-Page/railway.json`.
3. **502 Bad Gateway, container running** — target port ≠ `8080`. Railway
   injects `PORT=8080` and it never shows up in `railway variables`.
4. **Server starts but is unreachable** — `HOSTNAME` is not `0.0.0.0`.
5. **Fonts are not a build dependency** — nothing is fetched from
   fonts.googleapis.com at build time any more. The display face (DM Serif
   Text) is vendored in `Landing-Page/src/fonts/` and the body sans is a system
   stack, so a font-related build failure means something else changed. Note
   the sans resolves to Helvetica Neue only on Apple platforms and degrades to
   Arial elsewhere — a deliberate call, not a deploy bug to chase.
