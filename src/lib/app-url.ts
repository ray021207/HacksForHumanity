/**
 * Where "Get started" sends people.
 *
 * This used to be an absolute URL behind NEXT_PUBLIC_APP_URL, back when the
 * landing page and the app were two deployments on two domains. They are one
 * app now, so the handoff is an ordinary route — same origin, same bundle,
 * prefetchable like any other link.
 */
export const PLAN_HREF = '/plan';
