/**
 * Commitment page — the main screen (UI-CivicLens 4.3).
 *
 * Layout rules that must not regress:
 * - The overall outcome and the per-criterion results are ALWAYS visible
 *   together, so a mixed picture is never hidden behind one label.
 * - The Ledger is the main visual; the outcome block is the first thing read.
 * - Left-aligned throughout.
 * - The attribution line is always present and never collapsed.
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCommitmentBundle, useConstants } from "@/hooks/useReads";
import { useTxLifecycle } from "@/hooks/useTxLifecycle";
import { useFinality, rememberTxForCommitment } from "@/hooks/useFinality";
import { requireWrites, writes } from "@/services";
import { useWallet } from "@/genlayer/WalletProvider";
import {
  canOpenChallenge,
  canRequestReview,
  canSubmitEvidence,
  statusSentence,
} from "@/domain/actions";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import { CONTRACT_ADDRESS } from "@/config/contracts";
import { EVIDENCE_TYPE_LABEL, STATUS_LABEL, ROLE_LABEL } from "@/domain/copy";
import { formatDate, formatPeriod, shortenUrl } from "@/domain/format";
import type { Commitment, ContractConstants } from "@/domain/types";
import { CriterionLedger } from "@/components/CriterionLedger";
import { OutcomePanel } from "@/components/OutcomePanel";
import { DataModeBadge } from "@/components/DataModeBadge";
import { AttributionBanner } from "@/components/AttributionBanner";
import { EvidenceSubmitForm } from "@/components/EvidenceSubmitForm";
import { ChallengePanel } from "@/components/ChallengePanel";
import { RoundTimeline } from "@/components/RoundTimeline";
import { TxStatus } from "@/components/TxStatus";
import { ActionButton } from "@/components/DisabledReason";
import { CopyField } from "@/components/CopyField";
import { DocumentMark, ExternalMark } from "@/components/Marks";
import {
  Banner,
  EmptyState,
  ErrorView,
  LoadingRegion,
  SampleBanner,
} from "@/components/Chrome";
import { reads } from "@/services";

export function CommitmentDetail() {
  const params = useParams();
  const commitmentId = Number(params.id);
  const wallet = useWallet();

  const { data, isLoading, error, refetch, isFetching } = useCommitmentBundle(
    Number.isFinite(commitmentId) ? commitmentId : null,
  );
  const { data: liveConstants } = useConstants();
  const constants = (liveConstants ?? FALLBACK_CONSTANTS) as ContractConstants;

  const tx = useTxLifecycle();
  const [panel, setPanel] = useState<"none" | "evidence" | "challenge">("none");

  const commitment = data?.commitment;
  const finality = useFinality(commitmentId);

  const account = wallet.address?.toLowerCase();
  const evidenceByAccount = useMemo(
    () => (data?.evidence ?? []).filter((e) => e.submitter.toLowerCase() === account).length,
    [data?.evidence, account],
  );
  const challengesByAccount = useMemo(
    () => (data?.challenges ?? []).filter((c) => c.challenger.toLowerCase() === account).length,
    [data?.challenges, account],
  );

  const actionCtx = useMemo(() => {
    if (!commitment) return null;
    return {
      commitment,
      constants,
      writesAvailable: Boolean(writes),
      isRegistrant: Boolean(account) && commitment.registrant.toLowerCase() === account,
      challengesByAccount,
      evidenceByAccount,
    };
  }, [commitment, constants, account, challengesByAccount, evidenceByAccount]);

  const evidenceAvail = actionCtx ? canSubmitEvidence(actionCtx) : null;
  const reviewAvail = actionCtx ? canRequestReview(actionCtx) : null;
  const challengeAvail = actionCtx ? canOpenChallenge(actionCtx) : null;

  if (isLoading) return <LoadingRegion label="Loading the commitment record" />;

  if (error || !data || !commitment) {
    return (
      <ErrorView
        error={error ?? new Error("That commitment could not be read.")}
        onRetry={() => void refetch()}
        title="This commitment could not be read."
      />
    );
  }

  const latestRound = data.rounds[data.rounds.length - 1];
  const roundResults = latestRound?.criteria ?? [];
  const hasOutcome = latestRound !== undefined;

  async function submitEvidence(input: {
    url: string;
    evidenceType: string;
    publishedDate: string;
    note: string;
  }) {
    const w = requireWrites();
    await tx.start("Add evidence", () =>
      w.submitEvidence({
        commitmentId,
        url: input.url,
        evidenceType: input.evidenceType,
        publishedDate: input.publishedDate,
        note: input.note,
      }),
    );
    const phase = await tx.waitForAcceptance();
    if (phase === "accepted" || phase === "final") await refetch();
  }

  async function requestReview() {
    const w = requireWrites();
    await tx.start("Request review", () => w.requestReview(commitmentId));
    const phase = await tx.waitForAcceptance();
    if (phase === "accepted" || phase === "final") {
      if (tx.hash) rememberTxForCommitment(commitmentId, tx.hash);
      await refetch();
    }
  }

  async function openChallenge(input: { target: string; grounds: string; newEvidenceIds: number[] }) {
    const w = requireWrites();
    await tx.start("Open challenge", () => w.openChallenge({ commitmentId, ...input }));
    const phase = await tx.waitForAcceptance();
    if (phase === "accepted" || phase === "final") await refetch();
  }

  return (
    <div className="stack-lg">
      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      {/* ---------------- header ---------------- */}
      <header className="commitment-head">
        <div className="commitment-head__top">
          <DataModeBadge
            mode={commitment.data_mode}
            override={reads.isSample ? "sample" : commitment.data_mode}
          />
          <span className="tag">{STATUS_LABEL[commitment.status]}</span>
          {commitment.version > 1 && <span className="tag">Version {commitment.version}</span>}
          <span className="tag">Round {commitment.current_round}</span>
          {isFetching && <span className="hint">Refreshing…</span>}
        </div>

        <h1 className="commitment-head__subject">{commitment.subject}</h1>

        {/* Quoted material: a document surface with a left rule. */}
        <div className="sheet sheet--commitment">
          <span className="sheet__label">Commitment as stated</span>
          {commitment.commitment_text}
        </div>

        <p className="hint">
          <DocumentMark /> Source statement:{" "}
          <a href={commitment.source_statement_ref} target="_blank" rel="noopener noreferrer">
            {shortenUrl(commitment.source_statement_ref)} <ExternalMark />
          </a>
        </p>

        <AttributionBanner
          commitment={commitment}
          evidence={data.evidence}
          challenges={data.challenges}
        />

        <p className="hint">
          Evaluation period {formatPeriod(commitment.period_start, commitment.period_end, commitment.timezone)}
          {commitment.source_guidance ? ` · Source guidance: ${commitment.source_guidance}` : ""}
        </p>
      </header>

      {/* ---------------- outcome + rounds ---------------- */}
      <div className="split">
        <div className="stack">
          <OutcomePanel
            outcome={data.outcome}
            finality={finality.state}
            pending={!hasOutcome}
            criteria={commitment.criteria}
            results={roundResults}
          />
          {statusSentence(commitment) && <p className="hint">{statusSentence(commitment)}</p>}
        </div>

        <section className="panel" aria-labelledby="rounds-heading">
          <div className="panel__head">
            <h2 id="rounds-heading">Rounds</h2>
            <Link className="btn btn--quiet btn--small" to={`/commitments/${commitmentId}/rounds`}>
              Full history
            </Link>
          </div>
          <div className="panel__body">
            {data.rounds.length === 0 ? (
              <p className="hint">No rounds yet. A round is recorded when a review completes.</p>
            ) : (
              <RoundTimeline
                rounds={data.rounds}
                evidence={data.evidence}
                currentRound={latestRound.round}
                commitmentId={commitmentId}
              />
            )}
          </div>
        </section>
      </div>

      {/* ---------------- the ledger ---------------- */}
      <section className="panel panel--flush" aria-labelledby="ledger-heading">
        <div className="panel__head">
          <h2 id="ledger-heading">Criterion ledger</h2>
          <span className="hint" style={{ margin: 0 }}>
            Exact criterion wording, the evidence used, and the reason for each result
          </span>
        </div>
        {commitment.criteria.length === 0 ? (
          <div className="panel__body">
            <EmptyState title="This commitment has no criteria">
              Without criteria there is nothing for a review to decide against.
            </EmptyState>
          </div>
        ) : (
          <CriterionLedger
            criteria={commitment.criteria}
            results={roundResults}
            evidence={data.evidence}
          />
        )}
      </section>

      {/* ---------------- evidence ---------------- */}
      <section className="panel panel--flush" aria-labelledby="evidence-heading">
        <div className="panel__head">
          <h2 id="evidence-heading">Evidence</h2>
          <span className="hint" style={{ margin: 0 }}>
            {data.evidence.length} source{data.evidence.length === 1 ? "" : "s"} on file
          </span>
          <button
            type="button"
            className="btn btn--quiet btn--small"
            onClick={() => setPanel(panel === "evidence" ? "none" : "evidence")}
            aria-expanded={panel === "evidence"}
          >
            {panel === "evidence" ? "Close form" : "Add evidence"}
          </button>
        </div>
        <div className="panel__body">
          {data.evidence.length === 0 ? (
            <EmptyState title="No evidence yet">
              Add a public source that bears on a criterion. Both supporting and contradicting
              sources are welcome — the review judges content, not who sent it.
            </EmptyState>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">
                  Every source submitted to this commitment, with its submitter, date, type, and
                  whether the review used it.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Source</th>
                    <th scope="col">Type</th>
                    <th scope="col">Published</th>
                    <th scope="col">Submitted by</th>
                    <th scope="col">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {data.evidence.map((item) => {
                    const usedIds = new Set(roundResults.flatMap((r) => r.evidence_used));
                    const used = usedIds.has(item.id);
                    return (
                      <tr key={item.id}>
                        <td>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            {shortenUrl(item.url)} <ExternalMark />
                          </a>
                          {item.note && (
                            <p className="hint" style={{ marginTop: 4 }}>
                              Note (not used by the review): {item.note}
                            </p>
                          )}
                        </td>
                        <td>{EVIDENCE_TYPE_LABEL[item.evidence_type] ?? item.evidence_type}</td>
                        <td className="num">
                          {item.published_date ? formatDate(item.published_date) : "—"}
                        </td>
                        <td>
                          <CopyField
                            value={item.submitter}
                            kind="address"
                            label={`submitter of evidence #${item.id}`}
                          />
                        </td>
                        <td>
                          <span className="tag">
                            {used ? "Evaluated" : hasOutcome ? "Not cited" : "Awaiting review"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {panel === "evidence" && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <EvidenceSubmitForm
                constants={constants}
                existingCount={data.evidence.length}
                submitterCount={evidenceByAccount}
                disabledReason={evidenceAvail?.enabled ? null : evidenceAvail?.reason}
                onSubmit={submitEvidence}
                busy={tx.isBusy}
              />
            </div>
          )}
        </div>
      </section>

      {/* ---------------- actions ---------------- */}
      <section className="panel" aria-labelledby="actions-heading">
        <div className="panel__head">
          <h2 id="actions-heading">Actions</h2>
        </div>
        <div className="panel__body stack">
          <div className="actions">
            <ActionButton
              variant="quiet"
              disabledReason={evidenceAvail?.enabled ? null : evidenceAvail?.reason}
              onClick={() => setPanel(panel === "evidence" ? "none" : "evidence")}
            >
              Add evidence
            </ActionButton>

            <ActionButton
              disabledReason={reviewAvail?.enabled ? null : reviewAvail?.reason}
              onClick={() => void requestReview()}
              busy={tx.isBusy}
            >
              Request review
            </ActionButton>

            <ActionButton
              variant="quiet"
              disabledReason={challengeAvail?.enabled ? null : challengeAvail?.reason}
              onClick={() => setPanel(panel === "challenge" ? "none" : "challenge")}
            >
              Open challenge
            </ActionButton>
          </div>

          {tx.phase !== "idle" && (
            <TxStatus
              phase={tx.phase}
              hash={tx.hash}
              error={tx.error}
              onRefresh={() => void tx.refresh()}
              detail={
                tx.phase === "accepted"
                  ? "Validators agreed. This result can still be appealed, so it is shown as accepted rather than final."
                  : undefined
              }
            />
          )}

          {panel === "challenge" && (
            <ChallengePanel
              commitment={commitment}
              constants={constants}
              evidence={data.evidence}
              disabledReason={challengeAvail?.enabled ? null : challengeAvail?.reason}
              alreadyChallenged={challengesByAccount >= constants.max_challenges_per_party}
              onSubmit={openChallenge}
              busy={tx.isBusy}
            />
          )}
        </div>
      </section>

      {/* ---------------- audit ---------------- */}
      <section className="panel panel--flush" aria-labelledby="audit-heading">
        <div className="panel__head">
          <h2 id="audit-heading">Audit</h2>
        </div>
        <div className="panel__body">
          <dl className="audit">
            <dt>Commitment id</dt>
            <dd className="num">#{commitment.id}</dd>

            <dt>Criteria version</dt>
            <dd className="num">
              {latestRound ? `v${latestRound.criteria_version}` : `v${commitment.version} (no review yet)`}
            </dd>

            <dt>Round</dt>
            <dd className="num">{commitment.current_round}</dd>

            <dt>Overall reason</dt>
            <dd>
              <code>{latestRound?.overall_reason ?? "—"}</code>
            </dd>

            <dt>Evaluated at</dt>
            <dd className="num">{latestRound?.evaluated_at ?? "—"}</dd>

            <dt>Registered by</dt>
            <dd>
              <CopyField value={commitment.registrant} kind="address" label="registrant address" />{" "}
              {ROLE_LABEL[commitment.registrant_role]}
            </dd>

            {finality.hash && (
              <>
                <dt>Transaction</dt>
                <dd>
                  <CopyField value={finality.hash} kind="tx" label="transaction hash" />
                </dd>
              </>
            )}

            <dt>Contract</dt>
            <dd>
              {CONTRACT_ADDRESS ? (
                <CopyField value={CONTRACT_ADDRESS} kind="address" label="contract address" />
              ) : (
                <em>not deployed in this build</em>
              )}
            </dd>

            <dt>Supersedes</dt>
            <dd className="num">{commitment.supersedes > 0 ? `#${commitment.supersedes}` : "—"}</dd>
          </dl>

          {!finality.hash && (
            <Banner title="Why no transaction hash is shown">
              <p>
                The deployed contract records the derived outcome but does not store the transaction
                hash that produced it. CivicLens will not invent one. Open this page with a{" "}
                <code>?tx=</code> parameter, or run the review from this browser, and the receipt
                and finality state appear here.
              </p>
            </Banner>
          )}
        </div>
      </section>
    </div>
  );
}

export default CommitmentDetail;
export type { Commitment };