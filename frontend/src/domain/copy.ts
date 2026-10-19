/**
 * Single source of truth for UI copy (UI-CivicLens 7.2, 11).
 *
 * Rules enforced here and tested by tests/copy.guard.test.ts:
 * - Outcome and reason copy is neutral: never loaded terms
 *   ("failed", "broken", "liar", "fraud", "false", "lied", ...).
 * - `inconclusive` is never styled or worded as a failure.
 * - Every enum value has copy; unknown values fall back to neutral text.
 * - One name per action: Register commitment, Add evidence,
 *   Request review, Open challenge.
 *
 * TRANSLATION: the maps below hold catalog KEYS, not English. `lazyMap`
 * resolves a key at access time, so every call site keeps its exact current
 * syntax (`STATUS_LABEL[row.status]`) and still follows the active locale.
 * The English text lives in i18n/messages/en.ts, which is what the copy guard
 * reads (it resolves keys in the active locale).
 */

import { lazyMap, t } from "@/i18n";
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
export const OUTCOME_LABEL = lazyMap<ReviewStatus>({
  supported: "outcome.supported",
  contradicted: "outcome.contradicted",
  inconclusive: "outcome.inconclusive",
});

/** Result chip label for any per-criterion status, including not-yet-reviewed. */
export const RESULT_LABEL = lazyMap<ResultStatus>({
  supported: "outcome.supported",
  contradicted: "outcome.contradicted",
  inconclusive: "outcome.inconclusive",
  pending: "result.pending",
});

export const OVERALL_REASON_LABEL = lazyMap<string>({
  all_required_supported: "overall_reason.all_required_supported",
  required_criterion_contradicted: "overall_reason.required_criterion_contradicted",
});

export const REASON_LABEL = lazyMap<ReasonCode>({
  supporting_evidence_found: "reason.supporting_evidence_found",
  contradicting_evidence_found: "reason.contradicting_evidence_found",
  threshold_met: "reason.threshold_met",
  threshold_not_met: "reason.threshold_not_met",
  no_relevant_evidence: "reason.no_relevant_evidence",
  evidence_unavailable: "reason.evidence_unavailable",
  source_conflict: "reason.source_conflict",
  criterion_ambiguous: "reason.criterion_ambiguous",
  unit_mismatch: "reason.unit_mismatch",
  review_incomplete: "reason.review_incomplete",
  figure_unverified: "reason.figure_unverified",
  period_mismatch: "reason.period_mismatch",
});

/**
 * Why an inconclusive result is inconclusive, and what could resolve it. Only
 * the reasons that actually produce `inconclusive` carry text; the rest return
 * "" so a caller can render nothing rather than an empty paragraph.
 */
const RESOLUTION_KEYS: Partial<Record<ReasonCode, string>> = {
  no_relevant_evidence: "resolution.no_relevant_evidence",
  evidence_unavailable: "resolution.evidence_unavailable",
  source_conflict: "resolution.source_conflict",
  criterion_ambiguous: "resolution.criterion_ambiguous",
  unit_mismatch: "resolution.unit_mismatch",
  review_incomplete: "resolution.review_incomplete",
  figure_unverified: "resolution.figure_unverified",
  period_mismatch: "resolution.period_mismatch",
};

export function resolutionCopy(reason: ReasonCode | undefined): string {
  if (!reason) return "";
  const key = RESOLUTION_KEYS[reason];
  return key ? t(key) : "";
}

/**
 * Retrieval status copy. A source that could not be read is never evidence for
 * or against anything — the wording must say "not read", never "not found".
 */
export const RETRIEVAL_LABEL = lazyMap<RetrievalStatus>({
  fetched: "retrieval.fetched",
  unreachable: "retrieval.unreachable",
  http_error: "retrieval.http_error",
  blocked: "retrieval.blocked",
  unsupported_format: "retrieval.unsupported_format",
  empty: "retrieval.empty",
  unknown: "retrieval.unknown",
});

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
 * Provenance of a bundled demo record. The demo mixes two very different things
 * — replays of real on-chain rounds and authored illustrations — so each one
 * has to say which it is before a reader looks at any outcome.
 */
export const PROVENANCE_LABEL = lazyMap<Provenance>({
  recorded_on_chain: "provenance.recorded_on_chain",
  authored_illustration: "provenance.authored_illustration",
});

/**
 * The honest caveat shown under every demo record, whichever kind it is.
 * Wording is deliberately uniform so neither kind can read as more real than
 * the other by omission.
 */
export const PROVENANCE_NOTE = lazyMap<Provenance>({
  recorded_on_chain: "provenance.note.recorded_on_chain",
  authored_illustration: "provenance.note.authored_illustration",
});

/**
 * Declared source class. This is derived from the submitter's own type label and
 * is NEVER verified by the contract or by consensus, so the UI must present it
 * as a declaration.
 */
export const SOURCE_CLASS_LABEL = lazyMap<SourceClass>({
  primary: "source_class.primary",
  self_published: "source_class.self_published",
  secondary: "source_class.secondary",
  unclassified: "source_class.unclassified",
});

/** Overall reason fallback: unknown codes still read as neutral sentences. */
export function overallReasonCopy(reason: string | undefined): string {
  if (!reason) return t("error.unknown_overall_reason");
  return (
    OVERALL_REASON_LABEL[reason] ??
    REASON_LABEL[reason as ReasonCode] ??
    t("error.unknown_overall_reason")
  );
}

export function reasonCopy(reason: string | undefined): string {
  if (!reason) return t("error.no_reason");
  return REASON_LABEL[reason as ReasonCode] ?? t("error.unknown_reason");
}

// ---------------------------------------------------------------------------
// Statuses, roles, types
// ---------------------------------------------------------------------------
export const STATUS_LABEL = lazyMap<CommitmentStatus>({
  evidence_open: "status.evidence_open",
  review_pending: "status.review_pending",
  outcome_accepted: "status.outcome_accepted",
  challenged: "status.challenged",
  withdrawn: "status.withdrawn",
  superseded: "status.superseded",
});

export const TRIGGER_LABEL = lazyMap<RoundTrigger>({
  initial: "trigger.initial",
  challenge: "trigger.challenge",
});

export const ROLE_LABEL = lazyMap<RegistrantRole>({
  organization: "role.organization",
  observer: "role.observer",
});

export const ROLE_SHORT_LABEL = lazyMap<RegistrantRole>({
  organization: "role_short.organization",
  observer: "role_short.observer",
});

export const DATA_MODE_LABEL = lazyMap<DataMode>({
  sample: "data_mode.sample",
  live: "data_mode.live",
});

/**
 * The persistent chrome chip describes the BUILD's data source, never the
 * current page's contents. A configured contract renders "Live contract
 * configured"; each surface still carries its own Sample data / Live evidence
 * badge, so the chrome can never claim a page is live when it is replaying a
 * recorded sample.
 */
export const APP_SOURCE_LABEL = lazyMap({
  configured: "app_source.configured",
  sampleOnly: "app_source.sample_only",
});

export const APP_SOURCE_TITLE = lazyMap({
  configured: "app_source.title.configured",
  sampleOnly: "app_source.title.sample_only",
});

export const EVIDENCE_TYPE_LABEL = lazyMap<EvidenceType>({
  official_report: "evidence_type.official_report",
  audited_statement: "evidence_type.audited_statement",
  government_dataset: "evidence_type.government_dataset",
  press_release: "evidence_type.press_release",
  news_article: "evidence_type.news_article",
  other: "evidence_type.other",
});

/** Plain-language mapping for evidence that was eligible but not cited. */
export function notUsedLabel(): string {
  return t("label.not_used");
}

// ---------------------------------------------------------------------------
// Actions (one name per action everywhere: button, toast, status)
// ---------------------------------------------------------------------------
export const ACTION = lazyMap({
  registerCommitment: "action.register_commitment",
  addEvidence: "action.add_evidence",
  requestReview: "action.request_review",
  openChallenge: "action.open_challenge",
  supersede: "action.supersede",
  withdraw: "action.withdraw",
});

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
  | "reverted"
  | "not_sent";

export const TX_PHASE_LABEL = lazyMap<TxPhase>({
  submitted: "tx_phase.submitted",
  pending: "tx_phase.pending",
  accepted: "tx_phase.accepted",
  final: "tx_phase.final",
  dropped: "tx_phase.dropped",
  rejected: "tx_phase.rejected",
  reverted: "tx_phase.reverted",
  // Nothing reached the network, so no validator saw it and no receipt exists.
  // Distinct from `rejected`, which is a real MAJORITY_DISAGREE verdict.
  not_sent: "tx_phase.not_sent",
});

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
    return { detail, message: reason || t("error.expected"), retryable: false };
  }
  if (detail.includes("EXTERNAL:")) {
    return { detail, message: t("error.external"), retryable: true };
  }
  if (detail.includes("TRANSIENT:")) {
    return { detail, message: t("error.transient"), retryable: true };
  }
  if (detail.includes("LLM_ERROR:")) {
    return { detail, message: t("error.llm"), retryable: true };
  }
  return { detail, message: t("error.unknown"), retryable: true };
}

// ---------------------------------------------------------------------------
// Neutral-language guard
// ---------------------------------------------------------------------------
/**
 * Terms that may never appear in outcome, reason, status, or result copy.
 * Tested against every string above by tests/copy.guard.test.ts — in English
 * AND in every translation (tests/i18n.test.ts), so a translator cannot
 * reintroduce failure language in another language.
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
