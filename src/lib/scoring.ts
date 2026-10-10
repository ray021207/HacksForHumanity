// Plain TypeScript scoring for the questionnaire. No model calls happen here.
// Every function is pure and unit-testable (see src/lib/scoring.test.ts).

export type RawResponses = Record<string, number | null | undefined>;

export interface LikertItem {
  id: string;
  reverse: boolean;
  subscale?: string;
  trait?: string;
}

export interface ScaleRange {
  min: number;
  max: number;
}

export interface SubscaleResult {
  score: number | null;
  itemsAnswered: number;
  itemsTotal: number;
}

export interface BlockScoreResult {
  sufficientData: boolean;
  answeredFraction: number;
  bySubscale: Record<string, SubscaleResult>;
}

/** Reverse-keys a raw Likert value within [min, max]. */
export function reverseScore(value: number, scale: ScaleRange): number {
  return scale.min + scale.max - value;
}

/**
 * Applies reverse keying where needed and returns the "keyed" value an item
 * contributes to its subscale average. Returns null for missing/prefer-not-to-say.
 */
export function keyedItemScore(
  item: LikertItem,
  responses: RawResponses,
  scale: ScaleRange
): number | null {
  const raw = responses[item.id];
  if (raw === null || raw === undefined) return null;
  return item.reverse ? reverseScore(raw, scale) : raw;
}

/**
 * Scores a block of Likert items, grouped by subscale (or trait, for TIPI).
 * A block has "sufficient data" when at least `minAnsweredFraction` of its
 * items were answered (not "prefer not to say"), matching the 75% rule.
 */
export function scoreLikertBlock(
  items: LikertItem[],
  responses: RawResponses,
  scale: ScaleRange,
  minAnsweredFraction = 0.75
): BlockScoreResult {
  const groupKey = (item: LikertItem) => item.subscale ?? item.trait ?? "default";

  let answeredCount = 0;
  const grouped = new Map<string, number[]>();

  for (const item of items) {
    const keyed = keyedItemScore(item, responses, scale);
    const key = groupKey(item);
    if (!grouped.has(key)) grouped.set(key, []);
    if (keyed !== null) {
      answeredCount += 1;
      grouped.get(key)!.push(keyed);
    }
  }

  const answeredFraction = items.length === 0 ? 0 : answeredCount / items.length;
  const sufficientData = answeredFraction >= minAnsweredFraction;

  const bySubscale: Record<string, SubscaleResult> = {};
  const totalPerGroup = new Map<string, number>();
  for (const item of items) {
    const key = groupKey(item);
    totalPerGroup.set(key, (totalPerGroup.get(key) ?? 0) + 1);
  }

  for (const [key, values] of grouped.entries()) {
    const itemsTotal = totalPerGroup.get(key) ?? 0;
    const score =
      sufficientData && values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : null;
    bySubscale[key] = {
      score,
      itemsAnswered: values.length,
      itemsTotal,
    };
  }

  return { sufficientData, answeredFraction, bySubscale };
}

// --- Scenario (situational-judgment) items --------------------------------
//
// Each scenario item presents a short situation with a handful of response
// options. Each option carries pre-set score contributions on one or more
// subscales (e.g. an option might represent high structure + low pressure).
// This is faster for a parent to answer than a wall of Likert statements,
// at the cost of fewer data points per subscale — see README for the
// tradeoff this makes against reliability.

export interface ScenarioOption {
  id: string;
  scores: Record<string, number>; // subscale key -> contribution, same numeric range as the Likert scales (1-5)
}

export interface ScenarioItem {
  id: string;
  options: ScenarioOption[];
}

export type ScenarioResponses = Record<string, string | null | undefined>; // itemId -> selected option id

export function scoreScenarioBlock(
  items: ScenarioItem[],
  responses: ScenarioResponses,
  minAnsweredFraction = 0.75
): BlockScoreResult {
  let answeredCount = 0;
  const bySubscaleValues = new Map<string, number[]>();
  const subscaleTotals = new Map<string, number>();

  // Count how many scenarios touch each subscale at all (for itemsTotal),
  // regardless of whether this respondent answered them.
  for (const item of items) {
    const subscalesInItem = new Set<string>();
    for (const option of item.options) {
      for (const key of Object.keys(option.scores)) subscalesInItem.add(key);
    }
    for (const key of subscalesInItem) {
      subscaleTotals.set(key, (subscaleTotals.get(key) ?? 0) + 1);
    }
  }

  for (const item of items) {
    const selectedId = responses[item.id];
    if (selectedId === null || selectedId === undefined) continue;
    const option = item.options.find((o) => o.id === selectedId);
    if (!option) continue; // unknown option id, treat as unanswered
    answeredCount += 1;
    for (const [subscale, value] of Object.entries(option.scores)) {
      if (!bySubscaleValues.has(subscale)) bySubscaleValues.set(subscale, []);
      bySubscaleValues.get(subscale)!.push(value);
    }
  }

  const answeredFraction = items.length === 0 ? 0 : answeredCount / items.length;
  const sufficientData = answeredFraction >= minAnsweredFraction;

  const bySubscale: Record<string, SubscaleResult> = {};
  for (const [subscale, itemsTotal] of subscaleTotals.entries()) {
    const values = bySubscaleValues.get(subscale) ?? [];
    const score = sufficientData && values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    bySubscale[subscale] = { score, itemsAnswered: values.length, itemsTotal };
  }

  return { sufficientData, answeredFraction, bySubscale };
}

// --- TIPI ---------------------------------------------------------------

export const TIPI_SCALE: ScaleRange = { min: 1, max: 7 };

// All 5 Big Five trait names as the TIPI defines them. This app's actual
// questionnaire only includes 3 of these (see src/data/questionnaire.json,
// block "personality") — this list documents the full published
// instrument, not which subset is in use.
export const TIPI_TRAITS = [
  "extraversion",
  "agreeableness",
  "conscientiousness",
  "emotional_stability",
  "openness",
] as const;
export type TipiTrait = (typeof TIPI_TRAITS)[number];

/**
 * Scores the TIPI: reverse-scores items 2, 4, 6, 8, 10, then averages the
 * two items per trait, exactly as published.
 */
export function scoreTIPI(
  items: LikertItem[],
  responses: RawResponses,
  minAnsweredFraction = 0.75
): BlockScoreResult {
  return scoreLikertBlock(items, responses, TIPI_SCALE, minAnsweredFraction);
}

// --- Cronbach's alpha ----------------------------------------------------

function variance(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
}

/**
 * Cronbach's alpha for a set of items across respondents.
 * `itemScoresByRespondent` is an array of rows, one per respondent, each row
 * holding that respondent's keyed (reverse-applied) score on every item in
 * the scale, in the same item order. Rows with missing values should be
 * filtered out by the caller (listwise deletion) before calling this.
 *
 * alpha = (k / (k - 1)) * (1 - sum(item variances) / variance(total score))
 */
export function cronbachAlpha(itemScoresByRespondent: number[][]): number | null {
  const n = itemScoresByRespondent.length;
  if (n < 2) return null;
  const k = itemScoresByRespondent[0]?.length ?? 0;
  if (k < 2) return null;

  const itemColumns: number[][] = Array.from({ length: k }, (_, itemIdx) =>
    itemScoresByRespondent.map((row) => row[itemIdx])
  );

  const itemVariances = itemColumns.map((col) => variance(col));
  const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);

  const totalScores = itemScoresByRespondent.map((row) => row.reduce((a, b) => a + b, 0));
  const totalVariance = variance(totalScores);

  if (totalVariance === 0) return null;

  return (k / (k - 1)) * (1 - sumItemVariances / totalVariance);
}

// --- Overall profile derivation ------------------------------------------

export interface ProfileScores {
  tipi: Record<string, number | null>;
  parentingStyle: Record<string, number | null>;
  autonomyControl: Record<string, number | null>;
  emotionCoaching: Record<string, number | null>;
  confidenceLoad: Record<string, number | null>;
}

function toScoreMap(result: BlockScoreResult): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const [key, val] of Object.entries(result.bySubscale)) {
    out[key] = val.score;
  }
  return out;
}

export function buildProfile(blocks: {
  tipi: BlockScoreResult;
  parentingStyle: BlockScoreResult;
  autonomyControl: BlockScoreResult;
  emotionCoaching: BlockScoreResult;
  confidenceLoad: BlockScoreResult;
}): ProfileScores {
  return {
    tipi: toScoreMap(blocks.tipi),
    parentingStyle: toScoreMap(blocks.parentingStyle),
    autonomyControl: toScoreMap(blocks.autonomyControl),
    emotionCoaching: toScoreMap(blocks.emotionCoaching),
    confidenceLoad: toScoreMap(blocks.confidenceLoad),
  };
}
