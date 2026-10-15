# CLAUDE.md

Guidance for Claude Code (and any coding agent) working in this repository.

**Precedence:** official GenLayer docs > [`AGENTS.md`](AGENTS.md) (project rules — read it first) > [`UI-CivicLens.md`](UI-CivicLens.md) (frontend spec) > this file. Never guess a GenLayer API; verify against https://docs.genlayer.com/full-documentation.txt or the SDK reference.

## What this project is

**CivicLens** — a public-commitment verification platform on GenLayer. One
intelligent contract (`contracts/civic_lens.py`, class `CivicLens`) registers
commitments with measurable criteria, takes public evidence, runs one
non-deterministic consensus review per criterion, and derives the overall
outcome in deterministic code. `inconclusive` is never treated as failure.

## Quick commands

```bash
# Lint (gate 1)
.venv/bin/genvm-lint check contracts/civic_lens.py --json

# Direct tests, mocked web + LLM (gate 2) — must run as a module from the repo root
.venv/bin/python -m pytest tests/direct/ -q

# Integration tests on studionet (gate 3, ~8 min)
.venv/bin/gltest tests/integration/test_civic_lens.py --network studionet -v

# Deploy / schema / calls
genlayer network list                      # * should be studionet
genlayer deploy --contract contracts/civic_lens.py
genlayer schema <address>
genlayer call <address> get_constants
genlayer write <address> <method> --args ...

# Frontend (npm workspaces — install from the repo root)
npm install
npm run dev                                # http://localhost:5173
cd frontend && npm run lint && npm test    # tsc + vitest
```

Gate order is lint → direct → integration → deploy. Never claim done before
the required gates pass; paste real output.

## Layout

```
contracts/civic_lens.py     the single deployed contract
tests/direct/               fast tests, web/LLM mocked (82 tests)
tests/integration/          full consensus tests against studionet (10 tests)
docs/                       architecture, equivalence design, state diagram,
                            fairness, source guidance, schema, deployment record
frontend/                   Vite + React 19 + TypeScript (src/)
frontend/src/domain/        types, neutral copy map (+ loaded-term guard test),
                            fixtures (8 sample scenarios), finality, format,
                            actions (state-machine gating)
frontend/src/services/      the only layer that talks to genlayer-js; sample
                            vs live chosen by one env setting
```

## Hard rules (from AGENTS.md)

- Overall outcome is derived in code; the LLM judges criteria only.
- Absence of evidence → `inconclusive`, never `contradicted`.
- Neutral outcome vocabulary only: Evidence supports / Evidence contradicts / Inconclusive.
- Sample data is always labeled; never present sample outcomes as findings about real entities.
- Storage uses GenLayer types (no raw dict/list), sized integers, no floats.
- Pinned `Depends` header; deterministic `EXPECTED:`-prefixed errors; no secrets.
