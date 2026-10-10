"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SignInStep } from "@/components/SignInStep";

export function SignInPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleEmailSubmit(email: string) {
    setIsSubmitting(true);
    setError(undefined);
    const { error: signInError } = await authClient.signIn.magicLink({
      email,
      callbackURL: callbackUrl,
    });
    setIsSubmitting(false);
    if (signInError) {
      setError("Something went wrong sending the sign-in link. Try again.");
      return;
    }
    router.push("/sign-in/check-email");
  }

  function handleGoogleSignIn() {
    authClient.signIn.social({ provider: "google", callbackURL: callbackUrl });
  }

  return (
    <SignInStep
      onEmailSubmit={handleEmailSubmit}
      onGoogleSignIn={handleGoogleSignIn}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
}
