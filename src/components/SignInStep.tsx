"use client";

import { useState } from "react";
import { WizardShell } from "./WizardShell";

export function SignInStep({
  onEmailSubmit,
  onGoogleSignIn,
  isSubmitting,
  error,
}: {
  onEmailSubmit: (email: string) => void;
  onGoogleSignIn: () => void;
  isSubmitting: boolean;
  error?: string;
}) {
  const [email, setEmail] = useState("");

  return (
    <WizardShell
      title=""
      primaryLabel={isSubmitting ? "Sending…" : "Continue with email"}
      onPrimary={() => email && onEmailSubmit(email)}
      primaryDisabled={!email || isSubmitting}
      secondary={
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="border-line bg-surface text-ink hover:bg-panel-2 rounded-pill text-d16 w-full border py-2 font-medium transition-colors"
        >
          Continue with Google
        </button>
      }
    >
      <div className="flex min-h-[60vh] flex-col justify-center">
        <h1 className="display text-d40 italic">Sign in to kin&amp;d</h1>
        <p className="text-muted text-d16 mt-1 italic">
          Your answers and situation history are saved to your account.
        </p>

        <label className="text-muted text-d16 mt-s3 block">
          Email
          <input
            type="email"
            autoFocus
            className="border-line bg-field rounded-field text-d16 text-ink mt-1 block w-full border p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {error && <p className="text-accent text-d16 mt-3">{error}</p>}
      </div>
    </WizardShell>
  );
}
