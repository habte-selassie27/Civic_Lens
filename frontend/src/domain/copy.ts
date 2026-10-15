/**
 * Single source of truth for UI copy (UI-CivicLens 7.2, 11).
 *
 * Rules enforced here and tested by lib/tests/copy.guard.test.ts:
 * - Outcome and reason copy is neutral: never loaded terms
 *   ("failed", "broken", "liar", "fraud", "false", "lied", ...).
 * - `inconclusive` is never styled or worded as a failure.
 * - Every enum value has copy; unknown values fall back to neutral text.
 * - One name per action: Register commitment, Add evidence,
 *   Request review, Open challenge.
 */

import type { Provenance } from "./fixtures";
import type {
  CommitmentStatus,
  DataMode,
  EvidenceType,
  ReasonCode,
  RegistrantRole,
  ResultStatus,
  RetrievalStatus,
  ReviewStatus,
  RoundTrigger,
  SourceClass,
} from "./types";

// ---------------------------------------------------------------------------
// Outcomes and results (the neutral vocabulary)
// ---------------------------------------------------------------------------
export const OUTCOME_LABEL: Record<ReviewStatus, string> = {
  supported: "Evidence supports",
  contradicted: "Evidence contradicts",
  inconclusive: "Inconclusive",
};

/** Result chip label for any per-criterion status, including not-yet-reviewed. */
export const RESULT_LABEL: Record<ResultStatus, string> = {
  ...OUTCOME_LABEL,
  pending: "Review pending",
};

export const OVERALL_REASON_LABEL: Record<string, string> = {
  all_required_supported:
    "Every required criterion is supported by published evidence.",
  required_criterion_contradicted:
    "Published evidence conflicts with at least one required criterion.",
};

export const REASON_LABEL: Record<ReasonCode, string> = {
  supporting_evidence_found: "Published evidence addresses this criterion.",
  contradicting_evidence_found:
    "Published evidence conflicts with this criterion.",
  threshold_met:
    "The extracted figure meets the criterion's stated threshold.",
  threshold_not_met:
    "The extracted figure does not meet the criterion's stated threshold.",
  no_relevant_evidence:
    "No submitted evidence addresses this criterion yet.",
  evidence_unavailable:
    "A source couldn't be reached during the review.",
  source_conflict:
    "Authoritative sources disagree on this criterion.",
  criterion_ambiguous:
    "The criterion's wording can't be matched to evidence. A clearer version may help.",
  unit_mismatch:
    "The figure was reported in a different unit than the criterion uses.",
  review_incomplete:
    "The review could not complete a judgement on this criterion.",
  figure_unverified:
    "A figure was reported but could not be tied to a quoted passage in the source.",
  period_mismatch:
    "The figure's reporting period or scope does not clearly match the criterion.",
};

/** What's missing or conflicting, and what could resolve it (for inconclusive). */
export const INCONCLUSIVE_RESOLUTION: Record<ReasonCode, string> = {
  supporting_evidence_found: "",
  contradicting_evidence_found: "",
  threshold_met: "",
  threshold_not_met: "",
  no_relevant_evidence:
    "What could resolve this: submit a source that addresses the criterion, or a clearer criterion version.",
  evidence_unavailable:
    "What could resolve this: try the review again later, or submit a copy of the source as new evidence.",
  source_conflict:
    "What could resolve this: a criterion that names which source wins, or evidence that reconciles the sources.",
  criterion_ambiguous:
    "What could resolve this: a new commitment version with a sharper criterion. The remedy is a clearer commitment, not a guess.",
  unit_mismatch:
    "What could resolve this: evidence reporting the figure in the criterion's unit.",
  review_incomplete:
    "What could resolve this: request the review again. Nothing about the commitment is implied either way.",
  figure_unverified:
    "What could resolve this: a source that states the figure in a quoted passage.",
  period_mismatch:
    "What could resolve this: evidence whose reporting period and scope match the criterion.",
};

/**
 * Retrieval status copy. A source that could not be read is never evidence for
 * or against anything — the wording must say "not read", never "not found".
 */
/**
 * Provenance of a bundled demo record. The demo mixes two very different things
 * — replays of real on-chain rounds and authored illustrations — so each one
 * has to say which it is before a reader looks at any outcome.
 */
export const PROVENANCE_LABEL: Record<Provenance, string> = {
  recorded_on_chain: "Replay of a recorded on-chain result",
  authored_illustration: "Authored illustration",
};

/**
 * The honest caveat shown under every demo record, whichever kind it is.
 * Wording is deliberately uniform so neither kind can read as more real than
 * the other by omission.
 */
export const PROVENANCE_NOTE: Record<Provenance, string> = {
  recorded_on_chain:
    "Replayed from a round that was actually reviewed by consensus on the network. " +
    "It shows what that review decided; it does not claim the same decision would " +
    "be reached again. Appeals and finality still apply.",
  authored_illustration:
    "Authored for the demo. The organization and its documents are fictional and " +
    "were never reviewed on the network. This shows how the contract would behave, " +
    "not something it decided.",
};

export const RETRIEVAL_LABEL: Record<RetrievalStatus, string> = {
  fetched: "Read",
  unreachable: "Could not be reached",
  http_error: "The source returned an error",
  blocked: "Blocked: not a public address",
  unsupported_format: "Format could not be read",
  empty: "The page had no readable text",
  unknown: "Retrieval status not recorded",
};

/** True only for a source a validator actually managed to read. */
export const RETRIEVAL_IS_READ: Record<RetrievalStatus, boolean> = {
  fetched: true,
  unreachable: false,
  http_error: false,
  blocked: false,
  unsupported_format: false,
  empty: false,
  unknown: false,
};

/**
 * Declared source class. This is derived from the submitter's own type label and
 * is NEVER verified by the contract or by consensus, so the UI must present it
 * as a declaration.
 */
export const SOURCE_CLASS_LABEL: Record<SourceClass, string> = {
  primary: "Declared primary source",
  self_published: "Declared self-published",
  secondary: "Declared secondary report",
  unclassified: "Unclassified source",
};

/** Overall reason fallback: unknown codes still read as neutral sentences. */
export function overallReasonCopy(reason: string | undefined): string {
  if (!reason) return "Outcome derived from the per-criterion results.";
  return (
    OVERALL_REASON_LABEL[reason] ??
    REASON_LABEL[reason as ReasonCode] ??
    "Outcome derived from the per-criterion results."
  );
}

export function reasonCopy(reason: string | undefined): string {
  if (!reason) return "No reason recorded.";
  return REASON_LABEL[reason as ReasonCode] ?? "Recorded reason not recognized.";
}

// ---------------------------------------------------------------------------
// Statuses, roles, types
// ---------------------------------------------------------------------------
export const STATUS_LABEL: Record<CommitmentStatus, string> = {
  evidence_open: "Evidence window open",
  review_pending: "Review pending",
  outcome_accepted: "Outcome accepted",
  challenged: "Challenged",
  withdrawn: "Withdrawn",
  superseded: "Superseded",
};

export const TRIGGER_LABEL: Record<RoundTrigger, string> = {
  initial: "Initial review",
  challenge: "Review after a challenge",
};

export const ROLE_LABEL: Record<RegistrantRole, string> = {
  organization: "for their own organization",
  observer: "as an observer",
};

export const ROLE_SHORT_LABEL: Record<RegistrantRole, string> = {
  organization: "Own organization",
  observer: "Observer",
};

export const DATA_MODE_LABEL: Record<DataMode, string> = {
  sample: "Sample data",
  live: "Live evidence",
};

/**
 * The persistent chrome chip describes the BUILD's data source, never the
 * current page's contents. A configured contract renders "Live contract
 * configured"; each surface still carries its own Sample data / Live evidence
 * badge, so the chrome can never claim a page is live when it is replaying a
 * recorded sample.
 */
export const APP_SOURCE_LABEL = {
  configured: "Live contract configured",
  sampleOnly: "Sample data",
} as const;

export const APP_SOURCE_TITLE = {
  configured:
    "A deployed CivicLens contract is configured in this build. Each surface labels where its own data came from.",
  sampleOnly:
    "No contract address is configured, so every surface in this app reads bundled sample data.",
} as const;

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  official_report: "Official report",
  audited_statement: "Audited statement",
  government_dataset: "Government dataset",
  press_release: "Press release",
  news_article: "News article",
  other: "Other",
};

/** Plain-language mapping for evidence that was eligible but not cited. */
export const NOT_USED_LABEL = "Considered, not used";

// ---------------------------------------------------------------------------
// Actions (one name per action everywhere: button, toast, status)
// ---------------------------------------------------------------------------
export const ACTION = {
  registerCommitment: "Register commitment",
  addEvidence: "Add evidence",
  requestReview: "Request review",
  openChallenge: "Open challenge",
  supersede: "Create new version",
  withdraw: "Withdraw",
} as const;

// ---------------------------------------------------------------------------
// Transaction lifecycle wording (UI spec section 6)
// ---------------------------------------------------------------------------

/** Phases of a write, derived from the Intelligent Contract tx receipt. */
export type TxPhase =
  | "submitted"
  | "pending"
  | "accepted"
  | "final"
  | "dropped"
  | "rejected"
  | "reverted";

export const TX_PHASE_LABEL: Record<TxPhase, string> = {
  submitted: "Submitted to the network",
  pending: "Validators are reviewing",
  accepted: "Accepted — can still be appealed",
  final: "Final",
  dropped: "Didn't complete: validators did not reach a decision.",
  rejected: "Didn't complete: validators disagreed with the proposal.",
  reverted: "Didn't complete: the contract rejected the request.",
};

// ---------------------------------------------------------------------------
// Error prefix mapping (UI spec section 7.1)
// ---------------------------------------------------------------------------
export interface MappedError {
  /** Stable contract error string, shown only inside a Details disclosure. */
  detail: string;
  /** Neutral user-facing sentence. */
  message: string;
  /** Whether retrying makes sense without changing input. */
  retryable: boolean;
}

export function mapError(raw: unknown): MappedError {
  const detail = raw instanceof Error ? raw.message : String(raw ?? "Unknown error");

  if (detail.includes("EXPECTED:")) {
    // Show the contract's own stable reason; it says what to fix.
    const reason = detail.slice(detail.indexOf("EXPECTED:") + "EXPECTED:".length).trim();
    return { detail, message: reason || "That request can't be completed as written.", retryable: false };
  }
  if (detail.includes("EXTERNAL:")) {
    return {
      detail,
      message: "A source couldn't be reached. Try again later.",
      retryable: true,
    };
  }
  if (detail.includes("TRANSIENT:")) {
    return {
      detail,
      message: "Temporary problem. Try again.",
      retryable: true,
    };
  }
  if (detail.includes("LLM_ERROR:")) {
    return {
      detail,
      message: "The review couldn't be completed. Try again.",
      retryable: true,
    };
  }
  return {
    detail,
    message: "The request didn't go through. Try again.",
    retryable: true,
  };
}

// ---------------------------------------------------------------------------
// Neutral-language guard
// ---------------------------------------------------------------------------
/**
 * Terms that may never appear in outcome, reason, status, or result copy.
 * Tested against every string above by lib/tests/copy.guard.test.ts.
 */
export const LOADED_TERMS = [
  "failed",
  "failure",
  "broken",
  "liar",
  "lied",
  "fraud",
  "fraudulent",
  "false",
  "dishonest",
  "deceptive",
  "cheat",
  "scam",
  "guilty",
  "unfulfilled",
  "non-compliant",
] as const;

const NEUTRAL_COPY_SOURCES: Array<Record<string, string>> = [
  OUTCOME_LABEL,
  RESULT_LABEL,
  OVERALL_REASON_LABEL,
  REASON_LABEL,
  INCONCLUSIVE_RESOLUTION,
  STATUS_LABEL,
  TRIGGER_LABEL,
  ROLE_LABEL,
  ROLE_SHORT_LABEL,
  DATA_MODE_LABEL,
  APP_SOURCE_LABEL,
  APP_SOURCE_TITLE,
  EVIDENCE_TYPE_LABEL,
  TX_PHASE_LABEL,
  RETRIEVAL_LABEL,
  SOURCE_CLASS_LABEL,
  PROVENANCE_LABEL,
];

/** Returns the loaded terms found in the neutral copy map (empty = pass). */
export function findLoadedTerms(): string[] {
  const found: string[] = [];
  for (const source of NEUTRAL_COPY_SOURCES) {
    for (const [key, value] of Object.entries(source)) {
      const lower = value.toLowerCase();
      for (const term of LOADED_TERMS) {
        // word-boundary-ish match so "unfalse" style substrings don't trip
        const re = new RegExp(`\\b${term}\\b`, "i");
        if (re.test(lower)) {
          found.push(`${key}: "${value}" contains "${term}"`);
        }
      }
    }
  }
  return found;
}
