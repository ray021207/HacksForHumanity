import { useState } from "react";
import { WizardShell } from "./WizardShell";
import Mascot, { type MascotName } from "./Mascot";

/**
 * The three characters and the period of their dance, big to small.
 *
 * Sizes are deliberately uneven: three mascots on one baseline at one size
 * read as a toolbar, and the whole point of the stage is that they read as a
 * group of somebodies. Each `delay` is negative so the character is already
 * mid-move on the first frame — nobody is caught standing still waiting for
 * their turn — and the three are offset from each other as well, so the
 * trio never lands on a pose all at once.
 */
const DANCERS: {
  name: MascotName;
  size: number;
  dance: string;
  shadow: string;
  delay: string;
}[] = [
  {
    name: "block",
    size: 62,
    dance: "animate-dance-sway",
    shadow: "animate-dance-shadow-slow",
    delay: "-0.4s",
  },
  {
    name: "ghost",
    size: 86,
    dance: "animate-dance-bob",
    shadow: "animate-dance-shadow",
    delay: "-1.1s",
  },
  {
    name: "star",
    size: 58,
    dance: "animate-dance-tip",
    shadow: "animate-dance-shadow-fast",
    delay: "-0.7s",
  },
];

/**
 * The trio dancing, each over its own contact shadow.
 *
 * Two shadows per character, doing two different jobs. The `drop-shadow` on
 * the SVG travels with the shape and keeps it from looking pasted onto the
 * canvas. The blurred ellipse underneath stays on the floor and squashes on
 * the character's own period, which is what reads as weight. Behind all three
 * sits one blush glow at a 42px blur, far enough out that it never resolves
 * into an edge — it just makes the floor look lit.
 */
function DanceStage() {
  return (
    <div aria-hidden="true" className="relative flex items-end justify-center gap-1 sm:gap-2">
      <span className="bg-blush/70 absolute inset-x-[-8%] top-1 bottom-[-6%] -z-10 rounded-full blur-[42px]" />

      {DANCERS.map((dancer) => (
        <div key={dancer.name} className="flex flex-col items-center">
          <div className={dancer.dance} style={{ animationDelay: dancer.delay }}>
            <Mascot
              name={dancer.name}
              size={dancer.size}
              className="drop-shadow-[0_12px_20px_rgb(22_17_14_/_0.22)]"
            />
          </div>
          <span
            className={`bg-ink/40 ${dancer.shadow} mt-[2px] block rounded-full blur-[6px]`}
            style={{
              width: dancer.size * 0.6,
              height: Math.max(5, dancer.size * 0.1),
              animationDelay: dancer.delay,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function ConsentStep({ onAccept }: { onAccept: () => void }) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <WizardShell
      title=""
      primaryLabel="Start"
      onPrimary={onAccept}
      secondary={
        <p className="text-muted text-d16 text-center">
          By clicking Start you agree to the{" "}
          <button type="button" onClick={() => setShowTerms(true)} className="underline">
            terms and conditions
          </button>
          .
        </p>
      }
    >
      {/* Light coming into the top of the screen: the four mesh tints under a
          90px blur, each drifting on its own slow cycle, with a shimmer band
          sweeping across them. The layer is fixed below the header rather than
          at the viewport top, because the header paints an opaque canvas and
          would eat anything behind it. Its own bottom edge is masked to
          nothing so there is no line where the glow stops — at this blur
          radius a hard edge is the one thing that would give it away as a
          panel. z-0 against the z-10 content below: the body background is
          opaque, so a negative z-index would put the whole thing behind the
          page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-[var(--nav-h)] z-0 h-[52svh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_34%,transparent_100%)]"
      >
        <div className="absolute inset-x-[-10%] top-[-22%] h-[122%] blur-[90px]">
          <span className="bg-mesh-pink/60 animate-glow-drift absolute top-[2%] left-[6%] h-[70%] w-[46%] rounded-full" />
          <span className="bg-mesh-lilac/55 animate-glow-drift absolute top-[-6%] right-[8%] h-[76%] w-[42%] rounded-full [animation-delay:-3.5s]" />
          <span className="bg-mesh-mint/50 animate-glow-drift absolute top-[22%] left-[30%] h-[62%] w-[40%] rounded-full [animation-delay:-7s]" />
          <span className="bg-mesh-peach/50 animate-glow-drift absolute top-[30%] right-[24%] h-[54%] w-[34%] rounded-full [animation-delay:-5s]" />
        </div>

        {/* The shimmer is a sibling of the blurred mesh, not a child of it, so
            the band keeps a soft edge of its own instead of being smeared
            into the tints underneath. */}
        <span className="animate-shimmer absolute inset-y-0 left-0 w-[40%] bg-[linear-gradient(90deg,transparent,rgb(255_255_255_/_0.8),transparent)] blur-xl" />
      </div>

      <div className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center text-center">
        <DanceStage />

        <h1 className="display text-d40 mt-3 italic">Welcome to Kin&amp;d</h1>
        <p className="text-muted text-d24 mt-1 italic">Where the first word finds the door</p>

        <p className="text-muted text-d16 mt-3 max-w-[52ch] italic">
          Some conversations are hard to begin. Tell Kin&amp;d what&apos;s happening, and
          you&apos;ll get a few gentle things you could actually say, with a note on why each
          one works and what to avoid. Kin&amp;d draws on research into warm,
          listening-first parenting. It&apos;s not therapy and it won&apos;t replace a real
          conversation. It just helps you find the first words.
        </p>
      </div>

      {showTerms && (
        <div
          className="bg-ink/40 fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-3"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="bg-surface rounded-t-card sm:rounded-card max-h-[80vh] w-full max-w-[560px] overflow-y-auto p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="display text-d24">Terms and conditions</h2>
            <ul className="text-muted text-d16 mt-2 list-disc space-y-1 pl-3">
              <li>No chat — a short questionnaire once, then cards for each situation.</li>
              <li>Your answers stay in your browser, never on our server.</li>
              <li>We never store what you describe, your child&apos;s name, or their birthdate.</li>
              <li>Dangerous situations get crisis resources instead of generated cards.</li>
              <li>AI-generated, not therapy or medical advice.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="bg-ink rounded-pill text-d16 mt-3 w-full py-2 font-medium text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
