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
  const [setting, setSetting] = useState(SETTING_OPTIONS[0].value);

  const canSubmit = situationText.trim().length > 0 && goal !== "" && childId !== "";

  return (
    <WizardShell
      title="What's going on?"
      description="Type or speak — nothing here is stored after you leave this page."
      onBack={onBack}
      primaryLabel={isSubmitting ? "Getting cards..." : "Get conversation starters"}
      onPrimary={() => onSubmit({ childId, situationText: situationText.trim(), goal: goal as Goal, setting })}
      primaryDisabled={!canSubmit || isSubmitting}
    >
      <div className="space-y-5">
        {familyChildren.length > 1 && (
          <label className="block text-sm text-ink/70">
            Which child?
            <select
              className="mt-1 block w-full rounded-xl border border-ink/15 bg-white p-2 text-sm text-ink"
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
          <textarea
            className="block w-full rounded-2xl border border-ink/15 bg-white/60 p-3 text-sm text-ink placeholder:text-ink/40"
            rows={5}
            value={situationText}
            onChange={(e) => setSituationText(e.target.value)}
            placeholder="Type or speak — e.g. we argued about curfew tonight and it got heated."
          />
          <VoiceInputButton
            onTranscript={(text) =>
              setSituationText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
            }
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-ink">What&apos;s this for?</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {goalsBlock.options.map((opt: any) => (
              <PillChip key={opt.value} selected={goal === opt.value} onClick={() => setGoal(opt.value)}>
                {opt.label}
              </PillChip>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-ink">Setting</span>
          <div className="mt-2 flex flex-wrap gap-2">
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
