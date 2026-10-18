/**
 * English catalog — the SOURCE OF TRUTH for every translatable string.
 *
 * Other locales (messages/es.ts, fr.ts, de.ts) are keyed by these names and may
 * be incomplete: a missing key falls back to English (see i18n/store.ts) rather
 * than rendering an identifier. The translation tests count coverage rather
 * than pretending it is complete.
 *
 * Namespaces: nav · chrome · colophon · theme · language · banner · error ·
 * outcome · result · reason · resolution · retrieval · source_class ·
 * provenance · status · trigger · role · data_mode · app_source ·
 * evidence_type · action · tx_phase.
 *
 * Rules for adding a key here:
 * - Dot-paths, lowercase, underscore inside a segment.
 * - The English text is final copy: it passes the neutral-language guard and
 *   uses one name per action. Translators change meaning, never the promise.
 * - Use {placeholders} for anything dynamic, never concatenation.
 */

export const en = {
  /* -- navigation --------------------------------------------------------- */
  "nav.commitments": "Commitments",
  "nav.activity": "Activity",
  "nav.demo": "Demo",
  "nav.how_it_works": "How it works",
  "nav.fairness": "Fairness",
  "nav.stats": "Platform stats",
  "nav.status": "System status",
  "nav.main": "Main",
  "nav.skip_to_content": "Skip to content",

  /* -- appearance + language controls ------------------------------------- */
  "theme.label": "Theme",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "language.label": "Language",
  "language.switch": "Change language",
  "language.current": "Language: {language}",
  "language.same_as_browser": "Browser language",
  "language.draft_note":
    "Translations are drafts written without a native reviewer. Please flag wording you would change.",

  /* -- landing ------------------------------------------------------------ */
  "landing.title": "What the published evidence supports",
  "landing.lede":
    "CivicLens checks whether published evidence supports what an organization publicly committed to — criterion by criterion, with the sources shown.",
  "landing.cta_demo": "Open the demo",
  "landing.cta_register": "Register a commitment",
  "landing.does_not_title": "What CivicLens does not do",
  "landing.does_not_body":
    "CivicLens reports what published evidence supports. It doesn't judge intent. It does not claim a document is authentic, and it does not score organizations.",
  "landing.sample_build": "This build is running on sample data",
  "landing.sample_heading": "A sample commitment, shown in full",
  "landing.sample_hint":
    'This is the same component the app uses for live evidence — the Criterion Ledger. The subject, "{subject}", is fabricated for this demonstration.',
  "landing.commitment_as_stated": "Commitment as stated",
  "landing.outcome_replay_heading": "Outcome (replay of a recorded result)",
  "landing.ledger_heading": "Criterion ledger",
  "landing.open_commitment": "Open this commitment page",
  "landing.open_commitment_tail":
    "to see the evidence panel, the audit block, and the round history.",
  "landing.why_heading": "Why this needs GenLayer",
  "landing.why_body_1":
    "A commitment says one thing in its own words; the evidence is phrased differently. Deciding whether a report supports a stated criterion is a question about meaning, not about matching keywords — and public pages change between the time a validator reads them and the time it reports.",
  "landing.why_body_2":
    "So the reading is made by validators that work independently and must agree on meaning, not on identical bytes. The overall outcome is then derived by ordinary code from the per-criterion results — the model never decides it.",
  "landing.how_link": "How a review actually runs",
  "landing.outcomes_heading": "What a commitment can end up showing",
  // Count phrasing puts the noun first for the same reason as browse.scope_note.
  "landing.round_count": "— review rounds: {count}",

  /* -- how it works ------------------------------------------------------- */
  "howit.title": "How it works",
  "howit.lede":
    "CivicLens reviews public evidence against criteria that were published in advance. This page explains what happens during a review, and what each result does and does not mean.",
  "howit.flow_heading": "What a review does",
  "howit.flow_1": "A commitment is registered with criteria stated in advance, along with the link to where the commitment was published and the period it covers.",
  "howit.flow_2":
    "Anyone adds public evidence — supporting or contradicting. Both are accepted. What someone writes alongside a link is kept on the record but never read by the review.",
  "howit.flow_3": "The registrant requests a review. Sources are fetched and read against each criterion.",
  "howit.flow_4":
    "Validators work independently and must reach the same meaning, not the same bytes. Each criterion gets a result, the reason, and the sources it relied on.",
  "howit.flow_5":
    "The overall outcome is derived in ordinary code from the per-criterion results. The model never decides it.",
  "howit.flow_6":
    "The result is recorded as a round. It can be challenged, which opens a new round with new evidence. Earlier rounds stay on the record.",
  "howit.equiv_heading": 'What "agreement" means here',
  "howit.equiv_body":
    "Public pages change, and a model will rarely phrase two readings identically. So validators do not have to produce the same text. They have to agree on:",
  "howit.equiv_result": "the result for each criterion — exact match, no tolerance;",
  "howit.equiv_reason": "the reason code — exact, or within a documented equivalent group;",
  "howit.equiv_figure":
    "for a numeric criterion, the extracted figure within a tolerance and on the same side of the threshold.",
  "howit.equiv_safeguards":
    "Two safeguards stop validators agreeing on something wrong. A definite verdict must cite sources that are actually in the submitted set, and a numeric verdict must agree with its own extracted figure. A verdict that fails either check is rejected rather than stored.",
  "howit.equiv_link": "Read the equivalence principle in the GenLayer docs",
  "howit.outcome_heading": "How the overall outcome is derived",
  "howit.outcome_caption": "The conditions under which each overall outcome is derived.",
  "howit.outcome_col_if": "If, among required criteria…",
  "howit.outcome_col_then": "The overall outcome is",
  "howit.outcome_all_supported": "all are supported",
  "howit.outcome_one_contradicted": "at least one is contradicted",
  "howit.outcome_none_contradicted": "none is contradicted but at least one is inconclusive",
  "howit.no_score_body":
    "Optional criteria are recorded and shown, but they never decide the overall outcome. There is no score, no grade, and no ranking — the outcome is a statement about the evidence on file, not a number to compare subjects by.",
  "howit.inconclusive_heading": 'Why "inconclusive" exists',
  "howit.inconclusive_body":
    "A lot of public commitments simply do not have enough published evidence to decide anything. Without a third result, that situation has to be squeezed into either \"supported\" or \"contradicted\", and both would be false.",
  "howit.does_not_mean": "Inconclusive does not mean:",
  "howit.does_not_mean_1": "the organization did not do what it said;",
  "howit.does_not_mean_2": "the commitment was broken, missed, or unfulfilled;",
  "howit.does_not_mean_3": "anyone acted in bad faith;",
  "howit.does_not_mean_4": "the evidence was weighed and found wanting.",
  "howit.it_means": "It means:",
  "howit.it_means_body":
    "the review could not determine whether the evidence supports the criterion as written. That is a statement about the evidence, and it is shown in a neutral colour — never a warning colour, never a score.",
  "howit.causes":
    "Common causes: nothing relevant was submitted; two authoritative sources disagree; a source could not be reached; the criterion's wording was too vague to match anything; or a figure was published in a different unit than the criterion uses.",
  "howit.resolution":
    "Every inconclusive result says what is missing and what would resolve it — for example a published report, a clearer criterion version, or a source that reconciles the disagreement.",
  "howit.absence":
    "Absence of evidence is always inconclusive. It is never treated as contradiction.",
  "howit.finality_heading": "Accepted is not final",
  "howit.finality_body_1":
    "GenLayer's consensus moves through stages. Once validators agree, the result is accepted — which means it can still be appealed. Only after the appeal window closes does it become final.",
  "howit.finality_body_2":
    "CivicLens shows these two states differently and never collapses them. An accepted result is labelled \"Accepted — can still be appealed\", and nothing in the interface implies permanence before finality is reached.",
  "howit.finality_body_3":
    "Separately from protocol appeals, any CivicLens challenge opens a new review round with new evidence attached. The two are different things: a protocol appeal disputes the committee's decision on the same inputs, while a challenge supplies new inputs. Neither replaces the other.",
  "howit.term_supported_body":
    "Published evidence bears out the criterion as written. Not a judgement of intent.",
  "howit.term_contradicted_body":
    "Published evidence conflicts with the criterion as written.",
  "howit.term_inconclusive_body": "The evidence did not allow a determination either way.",
  "howit.terms_heading": "Words used on this site",
  "howit.term_validator": "Validator",
  "howit.term_validator_body":
    "An independent node that evaluates the evidence and must agree with the others on meaning.",
  "howit.term_leader": "Leader",
  "howit.term_leader_body": "The validator that produces the first reading the others check.",
  "howit.term_finality": "Finality",
  "howit.term_finality_body": "The point after which a result can no longer be appealed.",
  "howit.next_prefix": "Next:",
  "howit.next_link": "safeguards and limitations",

  /* -- fairness and limitations ------------------------------------------- */
  "fair.title": "Safeguards and limitations",
  "fair.lede":
    "CivicLens reports what published evidence supports about a public commitment. This page says what that means, what it does not mean, and where the system is weak.",
  "fair.evidence_heading": "Evidence, not intent",
  "fair.evidence_1":
    "CivicLens never asserts motive, bad faith, or that anyone broke a promise. It compares published sources against criteria that were stated in advance.",
  "fair.evidence_2":
    "A contradicted criterion means the evidence conflicts with what was committed to. It does not mean anyone lied, and the interface never uses words that would suggest it.",
  "fair.inconclusive_heading": "Inconclusive is not failure",
  "fair.no_score_body":
    "Absence of evidence is inconclusive — never contradicted. Inconclusive is shown in a neutral colour, never styled as an error, never rolled into a negative score, and never used to rank or flag a subject.",
  "fair.inconclusive_link": "Why the third result exists",
  "fair.authentic_heading": "What consensus cannot prove",
  "fair.authentic_1":
    "Agreement is not authenticity. Validators agreeing that a document says something does not establish that the document is genuine, unaltered, or written by who it claims to be. CivicLens cannot detect a fabricated source that looks plausible.",
  "fair.authentic_2":
    "Mitigations are preferences, not guarantees: official reports, audited statements and government datasets are weighted better than self-published claims, and archived snapshots are used where available. But no source is treated as proven authentic.",
  "fair.authentic_3":
    "For the same reason, the review cannot prove a negative. If a subject published no report, CivicLens cannot tell the difference between “did nothing” and “did it but did not publish” — that is inconclusive, and it stays that way.",
  "fair.attribution_heading": "Attribution honesty",
  "fair.attribution_1":
    "Every commitment page states who registered the entry and in what role, and says that the subject has not necessarily verified or endorsed it. CivicLens does not verify that a registrant actually speaks for the organization it names — nobody can, from an address alone.",
  "fair.attribution_2":
    "A registrant role of “for their own organization” is a self-declaration, not a verified identity.",
  "fair.response_heading": "Right of response",
  "fair.response_1":
    "Anyone — including the subject organization — can submit evidence and open a challenge. A challenge adds new evidence and triggers a new review round. The subject's responses are shown on the commitment page, and the full round and challenge history stays public.",
  "fair.response_2":
    "Limits exist to stop abuse, not to shut anyone out: a small number of submissions per party, and a small number of rounds. These are enforced by the contract and shown in the interface before anyone acts.",
  "fair.privacy_heading": "Privacy",
  "fair.privacy_1":
    "CivicLens is for public commitments by public organizations and institutions. Entries naming a private individual as the subject are rejected by the contract, and no feature for profiling individuals is built.",
  "fair.privacy_2":
    "What is stored on chain: the commitment text, criteria, source links, and the submitter addresses needed to apply limits and record who did what. No personal data beyond addresses and public references. Notes attached to evidence are public, so they should not contain anything private.",
  "fair.gaming_heading": "Gaming resistance, and its limits",
  "fair.gaming_does": "What the design does:",
  "fair.gaming_does_1": "accepts supporting and contradicting evidence alike;",
  "fair.gaming_does_2": "judges evidence on content, never on who submitted it;",
  "fair.gaming_does_3": "ignores submitter notes entirely — the review code never reads them;",
  "fair.gaming_does_4":
    "bounds submissions per party and per commitment, and rejects duplicates;",
  "fair.gaming_does_5":
    "locks criteria once review starts, so a criterion cannot be quietly softened;",
  "fair.gaming_does_6":
    "treats evidence as data, so instructions embedded inside a document are ignored;",
  "fair.gaming_does_7": "rejects a verdict that cites sources outside the submitted set.",
  "fair.gaming_cannot": "What it cannot do:",
  "fair.gaming_cannot_1":
    "stop a coordinated group from submitting many sources. Bounds limit volume per party, not total volume across many parties.",
  "fair.gaming_cannot_2":
    "stop selective submission — nobody can be forced to add the source that would have changed the result.",
  "fair.gaming_cannot_3":
    "prevent a well-resourced subject from publishing a document designed to be easy to read favourably, or from publishing one designed to be hard.",
  "fair.gaming_cannot_4":
    "guarantee that a reading model interprets a complex criterion the way a careful human would, in every case.",
  "fair.gaming_footer":
    "These are real limitations. Read the evidence and the per-criterion reasons, not the single overall label.",
  "fair.finality_heading": "Finality honesty",
  "fair.finality_body":
    "An accepted result is not presented as permanent. Accepted and final are distinct, visibly distinct states, and appeal and challenge both remain open until they are not.",
  "fair.data_heading": "Sample data",
  "fair.data_1":
    "Sample scenarios are labeled on every surface they appear on. They replay recorded results about fabricated organizations and are never presented as findings about real entities.",
  "fair.data_link": "See the sample scenarios",
  "fair.back_prefix": "Back to",
  "fair.back_link": "the start",

  /* -- browse (/commitments) ---------------------------------------------- */
  "browse.title": "Commitments",
  "browse.lede":
    "Public commitments registered on CivicLens. Each one shows its criteria, the sources on file, and the result of every review round.",
  "browse.filter_search": "Search",
  "browse.filter_search_placeholder": "Subject or number",
  "browse.filter_mode": "Data",
  "browse.filter_mode_all": "Sample and live",
  "browse.filter_outcome": "Outcome",
  "browse.filter_outcome_all": "Any outcome",
  "browse.filter_outcome_none": "Not yet reviewed",
  "browse.filter_status": "State",
  "browse.filter_status_all": "Any state",
  "browse.filter_role": "Registrant",
  "browse.filter_role_all": "Any role",
  "browse.filter_sort": "Sort",
  "browse.sort_newest": "Newest first",
  "browse.sort_ending_soonest": "Ending soonest",
  "browse.sort_most_reviewed": "Most reviewed",
  "browse.sort_most_sources": "Most sources",
  "browse.refreshing": "Refreshing…",
  // Nouns precede the number here on purpose: an English-style "record{s}"
  // suffix cannot be carried into languages with different plural rules, so
  // the phrasing is kept grammatical for any count in every locale.
  "browse.scope_note":
    "Search, filters, and sorting apply to the most recently registered records ({count} shown) — the largest page the contract serves in one read.",
  "browse.empty_title": "Nothing matches those filters",
  "browse.empty_body_prefix": "Widen the filters, or",
  "browse.empty_link": "register a commitment",
  "browse.empty_body_suffix": "to add one.",
  "browse.table_caption":
    "Commitments with their state, data mode, evaluation period, and round count.",
  "browse.col_subject": "Subject",
  "browse.col_data": "Data",
  "browse.col_status": "State",
  "browse.col_period": "Period",
  "browse.col_rounds": "Rounds",
  "browse.col_sources": "Sources",
  "browse.tag_superseded": "Superseded by #{id}",
  "browse.demo_link": "See what each of these sample outcomes tests",
  "browse.error_title": "Commitments could not be loaded.",
  "browse.loading": "Loading commitments",

  /* -- system status ------------------------------------------------------ */
  "statuspage.title": "System status",
  "statuspage.lede":
    "What this browser can verify about the configuration: the contract address, a live read, the constants it answers with, the network, and the wallet. Method names cannot be enumerated from a read — that check runs against the saved schema (node scripts/save-schema.mjs / genlayer schema).",
  "statuspage.loading": "Running configuration checks",
  "statuspage.all_ok": "Everything this page can check matches.",
  "statuspage.needs_attention": "Checks needing attention: {count}.",
  "statuspage.caption": "Configuration checks with their state and what each one found.",
  "statuspage.col_check": "Check",
  "statuspage.col_state": "State",
  "statuspage.col_detail": "Detail",
  "statuspage.methods_heading": "Expected methods",
  "statuspage.methods_hint":
    "Transcribed from the saved schema (docs/civic_lens.schema.json). Verify a deployment answers them with genlayer schema <address>.",
  "statuspage.methods_reads": "Reads",
  "statuspage.methods_writes": "Writes",
  "statuspage.rerun": "Run checks again",
  "statuspage.state_configured": "Configured",
  "statuspage.state_not_configured": "Not configured",
  "statuspage.state_info": "Info",
  "statuspage.state_checking": "Checking",
  "statuspage.state_attention": "Needs attention",
  "statuspage.state_answers": "Answers",
  "statuspage.state_matches": "Matches",
  "statuspage.state_older": "Older build",
  "statuspage.state_connected": "Connected",
  "statuspage.check_address": "Contract address",
  "statuspage.check_read": "Contract read",
  "statuspage.check_shape": "Constants shape",
  "statuspage.check_bounds": "Client bounds",
  "statuspage.check_network": "Network",
  "statuspage.check_wallet": "Wallet",
  "statuspage.check_source": "Data source",
  "statuspage.address_view": "View on the explorer",
  "statuspage.address_missing":
    "No address is set. This build runs on the bundled sample scenarios and says so everywhere. Set VITE_CONTRACT_ADDRESS in frontend/.env to read a deployed contract.",
  "statuspage.read_sample":
    "No deployed contract to read in this build — constants come from the bundled snapshot.",
  "statuspage.read_checking": "Reading get_constants…",
  "statuspage.read_answered": "Answered in {ms} ms.",
  "statuspage.read_error_hint_prefix":
    "Check the address, the network, and that the endpoint is reachable.",
  "statuspage.read_error_hint_suffix": "will fail the same way until this answers.",
  "statuspage.read_browse_link": "Browse",
  "statuspage.shape_sample":
    "Checked against the bundled snapshot only — nothing deployed to compare.",
  "statuspage.shape_missing_key": "required key missing: {key}",
  "statuspage.shape_mismatch_intro":
    "The address answers, but its constants do not match this frontend:",
  "statuspage.shape_mismatch_hint":
    "Likely an older or different contract at this address. Point VITE_CONTRACT_ADDRESS at the current build.",
  "statuspage.shape_older_detail":
    "Answers, but is missing audit fields this frontend can use: {fields}.",
  "statuspage.shape_older_tail":
    "Retrieval statuses, quote limits, and the plain-language semantics will read as absent.",
  "statuspage.shape_ok": "Every field this frontend consumes is present, including the audit fields.",
  "statuspage.bounds_ok": "The app's snapshot matches the deployed bounds.",
  "statuspage.bounds_differ":
    "Bounds differing from the app's snapshot: {count}. Deployed values are authoritative and the app uses them:",
  "statuspage.bounds_line": "{key}: app {app}, deployed {deployed}",
  "statuspage.network_gasless": " — gasless, so 0 GEN is expected.",
  "statuspage.network_funded": " — writes need a funded account.",
  "statuspage.wallet_none":
    "No wallet extension detected. Reading works without one; writes need a wallet.",
  "statuspage.wallet_no_account":
    "A wallet is available but no account is connected. Connect from the header to write.",
  "statuspage.wallet_wrong_chain":
    "Connected on a different chain. Reads still work; writes need {chain} (chain {chainId}).",
  "statuspage.wallet_ok": "{address} on {chain}.",
  "statuspage.source_sample":
    "Sample data — {reason}. Nothing on this build is a finding about a real organization.",
  "statuspage.source_sample_default": "bundled scenarios",
  "statuspage.source_live":
    "Live evidence from the configured contract. Pages label their own mode.",

  /* -- colophon ----------------------------------------------------------- */
  "colophon.tagline": "CivicLens reports what published evidence supports. It doesn't judge intent.",
  "colophon.safeguards": "Safeguards and limitations",
  "colophon.genlayer_docs": "GenLayer docs",
  "colophon.contract": "Contract:",
  "colophon.not_deployed": "not deployed yet — this build runs on sample data",

  /* -- banners and faults -------------------------------------------------- */
  "banner.sample_title": "Sample data",
  "banner.sample_cta": "See what each scenario tests",
  "banner.sample_notice":
    "Nothing on this screen is a finding about a real organization. Every subject here is fabricated for demonstration.",
  "banner.wrong_network_title": "This wallet is on the wrong network.",
  "banner.wrong_network_body":
    "CivicLens reads and writes on {network}. Reading works either way; a write needs the switch below.",
  "banner.switch_network": "Switch to {network}",
  "error.default_title": "That didn't load.",
  "error.retry": "Try again",
  "error.details": "Details",
  "error.no_contract_title": "This build has no contract to read.",
  "error.no_contract_hint":
    "Copy frontend/.env.example to frontend/.env and set VITE_CONTRACT_ADDRESS. Until then the app serves the bundled sample scenarios, and every surface says so.",
  "error.expected": "That request can't be completed as written.",
  "error.external": "A source couldn't be reached. Try again later.",
  "error.transient": "Temporary problem. Try again.",
  "error.llm": "The review couldn't be completed. Try again.",
  "error.unknown": "The request didn't go through. Try again.",
  "error.no_reason": "No reason recorded.",
  "error.unknown_reason": "Recorded reason not recognized.",
  "error.unknown_overall_reason": "Outcome derived from the per-criterion results.",

  /* -- outcomes ------------------------------------------------------------ */
  "outcome.supported": "Evidence supports",
  "outcome.contradicted": "Evidence contradicts",
  "outcome.inconclusive": "Inconclusive",
  "result.pending": "Review pending",
  "overall_reason.all_required_supported":
    "Every required criterion is supported by published evidence.",
  "overall_reason.required_criterion_contradicted":
    "Published evidence conflicts with at least one required criterion.",

  /* -- per-criterion reasons ---------------------------------------------- */
  "reason.supporting_evidence_found": "Published evidence addresses this criterion.",
  "reason.contradicting_evidence_found": "Published evidence conflicts with this criterion.",
  "reason.threshold_met": "The extracted figure meets the criterion's stated threshold.",
  "reason.threshold_not_met":
    "The extracted figure does not meet the criterion's stated threshold.",
  "reason.no_relevant_evidence": "No submitted evidence addresses this criterion yet.",
  "reason.evidence_unavailable": "A source couldn't be reached during the review.",
  "reason.source_conflict": "Authoritative sources disagree on this criterion.",
  "reason.criterion_ambiguous":
    "The criterion's wording can't be matched to evidence. A clearer version may help.",
  "reason.unit_mismatch":
    "The figure was reported in a different unit than the criterion uses.",
  "reason.review_incomplete": "The review could not complete a judgement on this criterion.",
  "reason.figure_unverified":
    "A figure was reported but could not be tied to a quoted passage in the source.",
  "reason.period_mismatch":
    "The figure's reporting period or scope does not clearly match the criterion.",

  /* -- what could resolve an inconclusive ---------------------------------- */
  "resolution.no_relevant_evidence":
    "What could resolve this: submit a source that addresses the criterion, or a clearer criterion version.",
  "resolution.evidence_unavailable":
    "What could resolve this: try the review again later, or submit a copy of the source as new evidence.",
  "resolution.source_conflict":
    "What could resolve this: a criterion that names which source wins, or evidence that reconciles the sources.",
  "resolution.criterion_ambiguous":
    "What could resolve this: a new commitment version with a sharper criterion. The remedy is a clearer commitment, not a guess.",
  "resolution.unit_mismatch":
    "What could resolve this: evidence reporting the figure in the criterion's unit.",
  "resolution.review_incomplete":
    "What could resolve this: request the review again. Nothing about the commitment is implied either way.",
  "resolution.figure_unverified":
    "What could resolve this: a source that states the figure in a quoted passage.",
  "resolution.period_mismatch":
    "What could resolve this: evidence whose reporting period and scope match the criterion.",

  /* -- retrieval ----------------------------------------------------------- */
  "retrieval.fetched": "Read",
  "retrieval.unreachable": "Could not be reached",
  "retrieval.http_error": "The source returned an error",
  "retrieval.blocked": "Blocked: not a public address",
  "retrieval.unsupported_format": "Format could not be read",
  "retrieval.empty": "The page had no readable text",
  "retrieval.unknown": "Retrieval status not recorded",

  /* -- declared source class ----------------------------------------------- */
  "source_class.primary": "Declared primary source",
  "source_class.self_published": "Declared self-published",
  "source_class.secondary": "Declared secondary report",
  "source_class.unclassified": "Unclassified source",
  "label.not_used": "Considered, not used",

  /* -- demo provenance ----------------------------------------------------- */
  "provenance.recorded_on_chain": "Replay of a recorded on-chain result",
  "provenance.authored_illustration": "Authored illustration",
  "provenance.note.recorded_on_chain":
    "Replayed from a round that was actually reviewed by consensus on the network. It shows what that review decided; it does not claim the same decision would be reached again. Appeals and finality still apply.",
  "provenance.note.authored_illustration":
    "Authored for the demo. The organization and its documents are fictional and were never reviewed on the network. This shows how the contract would behave, not something it decided.",

  /* -- commitment status --------------------------------------------------- */
  "status.evidence_open": "Evidence window open",
  "status.review_pending": "Review pending",
  "status.outcome_accepted": "Outcome accepted",
  "status.challenged": "Challenged",
  "status.withdrawn": "Withdrawn",
  "status.superseded": "Superseded",
  "trigger.initial": "Initial review",
  "trigger.challenge": "Review after a challenge",

  /* -- registrant role ----------------------------------------------------- */
  "role.organization": "for their own organization",
  "role.observer": "as an observer",
  "role_short.organization": "Own organization",
  "role_short.observer": "Observer",

  /* -- data mode ----------------------------------------------------------- */
  "data_mode.sample": "Sample data",
  "data_mode.live": "Live evidence",
  "app_source.configured": "Live contract configured",
  "app_source.sample_only": "Sample data",
  "app_source.title.configured":
    "A deployed CivicLens contract is configured in this build. Each surface labels where its own data came from.",
  "app_source.title.sample_only":
    "No contract address is configured, so every surface in this app reads bundled sample data.",

  /* -- evidence types ------------------------------------------------------ */
  "evidence_type.official_report": "Official report",
  "evidence_type.audited_statement": "Audited statement",
  "evidence_type.government_dataset": "Government dataset",
  "evidence_type.press_release": "Press release",
  "evidence_type.news_article": "News article",
  "evidence_type.other": "Other",

  /* -- actions (one name per action everywhere) ---------------------------- */
  "action.register_commitment": "Register commitment",
  "action.add_evidence": "Add evidence",
  "action.request_review": "Request review",
  "action.open_challenge": "Open challenge",
  "action.supersede": "Create new version",
  "action.withdraw": "Withdraw",

  /* -- transaction lifecycle ------------------------------------------------ */
  "tx_phase.submitted": "Submitted to the network",
  "tx_phase.pending": "Validators are reviewing",
  "tx_phase.accepted": "Accepted — can still be appealed",
  "tx_phase.final": "Final",
  "tx_phase.dropped": "Didn't complete: validators did not reach a decision.",
  "tx_phase.rejected": "Didn't complete: validators disagreed with the proposal.",
  "tx_phase.reverted": "Didn't complete: the contract rejected the request.",
} as const;

export type MessageKey = keyof typeof en;
