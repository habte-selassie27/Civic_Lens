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
import { useT } from "@/i18n";

export function Demo() {
  const t = useT();
  const [active, setActive] = useState<Scenario>(SCENARIOS[0]);

  return (
    <div className="stack-lg">
      <div>
        <h1>{t("demo.title")}</h1>
        <p className="hint">{t("demo.lede")}</p>
      </div>

      {/* Mandatory honest labeling of replay vs on-network. */}
      <Banner title={t("demo.how_to_read_title")} tone="blocking">
        <p>
          <strong>{t("demo.replay_lead")}</strong> {t("demo.replay_body")}
        </p>
        <p>
          {CONTRACT_ADDRESS ? (
            <>
              {t("demo.on_network_lead")}{" "}
              <Link to="/commitments/new">{t("demo.on_network_link")}</Link>{" "}
              {t("demo.on_network_tail")}
            </>
          ) : (
            <>{t("demo.no_network")}</>
          )}
        </p>
      </Banner>

      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <section aria-labelledby="pick-heading">
        <h2 id="pick-heading" className="section-title">
          {t("demo.pick_heading")}
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
                    {t(
                      scenario.outcome.overall_outcome === "supported"
                        ? "outcome.supported"
                        : scenario.outcome.overall_outcome === "contradicted"
                          ? "outcome.contradicted"
                          : "outcome.inconclusive",
                    )}
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
  const t = useT();
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
            {t("demo.creating_tx")}
            <span className="sr-only">{t("demo.tx_link_suffix")}</span>
          </a>
        )}
        <Link className="btn btn--quiet btn--small" to={`/commitments/${commitment.id}`}>
          {t("demo.open_full_page")}
        </Link>
      </div>

      <Banner title={t("demo.what_tests_title")}>
        <p>{scenario.whatThisTests}</p>
        <p className="hint">{scenario.note}</p>
        <p className="hint">{PROVENANCE_NOTE[scenario.provenance]}</p>
      </Banner>

      <div className="split">
        <div className="stack">
          <div className="sheet sheet--commitment">
            <span className="sheet__label">{t("demo.commitment_sample")}</span>
            {commitment.commitment_text}
          </div>
          <AttributionBanner commitment={commitment} evidence={evidence} challenges={challenges} />
          <p className="hint">
            {t("demo.period", {
              period: formatPeriod(
                commitment.period_start,
                commitment.period_end,
                commitment.timezone,
              ),
            })}
          </p>
        </div>

        {/* No finality chip: a replay has no receipt. Saying "Final" here would
            be inventing a consensus result that never happened. */}
        <OutcomePanel
          outcome={outcome}
          finality="none"
          heading={t("demo.outcome_heading")}
          criteria={commitment.criteria}
          results={latest?.criteria ?? []}
        />
      </div>

      <div className="panel panel--flush">
        <div className="panel__head">
          <h3>{t("demo.ledger_heading")}</h3>
        </div>
        {commitment.criteria.length === 0 ? (
          <div className="panel__body">
            <EmptyState title={t("demo.no_criteria")} />
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
            <h3>{t("demo.why_result")}</h3>
          </div>
          <div className="panel__body">
            <p className="ledger__measure">{overallReasonCopy(latest.overall_reason)}</p>
            <p className="hint">
              {t("demo.reason_note", {
                reason: latest.overall_reason,
                date: formatDate(latest.evaluated_at.slice(0, 10)),
              })}
            </p>
          </div>
        </div>
      )}

      <section className="panel" aria-labelledby="scenario-rounds">
        <div className="panel__head">
          <h3 id="scenario-rounds">{t("demo.rounds_heading")}</h3>
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
