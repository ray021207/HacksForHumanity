// Safety gate: runs before any generation. Combines a fast keyword/rule
// layer with a model classifier. Either layer saying "red" wins. A failed
// or malformed model response fails safe to "amber", never to "green".

export type RiskTier = "green" | "amber" | "red";

const TIER_SEVERITY: Record<RiskTier, number> = { green: 0, amber: 1, red: 2 };

export function maxTier(a: RiskTier, b: RiskTier): RiskTier {
  return TIER_SEVERITY[a] >= TIER_SEVERITY[b] ? a : b;
}

export interface TierResult {
  tier: RiskTier;
  reasons: string[];
}

// --- Rule layer -----------------------------------------------------------
// Deliberately broad and over-inclusive: a false positive here just hands a
// case to the (more nuanced) model classifier or to the fixed amber/red
// screens, never silently to green.

const RED_KEYWORDS = [
  "kill him",
  "kill her",
  "kill them",
  "kill myself",
  "going to hurt",
  "going to kill",
  "has a gun",
  "has a knife",
  "pulled a knife",
  "pulled a gun",
  "hit me",
  "hits me",
  "beat him",
  "beat her",
  "beats him",
  "beats her",
  "locked him in",
  "locked her in",
  "won't let him eat",
  "won't let her eat",
  "starving him",
  "starving her",
  "weapon",
  "threatened to kill",
  "suicide note",
  "he has a plan",
  "she has a plan",
  "tonight is the night",
];

const AMBER_KEYWORDS = [
  "suicide",
  "suicidal",
  "self-harm",
  "self harm",
  "cutting herself",
  "cutting himself",
  "overdose",
  "pills",
  "drugs",
  "drinking a lot",
  "drunk again",
  "alcohol",
  "won't leave his room",
  "won't leave her room",
  "stopped eating",
  "stopped talking to us",
  "hasn't left his room",
  "hasn't left her room",
  "i yelled",
  "i screamed",
  "i lost it",
  "i'm losing control",
  "losing my temper",
  "burned out",
  "burnt out",
  "can't take it anymore",
  "i'm at my breaking point",
  "i scared",
  "i scared her",
  "i scared him",
];

export function ruleLayerClassify(situationText: string): TierResult {
  const lower = situationText.toLowerCase();
  let tier: RiskTier = "green";
  const reasons: string[] = [];

  for (const kw of RED_KEYWORDS) {
    if (lower.includes(kw)) {
      tier = maxTier(tier, "red");
      reasons.push(`rule layer: red keyword match ("${kw}")`);
    }
  }
  for (const kw of AMBER_KEYWORDS) {
    if (lower.includes(kw)) {
      tier = maxTier(tier, "amber");
      reasons.push(`rule layer: amber keyword match ("${kw}")`);
    }
  }

  return { tier, reasons };
}

// --- Model classifier -------------------------------------------------------

export interface ClassifierInput {
  situationText: string;
  ageBand: string;
  setting?: string;
  goal?: string;
}

export const CLASSIFIER_SYSTEM_PROMPT = `You are a safety classifier for a parenting app. A parent describes a
situation with their teen or adult child. Classify it into exactly one risk
tier:

- "green": ordinary conflict (chores, curfew, grades, attitude, normal
  friction). No safety concern.
- "amber": self-harm talk, substance use, severe withdrawal, or the PARENT's
  own rage or burnout. Concerning, but not an active danger.
- "red": stated or implied danger to the child or to anyone (violence,
  abuse, weapons, an active plan for self-harm or harm to others).

Respond with ONLY strict JSON, no other text, in this exact shape:
{"tier": "green" | "amber" | "red", "reasons": ["short reason", ...]}

When uncertain between two tiers, choose the more severe one.`;

/** A function that sends the classifier prompt to a model and returns its raw text reply. */
export type ModelInvoker = (input: ClassifierInput) => Promise<string>;

function isValidTier(value: unknown): value is RiskTier {
  return value === "green" || value === "amber" || value === "red";
}

function parseClassifierOutput(raw: string): TierResult | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      isValidTier(parsed.tier) &&
      Array.isArray(parsed.reasons) &&
      parsed.reasons.every((r: unknown) => typeof r === "string")
    ) {
      return { tier: parsed.tier, reasons: parsed.reasons };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Runs the model classifier. On any failure (network error, non-JSON
 * response, or a response missing the required shape) this fails safe to
 * "amber" rather than throwing or defaulting to "green".
 */
export async function classifyWithModel(
  input: ClassifierInput,
  invokeModel: ModelInvoker
): Promise<TierResult> {
  try {
    const raw = await invokeModel(input);
    const parsed = parseClassifierOutput(raw);
    if (parsed) return parsed;
    return {
      tier: "amber",
      reasons: ["model classifier returned invalid JSON; failed safe to amber"],
    };
  } catch {
    return {
      tier: "amber",
      reasons: ["model classifier call failed; failed safe to amber"],
    };
  }
}

// --- Combined gate -----------------------------------------------------------

export interface SafetyGateResult extends TierResult {
  ruleTier: RiskTier;
  modelTier: RiskTier;
}

/**
 * Runs the full safety gate: rule layer first, then the model classifier.
 * If either layer says "red", the combined result is "red".
 */
export async function classifyRisk(
  input: ClassifierInput,
  invokeModel: ModelInvoker
): Promise<SafetyGateResult> {
  const rule = ruleLayerClassify(input.situationText);
  const model = await classifyWithModel(input, invokeModel);
  const tier = maxTier(rule.tier, model.tier);
  return {
    tier,
    ruleTier: rule.tier,
    modelTier: model.tier,
    reasons: [...rule.reasons, ...model.reasons],
  };
}
