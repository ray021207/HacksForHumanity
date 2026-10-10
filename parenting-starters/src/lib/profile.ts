// Builds the profile from raw questionnaire responses using the plain
// scoring code in scoring.ts, and turns it into strengths-first,
// label-free copy for the profile screen.

import questionnaire from "@/data/questionnaire.json";
import {
  scoreLikertBlock,
  scoreScenarioBlock,
  type LikertItem,
  type ScenarioItem,
  type RawResponses,
  type ScenarioResponses,
  type ScaleRange,
  type ProfileScores,
} from "./scoring";

export type MixedResponses = Record<string, number | string | null | undefined>;

function blockById(id: string) {
  return (questionnaire.blocks as any[]).find((b) => b.id === id);
}

function scaleOf(scaleId: string): ScaleRange {
  const s = (questionnaire.scales as any)[scaleId];
  return { min: s.min, max: s.max };
}

function toLikertItems(items: any[], traitKey: "trait" | "subscale"): LikertItem[] {
  return items.map((i: any) => ({
    id: i.id,
    reverse: Boolean(i.reverse),
    [traitKey]: i[traitKey],
  }));
}

function toScenarioItems(items: any[]): ScenarioItem[] {
  return items.map((i: any) => ({
    id: i.id,
    options: i.options.map((o: any) => ({ id: o.id, scores: o.scores })),
  }));
}

export function computeProfile(responses: MixedResponses): ProfileScores {
  const personality = blockById("personality");
  const scenarios = blockById("scenarios");

  const minFraction = questionnaire.minAnsweredFractionPerBlock;

  const tipiResult = scoreLikertBlock(
    toLikertItems(personality.items, "trait"),
    responses as RawResponses,
    scaleOf(personality.scale),
    minFraction
  );

  const scenarioResult = scoreScenarioBlock(
    toScenarioItems(scenarios.items),
    responses as ScenarioResponses,
    minFraction
  );

  const toMap = (r: typeof tipiResult) =>
    Object.fromEntries(Object.entries(r.bySubscale).map(([k, v]) => [k, v.score]));

  const scenarioScores = toMap(scenarioResult);

  return {
    tipi: toMap(tipiResult),
    parentingStyle: {
      warmth: scenarioScores.warmth ?? null,
      structure: scenarioScores.structure ?? null,
      pressure: scenarioScores.pressure ?? null,
    },
    autonomyControl: {
      autonomy_support: scenarioScores.autonomy_support ?? null,
    },
    emotionCoaching: {
      emotion_coaching: scenarioScores.emotion_coaching ?? null,
    },
    confidenceLoad: {
      confidence: scenarioScores.confidence ?? null,
    },
  };
}

export interface ProfileDisplay {
  strengths: string[];
  stretches: string[];
}

interface Candidate {
  key: string;
  score: number;
  strength: string;
  stretch: string;
}

/**
 * Strengths-first, plain-language summary for the profile screen. Never
 * returns a type label (e.g. "authoritarian", "permissive"). Kept brief by
 * design: at most 2 strengths (the dimensions you scored highest on) and
 * 2-3 stretches (the dimensions with the most room, lowest-scoring first).
 */
export function describeProfile(profile: ProfileScores): ProfileDisplay {
  const { parentingStyle: ps, autonomyControl: ac, emotionCoaching: ec, confidenceLoad: cl } = profile;

  const candidates: Candidate[] = [];
  if (typeof ps.warmth === "number") {
    candidates.push({
      key: "warmth",
      score: ps.warmth,
      strength: "You make a point of connecting with warmth, not just addressing problems.",
      stretch: "A small moment of connection before addressing an issue could lower the temperature of hard conversations.",
    });
  }
  if (typeof ps.structure === "number") {
    candidates.push({
      key: "structure",
      score: ps.structure,
      strength: "You tend to follow through on what you say, which builds trust over time.",
      stretch: "Setting one clear, consistent expectation — and sticking with it — could make a bigger difference than a new rule.",
    });
  }
  if (typeof ac.autonomy_support === "number") {
    candidates.push({
      key: "autonomy_support",
      score: ac.autonomy_support,
      strength: "You tend to ask for input and offer choices rather than just directing.",
      stretch: "Offering a small choice before you decide something for them could open up the conversation.",
    });
  }
  if (typeof ec.emotion_coaching === "number") {
    candidates.push({
      key: "emotion_coaching",
      score: ec.emotion_coaching,
      strength: "You tend to name feelings before jumping to a fix, which helps things land.",
      stretch: "Naming what you think they might be feeling, before offering a solution, could help a conversation land better.",
    });
  }
  if (typeof cl.confidence === "number") {
    candidates.push({
      key: "confidence",
      score: cl.confidence,
      strength: "You generally feel steady heading into a hard conversation.",
      stretch: "You're often harder on yourself after a hard conversation than the moment deserves. That's worth noticing.",
    });
  }

  // Top 2 scores become strengths; the lowest-scoring 2-3 (excluding
  // whichever already became a strength) become stretches.
  const byScoreDesc = [...candidates].sort((a, b) => b.score - a.score);
  const strengthKeys = new Set(byScoreDesc.slice(0, 2).map((c) => c.key));
  const strengths = byScoreDesc.slice(0, 2).map((c) => c.strength);

  const stretches = [...candidates]
    .filter((c) => !strengthKeys.has(c.key))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((c) => c.stretch);

  if (strengths.length === 0) {
    strengths.push("You showed up to think this through before a hard conversation, which already puts you ahead.");
  }
  if (stretches.length === 0) {
    stretches.push("Keep noticing what works; you can always come back and retake this later.");
  }

  return { strengths, stretches };
}
