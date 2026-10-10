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
          className="w-full rounded-full border border-ink/15 bg-white py-3 text-sm font-semibold text-ink"
        >
          Continue with Google
        </button>
      }
    >
      <div className="flex min-h-[60vh] flex-col justify-center">
        <h1 className="text-4xl font-bold italic leading-tight text-ink">Sign in to kin&amp;d</h1>
        <p className="mt-2 text-sm italic text-ink/60">
          Your answers and situation history are saved to your account.
        </p>

        <label className="mt-8 block text-sm text-ink/70">
          Email
          <input
            type="email"
            autoFocus
            className="mt-1 block w-full rounded-xl border border-ink/15 bg-white p-3 text-sm text-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
      </div>
    </WizardShell>
  );
}
