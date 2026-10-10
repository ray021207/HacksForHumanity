import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/getAuthSession";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  let customerId = existing?.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: session.user.email,
      metadata: { userId },
    });
    customerId = customer.id;
    await db
      .insert(subscriptions)
      .values({ userId, stripeCustomerId: customerId })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { stripeCustomerId: customerId },
      });
  }

  const origin = new URL(req.url).origin;
  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/account/billing?checkout=success`,
    cancel_url: `${origin}/account/billing?checkout=canceled`,
    metadata: { userId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
