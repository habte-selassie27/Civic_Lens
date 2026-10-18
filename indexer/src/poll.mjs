/**
 * One polling pass: list commitments, read each record's detail and outcome,
 * upsert rows, stamp the meta table.
 *
 * `read(functionName, args)` is injected so tests drive the whole pass with
 * synthetic payloads and never touch the network. The live reader (genlayer-js
 * + studionet) is wired in index.mjs.
 *
 * Rules this pass keeps honest:
 * - A record whose outcome read fails keeps its previous row and is counted
 *   as failed; it is never written as "no outcome".
 * - A record whose detail read fails keeps its previous row; if it never had
 *   one, it simply never appears — unlisted beats invented.
 * - `last_indexed_at` is stamped when the pass finishes, whatever it managed,
 *   so the UI always shows when the index last spoke to the chain.
 */

import { allMeta, getMeta, insertRun, rowCount, setMeta, upsertRow, wipeCommitments } from "./db.mjs";
import { toRow } from "./map.mjs";

/** One contract page — the contract's MAX_PAGE_SIZE. */
const PAGE_SIZE = 20;
/** Hard stop so a malformed page loop can never run away. */
const MAX_RECORDS = 500;

export async function listAllSummaries(read) {
  const summaries = [];
  let beforeId = 0;
  for (let page = 0; page < MAX_RECORDS / PAGE_SIZE + 1; page += 1) {
    const rows = await read("get_commitments", [PAGE_SIZE, beforeId]);
    if (!Array.isArray(rows)) throw new Error("indexer: get_commitments did not return an array");
    summaries.push(...rows);
    if (rows.length < PAGE_SIZE) return summaries;
    beforeId = rows[rows.length - 1].id;
    if (summaries.length > MAX_RECORDS) {
      throw new Error(`indexer: registry exceeds ${MAX_RECORDS} records; raise MAX_RECORDS`);
    }
  }
  return summaries;
}

export async function runOnce({ db, read, address, chain = "studionet", now = () => new Date() }) {
  const startedAt = now().toISOString();

  // A different contract address is a different registry. Keeping rows from
  // the previous one would mix two chains' evidence under one search box.
  const knownContract = getMeta(db, "contract");
  let wiped = false;
  if (knownContract && knownContract !== address) {
    wipeCommitments(db);
    wiped = true;
  }
  setMeta(db, "contract", address);
  setMeta(db, "chain", chain);

  const summaries = await listAllSummaries(read);

  let refreshed = 0;
  let failed = 0;
  const errors = [];
  for (const summary of summaries) {
    try {
      const [commitment, outcome] = await Promise.all([
        read("get_commitment", [summary.id]),
        read("get_outcome", [summary.id]).catch(() => null),
      ]);
      if (outcome === null) {
        // Detail readable, outcome not. Write/refresh what is known; the row
        // is marked outcome_known = 0, which the stats call "unread" — never
        // as "no outcome".
        failed += 1;
        errors.push(`#${summary.id}: outcome read did not answer`);
      }
      upsertRow(db, toRow(summary, commitment, outcome, now().toISOString()));
      refreshed += 1;
    } catch (error) {
      failed += 1;
      errors.push(`#${summary.id}: ${error.message}`);
    }
  }

  const finishedAt = now().toISOString();
  const ok = failed === 0;
  const note = wiped
    ? "contract address changed — previous rows wiped"
    : errors.length
      ? errors.slice(0, 5).join("; ")
      : null;

  setMeta(db, "last_indexed_at", finishedAt);
  setMeta(db, "last_run_ok", ok ? "1" : "0");
  setMeta(db, "last_error", errors.length ? errors.slice(0, 5).join("; ") : "");
  setMeta(db, "record_count", String(rowCount(db)));
  insertRun(db, {
    started_at: startedAt,
    finished_at: finishedAt,
    listed: summaries.length,
    refreshed,
    failed,
    ok,
    note,
  });

  return { listed: summaries.length, refreshed, failed, ok, errors, wiped };
}

/** Meta as the HTTP layer reports it (strings from SQLite, typed here once). */
export function readIndexMeta(db) {
  const meta = allMeta(db);
  return {
    contract: meta.contract ?? null,
    chain: meta.chain ?? null,
    last_indexed_at: meta.last_indexed_at ?? null,
    last_run_ok: meta.last_run_ok === "1",
    last_error: meta.last_error || null,
    record_count: meta.record_count ? Number(meta.record_count) : 0,
  };
}
