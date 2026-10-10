"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { EMPTY_STATE, loadState, saveState, type AppState, type ChildInfo } from "@/lib/appState";
import { computeProfile, describeProfile } from "@/lib/profile";
import type { Goal } from "@/lib/generation";
import { ConsentStep } from "@/components/ConsentStep";
import { FamilyStep } from "@/components/FamilyStep";
import { LikertBlockStep } from "@/components/LikertBlockStep";
import { ScenarioBlockStep } from "@/components/ScenarioBlockStep";
import { GoalsStep } from "@/components/GoalsStep";
import { ProfileStep } from "@/components/ProfileStep";
import { SituationStep } from "@/components/SituationStep";
import { CardsStep, type CardsApiResponse } from "@/components/CardsStep";
import questionnaire from "@/data/questionnaire.json";

type Step =
  | "consent"
  | "family"
  | "personality"
  | "scenarios"
  | "goals"
  | "profile"
  | "situation"
  | "cards";

const STEP_ORDER: Step[] = [
  "consent",
  "family",
  "personality",
  "scenarios",
  "goals",
  "profile",
  "situation",
  "cards",
];

/** A store that never emits; the snapshot pair below is the whole signal. */
const NEVER_CHANGES = () => () => {};

function blockItemIds(blockId: string): string[] {
  const block = (questionnaire.blocks as any[]).find((b) => b.id === blockId);
  return block.items.map((i: any) => i.id);
}

// An item counts as "answered" once it has a key in responses at all,
// including "prefer not to say" (stored as null). Only a never-visited
// item is missing.
function isBlockAnswered(responses: AppState["responses"], blockId: string): boolean {
  return blockItemIds(blockId).every((id) => responses[id] !== undefined);
}

/**
 * Where a returning parent lands: the first step with unfinished work, so
 * the questionnaire is never silently skipped. Once everything (family,
 * personality, scenarios, goals) is done, this goes straight to describing
 * a situation rather than re-showing the profile screen on every visit.
 */
function firstIncompleteStep(state: AppState): Step {
  if (state.children.length === 0) return "family";
  if (!isBlockAnswered(state.responses, "personality")) return "personality";
  if (!isBlockAnswered(state.responses, "scenarios")) return "scenarios";
  if (state.goals.length === 0) return "goals";
  return "situation";
}

export default function Home() {
  const [state, setState] = useState<AppState>(() => (typeof window === "undefined" ? EMPTY_STATE : loadState()));
  // Every fresh load starts at the welcome screen, even if there's saved
  // progress — "save partial progress" means answers survive a refresh, not
  // that the app skips the welcome on a later visit. Pressing Start routes
  // forward to wherever that saved progress actually left off.
  const [step, setStep] = useState<Step>("consent");

  // Both of the above read localStorage, so a server pass would paint an empty
  // questionnaire that the client then replaces. Holding the first frame until
  // after hydration is what keeps React from reconciling two different trees.
  //
  // useSyncExternalStore rather than a setState in an effect: the two snapshot
  // functions ARE the server/client distinction, so React resolves it during
  // hydration instead of as a second render pass afterwards.
  const hydrated = useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false
  );
  const [situationChildId, setSituationChildId] = useState<string | null>(null);
  const [cardsResult, setCardsResult] = useState<CardsApiResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(patch: Partial<AppState>) {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }

  function goTo(nextStep: Step) {
    setStep(nextStep);
  }

  function goBack(fromStep: Step) {
    const idx = STEP_ORDER.indexOf(fromStep);
    if (idx > 0) goTo(STEP_ORDER[idx - 1]);
  }

  function goNextAfter(fromStep: Step) {
    const idx = STEP_ORDER.indexOf(fromStep);
    if (idx >= 0 && idx < STEP_ORDER.length - 1) goTo(STEP_ORDER[idx + 1]);
  }

  // A thin top progress bar across the questionnaire portion of the flow
  // (family through profile). Consent, situation and cards don't show one. It counts
  // the step you're on rather than the ones behind you, so the very first
  // screen isn't an empty bar.
  const progress = (STEP_ORDER.indexOf(step) + 1) / STEP_ORDER.length;

  const profile = useMemo(() => computeProfile(state.responses), [state.responses]);
  const profileDisplay = useMemo(() => describeProfile(profile), [profile]);

  const activeChild: ChildInfo | undefined = state.children.find((c) => c.id === situationChildId) ?? state.children[0];
  const isAdultChild = activeChild ? activeChild.ageBand === "18-22" || activeChild.ageBand === "23+" : false;

  async function submitSituation(input: { childId: string; situationText: string; goal: Goal; setting: string }) {
    setIsSubmitting(true);
    setSituationChildId(input.childId);
    const child = state.children.find((c) => c.id === input.childId)!;
    try {
      const res = await fetch("/api/cards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          ageBand: child.ageBand,
          relationshipType: child.relationshipType,
          relationshipTypeOther: child.relationshipTypeOther,
          situationText: input.situationText,
          goal: input.goal,
        }),
      });
      const data = await res.json();
      setCardsResult(data);
      goTo("cards");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Matches the height WizardShell reserves, so the header and footer don't
  // jump once the first real screen replaces this.
  if (!hydrated) return <div className="min-h-[calc(100svh_-_var(--nav-h))] w-full flex-1" />;

  switch (step) {
    case "consent":
      return (
        <ConsentStep
          onAccept={() => {
            update({ consentAccepted: true });
            // Resume at the first unfinished step — never skip straight to
            // "situation" while the questionnaire is still incomplete.
            goTo(firstIncompleteStep(state));
          }}
        />
      );

    case "family":
      return (
        <FamilyStep
          familyChildren={state.children}
          onChange={(children) => update({ children })}
          onNext={() => {
            if (!state.consentAccepted) update({ consentAccepted: true });
            goNextAfter("family");
          }}
          progress={progress}
        />
      );

    case "goals":
      return (
        <GoalsStep
          goals={state.goals}
          onChange={(goals) => update({ goals })}
          onNext={() => goNextAfter("goals")}
          onBack={() => goBack("goals")}
          progress={progress}
        />
      );

    case "profile":
      return (
        <ProfileStep
          profile={profileDisplay}
          onNext={() => goNextAfter("profile")}
          onBack={() => goBack("profile")}
          onRetake={() => {
            update({ responses: {}, goals: [] });
            goTo("personality");
          }}
          progress={progress}
        />
      );

    case "situation":
      return (
        <SituationStep
          familyChildren={state.children}
          onBack={() => goBack("situation")}
          onSubmit={submitSituation}
          isSubmitting={isSubmitting}
        />
      );

    case "cards":
      return cardsResult ? (
        <CardsStep result={cardsResult} onStartOver={() => goTo("situation")} />
      ) : null;

    case "personality":
      return (
        <LikertBlockStep
          blockId="personality"
          responses={state.responses}
          isAdultChild={isAdultChild}
          onChange={(itemId, value) => update({ responses: { ...state.responses, [itemId]: value } })}
          onNext={() => goNextAfter("personality")}
          onBack={() => goBack("personality")}
          progress={progress}
        />
      );

    case "scenarios":
      return (
        <ScenarioBlockStep
          responses={state.responses}
          isAdultChild={isAdultChild}
          onChange={(itemId, optionId) => update({ responses: { ...state.responses, [itemId]: optionId } })}
          onNext={() => goNextAfter("scenarios")}
          onBack={() => goBack("scenarios")}
          progress={progress}
        />
      );
  }
}
