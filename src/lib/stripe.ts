import Stripe from "stripe";

// Lazily constructed: a module-level `new Stripe(...)` would throw during
// Next's build-time page-data collection (which imports route modules
// without a request and without env vars necessarily set yet).
let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-09-30.endive",
    });
  }
  return _stripe;
}
