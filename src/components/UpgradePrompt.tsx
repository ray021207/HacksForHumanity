import Link from "next/link";
import { FREE_LIMIT } from "@/lib/billingConstants";

export function UpgradePrompt({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-lg text-ink"
        >
          ‹
        </button>

        <h1 className="mt-5 text-3xl font-bold italic leading-tight text-ink">
          You&apos;ve used your {FREE_LIMIT} free situations
        </h1>
        <p className="mt-4 text-sm text-ink/60">
          Upgrade to kin&amp;d to keep getting conversation-starter cards for every situation.
        </p>
        <Link
          href="/account/billing"
          className="mt-8 block w-full rounded-full bg-terracotta py-3.5 text-center text-sm font-semibold text-cream"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
