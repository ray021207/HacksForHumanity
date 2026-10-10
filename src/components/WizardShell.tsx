import type { ReactNode } from "react";
import Image from "next/image";

export interface Doodle {
  src: string;
  className: string;
}

export function WizardShell({
  headerPill,
  eyebrow,
  title,
  description,
  children,
  onBack,
  progress,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondary,
  belowPrimary,
  doodles,
}: {
  /** Small pill in the top-right of the header, e.g. "Your results", "1 of 4". */
  headerPill?: string;
  /** Small label above the headline, e.g. "Based on your answers". */
  eyebrow?: string;
  /** The big serif headline. */
  title: string;
  /** Supporting line under the headline. */
  description?: string;
  children?: ReactNode;
  /** When provided and `belowPrimary` is not, renders a "Back" link under the primary button. */
  onBack?: () => void;
  /** 0 to 1; renders a thin pink progress bar at the very top when provided. */
  progress?: number;
  /** The single bottom pill action (e.g. "Next", "Get started"). */
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  /** Extra content rendered just above the primary button. */
  secondary?: ReactNode;
  /** Small centered link/text rendered below the primary button, replacing the default "Back" link. */
  belowPrimary?: ReactNode;
  /** Decorative doodles (star/ghost/blob), absolutely positioned via className. */
  doodles?: Doodle[];
}) {
  const footerLink =
    belowPrimary ??
    (onBack && (
      <button type="button" onClick={onBack} className="text-xs text-tertiary-fg underline">
        Back
      </button>
    ));

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-primary-bg">
      {typeof progress === "number" && (
        <div className="h-1 w-full bg-secondary-bg">
          <div
            className="h-full rounded-r-full bg-prup transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, Math.round(progress * 100)))}%` }}
          />
        </div>
      )}

      {doodles?.map((d, idx) => (
        <Image key={idx} src={d.src} alt="" width={60} height={70} aria-hidden className={d.className} />
      ))}

      <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-5 pb-8">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg tracking-tight text-primary-fg">kin&amp;d</span>
          {headerPill && (
            <span className="ml-auto rounded-full bg-secondary-bg px-3 py-1 text-xs font-medium text-secondary-fg">
              {headerPill}
            </span>
          )}
        </div>

        <div className="mt-8 flex-1">
          {eyebrow && <p className="text-sm text-secondary-fg">{eyebrow}</p>}
          <h1 className="mt-1 font-serif text-3xl leading-tight text-primary-fg">{title}</h1>
          {description && <p className="mt-2 text-sm text-secondary-fg">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-8 space-y-3">
          {secondary}
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="w-full rounded-full bg-primary-fg py-3.5 text-sm font-semibold text-primary-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {primaryLabel}
          </button>
          {footerLink && <div className="text-center">{footerLink}</div>}
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
          ? "border-prup bg-purp-faded text-prup"
          : "border-secondary-bg bg-primary-bg text-primary-fg hover:border-tertiary-fg"
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
        selected
          ? "border-prup bg-purp-faded text-prup"
          : "border-secondary-bg bg-primary-bg text-secondary-fg"
      }`}
    >
      {children}
    </button>
  );
}

/** Small filled pink pill used for technique/category labels (e.g. "Open question"). */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-purp-faded px-3 py-1 text-xs font-medium text-prup">
      {children}
    </span>
  );
}
