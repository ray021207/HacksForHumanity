import Link from "next/link";

export default function SignInErrorPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <h1 className="text-3xl font-bold italic leading-tight text-ink">Sign-in didn&apos;t work</h1>
        <p className="mt-4 text-sm text-ink/60">
          That link may have expired or already been used. Try signing in again.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 block w-full rounded-full bg-terracotta py-3.5 text-center text-sm font-semibold text-cream"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
