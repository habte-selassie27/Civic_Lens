/**
 * Fairness and limitations (UI-CivicLens 4.6, AGENTS section 12).
 *
 * Deliberately honest about what the system cannot do. A page that only lists
 * strengths is not a fairness page.
 */

import { Link } from "react-router-dom";

export function Fairness() {
  return (
    <div className="stack-lg">
      <div>
        <h1>Safeguards and limitations</h1>
        <p className="lede">
          CivicLens reports what published evidence supports about a public commitment. This page
          says what that means, what it does not mean, and where the system is weak.
        </p>
      </div>

      <section className="panel" aria-labelledby="fair-evidence">
        <div className="panel__head">
          <h2 id="fair-evidence">Evidence, not intent</h2>
        </div>
        <div className="panel__body stack">
          <p>
            CivicLens never asserts motive, bad faith, or that anyone broke a promise. It compares
            published sources against criteria that were stated in advance.
          </p>
          <p>
            A contradicted criterion means the evidence conflicts with what was committed to. It
            does not mean anyone lied, and the interface never uses words that would suggest it.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-inconclusive">
        <div className="panel__head">
          <h2 id="fair-inconclusive">Inconclusive is not failure</h2>
        </div>
        <div className="panel__body stack">
          <p>
            Absence of evidence is inconclusive — never contradicted. Inconclusive is shown in a
            neutral colour, never styled as an error, never rolled into a negative score, and never
            used to rank or flag a subject.
          </p>
          <p>
            <Link to="/how-it-works">Why the third result exists</Link>
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-authentic">
        <div className="panel__head">
          <h2 id="fair-authentic">What consensus cannot prove</h2>
        </div>
        <div className="panel__body stack">
          <p>
            <strong>Agreement is not authenticity.</strong> Validators agreeing that a document
            says something does not establish that the document is genuine, unaltered, or written
            by who it claims to be. CivicLens cannot detect a fabricated source that looks
            plausible.
          </p>
          <p>
            Mitigations are preferences, not guarantees: official reports, audited statements and
            government datasets are weighted better than self-published claims, and archived
            snapshots are used where available. But no source is treated as proven authentic.
          </p>
          <p>
            For the same reason, the review cannot prove a negative. If a subject published no
            report, CivicLens cannot tell the difference between "did nothing" and "did it but did
            not publish" — that is inconclusive, and it stays that way.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-attribution">
        <div className="panel__head">
          <h2 id="fair-attribution">Attribution honesty</h2>
        </div>
        <div className="panel__body stack">
          <p>
            Every commitment page states who registered the entry and in what role, and says that
            the subject has not necessarily verified or endorsed it. CivicLens does not verify that
            a registrant actually speaks for the organization it names — nobody can, from an
            address alone.
          </p>
          <p>
            A registrant role of "for their own organization" is a self-declaration, not a verified
            identity.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-response">
        <div className="panel__head">
          <h2 id="fair-response">Right of response</h2>
        </div>
        <div className="panel__body stack">
          <p>
            Anyone — including the subject organization — can submit evidence and open a challenge.
            A challenge adds new evidence and triggers a new review round. The subject's responses
            are shown on the commitment page, and the full round and challenge history stays
            public.
          </p>
          <p>
            Limits exist to stop abuse, not to shut anyone out: a small number of submissions per
            party, and a small number of rounds. These are enforced by the contract and shown in
            the interface before anyone acts.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-privacy">
        <div className="panel__head">
          <h2 id="fair-privacy">Privacy</h2>
        </div>
        <div className="panel__body stack">
          <p>
            CivicLens is for public commitments by public organizations and institutions. Entries
            naming a private individual as the subject are rejected by the contract, and no feature
            for profiling individuals is built.
          </p>
          <p>
            What is stored on chain: the commitment text, criteria, source links, and the submitter
            addresses needed to apply limits and record who did what. No personal data beyond
            addresses and public references. Notes attached to evidence are public, so they should
            not contain anything private.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-gaming">
        <div className="panel__head">
          <h2 id="fair-gaming">Gaming resistance, and its limits</h2>
        </div>
        <div className="panel__body stack">
          <p>What the design does:</p>
          <ul style={{ maxWidth: "var(--measure)", paddingLeft: "1.2rem" }}>
            <li>accepts supporting and contradicting evidence alike;</li>
            <li>judges evidence on content, never on who submitted it;</li>
            <li>ignores submitter notes entirely — the review code never reads them;</li>
            <li>bounds submissions per party and per commitment, and rejects duplicates;</li>
            <li>locks criteria once review starts, so a criterion cannot be quietly softened;</li>
            <li>treats evidence as data, so instructions embedded inside a document are ignored;</li>
            <li>rejects a verdict that cites sources outside the submitted set.</li>
          </ul>
          <p>What it cannot do:</p>
          <ul style={{ maxWidth: "var(--measure)", paddingLeft: "1.2rem" }}>
            <li>
              stop a coordinated group from submitting many sources. Bounds limit volume per party,
              not total volume across many parties.
            </li>
            <li>
              stop selective submission — nobody can be forced to add the source that would have
              changed the result.
            </li>
            <li>
              prevent a well-resourced subject from publishing a document designed to be easy to
              read favourably, or from publishing one designed to be hard.
            </li>
            <li>guarantee that a reading model interprets a complex criterion the way a careful
              human would, in every case.</li>
          </ul>
          <p>
            These are real limitations. Read the evidence and the per-criterion reasons, not the
            single overall label.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-finality">
        <div className="panel__head">
          <h2 id="fair-finality">Finality honesty</h2>
        </div>
        <div className="panel__body">
          <p>
            An accepted result is not presented as permanent. Accepted and final are distinct,
            visibly distinct states, and appeal and challenge both remain open until they are not.
          </p>
        </div>
      </section>

      <section className="panel" aria-labelledby="fair-data">
        <div className="panel__head">
          <h2 id="fair-data">Sample data</h2>
        </div>
        <div className="panel__body stack">
          <p>
            Sample scenarios are labeled on every surface they appear on. They replay recorded
            results about fabricated organizations and are never presented as findings about real
            entities.
          </p>
          <p>
            <Link to="/demo">See the sample scenarios</Link>
          </p>
        </div>
      </section>

      <p className="hint">
        Back to <Link to="/">the start</Link>.
      </p>
    </div>
  );
}

export default Fairness;