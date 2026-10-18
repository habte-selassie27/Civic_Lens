# CivicLens read indexer

Polls the deployed contract's read views into SQLite and serves them over a
small read-only HTTP API, so search and stats can cover the whole registry
and say truthfully when they were last updated.

## Why an indexer

The contract's list view (`get_commitments(page_size, before_id)`) pages
newest-first and takes no filter arguments; there is no cheap storage
iteration behind a status or subject cursor. Two things follow:

- Browse search and filtering could only ever cover the contract's largest
  page (20 records) — the UI said so, because anything else would be fiction.
- The stats page could only count that window, so no network-wide total could
  be claimed.

The indexer does the filtering and counting off-chain in SQLite. It changes no
contract state, adds no method, and needs no redeploy. (Contract-level
filtering remains a possible future change; the indexer does not depend on
it.)

## Honesty rules it keeps

- Every response carries `indexed_at`, so the UI can label freshness instead
  of presenting a cache as a live read.
- A record whose **outcome** read fails is stored as `outcome_known = 0` and
  counted as "unread" — never as "no outcome", never as inconclusive.
- A record whose **detail** read fails keeps its previous row; if it never had
  one, it simply does not appear. Unlisted beats invented.
- Pointing the indexer at a different contract address wipes the previous
  registry before indexing, so two chains' evidence can never mix under one
  search box.
- `inconclusive` is counted as its own outcome, exactly as on every record.

## Run it

Requires Node >= 22.5 (uses the built-in `node:sqlite`). `genlayer-js` comes
from the repository root install:

```bash
npm install                     # at the repository root
cd indexer
node index.mjs --address 0xA8cc5b18C4ED3b3F5122bE02c972C17f224b27d6
```

Options: `--port` (default 4111), `--interval` seconds (default 60),
`--db <path>` (default `indexer/data/civic-lens.db`), `--allow-origin`
(default `*`, the data is public and the API is read-only), `--once` (one pass,
no server), `--help`. The address can also come from `CONTRACT_ADDRESS`.

Tests use only Node's built-in runner and never touch the network:

```bash
cd indexer && npm test           # node --test
```

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | liveness, contract, last index time |
| `GET /api/meta` | contract, chain, `last_indexed_at`, last run status, record count |
| `GET /api/commitments` | `?q=&status=&role=&mode=&outcome=&sort=&limit=&offset=` → `{ rows, total, indexed_at, contract }` |
| `GET /api/stats` | `{ stats, indexed_at, record_count, contract }` — `stats` has the same shape as the frontend's `PlatformStats` |

`sort` ∈ `newest`, `ending_soonest`, `most_reviewed`, `most_sources`;
`outcome` ∈ `supported`, `contradicted`, `inconclusive`, `none`. Search
matches subject, commitment text, and criterion text. Bad parameters are a
400 with a message; writes are a 405.

## Wiring it into the app

Set `VITE_INDEXER_URL=http://localhost:4111` in `frontend/.env` (never
committed). With it unset the app never contacts an index. See
`frontend/.env.example`.

## Limits, stated plainly

- Linear `LIKE` search — fine at thousands of rows, not a search engine.
- Polls every record each pass (a few reads per record). A registry of
  thousands would need incremental updates.
- Not a mirror of the whole record: per-criterion results, rounds, and
  challenges are fetched live on the record page, as before. The index serves
  search, filters, and counts.
