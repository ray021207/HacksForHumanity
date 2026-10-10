"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_STATE, loadState, saveState, type AppState, type ChildInfo } from "@/lib/appState";
import { fetchServerState, pushServerState } from "@/lib/serverState";
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
import { UpgradePrompt } from "@/components/UpgradePrompt";
import questionnaire from "@/data/questionnaire.json";

type Step =
  | "consent"
  | "family"
  | "personality"
  | "scenarios"
  | "goals"
  | "profile"
  | "situation"
  | "cards"
  | "upgrade";

// Steps where leaving means a questionnaire block was just completed —
// the boundary at which local draft state is pushed to the server.
const SYNC_ON_LEAVE: Step[] = ["family", "personality", "scenarios", "goals"];

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

function blockItemIds(blockId: string): string[] {
  const block = (questionnaire.blocks as any[]).find((b) => b.id === blockId);
  return block.items.map((i: any) => i.id);
}

// An item counts as "answered" once it has a key in responses at all,
// including "prefer not to say" (stored as null) — only a never-visited
// item is missing.
function isBlockAnswered(responses: AppState["responses"], blockId: string): boolean {
  return blockItemIds(blockId).every((id) => responses[id] !== undefined);
}

/**
 * Where a returning parent should land after re-accepting consent: the
 * first step with unfinished work, so the questionnaire is never silently
 * skipped. Once everything (family, personality, scenarios, goals) is
 * done, this goes straight to describing a situation rather than
 * re-showing the profile screen on every visit.
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
  // Every fresh load starts at consent, even if there's saved progress —
  // "save partial progress" means answers survive a refresh, not that the
  // app skips the consent screen on a later visit. Accepting consent again
  // routes forward to wherever that saved progress actually left off.
  const [step, setStep] = useState<Step>("consent");
  const [situationChildId, setSituationChildId] = useState<string | null>(null);
  const [cardsResult, setCardsResult] = useState<CardsApiResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hydrated = useRef(false);

  // Hydrate from the server on first mount — once signed in, the server is
  // the source of truth; the local draft cache only matters for the
  // in-progress block before it's ever reached the server.
  useEffect(() => {
    (async () => {
      const serverState = await fetchServerState();
      if (serverState) {
        setState(serverState);
        saveState(serverState);
      }
      hydrated.current = true;
    })();
  }, []);

  // Push completed-block boundaries to the server. Keystroke-level autosave
  // stays local-only via saveState(); this only fires when a block is left.
  const prevStep = useRef<Step>(step);
  useEffect(() => {
    if (hydrated.current && SYNC_ON_LEAVE.includes(prevStep.current) && prevStep.current !== step) {
      pushServerState(state).then((result) => {
        // The server assigns its own row ids on every children replace —
        // adopt them so a later generation's childId FK actually resolves.
        if (result?.children) {
          setState((prev) => ({ ...prev, children: result.children! }));
        }
      });
    }
    prevStep.current = step;
  }, [step, state]);

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
  // (family through profile) — consent, situation and cards don't show one.
  const progress = STEP_ORDER.indexOf(step) / (STEP_ORDER.length - 1);

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
          childId: child.id,
          situationText: input.situationText,
          goal: input.goal,
        }),
      });
      if (res.status === 402) {
        goTo("upgrade");
        return;
      }
      const data = await res.json();
      setCardsResult(data);
      goTo("cards");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          onNext={() => goNextAfter("family")}
          onBack={() => goBack("family")}
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

    case "upgrade":
      return <UpgradePrompt onBack={() => goTo("situation")} />;

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
