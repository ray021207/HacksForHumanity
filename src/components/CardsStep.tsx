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
      accountLink
    >
      <div className="space-y-5">
        <p className="text-xs italic text-ink/50">{result.disclosure}</p>

        {result.fixed_content && (
          <div className={`rounded-2xl border p-4 ${isRed ? "border-terracotta/40 bg-terracotta/10" : "border-olive bg-olive/30"}`}>
            <h2 className="font-semibold text-ink">{result.fixed_content.heading}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
              {result.fixed_content.body.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {!isRed && result.frame && (
          <div>
            <p className="text-sm text-ink/60">{result.frame}</p>
            {result.before_you_start && (
              <p className="mt-1 text-sm font-medium text-ink">{result.before_you_start}</p>
            )}
          </div>
        )}

        {!isRed && result.starters && (
          <div className="space-y-3">
            {result.starters.map((starter, idx) => (
              <div key={idx} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                <span className="inline-block rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink/60">
                  {starter.technique.replace("_", " ")}
                </span>
                <p className="mt-2 text-sm font-medium text-ink">&ldquo;{starter.text}&rdquo;</p>
                <p className="mt-1 text-xs text-ink/60">Why: {starter.why}</p>
                <p className="mt-1 text-xs text-ink/40">Avoid: {starter.avoid}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => sendThumb(idx, starter.technique, "up")}
                    className={`rounded-full border px-2 py-1 text-xs ${thumbs[idx] === "up" ? "border-ink bg-ink text-cream" : "border-ink/15"}`}
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => sendThumb(idx, starter.technique, "down")}
                    className={`rounded-full border px-2 py-1 text-xs ${thumbs[idx] === "down" ? "border-ink bg-ink text-cream" : "border-ink/15"}`}
                  >
                    👎
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isRed && result.anticipated_reactions && result.anticipated_reactions.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-ink">Prepare for their response</h2>
            <p className="mt-1 text-xs text-ink/50">
              A first word rarely wraps things up — here are a few ways this could go.
            </p>
            <div className="mt-3 space-y-3">
              {result.anticipated_reactions.map((r, idx) => (
                <div key={idx} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                  <p className="text-sm font-medium text-ink">If they say: {r.reaction}</p>
                  <p className="mt-1 text-xs text-ink/60">{r.how_to_respond}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isRed && result.setting_tip && (
          <p className="text-xs text-ink/50">Setting tip: {result.setting_tip}</p>
        )}
      </div>
    </WizardShell>
  );
}
