import { describe, expect, it } from "vitest";
import {
  ruleLayerClassify,
  classifyWithModel,
  classifyRisk,
  maxTier,
  type ModelInvoker,
} from "./safety";

describe("maxTier", () => {
  it("orders green < amber < red", () => {
    expect(maxTier("green", "amber")).toBe("amber");
    expect(maxTier("amber", "red")).toBe("red");
    expect(maxTier("red", "green")).toBe("red");
    expect(maxTier("green", "green")).toBe("green");
  });
});

describe("ruleLayerClassify", () => {
  it("flags ordinary conflict as green", () => {
    const result = ruleLayerClassify("My teen left dirty dishes in her room again and we argued about curfew.");
    expect(result.tier).toBe("green");
  });

  it("flags self-harm language as amber", () => {
    const result = ruleLayerClassify("My son has been talking about suicide and I don't know what to do.");
    expect(result.tier).toBe("amber");
  });

  it("flags explicit danger as red", () => {
    const result = ruleLayerClassify("My partner hits me when he's angry and I'm scared for the kids.");
    expect(result.tier).toBe("red");
  });

  it("is case-insensitive", () => {
    const result = ruleLayerClassify("SHE HAS A GUN and said she would kill him.");
    expect(result.tier).toBe("red");
  });
});

describe("classifyWithModel", () => {
  it("returns the model's tier on a well-formed response", async () => {
    const invoker: ModelInvoker = async () =>
      JSON.stringify({ tier: "amber", reasons: ["mentions withdrawal"] });
    const result = await classifyWithModel(
      { situationText: "x", ageBand: "16-17" },
      invoker
    );
    expect(result.tier).toBe("amber");
  });

  it("fails safe to amber on invalid JSON", async () => {
    const invoker: ModelInvoker = async () => "not json at all";
    const result = await classifyWithModel(
      { situationText: "x", ageBand: "16-17" },
      invoker
    );
    expect(result.tier).toBe("amber");
  });

  it("fails safe to amber on a missing/invalid tier field", async () => {
    const invoker: ModelInvoker = async () => JSON.stringify({ tier: "purple", reasons: [] });
    const result = await classifyWithModel(
      { situationText: "x", ageBand: "16-17" },
      invoker
    );
    expect(result.tier).toBe("amber");
  });

  it("fails safe to amber when the model call throws", async () => {
    const invoker: ModelInvoker = async () => {
      throw new Error("network error");
    };
    const result = await classifyWithModel(
      { situationText: "x", ageBand: "16-17" },
      invoker
    );
    expect(result.tier).toBe("amber");
  });

  it("never fails to green", async () => {
    const invokers: ModelInvoker[] = [
      async () => "{}",
      async () => "null",
      async () => {
        throw new Error("boom");
      },
    ];
    for (const invoker of invokers) {
      const result = await classifyWithModel(
        { situationText: "x", ageBand: "16-17" },
        invoker
      );
      expect(result.tier).not.toBe("green");
    }
  });
});

describe("classifyRisk (combined gate)", () => {
  it("takes the more severe of rule layer and model classifier", async () => {
    // Rule layer sees green, model says red -> red wins.
    const modelSaysRed: ModelInvoker = async () =>
      JSON.stringify({ tier: "red", reasons: ["implied danger"] });
    const result = await classifyRisk(
      { situationText: "We had a disagreement about screen time.", ageBand: "13-15" },
      modelSaysRed
    );
    expect(result.tier).toBe("red");
    expect(result.ruleTier).toBe("green");
    expect(result.modelTier).toBe("red");
  });

  it("red from the rule layer wins even if the model says green", async () => {
    const modelSaysGreen: ModelInvoker = async () =>
      JSON.stringify({ tier: "green", reasons: [] });
    const result = await classifyRisk(
      { situationText: "He has a gun and said he would kill him.", ageBand: "16-17" },
      modelSaysGreen
    );
    expect(result.tier).toBe("red");
  });

  it("combines reasons from both layers", async () => {
    const invoker: ModelInvoker = async () =>
      JSON.stringify({ tier: "amber", reasons: ["parent describes exhaustion"] });
    const result = await classifyRisk(
      { situationText: "I yelled at her again and feel burned out.", ageBand: "13-15" },
      invoker
    );
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.tier).toBe("amber");
  });
});
