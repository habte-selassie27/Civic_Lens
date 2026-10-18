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
  "landing.round_count": "— {count} round{plural}",

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
