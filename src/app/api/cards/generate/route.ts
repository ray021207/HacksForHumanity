import { NextRequest, NextResponse } from "next/server";

// Safety classification + generation are two sequential model calls, plus a
// possible retry on an invalid first attempt — comfortably over Vercel's
// default serverless timeout (10s on Hobby) under real-world latency.
export const maxDuration = 60;
import { classifyRisk } from "@/lib/safety";
import { generateCards, type AgeBand, type Goal, type Refinement } from "@/lib/generation";
import type { ProfileScores } from "@/lib/scoring";
import type { RelationshipType } from "@/lib/appState";
import { createClassifierInvoker, createGenerationInvoker } from "@/lib/anthropic-client";
import { appendLog } from "@/lib/logging";
import { RED_TIER_CONTENT, AMBER_TIER_CONTENT, DISCLOSURE_LINE } from "@/data/safety-content";

export interface GenerateRequestBody {
  profile: ProfileScores;
  ageBand: AgeBand;
  relationshipType: RelationshipType;
  relationshipTypeOther?: string;
  situationText: string;
  goal: Goal;
  refinement?: Refinement;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  let body: GenerateRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.situationText || !body?.ageBand || !body?.goal || !body?.profile || !body?.relationshipType) {
    return NextResponse.json(
      { error: "situationText, ageBand, relationshipType, goal and profile are required" },
      { status: 400 }
    );
  }

  // 1. Safety gate runs before any generation.
  const gate = await classifyRisk(
    { situationText: body.situationText, ageBand: body.ageBand },
    createClassifierInvoker()
  );

  await appendLog({
    type: "safety_gate",
    tier: gate.tier,
    ruleTier: gate.ruleTier,
    modelTier: gate.modelTier,
  });

  if (gate.tier === "red") {
    // No generated text at all. Fixed content only.
    return NextResponse.json({
      risk_tier: "red",
      disclosure: DISCLOSURE_LINE,
      fixed_content: RED_TIER_CONTENT,
    });
  }

  // 2. Generation + validator (green or amber only).
  const result = await generateCards(
    {
      profile: body.profile,
      ageBand: body.ageBand,
      relationshipType: body.relationshipType,
      relationshipTypeOther: body.relationshipTypeOther,
      situationText: body.situationText,
      goal: body.goal,
      riskTier: gate.tier,
      refinement: body.refinement,
    },
    createGenerationInvoker()
  );

  await appendLog({
    type: "generation",
    tier: gate.tier,
    lintPass: !result.usedFallback,
    usedFallback: result.usedFallback,
    attempts: result.attempts,
    completionMs: Date.now() - startedAt,
  });

  return NextResponse.json({
    ...result.cards,
    disclosure: DISCLOSURE_LINE,
    fixed_content: gate.tier === "amber" ? AMBER_TIER_CONTENT : null,
    used_fallback: result.usedFallback,
  });
}
