/**
 * RoundTimeline (UI-CivicLens 5.9).
 *
 * Numbered markers are used HERE — and only here — because the round history
 * really is a sequence (section 2.3).
 *
 * Prior rounds are never hidden or overwritten. Each round shows what triggered
 * it, the evidence added since the last round, the per-criterion results, the
 * derived outcome, and the differences from the previous round.
 */

import { Link } from "react-router-dom";
import type { EvidenceItem, ResultStatus, ReviewStatus, RoundRecord } from "@/domain/types";
import { TRIGGER_LABEL, overallReasonCopy } from "@/domain/copy";
import { formatDate } from "@/domain/format";
import { ResultChip } from "./ResultChip";

export interface RoundTimelineProps {
  rounds: RoundRecord[];
  evidence: EvidenceItem[];
  /** The round the detail page is currently showing. */
  currentRound?: number;
  commitmentId: number;
}

interface RoundDiff {
  criterionId: number;
  from: ResultStatus;
  to: ReviewStatus;
  changed: boolean;
}

function diffRounds(previous: RoundRecord | undefined, round: RoundRecord): RoundDiff[] {
  if (!previous) return [];
  return round.criteria.map((next) => {
    const before = previous.criteria.find((c) => c.criterion_id === next.criterion_id);
    const from: ResultStatus = before?.status ?? "pending";
    return {
      criterionId: next.criterion_id,
      from,
      to: next.status,
      changed: from !== next.status,
    };
  });
}

export function RoundTimeline({ rounds, evidence, currentRound, commitmentId }: RoundTimelineProps) {
  if (rounds.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">No review rounds yet</p>
        <p>
          A round is recorded when validators reach a decision. Until then the commitment stays in
          its current state.
        </p>
      </div>
    );
  }

  const evidenceById = new Map(evidence.map((e) => [e.id, e]));

  return (
    <ol className="timeline">
      {rounds.map((round, index) => {
        const previous = index > 0 ? rounds[index - 1] : undefined;
        const diffs = diffRounds(previous, round);
        const changed = diffs.filter((d) => d.changed);
        const isCurrent = currentRound === round.round;
        const isLatest = index === rounds.length - 1;

        const previousIds = new Set(previous?.evidence_considered ?? []);
        const addedSinceLast = round.evidence_considered.filter((id) => !previousIds.has(id));

        return (
          <li
            key={round.round}
            className={`timeline__item${isCurrent ? " timeline__item--current" : ""}`}
          >
            <span className="timeline__num" aria-hidden="true">
              {round.round}
            </span>

            <div className="timeline__head">
              <h3 style={{ fontSize: "var(--t-16)" }}>
                Round {round.round}
                <span className="sr-only"> of {rounds.length}</span>
              </h3>
              <span className="tag">{TRIGGER_LABEL[round.trigger] ?? round.trigger}</span>
              <ResultChip status={round.overall_outcome} />
              {isLatest && <span className="tag">Latest</span>}
            </div>

            <p className="hint">
              {round.criteria_version > 1
                ? `Evaluated criteria version ${round.criteria_version} · `
                : ""}
              Evaluated {formatDate(round.evaluated_at.slice(0, 10))}
              {round.challenge_id > 0 ? ` · after challenge #${round.challenge_id}` : ""}
            </p>

            <p className="ledger__measure">{overallReasonCopy(round.overall_reason)}</p>

            {changed.length > 0 && (
              <div className="timeline__diff">
                <strong>What changed since round {previous?.round}:</strong>
                <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
                  {changed.map((d) => (
                    <li key={d.criterionId}>
                      Criterion {d.criterionId} changed from <ResultChip status={d.from} /> to{" "}
                      <ResultChip status={d.to} />
                      {addedSinceLast.length > 0 && " after new evidence was submitted."}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {addedSinceLast.length > 0 && (
              <div style={{ margin: "var(--space-3) 0" }}>
                <p className="ledger__sub">Evidence added since the last round</p>
                <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "var(--t-14)" }}>
                  {addedSinceLast.map((id) => {
                    const item = evidenceById.get(id);
                    return (
                      <li key={id}>
                        {item ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            {item.url}
                          </a>
                        ) : (
                          `Evidence #${id}`
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <details className="disclosure">
              <summary>Per-criterion results for round {round.round}</summary>
              <ul style={{ margin: "var(--space-2) 0 0", paddingLeft: "1.1rem" }}>
                {round.criteria.map((c) => (
                  <li
                    key={c.criterion_id}
                    style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}
                  >
                    <span>Criterion {c.criterion_id}</span>
                    <ResultChip status={c.status} />
                    <span className="hint" style={{ margin: 0 }}>
                      <code>{c.reason_code}</code>
                    </span>
                  </li>
                ))}
              </ul>
            </details>

            {isCurrent && (
              <p style={{ marginTop: "var(--space-2)" }}>
                <Link to={`/commitments/${commitmentId}`}>Back to the commitment page</Link>
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default RoundTimeline;