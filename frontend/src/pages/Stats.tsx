/**
 * Platform stats: `/stats`.
 *
 * Counts what the current window holds: the most recent page of commitments
 * (one page of 20 — the contract's maximum) plus each record's latest outcome.
 * The window is labeled everywhere; there is no network-wide total and the
 * page does not pretend otherwise.
 *
 * Inconclusive is counted as a result of its own, exactly as it is on every
 * record. Records whose outcome read did not answer are counted as "could not
 * be read" and never folded into any outcome.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RETRIEVAL_LABEL, STATUS_LABEL } from "@/domain/copy";
import type { RetrievalStatus, ReviewStatus } from "@/domain/types";
import {
  aggregatePlatformStats,
  readSourceCount,
  unreadSourceCount,
  type OutcomeRead,
} from "@/domain/stats";
import { mapLimit } from "@/domain/scan";
import { reads } from "@/services";
import { EmptyState, ErrorView, LoadingRegion, SampleBanner } from "@/components/Chrome";
import { useT } from "@/i18n";
import { ResultChip } from "@/components/ResultChip";

const WINDOW_SIZE = 20;
const READ_CONCURRENCY = 6;

const OUTCOME_ORDER: ReviewStatus[] = ["supported", "contradicted", "inconclusive"];

interface StatsState {
  loading: boolean;
  error: unknown;
  rows: OutcomeRead[] | null;
}

export function Stats() {
  const t = useT();
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [state, setState] = useState<StatsState>({ loading: true, error: null, rows: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, rows: null });
    setProgress(null);

    (async () => {
      try {
        const summaries = await reads.listCommitments(WINDOW_SIZE);
        if (cancelled) return;
        let done = 0;
        setProgress({ done, total: summaries.length });

        const results = await mapLimit(
          summaries,
          READ_CONCURRENCY,
          async (summary): Promise<OutcomeRead> => {
            try {
              const outcome = await reads.getOutcome(summary.id);
              return { summary, outcome, unread: false };
            } catch {
              return { summary, unread: true };
            } finally {
              done += 1;
              if (!cancelled) setProgress({ done, total: summaries.length });
            }
          },
        );

        if (cancelled) return;
        const rows = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
        setState({ loading: false, error: null, rows });
      } catch (error) {
        if (!cancelled) setState({ loading: false, error, rows: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const stats = useMemo(
    () => (state.rows ? aggregatePlatformStats(state.rows) : null),
    [state.rows],
  );

  if (state.loading) {
    return (
      <div className="stack-lg">
        <div>
          <h1>{t("stats.title")}</h1>
          <p className="hint">{t("stats.window_leading")}</p>
        </div>
        {progress && (
          <p className="hint" role="status" aria-live="polite">
            {t("stats.progress", { done: progress.done, total: progress.total })}
          </p>
        )}
        <LoadingRegion label={t("stats.counting")} />
      </div>
    );
  }

  if (state.error || !stats) {
    return (
      <div className="stack-lg">
        <div>
          <h1>Platform stats</h1>
        </div>
        <ErrorView
          error={state.error ?? new Error(t("stats.window_empty"))}
          onRetry={() => setAttempt((a) => a + 1)}
          title={t("stats.window_error_title")}
        />
      </div>
    );
  }

  const readSources = readSourceCount(stats);
  const unreadSources = unreadSourceCount(stats);
  const retrievalRows = Object.entries(stats.retrieval).filter(([status]) => status !== "fetched");

  return (
    <div className="stack-lg">
      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <div>
        <h1>{t("stats.title")}</h1>
        <p className="hint">{t("stats.scope")}</p>
      </div>

      {stats.commitments === 0 ? (
        <EmptyState title={t("stats.empty_title")}>
          <p>{t("stats.empty_body")}</p>
          <div className="actions" style={{ marginTop: "var(--space-2)" }}>
            <Link className="btn btn--small" to="/commitments/new">
              Register a commitment
            </Link>
          </div>
        </EmptyState>
      ) : (
        <>
          <section className="panel" aria-labelledby="stats-records">
            <div className="panel__head">
              <h2 id="stats-records">{t("stats.records_heading")}</h2>
            </div>
            <div className="panel__body">
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">{t("stats.records_caption")}</caption>
                  <tbody>
                    <tr>
                      <th scope="row">{t("stats.row_commitments")}</th>
                      <td className="num">{stats.commitments}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t("stats.row_evidence")}</th>
                      <td className="num">{stats.evidence}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t("stats.row_rounds")}</th>
                      <td className="num">{stats.rounds}</td>
                    </tr>
                    <tr>
                      <th scope="row">{t("stats.row_data_mode")}</th>
                      <td>
                        {stats.byMode.live} {t("stats.mode_live")} · {stats.byMode.sample} {t("stats.mode_sample")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="panel" aria-labelledby="stats-states">
            <div className="panel__head">
              <h2 id="stats-states">{t("stats.states_heading")}</h2>
            </div>
            <div className="panel__body">
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">{t("stats.states_caption")}</caption>
                  <tbody>
                    {stats.byStatus.map(({ status, count }) => (
                      <tr key={status}>
                        <th scope="row">{STATUS_LABEL[status] ?? status}</th>
                        <td className="num">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="panel" aria-labelledby="stats-outcomes">
            <div className="panel__head">
              <h2 id="stats-outcomes">{t("stats.outcomes_heading")}</h2>
            </div>
            <div className="panel__body">
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">{t("stats.outcomes_caption")}</caption>
                  <tbody>
                    {OUTCOME_ORDER.map((status) => (
                      <tr key={status}>
                        <th scope="row">
                          <ResultChip status={status} />
                        </th>
                        <td className="num">{stats.outcomes[status]}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">
                        <ResultChip status="pending" />
                      </th>
                      <td className="num">{stats.outcomes.notYetReviewed}</td>
                    </tr>
                    {stats.unreadOutcomes > 0 && (
                      <tr>
                        <th scope="row">{t("stats.unread_outcome")}</th>
                        <td className="num">{stats.unreadOutcomes}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="hint">
                {t("stats.inconclusive_note")}
              </p>
            </div>
          </section>

          <section className="panel" aria-labelledby="stats-sources">
            <div className="panel__head">
              <h2 id="stats-sources">{t("stats.sources_heading")}</h2>
            </div>
            <div className="panel__body">
              {stats.retrievalKnown === 0 ? (
                <p className="hint" style={{ marginTop: 0 }}>
                  {t("stats.sources_none")}
                </p>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="table">
                      <caption className="sr-only">{t("stats.sources_caption")}</caption>
                      <tbody>
                        <tr>
                          <th scope="row">{RETRIEVAL_LABEL.fetched}</th>
                          <td className="num">{readSources}</td>
                        </tr>
                        {retrievalRows.map(([status, count]) => (
                          <tr key={status}>
                            <th scope="row">
                              {RETRIEVAL_LABEL[status as RetrievalStatus] ?? status}
                            </th>
                            <td className="num">{count ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="hint">
                    {readSources} {t("stats.sources_count")} read and {unreadSources} not readable, across the {stats.retrievalKnown} reviewed records that reported retrieval statuses.
                    {t("stats.sources_tail")}
                  </p>
                </>
              )}
            </div>
          </section>

          <div className="actions">
            <button
              type="button"
              className="btn btn--small"
              onClick={() => setAttempt((a) => a + 1)}
            >
              {t("stats.count_again")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;
