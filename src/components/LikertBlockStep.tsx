import { useState } from "react";
import { WizardShell } from "./WizardShell";
import type { RawResponses } from "@/lib/appState";
import questionnaire from "@/data/questionnaire.json";

function itemText(item: any, isAdult: boolean): string {
  if (item.text) return item.text; // TIPI items (published, no variants)
  return isAdult ? item.text_adult : item.text_teen;
}

/**
 * One question per screen, each with its own back/continue. The question
 * text itself is the screen title. Item count comes from
 * src/data/questionnaire.json (6 TIPI items as of this build — a trimmed
 * 3-trait subset, see that file's "source" note).
 */
export function LikertBlockStep({
  blockId,
  responses,
  isAdultChild,
  onChange,
  onNext,
  onBack,
  progress,
}: {
  blockId: string;
  responses: RawResponses;
  isAdultChild: boolean;
  onChange: (itemId: string, value: number | null) => void;
  onNext: () => void;
  onBack: () => void;
  progress?: number;
}) {
  const block = (questionnaire.blocks as any[]).find((b) => b.id === blockId);
  const scale = (questionnaire.scales as any)[block.scale];
  const [itemIndex, setItemIndex] = useState(0);

  const item = block.items[itemIndex];
  const value = responses[item.id];
  const isAnswered = value !== undefined;

  function goBack() {
    if (itemIndex > 0) setItemIndex(itemIndex - 1);
    else onBack();
  }

  function goNext() {
    if (itemIndex < block.items.length - 1) setItemIndex(itemIndex + 1);
    else onNext();
  }

  return (
    <WizardShell
      title={itemText(item, isAdultChild)}
      description={`${block.title} · ${itemIndex + 1} of ${block.items.length}`}
      onBack={goBack}
      progress={progress}
      primaryLabel="Continue"
      onPrimary={goNext}
      primaryDisabled={!isAnswered}
    >
      <div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(item.id, n)}
              className={`rounded-full border px-3 py-2 text-xs transition-colors ${
                value === n ? "border-ink bg-ink text-cream" : "border-ink/15 bg-white/60 text-ink"
              }`}
            >
              {scale.labels[n - scale.min]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onChange(item.id, null)}
          className={`mt-4 text-xs underline ${value === null ? "text-ink" : "text-ink/40"}`}
        >
          Prefer not to say
        </button>
      </div>
    </WizardShell>
  );
}
