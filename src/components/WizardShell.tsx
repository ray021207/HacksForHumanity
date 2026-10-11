import type { ReactNode } from "react";
import Icon from "./Icon";
import Mascot, { type MascotName } from "./Mascot";

/**
 * The frame every /plan screen sits in (family through cards — not
 * ConsentStep, which stays on the landing page's own palette since it's the
 * handoff point between the two).
 *
 * Deliberately NOT on the landing page's ink/canvas/field tokens: this uses
 * its own palette (primary-fg/primary-bg/secondary-fg/secondary-bg/
 * tertiary-fg/prup/purp-faded, defined in globals.css) and DM Serif Display
 * for the headline instead of the landing page's DM Serif Text. Both token
 * sets live in the same stylesheet without colliding — nothing outside this
 * file and the step components it wraps references these names, so this is
 * a real second palette, not a themed variant of the first.
 *
 * Layout (nav height subtraction, safe-area handling, 8px spacing base,
 * d16/d24/d32 type ladder) is still shared with the rest of the site — only
 * colour and the headline face are scoped to the wizard.
 */
export function WizardShell({
  title,
  description,
  children,
  onBack,
  progress,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondary,
  mascot,
  headerPill,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  /** Shows a back chevron top-left when provided. */
  onBack?: () => void;
  /** 0 to 1; renders a thin progress bar at the very top when provided. */
  progress?: number;
  /** The single bottom pill action (e.g. "Continue", "Start", "Get conversation starters"). */
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  /** Extra content rendered just above the primary button (e.g. a secondary link). */
  secondary?: ReactNode;
  /** One of the three characters, shown above the title. Steps that ask for
      something heavy (a situation, a profile) are the ones that want one. */
  mascot?: MascotName;
  /** Small pill at the top-right of the screen, e.g. "3 of 16", "1 of 4". */
  headerPill?: string;
}) {
  return (
    <div className="flex min-h-[calc(100svh_-_var(--nav-h))] w-full flex-1 flex-col">
      {typeof progress === "number" && (
        // Pinned directly beneath the header (and so beneath the safe-area
        // inset the header pads itself by) rather than scrolling away with the
        // content, now that a screen can be taller than the fold.
        <div className="bg-secondary-bg sticky top-[var(--nav-h)] z-40 h-1 w-full">
          <div
            className="bg-prup rounded-r-pill h-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, Math.round(progress * 100)))}%` }}
          />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-2 pt-3 pb-5 lg:px-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="bg-secondary-bg text-primary-fg hover:bg-purp-faded rounded-pill grid size-5 place-items-center transition-colors"
            >
              {/* The sprite's chevron points down; a quarter turn clockwise
                  lands it pointing back the way the user came. */}
              <Icon name="chevron" size={18} className="rotate-90" />
            </button>
          )}
          {headerPill && (
            <span className="bg-secondary-bg text-secondary-fg rounded-pill text-d16 ml-auto px-2 py-1">
              {headerPill}
            </span>
          )}
        </div>
        {(onBack || headerPill) && <div className="mb-1" />}
        {mascot && <Mascot name={mascot} size={56} className="mb-2" />}
        {title && <h1 className="font-serif text-d32 text-primary-fg">{title}</h1>}
        {description && <p className="text-secondary-fg text-d16 mt-1">{description}</p>}
        <div className="mt-3 flex-1">{children}</div>
        {/* The action comes first and the fine print sits under it: the
            sentence that names the button ("By clicking Start...") reads as a
            consequence of the thing above it rather than as a hurdle in front
            of it, and the button lands at a thumb-reachable height instead of
            being pushed up by however many lines the notice wraps to. */}
        <div className="mt-s3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="bg-primary-fg text-primary-bg rounded-pill text-d16 shadow-bar w-full py-2 text-center font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {primaryLabel}
          </button>
          {secondary}
        </div>
      </div>
    </div>
  );
}

/** Full-width answer row: one of several, one gets picked. */
export function PillOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-field text-d16 block w-full px-3 py-2 text-left transition-colors ${
        selected
          ? "bg-purp-faded text-prup"
          : "bg-secondary-bg text-primary-fg hover:bg-purp-faded/60"
      }`}
    >
      {children}
    </button>
  );
}

/** The same choice as a chip, for answers that sit in a row. */
export function PillChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-pill text-d16 px-3 py-1 transition-colors ${
        selected
          ? "bg-purp-faded text-prup"
          : "bg-secondary-bg text-primary-fg hover:bg-purp-faded/60"
      }`}
    >
      {children}
    </button>
  );
}
