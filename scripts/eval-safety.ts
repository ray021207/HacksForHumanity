// Runs the safety gate (rule layer + model classifier) against
// tests/safety-set.json and reports red-tier recall and the overall
// false-positive rate.
//
// Requires ANTHROPIC_API_KEY in .env.local (the model classifier layer
// makes one call per case). Without it, this exits with an explanation
// rather than reporting misleading numbers.
//
// Usage: npm run safety:eval

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { classifyRisk, type RiskTier } from "../src/lib/safety";
import { createClassifierInvoker, getAnthropicClient, getModelName } from "../src/lib/anthropic-client";

interface SafetyCase {
  id: string;
  tier: RiskTier;
  ageBand: string;
  situationText: string;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set in .env.local. The model classifier layer needs it.\n" +
        "Set it and re-run `npm run safety:eval`."
    );
    process.exit(1);
  }

  const raw = readFileSync("tests/safety-set.json", "utf-8");
  const data = JSON.parse(raw) as { cases: SafetyCase[]; _status: string };
  console.log(`Safety set status: "${data._status}"`);
  console.log(`Evaluating ${data.cases.length} labelled cases against model "${getModelName()}"...\n`);

  const invoker = createClassifierInvoker(getAnthropicClient(), getModelName());

  let truePositiveRed = 0; // labelled red, predicted red
  let falseNegativeRed = 0; // labelled red, predicted NOT red (a miss -> the dangerous direction)
  let totalRed = 0;

  let falsePositives = 0; // predicted tier MORE severe than labelled (green->amber/red, amber->red)
  let totalCases = 0;

  const severity: Record<RiskTier, number> = { green: 0, amber: 1, red: 2 };
  const rows: { id: string; labelled: RiskTier; predicted: RiskTier; match: boolean }[] = [];

  for (const testCase of data.cases) {
    totalCases += 1;
    const result = await classifyRisk(
      { situationText: testCase.situationText, ageBand: testCase.ageBand },
      invoker
    );
    const predicted = result.tier;
    const match = predicted === testCase.tier;
    rows.push({ id: testCase.id, labelled: testCase.tier, predicted, match });

    if (testCase.tier === "red") {
      totalRed += 1;
      if (predicted === "red") truePositiveRed += 1;
      else falseNegativeRed += 1;
    }

    if (severity[predicted] > severity[testCase.tier]) {
      falsePositives += 1;
    }
  }

  for (const row of rows) {
    const flag = row.match ? "OK " : "DIFF";
    console.log(`  [${flag}] ${row.id}: labelled=${row.labelled} predicted=${row.predicted}`);
  }

  const redRecall = totalRed > 0 ? truePositiveRed / totalRed : null;
  const falsePositiveRate = totalCases > 0 ? falsePositives / totalCases : null;

  console.log("\n=== Results ===");
  console.log(`Red-tier recall: ${redRecall !== null ? (redRecall * 100).toFixed(1) + "%" : "n/a"} (${truePositiveRed}/${totalRed} red cases correctly flagged red)`);
  console.log(
    `False-positive rate (predicted tier more severe than labelled): ${
      falsePositiveRate !== null ? (falsePositiveRate * 100).toFixed(1) + "%" : "n/a"
    } (${falsePositives}/${totalCases})`
  );

  if (falseNegativeRed > 0) {
    console.warn(
      `\nWARNING: ${falseNegativeRed} red-tier case(s) were NOT flagged red. Review before shipping.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
