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
import { DATA_MODE_LABEL, RESULT_LABEL, ROLE_SHORT_LABEL, STATUS_LABEL } from "@/domain/copy";
import { formatDate } from "@/domain/format";
import { useT } from "@/i18n";
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

export function Commitments() {
  const t = useT();
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

  /**
   * Filter option labels are built inside the component, not at module scope:
   * a module-level list would read the labels once at import time and freeze
   * them in English, so the outcome filter would stop translating.
   */
  const outcomeOptions: Array<{ value: OutcomeFilter; label: string }> = [
    { value: "all", label: t("browse.filter_outcome_all") },
    { value: "supported", label: RESULT_LABEL.supported },
    { value: "contradicted", label: RESULT_LABEL.contradicted },
    { value: "inconclusive", label: RESULT_LABEL.inconclusive },
    { value: "none", label: t("browse.filter_outcome_none") },
  ];

  const sortOptions: Array<{ value: SortKey; label: string }> = [
    { value: "newest", label: t("browse.sort_newest") },
    { value: "ending_soonest", label: t("browse.sort_ending_soonest") },
    { value: "most_reviewed", label: t("browse.sort_most_reviewed") },
    { value: "most_sources", label: t("browse.sort_most_sources") },
  ];

  const statuses = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.status))),
    [data],
  );
  const roles = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.registrant_role))),
    [data],
  );

  if (isLoading) return <LoadingRegion label={t("browse.loading")} />;
  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={() => void refetch()}
        title={t("browse.error_title")}
      />
    );
  }

  return (
    <div className="stack-lg">
      <div>
        <h1>{t("browse.title")}</h1>
        <p className="hint">{t("browse.lede")}</p>
      </div>

      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <div className="filters">
        <div className="field">
          <label className="field__label" htmlFor="f-search">
            {t("browse.filter_search")}
          </label>
          <input
            id="f-search"
            className="input"
            type="search"
            value={query}
            placeholder={t("browse.filter_search_placeholder")}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-mode">
            {t("browse.filter_mode")}
          </label>
          <select
            id="f-mode"
            className="select"
            value={mode}
            onChange={(e) => setMode(e.target.value as "all" | DataMode)}
          >
            <option value="all">{t("browse.filter_mode_all")}</option>
            <option value="sample">{DATA_MODE_LABEL.sample}</option>
            <option value="live">{DATA_MODE_LABEL.live}</option>
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-outcome">
            {t("browse.filter_outcome")}
          </label>
          <select
            id="f-outcome"
            className="select"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as OutcomeFilter)}
          >
            {outcomeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-status">
            {t("browse.filter_status")}
          </label>
          <select
            id="f-status"
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">{t("browse.filter_status_all")}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s as keyof typeof STATUS_LABEL] ?? s}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-role">
            {t("browse.filter_role")}
          </label>
          <select
            id="f-role"
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value as "all" | RegistrantRole)}
          >
            <option value="all">{t("browse.filter_role_all")}</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_SHORT_LABEL[r] ?? r}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="f-sort">
            {t("browse.filter_sort")}
          </label>
          <select
            id="f-sort"
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {isFetching && <span className="hint">{t("browse.refreshing")}</span>}
      </div>

      {(data?.length ?? 0) > 0 && (
        <p className="hint">
          {t("browse.scope_note", { count: data?.length ?? 0 })}
        </p>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={t("browse.empty_title")}>
          {t("browse.empty_body_prefix")} <Link to="/commitments/new">{t("browse.empty_link")}</Link>{" "}
          {t("browse.empty_body_suffix")}
        </EmptyState>
      ) : (
        <div className="panel panel--flush">
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">{t("browse.table_caption")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("browse.col_subject")}</th>
                  <th scope="col">{t("browse.col_data")}</th>
                  <th scope="col">{t("browse.col_status")}</th>
                  <th scope="col">{t("browse.col_period")}</th>
                  <th scope="col">{t("browse.col_rounds")}</th>
                  <th scope="col">{t("browse.col_sources")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/commitments/${row.id}`}>{row.subject}</Link>
                      {row.version > 1 && <span className="tag">v{row.version}</span>}
                      {row.superseded_by > 0 && (
                        <span className="tag">
                          {t("browse.tag_superseded", { id: row.superseded_by })}
                        </span>
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
            {t("browse.demo_link")} <ExternalMark />
          </Link>
        </p>
      )}
    </div>
  );
}

export default Commitments;
