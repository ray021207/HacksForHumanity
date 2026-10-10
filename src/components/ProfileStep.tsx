import { WizardShell } from "./WizardShell";
import type { ProfileDisplay } from "@/lib/profile";

export function ProfileStep({
  profile,
  onNext,
  onBack,
  progress,
}: {
  profile: ProfileDisplay;
  onNext: () => void;
  onBack: () => void;
  progress?: number;
}) {
  return (
    <WizardShell
      title="A quick read on your tendencies"
      description="Here's what your answers suggest about how you tend to show up in hard conversations. We use this to tune the tone and techniques in your cards — never to label or diagnose you. It's based on a short, original questionnaire (not a validated clinical instrument), so take it as a loose signal, not a verdict. You can retake it anytime, and it never leaves your browser."
      onBack={onBack}
      progress={progress}
      primaryLabel="Continue"
      onPrimary={onNext}
      accountLink
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">What stands out</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
            {profile.strengths.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-olive/30 p-4">
          <h3 className="text-sm font-semibold text-ink">A few things to try</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
            {profile.stretches.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </WizardShell>
  );
}
