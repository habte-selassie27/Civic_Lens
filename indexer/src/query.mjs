/**
 * Search, filter, and sort over the indexed rows — the whole-registry
 * equivalent of the browse page, executed in SQLite.
 *
 * The contract's list view only pages newest-first and cannot filter, so the
 * browse page was limited to its largest page (20 records). With these rows
 * indexed, search covers every record the indexer has seen; the response
 * carries the index's own freshness stamp so the UI can say when it was last
 * updated instead of implying a live view.
 */

export class BadParamsError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadParamsError";
  }
}

export const LIST_SORTS = {
  newest: "id DESC",
  ending_soonest: "period_end ASC, id DESC",
  most_reviewed: "round_count DESC, id DESC",
  most_sources: "evidence_count DESC, id DESC",
};

export const OUTCOME_FILTERS = ["supported", "contradicted", "inconclusive", "none"];

const NAME_RE = /^[a-z_]{1,40}$/;

function intParam(raw, fallback, min, max, name) {
  if (raw === null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new BadParamsError(`${name} must be an integer between ${min} and ${max}`);
  }
  return n;
}

export function parseListParams(searchParams) {
  const q = (searchParams.get("q") ?? "").trim().slice(0, 120);
  const status = (searchParams.get("status") ?? "").trim();
  const role = (searchParams.get("role") ?? "").trim();
  const mode = (searchParams.get("mode") ?? "").trim();
  const outcome = (searchParams.get("outcome") ?? "").trim();
  const sort = (searchParams.get("sort") ?? "newest").trim();

  if (status && !NAME_RE.test(status)) throw new BadParamsError("status has an unexpected shape");
  if (role && !NAME_RE.test(role)) throw new BadParamsError("role has an unexpected shape");
  if (mode && !NAME_RE.test(mode)) throw new BadParamsError("mode has an unexpected shape");
  if (outcome && !OUTCOME_FILTERS.includes(outcome)) {
    throw new BadParamsError(`outcome must be one of: ${OUTCOME_FILTERS.join(", ")}`);
  }
  if (!(sort in LIST_SORTS)) {
    throw new BadParamsError(`sort must be one of: ${Object.keys(LIST_SORTS).join(", ")}`);
  }

  return {
    q,
    status,
    role,
    mode,
    outcome,
    sort,
    limit: intParam(searchParams.get("limit"), 20, 1, 50, "limit"),
    offset: intParam(searchParams.get("offset"), 0, 0, 100000, "offset"),
  };
}

/** Escape LIKE wildcards so a query of "%" searches for a percent sign. */
function escapeLike(text) {
  return text.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function buildWhere(params) {
  const where = [];
  const args = [];
  if (params.q) {
    const needle = `%${escapeLike(params.q.toLowerCase())}%`;
    where.push(
      "(lower(subject) LIKE ? ESCAPE '\\' OR lower(commitment_text) LIKE ? ESCAPE '\\' OR lower(criteria_json) LIKE ? ESCAPE '\\')",
    );
    args.push(needle, needle, needle);
  }
  if (params.status) {
    where.push("status = ?");
    args.push(params.status);
  }
  if (params.mode) {
    where.push("data_mode = ?");
    args.push(params.mode);
  }
  if (params.role) {
    where.push("registrant_role = ?");
    args.push(params.role);
  }
  if (params.outcome === "none") {
    // No recorded outcome: never reviewed, or the outcome read has not
    // answered yet. Both are "none" for filtering — neither is a negative
    // finding.
    where.push("(has_outcome IS NULL OR has_outcome = 0)");
  } else if (params.outcome) {
    where.push("has_outcome = 1 AND outcome_overall = ?");
    args.push(params.outcome);
  }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", args };
}

const ROW_SELECT = `
  SELECT id, subject, status, data_mode, registrant_role, version, superseded_by,
         round_count, evidence_count, period_start, period_end,
         criteria_total, criteria_required,
         CASE WHEN has_outcome = 1 THEN outcome_overall ELSE NULL END AS outcome_overall,
         outcome_round,
         indexed_at
  FROM commitments`;

export function listCommitments(db, params) {
  const { sql, args } = buildWhere(params);
  const rows = db
    .prepare(`${ROW_SELECT} ${sql} ORDER BY ${LIST_SORTS[params.sort]} LIMIT ? OFFSET ?`)
    .all(...args, params.limit, params.offset);
  const total = db.prepare(`SELECT COUNT(*) AS n FROM commitments ${sql}`).get(...args).n;
  return { rows, total };
}
