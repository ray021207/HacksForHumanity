// CLI: scores a CSV of questionnaire responses and prints scale scores and
// Cronbach's alpha per block.
//
// Usage:
//   npm run score:csv -- path/to/responses.csv
//
// CSV shape: one row per respondent, one column per item id (matching the
// ids in src/data/questionnaire.json). For Likert items (the "personality"/
// TIPI block), cells are raw integers or empty for "prefer not to say". For
// scenario items (the "scenarios" block), cells hold the selected option id
// (e.g. "a", "b", "c", "d") or empty for "prefer not to say".

import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import questionnaire from "../src/data/questionnaire.json";
import {
  scoreLikertBlock,
  scoreScenarioBlock,
  cronbachAlpha,
  type LikertItem,
  type ScenarioItem,
  type ScaleRange,
} from "../src/lib/scoring";

function scoreLikertBlockDef(block: any, rows: Record<string, string>[], scale: ScaleRange) {
  const items: LikertItem[] = block.items.map((i: any) => ({
    id: i.id,
    reverse: Boolean(i.reverse),
    subscale: i.subscale,
    trait: i.trait,
  }));

  const perRespondentSubscales: Record<string, Record<string, number | null>> = {};
  rows.forEach((row, idx) => {
    const responses: Record<string, number | null> = {};
    for (const item of items) {
      const cell = row[item.id];
      responses[item.id] = cell === undefined || cell === "" ? null : Number(cell);
    }
    const result = scoreLikertBlock(items, responses, scale, questionnaire.minAnsweredFractionPerBlock);
    for (const [subscale, val] of Object.entries(result.bySubscale)) {
      if (!perRespondentSubscales[subscale]) perRespondentSubscales[subscale] = {};
      perRespondentSubscales[subscale][String(idx)] = val.score;
    }
  });

  for (const [subscale, byRespondent] of Object.entries(perRespondentSubscales)) {
    const scores = Object.values(byRespondent).filter((v): v is number => v !== null);
    const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    console.log(`  ${subscale}: mean=${mean?.toFixed(2) ?? "n/a"} (n=${scores.length}/${rows.length})`);
  }

  const subscaleGroups = new Map<string, LikertItem[]>();
  for (const item of items) {
    const key = item.subscale ?? item.trait ?? "default";
    if (!subscaleGroups.has(key)) subscaleGroups.set(key, []);
    subscaleGroups.get(key)!.push(item);
  }

  for (const [subscale, subItems] of subscaleGroups.entries()) {
    const matrix: number[][] = [];
    for (const row of rows) {
      const rowValues: number[] = [];
      let complete = true;
      for (const item of subItems) {
        const cell = row[item.id];
        if (cell === undefined || cell === "") {
          complete = false;
          break;
        }
        const raw = Number(cell);
        rowValues.push(item.reverse ? scale.min + scale.max - raw : raw);
      }
      if (complete) matrix.push(rowValues);
    }
    const alpha = cronbachAlpha(matrix);
    console.log(
      `  alpha(${subscale}) = ${alpha !== null ? alpha.toFixed(3) : "n/a"} (n=${matrix.length} complete rows, k=${subItems.length} items)`
    );
  }
}

function scoreScenarioBlockDef(block: any, rows: Record<string, string>[]) {
  const items: ScenarioItem[] = block.items.map((i: any) => ({
    id: i.id,
    options: i.options.map((o: any) => ({ id: o.id, scores: o.scores })),
  }));

  const perRespondentSubscales: Record<string, Record<string, number | null>> = {};
  rows.forEach((row, idx) => {
    const responses: Record<string, string | null> = {};
    for (const item of items) {
      const cell = row[item.id];
      responses[item.id] = cell === undefined || cell === "" ? null : cell;
    }
    const result = scoreScenarioBlock(items, responses, questionnaire.minAnsweredFractionPerBlock);
    for (const [subscale, val] of Object.entries(result.bySubscale)) {
      if (!perRespondentSubscales[subscale]) perRespondentSubscales[subscale] = {};
      perRespondentSubscales[subscale][String(idx)] = val.score;
    }
  });

  for (const [subscale, byRespondent] of Object.entries(perRespondentSubscales)) {
    const scores = Object.values(byRespondent).filter((v): v is number => v !== null);
    const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    console.log(`  ${subscale}: mean=${mean?.toFixed(2) ?? "n/a"} (n=${scores.length}/${rows.length})`);
  }

  // Alpha per subscale: use the scenarios that touch this subscale as
  // "items", and each respondent's chosen option's score on that subscale
  // as the keyed value. Only rows that answered every contributing
  // scenario are included (listwise deletion), same as the Likert path.
  const subscaleToItems = new Map<string, ScenarioItem[]>();
  for (const item of items) {
    const subscalesInItem = new Set<string>();
    for (const opt of item.options) for (const k of Object.keys(opt.scores)) subscalesInItem.add(k);
    for (const key of subscalesInItem) {
      if (!subscaleToItems.has(key)) subscaleToItems.set(key, []);
      subscaleToItems.get(key)!.push(item);
    }
  }

  for (const [subscale, subItems] of subscaleToItems.entries()) {
    const matrix: number[][] = [];
    for (const row of rows) {
      const rowValues: number[] = [];
      let complete = true;
      for (const item of subItems) {
        const selectedId = row[item.id];
        const option = item.options.find((o) => o.id === selectedId);
        if (!option || option.scores[subscale] === undefined) {
          complete = false;
          break;
        }
        rowValues.push(option.scores[subscale]);
      }
      if (complete) matrix.push(rowValues);
    }
    const alpha = cronbachAlpha(matrix);
    console.log(
      `  alpha(${subscale}) = ${alpha !== null ? alpha.toFixed(3) : "n/a"} (n=${matrix.length} complete rows, k=${subItems.length} scenarios touching this subscale)`
    );
  }
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npm run score:csv -- path/to/responses.csv");
    process.exit(1);
  }

  const raw = readFileSync(csvPath, "utf-8");
  const rows: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
  });

  const scales: Record<string, ScaleRange> = Object.fromEntries(
    Object.entries(questionnaire.scales as any).map(([k, v]: [string, any]) => [k, { min: v.min, max: v.max }])
  );

  const scorableBlocks = (questionnaire.blocks as any[]).filter(
    (b) => b.type === "likert" || b.type === "scenario"
  );

  console.log(`Scored ${rows.length} respondent(s) across ${scorableBlocks.length} block(s).\n`);

  for (const block of scorableBlocks) {
    console.log(`=== Block: ${block.title} (${block.id}) ===`);
    if (block.type === "likert") {
      scoreLikertBlockDef(block, rows, scales[block.scale]);
    } else {
      scoreScenarioBlockDef(block, rows);
    }
    console.log("");
  }
}

main();
