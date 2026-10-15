/**
 * FinalityChip (UI-CivicLens 5.4).
 *
 * Two levels, always: "Accepted — can still be appealed" and "Final".
 * Nothing in this component may imply permanence before the chain says FINALIZED.
 */

import type { FinalityState } from "@/domain/types";
import { AcceptedMark, FinalMark } from "./Marks";

const COPY: Record<Exclude<FinalityState, "none" | "unknown">, string> = {
  accepted: "Accepted — can still be appealed",
  final: "Final",
};

export interface FinalityChipProps {
  state: FinalityState;
  className?: string;
}

export function FinalityChip({ state, className }: FinalityChipProps) {
  // No accepted outcome yet: render nothing rather than a misleading chip.
  if (state === "none" || state === "unknown") return null;

  const isFinal = state === "final";
  const Mark = isFinal ? FinalMark : AcceptedMark;

  return (
    <span
      className={[
        "chip",
        isFinal ? "chip--finality-final" : "chip--finality-accepted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="chip__mark">
        <Mark />
      </span>
      {COPY[state]}
    </span>
  );
}

export default FinalityChip;