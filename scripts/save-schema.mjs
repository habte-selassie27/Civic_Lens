// Fetch the deployed contract schema with genlayer-js and save it to
// docs/civic_lens.schema.json — or, with --check, verify offline that the
// contract source, the saved schema, and the frontend method list all agree.
//
//   node scripts/save-schema.mjs <contractAddress>   live: fetch + save + compare
//   node scripts/save-schema.mjs --check             offline: no network needed
//
// The address is passed in rather than hard-coded so a redeployment cannot
// silently overwrite the schema of a different contract.
//
// Why --check exists (CI): the frontend transcribes method names by hand into
// src/config/contracts.ts. Before this gate, a contract change could pass every
// test and only fail in a reviewer's browser, at the first read. Now three
// sources must agree at CI time instead:
//
//   1. contracts/civic_lens.py          — @gl.public decorators (truth on disk)
//   2. docs/civic_lens.schema.json      — the saved deployed interface
//   3. frontend/src/config/contracts.ts — the names the app actually calls
//
// The live mode additionally confirms the *deployed* contract still matches
// (that step needs the network, so it stays a release step, not a CI gate).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Public methods of the contract source, from its decorators.
 * Returns Map<name, readonly> and throws when the pattern finds nothing —
 * a parser that silently matches zero methods would pass every check.
 */
export function parseContractMethods(source) {
  const methods = new Map();
  const re = /@gl\.public\.(view|write)\s*\r?\n\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  for (const match of source.matchAll(re)) {
    const [, kind, name] = match;
    if (methods.has(name)) throw new Error(`duplicate method in contract source: ${name}`);
    methods.set(name, kind === "view");
  }
  if (methods.size === 0) {
    throw new Error(
      "contract source parser found no @gl.public methods — the decorator pattern changed; update parseContractMethods()",
    );
  }
  return methods;
}

/**
 * Method names the frontend calls, from READ_METHODS / WRITE_METHODS in
 * src/config/contracts.ts. Returns Map<name, readonly>.
 */
export function parseFrontendMethods(source) {
  const section = (exportName) => {
    const re = new RegExp(`${exportName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const`);
    const block = source.match(re);
    if (!block) {
      throw new Error(
        `frontend config parser found no ${exportName} block — update parseFrontendMethods()`,
      );
    }
    return [...block[1].matchAll(/:\s*"([a-z_][a-z0-9_]*)"\s*,/g)].map((m) => m[1]);
  };
  const reads = section("READ_METHODS");
  const writes = section("WRITE_METHODS");
  if (reads.length === 0 || writes.length === 0) {
    throw new Error("frontend config parser found an empty method list — update parseFrontendMethods()");
  }
  const methods = new Map();
  for (const name of reads) methods.set(name, true);
  for (const name of writes) methods.set(name, false);
  return methods;
}

/** Method names in a saved schema object, as Map<name, readonly>. */
export function parseSchemaMethods(schema) {
  const entries = Object.entries(schema?.methods ?? {});
  if (entries.length === 0) throw new Error("saved schema carries no methods");
  return new Map(entries.map(([name, def]) => [name, def.readonly === true]));
}

/** Compare two Map<name, readonly>; returns human-readable problems ([] = agree). */
export function compareMethodSets(labelA, a, labelB, b) {
  const problems = [];
  for (const [name, readonly] of a) {
    if (!b.has(name)) problems.push(`${name}: present in ${labelA}, missing from ${labelB}`);
    else if (b.get(name) !== readonly) {
      problems.push(
        `${name}: ${labelA} says ${readonly ? "view" : "write"}, ${labelB} says ${
          b.get(name) ? "view" : "write"
        }`,
      );
    }
  }
  for (const name of b.keys()) {
    if (!a.has(name)) problems.push(`${name}: present in ${labelB}, missing from ${labelA}`);
  }
  return problems;
}

function describe(methods) {
  const views = [...methods.values()].filter(Boolean).length;
  return `${methods.size} methods (${views} view, ${methods.size - views} write)`;
}

/**
 * Offline three-way check. Takes file contents (not paths) so tests can run
 * it against mutated fixtures without touching the repo.
 */
export function checkOffline({ contractSource, frontendSource, schema }) {
  const fromContract = parseContractMethods(contractSource);
  const fromFrontend = parseFrontendMethods(frontendSource);
  const fromSchema = parseSchemaMethods(schema);

  const problems = [
    ...compareMethodSets("contract source", fromContract, "saved schema", fromSchema),
    ...compareMethodSets("saved schema", fromSchema, "frontend config", fromFrontend),
  ];
  return {
    ok: problems.length === 0,
    problems,
    fromContract,
    fromSchema,
    fromFrontend,
  };
}

async function liveFetch(address) {
  const { createClient } = await import("genlayer-js");
  const { studionet } = await import("genlayer-js/chains");
  const client = createClient({ chain: studionet });
  return client.getContractSchema(address);
}

async function main() {
  const arg = process.argv[2];

  if (arg === "--check") {
    const contractSource = readFileSync(resolve(repoRoot, "contracts/civic_lens.py"), "utf8");
    const frontendSource = readFileSync(
      resolve(repoRoot, "frontend/src/config/contracts.ts"),
      "utf8",
    );
    const schema = JSON.parse(
      readFileSync(resolve(repoRoot, "docs/civic_lens.schema.json"), "utf8"),
    );

    const result = checkOffline({ contractSource, frontendSource, schema });
    console.log(`contract source  ${describe(result.fromContract)}`);
    console.log(`saved schema     ${describe(result.fromSchema)}`);
    console.log(`frontend config  ${describe(result.fromFrontend)}`);
    if (!result.ok) {
      console.error("\nschema drift — the three sources disagree:");
      for (const problem of result.problems) console.error(`  ${problem}`);
      console.error(
        "\nfix: regenerate the schema (node scripts/save-schema.mjs <address>),\n" +
          "then update frontend/src/config/contracts.ts in the same commit.",
      );
      process.exit(1);
    }
    console.log("\nOK — contract source, saved schema, and frontend config agree");
    return;
  }

  if (!arg || !/^0x[0-9a-fA-F]{40}$/.test(arg)) {
    console.error("usage: node scripts/save-schema.mjs <0x…40 hex…>\n       node scripts/save-schema.mjs --check");
    process.exit(1);
  }
  const address = arg;
  const schema = await liveFetch(address);

  const out = "docs/civic_lens.schema.json";
  writeFileSync(out, JSON.stringify(schema, null, 2) + "\n");

  // `methods` comes back keyed by method name; normalise to [name, def] pairs.
  const entries = Array.isArray(schema)
    ? schema.map((m) => [m.name ?? m.methodName, m])
    : Object.entries(schema?.methods ?? {});
  const views = entries.filter(([, m]) => m.readonly === true);
  const writes = entries.filter(([, m]) => m.readonly !== true);
  console.log(`saved ${out}`);
  console.log(`contract ${address}`);
  console.log(`methods ${entries.length} (views ${views.length}, writes ${writes.length})`);
  console.log(
    entries
      .map(([name, m]) => `  ${name}${m.readonly ? " [view]" : " [write]"}`)
      .sort()
      .join("\n"),
  );

  // Guard against the frontend drifting away from the deployed contract: the
  // names in src/config/contracts.ts are transcribed from this file by hand.
  const fromFrontend = parseFrontendMethods(
    readFileSync(resolve(repoRoot, "frontend/src/config/contracts.ts"), "utf8"),
  );
  const fromSchema = parseSchemaMethods(schema);
  const problems = compareMethodSets("deployed schema", fromSchema, "frontend config", fromFrontend);
  if (problems.length) {
    console.error("\nfrontend/src/config/contracts.ts no longer matches the deployed contract");
    for (const problem of problems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log("\nfrontend/src/config/contracts.ts matches the deployed contract");
}

const isMain =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) await main();
