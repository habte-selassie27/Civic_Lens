#!/usr/bin/env node
/**
 * CivicLens read indexer.
 *
 * Polls the deployed contract's read views into SQLite and serves them over a
 * small read-only HTTP API, so search and stats can cover the whole registry
 * and say truthfully when they were last updated.
 *
 * Usage:
 *   node index.mjs --address 0x…40hex            poll every 60s + serve on :4111
 *   node index.mjs --address 0x… --once          one pass, no server, exits
 *   node index.mjs --help
 *
 * The address can also come from CONTRACT_ADDRESS. Chain is StudioNet through
 * the genlayer-js chain registry — the same chain object the app uses; there
 * is no hand-rolled RPC. Requires the repository root `npm install`
 * (genlayer-js lives in the root dependencies).
 */

import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { openDb } from "./src/db.mjs";
import { readIndexMeta, runOnce } from "./src/poll.mjs";
import { createApiServer } from "./src/server.mjs";

const USAGE = `CivicLens read indexer

  node index.mjs --address <0x…40 hex> [options]

Options:
  --address <hex>     contract address (or env CONTRACT_ADDRESS)
  --port <n>          HTTP port (default 4111)
  --interval <sec>    poll interval in seconds (default 60, minimum 5)
  --db <path>         SQLite file (default indexer/data/civic-lens.db)
  --allow-origin <s>  CORS origin for the read-only API (default *)
  --once              run one indexing pass and exit (no server)
  --help              this text

Endpoints: /api/health /api/meta /api/commitments /api/stats
`;

function fail(message) {
  console.error(`indexer: ${message}`);
  process.exit(1);
}

const { values } = parseArgs({
  options: {
    address: { type: "string" },
    port: { type: "string", default: "4111" },
    interval: { type: "string", default: "60" },
    db: { type: "string" },
    "allow-origin": { type: "string", default: "*" },
    once: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (values.help) {
  console.log(USAGE);
  process.exit(0);
}

const address = (values.address ?? process.env.CONTRACT_ADDRESS ?? "").trim();
if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
  fail("no contract address — pass --address 0x… or set CONTRACT_ADDRESS");
}

const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) fail(`--port must be 1-65535, got ${values.port}`);
const intervalSeconds = Number(values.interval);
if (!Number.isFinite(intervalSeconds) || intervalSeconds < 5) {
  fail(`--interval must be at least 5 seconds, got ${values.interval}`);
}

const dbPath = values.db ?? fileURLToPath(new URL("./data/civic-lens.db", import.meta.url));
const db = openDb(dbPath);

/** The live reader: same client construction as the app's service layer. */
async function liveReader() {
  let createClient;
  let studionet;
  try {
    ({ createClient } = await import("genlayer-js"));
    ({ studionet } = await import("genlayer-js/chains"));
  } catch (error) {
    fail(
      "genlayer-js is not installed — run `npm install` at the repository root first " +
        `(${error.message})`,
    );
  }
  const client = createClient({ chain: studionet });
  return (functionName, args) => client.readContract({ address, functionName, args });
}

const read = await liveReader();

async function pass(label) {
  try {
    const result = await runOnce({ db, read, address });
    const meta = readIndexMeta(db);
    console.log(
      `[${label}] listed ${result.listed}, refreshed ${result.refreshed}, failed ${result.failed}` +
        (result.wiped ? " (registry changed — wiped)" : "") +
        ` · records ${meta.record_count} · last_indexed_at ${meta.last_indexed_at}`,
    );
    for (const error of result.errors) console.log(`  ${error}`);
    return result.ok;
  } catch (error) {
    console.error(`[${label}] pass failed: ${error.message}`);
    return false;
  }
}

if (values.once) {
  const ok = await pass("once");
  db.close();
  process.exit(ok ? 0 : 1);
}

await pass("start");
const server = createApiServer({ db, allowOrigin: values["allow-origin"] });
server.listen(port, () => {
  console.log(
    `indexer serving http://localhost:${port}/api/{health,meta,commitments,stats}` +
      ` · contract ${address} · every ${intervalSeconds}s`,
  );
});

let running = false;
const timer = setInterval(() => {
  if (running) return; // a slow pass must not stack with the next tick
  running = true;
  pass("poll").finally(() => {
    running = false;
  });
}, intervalSeconds * 1000);

function shutdown() {
  clearInterval(timer);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
