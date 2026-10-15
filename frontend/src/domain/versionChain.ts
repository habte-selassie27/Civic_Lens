/**
 * Version-chain loading and criteria diffing for /commitments/:id/versions.
 *
 * Superseding never edits a record: it creates a NEW commitment that links to
 * the one it replaces (`supersedes`) and is linked back (`superseded_by`).
 * The chain is loaded by walking both directions from any member, bounded and
 * cycle-guarded, so a corrupted link cannot fan the page out or loop it.
 */

import type { Commitment, Criterion } from "@/domain/types";

/** Most versions a single chain view will fetch. */
export const MAX_CHAIN = 10;

export interface VersionChain {
  /** Oldest first (version ascending, then id). */
  chain: Commitment[];
  /** True when a link exists beyond the cap. */
  truncated: boolean;
}

export async function loadVersionChain(
  seedId: number,
  fetchCommitment: (id: number) => Promise<Commitment>,
  cap: number = MAX_CHAIN,
): Promise<VersionChain> {
  const seed = await fetchCommitment(seedId);
  const seen = new Set<number>([seed.id]);
  const chain: Commitment[] = [seed];
  let truncated = false;

  // Backwards: follow `supersedes` until the root.
  let cursor = seed;
  while (cursor.supersedes !== 0) {
    if (chain.length >= cap) {
      truncated = true;
      break;
    }
    const previousId = cursor.supersedes;
    if (seen.has(previousId)) break; // cycle guard
    const previous = await fetchCommitment(previousId);
    if (seen.has(previous.id)) break;
    seen.add(previous.id);
    chain.push(previous);
    cursor = previous;
  }

  // Forwards from the seed: follow `superseded_by` to the newest. (The
  // backward walk may already have collected nodes older than the seed; the
  // nodes ahead of the seed are the ones still missing.)
  cursor = seed;
  while (cursor.superseded_by !== 0) {
    if (chain.length >= cap) {
      truncated = true;
      break;
    }
    const nextId = cursor.superseded_by;
    if (seen.has(nextId)) break; // cycle guard
    const next = await fetchCommitment(nextId);
    if (seen.has(next.id)) break;
    seen.add(next.id);
    chain.push(next);
    cursor = next;
  }

  chain.sort((a, b) => a.version - b.version || a.id - b.id);
  return { chain, truncated };
}

// ---------------------------------------------------------------------------
// Criteria diff between two versions
// ---------------------------------------------------------------------------

export type CriterionChange = "added" | "removed" | "changed";

export interface CriterionDelta {
  criterionId: number;
  change: CriterionChange;
  /** Human phrases for the fields that differ (empty for added/removed). */
  fields: string[];
}

/** Human names for the criterion fields the UI shows. */
export function changedFields(a: Criterion, b: Criterion): string[] {
  const fields: string[] = [];
  if (a.text !== b.text) fields.push("wording");
  if (a.measure !== b.measure) fields.push("what counts as evidence");
  if (a.required !== b.required) fields.push("required flag");
  if (a.deadline !== b.deadline) fields.push("deadline");
  const aThreshold = [a.has_threshold, a.threshold_milli, a.operator, a.unit].join("\u0001");
  const bThreshold = [b.has_threshold, b.threshold_milli, b.operator, b.unit].join("\u0001");
  if (aThreshold !== bThreshold) fields.push("threshold");
  return fields;
}

export function diffCriteria(
  previous: readonly Criterion[],
  next: readonly Criterion[],
): CriterionDelta[] {
  const deltas: CriterionDelta[] = [];
  const prevById = new Map(previous.map((c) => [c.id, c]));
  const nextById = new Map(next.map((c) => [c.id, c]));

  for (const [id, before] of prevById) {
    const after = nextById.get(id);
    if (!after) {
      deltas.push({ criterionId: id, change: "removed", fields: [] });
      continue;
    }
    const fields = changedFields(before, after);
    if (fields.length > 0) {
      deltas.push({ criterionId: id, change: "changed", fields });
    }
  }
  for (const id of nextById.keys()) {
    if (!prevById.has(id)) {
      deltas.push({ criterionId: id, change: "added", fields: [] });
    }
  }

  return deltas.sort((a, b) => a.criterionId - b.criterionId);
}
