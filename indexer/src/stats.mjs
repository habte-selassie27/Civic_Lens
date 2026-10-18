/**
 * Platform stats over every indexed record.
 *
 * The /stats page could previously count only the latest 20 records (the
 * contract's largest page) and said so everywhere. These counts cover the
 * whole registry the indexer has seen; the response carries last_indexed_at so
 * the page can label the counting time rather than imply a live total.
 *
 * The shape mirrors the frontend's PlatformStats deliberately, so the page
 * renders the same panels from either source. Inconclusive is a count of its
 * own; records whose outcome read has not answered are "unread", never folded
 * into any outcome.
 */

export function computeStats(db) {
  const count = (sql, ...args) => db.prepare(sql).get(...args).n;

  const byStatus = db
    .prepare("SELECT status, COUNT(*) AS count FROM commitments GROUP BY status")
    .all()
    .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status));

  const modeRows = db
    .prepare("SELECT data_mode, COUNT(*) AS count FROM commitments GROUP BY data_mode")
    .all();
  const byMode = { live: 0, sample: 0 };
  for (const row of modeRows) {
    if (row.data_mode === "live" || row.data_mode === "sample") byMode[row.data_mode] = row.count;
  }

  const outcomeCount = (name) =>
    count("SELECT COUNT(*) AS n FROM commitments WHERE has_outcome = 1 AND outcome_overall = ?", name);

  const retrieval = {};
  let retrievalKnown = 0;
  const retrievalRows = db
    .prepare(
      "SELECT retrieval_counts_json FROM commitments WHERE has_outcome = 1 AND retrieval_counts_json IS NOT NULL",
    )
    .all();
  for (const row of retrievalRows) {
    let counts;
    try {
      counts = JSON.parse(row.retrieval_counts_json);
    } catch {
      // We wrote this JSON ourselves; unreadable means index corruption, and
      // guessing around it would put made-up numbers on the stats page.
      throw new Error("indexer: stored retrieval_counts_json is not valid JSON");
    }
    if (!counts || typeof counts !== "object") continue;
    retrievalKnown += 1;
    for (const [status, n] of Object.entries(counts)) {
      if (typeof n !== "number") continue;
      retrieval[status] = (retrieval[status] ?? 0) + n;
    }
  }

  return {
    commitments: count("SELECT COUNT(*) AS n FROM commitments"),
    byStatus,
    byMode,
    outcomes: {
      supported: outcomeCount("supported"),
      contradicted: outcomeCount("contradicted"),
      inconclusive: outcomeCount("inconclusive"),
      notYetReviewed: count(
        "SELECT COUNT(*) AS n FROM commitments WHERE outcome_known = 1 AND (has_outcome IS NULL OR has_outcome = 0)",
      ),
    },
    unreadOutcomes: count("SELECT COUNT(*) AS n FROM commitments WHERE outcome_known = 0"),
    rounds: count("SELECT COALESCE(SUM(round_count), 0) AS n FROM commitments"),
    evidence: count("SELECT COALESCE(SUM(evidence_count), 0) AS n FROM commitments"),
    retrieval,
    retrievalKnown,
  };
}
