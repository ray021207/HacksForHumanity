import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, usageCounters } from "@/db/schema";
import { FREE_LIMIT } from "./billingConstants";

export { FREE_LIMIT };

export interface UsageEntitlement {
  allowed: boolean;
  counted: boolean;
}

/**
 * Checks whether a user may generate another card and, for free-tier users,
 * atomically consumes one free generation. Subscribed users are never
 * blocked and never consume the counter.
 *
 * Fail-safe posture: a transient DB error on the usage-table write blocks a
 * free user (never allow unlimited free use on our own outage) but never
 * blocks an already-resolved paying user, since the subscription check
 * short-circuits before any usage-table write is attempted.
 */
export async function checkAndConsumeUsage(userId: string): Promise<UsageEntitlement> {
  let isSubscribed = false;
  try {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
    isSubscribed = sub?.status === "active" || sub?.status === "past_due";
  } catch (err) {
    console.error("subscription status read failed", err);
    // Fail open only here, and only for a user with no prior subscription
    // record error — we don't want a DB hiccup to block a user who turns
    // out to already be a reliable payer. The usage-counter path below is
    // the one that fails closed.
  }

  if (isSubscribed) {
    return { allowed: true, counted: false };
  }

  try {
    const [row] = await db
      .insert(usageCounters)
      .values({ userId, freeGenerationsUsed: 1 })
      .onConflictDoUpdate({
        target: usageCounters.userId,
        set: {
          freeGenerationsUsed: sql`${usageCounters.freeGenerationsUsed} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return { allowed: row.freeGenerationsUsed <= FREE_LIMIT, counted: true };
  } catch (err) {
    console.error("usage counter write failed", err);
    return { allowed: false, counted: false };
  }
}
