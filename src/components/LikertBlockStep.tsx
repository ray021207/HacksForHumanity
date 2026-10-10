import { useState } from "react";
import { WizardShell, PillOption } from "./WizardShell";
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
  const isLast = itemIndex === block.items.length - 1;

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
      headerPill={`${itemIndex + 1} of ${block.items.length}`}
      eyebrow="How much does this sound like you?"
      title={itemText(item, isAdultChild)}
      onBack={goBack}
      progress={progress}
      primaryLabel="Next"
      onPrimary={goNext}
      primaryDisabled={!isAnswered}
      doodles={isLast ? [{ src: "/doodles/star.svg", className: "absolute bottom-24 right-2 w-10" }] : undefined}
      secondary={
        <button
          type="button"
          onClick={() => onChange(item.id, null)}
          className={`block text-center text-xs underline ${value === null ? "text-prup" : "text-tertiary-fg"}`}
        >
          Prefer not to say
        </button>
      }
    >
      <div className="space-y-2">
        {Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i).map((n) => (
          <PillOption key={n} selected={value === n} onClick={() => onChange(item.id, n)}>
            {scale.labels[n - scale.min]}
          </PillOption>
        ))}
      </div>
    </WizardShell>
  );
}
