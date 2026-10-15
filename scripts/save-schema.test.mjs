// Tests for scripts/save-schema.mjs — the schema-drift gate.
//
// Two layers:
//   1. parsers against the real repo files (the shapes they must handle today)
//   2. checkOffline against mutated fixtures (the drift they must catch)
//
// Run: node --test scripts/save-schema.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  checkOffline,
  compareMethodSets,
  parseContractMethods,
  parseFrontendMethods,
  parseSchemaMethods,
} from "./save-schema.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(repoRoot, path), "utf8");

const REAL = {
  contractSource: read("contracts/civic_lens.py"),
  frontendSource: read("frontend/src/config/contracts.ts"),
  schema: JSON.parse(read("docs/civic_lens.schema.json")),
};

test("contract source parser finds every public method with its kind", () => {
  const methods = parseContractMethods(REAL.contractSource);
  assert.equal(methods.size, 13);
  assert.equal(methods.get("get_commitment"), true);
  assert.equal(methods.get("get_commitments"), true);
  assert.equal(methods.get("get_constants"), true);
  assert.equal(methods.get("create_commitment"), false);
  assert.equal(methods.get("request_review"), false);
  assert.equal(methods.get("withdraw_commitment"), false);
});

test("frontend config parser reads both method maps", () => {
  const methods = parseFrontendMethods(REAL.frontendSource);
  assert.equal(methods.size, 13);
  const views = [...methods.values()].filter(Boolean).length;
  assert.equal(views, 7);
  assert.equal(methods.get("open_challenge"), false);
  assert.equal(methods.get("get_outcome"), true);
});

test("saved schema parser reads names and readonly flags", () => {
  const methods = parseSchemaMethods(REAL.schema);
  assert.equal(methods.size, 13);
  assert.equal(methods.get("get_challenges"), true);
  assert.equal(methods.get("supersede_commitment"), false);
});

test("checkOffline passes on the current repo", () => {
  const result = checkOffline(REAL);
  assert.deepEqual(result.problems, []);
  assert.equal(result.ok, true);
});

test("checkOffline catches a contract method missing from the frontend config", () => {
  const result = checkOffline({
    ...REAL,
    contractSource: REAL.contractSource.replace(
      "    @gl.public.view\n    def get_constants",
      "    @gl.public.view\n    def get_new_thing",
    ),
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some(
      (p) => p.includes("get_new_thing") && p.includes("saved schema"),
    ),
  );
});

test("checkOffline catches a frontend typo against the schema", () => {
  const result = checkOffline({
    ...REAL,
    frontendSource: REAL.frontendSource.replace(
      '"submit_evidence"',
      '"submit_evidence_v2"',
    ),
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some(
      (p) => p.includes("submit_evidence_v2") && p.includes("frontend config"),
    ),
  );
  assert.ok(
    result.problems.some(
      (p) => p.includes("submit_evidence") && p.includes("missing from frontend config"),
    ),
  );
});

test("checkOffline catches a view/write flip", () => {
  const drifted = structuredClone(REAL.schema);
  drifted.methods.get_commitment.readonly = false;
  const result = checkOffline({ ...REAL, schema: drifted });
  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some(
      (p) => p.includes("get_commitment") && p.includes("view") && p.includes("write"),
    ),
  );
});

test("compareMethodSets reports extras in both directions", () => {
  const a = new Map([
    ["x", true],
    ["y", false],
  ]);
  const b = new Map([
    ["x", true],
    ["z", true],
  ]);
  const problems = compareMethodSets("A", a, "B", b);
  assert.deepEqual(problems.sort(), [
    "y: present in A, missing from B",
    "z: present in B, missing from A",
  ]);
});

test("parsers fail loudly when their pattern stops matching", () => {
  assert.throws(() => parseContractMethods("def nothing_matches(): pass"));
  assert.throws(() => parseFrontendMethods("export const OTHER = {};"));
  assert.throws(() => parseSchemaMethods({ methods: {} }));
});
