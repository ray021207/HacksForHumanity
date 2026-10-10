import type { ReactNode } from "react";
import Icon from "./Icon";

/**
 * The frame every questionnaire screen sits in.
 *
 * This used to be its own app with its own palette (cream, terracotta, Tailwind's
 * default 4px spacing). It now draws on the same tokens as the landing page: the
 * 8px spacing base, the d16/d24/d32 type ladder, `display` for headings, and
 * surface/field/line for the chrome. Nothing here sets a page background or a
 * min-height — the root layout owns both, so the nav and footer wrap the wizard
 * like they wrap every other route.
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
}) {
  return (
    <div className="flex w-full flex-1 flex-col">
      {typeof progress === "number" && (
        <div className="bg-field h-1 w-full">
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
        {title && <h1 className="display text-d32">{title}</h1>}
        {description && <p className="text-muted text-d16 mt-1">{description}</p>}
        <div className="mt-3 flex-1">{children}</div>
        <div className="mt-s3 flex flex-col gap-2">
          {secondary}
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="bg-accent rounded-pill text-d16 shadow-bar w-full py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {primaryLabel}
          </button>
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
      className={`rounded-field text-d16 block w-full border px-3 py-2 text-left transition-colors ${
        selected
          ? "border-ink bg-ink text-white"
          : "border-line bg-surface text-ink hover:border-ink"
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
      className={`rounded-pill text-d16 border px-3 py-1 transition-colors ${
        selected
          ? "border-ink bg-ink text-white"
          : "border-line bg-surface text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
