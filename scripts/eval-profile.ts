// Stage 4: "Does the profile help?" — generates cards twice for each of the
// 50 scenarios in tests/scenario-set.json: once with a synthetic
// profile, once with only the age band (a neutral/midpoint profile). Writes
// both outputs to a CSV for blind rating by two raters.
//
// This does NOT compute the preference rate itself — that needs a human
// rater, per the spec. It produces the paired CSV that rating is done on.
//
// Usage: npx tsx scripts/eval-profile.ts

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync } from "node:fs";
import { generateCards, type AgeBand, type Goal, type CardsOutput } from "../src/lib/generation";
import type { ProfileScores } from "../src/lib/scoring";
import { createGenerationInvoker, getAnthropicClient, getModelName } from "../src/lib/anthropic-client";

interface Scenario {
  id: string;
  ageBand: AgeBand;
  goal: Goal;
  situationText: string;
}

// A deliberately distinctive synthetic profile: warm, autonomy-supportive,
// low on structure, and a bit low on confidence — picked to be far from
// the neutral midpoint so any effect of conditioning on it should show up.
const DISTINCTIVE_PROFILE: ProfileScores = {
  tipi: {},
  parentingStyle: { warmth: 4.5, structure: 2, pressure: 2 },
  autonomyControl: { autonomy_support: 4.5 },
  emotionCoaching: { emotion_coaching: 4.5 },
  confidenceLoad: { confidence: 2 },
};

// "Generic" = only the age band matters; every other score sits at the
// scale midpoint so it carries no signal.
const NEUTRAL_PROFILE: ProfileScores = {
  tipi: {},
  parentingStyle: { warmth: 3, structure: 3, pressure: 3 },
  autonomyControl: { autonomy_support: 3 },
  emotionCoaching: { emotion_coaching: 3 },
  confidenceLoad: { confidence: 3 },
};

function cardsToPlainText(cards: CardsOutput): string {
  const lines = [
    `Frame: ${cards.frame}`,
    `Before you start: ${cards.before_you_start}`,
    ...cards.starters.map((s, i) => `${i + 1}. [${s.technique}] "${s.text}" — why: ${s.why} — avoid: ${s.avoid}`),
    `Setting tip: ${cards.setting_tip}`,
  ];
  return lines.join("\n").replace(/"/g, '""');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set in .env.local.");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync("tests/scenario-set.json", "utf-8")) as { scenarios: Scenario[] };
  const invoker = createGenerationInvoker(getAnthropicClient(), getModelName());

  const csvRows = ["scenario_id,age_band,goal,situation_text,version_a_label,version_a_output,version_b_label,version_b_output,rater_preference_1_to_5,notes"];

  for (const scenario of data.scenarios) {
    const profileResult = await generateCards(
      {
        profile: DISTINCTIVE_PROFILE,
        ageBand: scenario.ageBand,
        relationshipType: "parent",
        situationText: scenario.situationText,
        goal: scenario.goal,
        riskTier: "green",
      },
      invoker
    );
    const genericResult = await generateCards(
      {
        profile: NEUTRAL_PROFILE,
        ageBand: scenario.ageBand,
        relationshipType: "parent",
        situationText: scenario.situationText,
        goal: scenario.goal,
        riskTier: "green",
      },
      invoker
    );

    // Randomize left/right order per row so raters can't learn a pattern.
    const profileFirst = Math.random() < 0.5;
    const [aLabel, aOutput, bLabel, bOutput] = profileFirst
      ? ["profile", cardsToPlainText(profileResult.cards), "generic", cardsToPlainText(genericResult.cards)]
      : ["generic", cardsToPlainText(genericResult.cards), "profile", cardsToPlainText(profileResult.cards)];

    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    csvRows.push(
      [
        scenario.id,
        scenario.ageBand,
        scenario.goal,
        esc(scenario.situationText),
        aLabel,
        esc(aOutput),
        bLabel,
        esc(bOutput),
        "", // rater fills in
        "", // rater fills in
      ].join(",")
    );

    console.log(`Generated pair for ${scenario.id} (profile first: ${profileFirst})`);
  }

  writeFileSync("logs/profile-vs-generic.csv", csvRows.join("\n"));
  console.log(
    `\nWrote ${data.scenarios.length} scenario pairs to logs/profile-vs-generic.csv.\n` +
      "Note: the 'version_a_label'/'version_b_label' columns should be hidden from raters before" +
      " blind rating — they're here for scoring afterward, not for the rater to see."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
