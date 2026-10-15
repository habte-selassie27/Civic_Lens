/**
 * Contract config — address plus the schema-derived method names.
 *
 * Method names below are transcribed from the saved deployed schema
 * (docs/civic_lens.schema.json). They are NOT guesses: each one is checked
 * against that file when it is added here. If the contract changes, the schema
 * is regenerated and this file is updated in the same commit.
 *
 * `CONFIGURED` drives the sample-vs-live switch: with no address the app runs
 * entirely on bundled sample scenarios and every surface is labeled
 * "Sample data" (UI-CivicLens section 8 honesty rule).
 */

const RAW_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ?? "").trim();

/** Placeholder values that must count as "not configured". */
const PLACEHOLDERS = new Set(["", "0x", "your_contract_address", "TBD", "TBD-FINAL-DEPLOY"]);

export const CONTRACT_ADDRESS = RAW_ADDRESS as `0x${string}`;

export const CONFIGURED =
  !PLACEHOLDERS.has(RAW_ADDRESS) && /^0x[0-9a-fA-F]{40}$/.test(RAW_ADDRESS);

/** Why the app is running on sample data, shown verbatim in the banner. */
export const CONFIG_HINT = CONFIGURED
  ? null
  : "No contract address configured. Set VITE_CONTRACT_ADDRESS in frontend/.env to read live evidence from the deployed contract.";

/**
 * Read methods (schema: "readonly": true) — instant, no wallet needed.
 */
export const READ_METHODS = {
  constants: "get_constants",
  commitments: "get_commitments",
  commitment: "get_commitment",
  evidence: "get_evidence",
  rounds: "get_rounds",
  outcome: "get_outcome",
  challenges: "get_challenges",
} as const;

/**
 * Write methods (schema: "readonly": false) — each returns a transaction hash
 * that the caller drives through the lifecycle in domain/finality.ts.
 */
export const WRITE_METHODS = {
  createCommitment: "create_commitment",
  supersedeCommitment: "supersede_commitment",
  withdrawCommitment: "withdraw_commitment",
  submitEvidence: "submit_evidence",
  requestReview: "request_review",
  openChallenge: "open_challenge",
} as const;

/**
 * Contract bounds, mirroring contracts/civic_lens.py.
 *
 * These are client-side affordances only (so the UI can disable an input before
 * a round trip). The contract is authoritative and enforces every bound again.
 * When a contract address is configured the app fetches the live values from
 * `get_constants()` and prefers those over this snapshot.
 */
export const FALLBACK_CONSTANTS = {
  max_criteria: 5,
  max_evidence: 20,
  max_evidence_per_submitter: 8,
  max_rounds: 3,
  max_challenges_per_party: 1,
  max_new_evidence_per_challenge: 5,
  max_page_size: 20,
} as const;

/** Text bounds, mirroring contracts/civic_lens.py (client-side hints only). */
export const TEXT_LIMITS = {
  subject: 200,
  statementRef: 500,
  commitmentText: 2000,
  criterionText: 500,
  measure: 500,
  unit: 32,
  guidance: 1000,
  url: 500,
  note: 300,
  grounds: 1000,
  timezone: 64,
} as const;