import { describe, expect, it } from "vitest";
import {
  validateSchema,
  lintBannedPatterns,
  generateCards,
  fallbackCard,
  scoresToTendencyLines,
  type CardsOutput,
  type ModelInvoker,
} from "./generation";
import type { ProfileScores } from "./scoring";

function validCards(overrides: Partial<CardsOutput> = {}): CardsOutput {
  return {
    risk_tier: "green",
    frame: "Sounds like curfew is the sticking point tonight.",
    before_you_start: "Take a breath before you start; you don't have to resolve this in one talk.",
    starters: [
      { text: "What time feels fair to you, and why?", technique: "open_question", why: "Invites their reasoning first.", avoid: "Don't open with the rule." },
      { text: "I hear that this feels unfair to you.", technique: "validation", why: "Names the feeling before the facts.", avoid: "Don't minimize it." },
      { text: "Let's figure out a curfew that works for both of us.", technique: "autonomy_offer", why: "Signals shared ownership.", avoid: "Don't dictate the outcome." },
    ],
    setting_tip: "After dinner, when neither of you is rushing out the door.",
    ...overrides,
  };
}

describe("validateSchema", () => {
  it("accepts a well-formed response", () => {
    const result = validateSchema(validCards());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects fewer than 3 starters", () => {
    const cards = validCards({ starters: validCards().starters.slice(0, 2) });
    const result = validateSchema(cards);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("3 to 5"))).toBe(true);
  });

  it("rejects an invalid technique", () => {
    const cards = validCards();
    (cards.starters[0] as any).technique = "guilt_trip";
    const result = validateSchema(cards);
    expect(result.valid).toBe(false);
  });

  it("rejects a missing risk_tier", () => {
    const cards: any = validCards();
    delete cards.risk_tier;
    const result = validateSchema(cards);
    expect(result.valid).toBe(false);
  });
});

describe("lintBannedPatterns", () => {
  it("passes clean content", () => {
    expect(lintBannedPatterns(validCards())).toEqual([]);
  });

  it("flags a command", () => {
    const cards = validCards({ frame: "You must stop doing this right now." });
    const issues = lintBannedPatterns(cards);
    expect(issues.some((i) => i.category === "command")).toBe(true);
  });

  it("flags a threat", () => {
    const cards = validCards();
    cards.starters[0].text = "Clean your room or else you'll lose your phone.";
    const issues = lintBannedPatterns(cards);
    expect(issues.some((i) => i.category === "threat")).toBe(true);
  });

  it("flags guilt induction", () => {
    const cards = validCards({ before_you_start: "After everything I've done for you, you never appreciate it." });
    const issues = lintBannedPatterns(cards);
    expect(issues.some((i) => i.category === "guilt")).toBe(true);
  });

  it("flags withdrawal of affection", () => {
    const cards = validCards();
    cards.starters[1].why = "I am done talking to you until you apologize.";
    const issues = lintBannedPatterns(cards);
    expect(issues.some((i) => i.category === "withdrawal_of_affection")).toBe(true);
  });

  it("flags a diagnosis/label in content the parent would actually say", () => {
    const cards = validCards();
    cards.starters[2].why = "This works because you're being manipulative is clear to them.";
    const issues = lintBannedPatterns(cards);
    expect(issues.some((i) => i.category === "diagnosis")).toBe(true);
  });

  it("does not lint the 'avoid' field, since its purpose is to name the bad phrase", () => {
    // The avoid field's whole job is to show the parent what NOT to say, so
    // it legitimately contains command/threat/guilt-shaped example text.
    const cards = validCards();
    cards.starters[0].avoid = "Don't say 'you need to stop this right now or else'.";
    const issues = lintBannedPatterns(cards);
    expect(issues).toEqual([]);
  });

  it("does not flag benign predictive 'you will' phrasing as a command", () => {
    const cards = validCards({ before_you_start: "You will probably feel nervous, and that's okay." });
    const issues = lintBannedPatterns(cards);
    expect(issues).toEqual([]);
  });
});

describe("scoresToTendencyLines", () => {
  it("never includes a type label", () => {
    const profile: ProfileScores = {
      tipi: {},
      parentingStyle: { warmth: 2, structure: 4.5, pressure: 4 },
      autonomyControl: { autonomy_support: 2 },
      emotionCoaching: { emotion_coaching: 4 },
      confidenceLoad: { confidence: 2 },
    };
    const lines = scoresToTendencyLines(profile);
    const joined = lines.join(" ").toLowerCase();
    expect(joined).not.toContain("authoritarian");
    expect(joined).not.toContain("permissive");
    expect(joined).not.toContain("authoritative");
    expect(lines.length).toBeGreaterThan(0);
  });

  it("leads with reassurance language when confidence is low", () => {
    const profile: ProfileScores = {
      tipi: {},
      parentingStyle: {},
      autonomyControl: {},
      emotionCoaching: {},
      confidenceLoad: { confidence: 1.5 },
    };
    const lines = scoresToTendencyLines(profile);
    expect(lines.some((l) => l.toLowerCase().includes("reassurance"))).toBe(true);
  });
});

const baseInput = {
  profile: {
    tipi: {},
    parentingStyle: { warmth: 4, structure: 3 },
    autonomyControl: { autonomy_support: 3 },
    emotionCoaching: { emotion_coaching: 3 },
    confidenceLoad: { confidence: 4 },
  } as ProfileScores,
  ageBand: "16-17" as const,
  situationText: "We argued about curfew tonight.",
  goal: "set_a_limit" as const,
  riskTier: "green" as const,
};

describe("generateCards (validator-gated)", () => {
  it("returns the model's cards when valid on the first try", async () => {
    const invoker: ModelInvoker = async () => JSON.stringify(validCards());
    const result = await generateCards(baseInput, invoker);
    expect(result.usedFallback).toBe(false);
    expect(result.attempts).toBe(1);
  });

  it("retries once on an invalid response, then succeeds", async () => {
    let calls = 0;
    const invoker: ModelInvoker = async () => {
      calls += 1;
      if (calls === 1) return JSON.stringify({ not: "valid" });
      return JSON.stringify(validCards());
    };
    const result = await generateCards(baseInput, invoker);
    expect(result.usedFallback).toBe(false);
    expect(result.attempts).toBe(2);
    expect(calls).toBe(2);
  });

  it("falls back to the fixed card after two failed attempts", async () => {
    const invoker: ModelInvoker = async () => "not json";
    const result = await generateCards(baseInput, invoker);
    expect(result.usedFallback).toBe(true);
    expect(result.cards.starters.length).toBeGreaterThanOrEqual(3);
    expect(result.cards.starters.length).toBeLessThanOrEqual(5);
  });

  it("falls back when the model's output fails the banned-pattern lint twice", async () => {
    const invoker: ModelInvoker = async () =>
      JSON.stringify(validCards({ frame: "You must apologize right now." }));
    const result = await generateCards(baseInput, invoker);
    expect(result.usedFallback).toBe(true);
    expect(result.lastErrors.some((e) => e.includes("command"))).toBe(true);
  });
});

describe("fallbackCard", () => {
  it("is itself schema-valid and lint-clean", () => {
    const card = fallbackCard("green");
    expect(validateSchema(card).valid).toBe(true);
    expect(lintBannedPatterns(card)).toEqual([]);
  });
});
