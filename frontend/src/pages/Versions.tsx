/**
 * Version history: `/commitments/:id/versions`.
 *
 * Superseding never edits a record: it creates a NEW commitment that links to
 * the one it replaces. This page walks those links in both directions
 * (bounded, cycle-guarded — see domain/versionChain) and shows each version
 * beside what changed in its criteria, so immutability is legible instead of
 * a claim in a document.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { reads } from "@/services";
import { diffCriteria, loadVersionChain, MAX_CHAIN } from "@/domain/versionChain";
import { mapLimit } from "@/domain/scan";
import { STATUS_LABEL } from "@/domain/copy";
import { formatDate, formatPeriod, thresholdPhrase } from "@/domain/format";
import type { Commitment, Outcome } from "@/domain/types";
import { DataModeBadge } from "@/components/DataModeBadge";
import { ResultChip } from "@/components/ResultChip";
import { ErrorView, LoadingRegion, SampleBanner } from "@/components/Chrome";

interface VersionNode {
  commitment: Commitment;
  outcome: Outcome | null;
}

interface VersionsState {
  loading: boolean;
  error: unknown;
  nodes: VersionNode[] | null;
  truncated: boolean;
}

export function Versions() {
  const { id } = useParams();
  const commitmentId = Number(id);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<VersionsState>({
    loading: true,
    error: null,
    nodes: null,
    truncated: false,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, nodes: null, truncated: false });

    (async () => {
      try {
        if (!Number.isInteger(commitmentId) || commitmentId < 1) {
          throw new Error("EXPECTED: version history needs a commitment number");
        }
        const { chain, truncated } = await loadVersionChain(commitmentId, (target) =>
          reads.getCommitment(target),
        );
        if (cancelled) return;

        const outcomes = await mapLimit(chain, 4, async (commitment) => {
          try {
            return await reads.getOutcome(commitment.id);
          } catch {
            return null;
          }
        });
        if (cancelled) return;

        const nodes: VersionNode[] = chain.map((commitment, index) => {
          const result = outcomes[index];
          return {
            commitment,
            outcome: result.status === "fulfilled" ? result.value : null,
          };
        });
        setState({ loading: false, error: null, nodes, truncated });
      } catch (error) {
        if (!cancelled) setState({ loading: false, error, nodes: null, truncated: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [commitmentId, attempt]);

  const backLink = (
    <p className="hint">
      <Link to={`/commitments/${commitmentId}`}>← Back to the commitment</Link>
    </p>
  );

  if (state.loading) {
    return (
      <div className="stack-lg">
        <div>
          {backLink}
          <h1>Version history</h1>
        </div>
        <LoadingRegion label="Loading the version chain" />
      </div>
    );
  }

  if (state.error || !state.nodes) {
    return (
      <div className="stack-lg">
        <div>
          {backLink}
          <h1>Version history</h1>
        </div>
        <ErrorView
          error={state.error}
          onRetry={() => setAttempt((a) => a + 1)}
          title="The version history could not be loaded."
        />
      </div>
    );
  }

  const { nodes, truncated } = state;

  return (
    <div className="stack-lg">
      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      <div>
        {backLink}
        <h1>Version history</h1>
        <p className="hint">
          Superseding never edits a record. Each version is a separate commitment that links
          to the one it replaced, and the criteria diff under a version shows what changed
          from the version before it.
        </p>
      </div>

      {nodes.length === 1 && (
        <p className="hint">
          This record has no earlier or later version. It is the only entry in its chain.
        </p>
      )}

      {truncated && (
        <p className="hint">
          The chain continues beyond the first {MAX_CHAIN} versions this page loads. Open
          the oldest or newest version directly to keep walking it.
        </p>
      )}

      {nodes.map((node, index) => {
        const previous = index > 0 ? nodes[index - 1].commitment : null;
        const deltas = previous ? diffCriteria(previous.criteria, node.commitment.criteria) : [];
        const isSeed = node.commitment.id === commitmentId;
        const outcome = node.outcome;
        const outcomeStatus =
          outcome?.has_outcome && outcome.overall_outcome ? outcome.overall_outcome : "pending";
        const reviewedOn =
          outcome?.has_outcome && outcome.evaluated_at
            ? `Last reviewed ${formatDate(outcome.evaluated_at.slice(0, 10))}`
            : "Not yet reviewed";

        return (
          <section
            className="panel"
            key={node.commitment.id}
            aria-labelledby={`version-${node.commitment.id}`}
          >
            <div className="panel__head">
              <h2 id={`version-${node.commitment.id}`}>
                Version {node.commitment.version}
                <span className="sr-only"> — commitment #{node.commitment.id}</span>
              </h2>
              <span className="tag">{STATUS_LABEL[node.commitment.status] ?? node.commitment.status}</span>
              {isSeed && <span className="tag">This record</span>}
              <DataModeBadge
                mode={node.commitment.data_mode}
                override={reads.isSample ? "sample" : node.commitment.data_mode}
              />
              <ResultChip status={outcomeStatus} />
            </div>

            <div className="panel__body">
              <p className="ledger__measure" style={{ marginTop: 0 }}>
                {node.commitment.subject}
              </p>
              <p className="hint">
                {formatPeriod(
                  node.commitment.period_start,
                  node.commitment.period_end,
                  node.commitment.timezone,
                )}{" "}
                · {node.commitment.criteria.length} criteria · {reviewedOn}
              </p>
              <p>
                <Link to={`/commitments/${node.commitment.id}`}>
                  Open commitment #{node.commitment.id}
                </Link>
              </p>

              {previous && (
                <div className="timeline__diff">
                  <strong>Changed from version {previous.version}:</strong>
                  {deltas.length === 0 ? (
                    <p className="hint" style={{ margin: "var(--space-1) 0 0" }}>
                      No criteria changed in this version.
                    </p>
                  ) : (
                    <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
                      {deltas.map((delta) => (
                        <li key={delta.criterionId}>
                          {delta.change === "added" && `Criterion ${delta.criterionId} added.`}
                          {delta.change === "removed" && `Criterion ${delta.criterionId} removed.`}
                          {delta.change === "changed" &&
                            `Criterion ${delta.criterionId} changed: ${delta.fields.join(", ")}.`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <details className="disclosure">
                <summary>Criteria in version {node.commitment.version}</summary>
                <ul style={{ margin: "var(--space-2) 0 0", paddingLeft: "1.1rem" }}>
                  {node.commitment.criteria.map((criterion) => (
                    <li key={criterion.id} style={{ marginBottom: "var(--space-2)" }}>
                      <p style={{ margin: 0 }}>
                        Criterion {criterion.id}: {criterion.text}
                      </p>
                      <p className="hint" style={{ margin: "var(--space-1) 0 0" }}>
                        {criterion.measure}
                        {thresholdPhrase(criterion) && ` · Threshold: ${thresholdPhrase(criterion)}`}
                      </p>
                      <p className="hint" style={{ margin: "var(--space-1) 0 0" }}>
                        {criterion.required
                          ? "Required: decides the overall outcome."
                          : "Recorded; does not decide the overall outcome."}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default Versions;
