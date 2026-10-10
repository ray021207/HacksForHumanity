import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.customer) break;

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        let currentPeriodEnd: Date | undefined;
        if (subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
          if (periodEnd) currentPeriodEnd = new Date(periodEnd * 1000);
        }

        await db
          .insert(subscriptions)
          .values({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            status: "active",
            currentPeriodEnd,
          })
          .onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              status: "active",
              currentPeriodEnd,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
        await db
          .update(subscriptions)
          .set({
            status: sub.status,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, sub.customer as string));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeCustomerId, sub.customer as string));
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook handler failed for ${event.type}`, err);
    // Non-200 so Stripe retries — a missed webhook silently desyncs billing state.
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
