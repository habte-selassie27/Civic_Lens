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
import { CriterionLedger } from "@/components/CriterionLedger";
import { OutcomePanel } from "@/components/OutcomePanel";
import { DataModeBadge } from "@/components/DataModeBadge";
import { AttributionBanner } from "@/components/AttributionBanner";
import { Banner } from "@/components/Chrome";

export function Landing() {
  const scenario = LANDING_SCENARIO;
  const round = scenario.rounds[scenario.rounds.length - 1];
  const roundResults = round?.criteria ?? [];

  return (
    <>
      <div className="stack-lg">
        <section className="stack">
          <h1>What the published evidence supports</h1>
          <p className="lede">
            CivicLens checks whether published evidence supports what an organization publicly
            committed to — criterion by criterion, with the sources shown.
          </p>
          <div className="actions">
            <Link className="btn" to="/demo">
              Open the demo
            </Link>
            <Link className="btn btn--quiet" to="/commitments/new">
              Register a commitment
            </Link>
          </div>
          <Banner title="What CivicLens does not do">
            <p>
              CivicLens reports what published evidence supports. It doesn't judge intent. It does
              not claim a document is authentic, and it does not score organizations.
            </p>
          </Banner>
        </section>

        {reads.isSample && reads.sampleReason && (
          <Banner title="This build is running on sample data" tone="blocking">
            <p>{reads.sampleReason}</p>
          </Banner>
        )}

        {/* A real sample commitment, not an illustration. */}
        <section className="stack">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <h2>A sample commitment, shown in full</h2>
            <DataModeBadge mode={scenario.commitment.data_mode} />
          </div>
          <p className="hint">
            This is the same component the app uses for live evidence — the Criterion Ledger. The
            subject, "{scenario.commitment.subject}", is fabricated for this demonstration.
          </p>

          <div className="split">
            <div className="stack">
              <div className="sheet sheet--commitment">
                <span className="sheet__label">Commitment as stated</span>
                {scenario.commitment.commitment_text}
              </div>
              <AttributionBanner commitment={scenario.commitment} />
            </div>

            {/* Finality stays unknown: a recorded replay has no live receipt. */}
            <OutcomePanel
              outcome={scenario.outcome}
              finality="none"
              heading="Outcome (replay of a recorded result)"
              criteria={scenario.commitment.criteria}
              results={roundResults}
            />
          </div>

          <div className="panel panel--flush">
            <div className="panel__head">
              <h2>Criterion ledger</h2>
            </div>
            <CriterionLedger
              criteria={scenario.commitment.criteria}
              results={round.criteria}
              evidence={scenario.evidence}
            />
          </div>

          <p>
            <Link to={`/commitments/${scenario.commitment.id}`}>
              Open this commitment page
            </Link>{" "}
            to see the evidence panel, the audit block, and the round history.
          </p>
        </section>

        {/* Why GenLayer, briefly. */}
        <section className="panel">
          <div className="panel__head">
            <h2>Why this needs GenLayer</h2>
          </div>
          <div className="panel__body stack">
            <p>
              A commitment says one thing in its own words; the evidence is phrased differently.
              Deciding whether a report <em>supports</em> a stated criterion is a question about
              meaning, not about matching keywords — and public pages change between the time a
              validator reads them and the time it reports.
            </p>
            <p>
              So the reading is made by validators that work independently and must{" "}
              <strong>agree on meaning</strong>, not on identical bytes. The overall outcome is
              then derived by ordinary code from the per-criterion results — the model never
              decides it.
            </p>
            <p>
              <Link to="/how-it-works">How a review actually runs</Link>.
            </p>
          </div>
        </section>

        {/* Everything else in the sample set, as plain links. */}
        <section className="panel panel--flush">
          <div className="panel__head">
            <h2>What a commitment can end up showing</h2>
          </div>
          <div className="panel__body">
            <ul style={{ margin: 0, paddingLeft: "1.1rem", columns: "2 18rem", columnGap: "2rem" }}>
              {SCENARIO_SUMMARIES.map((s) => (
                <li key={s.id} style={{ marginBottom: "var(--space-2)", breakInside: "avoid" }}>
                  <Link to={`/commitments/${s.id}`}>{s.subject}</Link>{" "}
                  <span className="hint" style={{ display: "inline" }}>
                    — {s.round_count} round{s.round_count === 1 ? "" : "s"}
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