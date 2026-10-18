/**
 * How it works (UI-CivicLens 4.6).
 *
 * Explains consensus, equivalence, finality, and — at length, because it is the
 * most misread thing on the page — why `inconclusive` exists and what it does
 * NOT mean.
 */

import { Link } from "react-router-dom";
import { DOCS } from "@/config/explorer";
import { OUTCOME_LABEL } from "@/domain/copy";
import { useT } from "@/i18n";
import { ResultChip } from "@/components/ResultChip";

export function HowItWorks() {
  const t = useT();

  return (
    <div className="stack-lg">
      <div>
        <h1>{t("howit.title")}</h1>
        <p className="lede">{t("howit.lede")}</p>
      </div>

      {/* ---------------- the shape of a review ---------------- */}
      <section className="panel" aria-labelledby="hw-flow">
        <div className="panel__head">
          <h2 id="hw-flow">{t("howit.flow_heading")}</h2>
        </div>
        <div className="panel__body">
          <ol className="stack" style={{ paddingLeft: "1.2rem" }}>
            <li>
              <strong>{t("howit.flow_1")}</strong>
            </li>
            <li>
              <strong>{t("howit.flow_2")}</strong>
            </li>
            <li>
              <strong>{t("howit.flow_3")}</strong>
            </li>
            <li>
              <strong>{t("howit.flow_4")}</strong>
            </li>
            <li>
              <strong>{t("howit.flow_5")}</strong>
            </li>
            <li>
              <strong>{t("howit.flow_6")}</strong>
            </li>
          </ol>
        </div>
      </section>

      {/* ---------------- equivalence ---------------- */}
      <section className="panel" aria-labelledby="hw-equiv">
        <div className="panel__head">
          <h2 id="hw-equiv">{t("howit.equiv_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("howit.equiv_body")}</p>
          <ul style={{ maxWidth: "var(--measure)", paddingLeft: "1.2rem" }}>
            <li>{t("howit.equiv_result")}</li>
            <li>{t("howit.equiv_reason")}</li>
            <li>{t("howit.equiv_figure")}</li>
          </ul>
          <p>{t("howit.equiv_safeguards")}</p>
          <p>
            <a href={DOCS.equivalence} target="_blank" rel="noopener noreferrer">
              {t("howit.equiv_link")}
            </a>
          </p>
        </div>
      </section>

      {/* ---------------- the outcome table ---------------- */}
      <section className="panel" aria-labelledby="hw-outcome">
        <div className="panel__head">
          <h2 id="hw-outcome">{t("howit.outcome_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">{t("howit.outcome_caption")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("howit.outcome_col_if")}</th>
                  <th scope="col">{t("howit.outcome_col_then")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("howit.outcome_all_supported")}</td>
                  <td>
                    <ResultChip status="supported" />
                  </td>
                </tr>
                <tr>
                  <td>{t("howit.outcome_one_contradicted")}</td>
                  <td>
                    <ResultChip status="contradicted" />
                  </td>
                </tr>
                <tr>
                  <td>{t("howit.outcome_none_contradicted")}</td>
                  <td>
                    <ResultChip status="inconclusive" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>{t("howit.no_score_body")}</p>
        </div>
      </section>

      {/* ---------------- inconclusive ---------------- */}
      <section className="panel" aria-labelledby="hw-inconclusive">
        <div className="panel__head">
          <h2 id="hw-inconclusive">{t("howit.inconclusive_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("howit.inconclusive_body")}</p>

          <div className="resolution">
            <p>
              <span className="resolution__key">{t("howit.does_not_mean")}</span>
            </p>
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem" }}>
              <li>{t("howit.does_not_mean_1")}</li>
              <li>{t("howit.does_not_mean_2")}</li>
              <li>{t("howit.does_not_mean_3")}</li>
              <li>{t("howit.does_not_mean_4")}</li>
            </ul>
            <p style={{ marginTop: "var(--space-2)" }}>
              <span className="resolution__key">{t("howit.it_means")}</span>{" "}
              {t("howit.it_means_body")}
            </p>
          </div>

          <p>{t("howit.causes")}</p>
          <p>{t("howit.resolution")}</p>
          <p>{t("howit.absence")}</p>
        </div>
      </section>

      {/* ---------------- finality ---------------- */}
      <section className="panel" aria-labelledby="hw-finality">
        <div className="panel__head">
          <h2 id="hw-finality">{t("howit.finality_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("howit.finality_body_1")}</p>
          <p>{t("howit.finality_body_2")}</p>
          <p>{t("howit.finality_body_3")}</p>
        </div>
      </section>

      {/* ---------------- vocabulary ---------------- */}
      <section className="panel" aria-labelledby="hw-terms">
        <div className="panel__head">
          <h2 id="hw-terms">{t("howit.terms_heading")}</h2>
        </div>
        <div className="panel__body">
          <dl className="audit">
            <dt>{OUTCOME_LABEL.supported}</dt>
            <dd>{t("howit.term_supported_body")}</dd>
            <dt>{OUTCOME_LABEL.contradicted}</dt>
            <dd>{t("howit.term_contradicted_body")}</dd>
            <dt>{OUTCOME_LABEL.inconclusive}</dt>
            <dd>{t("howit.term_inconclusive_body")}</dd>
            <dt>{t("howit.term_validator")}</dt>
            <dd>
              {t("howit.term_validator_body")} <a href={DOCS.home} target="_blank" rel="noopener noreferrer">
                {t("colophon.genlayer_docs")}
              </a>
            </dd>
            <dt>{t("howit.term_leader")}</dt>
            <dd>{t("howit.term_leader_body")}</dd>
            <dt>{t("howit.term_finality")}</dt>
            <dd>{t("howit.term_finality_body")}</dd>
          </dl>
        </div>
      </section>

      <p className="hint">
        {t("howit.next_prefix")} <Link to="/fairness">{t("howit.next_link")}</Link>.
      </p>
    </div>
  );
}

export default HowItWorks;
