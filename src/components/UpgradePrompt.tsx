import Link from "next/link";
import { FREE_LIMIT } from "@/lib/billingConstants";

export function UpgradePrompt({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-lg text-ink"
        >
          ‹
        </button>

        <h1 className="display text-d32 mt-3 italic">
          You&apos;ve used your {FREE_LIMIT} free situations
        </h1>
        <p className="text-muted text-d16 mt-3">
          Upgrade to kin&amp;d to keep getting conversation-starter cards for every situation.
        </p>
        <Link
          href="/account/billing"
          className="bg-ink rounded-pill text-d16 shadow-bar mt-8 block w-full py-2 text-center font-medium text-white"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
