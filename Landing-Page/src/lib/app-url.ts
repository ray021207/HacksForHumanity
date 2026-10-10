/**
 * Where "Get plan" sends people.
 *
 * Phase 1 the landing page ships alone and the CTA stays on this origin. Phase
 * 2 the app goes live on its own Railway service at app.<domain>, and setting
 * NEXT_PUBLIC_APP_URL there points the button across. See DEPLOYMENT.md.
 *
 * NEXT_PUBLIC_* is inlined at build time, not read at runtime, so changing it
 * means a rebuild — and it must stay a public URL, never a secret.
 */
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '');

/** Absolute once the app has its own origin; a local path until then. */
export const PLAN_HREF = APP_URL ? `${APP_URL}/` : '/plan';

/** next/link skips prefetching cross-origin hrefs on its own. */
export const PLAN_IS_LOCAL = !APP_URL;
