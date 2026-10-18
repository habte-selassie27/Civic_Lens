import { test } from "node:test";
import assert from "node:assert/strict";

import { toRow } from "../src/map.mjs";
import { commitmentPayload, outcomePayload, summaryPayload } from "./fixtures.mjs";

const INDEXED_AT = "2026-10-15T12:00:00.000Z";

test("toRow maps a full triple, criteria counts, and outcome JSON", () => {
  const row = toRow(summaryPayload(7), commitmentPayload(7), outcomePayload(7), INDEXED_AT);

  assert.equal(row.id, 7);
  assert.equal(row.subject, "Sample subject 7");
  assert.equal(row.commitment_text, "Sample commitment text for record 7");
  assert.equal(row.criteria_total, 2);
  assert.equal(row.criteria_required, 1);
  assert.equal(row.outcome_known, 1);
  assert.equal(row.has_outcome, 1);
  assert.equal(row.outcome_overall, "supported");
  assert.equal(row.outcome_round, 1);
  assert.deepEqual(JSON.parse(row.retrieval_counts_json), { fetched: 2, http_error: 1 });
  assert.deepEqual(JSON.parse(row.criteria_json).map((c) => c.id), [1, 2]);
  assert.equal(row.indexed_at, INDEXED_AT);
});

test("a missing outcome read is stored as unknown, never as no-outcome", () => {
  const row = toRow(summaryPayload(3), commitmentPayload(3), null, INDEXED_AT);
  assert.equal(row.outcome_known, 0);
  assert.equal(row.has_outcome, 0);
  assert.equal(row.outcome_overall, null);
});

test("has_outcome false (reviewed field, no round yet) stays outcome_known", () => {
  const row = toRow(
    summaryPayload(4),
    commitmentPayload(4),
    outcomePayload(4, { has_outcome: false, round: 0, overall_outcome: undefined, overall_reason: undefined }),
    INDEXED_AT,
  );
  assert.equal(row.outcome_known, 1);
  assert.equal(row.has_outcome, 0);
  assert.equal(row.outcome_overall, null);
});

test("id mismatch between summary and detail is rejected", () => {
  assert.throws(
    () => toRow(summaryPayload(1), commitmentPayload(2), null, INDEXED_AT),
    /id mismatch for #1/,
  );
});

test("a missing required field is rejected with its record id", () => {
  const summary = summaryPayload(9);
  delete summary.subject;
  assert.throws(() => toRow(summary, commitmentPayload(9), null, INDEXED_AT), /#9 subject/);
});

test("non-array criteria map to zero with no invention", () => {
  const row = toRow(
    summaryPayload(5),
    commitmentPayload(5, { criteria: undefined }),
    outcomePayload(5),
    INDEXED_AT,
  );
  assert.equal(row.criteria_total, 0);
  assert.equal(row.criteria_required, 0);
  assert.equal(row.criteria_json, "[]");
});
