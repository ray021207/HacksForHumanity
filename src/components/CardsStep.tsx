import { useRef, useState } from "react";
import { WizardShell } from "./WizardShell";
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
  // The pushback section stays folded away until it's asked for. Handing
  // someone the words to open with and the ways it could go wrong in the same
  // breath buries the part they came for; this way the starters get read
  // first, and the primary button turns into the next thing to do.
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
  const reactions = result.anticipated_reactions ?? [];
  // Nothing to reveal means the button has only one job to offer.
  const canReveal = !isRed && reactions.length > 0 && !reactionsRevealed;

  return (
    <WizardShell
      headerPill={!isRed && starters.length > 0 ? `${activeIdx + 1} of ${starters.length}` : undefined}
      title={isRed ? "Please get help right now" : "Try one of these to start."}
      primaryLabel={canReveal ? "Prepare for their response" : "Describe another situation"}
      onPrimary={() => {
        if (!canReveal) {
          onStartOver();
          return;
        }
        setReactionsRevealed(true);
        reactionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      secondary={
        !isRed && starters.length > 0 ? (
          <button
            type="button"
            onClick={() => saveCard(activeIdx)}
            className="text-secondary-fg text-d16 mx-auto underline"
          >
            {savedIdx === activeIdx ? "Copied to clipboard" : "Save this card"}
          </button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        <p className="text-secondary-fg text-d16 italic">{result.disclosure}</p>

        {result.fixed_content && (
          <div className={`rounded-card border p-3 ${isRed ? "border-accent/40 bg-accent/10" : "border-secondary-bg bg-secondary-bg"}`}>
            <h2 className="display text-d24">{result.fixed_content.heading}</h2>
            <ul className="text-secondary-fg text-d16 mt-1 list-disc space-y-1 pl-3">
              {result.fixed_content.body.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {!isRed && result.frame && (
          <div>
            <p className="text-secondary-fg text-d16">{result.frame}</p>
            {result.before_you_start && (
              <p className="text-d16 mt-1 font-semibold">{result.before_you_start}</p>
            )}
          </div>
        )}

        {!isRed && starters.length > 0 && (
          <div>
            <div
              ref={trackRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {starters.map((starter, idx) => (
                <div
                  key={idx}
                  className="border-secondary-bg bg-primary-bg rounded-card shadow-bar w-full flex-shrink-0 snap-center border p-3"
                >
                  <span className="bg-secondary-bg text-secondary-fg rounded-pill text-d16 inline-block px-2 py-1 font-medium">
                    {techniqueLabel(starter.technique)}
                  </span>
                  <p className="text-d24 mt-2">&ldquo;{starter.text}&rdquo;</p>

                  <div className="border-secondary-bg mt-3 border-t pt-2">
                    <p className="text-d16 font-semibold">Why it works</p>
                    <p className="text-secondary-fg text-d16 mt-1">{starter.why}</p>
                  </div>

                  <div className="mt-2">
                    <p className="text-accent text-d16 font-semibold">Try to avoid</p>
                    <p className="text-accent/80 text-d16 mt-1">&ldquo;{starter.avoid}&rdquo;</p>
                  </div>

                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => sendThumb(idx, starter.technique, "up")}
                      className={`rounded-pill text-d16 border px-2 py-1 ${thumbs[idx] === "up" ? "border-primary-fg bg-primary-fg text-primary-bg" : "border-secondary-bg bg-primary-bg"}`}
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      onClick={() => sendThumb(idx, starter.technique, "down")}
                      className={`rounded-pill text-d16 border px-2 py-1 ${thumbs[idx] === "down" ? "border-primary-fg bg-primary-fg text-primary-bg" : "border-secondary-bg bg-primary-bg"}`}
                    >
                      👎
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {starters.length > 1 && (
              <div className="mt-2 flex justify-center gap-1">
                {starters.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to card ${idx + 1}`}
                    onClick={() => scrollToCard(idx)}
                    className={`h-1 rounded-full transition-all ${idx === activeIdx ? "bg-purp-faded-ink w-4" : "bg-secondary-bg w-1"}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* What the model thinks might come back, and what to do with it. The
            reaction is quoted in the other person's voice and the response in
            yours, which is the whole point of the pair — reading a line you
            dread next to a line you could actually say is what makes it
            rehearsable rather than just discouraging. */}
        {reactionsRevealed && reactions.length > 0 && (
          <div ref={reactionsRef}>
            <h3 className="text-d16 font-semibold">Prepare for their response</h3>
            <p className="text-secondary-fg text-d16 mt-1">
              A first word rarely wraps things up. Here are a few ways this could go.
            </p>
            <div className="mt-2 space-y-1">
              {reactions.map((reaction, idx) => (
                <div key={idx} className="border-secondary-bg bg-secondary-bg rounded-card border p-3">
                  <p className="text-d16 font-medium">
                    If they say: &ldquo;{reaction.reaction}&rdquo;
                  </p>
                  <p className="text-secondary-fg text-d16 mt-1">{reaction.how_to_respond}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isRed && result.setting_tip && (
          <p className="text-secondary-fg text-d16">Setting tip: {result.setting_tip}</p>
        )}
      </div>
    </WizardShell>
  );
}
