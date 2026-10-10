import type { ReactNode } from "react";
import Icon from "./Icon";
import Mascot, { type MascotName } from "./Mascot";

/**
 * The frame every questionnaire screen sits in.
 *
 * This used to be its own app with its own palette (cream, terracotta, Tailwind's
 * default 4px spacing). It now draws on the same tokens as the landing page: the
 * 8px spacing base, the d16/d24/d32 type ladder, `display` for headings, and
 * surface/field/line for the chrome. It sets no page background — the root
 * layout owns that, so the nav and footer wrap the wizard like they wrap every
 * other route.
 *
 * Answer states are the landing page's two pairs, the ones the hero's own
 * question chips use (FieldFamily): blush on blush-ink for a picked answer,
 * field on ink for an unpicked one, hovering to panel-2. Both are flat fills
 * with no border — the old ink-on-white selection read as a system control
 * rather than as the same product the visitor just scrolled through.
 *
 * The screen is a full viewport tall measured from under the header
 * (100svh - --nav-h), so header plus screen fill the fold exactly and the
 * footer sits just below it rather than competing with the primary action.
 * svh, not vh, so mobile Safari's collapsing toolbars can't push the bottom
 * pill off-screen.
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
}) {
  return (
    <div className="flex min-h-[calc(100svh_-_var(--nav-h))] w-full flex-1 flex-col">
      {typeof progress === "number" && (
        // Pinned directly beneath the header (and so beneath the safe-area
        // inset the header pads itself by) rather than scrolling away with the
        // content, now that a screen can be taller than the fold.
        <div className="bg-field sticky top-[var(--nav-h)] z-40 h-1 w-full">
          <div
            className="bg-ink rounded-r-pill h-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, Math.round(progress * 100)))}%` }}
          />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-2 pt-3 pb-5 lg:px-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="bg-field text-ink hover:bg-panel-2 rounded-pill mb-3 grid size-5 place-items-center transition-colors"
          >
            {/* The sprite's chevron points down; a quarter turn clockwise
                lands it pointing back the way the user came. */}
            <Icon name="chevron" size={18} className="rotate-90" />
          </button>
        )}
        {mascot && <Mascot name={mascot} size={56} className="mb-2" />}
        {title && <h1 className="display text-d32">{title}</h1>}
        {description && <p className="text-muted text-d16 mt-1">{description}</p>}
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
            className="bg-ink rounded-pill text-d16 shadow-bar w-full py-2 text-center font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
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
        selected ? "bg-blush text-blush-ink" : "bg-field text-ink hover:bg-panel-2"
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
        selected ? "bg-blush text-blush-ink" : "bg-field text-ink hover:bg-panel-2"
      }`}
    >
      {children}
    </button>
  );
}
