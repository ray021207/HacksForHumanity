import { WizardShell, PillChip } from "./WizardShell";
import questionnaire from "@/data/questionnaire.json";

const goalsBlock = (questionnaire.blocks as any[]).find((b) => b.id === "goals");

export function GoalsStep({
  goals,
  onChange,
  onNext,
  onBack,
  progress,
}: {
  goals: string[];
  onChange: (goals: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  progress?: number;
}) {
  function toggle(value: string) {
    onChange(goals.includes(value) ? goals.filter((g) => g !== value) : [...goals, value]);
  }

  return (
    <WizardShell
      title={goalsBlock.title}
      description={goalsBlock.description}
      onBack={onBack}
      progress={progress}
      primaryLabel="Continue"
      onPrimary={onNext}
    >
      <div className="flex flex-wrap gap-2">
        {goalsBlock.options.map((opt: any) => (
          <PillChip key={opt.value} selected={goals.includes(opt.value)} onClick={() => toggle(opt.value)}>
            {opt.label}
          </PillChip>
        ))}
      </div>
    </WizardShell>
  );
}
