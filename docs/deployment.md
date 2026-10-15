# Deployment record — CivicLens

All values below were captured from real CLI/SDK output on the dates shown.
Nothing is copied from a template; explorer links use the verified
`explorer-studio.genlayer.com/tx|address/<hash>` patterns (HTTP-verified).

## Current deployment (final contract code)

```
NETWORK:          studionet (GenLayer Studio, chain id 61999, RPC https://studio.genlayer.com/api)
ACCOUNT:          rabby (0x5b3661c576c7001e6d6279c67f3779705d334c89)
CONTRACT FILE:    contracts/civic_lens.py (class CivicLens, pinned Depends header)
CONTRACT ADDRESS: 0x96f373003d958CC11305e4DE970c670d62183F9f
DEPLOY TX HASH:   0x5e1ddcfebaa79d7baa7a3a8ab494d9f33148a343dd3099113289b393957b2063
DEPLOY RECEIPT:   status_name ACCEPTED
EXPLORER LINK:    https://explorer-studio.genlayer.com/tx/0x5e1ddcfebaa79d7baa7a3a8ab494d9f33148a343dd3099113289b393957b2063
ADDRESS LINK:     https://explorer-studio.genlayer.com/address/0x96f373003d958CC11305e4DE970c670d62183F9f
SCHEMA SAVED AT:  docs/civic_lens.schema.json (14 methods: 7 views, 7 writes;
                  fetched with client.getContractSchema from the deployed address)
FIRST READ:       genlayer call <address> get_constants -> enums/bounds returned
                  genlayer call <address> get_commitments --args 10 0 -> [] (fresh state)
FIRST WRITE TX:   0xf01410dff5feb9a22b33196f603627253398b979e694a43740f0fddc616ed8ad
                  method create_commitment (sample commitment id 1, data_mode "sample")
                  receipt: execution SUCCESS, result return 1,
                  votes [AGREE, AGREE, IDLE, AGREE, IDLE], status ACCEPTED
SECOND WRITE TX:  0x3fbbfdbd773ebeb26211013d42604d7ded9359e7f694a1149a1ec18ea95ee797
                  method submit_evidence (evidence id 1 on commitment 1)
                  receipt: execution SUCCESS, result return 1, status ACCEPTED
READ-BACK:        get_commitment 1 -> subject "Riverdale City (sample)", status evidence_open
                  get_evidence 1  -> url https://example.org/, note "[SAMPLE DATA]"
DATE:             2026-10-14
```

## Gate evidence for this deployment

```
genvm-lint  contracts/civic_lens.py  -> ok (14 methods; lint output saved per session)
direct      pytest tests/direct/ -q   -> 82 passed
integration gltest --network studionet -> 10 passed in 447.82s (full clean run)
```

The two integration tests that failed once during an earlier full run
(`test_figures_within_tolerance_reach_consensus`,
`test_forged_leader_rejected_by_majority`) failed on an HTTP 502 from the
Studio infrastructure and both passed on immediate retry; the subsequent
full run was clean.

## Superseded deployments (kept for audit honesty)

| Address | Deploy tx | Why superseded |
|---|---|---|
| `0xb3fF35bEd11059D8cF016f459fBbb2750b7D108C` | `0x55056b1a69cbd6fd2fb1aae48b1dc5c09f0d9d78b94ac54e04bd7bb416b89cb5` | pre-hardening criteria parsing |
| `0x91bc8a558F6154eD0757C123540cD83C35e2b09B` | `0x2d5da8a483502634a70acca7a965c984f781aaa89d535da8d84b70d643bf01c2` | pre `_text` input-type guards |

## CLI notes (reproducing the writes)

- `genlayer deploy --contract contracts/civic_lens.py`
- `genlayer call <address> get_commitments --args 10 0` — signature is
  `(page_size, before_id)`; `before_id=0` means "newest page".
- Criteria via `genlayer write --args` must be passed as a JSON array token.
  The CLI coerces `""` to `0`, so omit optional empty-string keys
  (`deadline`) or pass `null` for them.
