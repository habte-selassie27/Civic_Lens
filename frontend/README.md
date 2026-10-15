# CivicLens frontend

Vite + React + TypeScript. The app implements [`UI-CivicLens.md`](../UI-CivicLens.md).

## Setup

```bash
# from the repository root (npm workspaces)
npm install

cp frontend/.env.example frontend/.env
# then set VITE_CONTRACT_ADDRESS to your deployed CivicLens contract
```

## Run

```bash
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build to frontend/dist
npm run preview   # serve the production build
npm test          # vitest
npm run typecheck # tsc --noEmit
```

## Running with or without a contract address

The app picks its data source from **one** setting, and the UI labels itself
accordingly. There is no query parameter or toggle that can make sample data
look live.

| `VITE_CONTRACT_ADDRESS` | What happens |
|---|---|
| unset (or a placeholder) | The app serves the eight bundled sample scenarios. Every commitment surface is badged **Sample data**, a blocking banner explains why, and **every write control is disabled with a reason**. There is deliberately no write path — the app never simulates a transaction it did not send. |
| a deployed `0x…` address | Reads go to the contract. The badge reads **Live evidence** and writes become available. |

## Architecture

```
src/
  config/      network.ts · contracts.ts · explorer.ts   typed config, no scattered literals
  domain/      types · copy · format · finality · fixtures · actions
  genlayer/    CivicLens.ts (the only genlayer-js caller) · client · WalletProvider
  services/    types · live · sample · index (sample-vs-live switch)
  hooks/       useReads · useTxLifecycle · useFinality
  components/  CriterionLedger · ResultChip · OutcomePanel · FinalityChip · AttributionBanner
               DataModeBadge · EvidenceSubmitForm · ChallengePanel · RoundTimeline
               TxStatus · CopyField · DisabledReason · Marks · Masthead · Chrome
  pages/       Landing · Demo · Commitments · CommitmentNew · CommitmentDetail · Rounds
               HowItWorks · Fairness
  styles/      tokens.css (UI-CivicLens §2 palette + type) · app.css
  tests/       copy.guard · CriterionLedger · txLifecycle · actions · pages · app
```

Dependency direction is one-way: **pages → hooks → services → genlayer**.
Components never import `genlayer-js`.

## Rules the code enforces

These are not conventions; each has a test that fails if it regresses.

- **`inconclusive` is never failure.** No red, no error styling, no score. Guarded
  by `copy.guard.test.ts` and by a pattern scan of every main page in
  `app.test.tsx`.
- **Accepted is never final.** `finality.ts` maps a receipt to a phase, and
  only `FINALIZED` becomes "Final".
- **Reads and writes look different.** Reads go skeleton → data; only writes
  render `TxStatus`.
- **Every disabled action says why** in visible text (`domain/actions.ts`).
- **No excerpt the record does not contain.** Excerpts are passed in and tagged
  `evaluated` or `display-only`.
- **Explorer links are never invented.** `config/explorer.ts` returns `null`
  for anything that does not match a real hash or address.
- **No invented transaction hashes.** The contract does not store the tx that
  produced an outcome, so finality is resolved from a `?tx=` parameter or from a
  transaction this browser sent — and otherwise renders as unknown.

## Styling

No CSS framework. `styles/tokens.css` holds the palette and type scale from
`UI-CivicLens` §2 and contains no warning or danger colour. Components are
plain CSS classes; the design system lives in `styles/app.css` with a print
stylesheet at the end.

Fonts are self-hosted via `@fontsource` (Source Serif 4 for quoted documents,
Public Sans for interface), so there is no external font host and no CSP
dependency.

## Known gaps

- No deployed address yet (`README.md` "Deployment" is `TBD-FINAL-DEPLOY`), so
  the live read and write paths have not been exercised against a real
  deployment. Set `VITE_CONTRACT_ADDRESS` and re-run the smoke path.
- The account-balance read needed for a proper "unfunded account" banner is not
  implemented: no verified SDK method for it was available, and inventing one
  would violate `UI-CivicLens` §0.1. StudioNet is gasless, so this does not
  affect the current target network.