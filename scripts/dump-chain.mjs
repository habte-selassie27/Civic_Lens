// Dump the live contract state as JSON, using the same client the app reads
// with (genlayer-js + studionet). Used to build faithful replays of recorded
// on-chain results for the bundled demo scenarios, so the demo shows real
// records rather than authored fiction.
//
//   node scripts/dump-chain.mjs <contractAddress> <outDir>

import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const address = process.argv[2];
const outDir = process.argv[3];
if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address) || !outDir) {
  console.error("usage: node scripts/dump-chain.mjs <0x…40 hex…> <outDir>");
  process.exit(1);
}

const client = createClient({ chain: studionet });
const read = async (functionName, args) =>
  client.readContract({ address, functionName, args });

mkdirSync(outDir, { recursive: true });

const summary = await read("get_commitments", [20, 0]);
const ids = summary.map((c) => c.id);
console.log(`commitments: ${ids.join(", ")}`);

const dump = { address, commitments: summary, detail: {} };
for (const id of ids) {
  dump.detail[id] = {
    commitment: await read("get_commitment", [id]),
    evidence: await read("get_evidence", [id]),
    rounds: await read("get_rounds", [id]),
    outcome: await read("get_outcome", [id]),
    challenges: await read("get_challenges", [id]),
  };
  const o = dump.detail[id].outcome;
  console.log(
    `  #${id} ${o.overall_outcome} / ${o.overall_reason} — ` +
      `rounds ${dump.detail[id].rounds.length}, evidence ${dump.detail[id].evidence.length}, ` +
      `retrieval ${JSON.stringify(o.retrieval_counts ?? {})}`,
  );
}

writeFileSync(`${outDir}/chain.json`, JSON.stringify(dump, null, 2) + "\n");
console.log(`\nsaved ${outDir}/chain.json`);
