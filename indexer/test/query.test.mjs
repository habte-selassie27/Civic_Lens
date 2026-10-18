import { test } from "node:test";
import assert from "node:assert/strict";

import { openDb, upsertRow } from "../src/db.mjs";
import { BadParamsError, listCommitments, parseListParams } from "../src/query.mjs";
import { storedRow } from "./fixtures.mjs";

function seededDb() {
  const db = openDb(":memory:");
  upsertRow(
    db,
    storedRow(1, {
      subject: "City of Trimont",
      commitment_text: "Cut fleet emissions by half",
      criteria_json: JSON.stringify([{ id: 1, text: "Fleet emissions halve", required: true }]),
      round_count: 1,
      evidence_count: 2,
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "supported",
      period_end: "2026-06-30",
    }),
  );
  upsertRow(
    db,
    storedRow(2, {
      subject: "Harbor Authority",
      commitment_text: "Publish an annual dredging audit",
      criteria_json: JSON.stringify([{ id: 1, text: "Audit published", required: true }]),
      registrant_role: "self_declared_by_organization",
      data_mode: "sample",
      round_count: 3,
      evidence_count: 1,
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "contradicted",
      period_end: "2025-03-31",
      status: "outcome_accepted",
    }),
  );
  upsertRow(
    db,
    storedRow(3, {
      subject: "Sample School Board",
      commitment_text: "Report attendance data quarterly",
      round_count: 0,
      evidence_count: 0,
      outcome_known: 1,
      has_outcome: 0,
      period_end: "2027-01-31",
      status: "registered",
    }),
  );
  upsertRow(
    db,
    storedRow(4, {
      subject: "Sample Water Trust 100% clean",
      commitment_text: "Reduce leaks",
      outcome_known: 0,
      has_outcome: null,
      period_end: "2026-12-31",
      status: "review_pending",
    }),
  );
  return db;
}

const params = (query = "") => parseListParams(new URLSearchParams(query));

test("search matches subject, commitment text, and criterion text, case-insensitively", () => {
  const db = seededDb();
  assert.deepEqual(listCommitments(db, params("q=trimont")).rows.map((r) => r.id), [1]);
  assert.deepEqual(listCommitments(db, params("q=FLEET EMISSIONS")).rows.map((r) => r.id), [1]);
  assert.deepEqual(listCommitments(db, params("q=dredging")).rows.map((r) => r.id), [2]);
  // criterion text inside criteria_json
  assert.deepEqual(listCommitments(db, params("q=attendance")).rows.map((r) => r.id), [3]);
  assert.equal(listCommitments(db, params("q=zzz-nothing")).total, 0);
});

test("LIKE wildcards in user input are escaped, not treated as patterns", () => {
  const db = seededDb();
  // "100%" appears literally in record 4's subject only — searching the
  // literal "%" must find exactly that row, not every row.
  assert.deepEqual(listCommitments(db, params("q=100%")).rows.map((r) => r.id), [4]);
  assert.deepEqual(listCommitments(db, params("q=%")).rows.map((r) => r.id), [4]);
  // No subject contains a literal underscore, so "_" must match nothing.
  assert.equal(listCommitments(db, params("q=_")).total, 0);
});

test("filters narrow by status, role, mode, and outcome record", () => {
  const db = seededDb();
  assert.deepEqual(listCommitments(db, params("status=registered")).rows.map((r) => r.id), [3]);
  assert.deepEqual(
    listCommitments(db, params("role=self_declared_by_organization")).rows.map((r) => r.id),
    [2],
  );
  assert.deepEqual(listCommitments(db, params("mode=sample")).rows.map((r) => r.id), [2]);
  assert.deepEqual(listCommitments(db, params("outcome=supported")).rows.map((r) => r.id), [1]);
  assert.deepEqual(listCommitments(db, params("outcome=contradicted")).rows.map((r) => r.id), [2]);
});

test("outcome=none covers not-yet-reviewed and unread alike — never a negative story", () => {
  const db = seededDb();
  const rows = listCommitments(db, params("outcome=none")).rows;
  assert.deepEqual(rows.map((r) => r.id).sort((a, b) => a - b), [3, 4]);
  assert.equal(rows.find((r) => r.id === 4).outcome_overall, null);
});

test("sorts: newest, ending soonest, most reviewed, most sources", () => {
  const db = seededDb();
  assert.deepEqual(listCommitments(db, params("sort=newest")).rows.map((r) => r.id), [4, 3, 2, 1]);
  assert.deepEqual(
    listCommitments(db, params("sort=ending_soonest")).rows.map((r) => r.id),
    [2, 1, 4, 3],
  );
  assert.deepEqual(
    listCommitments(db, params("sort=most_reviewed")).rows.map((r) => r.id),
    [2, 1, 4, 3],
  );
  assert.deepEqual(
    listCommitments(db, params("sort=most_sources")).rows.map((r) => r.id),
    [1, 2, 4, 3],
  );
});

test("pagination reports the full filtered total", () => {
  const db = seededDb();
  const page = listCommitments(db, params("limit=2&offset=2&sort=newest"));
  assert.equal(page.total, 4);
  assert.deepEqual(page.rows.map((r) => r.id), [2, 1]);
});

test("rows carry the fields the browse table renders", () => {
  const db = seededDb();
  const row = listCommitments(db, params("q=trimont")).rows[0];
  assert.equal(row.subject, "City of Trimont");
  assert.equal(row.status, "evidence_open");
  assert.equal(row.data_mode, "live");
  assert.equal(row.registrant_role, "third_party_observer");
  assert.equal(row.round_count, 1);
  assert.equal(row.evidence_count, 2);
  assert.equal(row.outcome_overall, "supported");
  assert.equal(row.criteria_total, 1);
});

test("bad params are rejected loudly", () => {
  assert.throws(() => params("sort=whatever"), BadParamsError);
  assert.throws(() => params("outcome=bad"), BadParamsError);
  assert.throws(() => params("limit=0"), BadParamsError);
  assert.throws(() => params("limit=51"), BadParamsError);
  assert.throws(() => params("offset=-1"), BadParamsError);
  assert.throws(() => params("status=Not A Name"), BadParamsError);
});

test("defaults are bounded and sane", () => {
  const p = params("");
  assert.equal(p.limit, 20);
  assert.equal(p.offset, 0);
  assert.equal(p.sort, "newest");
  assert.equal(p.q, "");
});
