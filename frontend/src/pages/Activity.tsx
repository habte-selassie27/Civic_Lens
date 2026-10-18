/**
 * My activity: `/activity`.
 *
 * Wallet-scoped view of what this account did, gathered from a bounded scan of
 * the most recent commitments. The contract has no by-account index yet, so
 * the window is scanned in the browser and the page says exactly how far it
 * looked — it never implies a network-wide history.
 *
 * The browser's own transaction memory is a separate section, labeled as a
 * local convenience: it remembers writes this browser submitted, and finality
 * itself stays tracked on each commitment page.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { reads } from "@/services";
import { mapLimit } from "@/domain/scan";
import { EVIDENCE_TYPE_LABEL, STATUS_LABEL } from "@/domain/copy";
import { formatDate } from "@/domain/format";
import type {
  ChallengeRecord,
  Commitment,
  CommitmentSummary,
  EvidenceItem,
} from "@/domain/types";
import type { TxHash } from "@/services/types";
import { explorerTxUrl } from "@/config/explorer";
import { useWallet } from "@/genlayer/WalletProvider";
import {
  Banner,
  EmptyState,
  ErrorView,
  LoadingRegion,
  SampleBanner,
} from "@/components/Chrome";
import { SourceLink } from "@/components/SourceLink";
import { listRememberedTxs } from "@/hooks/useFinality";
import { readPendingTx } from "@/hooks/useTxLifecycle";
import { useT } from "@/i18n";

const WINDOW_SIZE = 20;
const SCAN_CONCURRENCY = 5;

interface ScanRow {
  summary: CommitmentSummary;
  commitment?: Commitment;
  evidence?: EvidenceItem[];
  challenges?: ChallengeRecord[];
  /** True when this record's scan reads did not all answer. */
  unread: boolean;
}

interface ActivityState {
  loading: boolean;
  error: unknown;
  rows: ScanRow[] | null;
}

/** A stored hash, linked only when the explorer helper validates its shape. */
function TxLine({ hash }: { hash: TxHash | string }) {
  const href = explorerTxUrl(hash);
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <code>{hash}</code>
      </a>
    );
  }
  return <code>{hash}</code>;
}

export function Activity() {
  const t = useT();
  const wallet = useWallet();
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [state, setState] = useState<ActivityState>({ loading: true, error: null, rows: null });

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
          SCAN_CONCURRENCY,
          async (summary): Promise<ScanRow> => {
            try {
              const [commitment, evidence, challenges] = await Promise.all([
                reads.getCommitment(summary.id),
                reads.getEvidence(summary.id),
                reads.getChallenges(summary.id),
              ]);
              return { summary, commitment, evidence, challenges, unread: false };
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

  const rows = state.rows ?? [];
  const account = wallet.isConnected && wallet.address ? wallet.address.toLowerCase() : null;

  const mine = useMemo(
    () =>
      account
        ? rows.filter((r) => r.commitment && r.commitment.registrant.toLowerCase() === account)
        : [],
    [rows, account],
  );
  const myEvidence = useMemo(
    () =>
      account
        ? rows.flatMap((r) =>
            (r.evidence ?? [])
              .filter((e) => e.submitter.toLowerCase() === account)
              .map((item) => ({ item, summary: r.summary })),
          )
        : [],
    [rows, account],
  );
  const myChallenges = useMemo(
    () =>
      account
        ? rows.flatMap((r) =>
            (r.challenges ?? [])
              .filter((c) => c.challenger.toLowerCase() === account)
              .map((item) => ({ item, summary: r.summary })),
          )
        : [],
    [rows, account],
  );
  const unreadCount = rows.filter((r) => r.unread).length;

  // Browser-local transaction memory: a convenience, labeled as one.
  const rememberedRows = useMemo(() => {
    const remembered = listRememberedTxs();
    return Object.entries(remembered)
      .map(([id, hash]) => ({ id: Number(id), hash }))
      .filter((row) => Number.isFinite(row.id))
      .sort((a, b) => b.id - a.id);
  }, [rows]);
  const pending = useMemo(() => readPendingTx(), [rows]);
  const subjectById = useMemo(
    () => new Map(rows.map((r) => [r.summary.id, r.summary.subject])),
    [rows],
  );

  const windowSize = progress?.total ?? WINDOW_SIZE;

  return (
    <div className="stack-lg">
      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <div>
        <h1>{t("activity.title")}</h1>
        <p className="hint">{t("activity.lede", { count: windowSize })}</p>
      </div>

      {!account && (
        <Banner title={t("activity.connect_title")}>
          <p>{t("activity.connect_body")}</p>
          <div className="actions">
            <button
              type="button"
              className="btn btn--small"
              onClick={() => void wallet.connect()}
              disabled={!wallet.hasProvider}
            >
              {wallet.hasProvider ? t("wallet.connect") : t("activity.no_wallet")}
            </button>
          </div>
        </Banner>
      )}

      {account && state.loading && (
        <>
          {progress && (
            <p className="hint" role="status" aria-live="polite">
              {t("activity.scanned", { done: progress.done, total: progress.total })}
            </p>
          )}
          <LoadingRegion label={t("activity.scanning")} />
        </>
      )}

      {account && state.error ? (
        <ErrorView
          error={state.error}
          onRetry={() => setAttempt((a) => a + 1)}
          title={t("activity.error_title")}
        />
      ) : null}

      {account && !state.loading && !state.error && (
        <>
          {unreadCount > 0 && (
            <p className="hint">{t("activity.unread", { count: unreadCount })}</p>
          )}

          {rows.length === 0 ? (
            <EmptyState title={t("activity.window_empty_title")}>
              <p>{t("activity.window_empty_body")}</p>
              <div className="actions" style={{ marginTop: "var(--space-2)" }}>
                <Link className="btn btn--small" to="/commitments/new">
                  {t("activity.register_link")}
                </Link>
              </div>
            </EmptyState>
          ) : (
            <>
              <section className="panel" aria-labelledby="activity-registered">
                <div className="panel__head">
                  <h2 id="activity-registered">{t("activity.registered_heading")}</h2>
                </div>
                <div className="panel__body">
                  {mine.length === 0 ? (
                    <EmptyState title={t("activity.registered_empty_title")}>
                      <p>{t("activity.registered_empty_body")}</p>
                      <div className="actions" style={{ marginTop: "var(--space-2)" }}>
                        <Link className="btn btn--small" to="/commitments/new">
                          {t("activity.register_link")}
                        </Link>
                      </div>
                    </EmptyState>
                  ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {mine.map(({ summary, commitment }) => (
                        <li
                          key={summary.id}
                          style={{
                            display: "flex",
                            gap: "var(--space-2)",
                            alignItems: "baseline",
                            flexWrap: "wrap",
                            padding: "var(--space-2) 0",
                            borderBottom: "1px solid var(--rule)",
                          }}
                        >
                          <Link to={`/commitments/${summary.id}`}>
                            #{summary.id} {summary.subject}
                          </Link>
                          <span className="tag">{STATUS_LABEL[summary.status] ?? summary.status}</span>
                          <span className="hint" style={{ margin: 0 }}>
                            {t("activity.row_meta", {
                              rounds: summary.round_count,
                              items: summary.evidence_count,
                            })}
                            {commitment && commitment.version > 1
                              ? ` · ${t("activity.row_version", { version: commitment.version })}`
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <section className="panel" aria-labelledby="activity-evidence">
                <div className="panel__head">
                  <h2 id="activity-evidence">{t("activity.evidence_heading")}</h2>
                </div>
                <div className="panel__body">
                  {myEvidence.length === 0 ? (
                    <EmptyState title={t("activity.evidence_empty_title")}>
                      <p>{t("activity.evidence_empty_body")}</p>
                    </EmptyState>
                  ) : (
                    <div className="table-wrap">
                      <table className="table">
                        <caption className="sr-only">{t("activity.evidence_caption")}</caption>
                        <thead>
                          <tr>
                            <th scope="col">{t("activity.col_commitment")}</th>
                            <th scope="col">{t("activity.col_source")}</th>
                            <th scope="col">{t("activity.col_declared_type")}</th>
                            <th scope="col">{t("activity.col_published")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myEvidence.map(({ item, summary }) => (
                            <tr key={`${summary.id}-${item.id}`}>
                              <td>
                                <Link to={`/commitments/${summary.id}`}>
                                  #{summary.id} {summary.subject}
                                </Link>
                              </td>
                              <td>
                                <SourceLink url={item.url} />
                              </td>
                              <td>
                                {EVIDENCE_TYPE_LABEL[item.evidence_type] ?? item.evidence_type}
                              </td>
                              <td className="num">
                                {item.published_date ? formatDate(item.published_date) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              <section className="panel" aria-labelledby="activity-challenges">
                <div className="panel__head">
                  <h2 id="activity-challenges">{t("activity.challenges_heading")}</h2>
                </div>
                <div className="panel__body">
                  {myChallenges.length === 0 ? (
                    <EmptyState title={t("activity.challenges_empty_title")}>
                      <p>{t("activity.challenges_empty_body")}</p>
                    </EmptyState>
                  ) : (
                    <div className="table-wrap">
                      <table className="table">
                        <caption className="sr-only">{t("activity.challenges_caption")}</caption>
                        <thead>
                          <tr>
                            <th scope="col">{t("activity.col_commitment")}</th>
                            <th scope="col">{t("activity.col_target")}</th>
                            <th scope="col">{t("activity.col_grounds")}</th>
                            <th scope="col">{t("activity.col_new_evidence")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myChallenges.map(({ item, summary }) => (
                            <tr key={`${summary.id}-${item.id}`}>
                              <td>
                                <Link to={`/commitments/${summary.id}`}>
                                  #{summary.id} {summary.subject}
                                </Link>
                              </td>
                              <td>
                                {item.target === ""
                                  ? t("activity.target_overall")
                                  : t("activity.target_criterion", { criterion: item.target })}
                              </td>
                              <td>{item.grounds}</td>
                              <td className="num">{item.new_evidence_ids.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}

      <section className="panel" aria-labelledby="activity-tx">
        <div className="panel__head">
          <h2 id="activity-tx">{t("activity.tx_heading")}</h2>
        </div>
        <div className="panel__body">
          <p className="hint" style={{ marginTop: 0 }}>
            {t("activity.tx_body")}
          </p>

          {pending && (
            <p>
              {t("activity.tx_pending_lead")} <strong>{t(pending.action)}</strong> —{" "}
              <TxLine hash={pending.hash} />
            </p>
          )}

          {rememberedRows.length === 0 ? (
            <p className="hint">{t("activity.tx_empty")}</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">{t("activity.tx_caption")}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t("activity.col_commitment")}</th>
                    <th scope="col">{t("activity.col_transaction")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rememberedRows.map(({ id, hash }) => (
                    <tr key={id}>
                      <td>
                        <Link to={`/commitments/${id}`}>
                          #{id}
                          {subjectById.get(id) ? ` ${subjectById.get(id)}` : ""}
                        </Link>
                      </td>
                      <td>
                        <TxLine hash={hash} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Activity;
