export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <h1 className="text-3xl font-bold italic leading-tight text-ink">Check your inbox</h1>
        <p className="mt-4 text-sm text-ink/60">
          We sent a sign-in link to your email. Click it to continue — you can close this tab.
        </p>
      </div>
    </div>
  );
}
