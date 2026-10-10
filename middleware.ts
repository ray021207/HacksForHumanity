import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/", "/sign-in"];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/sign-in/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/stripe/webhook";

  if (isPublic) {
    return NextResponse.next();
  }

  // Optimistic cookie-presence check only — no DB round trip here. Every
  // gated route/page also verifies the session itself (defense in depth),
  // since a stale or tampered cookie shouldn't be trusted on its own.
  const sessionCookie = getSessionCookie(req);
  if (sessionCookie) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", req.nextUrl.origin);
  signInUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
