/**
 * WindowStrip — where today sits relative to the evaluation period.
 *
 * The period is what a review counts as eligible evidence (get_constants()
 * date_semantics: ISO dates compared date-only). The strip makes three things
 * visible that otherwise go unstated: the period is a fixed window, how much
 * of it remains, and that until a review completes the outcome stays pending —
 * a closed window is never presented as a finding.
 */

import type { CommitmentStatus } from "@/domain/types";
import { formatDate } from "@/domain/format";
import { dayCount, windowState, type WindowPhase } from "@/domain/window";

const SEGMENTS: Array<{ key: WindowPhase; label: string }> = [
  { key: "before", label: "Before the period" },
  { key: "during", label: "Within the period" },
  { key: "after", label: "After the period" },
];

export interface WindowStripProps {
  periodStart: string;
  periodEnd: string;
  timezone?: string;
  status: CommitmentStatus;
  hasOutcome: boolean;
  /** Injected in tests; defaults to now. */
  now?: Date;
}

export function WindowStrip({
  periodStart,
  periodEnd,
  timezone,
  status,
  hasOutcome,
  now,
}: WindowStripProps) {
  const state = windowState(periodStart, periodEnd, now);
  if (!state) return null;

  const pending =
    !hasOutcome && ["evidence_open", "review_pending", "challenged"].includes(status);
  const range = `Evaluation period ${formatDate(periodStart)} – ${formatDate(periodEnd)}.`;

  let when: string;
  if (state.phase === "before") {
    when = `Today is before it — it starts in ${dayCount(
      state.daysUntilStart ?? 0,
    )}. Evidence dated inside the period is what the review counts.`;
  } else if (state.phase === "during") {
    when =
      state.daysLeft === 0
        ? "The period ends today. Evidence dated inside it is what the review counts."
        : `The period is open; it ends in ${dayCount(
            state.daysLeft ?? 0,
          )} (${formatDate(periodEnd)}). Evidence dated inside it is what the review counts.`;
  } else {
    when = `The period ended ${dayCount(
      state.daysSinceEnd ?? 0,
    )} ago (${formatDate(periodEnd)}). Evidence dated inside it still counts when a review runs.`;
  }

  return (
    <div className="window-strip">
      <ol className="window-strip__track" aria-label="Evaluation period timeline">
        {SEGMENTS.map((segment) => (
          <li
            key={segment.key}
            className="window-strip__seg"
            aria-current={state.phase === segment.key ? "step" : undefined}
          >
            {segment.label}
          </li>
        ))}
      </ol>
      <p className="hint">
        {range} {when}
        {timezone ? ` Dates are calendar days in ${timezone}, as recorded.` : ""}
        {pending
          ? " Until a review completes, the outcome stays pending — pending is not a finding."
          : ""}
      </p>
    </div>
  );
}

export default WindowStrip;
