import { test } from "node:test";
import assert from "node:assert/strict";

import { getMeta, openDb, upsertRow, rowCount, setMeta } from "../src/db.mjs";
import { listAllSummaries, readIndexMeta, runOnce } from "../src/poll.mjs";
import { commitmentPayload, nowFn, outcomePayload, storedRow, summaryPayload } from "./fixtures.mjs";

/** A fake chain that pages like the contract (newest-first, 20 per page). */
function fakeChain({ summaries, failOutcomeFor = new Set(), failDetailFor = new Set() }) {
  const sorted = [...summaries].sort((a, b) => b.id - a.id);
  return async (functionName, args) => {
    if (functionName === "get_commitments") {
      const [pageSize, beforeId] = args;
      const start = beforeId === 0 ? 0 : sorted.findIndex((s) => s.id === beforeId) + 1;
      return sorted.slice(start, start + pageSize);
    }
    const id = args[0];
    if (functionName === "get_commitment") {
      if (failDetailFor.has(id)) throw new Error(`detail read failed for #${id}`);
      return commitmentPayload(id);
    }
    if (functionName === "get_outcome") {
      if (failOutcomeFor.has(id)) throw new Error(`outcome read failed for #${id}`);
      return outcomePayload(id, { overall_outcome: id === 2 ? "contradicted" : "supported" });
    }
    throw new Error(`unexpected read: ${functionName}`);
  };
}

test("a full pass lists, reads, upserts, and stamps the meta table", async () => {
  const db = openDb(":memory:");
  const read = fakeChain({ summaries: [summaryPayload(1), summaryPayload(2)] });

  const result = await runOnce({ db, read, address: "0xabc0000000000000000000000000000000000000", now: nowFn });

  assert.deepEqual(result, {
    listed: 2,
    refreshed: 2,
    failed: 0,
    ok: true,
    errors: [],
    wiped: false,
  });
  assert.equal(rowCount(db), 2);
  const meta = readIndexMeta(db);
  assert.equal(meta.last_indexed_at, "2026-10-15T12:00:00.000Z");
  assert.equal(meta.last_run_ok, true);
  assert.equal(meta.record_count, 2);
  assert.equal(meta.contract, "0xabc0000000000000000000000000000000000000");
  // both outcomes stored with their own values
  const outcomes = db
    .prepare("SELECT id, outcome_overall FROM commitments ORDER BY id")
    .all()
    .map((row) => ({ ...row }));
  assert.deepEqual(outcomes, [
    { id: 1, outcome_overall: "supported" },
    { id: 2, outcome_overall: "contradicted" },
  ]);
});

test("an unreadable outcome keeps the row, marks it unknown, and is reported", async () => {
  const db = openDb(":memory:");
  const read = fakeChain({ summaries: [summaryPayload(1), summaryPayload(2)], failOutcomeFor: new Set([2]) });

  const result = await runOnce({ db, read, address: "0xabc0000000000000000000000000000000000000", now: nowFn });

  assert.equal(result.refreshed, 2);
  assert.equal(result.failed, 1);
  assert.equal(result.ok, false);
  const row2 = {
    ...db.prepare("SELECT outcome_known, has_outcome, outcome_overall FROM commitments WHERE id = 2").get(),
  };
  assert.deepEqual(row2, { outcome_known: 0, has_outcome: 0, outcome_overall: null });
  assert.match(getMeta(db, "last_error"), /#2: outcome read did not answer/);
});

test("an unreadable detail keeps the previous row untouched", async () => {
  const db = openDb(":memory:");
  // Previous pass stored row 2 with an outcome.
  upsertRow(db, storedRow(2, { outcome_known: 1, has_outcome: 1, outcome_overall: "supported", subject: "Old subject" }));
  const read = fakeChain({ summaries: [summaryPayload(1), summaryPayload(2)], failDetailFor: new Set([2]) });

  const result = await runOnce({ db, read, address: "0xabc0000000000000000000000000000000000000", now: nowFn });

  assert.equal(result.failed, 1);
  const row2 = {
    ...db.prepare("SELECT subject, outcome_overall FROM commitments WHERE id = 2").get(),
  };
  assert.deepEqual(row2, { subject: "Old subject", outcome_overall: "supported" });
});

test("paging: 21 records are listed across two contract pages", async () => {
  const db = openDb(":memory:");
  const summaries = Array.from({ length: 21 }, (_, i) => summaryPayload(i + 1));
  const read = fakeChain({ summaries });

  const result = await runOnce({ db, read, address: "0xabc0000000000000000000000000000000000000", now: nowFn });

  assert.equal(result.listed, 21);
  assert.equal(rowCount(db), 21);
});

test("changing the contract address wipes the previous registry first", async () => {
  const db = openDb(":memory:");
  setMeta(db, "contract", "0x1110000000000000000000000000000000000000");
  upsertRow(db, storedRow(99, { subject: "From the old registry" }));

  const read = fakeChain({ summaries: [summaryPayload(1)] });
  const result = await runOnce({ db, read, address: "0x2220000000000000000000000000000000000000", now: nowFn });

  assert.equal(result.wiped, true);
  assert.equal(rowCount(db), 1);
  assert.equal(db.prepare("SELECT subject FROM commitments WHERE id = 1").get().subject, "Sample subject 1");
});

test("a non-array list response fails the pass loudly", async () => {
  const db = openDb(":memory:");
  const read = async () => ({ nope: true });
  await assert.rejects(
    () => runOnce({ db, read, address: "0xabc0000000000000000000000000000000000000", now: nowFn }),
    /did not return an array/,
  );
});

test("listAllSummaries pages until a short page, then stops", async () => {
  const calls = [];
  const page1 = Array.from({ length: 20 }, (_, i) => summaryPayload(20 - i)); // ids 20..1
  const read = async (functionName, args) => {
    calls.push(args);
    return args[1] === 0 ? page1 : [];
  };
  const summaries = await listAllSummaries(read);
  assert.equal(summaries.length, 20);
  assert.deepEqual(calls, [
    [20, 0],
    [20, 1],
  ]);
});
