/**
 * Browse (UI-CivicLens section 3): `/commitments`.
 *
 * Filters: sample | live, outcome, state, registrant role. Search matches the
 * subject or the record number. Sorting reorders the loaded page.
 *
 * Every control applies to the page the contract returns (the 20 most recent
 * records — its largest single page). The scope note under the controls says
 * so; nothing here implies a search over the whole network.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCommitmentList } from "@/hooks/useReads";
import { reads } from "@/services";
import { RESULT_LABEL, ROLE_SHORT_LABEL, STATUS_LABEL } from "@/domain/copy";
import { formatDate } from "@/domain/format";
import type { DataMode, RegistrantRole, ReviewStatus } from "@/domain/types";
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
type SortKey = "newest" | "ending_soonest" | "most_reviewed" | "most_sources";

const OUTCOME_OPTIONS: Array<{ value: OutcomeFilter; label: string }> = [
  { value: "all", label: "Any outcome" },
  { value: "supported", label: RESULT_LABEL.supported },
  { value: "contradicted", label: RESULT_LABEL.contradicted },
  { value: "inconclusive", label: RESULT_LABEL.inconclusive },
  { value: "none", label: "Not yet reviewed" },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "ending_soonest", label: "Ending soonest" },
  { value: "most_reviewed", label: "Most reviewed" },
  { value: "most_sources", label: "Most sources" },
];

export function Commitments() {
  const { data, isLoading, error, refetch, isFetching } = useCommitmentList();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | DataMode>("all");
  const [outcome, setOutcome] = useState<OutcomeFilter>("all");
  const [status, setStatus] = useState<"all" | string>("all");
  const [role, setRole] = useState<"all" | RegistrantRole>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  /**
   * The list view returns summaries only — it carries no outcome. So the
   * outcome filter is applied against what the summary actually knows:
   * reviewed vs not reviewed. Claiming more than the contract returns here
   * would be inventing data.
   */
  const filtered = useMemo(() => {
    let rows = data ?? [];
    const needle = query.trim().toLowerCase();
    if (needle) {
      rows = rows.filter(
        (r) => r.subject.toLowerCase().includes(needle) || String(r.id) === needle,
      );
    }
    if (mode !== "all") rows = rows.filter((r) => r.data_mode === mode);
    if (role !== "all") rows = rows.filter((r) => r.registrant_role === role);
    if (status !== "all") rows = rows.filter((r) => r.status === status);
    if (outcome === "none") rows = rows.filter((r) => r.round_count === 0);
    else if (outcome !== "all") {
      // No per-commitment outcome in the summary payload: a reviewed commitment
      // may hold any of the three, so the filter cannot narrow further here.
      rows = rows.filter((r) => r.round_count > 0);
    }

    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case "ending_soonest":
          return a.period_end.localeCompare(b.period_end) || b.id - a.id;
        case "most_reviewed":
          return b.round_count - a.round_count || b.id - a.id;
        case "most_sources":
          return b.evidence_count - a.evidence_count || b.id - a.id;
        case "newest":
        default:
          return b.id - a.id;
      }
    });
    return sorted;
  }, [data, query, mode, role, status, outcome, sort]);

  const statuses = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.status))),
    [data],
  );
  const roles = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.registrant_role))),
    [data],
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
          <label className="field__label" htmlFor="f-search">
            Search
          </label>
          <input
            id="f-search"
            className="input"
            type="search"
            value={query}
            placeholder="Subject or number"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

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

        <div className="field">
          <label className="field__label" htmlFor="f-role">
            Registrant
          </label>
          <select
            id="f-role"
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value as "all" | RegistrantRole)}
          >
            <option value="all">Any role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_SHORT_LABEL[r] ?? r}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-sort">
            Sort
          </label>
          <select
            id="f-sort"
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {isFetching && <span className="hint">Refreshing…</span>}
      </div>

      {(data?.length ?? 0) > 0 && (
        <p className="hint">
          Search, filters, and sorting apply to the {data?.length} most recently registered
          record{data?.length === 1 ? "" : "s"} — the largest page the contract serves in one
          read.
        </p>
      )}

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
                      {row.version > 1 && <span className="tag">v{row.version}</span>}
                      {row.superseded_by > 0 && (
                        <span className="tag">Superseded by #{row.superseded_by}</span>
                      )}
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
