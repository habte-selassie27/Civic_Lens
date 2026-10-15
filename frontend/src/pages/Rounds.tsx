/**
 * Round history (UI-CivicLens 4.4): `/commitments/:id/rounds`.
 *
 * A numbered sequence — numbering is right here and only here, because rounds
 * really are a sequence. Prior rounds are never hidden or overwritten.
 */

import { Link, useParams } from "react-router-dom";
import { useCommitmentBundle } from "@/hooks/useReads";
import { useFinality } from "@/hooks/useFinality";
import { RoundTimeline } from "@/components/RoundTimeline";
import { DataModeBadge } from "@/components/DataModeBadge";
import {
  ErrorView,
  LoadingRegion,
  SampleBanner,
} from "@/components/Chrome";
import { reads } from "@/services";

export function Rounds() {
  const params = useParams();
  const commitmentId = Number(params.id);
  const { data, isLoading, error, refetch } = useCommitmentBundle(
    Number.isFinite(commitmentId) ? commitmentId : null,
  );
  const finality = useFinality(commitmentId);

  if (isLoading) return <LoadingRegion label="Loading round history" />;

  if (error || !data) {
    return (
      <ErrorView
        error={error ?? new Error("The round history could not be read.")}
        onRetry={() => void refetch()}
        title="The round history could not be read."
      />
    );
  }

  const { commitment, rounds, evidence } = data;

  return (
    <div className="stack-lg">
      <div>
        <p className="hint">
          <Link to={`/commitments/${commitmentId}`}>{commitment.subject}</Link>
        </p>
        <h1>Round history</h1>
        <p className="hint">
          Every review that has completed, in order. What changed between rounds is called out;
          earlier rounds are never replaced.
        </p>
      </div>

      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
        <DataModeBadge
          mode={commitment.data_mode}
          override={reads.isSample ? "sample" : commitment.data_mode}
        />
        <span className="tag">
          {rounds.length} round{rounds.length === 1 ? "" : "s"}
        </span>
        <span className="tag">{data.challenges.length} challenge(s)</span>
      </div>

      <section className="panel" aria-labelledby="timeline-heading">
        <div className="panel__head">
          <h2 id="timeline-heading">Rounds</h2>
        </div>
        <div className="panel__body">
          <RoundTimeline
            rounds={rounds}
            evidence={evidence}
            currentRound={finality.hash ? commitment.current_round : undefined}
            commitmentId={commitmentId}
          />
        </div>
      </section>

      {data.challenges.length > 0 && (
        <section className="panel panel--flush" aria-labelledby="challenges-heading">
          <div className="panel__head">
            <h2 id="challenges-heading">Challenges</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">
                Challenges opened on this commitment, who opened them, and what they attached.
              </caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Round challenged</th>
                  <th scope="col">Opened by</th>
                  <th scope="col">Target</th>
                  <th scope="col">Grounds</th>
                  <th scope="col">Attached evidence</th>
                </tr>
              </thead>
              <tbody>
                {data.challenges.map((c) => (
                  <tr key={c.id}>
                    <td className="num">{c.id}</td>
                    <td className="num">{c.round_challenged}</td>
                    <td>
                      <code>{c.challenger}</code>
                    </td>
                    <td>{c.target ? `Criterion ${c.target}` : "The overall outcome"}</td>
                    <td>{c.grounds}</td>
                    <td className="num">
                      {c.new_evidence_ids.length > 0 ? c.new_evidence_ids.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="hint">
        <Link to={`/commitments/${commitmentId}`}>Back to the commitment page</Link>
      </p>
    </div>
  );
}

export default Rounds;