# Deployment

One app, one service, one domain.

The repo used to hold two Next apps — the Kin&d landing page in `Landing-Page/`
and the Raisee wizard at the root — each with its own lockfile, Dockerfile and
config. They are now a single app:

| Route | What it is |
| --- | --- |
| `/` | The landing page |
| `/plan` | The questionnaire and conversation-starter wizard |
| `/partners` | The partner program for therapy offices |
| `/api/*` | Card generation, voice transcription, thumb feedback |

So there is no subdomain to set up and no second service to keep in sync. The
"Get started" button is an ordinary link to `/plan`.

---

## The service

| Setting | Value | Why |
| --- | --- | --- |
| Source repo | `ray021207/HacksForHumanity` | — |
| Branch | `main` | Merge `landing-page` first. |
| Root Directory | `/` | There is only one app now. |
| Config-as-code path | `/railway.json` | Railway's config path does **not** follow Root Directory; with a root-level app the default is already correct. |
| Builder | Dockerfile | Set in `railway.json`, not the dashboard. |
| Networking → target port | `8080` | The Dockerfile sets `PORT=8080`; proxy and container must agree or you get 502. |
| Domains | `yourdomain.com`, `www.yourdomain.com` | Both point at this one service. |

CLI equivalent:

```bash
railway link
railway up
```

### Variables

Service variables, set at runtime — never build args. They are read inside
request handlers, and build args bake into image layers that anyone pulling the
image can read.

```
ANTHROPIC_API_KEY   = ...        # required: safety classifier + card generation
ELEVENLABS_API_KEY  = ...        # optional: enables the mic button
MODEL_NAME          = ...        # optional: defaults to claude-sonnet-5-5
```

The build itself needs no secrets and no network beyond npm: fonts are
vendored (`src/fonts`) or system stacks, so nothing is fetched from Google at
build time.

---

## When a deploy fails

1. **`next: command not found`** — dependencies were never installed in that
   environment. `npm ci` at the repo root.
2. **TypeScript errors in files you didn't touch** — check for a second Next
   app nested in the repo. `tsconfig.json` includes `**/*.ts(x)` and excludes
   only `node_modules`, so any nested project gets type-checked against the
   ROOT `@/*` alias and fails on imports that resolve fine in its own config.
   This is exactly what `Landing-Page/` did before the merge.
3. **502 Bad Gateway, container running** — target port ≠ `8080`. Railway
   injects `PORT=8080` and it never shows up in `railway variables`.
4. **Server starts but is unreachable** — `HOSTNAME` is not `0.0.0.0`, so the
   server bound to localhost inside the container.
5. **Fonts look wrong, build is green** — the body sans resolves to Helvetica
   Neue only on Apple platforms and falls back to Arial elsewhere. Deliberate,
   not a deploy bug.
