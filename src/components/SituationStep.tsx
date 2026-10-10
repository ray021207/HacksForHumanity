import { useState } from "react";
import { WizardShell, PillChip } from "./WizardShell";
import { VoiceInputButton } from "./VoiceInputButton";
import type { ChildInfo } from "@/lib/appState";
import type { Goal } from "@/lib/generation";
import questionnaire from "@/data/questionnaire.json";

const goalsBlock = (questionnaire.blocks as any[]).find((b) => b.id === "goals");
const ageBandField = (questionnaire.blocks as any[]).find((b) => b.id === "family").fields.ageBand;

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

  const activeChild = familyChildren.find((c) => c.id === childId);
  const canSubmit = situationText.trim().length > 0 && goal !== "" && childId !== "";

  return (
    <WizardShell
      headerPill="New situation"
      eyebrow="What's happening?"
      title="Tell us about the moment."
      onBack={onBack}
      primaryLabel={isSubmitting ? "Getting cards..." : "Find the first words"}
      onPrimary={() => onSubmit({ childId, situationText: situationText.trim(), goal: goal as Goal, setting: "" })}
      primaryDisabled={!canSubmit || isSubmitting}
      doodles={[{ src: "/doodles/ghost.svg", className: "absolute bottom-28 left-3 w-12" }]}
    >
      <div className="space-y-5">
        {familyChildren.length > 1 ? (
          <div>
            <span className="block text-sm font-medium text-primary-fg">Which child?</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {familyChildren.map((c) => (
                <PillChip key={c.id} selected={childId === c.id} onClick={() => setChildId(c.id)}>
                  {c.nickname?.trim() || `(${c.ageBand})`}
                </PillChip>
              ))}
            </div>
          </div>
        ) : (
          activeChild && (
            <div>
              <span className="block text-sm font-medium text-primary-fg">Your child&apos;s age</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {ageBandField.options.map((opt: any) => (
                  <span
                    key={opt.value}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      opt.value === activeChild.ageBand
                        ? "border-prup text-prup"
                        : "border-secondary-bg text-tertiary-fg"
                    }`}
                  >
                    {opt.label}
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        <div>
          <span className="block text-sm font-medium text-primary-fg">What do you hope for?</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {goalsBlock.options.map((opt: any) => (
              <PillChip key={opt.value} selected={goal === opt.value} onClick={() => setGoal(opt.value)}>
                {opt.label}
              </PillChip>
            ))}
          </div>
        </div>

        <div>
          <textarea
            className="block w-full rounded-2xl border border-secondary-bg bg-primary-bg p-3 text-sm text-primary-fg placeholder:text-tertiary-fg"
            rows={5}
            value={situationText}
            onChange={(e) => setSituationText(e.target.value)}
            placeholder="My 17-year-old wants to study art instead of nursing. Every time I bring it up, it turns into an argument."
          />
          <VoiceInputButton
            onTranscript={(text) =>
              setSituationText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
            }
          />
          <p className="mt-2 text-xs text-tertiary-fg">
            Please leave out names or details that could identify your child.
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
