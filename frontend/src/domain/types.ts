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
  "review_incomplete",
  "figure_unverified",
  "period_mismatch",
] as const;
export type ReasonCode = (typeof REASON_CODES)[number];

/** Per-source retrieval status recorded on every round (contract RETRIEVAL_*). */
export const RETRIEVAL_STATUSES = [
  "fetched",
  "unreachable",
  "http_error",
  "blocked",
  "unsupported_format",
  "empty",
  "unknown",
] as const;
export type RetrievalStatus = (typeof RETRIEVAL_STATUSES)[number];

/** Declared source class, derived from the declared evidence type. Unverified. */
export const SOURCE_CLASSES = [
  "primary",
  "self_published",
  "secondary",
  "unclassified",
] as const;
export type SourceClass = (typeof SOURCE_CLASSES)[number];

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
  /** 0 until a newer version replaces this one (version chain). */
  superseded_by: number;
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
  /** 0 until a newer version replaces this one (version chain). */
  superseded_by: number;
  round_count: number;
  evidence_count: number;
  period_start: string;
  period_end: string;
}

export interface EvidenceItem {
  id: number;
  url: string;
  evidence_type: EvidenceType;
  /** Derived from the declared type; a submitter label, never verified. */
  declared_source_class: SourceClass;
  source_class_verified: boolean;
  published_date: string;
  /** Always false: the contract cannot verify a submitter-declared date. */
  published_date_verified: boolean;
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
  /** Verbatim passage the verdict rests on; "" when none was verified. */
  source_quote: string;
  /** Evidence id the verified quote came from; 0 when none. */
  source_evidence_id: number;
  /** True only when a numeric figure was tied to a verbatim passage. */
  figure_verified: boolean;
  /** True when a challenge round did not change this and the prior was kept. */
  held_from_prior: boolean;
}

/** What actually happened when a validator tried to read one source. */
export interface RetrievalRecord {
  evidence_id: number;
  source: "evidence" | "statement";
  status: RetrievalStatus;
  url: string;
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
  retrieval: RetrievalRecord[];
  data_mode: DataMode;
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
  /** Criteria whose result a challenge round kept from the previous round. */
  held_from_prior_count?: number;
  /** How many sources were fetched vs could not be read. */
  retrieval_counts?: Partial<Record<RetrievalStatus, number>>;
  superseded_by?: number;
  /** The contract's own statement of what an outcome means. */
  outcome_meaning?: string;
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
  max_quote_len?: number;
  subject_kinds: SubjectKind[];
  registrant_roles: RegistrantRole[];
  data_modes: DataMode[];
  evidence_types: EvidenceType[];
  source_classes?: Record<string, string>;
  operators: Operator[];
  review_statuses: ReviewStatus[];
  reason_codes: ReasonCode[];
  retrieval_statuses?: RetrievalStatus[];
  commitment_statuses: CommitmentStatus[];
  /** Plain-language semantics, authored in the contract and mirrored here. */
  date_semantics?: string;
  threshold_semantics?: string;
  data_mode_semantics?: string;
  outcome_meaning?: string;
  challenge_semantics?: string;
  figure_verification_semantics?: string;
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
