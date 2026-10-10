import { describe, expect, it } from "vitest";
import {
  reverseScore,
  scoreLikertBlock,
  scoreScenarioBlock,
  scoreTIPI,
  cronbachAlpha,
  TIPI_SCALE,
  type LikertItem,
  type ScenarioItem,
} from "./scoring";
import questionnaire from "@/data/questionnaire.json";

describe("reverseScore", () => {
  it("reverses a 7-point value", () => {
    expect(reverseScore(2, TIPI_SCALE)).toBe(6);
    expect(reverseScore(1, TIPI_SCALE)).toBe(7);
    expect(reverseScore(7, TIPI_SCALE)).toBe(1);
  });

  it("reverses a 5-point value", () => {
    expect(reverseScore(1, { min: 1, max: 5 })).toBe(5);
    expect(reverseScore(3, { min: 1, max: 5 })).toBe(3);
  });
});

describe("TIPI scoring (hand-checkable)", () => {
  it("scores Extraversion as (5 + 6) / 2 = 5.5 for raw items 5 and 2", () => {
    // tipi_1 is Extraversion, not reversed. tipi_6 is Extraversion, reversed.
    const items: LikertItem[] = [
      { id: "tipi_1", trait: "extraversion", reverse: false },
      { id: "tipi_6", trait: "extraversion", reverse: true },
    ];
    const responses = { tipi_1: 5, tipi_6: 2 };
    const result = scoreTIPI(items, responses);
    expect(result.bySubscale.extraversion.score).toBeCloseTo(5.5, 5);
  });

  it("scores every trait present in the questionnaire's TIPI block (a trimmed subset, by design)", () => {
    const personalityBlock = (questionnaire.blocks as any[]).find(
      (b) => b.id === "personality"
    );
    const items: LikertItem[] = personalityBlock.items.map((i: any) => ({
      id: i.id,
      trait: i.trait,
      reverse: i.reverse,
    }));

    // Every included trait keeps both its items (regular + reverse-keyed),
    // so reverse-scoring still works for whichever traits survived the trim.
    const traitsPresent = new Set(items.map((i) => i.trait));
    for (const trait of traitsPresent) {
      const itemsForTrait = items.filter((i) => i.trait === trait);
      expect(itemsForTrait.length).toBe(2);
      expect(itemsForTrait.some((i) => i.reverse)).toBe(true);
      expect(itemsForTrait.some((i) => !i.reverse)).toBe(true);
    }

    // Answer everything with a 4 (midpoint) except tipi_1=5, tipi_6=2 as above.
    const responses: Record<string, number> = {};
    for (const item of items) responses[item.id] = 4;
    responses["tipi_1"] = 5;
    responses["tipi_6"] = 2;

    const result = scoreTIPI(items, responses);
    expect(result.sufficientData).toBe(true);
    expect(result.bySubscale.extraversion.score).toBeCloseTo(5.5, 5);
    // Every other included trait only has midpoint (4) answers -> reverse(4) = 4 too.
    for (const trait of traitsPresent) {
      if (!trait || trait === "extraversion") continue;
      expect(result.bySubscale[trait].score).toBeCloseTo(4, 5);
    }
  });

  it("marks insufficient data below the 75% answered threshold", () => {
    const items: LikertItem[] = [
      { id: "a", trait: "t1", reverse: false },
      { id: "b", trait: "t1", reverse: false },
      { id: "c", trait: "t2", reverse: false },
      { id: "d", trait: "t2", reverse: false },
    ];
    // Only 1 of 4 answered (25%), below the 75% bar.
    const responses = { a: 5, b: null, c: null, d: null };
    const result = scoreTIPI(items, responses);
    expect(result.sufficientData).toBe(false);
    expect(result.bySubscale.t1.score).toBeNull();
  });
});

describe("scoreLikertBlock on a 5-point frequency scale", () => {
  const scale = { min: 1, max: 5 };

  it("reverse-keys negatively worded items before averaging", () => {
    const items: LikertItem[] = [
      { id: "i1", subscale: "structure", reverse: false },
      { id: "i2", subscale: "structure", reverse: true },
    ];
    // i1 = 4 (often), i2 = 1 ("never let a rule slide" -> reversed = 5)
    const responses = { i1: 4, i2: 1 };
    const result = scoreLikertBlock(items, responses, scale);
    expect(result.bySubscale.structure.score).toBeCloseTo((4 + 5) / 2, 5);
  });

  it("requires at least 75% of the block answered", () => {
    const items: LikertItem[] = Array.from({ length: 8 }, (_, idx) => ({
      id: `q${idx}`,
      subscale: "s",
      reverse: false,
    }));
    const responses: Record<string, number | null> = {};
    items.forEach((item, idx) => {
      responses[item.id] = idx < 6 ? 3 : null; // 6/8 = 75% exactly
    });
    const result = scoreLikertBlock(items, responses, scale, 0.75);
    expect(result.sufficientData).toBe(true);

    responses["q5"] = null; // now 5/8 = 62.5%, below threshold
    const result2 = scoreLikertBlock(items, responses, scale, 0.75);
    expect(result2.sufficientData).toBe(false);
    expect(result2.bySubscale.s.score).toBeNull();
  });

  it("treats 'prefer not to say' (null) as unanswered, not zero", () => {
    const items: LikertItem[] = [
      { id: "i1", subscale: "s", reverse: false },
      { id: "i2", subscale: "s", reverse: false },
      { id: "i3", subscale: "s", reverse: false },
      { id: "i4", subscale: "s", reverse: false },
    ];
    const responses = { i1: 5, i2: 5, i3: 5, i4: null };
    const result = scoreLikertBlock(items, responses, scale, 0.75);
    // 3/4 = 75%, sufficient; average of the three 5s is 5, not polluted by a 0.
    expect(result.sufficientData).toBe(true);
    expect(result.bySubscale.s.score).toBe(5);
  });
});

describe("scoreScenarioBlock", () => {
  const items: ScenarioItem[] = [
    {
      id: "sc_1",
      options: [
        { id: "a", scores: { structure: 5, pressure: 2 } },
        { id: "b", scores: { structure: 1, pressure: 1 } },
      ],
    },
    {
      id: "sc_2",
      options: [
        { id: "a", scores: { warmth: 5, pressure: 2 } },
        { id: "b", scores: { warmth: 1, pressure: 4 } },
      ],
    },
    {
      id: "sc_3",
      options: [
        { id: "a", scores: { structure: 3, autonomy_support: 4 } },
        { id: "b", scores: { structure: 1, autonomy_support: 1 } },
      ],
    },
    {
      id: "sc_4",
      options: [{ id: "a", scores: { autonomy_support: 5 } }],
    },
  ];

  it("averages subscale contributions from the selected options only", () => {
    const responses = { sc_1: "a", sc_2: "b", sc_3: "a", sc_4: "a" };
    const result = scoreScenarioBlock(items, responses);
    expect(result.sufficientData).toBe(true);
    expect(result.bySubscale.structure.score).toBeCloseTo((5 + 3) / 2, 5);
    expect(result.bySubscale.pressure.score).toBeCloseTo((2 + 4) / 2, 5);
    expect(result.bySubscale.warmth.score).toBeCloseTo(1, 5);
    expect(result.bySubscale.autonomy_support.score).toBeCloseTo((4 + 5) / 2, 5);
  });

  it("treats an unanswered (null) scenario as missing, not as a score of 0", () => {
    const responses = { sc_1: "a", sc_2: null, sc_3: "a", sc_4: "a" };
    const result = scoreScenarioBlock(items, responses, 0.5);
    expect(result.sufficientData).toBe(true); // 3/4 answered
    expect(result.bySubscale.warmth.itemsAnswered).toBe(0);
    expect(result.bySubscale.warmth.score).toBeNull();
    expect(result.bySubscale.structure.score).toBeCloseTo((5 + 3) / 2, 5);
  });

  it("requires the minimum answered fraction across the whole block", () => {
    const responses = { sc_1: "a" }; // 1/4 = 25%
    const result = scoreScenarioBlock(items, responses, 0.75);
    expect(result.sufficientData).toBe(false);
    expect(result.bySubscale.structure.score).toBeNull();
  });
});

describe("cronbachAlpha", () => {
  it("returns a high alpha for highly consistent respondents", () => {
    // 5 respondents, 4 items, near-identical responses per respondent.
    const data = [
      [5, 5, 4, 5],
      [4, 4, 4, 5],
      [1, 2, 1, 1],
      [2, 2, 2, 1],
      [5, 4, 5, 5],
    ];
    const alpha = cronbachAlpha(data);
    expect(alpha).not.toBeNull();
    expect(alpha as number).toBeGreaterThan(0.7);
  });

  it("returns a low alpha for random/inconsistent responses", () => {
    const data = [
      [5, 1, 3, 2],
      [1, 5, 2, 4],
      [3, 2, 5, 1],
      [2, 4, 1, 5],
      [4, 3, 4, 3],
    ];
    const alpha = cronbachAlpha(data);
    expect(alpha).not.toBeNull();
    expect(alpha as number).toBeLessThan(0.5);
  });

  it("returns null with fewer than 2 respondents or fewer than 2 items", () => {
    expect(cronbachAlpha([[1, 2, 3]])).toBeNull();
    expect(cronbachAlpha([[1], [2]])).toBeNull();
  });
});
