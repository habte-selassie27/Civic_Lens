/**
 * Read-only HTTP API over the indexed rows.
 *
 * GET only, no auth: every row mirrors public on-chain data that anyone can
 * already read from the contract. CORS defaults to `*` because the data is
 * public and the API is read-only; bind the server to a trusted interface if
 * that is not wanted.
 *
 *   GET /api/health               liveness
 *   GET /api/meta                 contract, last_indexed_at, last run status
 *   GET /api/commitments          ?q= &status= &role= &mode= &outcome= &sort= &limit= &offset=
 *   GET /api/stats                whole-registry counts (PlatformStats shape)
 *
 * Every response carries `indexed_at` so a caller can label freshness instead
 * of presenting the counts as live.
 */

import { createServer } from "node:http";
import { BadParamsError, listCommitments, parseListParams } from "./query.mjs";
import { computeStats } from "./stats.mjs";
import { readIndexMeta } from "./poll.mjs";

function sendJson(res, status, body, allowOrigin) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  });
  res.end(payload);
}

export function createApiServer({ db, allowOrigin = "*" }) {
  return createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": allowOrigin,
        "access-control-allow-methods": "GET, OPTIONS",
        "access-control-allow-headers": "content-type",
      });
      res.end();
      return;
    }
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "method not allowed" }, allowOrigin);
      return;
    }

    try {
      switch (url.pathname) {
        case "/api/health": {
          const meta = readIndexMeta(db);
          sendJson(
            res,
            200,
            { ok: true, contract: meta.contract, last_indexed_at: meta.last_indexed_at },
            allowOrigin,
          );
          return;
        }
        case "/api/meta": {
          sendJson(res, 200, readIndexMeta(db), allowOrigin);
          return;
        }
        case "/api/commitments": {
          const params = parseListParams(url.searchParams);
          const { rows, total } = listCommitments(db, params);
          const meta = readIndexMeta(db);
          sendJson(
            res,
            200,
            { rows, total, indexed_at: meta.last_indexed_at, contract: meta.contract },
            allowOrigin,
          );
          return;
        }
        case "/api/stats": {
          const meta = readIndexMeta(db);
          sendJson(
            res,
            200,
            {
              stats: computeStats(db),
              indexed_at: meta.last_indexed_at,
              record_count: meta.record_count,
              contract: meta.contract,
            },
            allowOrigin,
          );
          return;
        }
        default:
          sendJson(res, 404, { error: "not found" }, allowOrigin);
      }
    } catch (error) {
      if (error instanceof BadParamsError) {
        sendJson(res, 400, { error: error.message }, allowOrigin);
      } else {
        // Never leak internals into a browser-facing message; the log carries
        // the detail.
        console.error("indexer api error:", error);
        sendJson(res, 500, { error: "internal error" }, allowOrigin);
      }
    }
  });
}
