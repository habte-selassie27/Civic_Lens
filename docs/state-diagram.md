# State machine — CivicLens commitments (M1)

One state machine, one contract (`CivicLens`). Every transition below is
enumerated and tested valid **and** invalid in `tests/direct/test_state_machine.py`.

## States

| State | Meaning |
|---|---|
| `registered` | Created; evidence window open (transitions directly to `evidence_open` in the same call — kept as a distinct logical step for the round timeline) |
| `evidence_open` | Anyone may submit evidence; registrant may request review or withdraw |
| `review_pending` | Review transaction in flight; no evidence submission, no second review, no challenge |
| `challenged` | A challenge was opened and recorded; round increment pending review |
| `outcome_accepted` | A round's outcome is recorded (accepted by consensus — **not final**); evidence submission re-opened (right of response); challenge may open a new round |
| `withdrawn` | Registrant withdrew before review started (terminal) |
| `superseded` | A newer version of this commitment exists (terminal for edits; record stays readable) |

Finality (`Finalized`) is **not** a contract state: the contract cannot observe
its own transaction finality. The frontend maps each round to its transaction
hash and reads the lifecycle projection to show Accepted vs Final honestly
(see docs/architecture.md § finality).

## Transitions

```
registered ──(auto, same tx)──> evidence_open

evidence_open ──submit_evidence──> evidence_open          (bounded, dedup)
evidence_open ──request_review (registrant)──> review_pending
evidence_open ──withdraw (registrant)──> withdrawn
evidence_open ──supersede (registrant)──> superseded       (new version created)

review_pending ──review consensus ok──> outcome_accepted  (RoundRecord appended)
review_pending ──consensus failure──> review_pending      (no record; retryable)

outcome_accepted ──submit_evidence──> outcome_open window stays outcome_accepted
outcome_accepted ──open_challenge (anyone, limits)──> challenged
outcome_accepted ──request_review──> EXPECTED: already reviewed (rejected)

challenged ──request_review (registrant)──> review_pending   (round n+1)
challenged ──submit_evidence──> challenged                  (extra evidence for round n+1)

review_pending ──request_review (again)──> EXPECTED: review already pending (rejected)
outcome_accepted at round == MAX_ROUNDS ──open_challenge──> EXPECTED: round limit reached
withdrawn / superseded ──anything──> EXPECTED: terminal state (rejected)
```

## Invariants (tested)

1. Evidence can only be submitted in `evidence_open`, `outcome_accepted`,
   `challenged` — never in `review_pending`, `withdrawn`, `superseded`.
2. Criteria are immutable after creation; `update_criteria` always rejects
   with a pointer to `supersede_commitment`; superseding creates a new
   commitment linked to the old one.
3. A review request is only accepted in `evidence_open` (first round) or
   `challenged` (later rounds), and only from the registrant (or, for round 1,
   the deployment admin). Repeated requests for a pending round are **rejected
   (idempotency by rejection, not by silent no-op)** — documented choice.
4. Challenges: at most `MAX_CHALLENGES_PER_PARTY` (2) per party per
   commitment, at most 1 open challenge per round (first wins), total rounds
   ≤ `MAX_ROUNDS` (3). Challenge rounds are counted **at open** so a failed
   reevaluation cannot be retried for free (ClimateClaim audit lesson:
   count opened rounds, not only completed ones).
5. Round numbers are 1-based and strictly increase; `RoundRecord` history is
   append-only; a new round is only recorded when its review consensus
   succeeds (failed reviews record nothing — retryable).
6. Deadlines not reached / evidence window open ⇒ never `inconclusive`
   (status stays `evidence_open` / `pending` semantics).
