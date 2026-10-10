import { Suspense } from "react";
import { SignInPageClient } from "./SignInPageClient";

// Reads the callbackUrl search param at request time via useSearchParams(),
// so it can't be part of the static shell under Cache Components.
export const instant = false;

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageClient />
    </Suspense>
  );
}
