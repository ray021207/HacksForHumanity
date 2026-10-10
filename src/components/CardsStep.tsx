import { useRef, useState } from "react";
import { WizardShell, Badge } from "./WizardShell";
import type { CardsOutput } from "@/lib/generation";

export interface CardsApiResponse extends Omit<Partial<CardsOutput>, "risk_tier"> {
  risk_tier?: CardsOutput["risk_tier"] | "red";
  disclosure: string;
  fixed_content: { heading: string; body: readonly string[] } | null;
  used_fallback?: boolean;
}

function techniqueLabel(technique: string): string {
  const s = technique.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CardsStep({
  result,
  onStartOver,
}: {
  result: CardsApiResponse;
  onStartOver: () => void;
}) {
  const [thumbs, setThumbs] = useState<Record<number, "up" | "down">>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [savedIdx, setSavedIdx] = useState<number | null>(null);
  const [reactionsRevealed, setReactionsRevealed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);

  async function sendThumb(idx: number, technique: string, value: "up" | "down") {
    setThumbs((t) => ({ ...t, [idx]: value }));
    try {
      await fetch("/api/feedback/thumb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technique, value }),
      });
    } catch {
      // Best-effort logging only; never block the UI on it.
    }
  }

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIdx(idx);
  }

  function scrollToCard(idx: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  async function saveCard(idx: number) {
    const starter = result.starters?.[idx];
    if (!starter) return;
    try {
      await navigator.clipboard.writeText(starter.text);
      setSavedIdx(idx);
    } catch {
      // Clipboard access can fail silently (permissions, insecure context) —
      // not worth surfacing an error for a "save" convenience action.
    }
  }

  const isRed = result.risk_tier === "red";
  const starters = result.starters ?? [];

  return (
    <WizardShell
      headerPill={!isRed && starters.length > 0 ? `${activeIdx + 1} of ${starters.length}` : undefined}
      eyebrow={isRed ? undefined : "Your first words"}
      title={isRed ? "Please get help right now" : "Try one of these to start."}
      primaryLabel={isRed || reactionsRevealed ? "Describe another situation" : "Prepare for their response"}
      onPrimary={() => {
        if (isRed || reactionsRevealed) {
          onStartOver();
        } else {
          setReactionsRevealed(true);
          reactionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
      belowPrimary={
        !isRed && starters.length > 0 ? (
          <button type="button" onClick={() => saveCard(activeIdx)} className="text-xs text-tertiary-fg underline">
            {savedIdx === activeIdx ? "Copied to clipboard" : "Save this card"}
          </button>
        ) : undefined
      }
      doodles={
        isRed ? undefined : [{ src: "/doodles/blob.svg", className: "absolute bottom-28 right-3 w-14" }]
      }
    >
      <div className="space-y-6">
        <p className="text-xs text-tertiary-fg">{result.disclosure}</p>

        {result.fixed_content && (
          <div
            className={`rounded-2xl border p-4 ${
              isRed ? "border-accent/40 bg-accent/10" : "border-secondary-bg bg-secondary-bg/40"
            }`}
          >
            <h2 className="font-semibold text-primary-fg">{result.fixed_content.heading}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-primary-fg/80">
              {result.fixed_content.body.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {!isRed && result.frame && (
          <div>
            <p className="text-sm text-secondary-fg">{result.frame}</p>
            {result.before_you_start && (
              <p className="mt-1 text-sm font-medium text-primary-fg">{result.before_you_start}</p>
            )}
          </div>
        )}

        {!isRed && starters.length > 0 && (
          <div>
            <div
              ref={trackRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {starters.map((starter, idx) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 snap-center rounded-2xl border border-secondary-bg bg-primary-bg p-5"
                >
                  <Badge>{techniqueLabel(starter.technique)}</Badge>
                  <p className="mt-3 text-xl font-semibold leading-snug text-primary-fg">
                    &ldquo;{starter.text}&rdquo;
                  </p>

                  <div className="mt-4 border-t border-secondary-bg pt-3">
                    <p className="text-xs font-semibold text-primary-fg">Why it works</p>
                    <p className="mt-1 text-sm text-secondary-fg">{starter.why}</p>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-accent">Try to avoid</p>
                    <p className="mt-1 text-sm text-accent/80">&ldquo;{starter.avoid}&rdquo;</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => sendThumb(idx, starter.technique, "up")}
                      className={`rounded-full border px-2 py-1 text-xs ${
                        thumbs[idx] === "up" ? "border-primary-fg bg-primary-fg text-primary-bg" : "border-secondary-bg"
                      }`}
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      onClick={() => sendThumb(idx, starter.technique, "down")}
                      className={`rounded-full border px-2 py-1 text-xs ${
                        thumbs[idx] === "down" ? "border-primary-fg bg-primary-fg text-primary-bg" : "border-secondary-bg"
                      }`}
                    >
                      👎
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {starters.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {starters.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to card ${idx + 1}`}
                    onClick={() => scrollToCard(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeIdx ? "w-4 bg-prup" : "w-1.5 bg-secondary-bg"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!isRed && result.anticipated_reactions && result.anticipated_reactions.length > 0 && (
          <div ref={reactionsRef}>
            <h2 className="text-sm font-semibold text-primary-fg">Prepare for their response</h2>
            <p className="mt-1 text-xs text-tertiary-fg">
              A first word rarely wraps things up — here are a few ways this could go.
            </p>
            <div className="mt-3 space-y-3">
              {result.anticipated_reactions.map((r, idx) => (
                <div key={idx} className="rounded-2xl border border-secondary-bg bg-primary-bg p-4">
                  <p className="text-sm font-medium text-primary-fg">If they say: {r.reaction}</p>
                  <p className="mt-1 text-xs text-secondary-fg">{r.how_to_respond}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isRed && result.setting_tip && (
          <p className="text-xs text-tertiary-fg">Setting tip: {result.setting_tip}</p>
        )}

        {isRed && (
          <button type="button" onClick={onStartOver} className="text-xs text-tertiary-fg underline">
            Describe another situation
          </button>
        )}
      </div>
    </WizardShell>
  );
}
