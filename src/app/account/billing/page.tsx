import Link from "next/link";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/getAuthSession";
import { db } from "@/db";
import { subscriptions, usageCounters } from "@/db/schema";
import { FREE_LIMIT } from "@/lib/billingConstants";
import { BillingActions } from "@/components/BillingActions";
import { SignOutButton } from "@/components/SignOutButton";

// Reads the session on every request (via getAuthSession -> headers()), so
// it can't be part of the static shell under Cache Components. This is the
// documented quick-migration escape hatch rather than a full Suspense +
// `use cache: private` refactor — see
// node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md
export const instant = false;

export default async function BillingPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .limit(1);
  const [usage] = await db
    .select()
    .from(usageCounters)
    .where(eq(usageCounters.userId, session.user.id))
    .limit(1);

  const isSubscribed = sub?.status === "active" || sub?.status === "past_due";
  const used = usage?.freeGenerationsUsed ?? 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <Link href="/plan" className="text-muted text-d16 underline">
          ‹ Back to app
        </Link>

        <h1 className="display text-d32 mt-3 italic">Your plan</h1>

        {isSubscribed ? (
          <p className="text-muted text-d16 mt-3">
            You&apos;re on the kin&amp;d plan. Thanks for supporting the project.
          </p>
        ) : (
          <p className="text-muted text-d16 mt-3">
            You&apos;ve used {used} of {FREE_LIMIT} free situations. Upgrade for unlimited
            conversation-starter cards.
          </p>
        )}

        <BillingActions isSubscribed={isSubscribed} />
        <SignOutButton />
      </div>
    </div>
  );
}
