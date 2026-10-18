/**
 * Fairness and limitations (UI-CivicLens 4.6, AGENTS section 12).
 *
 * Deliberately honest about what the system cannot do. A page that only lists
 * strengths is not a fairness page.
 */

import { Link } from "react-router-dom";
import { useT } from "@/i18n";

export function Fairness() {
  const t = useT();

  return (
    <div className="stack-lg">
      <div>
        <h1>{t("fair.title")}</h1>
        <p className="lede">{t("fair.lede")}</p>
      </div>

      <section className="panel" aria-labelledby="fair-evidence">
        <div className="panel__head">
          <h2 id="fair-evidence">{t("fair.evidence_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.evidence_1")}</p>
          <p>{t("fair.evidence_2")}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-inconclusive">
        <div className="panel__head">
          <h2 id="fair-inconclusive">{t("fair.inconclusive_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.no_score_body")}</p>
          <p>
            <Link to="/how-it-works">{t("fair.inconclusive_link")}</Link>
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-authentic">
        <div className="panel__head">
          <h2 id="fair-authentic">{t("fair.authentic_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.authentic_1")}</p>
          <p>{t("fair.authentic_2")}</p>
          <p>{t("fair.authentic_3")}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-attribution">
        <div className="panel__head">
          <h2 id="fair-attribution">{t("fair.attribution_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.attribution_1")}</p>
          <p>{t("fair.attribution_2")}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-response">
        <div className="panel__head">
          <h2 id="fair-response">{t("fair.response_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.response_1")}</p>
          <p>{t("fair.response_2")}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-privacy">
        <div className="panel__head">
          <h2 id="fair-privacy">{t("fair.privacy_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.privacy_1")}</p>
          <p>{t("fair.privacy_2")}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-gaming">
        <div className="panel__head">
          <h2 id="fair-gaming">{t("fair.gaming_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.gaming_does")}</p>
          <ul style={{ maxWidth: "var(--measure)", paddingLeft: "1.2rem" }}>
            <li>{t("fair.gaming_does_1")}</li>
            <li>{t("fair.gaming_does_2")}</li>
            <li>{t("fair.gaming_does_3")}</li>
            <li>{t("fair.gaming_does_4")}</li>
            <li>{t("fair.gaming_does_5")}</li>
            <li>{t("fair.gaming_does_6")}</li>
            <li>{t("fair.gaming_does_7")}</li>
          </ul>
          <p>{t("fair.gaming_cannot")}</p>
          <ul style={{ maxWidth: "var(--measure)", paddingLeft: "1.2rem" }}>
            <li>{t("fair.gaming_cannot_1")}</li>
            <li>{t("fair.gaming_cannot_2")}</li>
            <li>{t("fair.gaming_cannot_3")}</li>
            <li>{t("fair.gaming_cannot_4")}</li>
          </ul>
          <p>{t("fair.gaming_footer")}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-finality">
        <div className="panel__head">
          <h2 id="fair-finality">{t("fair.finality_heading")}</h2>
        </div>
        <div className="panel__body">
          <p>{t("fair.finality_body")}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-data">
        <div className="panel__head">
          <h2 id="fair-data">{t("fair.data_heading")}</h2>
        </div>
        <div className="panel__body stack">
          <p>{t("fair.data_1")}</p>
          <p>
            <Link to="/demo">{t("fair.data_link")}</Link>
          </p>
        </div>
      </section>

      <p className="hint">
        {t("fair.back_prefix")} <Link to="/">{t("fair.back_link")}</Link>.
      </p>
    </div>
  );
}

export default Fairness;
