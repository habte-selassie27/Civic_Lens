import { test } from "node:test";
import assert from "node:assert/strict";

import { openDb, setMeta, upsertRow } from "../src/db.mjs";
import { createApiServer } from "../src/server.mjs";
import { storedRow } from "./fixtures.mjs";

async function startApi(db) {
  const server = createApiServer({ db });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, base };
}

function seededDb() {
  const db = openDb(":memory:");
  upsertRow(
    db,
    storedRow(1, {
      subject: "City of Trimont",
      outcome_known: 1,
      has_outcome: 1,
      outcome_overall: "supported",
      retrieval_counts_json: JSON.stringify({ fetched: 2, http_error: 1 }),
      round_count: 1,
      evidence_count: 2,
    }),
  );
  upsertRow(
    db,
    storedRow(2, {
      subject: "Harbor Authority",
      status: "evidence_open",
      outcome_known: 1,
      has_outcome: 0,
    }),
  );
  setMeta(db, "contract", "0xabc0000000000000000000000000000000000000");
  setMeta(db, "chain", "studionet");
  setMeta(db, "last_indexed_at", "2026-10-15T12:00:00.000Z");
  setMeta(db, "last_run_ok", "1");
  setMeta(db, "record_count", "2");
  return db;
}

test("health and meta report the index state", async (t) => {
  const db = seededDb();
  const { server, base } = await startApi(db);
  t.after(() => server.close());

  const health = await (await fetch(`${base}/api/health`)).json();
  assert.equal(health.ok, true);
  assert.equal(health.last_indexed_at, "2026-10-15T12:00:00.000Z");

  const meta = await (await fetch(`${base}/api/meta`)).json();
  assert.equal(meta.contract, "0xabc0000000000000000000000000000000000000");
  assert.equal(meta.chain, "studionet");
  assert.equal(meta.last_run_ok, true);
  assert.equal(meta.record_count, 2);
  assert.equal(meta.last_error, null);
});

test("commitments endpoint filters and pages with the index stamp", async (t) => {
  const db = seededDb();
  const { server, base } = await startApi(db);
  t.after(() => server.close());

  const all = await (await fetch(`${base}/api/commitments`)).json();
  assert.equal(all.total, 2);
  assert.equal(all.indexed_at, "2026-10-15T12:00:00.000Z");
  assert.equal(all.rows.length, 2);
  assert.ok("outcome_overall" in all.rows[0]);

  const filtered = await (await fetch(`${base}/api/commitments?q=trimont&outcome=supported`)).json();
  assert.equal(filtered.total, 1);
  assert.equal(filtered.rows[0].subject, "City of Trimont");

  const none = await (await fetch(`${base}/api/commitments?outcome=none`)).json();
  assert.equal(none.total, 1);
  assert.equal(none.rows[0].id, 2);
});

test("stats endpoint mirrors the PlatformStats shape", async (t) => {
  const db = seededDb();
  const { server, base } = await startApi(db);
  t.after(() => server.close());

  const body = await (await fetch(`${base}/api/stats`)).json();
  assert.equal(body.stats.commitments, 2);
  assert.equal(body.stats.outcomes.supported, 1);
  assert.equal(body.stats.outcomes.notYetReviewed, 1);
  assert.equal(body.stats.outcomes.inconclusive, 0);
  assert.equal(body.stats.retrieval.fetched, 2);
  assert.equal(body.indexed_at, "2026-10-15T12:00:00.000Z");
  assert.equal(body.record_count, 2);
});

test("bad parameters are a 400, unknown paths a 404, writes a 405", async (t) => {
  const db = seededDb();
  const { server, base } = await startApi(db);
  t.after(() => server.close());

  const bad = await fetch(`${base}/api/commitments?sort=whatever`);
  assert.equal(bad.status, 400);
  assert.match((await bad.json()).error, /sort must be one of/);

  const missing = await fetch(`${base}/api/nope`);
  assert.equal(missing.status, 404);

  const post = await fetch(`${base}/api/commitments`, { method: "POST" });
  assert.equal(post.status, 405);
});

test("responses carry CORS headers for the browser app", async (t) => {
  const db = seededDb();
  const { server, base } = await startApi(db);
  t.after(() => server.close());

  const res = await fetch(`${base}/api/meta`);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("a custom allow-origin is honored", async (t) => {
  const db = seededDb();
  const server = createApiServer({ db, allowOrigin: "http://localhost:5173" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
});
