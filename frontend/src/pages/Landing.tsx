/**
 * Landing (UI-CivicLens 4.1).
 *
 * One plain sentence, a REAL sample commitment rendered as a Criterion Ledger
 * (not a stock illustration), and the visible line about what CivicLens does
 * not do.
 */

import { Link } from "react-router-dom";
import { reads } from "@/services";
import { LANDING_SCENARIO } from "@/domain/fixtures";
import { SCENARIO_SUMMARIES } from "@/domain/fixtures";
import { useT } from "@/i18n";
import { CriterionLedger } from "@/components/CriterionLedger";
import { OutcomePanel } from "@/components/OutcomePanel";
import { DataModeBadge } from "@/components/DataModeBadge";
import { AttributionBanner } from "@/components/AttributionBanner";
import { Banner } from "@/components/Chrome";

export function Landing() {
  const t = useT();
  const scenario = LANDING_SCENARIO;
  const round = scenario.rounds[scenario.rounds.length - 1];
  const roundResults = round?.criteria ?? [];

  return (
    <>
      <div className="stack-lg">
        <section className="stack">
          <h1>{t("landing.title")}</h1>
          <p className="lede">{t("landing.lede")}</p>
          <div className="actions">
            <Link className="btn" to="/demo">
              {t("landing.cta_demo")}
            </Link>
            <Link className="btn btn--quiet" to="/commitments/new">
              {t("landing.cta_register")}
            </Link>
          </div>
          <Banner title={t("landing.does_not_title")}>
            <p>{t("landing.does_not_body")}</p>
          </Banner>
        </section>

        {reads.isSample && reads.sampleReason && (
          <Banner title={t("landing.sample_build")} tone="blocking">
            <p>{reads.sampleReason}</p>
          </Banner>
        )}

        {/* A real sample commitment, not an illustration. */}
        <section className="stack">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <h2>{t("landing.sample_heading")}</h2>
            <DataModeBadge mode={scenario.commitment.data_mode} />
          </div>
          <p className="hint">{t("landing.sample_hint", { subject: scenario.commitment.subject })}</p>

          <div className="split">
            <div className="stack">
              <div className="sheet sheet--commitment">
                <span className="sheet__label">{t("landing.commitment_as_stated")}</span>
                {scenario.commitment.commitment_text}
              </div>
              <AttributionBanner commitment={scenario.commitment} />
            </div>

            {/* Finality stays unknown: a recorded replay has no live receipt. */}
            <OutcomePanel
              outcome={scenario.outcome}
              finality="none"
              heading={t("landing.outcome_replay_heading")}
              criteria={scenario.commitment.criteria}
              results={roundResults}
            />
          </div>

          <div className="panel panel--flush">
            <div className="panel__head">
              <h2>{t("landing.ledger_heading")}</h2>
            </div>
            <CriterionLedger
              criteria={scenario.commitment.criteria}
              results={round.criteria}
              evidence={scenario.evidence}
            />
          </div>

          <p>
            <Link to={`/commitments/${scenario.commitment.id}`}>{t("landing.open_commitment")}</Link>{" "}
            {t("landing.open_commitment_tail")}
          </p>
        </section>

        {/* Why GenLayer, briefly. */}
        <section className="panel">
          <div className="panel__head">
            <h2>{t("landing.why_heading")}</h2>
          </div>
          <div className="panel__body stack">
            <p>{t("landing.why_body_1")}</p>
            <p>{t("landing.why_body_2")}</p>
            <p>
              <Link to="/how-it-works">{t("landing.how_link")}</Link>.
            </p>
          </div>
        </section>

        {/* Everything else in the sample set, as plain links. */}
        <section className="panel panel--flush">
          <div className="panel__head">
            <h2>{t("landing.outcomes_heading")}</h2>
          </div>
          <div className="panel__body">
            <ul style={{ margin: 0, paddingLeft: "1.1rem", columns: "2 18rem", columnGap: "2rem" }}>
              {SCENARIO_SUMMARIES.map((s) => (
                <li key={s.id} style={{ marginBottom: "var(--space-2)", breakInside: "avoid" }}>
                  <Link to={`/commitments/${s.id}`}>{s.subject}</Link>{" "}
                  <span className="hint" style={{ display: "inline" }}>
                    {t("landing.round_count", {
                      count: s.round_count,
                      plural: s.round_count === 1 ? "" : "s",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

export default Landing;
