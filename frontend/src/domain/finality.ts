/**
 * Transaction lifecycle mapping (UI-CivicLens sections 5.4 and 6).
 *
 * Every write's state comes from the Intelligent Contract transaction
 * receipt — not the enclosing EVM receipt — exactly as the GenLayer docs
 * require. Enum names and numeric codes are verified against genlayer-js
 * 1.1.8 (TransactionStatus / TransactionResult / ExecutionResult).
 *
 * An accepted outcome is never shown as permanent: "accepted" and "final"
 * are distinct phases, and the UI keeps polling until FINALIZED.
 */

import { TX_PHASE_LABEL, type TxPhase } from "./copy";
import type { FinalityState } from "./types";

// Numeric fallbacks (receipt may carry numbers before names).
const STATUS_NAMES: Record<number, string> = {
  0: "UNINITIALIZED",
  1: "PENDING",
  2: "PROPOSING",
  3: "COMMITTING",
  4: "REVEALING",
  5: "ACCEPTED",
  6: "UNDETERMINED",
  7: "FINALIZED",
  8: "CANCELED",
  9: "APPEAL_REVEALING",
  10: "APPEAL_COMMITTING",
  11: "READY_TO_FINALIZE",
  12: "VALIDATORS_TIMEOUT",
  13: "LEADER_TIMEOUT",
};

const RESULT_NAMES: Record<number, string> = {
  0: "IDLE",
  1: "AGREE",
  2: "DISAGREE",
  3: "TIMEOUT",
  4: "DETERMINISTIC_VIOLATION",
  5: "NO_MAJORITY",
  6: "MAJORITY_AGREE",
  7: "MAJORITY_DISAGREE",
};

// Per-validator vote names (genlayer-js VoteType). The receipt may carry
// names or the numeric codes; this fallback mirrors voteTypeNumberToName.
const VOTE_NAMES: Record<number, string> = {
  0: "NOT_VOTED",
  1: "AGREE",
  2: "DISAGREE",
  3: "TIMEOUT",
  4: "DETERMINISTIC_VIOLATION",
};

/** Minimal receipt shape (genlayer-js GenLayerTransaction, subset we read). */
export interface ReceiptLike {
  status?: number | string;
  statusName?: string;
  /** The SDK may hand back the numeric enum or its name, depending on shape. */
  result?: number | string;
  resultName?: string;
  txExecutionResultName?: string;
  /** Last consensus round — present once validators have voted. */
  lastRound?: {
    round?: number | string;
    roundValidators?: string[];
    votesRevealed?: number | string;
    validatorVotesName?: Array<number | string>;
  };
  consensus_data?: {
    final?: boolean;
    leader_receipt?: Array<{
      execution_result?: string;
      error?: string | null;
    }>;
  };
}

export function receiptStatusName(r: ReceiptLike): string {
  if (r.statusName) return r.statusName;
  if (typeof r.status === "string") return r.status;
  if (typeof r.status === "number") return STATUS_NAMES[r.status] ?? "UNKNOWN";
  return "UNKNOWN";
}

/** Normalizes case so "MAJORITY_AGREE" and "MAJORITY_AGREE " both match. */
function normalize(value: string): string {
  return value.trim().toUpperCase();
}

export function receiptResultName(r: ReceiptLike): string {
  if (r.resultName) return r.resultName;
  // The SDK hands back either the numeric enum or its name depending on the
  // shape; both must resolve, or a decided result reads as "still pending".
  if (typeof r.result === "string") return r.result;
  if (typeof r.result === "number") return RESULT_NAMES[r.result] ?? "UNKNOWN";
  return "UNKNOWN";
}

/**
 * Derive the UI phase from the IC transaction receipt.
 *
 * committed (state changed): MAJORITY_AGREE + FINISHED_WITH_RETURN
 * reverted (agreed error, state rolled back): MAJORITY_AGREE + error
 * dropped (no state change): NO_MAJORITY / CANCELED / UNDETERMINED
 * rejected: MAJORITY_DISAGREE
 */
export function receiptPhase(r: ReceiptLike): TxPhase {
  const status = receiptStatusName(r);
  const result = receiptResultName(r);
  const exec =
    r.txExecutionResultName ??
    r.consensus_data?.leader_receipt?.[0]?.execution_result ??
    "";

  // Transient consensus / appeal lifecycle states.
  const transient = new Set([
    "PENDING",
    "PROPOSING",
    "COMMITTING",
    "REVEALING",
    "APPEAL_REVEALING",
    "APPEAL_COMMITTING",
    "READY_TO_FINALIZE",
  ]);
  if (transient.has(status)) return "pending";
  if (status === "UNINITIALIZED" || status === "UNKNOWN") return "submitted";

  if (result === "NO_MAJORITY") return "dropped";
  if (result === "MAJORITY_DISAGREE") return "rejected";
  if (
    status === "CANCELED" ||
    status === "UNDETERMINED" ||
    status === "VALIDATORS_TIMEOUT" ||
    status === "LEADER_TIMEOUT"
  ) {
    return "dropped";
  }

  if (result === "MAJORITY_AGREE" || result === "AGREE") {
    // Consensus agreed, but if the leader executed with an error the state
    // was rolled back — never show that as a successful write.
    if (normalize(exec) === "FINISHED_WITH_ERROR") return "reverted";
    return status === "FINALIZED" ? "final" : "accepted";
  }

  return status === "FINALIZED" ? "final" : "pending";
}

/** Did the write commit state? Only accepted/final phases did. */
export function phaseCommitted(phase: TxPhase): boolean {
  return phase === "accepted" || phase === "final";
}

export function phaseLabel(phase: TxPhase): string {
  return TX_PHASE_LABEL[phase];
}

/** Finality chip state (UI spec 5.4): accepted is never presented as final. */
export function finalityState(r: ReceiptLike): FinalityState {
  const phase = receiptPhase(r);
  if (phase === "final") return "final";
  if (phase === "accepted") return "accepted";
  if (phase === "submitted" || phase === "pending") return "none";
  return "unknown";
}

export function isFinalized(r: ReceiptLike): boolean {
  return normalize(receiptStatusName(r)) === "FINALIZED" || r.consensus_data?.final === true;
}

export interface ValidatorAgreement {
  /** Votes that read AGREE in the receipt's last round. */
  agreed: number;
  /** Votes revealed in that round — the list's length, not the committee size. */
  total: number;
  round: number | null;
}

/**
 * Count the validators who agreed, straight from the IC receipt. Returns null
 * when the receipt carries no votes yet — consensus is never implied.
 */
export function validatorAgreement(r: ReceiptLike): ValidatorAgreement | null {
  const votes = r.lastRound?.validatorVotesName;
  if (!votes || votes.length === 0) return null;

  let agreed = 0;
  for (const vote of votes) {
    const name =
      typeof vote === "number" ? VOTE_NAMES[vote] ?? "UNKNOWN" : vote.trim().toUpperCase();
    if (name === "AGREE") agreed += 1;
  }

  const roundNum = Number(r.lastRound?.round);
  return {
    agreed,
    total: votes.length,
    round: Number.isFinite(roundNum) ? roundNum : null,
  };
}
