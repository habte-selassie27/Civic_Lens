/**
 * How it works (UI-CivicLens 4.6).
 *
 * Explains consensus, equivalence, finality, and — at length, because it is the
 * most misread thing on the page — why `inconclusive` exists and what it does
 * NOT mean.
 */

import { Link } from "react-router-dom";
import { DOCS } from "@/config/explorer";
import { ResultChip } from "@/components/ResultChip";

export function HowItWorks() {
  return (
    <div className="stack-lg">
      <div>
        <h1>How it works</h1>
        <p className="lede">
          CivicLens reviews public evidence against criteria that were published in advance. This
          page explains what happens during a review, and what each result does and does not mean.
        </p>
      </div>

      {/* ---------------- the shape of a review ---------------- */}
      <section className="panel" aria-labelledby="hw-flow">
        <div className="panel__head">
          <h2 id="hw-flow">What a review does</h2>
        </div>
        <div className="panel__body">
          <ol className="stack" style={{ paddingLeft: "1.2rem" }}>
            <li>
              <strong>A commitment is registered</strong> with criteria stated in advance, along
              with the link to where the commitment was published and the period it covers.
            </li>
            <li>
              <strong>Anyone adds public evidence</strong> — supporting or contradicting. Both are
              accepted. What someone writes alongside a link is kept on the record but never read
              by the review.
            </li>
            <li>
              <strong>The registrant requests a review.</strong> Sources are fetched and read
              against each criterion.
            </li>
            <li>
              <strong>Validators work independently</strong> and must reach the same{" "}
              <em>meaning</em>, not the same bytes. Each criterion gets a result, the reason, and
              the sources it relied on.
            </li>
            <li>
              <strong>The overall outcome is derived in ordinary code</strong> from the
              per-criterion results. The model never decides it.
            </li>
            <li>
              <strong>The result is recorded as a round.</strong> It can be challenged, which opens
              a new round with new evidence. Earlier rounds stay on the record.
            </li>
          </ol>
        </div>
      </section>

      {/* ---------------- equivalence ---------------- */}
      <section className="panel" aria-labelledby="hw-equiv">
        <div className="panel__head">
          <h2 id="hw-equiv">What "agreement" means here</h2>
        </div>
        <div className="panel__body stack">
          <p>
            Public pages change, and a model will rarely phrase two readings identically. So
            validators do not have to produce the same text. They have to agree on:
          </p>
          <ul style={{ maxWidth: "var(--measure)", paddingLeft: "1.2rem" }}>
            <li>the <strong>result</strong> for each criterion — exact match, no tolerance;</li>
            <li>the <strong>reason code</strong> — exact, or within a documented equivalent group;</li>
            <li>
              for a numeric criterion, the extracted <strong>figure</strong> within a tolerance and
              on the same side of the threshold.
            </li>
          </ul>
          <p>
            Two safeguards stop validators agreeing on something wrong. A definite verdict must cite
            sources that are actually in the submitted set, and a numeric verdict must agree with
            its own extracted figure. A verdict that fails either check is rejected rather than
            stored.
          </p>
          <p>
            <a href={DOCS.equivalence} target="_blank" rel="noopener noreferrer">
              Read the equivalence principle in the GenLayer docs
            </a>
          </p>
        </div>
      </section>

      {/* ---------------- the outcome table ---------------- */}
      <section className="panel" aria-labelledby="hw-outcome">
        <div className="panel__head">
          <h2 id="hw-outcome">How the overall outcome is derived</h2>
        </div>
        <div className="panel__body stack">
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">
                The conditions under which each overall outcome is derived.
              </caption>
              <thead>
                <tr>
                  <th scope="col">If, among required criteria…</th>
                  <th scope="col">The overall outcome is</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>all are supported</td>
                  <td>
                    <ResultChip status="supported" />
                  </td>
                </tr>
                <tr>
                  <td>at least one is contradicted</td>
                  <td>
                    <ResultChip status="contradicted" />
                  </td>
                </tr>
                <tr>
                  <td>none is contradicted but at least one is inconclusive</td>
                  <td>
                    <ResultChip status="inconclusive" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Optional criteria are recorded and shown, but they never decide the overall outcome.
            There is no score, no grade, and no ranking — the outcome is a statement about the
            evidence on file, not a number to compare subjects by.
          </p>
        </div>
      </section>

      {/* ---------------- inconclusive ---------------- */}
      <section className="panel" aria-labelledby="hw-inconclusive">
        <div className="panel__head">
          <h2 id="hw-inconclusive">Why "inconclusive" exists</h2>
        </div>
        <div className="panel__body stack">
          <p>
            A lot of public commitments simply do not have enough published evidence to decide
            anything. Without a third result, that situation has to be squeezed into either
            "supported" or "contradicted", and both would be false.
          </p>

          <div className="resolution">
            <p>
              <span className="resolution__key">Inconclusive does not mean:</span>
            </p>
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem" }}>
              <li>the organization did not do what it said;</li>
              <li>the commitment was broken, missed, or unfulfilled;</li>
              <li>anyone acted in bad faith;</li>
              <li>the evidence was weighed and found wanting.</li>
            </ul>
            <p style={{ marginTop: "var(--space-2)" }}>
              <span className="resolution__key">It means:</span> the review could not determine
              whether the evidence supports the criterion as written. That is a statement about the
              evidence, and it is shown in a neutral colour — never a warning colour, never a score.
            </p>
          </div>

          <p>
            Common causes: nothing relevant was submitted; two authoritative sources disagree; a
            source could not be reached; the criterion's wording was too vague to match anything;
            or a figure was published in a different unit than the criterion uses.
          </p>
          <p>
            Every inconclusive result says what is missing and what would resolve it — for example a
            published report, a clearer criterion version, or a source that reconciles the
            disagreement.
          </p>
          <p>
            Absence of evidence is <strong>always</strong> inconclusive. It is never treated as
            contradiction.
          </p>
        </div>
      </section>

      {/* ---------------- finality ---------------- */}
      <section className="panel" aria-labelledby="hw-finality">
        <div className="panel__head">
          <h2 id="hw-finality">Accepted is not final</h2>
        </div>
        <div className="panel__body stack">
          <p>
            GenLayer's consensus moves through stages. Once validators agree, the result is{" "}
            <strong>accepted</strong> — which means it can still be appealed. Only after the appeal
            window closes does it become <strong>final</strong>.
          </p>
          <p>
            CivicLens shows these two states differently and never collapses them. An accepted
            result is labelled "Accepted — can still be appealed", and nothing in the interface
            implies permanence before finality is reached.
          </p>
          <p>
            Separately from protocol appeals, any CivicLens challenge opens a{" "}
            <em>new review round</em> with new evidence attached. The two are different things: a
            protocol appeal disputes the committee's decision on the same inputs, while a challenge
            supplies new inputs. Neither replaces the other.
          </p>
        </div>
      </section>

      {/* ---------------- vocabulary ---------------- */}
      <section className="panel" aria-labelledby="hw-terms">
        <div className="panel__head">
          <h2 id="hw-terms">Words used on this site</h2>
        </div>
        <div className="panel__body">
          <dl className="audit">
            <dt>Evidence supports</dt>
            <dd>Published evidence bears out the criterion as written. Not a judgement of intent.</dd>
            <dt>Evidence contradicts</dt>
            <dd>Published evidence conflicts with the criterion as written.</dd>
            <dt>Inconclusive</dt>
            <dd>The evidence did not allow a determination either way.</dd>
            <dt>Validator</dt>
            <dd>
              An independent node that evaluates the evidence and must agree with the others on
              meaning.{" "}
              <a href={DOCS.home} target="_blank" rel="noopener noreferrer">
                GenLayer docs
              </a>
            </dd>
            <dt>Leader</dt>
            <dd>The validator that produces the first reading the others check.</dd>
            <dt>Finality</dt>
            <dd>The point after which a result can no longer be appealed.</dd>
          </dl>
        </div>
      </section>

      <p className="hint">
        Next: <Link to="/fairness">safeguards and limitations</Link>.
      </p>
    </div>
  );
}

export default HowItWorks;