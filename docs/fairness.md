# Fairness, safety, and limitations — CivicLens (M1)

This file is the source for the README "Fairness and limitations" section and
the in-app `/fairness` page (UI copy must match these rules).

## 1. Neutral language

Outcome labels are exactly: **Evidence supports**, **Evidence contradicts**,
**Inconclusive**. The system never uses "liar", "failed", "broken", "fraud",
"false", or similar loaded terms in outcome or reason copy. Enforced by the
copy-map loaded-term guard test (`app/src/domain/copy.test.ts`).

## 2. Inconclusive is not failure

`inconclusive` means the submitted evidence does not settle the criterion. It
is never styled as an error, never rolled into a score, ranking, or export
flag, and never presented as proof that a commitment was not met. The UI shows
what is missing or conflicting and what could resolve it.

## 3. Evidence, not intent

Per-criterion results report whether published evidence supports a criterion
as written. The system makes no claim about motive, bad faith, or intent, and
nothing in the record asserts that anyone "broke a promise".

## 4. Authenticity limitation

Consensus verifies that validators agree on what evidence *shows*; it cannot
prove a document is genuine or that a source is who it claims to be. Prefer
authoritative, archived, or institutional sources. Say so in the README and
on the How-it-works page.

## 5. Attribution honesty

Every commitment shows who registered it and in what role
(`organization` = registering for their own organization, `observer` = third
party), with the line: "The subject hasn't necessarily verified or endorsed
this entry." The platform does not verify organizational identity.

## 6. Right of response

Anyone — including the subject organization — can submit evidence and open a
challenge. Evidence submitted while an outcome is accepted is included in the
next review round if a challenge reopens it. Round and challenge history are
always shown next to the outcome.

## 7. Privacy rule (tested)

Subjects are **public organizations and institutions only**. Registration with
`subject_kind = "individual"` is rejected by the contract
(`EXPECTED: private individuals cannot be subjects`). The rule is self-declared
at registration and honestly labeled as such — the platform cannot verify
identity, and the UI states this next to the rule.

## 8. Gaming resistance

- Evidence is judged on content, not submitter identity or count.
- Bounded submissions: 20 evidence items per commitment, 8 per submitter per
  commitment; duplicate URLs rejected deterministically.
- `stance_hint` (UI note) is advisory, stored as a note labeled "not used by
  the review", and never read by the review code.
- Rounds bounded (3), challenges bounded per party (2), one open challenge
  per round.

## 9. Finality honesty

An accepted outcome can be appealed through GenLayer's protocol appeal process
and is not permanent until the transaction finalizes. The UI shows an
"Accepted — can be appealed" chip distinct from "Final" and reads the real
lifecycle from the SDK. Contract-side, prior rounds are append-only.

### Relationship to GenLayer's protocol appeals

CivicLens challenges and GenLayer appeals are different layers and do not
duplicate each other:

- A **CivicLens challenge** disputes the *substance* (new evidence, unclear
  criterion) and starts a **new review round** with new inputs.
- A **GenLayer appeal** disputes the *committee's decision on the same inputs*
  and is handled by the protocol (validator/leader appeals, bonds, fresh
  committees). CivicLens never reimplements or bypasses it.

If a review transaction is appealed, the protocol may recompute it; the
frontend must track the same transaction hash to finality before presenting an
outcome as Final (docs: accepted ≠ final; `on='accepted'` messages can be
re-emitted — CivicLens records outcomes only in the transaction's own
execution, and round-keyed append-only history makes recomputation
idempotent: a recomputed review for round n either records the same round once
or is rejected by the round guard).

## 10. Sample data labeling

Demo scenarios are fixtures labeled **Sample data** everywhere they appear;
live commitments are labeled **Live evidence**. Sample outcomes are never
presented as findings about real entities; demo subjects are fabricated or
clearly licensed public documents.

## 11. What consensus can and cannot prove (summary for UI)

| It can show | It cannot show |
|---|---|
| Validators agreed evidence supports/contradicts a criterion as written | That a document is authentic |
| The exact evidence ids, reasons, rounds, and finality state used | What the subject intended |
| That a criterion's figure meets a threshold (with unit match) | Anything about entities or claims outside the submitted evidence |
