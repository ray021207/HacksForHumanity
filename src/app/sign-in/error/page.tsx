import Link from "next/link";

export default function SignInErrorPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <h1 className="display text-d32 italic">Sign-in didn&apos;t work</h1>
        <p className="text-muted text-d16 mt-3">
          That link may have expired or already been used. Try signing in again.
        </p>
        <Link
          href="/sign-in"
          className="bg-ink rounded-pill text-d16 shadow-bar mt-8 block w-full py-2 text-center font-medium text-white"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
