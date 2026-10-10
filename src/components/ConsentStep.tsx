import { useState } from "react";
import Image from "next/image";

export function ConsentStep({ onAccept }: { onAccept: () => void }) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-primary-bg">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-8 pb-8">
        <span className="text-center font-serif text-xl tracking-tight text-primary-fg">kin&amp;d</span>

        <div className="mt-4 flex justify-center">
          <span className="rounded-full bg-secondary-bg px-3 py-1 text-xs font-medium text-secondary-fg">
            01 &nbsp;Understand the moment
          </span>
        </div>

        <div className="mt-8 flex-1">
          <h1 className="text-center font-serif text-3xl leading-tight text-primary-fg">
            &ldquo;She used to tell me everything. Now she goes straight to her room.&rdquo;
          </h1>
          <p className="mt-4 text-center text-sm text-secondary-fg">
            Tell us what&apos;s going on. We&apos;ll help you find the first words.
          </p>

          <div className="relative mt-10 flex h-48 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#cfe8f5] via-[#f6dced] to-[#ffe3cf]">
            <div className="flex items-end gap-2">
              <Image src="/doodles/blob.svg" alt="" width={56} height={74} />
              <Image src="/doodles/ghost.svg" alt="" width={50} height={70} />
              <Image src="/doodles/star.svg" alt="" width={48} height={52} />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-center text-xs text-tertiary-fg">
            By continuing you agree to the{" "}
            <button type="button" onClick={() => setShowTerms(true)} className="underline">
              terms and conditions
            </button>
            .
          </p>
          <button
            type="button"
            onClick={onAccept}
            className="w-full rounded-full bg-primary-fg py-3.5 text-sm font-semibold text-primary-bg"
          >
            Get started
          </button>
          <p className="text-center text-xs text-tertiary-fg">Not therapy. Just a gentle place to start.</p>
        </div>
      </div>

      {showTerms && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-primary-fg/40 p-0 sm:items-center sm:p-5"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-primary-bg p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-primary-fg">Terms and conditions</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-secondary-fg">
              <li>No chat — a short questionnaire once, then cards for each situation.</li>
              <li>Your answers stay in your browser, never on our server.</li>
              <li>We never store what you describe, the child or ward&apos;s name, or their birthdate.</li>
              <li>Dangerous situations get crisis resources instead of generated cards.</li>
              <li>AI-generated, not therapy or medical advice.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="mt-6 w-full rounded-full bg-primary-fg py-3 text-sm font-semibold text-primary-bg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
