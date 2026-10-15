/**
 * Demo (UI-CivicLens 4.5 and section 8).
 *
 * Eight scenarios, each with a one-line "what this tests", the Criterion
 * Ledger, the outcome, and the round history.
 *
 * HONEST LABELING IS THE POINT OF THIS PAGE. Every scenario is a REPLAY of a
 * recorded result, tagged as such. "Run on network" is offered separately and
 * only where a contract address is configured; it performs a real transaction
 * with real receipts. No scenario is ever presented as a live consensus run.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { SCENARIOS, reads } from "@/services";
import { CONTRACT_ADDRESS } from "@/config/contracts";
import { overallReasonCopy } from "@/domain/copy";
import { formatDate, formatPeriod } from "@/domain/format";
import type { Scenario } from "@/domain/fixtures";
import { PROVENANCE_LABEL, PROVENANCE_NOTE } from "@/domain/copy";
import { explorerTxUrl } from "@/config/explorer";
import { CriterionLedger } from "@/components/CriterionLedger";
import { OutcomePanel } from "@/components/OutcomePanel";
import { DataModeBadge } from "@/components/DataModeBadge";
import { AttributionBanner } from "@/components/AttributionBanner";
import { RoundTimeline } from "@/components/RoundTimeline";
import { Banner, EmptyState, SampleBanner } from "@/components/Chrome";

export function Demo() {
  const [active, setActive] = useState<Scenario>(SCENARIOS[0]);

  return (
    <div className="stack-lg">
      <div>
        <h1>Demo</h1>
        <p className="hint">
          Every outcome a CivicLens review can produce, without waiting on live evidence.
        </p>
      </div>

      {/* Mandatory honest labeling of replay vs on-network. */}
      <Banner title="How to read this page" tone="blocking">
        <p>
          <strong>Replay of a recorded result.</strong> Each scenario below is a stored record of a
          review, shown so the interface can be evaluated. The subjects are fabricated sample
          organizations. Nothing here is a finding about a real entity.
        </p>
        <p>
          {CONTRACT_ADDRESS ? (
            <>
              A deployed contract is configured in this build, so you can also{" "}
              <Link to="/commitments/new">register a commitment and run a real review on network</Link>{" "}
              with real transactions and receipts.
            </>
          ) : (
            <>
              No contract address is configured, so there is no "run on network" option here — and
              that is deliberate. CivicLens does not simulate a transaction it did not send.
            </>
          )}
        </p>
      </Banner>

      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <section aria-labelledby="pick-heading">
        <h2 id="pick-heading" className="section-title">
          Pick a scenario
        </h2>
        <div className="scenario-grid">
          {SCENARIOS.map((scenario, index) => (
            <button
              key={scenario.slug}
              type="button"
              className="scenario"
              onClick={() => setActive(scenario)}
              aria-pressed={active.slug === scenario.slug}
              style={
                active.slug === scenario.slug
                  ? { borderColor: "var(--citation)", borderWidth: 2 }
                  : undefined
              }
            >
              <div className="scenario__head">
                <span className="scenario__name">
                  {index + 1}. {scenario.name}
                </span>
                <span className="tag tag--provenance">{PROVENANCE_LABEL[scenario.provenance]}</span>
              </div>
              <div className="scenario__body">
                <p className="scenario__tests">{scenario.whatThisTests}</p>
                {scenario.outcome.has_outcome && scenario.outcome.overall_outcome && (
                  <span className={`chip chip--${scenario.outcome.overall_outcome}`}>
                    <span className="chip__mark" />
                    {scenario.outcome.overall_outcome === "supported"
                      ? "Evidence supports"
                      : scenario.outcome.overall_outcome === "contradicted"
                        ? "Evidence contradicts"
                        : "Inconclusive"}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      <ScenarioDetail scenario={active} />
    </div>
  );
}

function ScenarioDetail({ scenario }: { scenario: Scenario }) {
  const { commitment, evidence, rounds, outcome, challenges } = scenario;
  const latest = rounds[rounds.length - 1];

  return (
    <section className="stack-lg" aria-labelledby="scenario-heading">
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
        <h2 id="scenario-heading">{scenario.name}</h2>
        <DataModeBadge mode="sample" />
        <span className="tag tag--provenance">{PROVENANCE_LABEL[scenario.provenance]}</span>
        {explorerTxUrl(scenario.recordedTx ?? "") && (
          <a
            className="btn btn--quiet btn--small"
            href={explorerTxUrl(scenario.recordedTx ?? "")!}
            target="_blank"
            rel="noreferrer"
          >
            Creating transaction
            <span className="sr-only"> on the GenLayer Studio explorer (opens in a new tab)</span>
          </a>
        )}
        <Link className="btn btn--quiet btn--small" to={`/commitments/${commitment.id}`}>
          Open as a full page
        </Link>
      </div>

      <Banner title="What this tests">
        <p>{scenario.whatThisTests}</p>
        <p className="hint">{scenario.note}</p>
        <p className="hint">{PROVENANCE_NOTE[scenario.provenance]}</p>
      </Banner>

      <div className="split">
        <div className="stack">
          <div className="sheet sheet--commitment">
            <span className="sheet__label">Commitment as stated (sample)</span>
            {commitment.commitment_text}
          </div>
          <AttributionBanner commitment={commitment} evidence={evidence} challenges={challenges} />
          <p className="hint">
            Evaluation period{" "}
            {formatPeriod(commitment.period_start, commitment.period_end, commitment.timezone)}
          </p>
        </div>

        {/* No finality chip: a replay has no receipt. Saying "Final" here would
            be inventing a consensus result that never happened. */}
        <OutcomePanel
          outcome={outcome}
          finality="none"
          heading="Outcome (recorded result)"
          criteria={commitment.criteria}
          results={latest?.criteria ?? []}
        />
      </div>

      <div className="panel panel--flush">
        <div className="panel__head">
          <h3>Criterion ledger</h3>
        </div>
        {commitment.criteria.length === 0 ? (
          <div className="panel__body">
            <EmptyState title="This scenario has no criteria" />
          </div>
        ) : (
          <CriterionLedger
            criteria={commitment.criteria}
            results={latest?.criteria ?? []}
            evidence={evidence}
          />
        )}
      </div>

      {latest && (
        <div className="panel">
          <div className="panel__head">
            <h3>Why this result</h3>
          </div>
          <div className="panel__body">
            <p className="ledger__measure">{overallReasonCopy(latest.overall_reason)}</p>
            <p className="hint">
              Recorded reason code <code>{latest.overall_reason}</code>, evaluated{" "}
              {formatDate(latest.evaluated_at.slice(0, 10))}.
            </p>
          </div>
        </div>
      )}

      <section className="panel" aria-labelledby="scenario-rounds">
        <div className="panel__head">
          <h3 id="scenario-rounds">Round history</h3>
        </div>
        <div className="panel__body">
          <RoundTimeline
            rounds={rounds}
            evidence={evidence}
            currentRound={commitment.current_round}
            commitmentId={commitment.id}
          />
        </div>
      </section>
    </section>
  );
}

export default Demo;