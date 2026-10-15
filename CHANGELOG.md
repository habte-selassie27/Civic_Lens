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
