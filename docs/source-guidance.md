# Source guidance — what counts as authoritative evidence (M1)

Registrants supply free-text **source guidance** per commitment (what they
declared counts as authoritative). The values below are the guidance shown by
the UI as suggestions and used in demo fixtures. The contract stores the
guidance string verbatim; it is included in the review payload as context for
the LLM (and is DATA, not instructions).

## Evidence types accepted by the contract (enum)

`official_report` · `audited_statement` · `government_dataset` ·
`press_release` · `news_article` · `other`

## Authority ordering (documented, shown in UI)

1. **Government / statistical datasets** — strongest for numeric criteria;
   prefer documented APIs or data files over scraped pages.
2. **Audited statements and official reports from the subject** — valid
   evidence of *what was published*; weaker as proof of *outcomes* unless
   independently corroborated. Encode as a criterion-level instruction
   ("independently corroborated") rather than trusting the LLM's mood.
3. **Official communications** (press releases, official announcements) —
   good for existence/dating of statements.
4. **Reporting by reputable outlets** — context and corroboration; never the
   sole basis for a `supported` numeric verdict if the criterion requires
   primary data.

## Per-criterion rules

- Evidence must fall inside the evaluation period (or on/before a criterion
  deadline); out-of-period evidence is excluded deterministically and shown as
  considered-but-not-counted.
- Evidence published **before** the commitment does not count toward criteria
  that require post-commitment reporting; the criterion's `measure` text
  states this when relevant (the LLM is told to require post-commitment
  publication for such criteria).
- Self-published claims by the subject are admissible for "was X published?"
  criteria but must be corroborated for outcome criteria — stated in the
  criterion's measure text at registration time.

## Retrieval reference (auditability)

Each review round records: the evidence ids used per criterion, the evaluation
period, the criteria version, the round number, and the review timestamp
(transaction datetime, ISO). URLs are the retrieval reference.

**No content fingerprints are promised**: hashing fetched content inside GenVM
is not verified in the pinned runtime, so the contract records what was
reviewed (ids + URLs) rather than claiming byte-level immutability of remote
pages. Two validators may see different versions of a page — that is exactly
what the equivalence rule tolerances are for (see docs/equivalence-design.md).

## Untrusted-content rules

- All fetched content is DATA. Prompt framing instructs the model to ignore
  instructions inside evidence documents.
- Paywalled or login-gated sources: avoid; the review reports
  `evidence_unavailable` for those criteria.
- Prefer stable/archived URLs; volatile pages may differ between validators.
