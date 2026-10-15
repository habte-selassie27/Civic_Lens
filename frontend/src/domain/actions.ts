/**
 * Action availability (UI-CivicLens 5.12, section 13 state machine).
 *
 * ONE place decides whether an action is enabled and, when it is not, the
 * sentence that says why. The rules mirror contracts/civic_lens.py exactly:
 *
 *   submit_evidence  allowed in evidence_open | outcome_accepted | challenged
 *   request_review  allowed in evidence_open (initial) | challenged (challenge);
 *                   registrant only
 *   open_challenge   allowed in outcome_accepted, round < MAX_ROUNDS,
 *                   and at most one per party
 *   withdraw         registrant only, evidence_open only (terminal)
 *   supersede        registrant only, not already superseded or withdrawn;
 *                   the only way to change criteria
 *
 * The contract is authoritative and will re-check all of this. The client
 * check exists so the UI can explain a disabled control instead of offering a
 * button that is guaranteed to be rejected.
 */

import type { Commitment, ContractConstants } from "./types";
import { formatDate } from "./format";

/**
 * Every value `overall_reason` can take in contracts/civic_lens.py:
 * the two definite derivations plus the inconclusive reasons, in the contract's
 * own priority order. The copy guard asserts every one of these has neutral
 * display copy — a new one cannot be added to the contract unnoticed.
 */
export const OVERALL_REASONS_USED = [
  "all_required_supported",
  "required_criterion_contradicted",
  "criterion_ambiguous",
  "source_conflict",
  "unit_mismatch",
  "evidence_unavailable",
  "no_relevant_evidence",
] as const;

export interface ActionAvailability {
  enabled: boolean;
  /** Present only when disabled — the words shown under the control. */
  reason?: string;
}

const OK: ActionAvailability = { enabled: true };

/** Shared guard: no writes at all without a configured contract. */
function sampleGuard(writesAvailable: boolean, commitment: Commitment): ActionAvailability | null {
  if (writesAvailable) return null;
  if (commitment.data_mode === "sample") {
    return {
      enabled: false,
      reason:
        "This is sample data — there is no contract behind it. Actions are disabled so nothing is ever faked.",
    };
  }
  return {
    enabled: false,
    reason: "No contract address is configured in this build, so writes are unavailable.",
  };
}

export interface ActionContext {
  commitment: Commitment;
  constants: ContractConstants;
  /** Whether this browser's account can write at all. */
  writesAvailable: boolean;
  /** True when this account is the registrant. */
  isRegistrant: boolean;
  /** Challenges already opened by this account. */
  challengesByAccount: number;
  /** Evidence already submitted by this account. */
  evidenceByAccount: number;
}

export function canSubmitEvidence(ctx: ActionContext): ActionAvailability {
  const guard = sampleGuard(ctx.writesAvailable, ctx.commitment);
  if (guard) return guard;

  const { commitment: c, constants } = ctx;

  if (c.evidence_count >= constants.max_evidence) {
    return {
      enabled: false,
      reason: `This commitment already holds the maximum of ${constants.max_evidence} sources.`,
    };
  }
  if (ctx.evidenceByAccount >= constants.max_evidence_per_submitter) {
    return {
      enabled: false,
      reason: `You have submitted the maximum of ${constants.max_evidence_per_submitter} sources to this commitment.`,
    };
  }

  if (["review_pending"].includes(c.status)) {
    return { enabled: false, reason: "A review is in progress for this commitment." };
  }
  if (c.status === "withdrawn") {
    return { enabled: false, reason: "This commitment was withdrawn by its registrant." };
  }
  if (c.status === "superseded") {
    return {
      enabled: false,
      reason: "A newer version of this commitment replaced it. Add evidence to the newer version.",
    };
  }
  return OK;
}

export function canRequestReview(ctx: ActionContext): ActionAvailability {
  const guard = sampleGuard(ctx.writesAvailable, ctx.commitment);
  if (guard) return guard;

  const { commitment: c, constants } = ctx;

  if (!ctx.isRegistrant) {
    return {
      enabled: false,
      reason: "Only the registrant who registered this commitment can request a review.",
    };
  }
  if (c.current_round >= constants.max_rounds) {
    return {
      enabled: false,
      reason: `This commitment has used all ${constants.max_rounds} review rounds.`,
    };
  }

  switch (c.status) {
    case "evidence_open":
      return OK;
    case "challenged":
      return OK;
    case "review_pending":
      return { enabled: false, reason: "A review is already pending for this round." };
    case "outcome_accepted":
      return {
        enabled: false,
        reason: "This round has been reviewed. Open a challenge to start a new round instead.",
      };
    case "withdrawn":
      return { enabled: false, reason: "This commitment was withdrawn by its registrant." };
    case "superseded":
      return {
        enabled: false,
        reason: "A newer version replaced this commitment.",
      };
    default:
      return { enabled: false, reason: "This commitment is not open for review." };
  }
}

export function canOpenChallenge(ctx: ActionContext): ActionAvailability {
  const guard = sampleGuard(ctx.writesAvailable, ctx.commitment);
  if (guard) return guard;

  const { commitment: c, constants } = ctx;

  if (c.status !== "outcome_accepted") {
    if (c.status === "challenged") {
      return { enabled: false, reason: "This round has already been challenged." };
    }
    if (c.current_round === 0) {
      return {
        enabled: false,
        reason: "There is no accepted outcome to challenge yet.",
      };
    }
    return { enabled: false, reason: "There is no accepted outcome to challenge." };
  }
  if (c.current_round >= constants.max_rounds) {
    return {
      enabled: false,
      reason: `All ${constants.max_rounds} review rounds have been used, so no further challenge can be opened.`,
    };
  }
  if (ctx.challengesByAccount >= constants.max_challenges_per_party) {
    return {
      enabled: false,
      reason: `The contract allows ${constants.max_challenges_per_party} challenge per party, and you have used it.`,
    };
  }
  return OK;
}

/**
 * Shared context for the two registrant-only lifecycle actions. Deliberately
 * narrower than ActionContext: neither withdraw nor supersede consults the
 * contract's bounds, so callers need not supply them.
 */
export interface RegistrantActionContext {
  commitment: Commitment;
  /** Whether this browser's account can write at all. */
  writesAvailable: boolean;
  /** True when this account is the registrant. */
  isRegistrant: boolean;
}

export function canWithdraw(ctx: RegistrantActionContext): ActionAvailability {
  const guard = sampleGuard(ctx.writesAvailable, ctx.commitment);
  if (guard) return guard;

  const { commitment: c } = ctx;

  if (!ctx.isRegistrant) {
    return {
      enabled: false,
      reason: "Only the registrant who registered this commitment can withdraw it.",
    };
  }
  // Contract rule: withdraw_commitment accepts only evidence_open.
  if (c.status === "withdrawn") {
    return { enabled: false, reason: "This commitment is already withdrawn." };
  }
  if (c.status === "superseded") {
    return {
      enabled: false,
      reason: "A newer version replaced this commitment, so there is nothing to withdraw.",
    };
  }
  if (c.status !== "evidence_open") {
    return {
      enabled: false,
      reason: "Withdrawal is only possible while the evidence window is open.",
    };
  }
  return OK;
}

export function canSupersede(ctx: RegistrantActionContext): ActionAvailability {
  const guard = sampleGuard(ctx.writesAvailable, ctx.commitment);
  if (guard) return guard;

  const { commitment: c } = ctx;

  if (!ctx.isRegistrant) {
    return {
      enabled: false,
      reason: "Only the registrant who registered this commitment can create a new version.",
    };
  }
  // Contract rule: supersede_commitment rejects an already superseded or
  // withdrawn record; every other status may be superseded.
  if (c.status === "superseded") {
    return {
      enabled: false,
      reason: "A newer version of this commitment already exists.",
    };
  }
  if (c.status === "withdrawn") {
    return {
      enabled: false,
      reason: "This commitment was withdrawn. Register a new commitment instead.",
    };
  }
  return OK;
}

/** True once any review has produced a record for the current round. */
export function hasOutcome(commitment: Commitment): boolean {
  return commitment.current_round > 0;
}

/** Plain one-liner describing where the commitment sits right now. */
export function statusSentence(commitment: Commitment): string {
  const period = `${formatDate(commitment.period_start)} – ${formatDate(commitment.period_end)}`;
  switch (commitment.status) {
    case "evidence_open":
      return `Evidence window is open. Evaluation period ${period}.`;
    case "review_pending":
      return "A review is in progress. Validators are reading the sources on file.";
    case "outcome_accepted":
      return `Round ${commitment.current_round} was reviewed on ${
        commitment.evidence_count
      } source${commitment.evidence_count === 1 ? "" : "s"}. Evaluation period ${period}.`;
    case "challenged":
      return "A challenge is open. The next round will include the attached evidence.";
    case "withdrawn":
      return "The registrant withdrew this commitment. The record is kept.";
    case "superseded":
      return "A newer version of this commitment replaced it.";
    default:
      return "";
  }
}