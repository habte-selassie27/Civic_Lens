/**
 * ConsensusNote — validator votes for the transaction this page resolved.
 *
 * "{n} of {m} validators agreed" is read straight from the IC receipt's last
 * round (genlayer-js `lastRound.validatorVotesName`). When the receipt has no
 * votes yet the note renders nothing: consensus is never implied.
 *
 * The appeal-window state is a sentence, not a timing promise — this build
 * does not know when a window closes, only that FINALIZED means it has.
 */

import type { ValidatorAgreement } from "@/domain/finality";
import type { FinalityState } from "@/domain/types";

export interface ConsensusNoteProps {
  votes: ValidatorAgreement | null;
  finality: FinalityState;
}

export function ConsensusNote({ votes, finality }: ConsensusNoteProps) {
  if (!votes || (finality !== "accepted" && finality !== "final")) return null;

  const round = typeof votes.round === "number" ? ` in round ${votes.round}` : "";
  return (
    <p className="hint consensus-note">
      {votes.agreed} of {votes.total} validators agreed{round}.{" "}
      {finality === "final"
        ? "The transaction finalized, so the appeal window has closed."
        : "The appeal window is still open — an appeal can change this outcome."}
    </p>
  );
}

export default ConsensusNote;
