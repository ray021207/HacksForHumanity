// Measures the lint pass rate on the FIRST model response (no retry) across
// the 50 synthetic scenarios in tests/scenario-set.json. This is the
// "Lint pass rate on first try across the 50 scenarios" number called for
// in the done criteria.
//
// Usage: npx tsx scripts/lint-pass-rate.ts

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync } from "node:fs";
import {
  validateSchema,
  lintBannedPatterns,
  buildGenerationPrompt,
  type AgeBand,
  type Goal,
  type CardsOutput,
} from "../src/lib/generation";
import type { ProfileScores } from "../src/lib/scoring";
import { createGenerationInvoker, getAnthropicClient, getModelName } from "../src/lib/anthropic-client";

interface Scenario {
  id: string;
  ageBand: AgeBand;
  goal: Goal;
  situationText: string;
}

// A neutral, midpoint profile — this script measures raw generation
// quality, not the profile-vs-generic question (that's eval-profile.ts).
const NEUTRAL_PROFILE: ProfileScores = {
  tipi: {},
  parentingStyle: { warmth: 3, structure: 3, pressure: 3 },
  autonomyControl: { autonomy_support: 3 },
  emotionCoaching: { emotion_coaching: 3 },
  confidenceLoad: { confidence: 3 },
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set in .env.local.");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync("tests/scenario-set.json", "utf-8")) as { scenarios: Scenario[] };
  const invoker = createGenerationInvoker(getAnthropicClient(), getModelName());

  let schemaPass = 0;
  let lintPass = 0;
  let bothPass = 0;
  const rows: Record<string, unknown>[] = [];

  for (const scenario of data.scenarios) {
    const prompt = buildGenerationPrompt({
      profile: NEUTRAL_PROFILE,
      ageBand: scenario.ageBand,
      relationshipType: "solo_parent",
      situationText: scenario.situationText,
      goal: scenario.goal,
      riskTier: "green",
    });

    let schemaOk = false;
    let lintOk = false;
    let errorNote = "";
    try {
      const raw = await invoker(prompt);
      const parsed = JSON.parse(raw);
      const schemaResult = validateSchema(parsed);
      schemaOk = schemaResult.valid;
      if (schemaOk) {
        const issues = lintBannedPatterns(parsed as CardsOutput);
        lintOk = issues.length === 0;
        if (!lintOk) errorNote = issues.map((i) => `${i.category}:${i.field}`).join("; ");
      } else {
        errorNote = schemaResult.errors.join("; ");
      }
    } catch (err) {
      errorNote = err instanceof Error ? err.message : "unknown error";
    }

    if (schemaOk) schemaPass++;
    if (schemaOk && lintOk) {
      lintPass++;
      bothPass++;
    }

    console.log(`${scenario.id}: schema=${schemaOk ? "pass" : "FAIL"} lint=${schemaOk && lintOk ? "pass" : "FAIL"}${errorNote ? ` (${errorNote})` : ""}`);
    rows.push({ id: scenario.id, ageBand: scenario.ageBand, goal: scenario.goal, schemaOk, lintOk, errorNote });
  }

  const total = data.scenarios.length;
  console.log("\n=== Results ===");
  console.log(`Schema pass rate: ${((schemaPass / total) * 100).toFixed(1)}% (${schemaPass}/${total})`);
  console.log(`Lint pass rate on first try: ${((bothPass / total) * 100).toFixed(1)}% (${bothPass}/${total})`);

  writeFileSync("logs/lint-pass-rate-results.json", JSON.stringify(rows, null, 2));
  console.log("\nWrote per-scenario results to logs/lint-pass-rate-results.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
