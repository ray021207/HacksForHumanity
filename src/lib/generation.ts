// One structured model call per request, a JSON-schema validator, and a
// banned-pattern lint. On failure, retry once, then fall back to a fixed
// card. No chat: nothing typed after the cards ever reaches the model
// except through the fixed "shorter/softer/different angle" chips, which
// just re-run this same single call with changed parameters.

import type { ProfileScores } from "./scoring";
import type { RelationshipType } from "./appState";
import playbook from "@/data/playbook.json";

export const TECHNIQUES = [
  "validation",
  "open_question",
  "autonomy_offer",
  "repair",
  "boundary",
] as const;
export type Technique = (typeof TECHNIQUES)[number];

export type AgeBand = "13-15" | "16-17" | "18-22" | "23+";
export type Goal =
  | "repair"
  | "closeness"
  | "set_a_limit"
  | "make_an_ask"
  | "check_in"
  | "share_feelings"
  | "give_feedback"
  | "celebrate";
export type Refinement = "shorter" | "softer" | "different_angle";

export interface Starter {
  text: string;
  technique: Technique;
  why: string;
  avoid: string;
}

export interface AnticipatedReaction {
  // A hypothetical reaction FROM the child/other person — quoting what they
  // might say or do, never something the parent would say. Not linted for
  // the same reason `avoid` isn't: it's meant to name realistic pushback
  // ("you always do this"), not model good parent speech.
  reaction: string;
  // What the PARENT could say or do in response. This IS linted.
  how_to_respond: string;
}

export interface CardsOutput {
  risk_tier: "green" | "amber";
  frame: string;
  before_you_start: string;
  starters: Starter[];
  anticipated_reactions: AnticipatedReaction[];
  setting_tip: string;
}

export interface GenerationInput {
  profile: ProfileScores;
  ageBand: AgeBand;
  relationshipType: RelationshipType;
  relationshipTypeOther?: string;
  situationText: string;
  goal: Goal;
  riskTier: "green" | "amber";
  refinement?: Refinement;
}

// --- Tendencies, never labels ----------------------------------------------

/**
 * Turns numeric profile scores into plain, strengths-first one-line
 * tendencies. Never produces a type label (e.g. "authoritarian").
 */
export function scoresToTendencyLines(profile: ProfileScores): string[] {
  const lines: string[] = [];
  const ps = profile.parentingStyle;
  const ac = profile.autonomyControl;
  const ec = profile.emotionCoaching;
  const cl = profile.confidenceLoad;

  if (typeof ps.warmth === "number") {
    lines.push(
      ps.warmth >= 3.5
        ? "Tends to lead with warmth and connection before addressing an issue."
        : "Tends to get straight to the point; warmth may need an intentional lead-in."
    );
  }
  if (typeof ps.structure === "number") {
    lines.push(
      ps.structure >= 3.5
        ? "Tends to set clear, consistent expectations."
        : "Tends to keep things flexible; a clearer structure may help some situations."
    );
  }
  if (typeof ac.autonomy_support === "number") {
    lines.push(
      ac.autonomy_support >= 3.5
        ? "Tends to offer choices and ask for input before deciding."
        : "Tends to decide first and explain after; offering a choice up front may help."
    );
  }
  if (typeof ec.emotion_coaching === "number") {
    lines.push(
      ec.emotion_coaching >= 3.5
        ? "Tends to name feelings before jumping to solutions."
        : "Tends to move to solutions quickly; naming the feeling first may help it land."
    );
  }
  if (typeof cl.confidence === "number") {
    lines.push(
      cl.confidence < 3
        ? "Tends to be hard on themself after a tough conversation. Lead with reassurance, not a caveat."
        : "Generally feels steady going into hard conversations."
    );
  }

  return lines;
}

// --- Prompt ------------------------------------------------------------------

export const GENERATION_SYSTEM_PROMPT = `You generate conversation-starter cards for a parent of a teen or adult
child. You never produce a chat reply and there is no follow-up turn: this
is the entire interaction. Follow these rules exactly:

1. Return 3 to 5 starters, each tagged with exactly one technique from this
   closed list: validation, open_question, autonomy_offer, repair, boundary.
2. Never include a command, a threat, guilt, withdrawal of affection, or a
   diagnosis/label of the child or the parent.
3. If the parent's confidence/load tendency says they are hard on
   themselves, never shame them. Lead "before_you_start" with reassurance.
4. For age band 23+ and 18-22 (when living independently), use
   adult-to-adult framing. Never claim parental authority over an adult
   child.
4b. Use relationship_frame to calibrate assumed authority and shared
   history for the caregiver's relationship to this child. Never invent
   relationship history, and never use parent-specific language (e.g.
   "as their mom/dad") for a non-parent relationship type.
5. Use the profile tendencies to tune tone and technique mix, but never
   mention a type label (e.g. "authoritarian", "permissive") anywhere in
   the output.
6. Also return 2 to 3 "anticipated_reactions": realistic ways the other
   person might respond to a first word that didn't land cleanly (e.g. "I
   don't know", "You always do this", going quiet, changing the subject).
   This is rehearsal, not a script to force the conversation down one path
   - cover a *range* of reactions (e.g. one shutdown, one deflection, one
   pushback), not three versions of the same one. Each "reaction" quotes
   or describes what the other person might say or do; each
   "how_to_respond" is one or two sentences on how the parent could meet
   that reaction, consistent with the technique mix and age/relationship
   framing used elsewhere. This still is not chat: these are prepared
   responses to rehearse, not a live back-and-forth.
7. Respond with ONLY strict JSON matching this exact shape, no other text:
{
  "risk_tier": "green" | "amber",
  "frame": "one line naming the situation back to the parent",
  "before_you_start": "one line to steady the parent first",
  "starters": [
    { "text": "...", "technique": "...", "why": "...", "avoid": "..." }
  ],
  "anticipated_reactions": [
    { "reaction": "...", "how_to_respond": "..." }
  ],
  "setting_tip": "where and when to say it"
}`;

export function buildGenerationPrompt(input: GenerationInput): string {
  const ageGuidance = (playbook.ageBandGuidance as any)[input.ageBand];
  const goalNote = (playbook.goalNotes as any)[input.goal];
  const relationshipGuidance = (playbook.relationshipGuidance as any)[input.relationshipType];
  const tendencies = scoresToTendencyLines(input.profile);

  const refinementNote = input.refinement
    ? {
        shorter: "Make each starter noticeably shorter and more direct.",
        softer: "Make the tone gentler and warmer throughout.",
        different_angle: "Use a different mix of techniques and a different framing than a typical first pass.",
      }[input.refinement]
    : null;

  return JSON.stringify({
    risk_tier_from_gate: input.riskTier,
    age_band: input.ageBand,
    age_band_frame: ageGuidance?.frame,
    relationship_type: input.relationshipType,
    relationship_frame: relationshipGuidance?.frame,
    relationship_other_label: input.relationshipTypeOther ?? null,
    goal: input.goal,
    goal_note: goalNote,
    parent_tendencies: tendencies,
    situation: input.situationText,
    refinement: refinementNote,
    playbook_version: (playbook as any).version,
  });
}

// --- Schema validation --------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSchema(obj: unknown): ValidationResult {
  const errors: string[] = [];
  if (typeof obj !== "object" || obj === null) {
    return { valid: false, errors: ["response is not an object"] };
  }
  const o = obj as Record<string, unknown>;

  if (o.risk_tier !== "green" && o.risk_tier !== "amber") {
    errors.push("risk_tier must be 'green' or 'amber'");
  }
  if (typeof o.frame !== "string" || o.frame.trim() === "") {
    errors.push("frame must be a non-empty string");
  }
  if (typeof o.before_you_start !== "string" || o.before_you_start.trim() === "") {
    errors.push("before_you_start must be a non-empty string");
  }
  if (typeof o.setting_tip !== "string" || o.setting_tip.trim() === "") {
    errors.push("setting_tip must be a non-empty string");
  }
  if (!Array.isArray(o.starters)) {
    errors.push("starters must be an array");
  } else {
    if (o.starters.length < 3 || o.starters.length > 5) {
      errors.push(`starters must have 3 to 5 items, got ${o.starters.length}`);
    }
    o.starters.forEach((s, idx) => {
      if (typeof s !== "object" || s === null) {
        errors.push(`starters[${idx}] is not an object`);
        return;
      }
      const starter = s as Record<string, unknown>;
      if (typeof starter.text !== "string" || starter.text.trim() === "") {
        errors.push(`starters[${idx}].text must be a non-empty string`);
      }
      if (!TECHNIQUES.includes(starter.technique as Technique)) {
        errors.push(`starters[${idx}].technique must be one of ${TECHNIQUES.join(", ")}`);
      }
      if (typeof starter.why !== "string" || starter.why.trim() === "") {
        errors.push(`starters[${idx}].why must be a non-empty string`);
      }
      if (typeof starter.avoid !== "string" || starter.avoid.trim() === "") {
        errors.push(`starters[${idx}].avoid must be a non-empty string`);
      }
    });
  }

  if (!Array.isArray(o.anticipated_reactions)) {
    errors.push("anticipated_reactions must be an array");
  } else {
    if (o.anticipated_reactions.length < 2 || o.anticipated_reactions.length > 3) {
      errors.push(
        `anticipated_reactions must have 2 to 3 items, got ${o.anticipated_reactions.length}`
      );
    }
    o.anticipated_reactions.forEach((r, idx) => {
      if (typeof r !== "object" || r === null) {
        errors.push(`anticipated_reactions[${idx}] is not an object`);
        return;
      }
      const reaction = r as Record<string, unknown>;
      if (typeof reaction.reaction !== "string" || reaction.reaction.trim() === "") {
        errors.push(`anticipated_reactions[${idx}].reaction must be a non-empty string`);
      }
      if (typeof reaction.how_to_respond !== "string" || reaction.how_to_respond.trim() === "") {
        errors.push(`anticipated_reactions[${idx}].how_to_respond must be a non-empty string`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// --- Banned-pattern lint -------------------------------------------------------

interface BannedPattern {
  category: "command" | "threat" | "guilt" | "withdrawal_of_affection" | "diagnosis";
  pattern: RegExp;
}

const BANNED_PATTERNS: BannedPattern[] = [
  // Commands / directives phrased as orders rather than conversation starters.
  // Deliberately excludes "you will": that's overwhelmingly used in benign,
  // predictive phrasing ("you will feel better") rather than as a command,
  // and flagging it produced false failures in practice.
  { category: "command", pattern: /\byou (must|have to|need to)\b/i },
  { category: "command", pattern: /\bi (demand|insist) that\b/i },

  // Threats.
  { category: "threat", pattern: /\bor else\b/i },
  { category: "threat", pattern: /\byou('ll| will) regret\b/i },
  { category: "threat", pattern: /\bi('ll| will) take away\b/i },
  { category: "threat", pattern: /\bif you don'?t .* i('ll| will)\b/i },

  // Guilt induction.
  { category: "guilt", pattern: /\bafter (all|everything) (i|we)('ve| have) done\b/i },
  { category: "guilt", pattern: /\byou always\b/i },
  { category: "guilt", pattern: /\byou never\b/i },
  { category: "guilt", pattern: /\bif you (loved|cared about) (me|us)\b/i },
  { category: "guilt", pattern: /\bhow could you\b/i },
  { category: "guilt", pattern: /\bi('m| am) disappointed in you\b/i },

  // Withdrawal of affection.
  { category: "withdrawal_of_affection", pattern: /\bi('m| am) done (with|talking to) you\b/i },
  { category: "withdrawal_of_affection", pattern: /\bdon'?t talk to me (until|unless)\b/i },
  { category: "withdrawal_of_affection", pattern: /\bi won'?t love you (if|unless)\b/i },

  // Diagnosis / pop-psych labeling.
  { category: "diagnosis", pattern: /\byou('re| are) (a )?narcissist/i },
  { category: "diagnosis", pattern: /\byou('re| are) bipolar\b/i },
  { category: "diagnosis", pattern: /\byou have (adhd|odd|bpd)\b/i },
  { category: "diagnosis", pattern: /\byou('re| are) being manipulative\b/i },
  { category: "diagnosis", pattern: /\byou('re| are) (an? )?addict\b/i },
];

export interface LintIssue {
  category: BannedPattern["category"];
  field: string;
  matchedText: string;
}

function lintText(field: string, text: string, issues: LintIssue[]) {
  for (const { category, pattern } of BANNED_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      issues.push({ category, field, matchedText: match[0] });
    }
  }
}

export function lintBannedPatterns(cards: CardsOutput): LintIssue[] {
  const issues: LintIssue[] = [];
  lintText("frame", cards.frame, issues);
  lintText("before_you_start", cards.before_you_start, issues);
  lintText("setting_tip", cards.setting_tip, issues);
  cards.starters.forEach((s, idx) => {
    lintText(`starters[${idx}].text`, s.text, issues);
    lintText(`starters[${idx}].why`, s.why, issues);
    // `avoid` is deliberately not linted: its entire purpose is to name the
    // phrase the parent should steer clear of, so it will legitimately
    // contain command/threat/guilt-shaped language as the cautionary
    // example (e.g. "Avoid: 'you need to stop this now'"). Linting it
    // produced false failures on exactly the content it's supposed to
    // contain. What actually reaches the parent to say is `text`, `why`,
    // `frame`, `before_you_start` and `setting_tip` — those are linted.
  });
  cards.anticipated_reactions.forEach((r, idx) => {
    // `reaction` is deliberately not linted, same reasoning as `avoid`: it
    // quotes what the CHILD might say ("you always do this"), not the
    // parent, so it will legitimately trip guilt/command-shaped patterns.
    // `how_to_respond` is what the parent would actually say, so it is linted.
    lintText(`anticipated_reactions[${idx}].how_to_respond`, r.how_to_respond, issues);
  });
  return issues;
}

// --- Fallback card -------------------------------------------------------------

export function fallbackCard(riskTier: "green" | "amber"): CardsOutput {
  return {
    risk_tier: riskTier,
    frame: "This sounds like a hard moment to find the right words for.",
    before_you_start: "Take a breath. You don't have to get this perfect to make it better.",
    starters: [
      {
        text: "Can we talk about what happened? I want to understand your side first.",
        technique: "open_question",
        why: "Opens the door without assuming you already know what went wrong.",
        avoid: "Don't lead with what you did wrong.",
      },
      {
        text: "I noticed you've seemed [off/quiet/upset] lately. I'm here if you want to talk about it, no pressure.",
        technique: "validation",
        why: "Names what you've observed without demanding a response.",
        avoid: "Don't push for an answer right away.",
      },
      {
        text: "What would help right now, even a little?",
        technique: "autonomy_offer",
        why: "Puts them in the driver's seat for what happens next.",
        avoid: "Don't jump straight to your own plan for fixing it.",
      },
    ],
    anticipated_reactions: [
      {
        reaction: "\"I don't know.\"",
        how_to_respond: "That's okay — you don't have to know right now. I just wanted you to hear that I noticed.",
      },
      {
        reaction: "They go quiet or shrug and change the subject.",
        how_to_respond: "Let it sit. You can say, \"No pressure — I'm around whenever,\" and leave it there for now.",
      },
      {
        reaction: "\"You always do this.\"",
        how_to_respond: "Fair enough. I'm not trying to make this a bigger thing — I just wanted to check in.",
      },
    ],
    setting_tip: "Somewhere private, with no time pressure to wrap up quickly.",
  };
}

// --- Validator-gated generation -----------------------------------------------

export type ModelInvoker = (prompt: string) => Promise<string>;

export interface GenerateResult {
  cards: CardsOutput;
  usedFallback: boolean;
  attempts: number;
  lastErrors: string[];
}

export async function generateCards(
  input: GenerationInput,
  invokeModel: ModelInvoker
): Promise<GenerateResult> {
  const prompt = buildGenerationPrompt(input);
  let lastErrors: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await invokeModel(prompt);
      const parsed = JSON.parse(raw);
      const schemaResult = validateSchema(parsed);
      if (!schemaResult.valid) {
        lastErrors = schemaResult.errors;
        continue;
      }
      const lintIssues = lintBannedPatterns(parsed as CardsOutput);
      if (lintIssues.length > 0) {
        lastErrors = lintIssues.map(
          (i) => `banned pattern (${i.category}) in ${i.field}: "${i.matchedText}"`
        );
        continue;
      }
      return { cards: parsed as CardsOutput, usedFallback: false, attempts: attempt, lastErrors: [] };
    } catch (err) {
      lastErrors = [err instanceof Error ? err.message : "unknown error parsing model response"];
    }
  }

  return {
    cards: fallbackCard(input.riskTier),
    usedFallback: true,
    attempts: 2,
    lastErrors,
  };
}
