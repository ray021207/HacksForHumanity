import { useState } from "react";
import { WizardShell } from "./WizardShell";
import type { CardsOutput } from "@/lib/generation";

export interface CardsApiResponse extends Omit<Partial<CardsOutput>, "risk_tier"> {
  risk_tier?: CardsOutput["risk_tier"] | "red";
  disclosure: string;
  fixed_content: { heading: string; body: readonly string[] } | null;
  used_fallback?: boolean;
}

export function CardsStep({
  result,
  onStartOver,
}: {
  result: CardsApiResponse;
  onStartOver: () => void;
}) {
  const [thumbs, setThumbs] = useState<Record<number, "up" | "down">>({});

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

  const isRed = result.risk_tier === "red";

  return (
    <WizardShell
      title={isRed ? "Please get help right now" : "Here's what you could say"}
      primaryLabel="Describe another situation"
      onPrimary={onStartOver}
    >
      <div className="space-y-3">
        <p className="text-muted text-d16 italic">{result.disclosure}</p>

        {result.fixed_content && (
          <div className={`rounded-card border p-3 ${isRed ? "border-accent/40 bg-accent/10" : "border-line bg-field"}`}>
            <h2 className="display text-d24">{result.fixed_content.heading}</h2>
            <ul className="text-muted text-d16 mt-1 list-disc space-y-1 pl-3">
              {result.fixed_content.body.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {!isRed && result.frame && (
          <div>
            <p className="text-muted text-d16">{result.frame}</p>
            {result.before_you_start && (
              <p className="text-d16 mt-1 font-semibold">{result.before_you_start}</p>
            )}
          </div>
        )}

        {!isRed && result.starters && (
          <div className="space-y-1">
            {result.starters.map((starter, idx) => (
              <div key={idx} className="border-line bg-surface rounded-card shadow-bar border p-3">
                <span className="bg-field text-muted rounded-pill text-d16 inline-block px-2 py-1 font-medium">
                  {starter.technique.replace("_", " ")}
                </span>
                <p className="text-d24 mt-2">&ldquo;{starter.text}&rdquo;</p>
                <p className="text-muted text-d16 mt-1">Why: {starter.why}</p>
                <p className="text-muted text-d16 mt-1">Avoid: {starter.avoid}</p>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => sendThumb(idx, starter.technique, "up")}
                    className={`rounded-pill text-d16 border px-2 py-1 ${thumbs[idx] === "up" ? "border-ink bg-ink text-white" : "border-line bg-surface"}`}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => sendThumb(idx, starter.technique, "down")}
                    className={`rounded-pill text-d16 border px-2 py-1 ${thumbs[idx] === "down" ? "border-ink bg-ink text-white" : "border-line bg-surface"}`}
                  >
                    👎
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* What the model thinks might come back, and what to do with it. The
            reaction is quoted in the other person's voice and the response in
            yours, which is the whole point of the pair — reading a line you
            dread next to a line you could actually say is what makes it
            rehearsable rather than just discouraging. */}
        {!isRed && result.anticipated_reactions && result.anticipated_reactions.length > 0 && (
          <div>
            <h3 className="text-d16 font-semibold">If they push back</h3>
            <div className="mt-1 space-y-1">
              {result.anticipated_reactions.map((reaction, idx) => (
                <div key={idx} className="border-line bg-field rounded-card border p-3">
                  <p className="text-d16 font-medium">
                    If they say: &ldquo;{reaction.reaction}&rdquo;
                  </p>
                  <p className="text-muted text-d16 mt-1">{reaction.how_to_respond}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isRed && result.setting_tip && (
          <p className="text-muted text-d16">Setting tip: {result.setting_tip}</p>
        )}
      </div>
    </WizardShell>
  );
}
