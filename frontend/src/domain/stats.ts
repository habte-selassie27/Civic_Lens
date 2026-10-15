/**
 * Platform stats aggregation for /stats.
 *
 * Pure: takes exactly what the reads returned and derives counts — no
 * estimating, no extrapolation beyond the window, no score. Inconclusive is
 * counted as a result of its own here, exactly as it is on every record;
 * an outcome that could not be read is counted as unread, never folded into
 * "inconclusive" or any negative story.
 */

import type {
  CommitmentStatus,
  CommitmentSummary,
  Outcome,
  RetrievalStatus,
} from "@/domain/types";

/** One window row: a summary plus what its outcome read returned. */
export interface OutcomeRead {
  summary: CommitmentSummary;
  outcome?: Outcome;
  /** True when the outcome read itself failed for this record. */
  unread: boolean;
}

export interface PlatformStats {
  commitments: number;
  byStatus: Array<{ status: CommitmentStatus; count: number }>;
  byMode: { live: number; sample: number };
  outcomes: {
    supported: number;
    contradicted: number;
    inconclusive: number;
    notYetReviewed: number;
  };
  /** Records whose outcome could not be read; excluded from outcome counts. */
  unreadOutcomes: number;
  rounds: number;
  evidence: number;
  /** Summed retrieval statuses across outcomes that reported them. */
  retrieval: Partial<Record<RetrievalStatus, number>>;
  /** How many reviewed outcomes contributed retrieval counts. */
  retrievalKnown: number;
}

export function aggregatePlatformStats(rows: readonly OutcomeRead[]): PlatformStats {
  const statusCounts = new Map<CommitmentStatus, number>();
  const retrieval: Partial<Record<RetrievalStatus, number>> = {};
  const outcomes = {
    supported: 0,
    contradicted: 0,
    inconclusive: 0,
    notYetReviewed: 0,
  };
  let unreadOutcomes = 0;
  let rounds = 0;
  let evidence = 0;
  let retrievalKnown = 0;
  const byMode = { live: 0, sample: 0 };

  for (const row of rows) {
    const s = row.summary;
    statusCounts.set(s.status, (statusCounts.get(s.status) ?? 0) + 1);
    rounds += s.round_count;
    evidence += s.evidence_count;
    byMode[s.data_mode] += 1;

    if (row.unread) {
      unreadOutcomes += 1;
      continue;
    }
    const outcome = row.outcome;
    if (!outcome || !outcome.has_outcome || !outcome.overall_outcome) {
      outcomes.notYetReviewed += 1;
      continue;
    }
    outcomes[outcome.overall_outcome] += 1;
    if (outcome.retrieval_counts) {
      retrievalKnown += 1;
      for (const [status, count] of Object.entries(outcome.retrieval_counts)) {
        if (typeof count !== "number") continue;
        const key = status as RetrievalStatus;
        retrieval[key] = (retrieval[key] ?? 0) + count;
      }
    }
  }

  return {
    commitments: rows.length,
    byStatus: Array.from(statusCounts.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status)),
    byMode,
    outcomes,
    unreadOutcomes,
    rounds,
    evidence,
    retrieval,
    retrievalKnown,
  };
}

/** Sum of every retrieval status that was NOT a successful read. */
export function unreadSourceCount(stats: PlatformStats): number {
  return Object.entries(stats.retrieval)
    .filter(([status]) => status !== "fetched")
    .reduce((total, [, count]) => total + (count ?? 0), 0);
}

/** Sum of successful reads across the window. */
export function readSourceCount(stats: PlatformStats): number {
  return stats.retrieval.fetched ?? 0;
}
