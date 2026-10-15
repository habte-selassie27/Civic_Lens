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
          <h1>Platform stats</h1>
          <p className="hint">
            Counting the window — the most recent commitments plus each one&apos;s latest
            outcome.
          </p>
        </div>
        {progress && (
          <p className="hint" role="status" aria-live="polite">
            Read {progress.done} of {progress.total} outcomes.
          </p>
        )}
        <LoadingRegion label="Counting the current window" />
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
          error={state.error ?? new Error("The window produced no data.")}
          onRetry={() => setAttempt((a) => a + 1)}
          title="The window could not be counted."
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
        <h1>Platform stats</h1>
        <p className="hint">
          Counts over the {stats.commitments} most recent commitment
          {stats.commitments === 1 ? "" : "s"} — the largest page the contract serves in one
          read. Records older than the window are not counted, and no network-wide total is
          claimed.
        </p>
      </div>

      {stats.commitments === 0 ? (
        <EmptyState title="Nothing to count yet">
          <p>The window is empty. Register a commitment and its reviews will appear here.</p>
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
              <h2 id="stats-records">Records</h2>
            </div>
            <div className="panel__body">
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Totals across the current window.</caption>
                  <tbody>
                    <tr>
                      <th scope="row">Commitments</th>
                      <td className="num">{stats.commitments}</td>
                    </tr>
                    <tr>
                      <th scope="row">Evidence items on file</th>
                      <td className="num">{stats.evidence}</td>
                    </tr>
                    <tr>
                      <th scope="row">Review rounds recorded</th>
                      <td className="num">{stats.rounds}</td>
                    </tr>
                    <tr>
                      <th scope="row">Data mode</th>
                      <td>
                        {stats.byMode.live} live · {stats.byMode.sample} sample
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="panel" aria-labelledby="stats-states">
            <div className="panel__head">
              <h2 id="stats-states">Where the records stand</h2>
            </div>
            <div className="panel__body">
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Commitments by current state.</caption>
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
              <h2 id="stats-outcomes">Review outcomes</h2>
            </div>
            <div className="panel__body">
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">
                    Latest outcome for each commitment in the window.
                  </caption>
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
                        <th scope="row">Outcome could not be read</th>
                        <td className="num">{stats.unreadOutcomes}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="hint">
                Inconclusive is a result of its own: the evidence did not settle the question
                at the last review. It sits beside the other outcomes and is never folded into
                a negative one. &quot;Outcome could not be read&quot; means the read itself did
                not answer — those records are counted as no outcome at all.
              </p>
            </div>
          </section>

          <section className="panel" aria-labelledby="stats-sources">
            <div className="panel__head">
              <h2 id="stats-sources">How sources were read</h2>
            </div>
            <div className="panel__body">
              {stats.retrievalKnown === 0 ? (
                <p className="hint" style={{ marginTop: 0 }}>
                  No reviewed record in the window reported retrieval statuses yet.
                </p>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="table">
                      <caption className="sr-only">
                        Retrieval statuses summed over the latest reviewed round of each
                        record that reports them.
                      </caption>
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
                    {readSources} source{readSources === 1 ? "" : "s"} read and {unreadSources}{" "}
                    not readable, across the {stats.retrievalKnown} reviewed record
                    {stats.retrievalKnown === 1 ? "" : "s"} that reported retrieval statuses.
                    A source that could not be read is recorded as exactly that — it is not
                    counted as evidence for or against a criterion.
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
              Count again
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;
