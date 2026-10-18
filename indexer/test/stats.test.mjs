import { test } from "node:test";
import assert from "node:assert/strict";

import { openDb, upsertRow } from "../src/db.mjs";
import { computeStats } from "../src/stats.mjs";
import { storedRow } from "./fixtures.mjs";

test("stats aggregate the whole registry the way the page labels it", () => {
  const db = openDb(":memory:");
  upsertRow(
    db,
    storedRow(1, {
      status: "outcome_accepted",
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "supported",
      round_count: 1,
      evidence_count: 2,
      retrieval_counts_json: JSON.stringify({ fetched: 2, http_error: 1 }),
    }),
  );
  upsertRow(
    db,
    storedRow(2, {
      status: "outcome_accepted",
      data_mode: "sample",
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "supported",
      round_count: 2,
      evidence_count: 3,
      retrieval_counts_json: JSON.stringify({ fetched: 1, unsupported_format: 1 }),
    }),
  );
  upsertRow(
    db,
    storedRow(3, {
      status: "outcome_accepted",
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "contradicted",
      round_count: 1,
      evidence_count: 1,
    }),
  );
  upsertRow(
    db,
    storedRow(4, {
      status: "outcome_accepted",
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "inconclusive",
      round_count: 1,
      evidence_count: 0,
    }),
  );
  upsertRow(
    db,
    storedRow(5, { status: "evidence_open", outcome_known: 1, has_outcome: 0 }),
  );
  upsertRow(db, storedRow(6, { status: "review_pending", outcome_known: 0, has_outcome: null }));

  const stats = computeStats(db);
  assert.equal(stats.commitments, 6);
  assert.equal(stats.outcomes.supported, 2);
  assert.equal(stats.outcomes.contradicted, 1);
  assert.equal(stats.outcomes.inconclusive, 1);
  assert.equal(stats.outcomes.notYetReviewed, 1);
  assert.equal(stats.unreadOutcomes, 1);
  assert.equal(stats.rounds, 5);
  assert.equal(stats.evidence, 6);
  assert.deepEqual(stats.byMode, { live: 5, sample: 1 });
  assert.deepEqual(stats.retrieval, { fetched: 3, http_error: 1, unsupported_format: 1 });
  assert.equal(stats.retrievalKnown, 2);
  // byStatus sorted by count desc, then name
  assert.equal(stats.byStatus[0].status, "outcome_accepted");
  assert.equal(stats.byStatus[0].count, 4);
});

test("an empty registry yields zeroed counts, not an error", () => {
  const db = openDb(":memory:");
  const stats = computeStats(db);
  assert.equal(stats.commitments, 0);
  assert.deepEqual(stats.outcomes, {
    supported: 0,
    contradicted: 0,
    inconclusive: 0,
    notYetReviewed: 0,
  });
  assert.equal(stats.retrievalKnown, 0);
});

test("corrupted stored retrieval JSON fails loudly instead of inventing numbers", () => {
  const db = openDb(":memory:");
  upsertRow(
    db,
    storedRow(1, {
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "supported",
      retrieval_counts_json: "{not json",
    }),
  );
  assert.throws(() => computeStats(db), /not valid JSON/);
});
