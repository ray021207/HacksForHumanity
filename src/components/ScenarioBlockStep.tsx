import { useState } from "react";
import { WizardShell, PillOption } from "./WizardShell";
import type { RawResponses } from "@/lib/appState";
import questionnaire from "@/data/questionnaire.json";

const scenarioBlock = (questionnaire.blocks as any[]).find((b) => b.id === "scenarios");

/** One scenario per screen, same "Question N" pattern as the personality block. */
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
      title={`Question ${itemIndex + 1}`}
      description={`${scenarioBlock.title} · ${itemIndex + 1} of ${scenarioBlock.items.length}`}
      onBack={goBack}
      progress={progress}
      primaryLabel="Continue"
      onPrimary={goNext}
      primaryDisabled={!isAnswered}
    >
      <div>
        <p className="text-d24">{prompt}</p>

        <div className="mt-3 space-y-1">
          {item.options.map((opt: any) => (
            <PillOption key={opt.id} selected={selected === opt.id} onClick={() => onChange(item.id, opt.id)}>
              {opt.label}
            </PillOption>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onChange(item.id, null)}
          className={`text-d16 mt-2 underline ${selected === null ? "text-ink" : "text-muted"}`}
        >
          Prefer not to say
        </button>
      </div>
    </WizardShell>
  );
}
