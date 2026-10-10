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
      mascot="block"
      title="A quick read on your tendencies"
      description="Here's what your answers suggest about how you tend to show up in hard conversations. We use this to tune the tone and techniques in your cards, never to label or diagnose you. It's based on a short, original questionnaire (not a validated clinical instrument), so take it as a loose signal, not a verdict. You can retake it anytime, and it never leaves your browser."
      onBack={onBack}
      progress={progress}
      primaryLabel="Continue"
      onPrimary={onNext}
      secondary={
        onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="text-muted text-d16 mx-auto underline"
          >
            Retake the questionnaire
          </button>
        )
      }
    >
      <div className="space-y-2">
        <div>
          <h3 className="text-d16 font-semibold">What stands out</h3>
          <ul className="text-muted text-d16 mt-1 list-disc space-y-1 pl-3">
            {profile.strengths.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="bg-field rounded-card p-3">
          <h3 className="text-d16 font-semibold">A few things to try</h3>
          <ul className="text-muted text-d16 mt-1 list-disc space-y-1 pl-3">
            {profile.stretches.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </WizardShell>
  );
}
