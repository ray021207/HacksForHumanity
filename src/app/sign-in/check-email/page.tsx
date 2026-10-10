export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
        <h1 className="display text-d32 italic">Check your inbox</h1>
        <p className="text-muted text-d16 mt-3">
          We sent a sign-in link to your email. Click it to continue — you can close this tab.
        </p>
      </div>
    </div>
  );
}
