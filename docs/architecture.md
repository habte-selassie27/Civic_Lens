# CivicLens architecture — component split decision (M1)

Status: decided (M1)
Date: 2026-10-14

## The four logical components

| # | Component | Responsibility | Non-deterministic? |
|---|-----------|----------------|--------------------|
| 1 | CommitmentRegistry | Commitments, criteria, versions, evaluation period, state machine, evidence intake, bounds | No |
| 2 | EvidenceReview | Per-criterion review of evidence against criteria (leader/validator consensus) | **Yes** |
| 3 | ReviewChallenge | Challenges, grounds, per-party limits, new rounds | No |
| 4 | OutcomeRecord | Append-only round history: per-criterion results, derived overall outcome, reason codes | No |

## Decision: one deployed contract, four logical components

**All four components live in a single deployed contract, `contracts/civic_lens.py`
(class `CivicLens`), organized as clearly labeled sections with their own
docstrings.** This is a deliberate M1 design decision (per AGENTS §6), justified
by the following verified evidence:

1. **Direct-mode tests (quality gate 2) structurally support exactly one
   contract file per test process.** Probed against the pinned toolchain
   (genlayer-test 0.29.2): loading a second contract file raises
   `TypeError: only one contract is allowed; first: <ContractA> second: <ContractB>`
   (source: GenVM stdlib `genlayer/gl/genvm_contracts.py`). A multi-contract
   design would make the required adversarial direct suite (AGENTS §16)
   impossible for every contract after the first.
2. **Direct mode forbids cross-contract calls.** Probed: `gl.get_contract_at()`
   requests (`CallContract`/`DeployContract`/`PostMessage`) are rejected in
   direct mode unless an external simulator hook is installed
   (`gltest/direct/wasi_mock.py`). Any core flow crossing a contract boundary
   could not run under gate 2.
3. **The four components share one state machine.** `registered → evidence_open
   → review_pending → outcome_accepted → challenged → review_pending (n+1)`.
   Splitting it across contracts would force every transition through
   asynchronous `emit()` messages. The docs warn that `on='accepted'` messages
   cannot be recalled and may be re-emitted across appeal rounds, so every
   receiver must be idempotent — a real ordering hazard for state-machine peers.
   Components 1, 3, and 4 therefore stay synchronous with each other.
4. **Fewer moving parts for deployment and the frontend**: one address, one
   schema, one service layer (AGENTS §6: "Prefer fewer moving parts if
   responsibilities stay separate and testable").

## How separation of concerns is preserved anyway

- Component 2's non-deterministic logic is confined to two small functions
  (`_review_leader`, `_review_validator`) plus a sanitizer; everything else in
  the review path is deterministic code (date filtering, threshold comparison,
  outcome derivation) executed *outside* nondet blocks.
- Nondet blocks never touch storage: the review payload is copied to memory via
  `gl.storage.copy_to_memory` before the nondet block (required by GenVM).
- Every public method is labeled with its component in the docstring.
- The equivalence design (docs/equivalence-design.md) is written per call and
  travels with component 2.

## Why not two contracts (registry + review engine)?

Considered: `evidence_review` view-pulls the review payload from
`commitment_registry`, runs consensus, emits the outcome back with
`emit(on='finalized')`.

Rejected because:
- Its main entry point would not run under direct tests (evidence 1 and 2
  above), so gate 2 could not cover the most important flow in the system.
- The emitted-outcome return path needs idempotency handling and would only be
  testable in integration tests (gate 3).

If direct mode ever gains multi-contract support (a simulator hook already
exists in the framework), splitting component 2 into its own contract is the
natural first extraction: it is stateless, has a single entry point, and its
return path is already designed around one idempotent, round-keyed record.

## Component → code map (`contracts/civic_lens.py`)

| Component | Storage | Public methods |
|---|---|---|
| CommitmentRegistry | `commitments: TreeMap[u32, Commitment]`, `commitment_count`, `owner` | `create_commitment`, `supersede_commitment`, `update_criteria` (guard), `submit_evidence`, `request_review`, `withdraw_commitment` |
| EvidenceReview | (payload snapshot per call) | `request_review` (runs consensus) — helpers `_review_leader`, `_review_validator`, `_sanitize_review`, `_derive_outcome` |
| ReviewChallenge | `challenge_count` | `open_challenge` |
| OutcomeRecord | `Commitment.rounds: DynArray[RoundRecord]` (bounded) | `get_commitment`, `get_rounds`, `get_outcome` (views) |

## What "finality" means for the record

A contract cannot observe its own transaction's finality (verified: the
transaction context exposes no such field — see docs.genlayer.com transaction
context). `RoundRecord` therefore stores the round's deterministic outcome and
timestamp; the **frontend maps each round to the write transaction hash it
submitted and reads the lifecycle projection (`gen_getTransactionLifecycle`)
to display Accepted vs Final honestly.** Prior rounds are never overwritten, so
a finalized round 1 and an accepted round 2 can be displayed distinctly.
