/**
 * CivicLens domain types — mirror the deployed contract's view shapes.
 *
 * Field names come from contracts/civic_lens.py view methods and are
 * confirmed against the saved schema (docs/deployment.md) before wiring.
 * No SDK types here: services adapt SDK results to these shapes.
 */

// ---------------------------------------------------------------------------
// Enums (values mirror the contract's constants exactly)
// ---------------------------------------------------------------------------
export const SUBJECT_KINDS = ["organization", "institution", "individual"] as const;
export type SubjectKind = (typeof SUBJECT_KINDS)[number];

export const REGISTRANT_ROLES = ["organization", "observer"] as const;
export type RegistrantRole = (typeof REGISTRANT_ROLES)[number];

export const DATA_MODES = ["live", "sample"] as const;
export type DataMode = (typeof DATA_MODES)[number];

export const EVIDENCE_TYPES = [
  "official_report",
  "audited_statement",
  "government_dataset",
  "press_release",
  "news_article",
  "other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const OPERATORS = ["gte", "lte"] as const;
export type Operator = (typeof OPERATORS)[number];

export const COMMITMENT_STATUSES = [
  "evidence_open",
  "review_pending",
  "outcome_accepted",
  "challenged",
  "withdrawn",
  "superseded",
] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

export const REVIEW_STATUSES = ["supported", "contradicted", "inconclusive"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REASON_CODES = [
  "supporting_evidence_found",
  "contradicting_evidence_found",
  "threshold_met",
  "threshold_not_met",
  "no_relevant_evidence",
  "evidence_unavailable",
  "source_conflict",
  "criterion_ambiguous",
  "unit_mismatch",
] as const;
export type ReasonCode = (typeof REASON_CODES)[number];

export const ROUND_TRIGGERS = ["initial", "challenge"] as const;
export type RoundTrigger = (typeof ROUND_TRIGGERS)[number];

/** UI-only: a commitment that has not been reviewed yet shows "pending". */
export type ResultStatus = ReviewStatus | "pending";

// ---------------------------------------------------------------------------
// Contract view shapes
// ---------------------------------------------------------------------------
export interface Criterion {
  id: number;
  text: string;
  measure: string;
  required: boolean;
  has_threshold: boolean;
  threshold_milli: number;
  operator: Operator | "";
  unit: string;
  deadline: string;
}

export interface Commitment {
  id: number;
  registrant: string;
  registrant_role: RegistrantRole;
  subject: string;
  subject_kind: SubjectKind;
  source_statement_ref: string;
  commitment_text: string;
  criteria: Criterion[];
  period_start: string;
  period_end: string;
  timezone: string;
  source_guidance: string;
  data_mode: DataMode;
  status: CommitmentStatus;
  version: number;
  supersedes: number;
  round_count: number;
  challenge_count: number;
  evidence_count: number;
  current_round: number;
}

export interface CommitmentSummary {
  id: number;
  subject: string;
  status: CommitmentStatus;
  data_mode: DataMode;
  registrant_role: RegistrantRole;
  version: number;
  round_count: number;
  evidence_count: number;
  period_start: string;
  period_end: string;
}

export interface EvidenceItem {
  id: number;
  url: string;
  evidence_type: EvidenceType;
  published_date: string;
  note: string;
  submitter: string;
  submitted_at: string;
}

export interface CriterionResult {
  criterion_id: number;
  status: ReviewStatus;
  reason_code: ReasonCode;
  evidence_used: number[];
  evidence_considered_not_used: number[];
  has_figure: boolean;
  figure_milli: number;
  unit: string;
  summary: string;
}

export interface RoundRecord {
  round: number;
  trigger: RoundTrigger;
  challenge_id: number;
  criteria_version: number;
  criteria: CriterionResult[];
  overall_outcome: ReviewStatus;
  overall_reason: string;
  evidence_considered: number[];
  evaluated_at: string;
}

export interface OutcomeCounts {
  supported: number;
  contradicted: number;
  inconclusive: number;
}

export interface Outcome {
  commitment_id: number;
  has_outcome: boolean;
  round: number;
  status: CommitmentStatus;
  /** Present only when has_outcome is true. */
  trigger?: RoundTrigger;
  overall_outcome?: ReviewStatus;
  overall_reason?: string;
  criteria_version?: number;
  evaluated_at?: string;
  required_total?: number;
  counts?: OutcomeCounts;
}

export interface ChallengeRecord {
  id: number;
  round_challenged: number;
  challenger: string;
  target: string;
  grounds: string;
  new_evidence_ids: number[];
  opened_at: string;
}

export interface ContractConstants {
  max_criteria: number;
  max_evidence: number;
  max_evidence_per_submitter: number;
  max_rounds: number;
  max_challenges_per_party: number;
  max_new_evidence_per_challenge: number;
  max_page_size: number;
  subject_kinds: SubjectKind[];
  registrant_roles: RegistrantRole[];
  data_modes: DataMode[];
  evidence_types: EvidenceType[];
  operators: Operator[];
  review_statuses: ReviewStatus[];
  reason_codes: ReasonCode[];
  commitment_statuses: CommitmentStatus[];
}

// ---------------------------------------------------------------------------
// UI-level state
// ---------------------------------------------------------------------------

/** Finality as observed client-side from the transaction lifecycle.
 *  The contract cannot observe its own finality; the UI derives this from
 *  the receipt status and shows it on every outcome (UI spec 5.4). */
export type FinalityState = "none" | "accepted" | "final" | "unknown";

export interface CriterionDraft {
  text: string;
  measure: string;
  required: boolean;
  has_threshold: boolean;
  threshold_milli: number;
  operator: Operator;
  unit: string;
  deadline: string;
}
