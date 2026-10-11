import { useState } from "react";
import { WizardShell, PillChip } from "./WizardShell";
import { VoiceInputButton } from "./VoiceInputButton";
import type { ChildInfo } from "@/lib/appState";
import type { Goal } from "@/lib/generation";
import questionnaire from "@/data/questionnaire.json";

const goalsBlock = (questionnaire.blocks as any[]).find((b) => b.id === "goals");
const SETTING_OPTIONS = [
  { value: "at_home", label: "At home" },
  { value: "in_the_car", label: "In the car" },
  { value: "over_text", label: "Over text" },
  { value: "on_a_call", label: "On a call" },
  { value: "in_public", label: "In public" },
];

export function SituationStep({
  familyChildren,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  familyChildren: ChildInfo[];
  onBack: () => void;
  onSubmit: (input: { childId: string; situationText: string; goal: Goal; setting: string }) => void;
  isSubmitting: boolean;
}) {
  const [childId, setChildId] = useState(familyChildren[0]?.id ?? "");
  const [situationText, setSituationText] = useState("");
  const [goal, setGoal] = useState<Goal | "">("");
  const [setting, setSetting] = useState("");

  const canSubmit = situationText.trim().length > 0 && goal !== "" && childId !== "";

  return (
    <WizardShell
      mascot="star"
      headerPill="New situation"
      title="Tell us about the moment."
      onBack={onBack}
      primaryLabel={isSubmitting ? "Getting cards..." : "Find the first words"}
      onPrimary={() => onSubmit({ childId, situationText: situationText.trim(), goal: goal as Goal, setting })}
      primaryDisabled={!canSubmit || isSubmitting}
    >
      <div className="space-y-3">
        <div>
          <textarea
            className="border-secondary-bg bg-secondary-bg rounded-field text-d16 text-primary-fg placeholder:text-secondary-fg block w-full border p-2"
            rows={5}
            value={situationText}
            onChange={(e) => setSituationText(e.target.value)}
            placeholder="Type or speak, e.g. we argued about curfew tonight and it got heated."
          />
          <VoiceInputButton
            onTranscript={(text) =>
              setSituationText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
            }
          />
          <p className="text-secondary-fg text-d16 mt-1">
            Please leave out names or details that could identify your child.
          </p>
        </div>

        {familyChildren.length > 1 && (
          <label className="text-secondary-fg text-d16 block">
            Which child?
            <select
              className="border-secondary-bg bg-secondary-bg rounded-field text-d16 text-primary-fg mt-1 block w-full border p-2"
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
            >
              {familyChildren.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nickname?.trim() || `Child (${c.ageBand})`}
                </option>
              ))}
            </select>
          </label>
        )}

        <div>
          <span className="text-d16 block font-semibold">What do you hope for?</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {goalsBlock.options.map((opt: any) => (
              <PillChip key={opt.value} selected={goal === opt.value} onClick={() => setGoal(opt.value)}>
                {opt.label}
              </PillChip>
            ))}
          </div>
        </div>

        <div>
          <span className="text-d16 block font-semibold">Where did this happen?</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {SETTING_OPTIONS.map((opt) => (
              <PillChip key={opt.value} selected={setting === opt.value} onClick={() => setSetting(opt.value)}>
                {opt.label}
              </PillChip>
            ))}
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
