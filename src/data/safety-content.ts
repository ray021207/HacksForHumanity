// Fixed, non-generated safety text shown for amber- and red-tier situations.
//
// TODO: Clinician review required before launch. Nothing in this file has
// been reviewed by a licensed clinician yet. Do not ship to real users
// until that review has happened and this comment is removed.
//
// Per the Jed Foundation's open letter, the hand-off baseline is 988 and
// the Crisis Text Line. Do not add other hotline numbers without checking
// they are current and clinically appropriate.

export const DISCLOSURE_LINE =
  "AI-generated, not therapy or medical advice.";

export const CRISIS_RESOURCES = [
  {
    label: "Call or text 988",
    description: "The Suicide & Crisis Lifeline. Free, confidential, available 24/7.",
  },
  {
    label: "Text HOME to 741741",
    description: "Crisis Text Line. Free, confidential, available 24/7.",
  },
] as const;

export const RED_TIER_CONTENT = {
  heading: "Please get help right now",
  body: [
    "Stay with the person if it's safe to do so.",
    "Call or text 988 (Suicide & Crisis Lifeline).",
    "Text HOME to 741741 (Crisis Text Line).",
    "If anyone is in immediate danger, call emergency services (911 in the US).",
  ],
  // No generated starters are shown for red-tier situations. This content
  // is fixed and does not change based on what the parent typed.
} as const;

export const AMBER_TIER_CONTENT = {
  heading: "Before anything else",
  body: [
    "What you're describing may be more than a conversation-starter can help with.",
    "Call or text 988 (Suicide & Crisis Lifeline) if your child is talking about suicide or self-harm.",
    "Text HOME to 741741 (Crisis Text Line) for a free, confidential conversation with a counselor.",
    "The starters below are still here, but please don't let them replace reaching out for support.",
  ],
} as const;
