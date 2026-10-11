import { useState } from "react";
import { WizardShell, PillOption } from "./WizardShell";
import type { RawResponses } from "@/lib/appState";
import questionnaire from "@/data/questionnaire.json";

const scenarioBlock = (questionnaire.blocks as any[]).find((b) => b.id === "scenarios");

/** One scenario per screen; the scenario prompt itself is the screen title. */
export function ScenarioBlockStep({
  responses,
  isAdultChild,
  onChange,
  onNext,
  onBack,
  progress,
}: {
  responses: RawResponses;
  isAdultChild: boolean;
  onChange: (itemId: string, optionId: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  progress?: number;
}) {
  const [itemIndex, setItemIndex] = useState(0);
  const item = scenarioBlock.items[itemIndex];
  const selected = responses[item.id];
  const isAnswered = selected !== undefined;
  const prompt = isAdultChild ? item.text_adult : item.text_teen;

  function goBack() {
    if (itemIndex > 0) setItemIndex(itemIndex - 1);
    else onBack();
  }

  function goNext() {
    if (itemIndex < scenarioBlock.items.length - 1) setItemIndex(itemIndex + 1);
    else onNext();
  }

  return (
    <WizardShell
      headerPill={`${itemIndex + 1} of ${scenarioBlock.items.length}`}
      title={prompt}
      onBack={goBack}
      progress={progress}
      primaryLabel="Next"
      onPrimary={goNext}
      primaryDisabled={!isAnswered}
    >
      <div className="space-y-1">
        {item.options.map((opt: any) => (
          <PillOption key={opt.id} selected={selected === opt.id} onClick={() => onChange(item.id, opt.id)}>
            {opt.label}
          </PillOption>
        ))}

        <button
          type="button"
          onClick={() => onChange(item.id, null)}
          className={`text-d16 mt-2 block underline ${selected === null ? "text-prup" : "text-secondary-fg"}`}
        >
          Prefer not to say
        </button>
      </div>
      <p className="text-secondary-fg text-d16 mt-3">No right or wrong. Just what feels like you.</p>
    </WizardShell>
  );
}
