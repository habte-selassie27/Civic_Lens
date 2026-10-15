# Deployment record — CivicLens

All values below were captured from real CLI output on the dates shown. Nothing
is copied from a template; explorer links use the verified
`explorer-studio.genlayer.com/tx|address/<hash>` patterns (HTTP-verified).

## Current deployment

```
NETWORK:          studionet (GenLayer Studio, chain id 61999, RPC https://studio.genlayer.com/api)
ACCOUNT:          Studio web UI — manual contract import by the builder (browser wallet).
                  The CLI account rabby (0x5b3661c576c7001e6d6279c67f3779705d334c89)
                  verified reads against this address afterwards.
CONTRACT FILE:    contracts/civic_lens.py (class CivicLens, pinned Depends header)
CONTRACT ADDRESS: 0xA8cc5b18C4ED3b3F5122bE02c972C17f224b27d6
DEPLOY TX HASH:   not captured — the deployment was made through the Studio web UI
                  (import link below), which does not surface the tx hash to the CLI.
                  The explorer address page is the on-chain record; nothing is guessed here.
STUDIO IMPORT:    https://studio.genlayer.com/?import-contract=0xA8cc5b18C4ED3b3F5122bE02c972C17f224b27d6
ADDRESS LINK:     https://explorer-studio.genlayer.com/address/0xA8cc5b18C4ED3b3F5122bE02c972C17f224b27d6
                  (HTTP 200 verified 2026-10-15)
SCHEMA SAVED AT:  docs/civic_lens.schema.json (13 methods: 7 views, 6 writes)
                  regenerate with: node scripts/save-schema.mjs 0xA8cc5b18C4ED3b3F5122bE02c972C17f224b27d6
                  (the script also fails if src/config/contracts.ts drifts from the
                  deployed method names; run 2026-10-15: all 13 match)
VERIFIED:         2026-10-15 via CLI: get_constants returns the hardened shape
                  (retrieval_statuses, max_quote_len 300, the semantics strings);
                  get_commitments succeeds.
STATE:            populated — the four live consensus-reviewed commitments were
                  re-registered on this address on 2026-10-15 and re-reviewed by
                  real consensus (see "Live data" below). Field-by-field diff
                  against the 0x07d77B records: identical.
DATE:             2026-10-15
```

## Live data on this deployment

The four records below were originally populated on `0x07d77BF87b8c76A0d6A6F925bAA18cae2f098B12`
(superseded in the table at the bottom of this file). After the manual Studio
deployment above, they were **re-registered here on 2026-10-15** from a structured
dump of the old records (`scripts/dump-chain.mjs`) and re-reviewed by real
consensus against the same live public pages. A field-by-field comparison of the
two dumps (subject, criteria, evidence urls/types/dates, per-round outcomes,
retrieval statuses, challenge target and new-evidence ids) found no differences.

The four records below, all `data_mode: "live"`, were reviewed by real consensus
against **real public documents**. Subjects are real public institutions; every
evidence URL was verified to return HTTP 200 with text a validator can read.
Criteria ask only *what a published document states* — never about conduct or
character — and the registrant role is `observer`, a third-party record. The
subject organization has not verified or endorsed these entries, and the UI says
so on every commitment page (docs/fairness.md).

| Id | Subject | Evidence | Rounds | Outcome | Why it is here |
|---|---|---|---|---|---|
| 1 | World Health Organization | 1 | 1 | `supported` / `all_required_supported` | Numeric criterion with a **verified figure**: criterion 2 carries unit `million_deaths` and threshold `4000` (at least 4.000 million), the review extracted `4200` (4.2 million premature deaths), found a verbatim passage containing it, and recorded `figure_verified: true` |
| 2 | World Health Organization | 3 | 1 | `supported` / `all_required_supported` | Two of the three sources could not be read: a PDF recorded `unsupported_format`, a dead link `http_error`. Neither was used as evidence in either direction |
| 3 | World Health Organization | 1 | 1 | `supported` / `all_required_supported` | Narrative support with a quoted passage |
| 4 | World Health Organization | 2 | 2 | `supported` / `all_required_supported` | A real **challenge round**: round 2 re-reviewed after a challenge attached new evidence, recorded it as *considered but not cited*, and kept the prior finding |

Per-criterion results, quotes, figures and per-source retrieval status for all
four are readable with `genlayer call <address> get_rounds --args <id>`.

### Re-registration transaction hashes (2026-10-15, contract `0xA8cc5b18…27d6`)

All captured from real `genlayer write` output; every write reached
`status_name ACCEPTED` / `result_name MAJORITY_AGREE`.

```
commitment 1  create_commitment  0xa897676c7d62b445c31bd0fb8bcb986f0963e4dd13d6a8f6b3eb9c2dd7c5df5a  ACCEPTED
commitment 2  create_commitment  0xa608d7febb17c154723ff318764036c63e8f080a83d0a59efa005a983a00eb79  ACCEPTED
commitment 3  create_commitment  0xd510c007444c5f4c705b014cd98b6b3c90432a85cfb1dc7b1ae3f8bd6ad73e9e  ACCEPTED
commitment 4  create_commitment  0x874f56380be9f19c647af3869d29996a799cf2224eb8e2a570ae185c8f40bf16  ACCEPTED
evidence   1  submit_evidence    0x069d6491d3417d9d47e3d4c741e258b37ce709c11f75926554d64d0e9a798ed7  ACCEPTED
evidence   2  submit_evidence    0xc5f5715eb82f4163b34ef908b0bdbaf79392ae797a5675b2b832575bb457e955  ACCEPTED
evidence   3  submit_evidence    0x9764628cb7118f7f1d1c5878b64456bc0d7087fb52999183658e8711ab646a21  ACCEPTED
evidence   4  submit_evidence    0x353f330e0080b416b03060fbb71cfaf1f363f962c5a2b41ebcbb43b91397cbab  ACCEPTED
evidence   5  submit_evidence    0x367feec6c40daeb2d6321c0d4efd527f5d6802bf94421a360aea222530cfda4b  ACCEPTED
evidence   6  submit_evidence    0x83abe8ffa0039398599a85b1031c5256939b3c6714180656b0bf666bb13aeeb9  ACCEPTED
commitment 1  request_review     0x3e697b380e15d8241aa84847222231267531ce773797407349431e2e4ed87a5b  ACCEPTED (round 1)
commitment 2  request_review     0x39fd7a1277f924acc2dc22b3469c3b17d0296ce1823a5518fc7bf397195bc1eb  ACCEPTED (round 1)
commitment 3  request_review     0x91877721dd5d8b33199f41c304a1ab5b224130f4ef7d57725332bda5a6f9940f  ACCEPTED (round 1)
commitment 4  request_review     0xdab9cdc1389b3065170bac9fb174cb7a6c9443387ca4836fd52d56e444e58d71  ACCEPTED (round 1)
evidence   7  submit_evidence    0x34212d6fee00c2d9879eeed96890bacafde02ec6b8a50393462cf077f5544557  ACCEPTED (challenge evidence)
commitment 4  open_challenge     0x961ced200b6042c1d611faf1b3608ccf250519c4ed7a262c069e2f5fe536774a  ACCEPTED (target criterion 1, new evidence [7])
commitment 4  request_review     0x4fdd9d9e471489fae45ef66618ff5e1638bad9b8b2b0747d6721e2b1209e54d7  ACCEPTED (round 2)
```

One earlier `create_commitment` attempt on this address
(`0x4ee853ff1d8eea78ac071794ca1595d04d5035218f12d6d905e4ff99e1be8871`) executed
with a shell word-splitting bug that passed the criteria JSON as ~117 separate
arguments; the contract rejected it with a `TypeError` and — because every
validator agreed on the error — no state was written. It is recorded here for
audit honesty; the contract's state contains only the sixteen accepted writes
above.

### Write transaction hashes (original deployment `0x07d77BF8…98B12`)

Captured from the `genlayer write` output while populating:

```
commitment 1  create_commitment  0xcbcd44ca77b8f574ebe052ea0411963f2f0c26ce9708074d69ff80561231e9a0  ACCEPTED
evidence   1  submit_evidence    0xb26b2a17560ac7284cafd789cb432168494d0c2cb4e1300d66094674435cac7a  ACCEPTED
commitment 2  create_commitment  0x2cf5dc230a4831926f6682384da00e1cef76c470d9754e4acab60cd0a1a4ac6b  ACCEPTED
evidence   2  submit_evidence    0x8bceadf88b24c0ef52cff0aa7992ab81fc121ece3ec07aad2f9a9270c4352049  ACCEPTED
evidence   3  submit_evidence    0x82631f94526989f741f835a2af50473adc31926dfe20a23ee68a4612659b5389  ACCEPTED
evidence   4  submit_evidence    0x3153a7ebcd6e578bd3ea0ff68522f0e977bd0fe60aaf6c84fb74c7854252824e  ACCEPTED
commitment 3  create_commitment  0xfd9ad70d0248590141cf0e98d0ec73b7cf3ed9217f09b3232e393acf5faca280  ACCEPTED
evidence   5  submit_evidence    0x422fec14e3a62c8e11cfe0d8fdf59aecfd6e27e714031549011dddc5fb50f60b  ACCEPTED
```

Not captured: the review, challenge and commitment-4 transaction hashes. Those
commands were piped through a filter without teeing to a log, and the GenLayer
CLI has no command to list an address's transactions, so rather than guess they
are left blank here. The resulting state is verifiable through `get_rounds`,
`get_challenges` and `get_outcome` for ids 1–4.

### Evidence URLs used

All fetched 200 with readable text at the time of writing, except where noted:

| Purpose | URL | Retrieval status recorded |
|---|---|---|
| WHO ambient air pollution fact sheet | `https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health` | `fetched` |
| WHO household air pollution fact sheet | `https://www.who.int/news-room/fact-sheets/detail/household-air-pollution-and-health` | `fetched` |
| WHO climate change and health fact sheet | `https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health` | `fetched` |
| IPCC AR6 SYR Summary for Policymakers (PDF) | `https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_SPM.pdf` | `unsupported_format` |
| Removed WHO page | `https://www.who.int/news-room/fact-sheets/detail/this-page-was-removed-in-2023` | `http_error` |

The two non-`fetched` rows are deliberate: they show what the contract records
when a source cannot be read, and that such a source is never evidence for or
against anything.

## Gate evidence

```
genvm-lint  contracts/civic_lens.py        -> ok (13 methods, 7 views, 6 writes)
direct      pytest tests/direct/ -q         -> 184 passed
frontend    tsc --noEmit                    -> clean
frontend    vitest run                      -> 164 passed
frontend    vite build                      -> ok
```

## Superseded deployments (kept for audit honesty)

| Address | Deploy tx | Why superseded |
|---|---|---|
| `0xb3fF35bEd11059D8cF016f459fBbb2750b7D108C` | `0x55056b1a69cbd6fd2fb1aae48b1dc5c09f0d9d78b94ac54e04bd7bb416b89cb5` | pre-hardening criteria parsing |
| `0x91bc8a558F6154eD0757C123540cD83C35e2b09B` | `0x2d5da8a483502634a70acca7a965c984f781aaa89d535da8d84b70d643bf01c2` | pre `_text` input-type guards |
| `0x96f373003d958CC11305e4DE970c670d62183F9f` | `0x5e1ddcfebaa79d7baa7a3a8ab494d9f33148a343dd3099113289b393957b2063` | pre figure-verification / retrieval-status build (14 methods; `get_evidence` returned no `declared_source_class`) |
| `0xf9a7Efe8eFE2A9ca52eC503a84c9593FF5562533` | `0x2d694806d2ec8481e6f6a123c46141e656da13ec2a4b72a293cea789af20a798` | scale-word figure matching |
| `0xc0a7dDc06Efa3DbD0263d98B6B6D4Cfc990781F3` | `0x41d36ee74cb93d936ebf18d4c9f0a5eecf95f887cb7564e500ea133794edafe4` | non-copyable response placeholders |
| `0xb7805A4A1491D016c2FCeaAA7Bebfb8693bE787c` | `0x667efc4c0d4af48f2df51320d547cae2e202a6373d9c2fbc93a9801dbb39b155` | HTML entity decoding |
| `0x07d77BF87b8c76A0d6A6F925bAA18cae2f098B12` | `0x0cf870f5fae52a57d97f19f0db7e94d6ad87f837345cd13d11ce7726fe319e4a` | figure unit-scale: `figure_milli` is the value in the criterion's OWN unit x 1000, so a criterion in `million_deaths` takes 4200 for 4.2 million, not 4200000 |

The last three exist because a real review against a real page exposed a real
defect each time; they are listed so the history is auditable rather than
quietly replaced. See CHANGELOG.md.

## CLI notes (reproducing the writes)

- `genlayer deploy --contract contracts/civic_lens.py`
- `genlayer call <address> get_commitments --args 10 0` — signature is
  `(page_size, before_id)`; `before_id=0` means "newest page".
- Criteria via `genlayer write --args` must be passed as a JSON array token.
  The CLI coerces `""` to `0`, so omit optional empty-string keys
  (`deadline`) or pass `null` for them.
- `open_challenge`'s `new_evidence_ids` is a `DynArray[u32]`; pass it as an
  array token, e.g. `--args 4 "1" "grounds..." "[7]"`.
