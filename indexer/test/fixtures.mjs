/**
 * Shared fixtures for the indexer tests.
 * Shapes mirror docs/civic_lens.schema.json + contracts/civic_lens.py.
 */

const ISO = "2026-10-15T12:00:00.000Z";

export function summaryPayload(id, overrides = {}) {
  return {
    id,
    subject: `Sample subject ${id}`,
    status: "outcome_accepted",
    data_mode: "live",
    registrant_role: "third_party_observer",
    version: 1,
    superseded_by: 0,
    round_count: 1,
    evidence_count: 2,
    period_start: "2025-01-01",
    period_end: "2025-12-31",
    ...overrides,
  };
}

export function commitmentPayload(id, overrides = {}) {
  return {
    id,
    registrant: "0x5b3661c576c7001e6d6279c67f3779705d334c89",
    registrant_role: "third_party_observer",
    subject: `Sample subject ${id}`,
    subject_kind: "organization",
    source_statement_ref: `https://example.org/statement/${id}`,
    commitment_text: `Sample commitment text for record ${id}`,
    criteria: [
      {
        id: 1,
        text: "Emissions intensity falls",
        measure: "Reported intensity in the annual report",
        required: true,
        has_threshold: true,
        threshold_milli: 95000,
        operator: "lte",
        unit: "gco2_per_kwh",
        deadline: "",
      },
      {
        id: 2,
        text: "Third-party verification published",
        measure: "Independent audit statement",
        required: false,
        has_threshold: false,
        threshold_milli: 0,
        operator: "",
        unit: "",
        deadline: "",
      },
    ],
    period_start: "2025-01-01",
    period_end: "2025-12-31",
    timezone: "UTC",
    source_guidance: "Annual reports and government datasets",
    data_mode: "live",
    status: "outcome_accepted",
    version: 1,
    supersedes: 0,
    superseded_by: 0,
    round_count: 1,
    challenge_count: 0,
    evidence_count: 2,
    current_round: 1,
    ...overrides,
  };
}

export function outcomePayload(id, overrides = {}) {
  return {
    commitment_id: id,
    has_outcome: true,
    round: 1,
    trigger: "initial",
    overall_outcome: "supported",
    overall_reason: "all_required_supported",
    criteria_version: 1,
    evaluated_at: ISO,
    status: "outcome_accepted",
    required_total: 1,
    counts: { supported: 2, contradicted: 0, inconclusive: 0 },
    held_from_prior_count: 0,
    retrieval_counts: { fetched: 2, http_error: 1 },
    superseded_by: 0,
    ...overrides,
  };
}

/** A row shaped exactly like ROW_COLUMNS output, for query/stats tests. */
export function storedRow(id, overrides = {}) {
  return {
    id,
    subject: `Subject ${id}`,
    status: "evidence_open",
    data_mode: "live",
    registrant_role: "third_party_observer",
    version: 1,
    superseded_by: 0,
    round_count: 0,
    evidence_count: 0,
    period_start: "2025-01-01",
    period_end: "2025-12-31",
    registrant: "0x5b3661c576c7001e6d6279c67f3779705d334c89",
    subject_kind: "organization",
    commitment_text: `Commitment text ${id}`,
    source_statement_ref: `https://example.org/statement/${id}`,
    source_guidance: "Annual reports",
    timezone: "UTC",
    criteria_json: JSON.stringify([{ id: 1, text: "Criterion one", measure: "Measure", required: true }]),
    criteria_total: 1,
    criteria_required: 1,
    outcome_known: 0,
    has_outcome: null,
    outcome_round: null,
    outcome_overall: null,
    outcome_reason: null,
    outcome_counts_json: null,
    retrieval_counts_json: null,
    evaluated_at: null,
    indexed_at: ISO,
    ...overrides,
  };
}

export const NOW = new Date(ISO);
export const nowFn = () => NOW;
