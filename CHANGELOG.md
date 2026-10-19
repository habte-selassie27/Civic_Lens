# Changelog

All notable session work on CivicLens. Format per AGENTS §26:
`DONE / PROOF / NEXT / BLOCKED`.

## Session 1 — 2026-10-14

DONE:
- M1 scope + design docs written before any contract code:
  `docs/architecture.md` (component split decision with empirical evidence),
  `docs/equivalence-design.md` (filled per-call template + invariants),
  `docs/state-diagram.md`, `docs/fairness.md`, `docs/source-guidance.md`.
- Toolchain verified against official docs (never guessed):
  pinned header `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`,
  `gl.vm.run_nondet_unsafe`, storage types, error taxonomy, cross-contract rules.
- Environment: project venv (Python 3.12.13) with pinned deps from
  `requirements.txt` (genlayer-py 0.18.0, genlayer-test 0.29.2,
  genvm-linter 0.11.1-rc.2); starter cloned from
  genlayer-project-boilerplate and credited.
- Empirical probes (decided M1 architecture):
  1) direct mode allows only ONE contract file per test process
     (`TypeError: only one contract is allowed`),
  2) direct mode rejects cross-contract calls without a simulator hook.
  → four logical components implemented as one deployed contract (rationale in
  docs/architecture.md).

PROOF:
- Starter direct suite green on pinned toolchain: `43 passed in 0.82s`
  (`.venv/bin/python -m pytest tests/direct/ -q`).
- Probe reproductions in `/tmp/opencode/probe/` (see docs/architecture.md).

NEXT: M2 — `contracts/civic_lens.py` CommitmentRegistry section, genvm-lint
clean, direct tests (construction, bounds, validation, subject rule, access
control).

BLOCKED: none.

## Session 2 — 2026-10-14

DONE:
- **M2–M6 complete:** `contracts/civic_lens.py` (~1,100 lines, class
  `CivicLens`, pinned header) with all four logical components: registry +
  immutability/supersede/withdraw, evidence intake (bounded, deduplicated,
  stance never read), consensus review (sanitized LLM parse, prompt-injection
  framing, citation/threshold invariants, equivalence rule), challenge
  (limits counted at open), append-only rounds, deterministic outcome
  derivation. 14 methods (7 views / 7 writes).
- Equivalence design executed with `gl.nondet.web.get` + deterministic
  `_strip_html` (WHY vs `web.render`: mocked responses key on
  `nondet_web_request`); docs/equivalence-design.md updated with evidence.
- Input hardening: `_parse_criteria` accepts JSON string (canonical) or
  pre-decoded list (genlayer CLI coerces `'[...]'` tokens to arrays),
  everything else → stable `EXPECTED` prefix; `_text()` type guard on all
  string params of `create_commitment` / `submit_evidence` / `open_challenge`
  (CLI turns `""` into `0`; raw tracebacks impossible); `deadline`/`note`/
  `target` accept `null`; int criterion ids accepted for challenge targets.
- **M5/M7 deployment (final code):** studionet, contract
  `0x96f373003d958CC11305e4DE970c670d62183F9f`, deploy tx
  `0x5e1ddcfe…57b2063`, schema saved to docs/civic_lens.schema.json (14
  methods), first write `0xf01410df…16ed8ad` (sample commitment, 3 AGREE /
  2 IDLE, execution SUCCESS), evidence write `0x3fbbfdbd…95ee797`,
  read-backs verified, explorer links HTTP-verified (200 on /tx/ /address/,
  404 on unknown routes). Full record: docs/deployment.md.
- Root cleanup: README rewritten per AGENTS §25; CLAUDE.md replaced with a
  correct pointer; deploy/deployScript.ts + .github/workflows/ci.yml
  de-footballed (lint path fixed, `python -m pytest` for imports, frontend
  job added); frontend/.env created with the deployed address.
- Frontend domain layer (M8 foundation): lib/domain/types.ts, copy.ts
  (neutral copy map + loaded-term guard), format.ts (fixed-point milli),
  finality.ts (verified TransactionStatus/TransactionResult/ExecutionResult
  mapping), fixtures.ts (8 sample scenarios, replay-labeled),
  lib/contracts/CivicLens.ts (schema-first service; SDK calls verified in
  genlayer-js 1.1.8 typings).

PROOF:
- Gate 1: `genvm-lint check contracts/civic_lens.py --json` → `ok: true,
  CivicLens, 14 methods` (only I200 newer-runner note).
- Gate 2: `.venv/bin/python -m pytest tests/direct/ -q` → **82 passed in 2.63s**
  (registry, state machine, consensus, outcome derivation, adversarial
  incl. prompt-injection, numeric boundaries, type-guard tests).
- Gate 3: `.venv/bin/gltest tests/integration/test_civic_lens.py --network
  studionet -v` → **10 passed in 447.82s, EXIT=0** (clean full run). An
  earlier run had 2 failures from an HTTP 502 Studio blip; both passed on
  immediate retry (92.71s) — recorded honestly in docs/deployment.md.
- Copy guard: `npx vitest run lib/tests/copy.guard.test.ts` → 12 passed.
- Deployment: explorer links return HTTP 200; read-after-write round trip
  shown above.

NEXT: M8 UI build (delegated, in progress: config/hooks/ledger/pages per
UI-CivicLens.md, football boilerplate removal), then verify gates
(tsc + vitest + next build), evidence pack + screenshots, final report.

BLOCKED: none.

## Session 3 — 2026-10-14 — M8 frontend, rebuilt on Vite

DONE:
- **Framework swap: Next.js → Vite.** `frontend/` rebuilt as Vite 8 + React 19
  + TypeScript. Removed `app/`, `.next/`, `next.config.ts`, `next-env.d.ts`,
  tailwind config, and the football-bets boilerplate (`BetsTable`,
  `Leaderboard`, `CreateBetModal`, `useFootballBets`, `FootballBets.ts`,
  `fees.ts`) — dead code from a different product.
- **Kept and relocated the verified work:** `domain/{types,copy,format,finality,
  fixtures}.ts` and `genlayer/CivicLens.ts` moved from `lib/` to `src/` with
  contents intact. Added a fix in `finality.ts` (below).
- **Typed config** (`config/network.ts`, `contracts.ts`, `explorer.ts`):
  chain identity, contract address + schema-derived method names, explorer URL
  patterns. No scattered literals. Explorer helpers return `null` for anything
  that is not a real hash/address, so no link is ever invented.
- **Service layer** (`services/{types,live,sample,index}.ts`): pages depend on
  an interface, never on genlayer-js. `index.ts` chooses sample vs live from
  one setting (`VITE_CONTRACT_ADDRESS`). **Sample mode has no write path at
  all** — every write control is disabled with a stated reason, so the app can
  never simulate a transaction.
- **12 components** per UI-CivicLens §5: CriterionLedger, ResultChip,
  OutcomePanel, FinalityChip, AttributionBanner, DataModeBadge,
  EvidenceSubmitForm, ChallengePanel, RoundTimeline, TxStatus, CopyField,
  DisabledReason (+ Marks for the four distinct result shapes).
- **8 pages** per §3/§4: Landing, Demo, Commitments, CommitmentNew,
  CommitmentDetail, Rounds, HowItWorks, Fairness. Route-level code splitting.
- **Design system** (`styles/tokens.css` + `app.css`): the §2 palette verbatim,
  Source Serif 4 for quoted documents and Public Sans for interface
  (self-hosted via `@fontsource`, no external font host, no CSP dependency).
  No CSS framework. Contains no warning/danger colour by design. Print
  stylesheet expands every ledger row.
- **`domain/actions.ts`**: one place decides whether an action is enabled and,
  when not, the exact sentence saying why. Mirrors the contract's state machine.
- **Tests rewritten/expanded** (`src/tests/`): `copy.guard`, `CriterionLedger`,
  `txLifecycle`, `actions`, `pages`, `app` — **107 tests**, including a
  whole-app smoke suite that mounts the router at every route.

PROOF:
- Gate 4a: `npx tsc --noEmit` → **clean** (strict, `noUnusedLocals`,
  `verbatimModuleSyntax`).
- Gate 4b: `npx vitest run` → **107 passed / 107**.
- Gate 4c: `npx vite build` → built in 1.13s; entry chunk 228 kB
  (69 kB gzip) after route splitting; no chunk >500 kB warning.
- **Live read path verified against the deployed contract**
  `0x96f373003d958CC11305e4DE970c670d62183F9f` on studionet: all 7 view
  methods return real data (`get_constants`, `get_commitments`,
  `get_commitment`, `get_evidence`, `get_outcome`, `get_rounds`,
  `get_challenges`), and `services/live.ts` `getBundle(1)` assembles a
  complete bundle the commitment page consumes.
- `vite preview` smoke: HTML served, SPA fallback on `/commitments/1` → 200,
  favicon → 200.
- Secret scan of `dist/`: only viem's JSDoc string matches "private key"; no
  key material. `.env` is gitignored; `.env.example` carries no secrets.

BUGS FOUND AND FIXED (by the tests, not by inspection):
1. `finality.ts` `receiptResultName` ignored a **string** `result`, so a
   decided transaction read as "still pending" — and could have shown an
   accepted outcome as neither accepted nor final. Now handles both the
   numeric enum and its name, plus `AGREE`, case/whitespace-normalized.
2. `CriterionLedger` link labels embedded the source filename, producing
   fragile accessible names ("evidence.example.org · report 1 pdf"). Now the
   domain only; the full URL stays in the href and title.
3. The landing page had **no `<h1>`** — a heading-order failure against
   UI-CivicLens §10, caught by the smoke test.
4. `OutcomePanel` rendered "1 required criteria". Fixed pluralization.
5. `services/live.ts` `getBundle` chained five independent reads, so the
   commitment page exceeded a 5s timeout. Now `Promise.all` → ~2.5s.
6. A dead `wallet.isConnected && !x === false && CONFIGURED && false` banner
   was removed rather than shipped: a balance read needs a verified SDK
   method, and inventing one is forbidden by UI-CivicLens §0.1.

HONESTY GUARDS (each has a test):
- `inconclusive` is never styled or worded as failure (copy guard + a pattern
  scan of every main page for score/grade/rank/out-of-100).
- Accepted is never final; only `FINALIZED` renders "Final".
- Every disabled action states its reason in visible text.
- No excerpt renders unless the record supplied one; display-only fetches are
  tagged.
- No invented tx hashes: the contract stores no tx id on an outcome, so
  finality resolves from `?tx=` or a locally-sent transaction, and is
  otherwise "unknown".
- Vitest pins `VITE_CONTRACT_ADDRESS=""`, so the suite can never depend on a
  live deployment.

NEXT: drive the **write** path end to end in a browser against studionet
(register → add evidence → request review → accepted → challenge → round 2),
capture receipts and explorer links, then the evidence pack (screenshots,
recording, README UI section) and the final M8 report.

BLOCKED: none.

## Session 4 — 2026-10-15 — verification pass; three defects found and fixed

DONE:
- **Contrast verified, not assumed.** UI-CivicLens §2.1 says "Meet WCAG AA
  contrast"; that claim had never been checked. Computed every foreground /
  background pair in the palette against WCAG ratios. Added
  `src/tests/contrast.test.ts`, which reads the **real** `tokens.css` and
  asserts 4.5:1 for text, 3:1 for control edges and the focus ring, and that no
  warning/danger colour exists.
- **Responsive verified at 360px.** Wrote `artifacts/capture.mjs` (CDP over a
  raw WebSocket, no new dependency) which sets a true device viewport, asserts
  `scrollWidth === clientWidth` on every route, and captures full-page PNGs.
  Captured all 8 routes at 1280px and 360px, plus a print-to-PDF of the
  commitment page → `artifacts/screenshots/` (17 files).
- **Print view** regenerated with the print stylesheet applied.
- **README "Screens" section** with every screenshot at both widths.

THREE REAL DEFECTS FOUND (none were visible from the source):

1. **WCAG AA failure on hint text.** `--ink-faint: #6B7783` measures **3.94:1**
   on `--microfiche`, below the 4.5:1 AA threshold, and `.hint` /
   `.field__hint` render on the page background. Darkened to `#5F6A75`
   (4.76:1 on `--microfiche`, 5.52:1 on `--sheet`).

2. **WCAG 1.4.11 failure on control edges.** Form inputs used `--rule`
   (#C5CFCD) = **1.59:1** against `--sheet`, far below the required 3:1 for a
   control boundary. Added a separate `--control-rule` token (#788786,
   3.74:1) for inputs only; `--rule` stays for decorative and structural
   dividers, which are exempt — and a test asserts it is NOT promoted to a
   control border by accident.

3. **A misstatement in the outcome copy — the most serious of the three.**
   The panel read *"Based on 1 required criterion: 1 supported, 0 contradicted,
   1 inconclusive"* on the landing sample. But that inconclusive criterion is
   **optional**. The contract's `get_outcome.counts` tallies **every** criterion
   while `required_total` counts only required ones, so pairing them implied an
   optional criterion had fed the decision. `OutcomePanel` now recounts
   required-only client-side when the criteria and results are available, and
   otherwise labels the tally "Across all N criteria". Two tests lock it,
   including one asserting an optional contradiction cannot change the overall
   label.

4. **Page scrolled sideways at 360px** (10px, every route). A 42-character hex
   contract address in the footer `<code>` had no break opportunity. Added
   `overflow-wrap: anywhere` for `code/kbd/samp/pre`. Every route now measures
   `scrollWidth === clientWidth === 360`.

PROOF:
- `npx tsc --noEmit` → clean.
- `npx vitest run` → **135 passed / 135** (was 107).
- `artifacts/capture.mjs` → 16 captures, `cw === sw` on every route at both
  widths, exit 0.
- Live read path confirmed in a real browser: the commitment page renders
  `id 1` from `0x96f373…62183F9f` with both write actions disabled and their
  reasons ("Only the registrant who registered this commitment can request a
  review", "There is no accepted outcome to challenge yet").
- Contract gate unaffected: `genvm-lint check contracts/civic_lens.py --json`
  → `ok: true, CivicLens, 14 methods`.

NOTE ON A FALSE POSITIVE: `google-chrome --headless --screenshot
--window-size=360` crops rather than reflowing, which looks identical to a
responsive bug. `capture.mjs` documents this and uses CDP device emulation
instead. Anyone re-capturing should use the script, not the CLI flag.

NEXT: the write path in a real browser needs a wallet, and the Bradbury/Asimov
deploy (AGENTS M7) needs a faucet claim — both require the user. Everything else
in the UI milestone is complete and evidenced.

BLOCKED:
- Write-path end-to-end run: needs a connected wallet on studionet.
- Bradbury/Asimov deployment: faucet claim is browser-based.
- Rubric Mapping table: AGENTS §22 makes it conditional on published criteria;
  the builder portal exposes none, so it is not written.

## Session 5 — 2026-10-15 — contract hardening from external review

A detailed review of `contracts/civic_lens.py` was supplied. Every claim was
verified against the code before acting; three "verify before trusting" items
turned out to be **already settled** by the saved schema and the passing
integration run, and are recorded as such rather than re-litigated.

VERIFIED-BEFORE-ACTING (not taken on trust):
- `_valid_date("2024-02-30")` → `True`, `_valid_date("2023-02-29")` → `True`,
  `_valid_date("2024-04-31")` → `True`. Confirmed.
- `json.loads('{"x": NaN}')` → `{'x': nan}`; `int(float("inf"))` raises a bare
  `OverflowError`. Confirmed.
- `review_pending` is in `STATUSES` and read in a branch but never assigned.
  Confirmed dead.
- `target` / `new_evidence_ids` are stored and never read by `request_review`.
  Confirmed.
- `DynArray[u32]` as a public parameter: the SAVED schema already records
  `["new_evidence_ids", [{"$rep": "int"}]]`, and gate 3 passed against the
  deployed contract — so this concern is resolved, not open.
- Storage dataclasses built with Python list literals, `gl.message_raw
  ["datetime"]`, `gl.nondet.web.get`, `exec_prompt(response_format="json")`,
  and calling public `create_commitment` from `supersede_commitment` are all
  exercised by the 10 passing integration tests against the live network.

FIXED — no public API change:
1. **`_valid_date` is now a real calendar check** with leap-year logic.
   Previously 2024-02-30 and 2024-04-31 were accepted into a window that
   decides which evidence counts.
2. **`_is_finite_number` / `_is_int` guards** on every numeric input and every
   LLM figure. `NaN`/`Infinity` now yield a stable `EXPECTED`/`LLM_ERROR`
   instead of a raw `OverflowError`.
3. **SSRF denylist** (`_url_is_fetchable`): loopback, RFC1918, link-local,
   CGNAT, `.internal`/`.local`, embedded credentials, non-http(s) schemes —
   applied at submission AND at fetch. Validators were previously steered
   wherever any submitter pointed.
4. **Evidence fences**: documents are wrapped in `<<<EVIDENCE_DOCUMENT id=N>>`
   and any fence-like sequence inside a document is neutralised, so a hostile
   document can no longer close its own block.
5. **Out-of-window evidence is excluded from the prompt text** entirely, not
   just listed as uncitable.
6. **`unit_hint` deleted.** It told the model to use the FIRST threshold
   criterion's unit for every numeric criterion. Each criterion line now
   carries its own unit and the prompt says so.
7. **`review_incomplete` reason added.** Model failures (missing criterion,
   unknown enum) were reported as `criterion_ambiguous`, which told a reader
   their criterion's wording was unclear when the review had simply glitched —
   a false criticism of the subject.
8. **Numeric verdicts derived in code.** The model extracts the figure; the
   arithmetic supplies the status. A single inconsistent verdict no longer
   fails the whole review with `LLM_ERROR` — it is corrected. An inconclusive
   verdict is deliberately NOT promoted from a figure (a wrong promotion
   manufactures a finding; a lost promotion stays honestly inconclusive).
9. **Content pipeline**: HTML chrome dropped (nav/header/footer/aside/form/
   svg/iframe/script/style/noscript/button/select), budget raised to 6 000
   chars from 1 500, and **keyword-directed passage selection** replaces
   head-truncation, so figures deep in a report are visible.
10. **Binary detection**: PDF/zip/gzip magic numbers and >5% control characters
    map to `evidence_unavailable` instead of feeding byte soup to the model.
11. **Dead code removed**: `update_criteria` (which could only ever revert) is
    gone, so the contract is now **13 methods**. Frontend service, schema
    constants, tests and docs updated to match.
12. **`_figures_close` comment corrected** — it claimed a 10 milli floor that
    the code never had.

NEW TESTS: `tests/direct/test_hardening.py` (28 cases) covering the calendar,
finite-number guards, SSRF allow/deny lists, fence neutralisation, binary
detection, and passage-selection determinism. It loads the REAL contract source
with a temporary `genlayer` stub that is installed and then restored — a
permanent `sys.modules` entry shadowed the real SDK for every other test module
(caught: 67 spurious failures) and is now scoped to a context manager.

BUG FOUND IN MY OWN NEW CODE: the first version of `_select_passages` appended
chunks until the budget overflowed and then trimmed in document order, which
dropped the highest-scoring chunk whenever a later one overflowed — returning
pure filler. Caught by the determinism test. Fixed to test fit before appending.

PROOF:
- Gate 1: `genvm-lint check contracts/civic_lens.py --json` → `ok: true`,
  `CivicLens, 13 methods` (7 views / 6 writes).
- Gate 2: `pytest tests/direct/ -q` → **113 passed** (was 85).
- Gate 4: frontend `tsc --noEmit` clean; `vitest run` → **135 passed**.
- Gate 3 (integration) NOT re-run: it needs studionet and takes ~7 minutes,
  and the changed prompt text means its LLM mocks would need re-checking. It
  was last green at 10 passed on the pre-hardening build.

STILL OPEN — all require a public API change and therefore a redeploy:
- **Must fix #1 `evidence_cutoff`**: separating "period the commitment covers"
  from "latest publish date accepted". Highest value of the open items: most
  real reports are published AFTER the period they describe, so today they are
  ineligible and produce false `inconclusive`.
- **Must fix #2** LLM-extracted publication date, with validators agreeing on
  it, so eligibility stops trusting a self-declared (or omitted) date.
- **Must fix #3** `summary` is stored on-chain with no consensus check; free
  text from a model that may have read an injected document is a fairness risk.
- **Must fix #4** review triggering: registrant-only, runnable before the
  period ends (burning one of 3 rounds), no `pending` state.
- **Must fix #6/#7** evidence-slot griefing; `subject_address` and a reserved
  challenge slot for the subject.
- **Should fix** `superseded_by` in the view, so the UI can show a version
  chain and criteria-shopping via supersede is visible.

NEXT: decide on the API-changing batch above. It invalidates the deployed
address `0x96f373…62183F9f`, requires a fresh `genlayer deploy` +
`genlayer schema`, and a matching frontend update.

## Session 6 — 2026-10-15 — second external review: challenge flow, retrieval status, SSRF breadth

A second review of `contracts/civic_lens.py` was supplied. Each finding was
checked against the code first; the two P0s were real, and are fixed here.

DONE (P0):
1. **Challenges now reach the review.** `open_challenge` stored `target`,
   `grounds` and `new_evidence_ids`, but `_build_payload`/`_build_prompt`
   never read them — a recorded challenge could not influence the round it
   opened. The payload now carries the open challenge and the prompt (a)
   states the round was challenge-triggered, (b) names the disputed criterion
   or the whole outcome, (c) fences the **grounds as DATA and labels them a
   claim, not evidence**, and (d) marks the attached evidence as NEW EVIDENCE.
   The prompt explicitly says a challenge by itself does not change a verdict.
2. **Per-source retrieval status is tracked and persisted.** `_fetch_texts`
   collapsed every failure to an empty string. `_fetch_document` now returns a
   status (`fetched`/`unreachable`/`http_error`/`blocked`/`unsupported_format`/
   `empty`); a new `RetrievalRecord` is stored on every `RoundRecord`; the
   prompt shows the status so an unreadable source is never read as evidence;
   and `get_rounds` exposes it. Retrieval status is deliberately NOT a
   consensus field (the network differs between nodes; equivalence is judged
   on verdicts) — it is taken from the leader that achieved consensus.

DONE (P1):
3. **SSRF screening breadth.** The host check now parses decimal/octal/hex
   IPv4 integer forms (`2130706433`, `0x7f.0.0.1`, `0177.0.0.1`, `127.1`),
   expands IPv6 with `::`, folds embedded IPv4 (mapped `::ffff:7f00:1` and
   compatible `::7f00:1`) into the range check, and blocks ULA `fc00::/7` and
   link-local `fe80::/10`. The authority parser now rejects embedded
   credentials, malformed/oversized ports and stray colons instead of falling
   back to a fetch. Statement links are screened at registration too.
4. **Provenance surfaced.** `get_evidence` adds `published_date_verified:
   false` (a declared date is not a proven one); `get_rounds` adds the
   retrieval roster and the round's `data_mode`.
5. **Field semantics stated and tested.** `get_constants` returns
   `date_semantics` (ISO calendar dates, date-only; timezone does not shift
   the window), `threshold_semantics` (fixed-point milli-units, gte/lte
   inclusive) and `data_mode_semantics` (provenance label only; does not change
   behavior, so a sample run exercises the live code path).

Honest limitation kept: the SSRF check is string-level and cannot see through
DNS resolution or an HTTP redirect to an internal host — stated in the code,
`docs/equivalence-design.md` and the README, not claimed as solved.

NEW TESTS: `tests/direct/test_retrieval_and_challenge.py` (12 cases) —
challenge grounds/new-evidence reach the prompt, whole-outcome challenge, a
challenge alone cannot flip a verdict, retrieval statuses recorded per source,
partial failure recorded and not contradiction, all-sources-dead records
nothing, statement retrieval, unverified-date label, round data_mode, constants
semantics, blocked statement rejected. `test_hardening.py` gained encoded-IP and
malformed-authority cases (now 20 blocked / 7 allowed URLs plus host-parser
units).

PROOF:
- Gate 1: `genvm-lint check contracts/civic_lens.py --json` → `ok: true`,
  `CivicLens, 13 methods` (7 views / 6 writes).
- Gate 2: `pytest tests/direct/ -q` → **147 passed** (was 113).
- Gate 3: `.venv/bin/gltest tests/integration/test_civic_lens.py --network
  studionet -q` → **8 passed, 2 failed, 339.71s**. Both failures were
  `DeploymentError ... 502: Bad gateway` from the Studio API during
  `eth_estimateGas` (infrastructure, not the contract); retried individually →
  **2 passed in 91.05s**, so the suite is **10/10** with the same transient
  502 pattern recorded in Session 2. The challenge round and prompt-keyed
  `Criteria:` mocks are unchanged and pass against the live network.

NEXT: redeploy (the new storage fields require a fresh `genlayer deploy` +
`genlayer schema`) and update the frontend `RoundRecord`/`EvidenceItem` types
with `retrieval`, `data_mode` and `published_date_verified`.

BLOCKED: a redeploy needs a funded account if targeting Bradbury/Asimov; the
new storage fields invalidate the currently deployed address.

## Session 7 — 2026-10-15 — real data on chain; four defects found by running it

DONE:
- **Deployed the current contract and populated it with real, working data.** The
  previous deployment was the pre-hardening 14-method build (its `get_evidence`
  returned no `declared_source_class`), so the app was reading a contract that
  predated the whole session. Redeployed and drove real transactions from the CLI:
  four commitments, all reviewed by real consensus against real public WHO fact
  sheets. Deployment `0x07d77BF87b8c76A0d6A6F925bAA18cae2f098B12`, deploy tx
  `0x0cf870f5…19e4a`. Full record in docs/deployment.md.
- **Four contract/UI defects found ONLY by running against real pages.** None were
  visible to any test, because every test used fixture bodies without entities and
  a single fixed figure.
  1. `_strip_html` never decoded HTML entities. WHO's page says `4.2&nbsp;million`;
     the model quotes "4.2 million"; the stored text contained `&nbsp;`, so the
     verbatim-quote check failed and CORRECT numeric findings were demoted to
     `figure_unverified`. Added `_decode_entities` (two passes, fixed table,
     numeric refs), wired into `_strip_html` after tag removal and before
     whitespace collapsing.
  2. My own prompt's worked examples (`'4.2 million' -> 4200000`) told the model
     to ignore the criterion's unit, so the ledger displayed **"4200 million
     deaths"** for a figure of 4.2 million. The numeric prompt block now prints
     each criterion's unit and threshold and states the unit arithmetic
     explicitly ("4.2 in that unit, so figure_milli is 4200 — NOT 4200000").
  3. `str(frac).rstrip("0")` rendered 4050 milli as `4.5` instead of `4.05`
     (no zero-padding). Fixed in both places it appeared, added `_milli_text`,
     and documented the padding rule so a third occurrence is less likely.
  4. `.sr-only` was `position:absolute; white-space:nowrap` with no inset. Inside
     a horizontally scrolled data table it anchored far to the right and — being
     absolutely positioned — was not clipped by the scroll container, silently
     widening the page from 360px to 385px. Fixed with `left/top: 0` and
     `clip-path`. Also fixed `.table-wrap`, whose `overflow-x:auto` never engaged
     because a flex child defaults to `min-width:auto`.
- **Figure verification extended to scale words.** A report saying "4.2 million"
     and a criterion carrying 4,200,000 milli-units describe the same measurement;
     without /1e3, /1e6 and /1e9 renderings every large-magnitude numeric
     criterion demoted to `figure_unverified` for a cosmetic reason.
- **Bundled demo rebuilt on real data, split by provenance.** Four records are now
     faithful replays of recorded on-chain rounds (real subject, real document,
     real verdict, creating tx linked). Four remain authored illustrations for edge
     cases no real run produced; those use fictional subjects and `sample://`
     references that render as plain text and are never clickable, because a
     link to a document nobody read is a fake citation.
- New tooling: `scripts/save-schema.mjs` (regenerates the schema and FAILS if
  `frontend/src/config/contracts.ts` drifts from the deployed method names),
  `scripts/dump-chain.mjs` (dumps live state as JSON for faithful replays).
- **`gltest` was silently deleting the committed evidence pack.** Its pytest
  plugin calls `shutil.rmtree()` on the configured artifacts directory at every
  session start, and `gltest.config.yaml` left that at the default `artifacts/` —
  the same path as the screenshots. An integration run wiped 17 committed files
  and it looked like a git problem. Pointed `paths.artifacts` at
  `.gltest-artifacts`, added it to `.gitignore`, and re-ran the suite to confirm
  the screenshots survive a full session (they do).

PROOF:
```
genvm-lint    contracts/civic_lens.py -> ok (13 methods: 7 views, 6 writes)
direct        pytest tests/direct/ -q  -> 184 passed
integration   gltest --network studionet -> 10 passed in 433.82s
frontend      vitest run -> 272 passed (28 files) · tsc --noEmit clean · vite build ok
responsive    11/11 routes: scrollWidth == clientWidth == 360 (no overflow)
```
- The four defects each carry a regression test: entity decoding (12 cases),
  figure verification (18 cases incl. scale words and the `4.05` remainder),
  `_milli_text` (6 cases), and the layout check is enforced by
  `artifacts/capture.mjs`, which fails the run on horizontal overflow.
- Live outcomes: #1 `supported` with `figure_milli: 4200`, `figure_verified: true`;
  #2 `supported` while a PDF recorded `unsupported_format` and a dead link
  `http_error`; #3 `supported`; #4 `supported` after a real challenge round that
  considered new evidence and kept the prior finding.
- Screenshots recaptured at 1280px and 360px from the live deployment.

NEXT:
- Drive the frontend write path from a connected browser wallet (all six write
  methods are proven from the CLI, not the browser).
- Bradbury/Asimov deployment (M7) — the faucet claim is browser-based, so it needs
  the user.

BLOCKED:
- Nothing on the critical path. Standing design gaps, unchanged and still open:
  `request_review` is registrant-only and may be called before the evaluation
  period ends; evidence-slot griefing remains (`MAX_ROUNDS` x
  `MAX_EVIDENCE_PER_SUBMITTER` can exceed `MAX_EVIDENCE`); there is no
  `subject_address`; and the `reconsidered` invariant still hard-fails a challenge
  round if the model omits that one flag.

NOTE (challenge semantics changed):
- `test_challenge_round_changes_outcome` could no longer pass as written. It opened
  a challenge with NO new evidence and expected the next round to flip the
  finding; the contract forbids exactly that (grounds are a claim, not evidence).
  The test now attaches the new evidence id and sets `reconsidered=True`. Worth
  confirming this is the intended product rule: a challenger who attaches nothing
  pays for a round and sees nothing move.


## Session 8 — 2026-10-19 — header layout; the deployed site 404'd on every deep link

DONE:
- Header restructured to what the reader asked for: appearance control moved
  left to sit before the navigation, all seven destinations inline with the
  `More` disclosure deleted (`NavMenu` removed rather than left as dead code),
  language kept in the header on the right. Commits `0bfe58a`, `a0aa6e7`.
- `ThemeSelect` (a three-option `<select>`) replaced by `ThemeToggle`, an icon
  plus the value in words: a cycle cannot be read off an icon, and the
  documented reason for the old `<select>` was exactly that an icon cannot say
  "System". Superseded file deleted.
- `AccountPill` groups the address, its copy button, and Disconnect into one
  control; no balance is shown, because reading one needs a verified SDK method
  this build does not have and StudioNet is gasless (0 GEN is expected, never
  warned about).
- **Every deep link was 404 on the Vercel deployment.** The app uses
  `BrowserRouter`, so `/activity` and friends exist only on the client; the host
  answered them with its own 404 and the app never loaded to take over. Fixed
  with an SPA rewrite in `vercel.json` and `frontend/vercel.json` (the project's
  Root Directory is `frontend`, so that one is active; both are kept because the
  setting lives in the dashboard, not the repo). Root cause and the trade-off
  are documented in `docs/deployment.md`.
- **The header scrolled horizontally at 360px on every route** (921px of content
  in a 360px viewport). A "Desktop overrides for the one-line header" section
  had been pasted inside the `@media (max-width: 560px)` block, where it came
  after the mobile wrap rules and cancelled them. Moved out; also stopped hiding
  the language control at mobile widths, which made four translations
  unreachable on a phone.

PROOF:
- `frontend/src/tests/`: `325 passed` (31 files); `tsc --noEmit` clean;
  `vite build` ok.
- `node artifacts/capture.mjs`: all 8 routes x 2 viewports, no horizontal
  overflow; the screenshots in `artifacts/screenshots/` are regenerated from
  this build.
- Production, verified after deploy: `/`, `/activity`, `/demo`, `/commitments`,
  `/fairness`, `/stats`, `/status`, `/how-it-works`, `/commitments/1` all `200`;
  `/assets/index-*.js` still served as JavaScript; `docScrollWidth == 360` at a
  360px viewport on `/`, `/activity`, `/commitments/1`.

NOTE (a real false-green found and removed):
- The first `NavMenu` used `<details><summary>`. jsdom does not implement
  summary click-toggling, so the Escape test passed *vacuously* — the panel had
  never opened. Replaced with a controlled `aria-expanded` button, whose open
  state a test can actually drive, and which states the same thing to assistive
  technology.

NEXT:
- Contract item 4: `request_review` period gate (`today_utc > period_end`) and
  permissionless, so an observer can force a review the registrant never asks
  for.
- Contract item 7: the `reconsidered` invariant should degrade the affected
  criterion to `inconclusive` with its own reason code instead of hard-failing
  the whole round.
- Drive the frontend write path from a connected browser wallet.

BLOCKED:
- Nothing on the critical path. Two sessions were editing this repo at once, so
  a full-suite run can fail while the other session writes files mid-transform
  (observed twice; both times green on re-run and green in isolation).
- Left untouched on purpose, being another session's work: `frontend/src/config/
  indexer.ts`, `artifacts/logo-512.png`, and `frontend/src/styles/app.test.css`
  — an unimported scratch file whose only content asserts
  `flex-wrap: nowrap`, which is the exact rule that caused the 360px overflow.
  It should be deleted rather than kept.

## Session 9 — 2026-10-19 — registering in the browser: the wallet was never asked

DONE:
- **Every write from the browser failed with "No account set. Configure the client
  with an account or pass an account to this function."** — while the header showed
  a connected wallet. Root cause: `LiveService` built its SDK client as
  `new CivicLens(CONTRACT_ADDRESS, undefined, RPC_URL)`. genlayer-js binds the
  signing account when a client is *built*, so the account was permanently absent;
  the SDK refused before the wallet was ever consulted. Reads were unaffected,
  which is why it looked like a consensus problem rather than a wiring one.
  The address is now handed to the SDK per write, from the account the wallet
  reports, and re-read each time so switching accounts cannot sign from the old one.
- **The failure was also mislabeled.** Any thrown write was reported as
  "Didn't complete: validators disagreed with the proposal." Nothing had been sent,
  so no validator had seen it; that copy is only correct for a receipt carrying
  MAJORITY_DISAGREE. A write that never left the browser now reports a distinct
  `not_sent` phase: "Not sent: this never reached the network, so no validators saw
  it." The two paths stay apart in both directions (tested).
- "Check again" is no longer offered after a write that was never sent — there is
  nothing on-chain to check, and the button implied otherwise.
- The write methods are declared `async` so a refusal always produces a rejected
  promise. They previously threw synchronously from a method typed `Promise<TxHash>`
  (found by the new test, not by inspection).

PROOF:
- New `frontend/src/tests/liveWrites.test.ts` (5 tests): a write with no account
  refuses in plain words without calling the SDK; a write with an account hands that
  account to the SDK; a second write after an account switch uses the new one; reads
  keep working with no account.
- `txLifecycle.test.tsx`: one test rewritten and one added, pinning that a thrown
  write is `not_sent` and a MAJORITY_DISAGREE receipt is still `rejected`.
- **End-to-end in a real browser** against a stub EIP-1193 provider (the same
  surface a wallet extension exposes), on a build with the contract address inlined:
  filling the register form and submitting called `eth_sendTransaction` with
  `from = 0x5b3661c576c7001e6d6279c67f3779705d334c89`, and the page moved to
  "Validators are reviewing". Before the fix this same flow never reached the wallet.
- Same run with the stub refusing the send (the user-declined case) shows
  "Not sent: this never reached the network, so no validators saw it." and no hash —
  the honest label, not a validator verdict.
- Gates: `tsc --noEmit` clean, `331 passed` (32 files), `vite build` ok.
- Re-verified in genlayer-js 1.1.8 source that a wallet write only routes to the
  provider when the account is an *address*, not an object (`isAddress = typeof
  config.account !== "object"`); an object sends the call to the RPC instead, which
  answers "Method not found: eth_sendTransaction".

NEXT:
- Drive the remaining five writes (evidence, review request, challenge, withdraw,
  supersede) through the same browser harness.
- Contract items 4 and 7, still open.

BLOCKED:
- Nothing. The stub-wallet harness proves the browser path but cannot sign; a real
  wallet is still needed to put a commitment on chain, and that is the user's step.
