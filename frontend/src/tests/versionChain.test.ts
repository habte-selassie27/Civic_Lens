/**
 * Version-chain walking and criteria diffing (domain/versionChain).
 *
 * Superseding links records in both directions; the walk must reach the whole
 * chain from any member, never loop on a corrupted link, and never fan out
 * past its cap. The diff names exactly which criterion fields changed.
 */

import { describe, expect, it } from "vitest";
import { diffCriteria, loadVersionChain, MAX_CHAIN } from "@/domain/versionChain";
import type { Commitment, Criterion } from "@/domain/types";

function criterion(over: Partial<Criterion> = {}): Criterion {
  return {
    id: 1,
    text: "Publishes an annual emissions report",
    measure: "An official report is filed",
    required: true,
    has_threshold: false,
    threshold_milli: 0,
    operator: "",
    unit: "",
    deadline: "",
    ...over,
  };
}

function commitment(id: number, over: Partial<Commitment> = {}): Commitment {
  return {
    id,
    registrant: "0x0000000000000000000000000000000000000001",
    registrant_role: "organization",
    subject: `Subject ${id}`,
    subject_kind: "organization",
    source_statement_ref: "https://example.org/statement",
    commitment_text: "We will publish reports.",
    criteria: [criterion()],
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    timezone: "UTC",
    source_guidance: "",
    data_mode: "live",
    status: "outcome_accepted",
    version: id,
    supersedes: 0,
    superseded_by: 0,
    round_count: 1,
    challenge_count: 0,
    evidence_count: 1,
    current_round: 1,
    ...over,
  };
}

const CHAIN = new Map<number, Commitment>([
  [1, commitment(1, { superseded_by: 2 })],
  [2, commitment(2, { supersedes: 1, superseded_by: 3 })],
  [3, commitment(3, { supersedes: 2 })],
]);

const fetchFromChain = async (id: number): Promise<Commitment> => {
  const found = CHAIN.get(id);
  if (!found) throw new Error(`no commitment ${id}`);
  return found;
};

describe("loadVersionChain", () => {
  it("walks both directions from a middle record, oldest first", async () => {
    const { chain, truncated } = await loadVersionChain(2, fetchFromChain);
    expect(chain.map((c) => c.id)).toEqual([1, 2, 3]);
    expect(truncated).toBe(false);
  });

  it("reaches the same chain from either end", async () => {
    const fromNewest = await loadVersionChain(3, fetchFromChain);
    const fromOldest = await loadVersionChain(1, fetchFromChain);
    expect(fromNewest.chain.map((c) => c.id)).toEqual([1, 2, 3]);
    expect(fromOldest.chain.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it("does not loop when two records point at each other", async () => {
    const corrupt = new Map<number, Commitment>([
      [1, commitment(1, { superseded_by: 2 })],
      [2, commitment(2, { supersedes: 1, superseded_by: 1 })],
    ]);
    const { chain } = await loadVersionChain(1, async (id) => {
      const found = corrupt.get(id);
      if (!found) throw new Error(`no commitment ${id}`);
      return found;
    });
    expect(chain.map((c) => c.id)).toEqual([1, 2]);
  });

  it("caps the walk and reports truncation", async () => {
    const long = new Map<number, Commitment>();
    for (let id = 1; id <= 12; id += 1) {
      long.set(
        id,
        commitment(id, {
          supersedes: id === 1 ? 0 : id - 1,
          superseded_by: id === 12 ? 0 : id + 1,
        }),
      );
    }
    let fetches = 0;
    const { chain, truncated } = await loadVersionChain(1, async (id) => {
      fetches += 1;
      const found = long.get(id);
      if (!found) throw new Error(`no commitment ${id}`);
      return found;
    });

    expect(chain).toHaveLength(MAX_CHAIN);
    expect(truncated).toBe(true);
    expect(fetches).toBe(MAX_CHAIN);
  });
});

describe("diffCriteria", () => {
  it("names a threshold change and ignores unchanged fields", () => {
    const before = criterion();
    const after = criterion({ has_threshold: true, threshold_milli: 100_000, operator: "gte", unit: "co2e_tonnes" });
    expect(diffCriteria([before], [after])).toEqual([
      { criterionId: 1, change: "changed", fields: ["threshold"] },
    ]);
  });

  it("names wording and measure changes separately", () => {
    const before = criterion();
    const after = criterion({ text: "Different wording", measure: "Different measure" });
    expect(diffCriteria([before], [after])).toEqual([
      { criterionId: 1, change: "changed", fields: ["wording", "what counts as evidence"] },
    ]);
  });

  it("reports added and removed criteria", () => {
    const first = criterion({ id: 1 });
    const second = criterion({ id: 2 });
    expect(diffCriteria([first], [first, second])).toEqual([
      { criterionId: 2, change: "added", fields: [] },
    ]);
    expect(diffCriteria([first, second], [first])).toEqual([
      { criterionId: 2, change: "removed", fields: [] },
    ]);
  });

  it("returns nothing when criteria are identical", () => {
    expect(diffCriteria([criterion()], [criterion()])).toEqual([]);
  });
});
