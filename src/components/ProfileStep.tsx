import { WizardShell, Badge } from "./WizardShell";
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
  onRetake?: () => void;
  progress?: number;
}) {
  return (
    <WizardShell
      headerPill="Your results"
      eyebrow="Based on your answers"
      title={profile.headline}
      description="No labels, no scores. Just patterns to work with."
      onBack={onBack}
      progress={progress}
      primaryLabel="Start with a situation"
      onPrimary={onNext}
      belowPrimary={
        onRetake && (
          <button type="button" onClick={onRetake} className="text-xs text-tertiary-fg underline">
            Retake the questionnaire
          </button>
        )
      }
      doodles={[
        { src: "/doodles/star.svg", className: "absolute right-4 top-28 w-8" },
        { src: "/doodles/blob.svg", className: "absolute bottom-28 right-3 w-16" },
      ]}
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-secondary-bg bg-primary-bg p-4">
          <Badge>What you do well</Badge>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-primary-fg marker:text-prup">
            {profile.strengths.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-secondary-bg bg-primary-bg p-4">
          <Badge>What you might be missing</Badge>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-primary-fg marker:text-accent">
            {profile.stretches.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs text-tertiary-fg">
        This is based on a short, original questionnaire, not a validated clinical instrument — take
        it as a loose signal, not a verdict. It never leaves your browser.
      </p>
    </WizardShell>
  );
}
