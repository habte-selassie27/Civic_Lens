/**
 * DisabledReason + ActionButton (UI-CivicLens 5.12).
 *
 * Every disabled action says WHY, in words. A greyed-out button with no
 * explanation reads as broken; "Evidence window closed on 31 Dec 2024" reads
 * as a rule.
 *
 * The reason is rendered as visible text rather than a `title` attribute, so it
 * reaches screen readers and touch users, not just hover.
 */

import type { ReactNode } from "react";

export function DisabledReason({ children }: { children: ReactNode }) {
  return <span className="disabled-reason">{children}</span>;
}

export interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  /**
   * When set, the button is disabled AND the reason is rendered beneath it.
   * Leave undefined to enable the action.
   */
  disabledReason?: string | null;
  variant?: "primary" | "quiet";
  type?: "button" | "submit";
  busy?: boolean;
  ariaControls?: string;
}

/** Minimum touch target is 44px (section 10) — enforced in CSS, not here. */
export function ActionButton({
  children,
  onClick,
  disabledReason,
  variant = "primary",
  type = "button",
  busy = false,
  ariaControls,
}: ActionButtonProps) {
  const disabled = Boolean(disabledReason) || busy;

  return (
    <span style={{ display: "inline-flex", flexDirection: "column" }}>
      <button
        type={type}
        className={`btn${variant === "quiet" ? " btn--quiet" : ""}`}
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        aria-controls={ariaControls}
        aria-busy={busy || undefined}
      >
        {busy ? <span className="spinner" aria-hidden="true" /> : null}
        {children}
      </button>
      {disabledReason ? <DisabledReason>{disabledReason}</DisabledReason> : null}
    </span>
  );
}

export default ActionButton;