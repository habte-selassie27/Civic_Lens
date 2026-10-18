/**
 * SQLite storage for the read indexer.
 *
 * One flat table per commitment, holding exactly what the contract's read
 * views returned — nothing derived that the contract did not say. The outcome
 * counts and retrieval statuses are kept as JSON strings so the stats endpoint
 * can show the same numbers the chain reports.
 *
 * Uses node:sqlite (Node >= 22.5), no dependencies. The database file is a
 * local cache of public on-chain data: deleting it loses nothing but the time
 * to re-poll.
 */

import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS commitments (
  id                    INTEGER PRIMARY KEY,
  subject               TEXT NOT NULL,
  status                TEXT NOT NULL,
  data_mode             TEXT NOT NULL,
  registrant_role       TEXT NOT NULL,
  version               INTEGER NOT NULL,
  superseded_by         INTEGER NOT NULL,
  round_count           INTEGER NOT NULL,
  evidence_count        INTEGER NOT NULL,
  period_start          TEXT NOT NULL,
  period_end            TEXT NOT NULL,
  registrant            TEXT,
  subject_kind          TEXT,
  commitment_text       TEXT NOT NULL,
  source_statement_ref  TEXT,
  source_guidance       TEXT,
  timezone              TEXT,
  criteria_json         TEXT NOT NULL,
  criteria_total        INTEGER NOT NULL,
  criteria_required     INTEGER NOT NULL,
  outcome_known         INTEGER NOT NULL DEFAULT 0,
  has_outcome           INTEGER,
  outcome_round         INTEGER,
  outcome_overall       TEXT,
  outcome_reason        TEXT,
  outcome_counts_json   TEXT,
  retrieval_counts_json TEXT,
  evaluated_at          TEXT,
  indexed_at            TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS index_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at  TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  listed      INTEGER NOT NULL,
  refreshed   INTEGER NOT NULL,
  failed      INTEGER NOT NULL,
  ok          INTEGER NOT NULL,
  note        TEXT
);
`;

/** Every column of a commitment row, in insert order. */
export const ROW_COLUMNS = [
  "id",
  "subject",
  "status",
  "data_mode",
  "registrant_role",
  "version",
  "superseded_by",
  "round_count",
  "evidence_count",
  "period_start",
  "period_end",
  "registrant",
  "subject_kind",
  "commitment_text",
  "source_statement_ref",
  "source_guidance",
  "timezone",
  "criteria_json",
  "criteria_total",
  "criteria_required",
  "outcome_known",
  "has_outcome",
  "outcome_round",
  "outcome_overall",
  "outcome_reason",
  "outcome_counts_json",
  "retrieval_counts_json",
  "evaluated_at",
  "indexed_at",
];

export function openDb(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  return db;
}

export function upsertRow(db, row) {
  const cols = ROW_COLUMNS.join(", ");
  const placeholders = ROW_COLUMNS.map(() => "?").join(", ");
  const updates = ROW_COLUMNS.filter((c) => c !== "id")
    .map((c) => `${c} = excluded.${c}`)
    .join(", ");
  db.prepare(
    `INSERT INTO commitments (${cols}) VALUES (${placeholders})
     ON CONFLICT(id) DO UPDATE SET ${updates}`,
  ).run(...ROW_COLUMNS.map((c) => row[c] ?? null));
}

export function rowCount(db) {
  return db.prepare("SELECT COUNT(*) AS n FROM commitments").get().n;
}

/** Drop every indexed row — used when the indexed contract address changes. */
export function wipeCommitments(db) {
  db.exec("DELETE FROM commitments");
}

export function setMeta(db, key, value) {
  db.prepare(
    "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, String(value));
}

export function getMeta(db, key) {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  return row ? row.value : null;
}

export function allMeta(db) {
  const out = {};
  for (const row of db.prepare("SELECT key, value FROM meta").all()) out[row.key] = row.value;
  return out;
}

export function insertRun(db, run) {
  db.prepare(
    `INSERT INTO index_runs (started_at, finished_at, listed, refreshed, failed, ok, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    run.started_at,
    run.finished_at,
    run.listed,
    run.refreshed,
    run.failed,
    run.ok ? 1 : 0,
    run.note ?? null,
  );
}
