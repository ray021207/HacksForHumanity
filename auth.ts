import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { Resend } from "resend";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Lazily constructed: a module-level `new Resend(...)` would throw during
// Next's build-time page-data collection, before env vars are necessarily set.
let _resend: Resend | undefined;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export const auth = betterAuth({
  baseURL: process.env.AUTH_URL,
  secret: process.env.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    // Neon's HTTP driver doesn't support multi-statement transactions.
    transaction: false,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!process.env.RESEND_API_KEY) {
          // Local-dev convenience only: no email service configured, so
          // print the sign-in link instead of silently failing. Never
          // reached in production, where RESEND_API_KEY is always set.
          console.log(`\n[kin&d] Magic sign-in link for ${email}:\n${url}\n`);
          return;
        }
        await getResend().emails.send({
          from: process.env.EMAIL_FROM ?? "kin&d <noreply@example.com>",
          to: email,
          subject: "Sign in to kin&d",
          html: `<p>Click below to sign in to kin&amp;d.</p><p><a href="${url}">Sign in</a></p><p>If you didn't request this, you can ignore this email.</p>`,
        });
      },
    }),
    // Must be last so Set-Cookie headers from server actions/route handlers land correctly.
    nextCookies(),
  ],
});
