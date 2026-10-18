/**
 * Map the contract's read payloads onto one flat index row. Pure function —
 * callers pass exactly what `get_commitments`, `get_commitment`, and
 * `get_outcome` returned.
 *
 * The index stores only fields the contract reported. A shape that does not
 * carry a required field is rejected loudly rather than defaulted: a silently
 * blank subject in a search index is worse than a failed poll.
 */

function requiredString(value, what) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`indexer: ${what} missing or not a string`);
  }
  return value;
}

function requiredInt(value, what) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`indexer: ${what} missing or not an integer`);
  }
  return value;
}

/**
 * @param summary    row from get_commitments (list view)
 * @param commitment dict from get_commitment
 * @param outcome    dict from get_outcome, or null when that read failed
 * @param indexedAt  ISO timestamp of this pass
 */
export function toRow(summary, commitment, outcome, indexedAt) {
  if (!summary || typeof summary !== "object") throw new Error("indexer: empty summary");
  if (!commitment || typeof commitment !== "object") throw new Error("indexer: empty commitment");

  const id = requiredInt(summary.id, "summary.id");
  if (requiredInt(commitment.id, "commitment.id") !== id) {
    throw new Error(`indexer: summary/commitment id mismatch for #${id}`);
  }

  const criteria = Array.isArray(commitment.criteria) ? commitment.criteria : [];
  const known = outcome !== null && typeof outcome === "object";

  return {
    id,
    subject: requiredString(summary.subject, `#${id} subject`),
    status: requiredString(summary.status, `#${id} status`),
    data_mode: requiredString(summary.data_mode, `#${id} data_mode`),
    registrant_role: requiredString(summary.registrant_role, `#${id} registrant_role`),
    version: requiredInt(summary.version, `#${id} version`),
    superseded_by: requiredInt(summary.superseded_by, `#${id} superseded_by`),
    round_count: requiredInt(summary.round_count, `#${id} round_count`),
    evidence_count: requiredInt(summary.evidence_count, `#${id} evidence_count`),
    period_start: requiredString(summary.period_start, `#${id} period_start`),
    period_end: requiredString(summary.period_end, `#${id} period_end`),
    registrant: typeof commitment.registrant === "string" ? commitment.registrant : null,
    subject_kind: typeof commitment.subject_kind === "string" ? commitment.subject_kind : null,
    commitment_text: requiredString(commitment.commitment_text, `#${id} commitment_text`),
    source_statement_ref:
      typeof commitment.source_statement_ref === "string" ? commitment.source_statement_ref : null,
    source_guidance:
      typeof commitment.source_guidance === "string" ? commitment.source_guidance : null,
    timezone: typeof commitment.timezone === "string" ? commitment.timezone : null,
    criteria_json: JSON.stringify(criteria),
    criteria_total: criteria.length,
    criteria_required: criteria.filter((c) => c && c.required === true).length,
    outcome_known: known ? 1 : 0,
    has_outcome: known && outcome.has_outcome === true ? 1 : 0,
    outcome_round: known && typeof outcome.round === "number" ? outcome.round : null,
    outcome_overall: known && typeof outcome.overall_outcome === "string" ? outcome.overall_outcome : null,
    outcome_reason: known && typeof outcome.overall_reason === "string" ? outcome.overall_reason : null,
    outcome_counts_json: known && outcome.counts ? JSON.stringify(outcome.counts) : null,
    retrieval_counts_json:
      known && outcome.retrieval_counts ? JSON.stringify(outcome.retrieval_counts) : null,
    evaluated_at: known && typeof outcome.evaluated_at === "string" ? outcome.evaluated_at : null,
    indexed_at: indexedAt,
  };
}
