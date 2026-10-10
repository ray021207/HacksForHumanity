"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="mt-3 w-full rounded-full border border-ink/15 py-3.5 text-sm font-semibold text-ink disabled:opacity-50"
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
