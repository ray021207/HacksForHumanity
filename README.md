# kin&d (MVP)

A parent answers a short questionnaire once, then describes a situation and gets 3 to 5
conversation-starter cards. There is no chat — nothing typed after the cards ever reaches the
model.

This is an MVP built to the spec in the original product spec (kept locally, not in this repo). It is **not clinically reviewed** and is not
ready for real users. See "What still needs a human" below before any real launch.

## Stack

- Next.js (App Router, TypeScript, Tailwind, ESLint) — `src/app`
- Vitest for unit tests — `src/**/*.test.ts`
- `@anthropic-ai/sdk` for the safety classifier and card generation
- `@elevenlabs/elevenlabs-js` for optional speech-to-text on the situation screen's mic button
- Plain TypeScript for all scoring (no model call involved)
- Better Auth for sign-in (magic-link email via Resend, plus optional Google OAuth), with
  database sessions
- Drizzle ORM + Postgres (Neon/Vercel Postgres) for persistence
- Stripe Checkout + Billing Portal for the freemium subscription
- **Persistence changed from the original MVP.** Sign-in is now required before the
  questionnaire or card generation. Once signed in, your account, questionnaire responses,
  children/relationship info, and situation text are stored in Postgres, tied to your account —
  this is a deliberate change from the original local-only MVP, made to support saved
  progress across devices and the freemium usage limit. The append-only `logs/events.log`
  remains counts-only, as before, for safety-gate/lint telemetry specifically. The in-browser
  `localStorage` draft (`appState.ts`) still exists, but only as a short-lived autosave cache
  for the in-progress step — the server is the source of truth once a block is completed.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the variables below
```

`.env.local` reads:

- `ANTHROPIC_API_KEY` — required for the safety classifier and card generation.
- `MODEL_NAME` — defaults to `claude-sonnet-5-5` if unset.
- `ELEVENLABS_API_KEY` — optional. Enables the "🎤 Speak instead" mic button on the situation
  screen (speech-to-text only; there's no read-aloud/TTS). Leave it unset and the mic button
  simply doesn't render — `GET /api/voice/transcribe` reports `{enabled: false}` and the UI checks
  that before showing it.
- `AUTH_SECRET` — required. Generate with `openssl rand -base64 33`.
- `AUTH_URL` — the deployed domain in production; auto-detected in dev.
- `RESEND_API_KEY`, `EMAIL_FROM` — required for magic-link sign-in email.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — optional, enables "Continue with Google".
- `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING` — required. A Postgres connection string (e.g. from
  Vercel Postgres/Neon). The non-pooling URL is used by `drizzle-kit migrate`.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` — required for billing. Create
  one Product + recurring Price in the Stripe dashboard, and register a webhook endpoint at
  `/api/stripe/webhook` subscribed to `checkout.session.completed`,
  `customer.subscription.updated`, and `customer.subscription.deleted`.

Once `POSTGRES_URL`/`POSTGRES_URL_NON_POOLING` are set, run the migration:

```bash
npm run db:generate   # regenerate drizzle/*.sql after a schema change (already generated once)
npm run db:migrate    # apply migrations to the database
```

## Freemium limit

Signed-in users get `FREE_LIMIT` (5, see `src/lib/billingConstants.ts`) free card generations
before `/api/cards/generate` returns `402` and the UI shows an upgrade prompt
(`src/components/UpgradePrompt.tsx`) linking to `/account/billing`. A red-tier (crisis) result
never consumes a free generation, since it costs no model call and someone in crisis shouldn't
be penalized for hitting a limit. The usage counter is enforced server-side
(`src/lib/billing.ts`) via an atomic `INSERT ... ON CONFLICT DO UPDATE`, and fails closed (blocks
free users, never blocks an already-resolved subscriber) if the database is unreachable.

## Running things

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the app at http://localhost:3000 |
| `npm run build` / `npm start` | Production build and start |
| `npm test` | Runs all Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run score:csv -- path/to/responses.csv` | Scores a CSV of questionnaire responses; prints scale scores and Cronbach's alpha per block |
| `npm run safety:eval` | Runs the safety gate against `tests/safety-set.json` (40 labelled situations) and reports red-tier recall and false-positive rate. Needs `ANTHROPIC_API_KEY` — makes one model call per case. |
| `npm run lint:pass-rate` | Runs generation (no retry) against the 50 scenarios in `tests/scenario-set.json` and reports the first-try lint pass rate. Needs `ANTHROPIC_API_KEY`. |
| `npm run eval:profile` | Generates cards twice for each of the 50 scenarios (once with a distinctive synthetic profile, once with a neutral/generic one) and writes a paired CSV to `logs/profile-vs-generic.csv` for blind rating. Needs `ANTHROPIC_API_KEY`. |

## How it's organized

```
src/data/questionnaire.json   The six questionnaire blocks: family, TIPI, scenarios, goals
src/data/playbook.json        Curated technique guidance per age band + goal (versioned, reviewed by code review)
src/data/safety-content.ts    Fixed amber/red safety text (TODO: clinician review required)
src/lib/scoring.ts            Likert scorer, scenario scorer, reverse keying, TIPI scorer, Cronbach's alpha
src/lib/profile.ts            Turns raw responses into profile scores + strengths-first copy
src/lib/safety.ts             Rule layer + model classifier + combined safety gate
src/lib/generation.ts         Prompt builder, JSON-schema validator, banned-pattern lint, fallback card
src/lib/anthropic-client.ts   Anthropic SDK wiring for the classifier and generator
src/lib/elevenlabs-client.ts  ElevenLabs speech-to-text wiring (optional, see .env.local)
src/lib/logging.ts            Append-only counts-only log
src/app/api/cards/generate    The one endpoint: safety gate -> (generation + validator) -> cards
src/app/api/feedback/thumb    Logs a thumbs up/down (counts only)
src/app/api/voice/transcribe  GET: is voice input configured. POST: transcribes one audio clip, nothing persisted
src/app/page.tsx              The wizard: consent -> family -> questionnaire -> profile -> situation -> cards
scripts/                      CLI scoring, safety eval, lint-pass-rate, profile-vs-generic eval
tests/                        safety-set.json (40 labelled situations), scenario-set.json (50 synthetic scenarios)
```

## The questionnaire: what's in it and why

**~16 questions total**, not ~40. The first version of this followed the spec literally: 10 TIPI
items plus 27 original Likert ("how often do you...") items across four separate blocks. That's a
long sit for a parent who just wants conversation help, and a wall of abstract frequency
statements is also arguably a worse way to surface "what do you actually do" than a concrete
situation. So the 27 Likert items were replaced with **8 short scenario (situational-judgment)
questions**, and the TIPI was later trimmed from 10 to 6 items on request (see point 2).

The full sourcing rationale and instrument survey are in the original product spec (kept locally, not in this repo); block by block, as built:

1. **Family** — age band (13–15, 16–17, 18–22, 23+), living situation, optional nickname.
   Original, not from a published instrument. This is the single biggest lever on tone: teens get
   autonomy/identity framing, adult children get adult-to-adult framing with no claim to parental
   authority. No birthdates, no real names, ever.

2. **Personality — 6 of the 10 TIPI items** (Gosling, Rentfrow & Swann, 2003). The TIPI measures
   the Big Five as 5 traits × 2 items each (one regular, one reverse-keyed), and its scoring
   averages each trait's pair. This build keeps 3 traits whole — **Extraversion, Agreeableness,
   Emotional Stability** — with both items intact, so the reverse-keying still works correctly for
   each one; **Conscientiousness and Openness were dropped entirely** (the traits judged least
   tied to conversational tone) rather than cut unevenly. This is a deliberate tradeoff made on
   request to shorten the questionnaire: it is no longer "the TIPI as published" for scoring
   purposes, even though every included item's wording and scale are verbatim. It's the one
   instrument confirmed free to use for any purpose, so trimming it doesn't raise a new license
   question — see `src/data/questionnaire.json`'s `source` field on the `personality` block for
   the full note. It only tunes *tone* (e.g., how much of a pause-and-steady lead-in precedes a
   hard line) — deliberately a light touch even before the trim, since the author himself calls it
   "somewhat inferior" to longer Big Five measures.

3. **8 scenarios** (`src/data/questionnaire.json`, block id `scenarios`) — each scenario's 4
   options are pre-scored on 1 or 2 of six subscales: `structure`, `pressure`, `warmth` (parenting
   style, loosely inspired by Baumrind's three styles), `autonomy_support` (self-determination
   theory / P-PASS constructs), `emotion_coaching` (Gottman-style emotion-coaching research), and
   `confidence` (parenting self-efficacy constructs, e.g. SEPA). None of this is copied from the
   PSDQ, P-PASS, ERPS, or any published scale — these are original items inspired by the same
   constructs, written specifically to avoid any reuse-license question (no license was found for
   the PSDQ, and it's normed on preschool/school-age children anyway, the weakest fit for this
   app's teen/adult audience). `scoreScenarioBlock()` in `src/lib/scoring.ts` averages whichever
   scenarios touch each subscale into that subscale's score. **Tradeoff, stated plainly**: with
   only 2–3 scenarios feeding each subscale instead of 4–6 Likert items, there's less data per
   dimension, so expect a lower Cronbach's alpha than the Likert version would have produced — see
   "What still needs a human" below. The `confidence` subscale is the one that matters most to get
   right: it exists because the one exploratory gentle-parenting study found (PLOS ONE, 2024) found
   self-critical parents reported meaningfully lower efficacy and over a third voiced burnout, so a
   low score there makes the generator lead with reassurance, never a caveat.

4. **Goals** (2 chips, original) — repair, closeness, set a limit, or make an ask. Decides what the
   conversation is *for*, which steers the technique mix more directly than any other block.

**Everything except the TIPI is original and marked `"draft, needs owner review"`** in
`questionnaire.json` and `playbook.json`. None of it has been validated. It's a best-effort
adaptation of well-supported constructs, not a validated clinical instrument — see the
"Questionnaire sources" table in the original product spec (kept locally, not in this repo) for the full survey of why no single published
instrument covers parents of teens through adult children.

Every item follows the same rules: ask about behavior, never identity; never ask about diagnoses,
health history, or a child's real name; every item offers "prefer not to say"; and the profile
screen shows strengths-first language with one suggested stretch — never a type label like
"authoritarian."

## Voice input (optional)

The situation screen has a "🎤 Speak instead" button that records a short clip in the browser
(`MediaRecorder`), sends it to `POST /api/voice/transcribe`, and drops the transcript into the same
editable textarea the parent would otherwise type into — it's never auto-submitted. That route
calls ElevenLabs speech-to-text (`src/lib/elevenlabs-client.ts`) and nothing else: the audio is
held in memory for that one request and discarded, and the route never calls `appendLog()`. If
`ELEVENLABS_API_KEY` isn't set, `GET /api/voice/transcribe` reports `{enabled: false}` and the
button doesn't render at all — no dead UI, no silent failure. There's no text-to-speech / read-aloud
in this build. Verified end-to-end against the live ElevenLabs API: `enabled: true` once the key
is set, and a real audio clip round-trips through `POST /api/voice/transcribe` successfully.

**Known gap, English-only by explicit decision**: the STT model (`scribe_v1`) transcribes in
whatever language is spoken — it does not translate. A parent speaking Spanish gets a Spanish
transcript, which then goes to the safety classifier and generator as-is; neither prompt currently
pins an output language, so the cards could come back in Spanish, English, or an inconsistent mix.
This was a deliberate scope call, not an oversight — see `src/lib/elevenlabs-client.ts` for where
the fix would go (pin the generation prompt's output language, or add an explicit translation
step) if multilingual support is wanted later.

## Safety gate

Every situation goes through `classifyRisk()` (`src/lib/safety.ts`) **before** any generation call:

1. A fast keyword/rule layer flags obvious red/amber language.
2. A model classifier (strict JSON `{tier, reasons}`) runs in parallel logic (sequentially, in
   code) and adds nuance.
3. The two layers combine by taking the **more severe** tier. If the model call fails or returns
   invalid JSON, it fails safe to amber — never to green.
4. `red` → no generated text at all. Fixed content only (`RED_TIER_CONTENT` in
   `src/data/safety-content.ts`): stay with the person, 988, text HOME to 741741, or emergency
   services. No other numbers are added.
5. `amber` → cards are generated, plus the same two fixed resources shown alongside them.

`tests/safety-set.json` has 40 hand-written, labelled situations (14 green / 13 amber / 13 red).
It is explicitly marked `"starter, to be extended and clinician-reviewed"` — see Done criteria
below for the numbers it produced in this build, and do not treat those numbers as a launch gate
until a clinician has reviewed the set itself.

## Generation and validation

One structured call per request (`src/lib/generation.ts`): profile scores go in as numbers plus
plain one-line tendencies (`scoresToTendencyLines`) — **never** as a type label — along with the
age band, situation, goal, and the relevant slice of `playbook.json`. The model returns strict
JSON: `{risk_tier, frame, before_you_start, starters: [{text, technique, why, avoid}], setting_tip}`,
3 to 5 starters, each tagged with exactly one of `validation | open_question | autonomy_offer |
repair | boundary`.

After generation, `validateSchema()` checks the shape and `lintBannedPatterns()` scans every field
for commands, threats, guilt, withdrawal-of-affection language, and diagnosis/pop-psych labeling.
A failure retries once with the same call; a second failure returns `fallbackCard()`, a fixed,
pre-written card that is itself schema-valid and lint-clean.

`generateCards()` and `buildGenerationPrompt()` still accept an optional `refinement`
("shorter" / "softer" / "different angle") that re-runs the same one-shot call with a changed
parameter — the capability from the original spec. **The UI no longer exposes it**: the
"Want these adjusted?" chips on the cards screen were removed on request, so in this build nothing
ever sets `refinement`. If it's wanted back, the backend and `/api/cards/generate`'s `refinement`
field are already there and tested; only `CardsStep`/`page.tsx` would need the chips re-added.
Either way, nothing the parent types after the cards are shown ever reaches the model.

## Tests

`npm test` runs 46 Vitest tests covering:

- `src/lib/scoring.test.ts` — reverse keying, the hand-checkable TIPI example from the spec
  (Extraversion items scoring 5 and 2 → (5 + 6) / 2 = 5.5), the scenario-block scorer (averaging
  only the subscales a selected option touches, missing ≠ zero), the 75%-answered threshold, and
  Cronbach's alpha on both a highly-consistent and a near-random dataset.
- `src/lib/safety.test.ts` — rule-layer keyword matches, the model classifier's fail-safe-to-amber
  behavior on invalid JSON/thrown errors, and the combined gate always taking the more severe
  tier.
- `src/lib/generation.test.ts` — schema validation, every banned-pattern category (including that
  benign "you will" phrasing and the `avoid` field's cautionary examples are correctly *not*
  flagged), the retry-once-then-fallback flow, and that the fallback card itself passes both
  checks.

## Done criteria (numbers from this build)

All of these were run against the real Anthropic API (model: see `.env.local`) at build time; see
the commands above to re-run them.

- **All Vitest tests pass**: 46/46.
- **Safety script, red-tier recall and false-positive rate** on the 40-case starter set
  (`npm run safety:eval`): **100% red-tier recall (13/13)**, **0% false-positive rate (0/40)**.
  This is a small, hand-written, non-clinician-reviewed set — treat this as a sanity check that
  the pipeline works, not as a launch-readiness number.
- **Lint pass rate on first try** across the 50 synthetic scenarios (`npm run lint:pass-rate`):
  **100% (50/50)** schema pass and **100% (50/50)** lint pass, after two fixes made during this
  build: `max_tokens` was raised from 1200 to 2048 (the first run truncated ~18% of responses
  mid-JSON-string), and the banned-pattern "command" regex was narrowed to drop `you will` (too
  broad — it matched benign predictive phrasing like "you will feel better") and the lint was
  changed to skip the `avoid` field (whose entire purpose is to *name* the bad phrase as a
  cautionary example, so linting it was flagging exactly the content it's supposed to contain).
  The first run, before those fixes, was 82% schema / 68% lint — see git history / commit message
  for the raw before/after if you want the comparison.
- **Profile vs. generic comparison** (`npm run eval:profile`): writes
  `logs/profile-vs-generic.csv`, a blind-ratable pair of outputs per scenario. This script does
  *not* compute the preference rate — that's stage 4's actual measurement and needs two human
  raters scoring the CSV (with the label columns hidden from them) on a 1–5 rubric. Not run in
  this build (50 scenarios × 2 generations each = 100 API calls; run it yourself when you have
  raters lined up).

## What still needs a human (do not skip before any real launch)

- **Owner review of every non-TIPI item, plus sign-off on the TIPI trim.** Every item outside the
  TIPI in `questionnaire.json`, and every content field in `playbook.json`, is marked
  `"draft, needs owner review"` or `_status: "draft, needs owner review"`. None of it is validated.
  Separately, the `personality` block's own status flags that dropping Conscientiousness and
  Openness (keeping Extraversion, Agreeableness, Emotional Stability) was a judgment call made to
  shorten the questionnaire, not a research-backed choice — worth a second opinion before launch.
- **Clinician review of safety content.** `src/data/safety-content.ts` has a `TODO: Clinician
  review required before launch` at the top. A licensed clinician needs to review the amber/red
  text, the 988/Crisis Text Line hand-off, and `tests/safety-set.json` itself (both the situations
  and their labels) before the recall/false-positive numbers above mean anything for a launch
  decision.
- **A pilot for Cronbach's alpha and completion time.** `npm run score:csv` computes alpha per
  subscale from a CSV of real responses — this build has no real respondent data, only the unit
  tests' synthetic examples. Stage 1 in the spec calls for a ~30-parent pilot. This matters more
  than it did before the questionnaire was shortened: each scenario subscale now gets only 2–3
  data points (versus 4–6 for the original Likert items), so expect — and explicitly check for —
  a lower alpha. If the pilot shows it's too low to be useful, the fix is likely more scenarios
  per subscale, not reverting to the long Likert form.
- **A legal check.** Rhode Island's chatbot-safety law (effective June 23, 2026) and the amended
  COPPA rule (compliance deadline April 22, 2026) are both referenced in the original product spec (kept locally, not in this repo). Whether
  either applies here, and the exact disclosure/retention language needed, is a question for
  counsel, not for this codebase.

## Explicitly out of scope for this MVP

Chat (there is none, by design — voice input still only fills the same one-shot textarea), text-to-
speech/read-aloud, partner sharing, child accounts, push notifications, subscriptions,
streaks/gamification, and any analytics built on emotional content. No deployment — this has only
been run locally.
