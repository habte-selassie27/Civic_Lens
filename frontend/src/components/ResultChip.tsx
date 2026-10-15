/**
 * ResultChip (UI-CivicLens 5.2) — icon shape + text label, never color alone.
 *
 * `inconclusive` gets a dashed outline and a neutral color on purpose: it means
 * "no determination", not "bad". There is no red variant of this component.
 */

import type { ResultStatus } from "@/domain/types";
import { RESULT_LABEL } from "@/domain/copy";
import {
  ContradictedMark,
  InconclusiveMark,
  PendingMark,
  SupportedMark,
} from "./Marks";

const MARK_BY_STATUS = {
  supported: SupportedMark,
  contradicted: ContradictedMark,
  inconclusive: InconclusiveMark,
  pending: PendingMark,
} as const;

export interface ResultChipProps {
  status: ResultStatus;
  /** Overrides the label (e.g. to say "Overall" in the outcome block). */
  label?: string;
  className?: string;
}

export function ResultChip({ status, label, className }: ResultChipProps) {
  const Mark = MARK_BY_STATUS[status] ?? PendingMark;
  const text = label ?? RESULT_LABEL[status] ?? "Inconclusive";

  return (
    <span className={["chip", `chip--${status}`, className].filter(Boolean).join(" ")}>
      <span className="chip__mark">
        <Mark />
      </span>
      {text}
    </span>
  );
}

export default ResultChip;