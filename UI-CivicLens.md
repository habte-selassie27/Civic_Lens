# UI-CivicLens.md — CivicLens Frontend Spec

> Audience: any coding agent building the CivicLens app.
> Read with: `AGENTS-CivicLens.md` (build rules) and `Prompt-CivicLens.md` (agent role). On GenLayer behavior the official docs win, then AGENTS, then this file.
> Scope: frontend only. Contracts, equivalence design, outcome rules, and fairness policy live in AGENTS.

---

## 0. Ground Rules

1. **Never invent GenLayer client methods.** Verify every `genlayer-js` call (client, chain config, reads, writes, tx status, receipts) via Docs MCP or the SDK reference first. This file has no client code on purpose.
2. **Inspect and save the deployed schema before wiring** (`genlayer schema <address>`). Method names, argument types, and return shapes come from the schema.
3. **Reads and writes look and behave differently.** Reads are instant; writes show a consensus lifecycle.
4. **Never show an accepted outcome as permanent.** Finality is its own visible state.
5. **`inconclusive` is not failure.** It is never red, never styled as an error, never summed into a negative score, never used to rank or flag a subject.
6. **Evidence, not intent.** No copy anywhere implies motive, bad faith, or that someone "broke a promise".
7. **Never invent evidence text.** An excerpt appears only if it came from the contract's record or from a fetch that is labeled **display-only**.
8. **Sample data is always labeled.** Never present sample outcomes as findings about real entities.
9. Secrets in env vars; `.env.example` present; no keys in the client bundle.

---

## 1. Users and Jobs

| User | Primary job | Success looks like |
|---|---|---|
| Registrant | Record a commitment with measurable criteria | Criteria are clear enough that a reviewer can't misread them |
| Evidence contributor | Add public evidence for or against a criterion | Knows what counts, sees it was included, sees how it was used |
| Reader / journalist / funder | Understand whether evidence supports a commitment | Gets the outcome, the per-criterion reasons, and the sources in under a minute |
| Subject organization | Respond to an entry about it | Can add evidence and open a challenge; sees the full history |
| Reviewer / judge | Verify GenLayer is needed and the decision is auditable | Sees criteria, evidence refs, rounds, finality, tx links |

The reader who arrives from a shared link with no context is the hardest case. Every commitment page must explain itself.

---

## 2. Design Direction

**Subject:** public accountability. The vernacular is the public record: citations, footnotes, filing stamps, reading rooms, margin notes. Design from that, not from a crypto dashboard or a generic SaaS card grid.

**One memorable element: the Criterion Ledger** (section 5.1). Each criterion is a row that pairs the criterion's exact wording with the evidence passages used, the per-criterion result, and the reason, like an annotated document. Everything else stays quiet.

### 2.1 Palette (named tokens)

| Token | Hex | Role |
|---|---|---|
| `--microfiche` | `#EBEFEE` | Page background (cool grey-green) |
| `--record-ink` | `#1B2430` | Text, headings |
| `--citation` | `#2A5DA8` | Links, primary actions, focus ring base |
| `--verdigris` | `#2D7A68` | Evidence supports |
| `--plum` | `#78396A` | Evidence contradicts |
| `--graphite` | `#5C6672` | Inconclusive (neutral, deliberately not a warning color) |
| `--rule` | `#C5CFCD` | Borders, dividers |
| `--sheet` | `#FFFFFF` | Document surfaces (commitment text, evidence excerpts) |

Why these: **contradicts is plum, not red**, and **inconclusive is graphite, not amber**, so neither reads as an alarm or a failure grade. Meet WCAG AA contrast. **Never rely on color alone**: each result has a distinct icon shape and a text label (see 5.2).

Avoid the generic defaults: cream + terracotta, near-black + acid green, identical rounded cards with the same soft shadow, gradient washes.

### 2.2 Type
- **Documents** (commitment text, excerpts, criterion wording): Source Serif 4. These read as quoted records.
- **Interface** (labels, controls, chips, tables): Public Sans.
- Tabular figures for any numbers (`font-variant-numeric: tabular-nums`).
- Sentence case everywhere. No ALL-CAPS labels, no tracked-out eyebrows above every heading.
- Line length under 80 characters for prose; serif body gets slightly more line-height than sans.
- If substituting fonts, say what and why. Self-host or use a verified font host; don't break the deploy target's CSP.

Scale (suggestion): 14 / 16 / 18 / 22 / 28 / 40.

### 2.3 Shape and structure
- Quoted material (commitment text, evidence excerpts) is set as a document: `--sheet` background, a left rule in `--rule`, serif type. This visual grammar means "this is someone else's words".
- Interface chrome is flat and quiet. Radii small on inputs and chips; hierarchy, not one radius everywhere.
- Borders and rules encode structure (grouping evidence under its criterion, separating rounds), not decoration.
- Numbered markers **only** for the round history, because it really is a sequence.
- Motion only in response to action (expanding an evidence item, a status change confirming). One optional entrance on the Ledger's first render. Respect `prefers-reduced-motion`.

---

## 3. Information Architecture

```
/                       Landing
/demo                   Sample scenarios
/commitments            Browse (filter: sample | live, outcome, finality)
/commitments/new        Register a commitment
/commitments/:id        Commitment page (main screen)
/commitments/:id/rounds Round history and challenges
/how-it-works           Consensus, equivalence, finality, why "inconclusive" exists
/fairness               Safeguards and limitations
```

Persistent chrome: network indicator, account state, data-mode badge legend (Sample vs Live). Footer: README, contract addresses, explorer, fairness link.

---

## 4. Screens

### 4.1 Landing `/`
- One plain sentence: what CivicLens does.
- A real sample commitment rendered as a Criterion Ledger (not a stock illustration), tagged **Sample data**.
- Actions: "Open the demo", "Register a commitment".
- A short "Why GenLayer" panel: public statements need interpretation, and validators must agree on meaning.
- A visible line: "CivicLens reports what published evidence supports. It doesn't judge intent."

### 4.2 Register commitment `/commitments/new`
Fields mirror the schema; client validation mirrors contract validation, but the contract is authoritative.
- Subject (organization/entity). Inline rule: public organizations and institutions only; entries naming private individuals are rejected or flagged (show the actual rule from the contract).
- Source statement link (**required**): where the commitment was made.
- Commitment text (as stated).
- Registrant role: "I'm registering this for my own organization" / "I'm an observer". The UI explains that the subject hasn't necessarily verified the entry either way.
- Criteria builder: for each criterion: wording, how it would be measured, required or optional, optional threshold + unit, optional deadline. Bounded count with a clear limit indicator.
- Evaluation period with an explicit timezone.
- Source guidance: what counts as authoritative evidence.

A **plain-language summary** updates as the form changes and the registrant confirms it: "CivicLens will check whether published evidence between [start] and [end] supports each of these [n] criteria. Required: [list]."

Show a warning that **criteria are locked once review starts** and can only be changed by creating a new version.

Submit is a **write**: show the lifecycle (section 6).

### 4.3 Commitment page `/commitments/:id` (main screen)

```
+----------------------------------------------------------------+
| [Sample data | Live evidence]                    [Network]       |
| Subject name                                                   |
| ┃ "Commitment text as stated"            Source statement ↗     |
| Registered by 0x… as observer. Not verified by the subject.    |
+--------------------------------+-------------------------------+
| OUTCOME                        | ROUNDS                        |
| Evidence supports | contradicts| 1 Registered                  |
| | Inconclusive                 | 2 Evidence window closed      |
| One-sentence reason            | 3 Review (round 1)            |
| [Accepted – can be appealed]   | 4 Challenge → Review (round 2)|
| or [Final]                     | 5 Final                       |
| Based on n required criteria   |                               |
+--------------------------------+-------------------------------+
| CRITERION LEDGER                                               |
| Criterion 1 (required)  "wording…"            [✓ Supports]     |
|   Evidence used:   ┃ excerpt / source title ↗  [evaluated]      |
|   Considered, not used: source ↗ (reason)                      |
|   Reason: plain-language sentence                              |
| Criterion 2 (required)  "wording…"            [– Inconclusive] |
|   What's missing or conflicting, and what would resolve it     |
| Criterion 3 (optional)  …                                      |
+----------------------------------------------------------------+
| EVIDENCE   all submitted items, submitter, date, type, status  |
|            [Add evidence]                                      |
+----------------------------------------------------------------+
| AUDIT   criteria version · round · reason code · tx + explorer |
|         receipt status · finality · schema/contract address    |
+----------------------------------------------------------------+
| ACTIONS  Add evidence · Request review · Open challenge        |
|          (each enabled only when the state machine allows;     |
|           otherwise disabled with the reason shown)            |
+----------------------------------------------------------------+
```

Rules:
- The **overall outcome and per-criterion results are always visible together**, so a mixed picture is never hidden behind one label.
- Left-align content. The Ledger is the main visual; the outcome block is the first thing read.
- Attribution line is always present and never collapsed.

### 4.4 Rounds `/commitments/:id/rounds`
Numbered sequence of rounds. Each shows: what triggered it (initial review or a challenge), evidence added since the last round, per-criterion results, the derived outcome, finality, tx link. Differences between rounds are highlighted ("Criterion 2 changed from inconclusive to supports after new evidence"). Prior rounds are never hidden or overwritten.

### 4.5 Demo `/demo`
See section 8.

### 4.6 How it works and Fairness
Plain language: leader proposes, validators evaluate independently, what "equivalent" means, appeals and finality, why `inconclusive` exists and what it does **not** mean. Fairness page mirrors AGENTS section 12: evidence not intent, authenticity limit, attribution honesty, right of response, privacy rule, gaming resistance. Be honest about limitations; don't overclaim.

---

## 5. Key Components

### 5.1 CriterionLedger / CriterionRow
- Header: criterion label, required/optional tag, exact wording (serif document style).
- Result chip (5.2) at the row's right edge.
- **Evidence used:** each item shows source title, domain, published date (as extracted/claimed), a link out, and an excerpt **only if** the record includes it or a display-only fetch produced it (tagged `evaluated` or `display-only`).
- **Considered but not used:** collapsed by default, each with a short reason code in plain words.
- **Reason:** one or two sentences mapped from `reason_code`.
- For numeric criteria: extracted figure, unit, date, and the threshold, with a clear "meets / doesn't meet / can't tell".
- For `inconclusive`: a dedicated block, "What's missing or conflicting" and "What could resolve this" (e.g. publish of a report, more evidence, a clearer criterion version). Styled neutrally, never as an error.
- Expand/collapse per row; all rows expanded for printing and for screen readers by default if few.
- Works with zero, one, and many evidence items; works with long wording.

### 5.2 ResultChip (icon + label, never color alone)

| Result | Label | Icon shape | Color token |
|---|---|---|---|
| supported | Evidence supports | check mark in circle | `--verdigris` |
| contradicted | Evidence contradicts | cross/minus in diamond | `--plum` |
| inconclusive | Inconclusive | dashed circle with dash | `--graphite` |
| pending | Review pending | hourglass | `--graphite` |

The inconclusive chip uses a **dashed outline** to signal "no determination", not "bad".

### 5.3 OutcomePanel
Overall outcome label (same chip vocabulary), one-sentence reason, the count basis ("Based on 3 required criteria: 2 supported, 1 inconclusive"), and the FinalityChip. Never a score, grade, or ranking.

### 5.4 FinalityChip
Two levels on every outcome: **Accepted (can still be appealed)** and **Final**. Challenge actions are enabled per the state machine; nothing implies permanence before Final.

### 5.5 AttributionBanner
"Registered by [address] as [observer | for their own organization]. The subject hasn't necessarily verified or endorsed this entry." Plus a link to the Fairness page. If the subject has added evidence or opened a challenge, show that too ("The subject responded on [date]").

### 5.6 DataModeBadge
**Sample data** / **Live evidence**. Visible on every commitment surface and in lists. Distinct shape + label, with a tooltip explaining.

### 5.7 EvidenceSubmitForm
URL/reference, declared type (from the allowed list), optional note. If a "stance" field exists in the contract, label it **"Your note (not used by the review)"**. The UI must never imply the submitter's stance influences the result. Show the per-commitment and per-person limits and what's left. Duplicate and out-of-window feedback comes from contract errors, mapped clearly.

### 5.8 ChallengePanel
Target (a criterion or the whole outcome), grounds (bounded, with counter), attach new evidence, and a plain explanation of what happens next (a new review round) and how it relates to GenLayer's own appeal process (verify the real mechanics in the docs before writing this copy). Shows limits remaining.

### 5.9 RoundTimeline
Sequence component (numbering is appropriate). Current position highlighted; each past round expandable; diffs between rounds.

### 5.10 TxStatus
The write lifecycle (section 6). Reused by every write.

### 5.11 CopyField
Addresses and hashes: truncated display, full value on focus/hover, copy button with confirmation, verified explorer link.

### 5.12 DisabledReason
Any disabled action shows why in words ("Evidence window closed on [date]", "Criteria are locked once review starts").

---

## 6. Transaction Lifecycle (writes)

| State | User wording | UI |
|---|---|---|
| idle | Nothing sent | Normal button |
| submitted | Sent to the network | Disabled, spinner, tx hash when known |
| pending | Validators are reviewing | Progress indicator, "This can take a while", manual refresh |
| accepted | Validators agreed; can still be appealed | Result shown with "Accepted – can be appealed" chip |
| finalized | Permanent | Result shown with "Final" chip |
| failed | Didn't complete | Mapped message + retry where valid |

The table is **UI vocabulary**; verify the SDK's actual status names and mapping before implementing.

Behavior:
- Show the tx hash as soon as available, with copy + explorer link. Build links from verified explorer config; never invent one.
- Poll or subscribe via the verified SDK mechanism; stop at a terminal state; offer manual refresh.
- Optimistic UI is limited to "submitted". No results before acceptance.
- Prevent double submission (disable in flight; guard against double clicks and re-renders).
- Persist in-flight tx hashes so a reload resumes tracking.
- Reads: skeleton → data, or error with retry. Reads never show the write lifecycle.

---

## 7. Errors, Empty States, Environment

### 7.1 Error mapping

| Prefix | User message | Action |
|---|---|---|
| `EXPECTED` | Specific reason (evidence window closed, limit reached, not allowed, criteria locked) | Fix input |
| `EXTERNAL` | "A source couldn't be reached. Try again later." | Retry |
| `TRANSIENT` | "Temporary problem. Try again." | Retry |
| `LLM_ERROR` | "The review couldn't be completed. Try again." | Retry |

Errors say what happened and what to do; no apologies, no vague "Something went wrong". Never show raw model output or stack traces. A "Details" disclosure shows the stable error string and tx hash.

### 7.2 Reason-code copy map (single source of truth)
All enums map to plain, neutral copy in **one file** (`domain/copy`). Examples of the intent (final wording is yours, but keep it neutral and specific):

| `reason_code` | Copy intent |
|---|---|
| `no_relevant_evidence` | "No submitted evidence addresses this criterion yet." |
| `source_conflict` | "Authoritative sources disagree on this criterion." |
| `criterion_ambiguous` | "The criterion's wording can't be matched to evidence. A clearer version may help." |
| `evidence_unavailable` | "A source couldn't be reached during the review." |

Tests enforce that **no copy string contains loaded terms** (e.g. "failed", "broken", "liar", "fraud", "false", "lied") in outcome or reason text.

### 7.3 Environment states
- Wrong network: blocking banner with a switch action.
- No account: explain what's needed; reads still work.
- Unfunded account on a funded network: explain and link the faucet (browser-based claim).
- StudioNet 0 GEN: expected; don't warn.
- Bad config / wrong address: config error screen naming the address and network.

### 7.4 Empty states
Every list has one that invites action ("No evidence yet. Add a public source that bears on a criterion.").

---

## 8. Demo Mode

A reviewer must see every interesting outcome without waiting on live evidence. All scenarios use **sample organizations or clearly licensed public documents** and carry the **Sample data** badge.

1. Clear support: measurable criterion met by an authoritative report
2. Clear contradiction: authoritative data conflicts with the criterion
3. Missing evidence: nothing relevant by the end of the window → **inconclusive, not contradicted**
4. Conflicting sources: two authoritative sources disagree
5. Ambiguous criterion: `criterion_ambiguous`
6. Numeric boundary: figure exactly at threshold
7. Injection attempt inside a submitted document: ignored (show that the outcome is unchanged)
8. Challenge with new evidence: round 2 changes a criterion's result

Each scenario: a one-line "what this tests", the Criterion Ledger, the outcome, and the round history.

Honest labeling is mandatory: a visible toggle or tag distinguishes **Replay of a recorded result** from **Run on network** (real tx and receipts). Never fake a transaction.

---

## 9. Architecture

- React + TypeScript per the Project Boilerplate; adapt to its conventions rather than replacing them.
- One module creates the GenLayer client from typed config.
- One typed config file: network/chain, contract addresses, explorer URL patterns, schema-derived method names. No scattered literals.
- Thin typed service layer (`services/`) wraps verified SDK calls and maps results to UI types. Components never call the SDK directly.
- Enum-to-copy mapping in one place (`domain/copy`).
- Reads via a caching layer with sensible refetch; writes via the TxStatus lifecycle.

```
app/
  src/
    config/        network.ts, contracts.ts, explorer.ts
    services/      commitmentService, evidenceService, reviewService, challengeService
    domain/        types.ts, enums.ts, copy.ts   (neutral copy map + loaded-term guard)
    components/    CriterionLedger, ResultChip, OutcomePanel, FinalityChip, AttributionBanner,
                   DataModeBadge, EvidenceSubmitForm, ChallengePanel, RoundTimeline,
                   TxStatus, CopyField, DisabledReason
    pages/         Landing, Demo, Commitments, CommitmentNew, CommitmentDetail, Rounds,
                   HowItWorks, Fairness
    fixtures/      sample scenarios (typed, labeled sample)
    tests/
```

---

## 10. Accessibility and Quality Floor

- Keyboard: every action reachable; visible focus ring (`--citation` based, 3:1 against adjacent colors).
- Screen readers: landmarks, ordered headings, live region for tx state, each Ledger row exposes criterion, result, and reason in reading order.
- Color is never the only signal (icons + labels).
- Touch targets at least 44px.
- Responsive to 360px: the Ledger stacks (result chip moves under the wording); the page body never scrolls sideways; long URLs wrap or truncate with full value on focus.
- `prefers-reduced-motion` respected.
- No layout shift on tx state changes (reserve space for chips).
- Dates always show timezone; the evaluation period uses its declared timezone.
- Print-friendly commitment page (the Ledger is a document; people will print or save it).

---

## 11. Copy Rules

- Write for the reader, not the protocol. "Evidence supports this criterion", not "consensus reached on enum 0".
- Sentence case, active voice, plain verbs. Buttons say what happens: "Add evidence", "Request review", "Open challenge", "Register commitment". One name per action across button, toast, and status.
- Explain GenLayer terms once, in place (finality, appeal, validator), linking to How it works.
- Never claim certainty the system lacks: "Accepted" isn't "Final"; "Evidence supports" isn't "verified true"; "Inconclusive" isn't "unfulfilled".
- Neutral outcome vocabulary only: **Evidence supports / Evidence contradicts / Inconclusive**.
- No scores, grades, rankings, red/green "report cards", or leaderboards of subjects.

---

## 12. Testing the UI

- Component tests across all states (empty, loading, error, long text, many items).
- **Ledger tests:** zero/one/many evidence items; considered-but-unused; numeric criteria at/above/below threshold; inconclusive blocks; mixed outcomes.
- **Copy guard test:** every outcome/reason string passes the loaded-term check; every enum has copy.
- **No-score test:** nothing in the UI renders an aggregate score or rank.
- Data-mode badge present on every commitment surface.
- Tx lifecycle tests with a mocked service layer: all transitions, double-submit prevention, reload resume, failure paths.
- Error-mapping tests per prefix.
- DisabledReason shown for every disabled action.
- Accessibility checks (automated + manual keyboard pass).
- One end-to-end path on StudioNet (or target network) with real receipts, recorded for the evidence pack.

---

## 13. UI Milestones and Acceptance

| Milestone | Acceptance criteria |
|---|---|
| UI-1 Config and client | Schema saved; typed config; single client module; a real read renders |
| UI-2 Register flow | Create commitment through the full lifecycle; summary sentence; locked-criteria warning |
| UI-3 Commitment page | Outcome, attribution, audit block render from real contract data |
| UI-4 Criterion Ledger | All ledger states, neutral inconclusive treatment, accessible |
| UI-5 Evidence + review | Submit evidence, request review, tx lifecycle, accepted vs final distinct |
| UI-6 Challenge + rounds | Challenge flow, round diffs, history preserved |
| UI-7 Demo mode | Eight sample scenarios, replay vs on-network labeled honestly |
| UI-8 Polish + evidence | A11y pass, responsive, print view, screenshots, recording, README section |

Each closes only with evidence (screenshots, test output, tx links). Never invent hashes, addresses, or explorer links.

---

## 14. Definition of Done (UI)

- [ ] Schema inspected and saved before wiring; every SDK call verified
- [ ] Reads and writes visibly different
- [ ] Accepted vs final never conflated
- [ ] Overall outcome always shown with per-criterion results
- [ ] `inconclusive` neutral everywhere (no red, no error styling, no score)
- [ ] Neutral copy map with loaded-term guard test passing
- [ ] Attribution banner on every commitment page
- [ ] Evidence excerpts only from the record or labeled display-only
- [ ] Submitter notes never implied to affect the review
- [ ] Sample vs Live badge on every surface
- [ ] DisabledReason on every disabled action
- [ ] Error prefixes mapped; wrong-network, no-account, unfunded, bad-config handled
- [ ] Demo with eight scenarios, honest replay/run labeling
- [ ] Keyboard, screen-reader, contrast, reduced-motion checks pass; responsive at 360px; print view works
- [ ] Typed config; no scattered literals; no secrets in the bundle
- [ ] README UI section with screenshots and run steps
- [ ] Evidence pack: recording + real tx links

---

When in doubt: verify the API, show the real state, label the data honestly, and never turn "we couldn't tell" into "they failed".