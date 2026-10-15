/**
 * OutcomePanel (UI-CivicLens 5.3).
 *
 * The overall outcome, a one-sentence reason, the count basis, and the
 * FinalityChip. Never a score, grade, or ranking — and never shown without the
 * per-criterion Ledger beside it, so a mixed picture is never hidden behind one
 * label.
 */

import type { Criterion, CriterionResult, Outcome } from "@/domain/types";
import { overallReasonCopy } from "@/domain/copy";
import { ResultChip } from "./ResultChip";
import { FinalityChip } from "./FinalityChip";
import type { FinalityState, ReviewStatus } from "@/domain/types";

export interface OutcomePanelProps {
  outcome: Outcome;
  finality: FinalityState;
  /** Set when no review has happened yet (pending, not inconclusive). */
  pending?: boolean;
  /** Label above the block; the round page passes "Round 2 outcome". */
  heading?: string;
  /**
   * Criteria and their results, when available.
   *
   * The contract's `counts` tally EVERY criterion — required and optional
   * together — while `required_total` counts only required ones. Presenting the
   * first next to the second as "based on N required criteria: …" would
   * wrongly imply that an optional criterion's result fed the decision. When
   * these are supplied we recount the required criteria client-side so the
   * stated basis is exactly what decided the outcome.
   */
  criteria?: Criterion[];
  results?: CriterionResult[];
}

interface Counts {
  supported: number;
  contradicted: number;
  inconclusive: number;
  total: number;
}

/** Recount over required criteria only, matching how the outcome was derived. */
function requiredOnlyCounts(criteria: Criterion[], results: CriterionResult[]): Counts | null {
  if (criteria.length === 0 || results.length === 0) return null;
  const required = new Set(criteria.filter((c) => c.required).map((c) => c.id));
  const counts: Counts = { supported: 0, contradicted: 0, inconclusive: 0, total: 0 };
  for (const r of results) {
    if (!required.has(r.criterion_id)) continue;
    const status = r.status as ReviewStatus;
    if (status in counts) counts[status] += 1;
    counts.total += 1;
  }
  return counts.total > 0 ? counts : null;
}

export function OutcomePanel({
  outcome,
  finality,
  pending,
  heading = "Outcome",
  criteria,
  results,
}: OutcomePanelProps) {
  if (pending || !outcome.has_outcome) {
    return (
      <section className="panel" aria-labelledby="outcome-heading">
        <div className="panel__head">
          <h2 id="outcome-heading">{heading}</h2>
        </div>
        <div className="panel__body">
          <div className="outcome__label">
            <ResultChip status="pending" />
          </div>
          <p className="outcome__reason">
            No review has completed for this commitment yet. Pending is not a finding — nothing
            has been determined either way.
          </p>
        </div>
      </section>
    );
  }

  const status = outcome.overall_outcome ?? "inconclusive";

  // Prefer the required-only recount; fall back to the contract's all-criteria
  // tally, labelled honestly so the two are never confused.
  const recounted = criteria && results ? requiredOnlyCounts(criteria, results) : null;
  const counts: Counts | null =
    recounted ??
    (outcome.counts
      ? { ...outcome.counts, total: outcome.counts.supported + outcome.counts.contradicted + outcome.counts.inconclusive }
      : null);

  return (
    <section className="panel" aria-labelledby="outcome-heading">
      <div className="panel__head">
        <h2 id="outcome-heading">{heading}</h2>
      </div>
      <div className="panel__body">
        <div className="outcome__label">
          <ResultChip status={status} />
          <FinalityChip state={finality} />
        </div>

        <p className="outcome__reason">{overallReasonCopy(outcome.overall_reason)}</p>

        {/* Count basis, not a score: what the label was derived FROM. */}
        {counts && recounted && (
          <p className="outcome__basis">
            Based on {counts.total} required {counts.total === 1 ? "criterion" : "criteria"}:{" "}
            {counts.supported} supported, {counts.contradicted} contradicted,{" "}
            {counts.inconclusive} inconclusive. Optional criteria appear in the ledger below and do
            not decide this outcome.
          </p>
        )}

        {counts && !recounted && (
          <p className="outcome__basis">
            Across all {counts.total}{" "}
            {counts.total === 1 ? "criterion" : "criteria"}: {counts.supported} supported,{" "}
            {counts.contradicted} contradicted, {counts.inconclusive} inconclusive. Only required
            criteria decide the outcome.
          </p>
        )}

        {counts && (
          <div className="counts">
            <ResultChip status="supported" label={`${counts.supported} supported`} />
            <ResultChip status="contradicted" label={`${counts.contradicted} contradicted`} />
            <ResultChip status="inconclusive" label={`${counts.inconclusive} inconclusive`} />
          </div>
        )}
      </div>
    </section>
  );
}

export default OutcomePanel;