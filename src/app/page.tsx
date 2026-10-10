import Link from "next/link";

export default function Landing() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <h1 className="text-4xl font-bold italic leading-tight text-ink">Welcome to kin&amp;d</h1>
        <p className="mt-2 text-lg italic text-ink/70">Where the first word finds the door</p>

        <p className="mt-6 text-sm italic leading-relaxed text-ink/60">
          Whether you&apos;re a parent, grandparent, foster parent, aunt or uncle, or any other
          kind of caregiver, kin&amp;d helps you find a few gentle things you could actually say
          before a hard conversation. Sign in with your email to get started — your answers and
          situation history are saved to your account.
        </p>

        <Link
          href="/sign-in"
          className="mt-8 block w-full rounded-full bg-terracotta py-3.5 text-center text-sm font-semibold text-cream"
        >
          Sign in to get started
        </Link>
      </div>
    </div>
  );
}
