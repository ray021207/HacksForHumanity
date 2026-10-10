import { useState } from "react";
import { WizardShell } from "./WizardShell";

export function ConsentStep({ onAccept }: { onAccept: () => void }) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <WizardShell
      title=""
      primaryLabel="Start"
      onPrimary={onAccept}
      secondary={
        <p className="text-muted text-d16 text-center">
          By clicking Start you agree to the{" "}
          <button type="button" onClick={() => setShowTerms(true)} className="underline">
            terms and conditions
          </button>
          .
        </p>
      }
    >
      <div className="flex min-h-[60vh] flex-col justify-center">
        <h1 className="display text-d40 italic">Welcome to Raisee</h1>
        <p className="text-muted text-d24 mt-1 italic">Where the first word finds the door</p>

        <p className="text-muted text-d16 mt-3 max-w-[52ch] italic">
          Some conversations are hard to begin. Tell Raisee what&apos;s happening, and you&apos;ll
          get a few gentle things you could actually say, with a note on why each one works and
          what to avoid. Raisee draws on research into warm, listening-first parenting.
          It&apos;s not therapy and it won&apos;t replace a real conversation. It just helps you
          find the first words.
        </p>
      </div>

      {showTerms && (
        <div
          className="bg-ink/40 fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-3"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="bg-surface rounded-t-card sm:rounded-card max-h-[80vh] w-full max-w-[560px] overflow-y-auto p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="display text-d24">Terms and conditions</h2>
            <ul className="text-muted text-d16 mt-2 list-disc space-y-1 pl-3">
              <li>No chat — a short questionnaire once, then cards for each situation.</li>
              <li>Your answers stay in your browser, never on our server.</li>
              <li>We never store what you describe, your child&apos;s name, or their birthdate.</li>
              <li>Dangerous situations get crisis resources instead of generated cards.</li>
              <li>AI-generated, not therapy or medical advice.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="bg-ink rounded-pill text-d16 mt-3 w-full py-2 font-medium text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
