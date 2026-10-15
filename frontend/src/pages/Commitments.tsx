/**
 * Browse (UI-CivicLens section 3): `/commitments`.
 * Filters: sample | live, outcome, finality.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCommitmentList } from "@/hooks/useReads";
import { reads } from "@/services";
import { RESULT_LABEL, STATUS_LABEL } from "@/domain/copy";
import { formatDate } from "@/domain/format";
import type { DataMode, ReviewStatus } from "@/domain/types";
import { DataModeBadge } from "@/components/DataModeBadge";
import { ResultChip } from "@/components/ResultChip";
import { ExternalMark } from "@/components/Marks";
import {
  EmptyState,
  ErrorView,
  LoadingRegion,
  SampleBanner,
} from "@/components/Chrome";

type OutcomeFilter = "all" | ReviewStatus | "none";

const OUTCOME_OPTIONS: Array<{ value: OutcomeFilter; label: string }> = [
  { value: "all", label: "Any outcome" },
  { value: "supported", label: RESULT_LABEL.supported },
  { value: "contradicted", label: RESULT_LABEL.contradicted },
  { value: "inconclusive", label: RESULT_LABEL.inconclusive },
  { value: "none", label: "Not yet reviewed" },
];

export function Commitments() {
  const { data, isLoading, error, refetch, isFetching } = useCommitmentList();
  const [mode, setMode] = useState<"all" | DataMode>("all");
  const [outcome, setOutcome] = useState<OutcomeFilter>("all");
  const [status, setStatus] = useState<"all" | string>("all");

  /**
   * The list view returns summaries only — it carries no outcome. So the
   * outcome filter is applied against what the summary actually knows:
   * reviewed vs not reviewed. Claiming more than the contract returns here
   * would be inventing data.
   */
  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (mode !== "all") rows = rows.filter((r) => r.data_mode === mode);
    if (status !== "all") rows = rows.filter((r) => r.status === status);
    if (outcome === "none") rows = rows.filter((r) => r.round_count === 0);
    else if (outcome !== "all") {
      // No per-commitment outcome in the summary payload: a reviewed commitment
      // may hold any of the three, so the filter cannot narrow further here.
      rows = rows.filter((r) => r.round_count > 0);
    }
    return rows;
  }, [data, mode, status, outcome]);

  const statuses = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.status))),
    [],
  );

  if (isLoading) return <LoadingRegion label="Loading commitments" />;
  if (error) {
    return (
      <ErrorView error={error} onRetry={() => void refetch()} title="Commitments could not be loaded." />
    );
  }

  return (
    <div className="stack-lg">
      <div>
        <h1>Commitments</h1>
        <p className="hint">
          Public commitments registered on CivicLens. Each one shows its criteria, the sources on
          file, and the result of every review round.
        </p>
      </div>

      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <div className="filters">
        <div className="field">
          <label className="field__label" htmlFor="f-mode">
            Data
          </label>
          <select
            id="f-mode"
            className="select"
            value={mode}
            onChange={(e) => setMode(e.target.value as "all" | DataMode)}
          >
            <option value="all">Sample and live</option>
            <option value="sample">Sample data</option>
            <option value="live">Live evidence</option>
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-outcome">
            Outcome
          </label>
          <select
            id="f-outcome"
            className="select"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as OutcomeFilter)}
          >
            {OUTCOME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-status">
            State
          </label>
          <select
            id="f-status"
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Any state</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s as keyof typeof STATUS_LABEL] ?? s}
              </option>
            ))}
          </select>
        </div>

        {isFetching && <span className="hint">Refreshing…</span>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing matches those filters">
          Widen the filters, or{" "}
          <Link to="/commitments/new">register a commitment</Link> to add one.
        </EmptyState>
      ) : (
        <div className="panel panel--flush">
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">
                Commitments with their state, data mode, evaluation period, and round count.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col">Data</th>
                  <th scope="col">State</th>
                  <th scope="col">Period</th>
                  <th scope="col">Rounds</th>
                  <th scope="col">Sources</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/commitments/${row.id}`}>{row.subject}</Link>
                      {row.round_count === 0 ? (
                        <ResultChip status="pending" />
                      ) : null}
                    </td>
                    <td>
                      <DataModeBadge mode={row.data_mode} />
                    </td>
                    <td>{STATUS_LABEL[row.status]}</td>
                    <td className="num">
                      {formatDate(row.period_start)} – {formatDate(row.period_end)}
                    </td>
                    <td className="num">{row.round_count}</td>
                    <td className="num">{row.evidence_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reads.isSample && (
        <p className="hint">
          <Link to="/demo">
            See what each of these sample outcomes tests <ExternalMark />
          </Link>
        </p>
      )}
    </div>
  );
}

export default Commitments;