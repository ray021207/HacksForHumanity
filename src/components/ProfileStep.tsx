import { WizardShell } from "./WizardShell";
import type { ProfileDisplay } from "@/lib/profile";

export function ProfileStep({
  profile,
  onNext,
  onBack,
  onRetake,
  progress,
}: {
  profile: ProfileDisplay;
  onNext: () => void;
  onBack: () => void;
  /** Clears the answers and drops back to the first question. */
  onRetake?: () => void;
  progress?: number;
}) {
  return (
    <WizardShell
      headerPill="Your results"
      mascot="block"
      title={profile.headline}
      description="No labels, no scores. Just patterns to work with."
      onBack={onBack}
      progress={progress}
      primaryLabel="Start with a situation"
      onPrimary={onNext}
      secondary={
        onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="text-secondary-fg text-d16 mx-auto underline"
          >
            Retake the questionnaire
          </button>
        )
      }
    >
      <div className="space-y-2">
        <div className="border-secondary-bg bg-primary-bg rounded-card border p-3">
          <span className="bg-purp-faded text-prup rounded-pill text-d16 inline-block px-2 py-1 font-medium">
            What you do well
          </span>
          <ul className="text-primary-fg text-d16 mt-2 list-disc space-y-1 pl-3">
            {profile.strengths.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="border-secondary-bg bg-primary-bg rounded-card border p-3">
          <span className="bg-purp-faded text-prup rounded-pill text-d16 inline-block px-2 py-1 font-medium">
            What you might be missing
          </span>
          <ul className="text-primary-fg text-d16 mt-2 list-disc space-y-1 pl-3">
            {profile.stretches.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-secondary-fg text-d16 mt-3">
        This is based on a short, original questionnaire, not a validated clinical instrument —
        take it as a loose signal, not a verdict. It never leaves your browser.
      </p>
    </WizardShell>
  );
}
