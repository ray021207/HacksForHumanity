import { useState } from "react";
import { WizardShell } from "./WizardShell";

export function ConsentStep({ onAccept }: { onAccept: () => void }) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <WizardShell
      title=""
      primaryLabel="Start"
      onPrimary={onAccept}
      accountLink
      secondary={
        <p className="text-center text-xs text-ink/50">
          By clicking Start you agree to the{" "}
          <button type="button" onClick={() => setShowTerms(true)} className="underline">
            terms and conditions
          </button>
          .
        </p>
      }
    >
      <div className="flex min-h-[70vh] flex-col justify-center">
        <h1 className="text-4xl font-bold italic leading-tight text-ink">Welcome to kin&amp;d</h1>
        <p className="mt-2 text-lg italic text-ink/70">Where the first word finds the door</p>

        <p className="mt-6 text-sm italic leading-relaxed text-ink/60">
          Some conversations are hard to begin. Whether you&apos;re a parent, grandparent,
          foster parent, aunt or uncle, or any other kind of caregiver, tell kin&amp;d
          what&apos;s happening, and you&apos;ll get a few gentle things you could actually
          say, with a note on why each one works and what to avoid. kin&amp;d draws on
          research into warm, listening-first caregiving. It&apos;s not therapy and it
          won&apos;t replace a real conversation. It just helps you find the first words.
        </p>
      </div>

      {showTerms && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-5"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-ink">Terms and conditions</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>No chat — a short questionnaire once, then cards for each situation.</li>
              <li>Your answers stay in your browser, never on our server.</li>
              <li>We never store what you describe, the child or ward&apos;s name, or their birthdate.</li>
              <li>Dangerous situations get crisis resources instead of generated cards.</li>
              <li>AI-generated, not therapy or medical advice.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
