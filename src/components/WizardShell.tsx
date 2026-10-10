import type { ReactNode } from "react";
import Link from "next/link";

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
  accountLink,
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
  /** A small persistent top-right link to the account/billing page, shown only on signed-in screens. */
  accountLink?: boolean;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      {typeof progress === "number" && (
        <div className="h-1 w-full bg-ink/10">
          <div
            className="h-full rounded-r-full bg-ink transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, Math.round(progress * 100)))}%` }}
          />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-5 pb-8">
        {(onBack || accountLink) && (
          <div className="mb-5 flex items-center justify-between">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-lg text-ink"
              >
                ‹
              </button>
            ) : (
              <span />
            )}
            {accountLink && (
              <Link href="/account/billing" className="text-xs text-ink/50 underline">
                Account
              </Link>
            )}
          </div>
        )}
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
        <div className="mt-6 flex-1">{children}</div>
        <div className="mt-8 space-y-3">
          {secondary}
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="w-full rounded-full bg-terracotta py-3.5 text-sm font-semibold text-cream transition-colors disabled:cursor-not-allowed disabled:bg-terracotta-soft"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

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
      className={`block w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
        selected
          ? "border-ink bg-ink text-cream"
          : "border-ink/15 bg-white/60 text-ink hover:border-ink/40"
      }`}
    >
      {children}
    </button>
  );
}

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
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        selected ? "border-ink bg-ink text-cream" : "border-ink/20 bg-white/60 text-ink"
      }`}
    >
      {children}
    </button>
  );
}
