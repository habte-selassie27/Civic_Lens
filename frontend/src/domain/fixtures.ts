/**
 * Demo scenarios — the eight sample cases from AGENTS section 21.
 *
 * HONESTY RULES (docs/fairness.md):
 * - Everything here is SAMPLE DATA about FABRICATED organizations.
 * - Scenarios are REPLAYS of recorded results, not live consensus runs;
 *   the UI labels them "Sample data — replay of a recorded result".
 * - Never present these as findings about a real entity.
 */

import type {
  ChallengeRecord,
  Commitment,
  CommitmentSummary,
  CriterionResult,
  EvidenceItem,
  Outcome,
  RoundRecord,
} from "./types";

const SAMPLE_A = "0x5a0b5e000000000000000000000000000000000a"; // sample observer
const SAMPLE_O = "0x5a0b5e000000000000000000000000000000000b"; // sample org
const SAMPLE_C = "0x5a0b5e000000000000000000000000000000000c"; // sample challenger

const EVALUATED = "2024-12-31T12:00:00Z";

function commitment(over: Partial<Commitment> & Pick<Commitment, "id" | "subject" | "commitment_text" | "criteria">): Commitment {
  return {
    registrant: SAMPLE_A,
    registrant_role: "observer",
    subject_kind: "organization",
    source_statement_ref: `https://example.org/announcement-${over.id}`,
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    timezone: "UTC",
    source_guidance: "Prefer audited statements and official reports.",
    data_mode: "sample",
    status: "outcome_accepted",
    version: 1,
    supersedes: 0,
    round_count: 1,
    challenge_count: 0,
    evidence_count: 0,
    current_round: 1,
    ...over,
  };
}

function evidence(id: number, url: string, type: EvidenceItem["evidence_type"], day: string, submitter: string, note = ""): EvidenceItem {
  return { id, url, evidence_type: type, published_date: day, note, submitter, submitted_at: `${day}T09:00:00Z` };
}

function summary(c: Commitment): CommitmentSummary {
  return {
    id: c.id,
    subject: c.subject,
    status: c.status,
    data_mode: c.data_mode,
    registrant_role: c.registrant_role,
    version: c.version,
    round_count: c.round_count,
    evidence_count: c.evidence_count,
    period_start: c.period_start,
    period_end: c.period_end,
  };
}

export interface Scenario {
  slug: string;
  name: string;
  /** One line: what this sample demonstrates. */
  whatThisTests: string;
  commitment: Commitment;
  evidence: EvidenceItem[];
  rounds: RoundRecord[];
  challenges: ChallengeRecord[];
  outcome: Outcome;
}

// ---------------------------------------------------------------------------
// 1. Clear support
// ---------------------------------------------------------------------------
const s1Criteria = commitment({
  id: 1,
  subject: "Riverdale City (sample)",
  commitment_text:
    "Riverdale City commits to publish an annual Scope 1 emissions report for 2024.",
  source_statement_ref: "https://example.org/announcement-1",
  registrant: SAMPLE_O,
  registrant_role: "organization",
  evidence_count: 1,
  criteria: [
    {
      id: 1,
      text: "Publishes an annual Scope 1 emissions report for 2024",
      measure: "An official report covering the year is published and publicly reachable",
      required: true,
      has_threshold: false,
      threshold_milli: 0,
      operator: "",
      unit: "",
      deadline: "",
    },
    {
      id: 2,
      text: "Reports are verified by a third-party auditor",
      measure: "An independent audit statement accompanies the report",
      required: false,
      has_threshold: false,
      threshold_milli: 0,
      operator: "",
      unit: "",
      deadline: "",
    },
  ],
});

const s1Round1: CriterionResult[] = [
  {
    criterion_id: 1,
    status: "supported",
    reason_code: "supporting_evidence_found",
    evidence_used: [1],
    evidence_considered_not_used: [],
    has_figure: false,
    figure_milli: 0,
    unit: "",
    summary: "The official report covers Scope 1 emissions for the full year 2024.",
  },
  {
    criterion_id: 2,
    status: "inconclusive",
    reason_code: "no_relevant_evidence",
    evidence_used: [],
    evidence_considered_not_used: [1],
    has_figure: false,
    figure_milli: 0,
    unit: "",
    summary: "The report does not include an independent audit statement.",
  },
];

// ---------------------------------------------------------------------------
// 2. Clear contradiction
// ---------------------------------------------------------------------------
const s2 = commitment({
  id: 2,
  subject: "Northwind Utilities (sample)",
  commitment_text:
    "Northwind Utilities commits to reduce grid energy intensity by 10% against the 2023 baseline.",
  source_statement_ref: "https://example.org/announcement-2",
  evidence_count: 1,
  criteria: [
    {
      id: 1,
      text: "Reduces grid energy intensity by at least 10% vs 2023",
      measure: "Audited intensity figures for 2024 compared with the 2023 baseline",
      required: true,
      has_threshold: true,
      threshold_milli: 10000, // 10.000 (%)
      operator: "gte",
      unit: "percent_reduction",
      deadline: "",
    },
  ],
});

// ---------------------------------------------------------------------------
// 3. Missing evidence
// ---------------------------------------------------------------------------
const s3 = commitment({
  id: 3,
  subject: "Harborview University (sample)",
  commitment_text:
    "Harborview University commits to publish its 2024 sustainable-procurement report.",
  source_statement_ref: "https://example.org/announcement-3",
  status: "outcome_accepted",
  evidence_count: 0,
  criteria: [
    {
      id: 1,
      text: "Publishes the 2024 sustainable-procurement report",
      measure: "The named report exists and is publicly reachable",
      required: true,
      has_threshold: false,
      threshold_milli: 0,
      operator: "",
      unit: "",
      deadline: "",
    },
  ],
});

// ---------------------------------------------------------------------------
// 4. Conflicting sources
// ---------------------------------------------------------------------------
const s4 = commitment({
  id: 4,
  subject: "Pinegrove County (sample)",
  commitment_text:
    "Pinegrove County commits to keeping the diversion rate above 45% in 2024.",
  source_statement_ref: "https://example.org/announcement-4",
  evidence_count: 2,
  criteria: [
    {
      id: 1,
      text: "Waste diversion rate stays above 45% for 2024",
      measure: "An authoritative measurement of the county diversion rate for 2024",
      required: true,
      has_threshold: true,
      threshold_milli: 45000, // 45.000 (%)
      operator: "gte",
      unit: "percent",
      deadline: "",
    },
  ],
});

// ---------------------------------------------------------------------------
// 5. Ambiguous criterion
// ---------------------------------------------------------------------------
const s5 = commitment({
  id: 5,
  subject: "Lakeside Transit (sample)",
  commitment_text:
    "Lakeside Transit commits to meaningfully improve passenger experience in 2024.",
  source_statement_ref: "https://example.org/announcement-5",
  evidence_count: 1,
  criteria: [
    {
      id: 1,
      text: "Meaningfully improves passenger experience",
      measure: "Whatever shows improvement",
      required: true,
      has_threshold: false,
      threshold_milli: 0,
      operator: "",
      unit: "",
      deadline: "",
    },
  ],
});

// ---------------------------------------------------------------------------
// 6. Numeric boundary (figure exactly at the threshold)
// ---------------------------------------------------------------------------
const s6 = commitment({
  id: 6,
  subject: "Crestview Water District (sample)",
  commitment_text:
    "Crestview Water District commits to treating at least 500 megalitres in 2024.",
  source_statement_ref: "https://example.org/announcement-6",
  registrant: SAMPLE_O,
  registrant_role: "organization",
  evidence_count: 1,
  criteria: [
    {
      id: 1,
      text: "Treats at least 500 megalitres of water in 2024",
      measure: "Total treated volume for 2024 in megalitres, per the annual water quality report",
      required: true,
      has_threshold: true,
      threshold_milli: 500000, // 500.000 ML exactly
      operator: "gte",
      unit: "megalitres",
      deadline: "",
    },
  ],
});

// ---------------------------------------------------------------------------
// 7. Injection attempt inside evidence (ignored)
// ---------------------------------------------------------------------------
const s7 = commitment({
  id: 7,
  subject: "Meadowbrook Schools (sample)",
  commitment_text:
    "Meadowbrook Schools commits to Scope 2 electricity emissions below 80 tCO2e in 2024.",
  source_statement_ref: "https://example.org/announcement-7",
  evidence_count: 1,
  criteria: [
    {
      id: 1,
      text: "Keeps Scope 2 electricity emissions below 80 tCO2e",
      measure: "Reported Scope 2 emissions for 2024 in tCO2e",
      required: true,
      has_threshold: true,
      threshold_milli: 80000, // 80.000 tCO2e
      operator: "lte",
      unit: "tco2e",
      deadline: "",
    },
  ],
});

// ---------------------------------------------------------------------------
// 8. Challenge with new evidence changes the outcome (round 2)
// ---------------------------------------------------------------------------
const s8 = commitment({
  id: 8,
  subject: "Fairwater Port Authority (sample)",
  commitment_text:
    "Fairwater Port Authority commits to publishing quarterly emissions updates in 2024.",
  source_statement_ref: "https://example.org/announcement-8",
  evidence_count: 2,
  round_count: 2,
  challenge_count: 1,
  current_round: 2,
  criteria: [
    {
      id: 1,
      text: "Publishes quarterly emissions updates for 2024",
      measure: "Four dated quarterly updates or one annual report covering all quarters",
      required: true,
      has_threshold: false,
      threshold_milli: 0,
      operator: "",
      unit: "",
      deadline: "",
    },
  ],
});

// ---------------------------------------------------------------------------
// Assembled scenarios
// ---------------------------------------------------------------------------
export const SCENARIOS: Scenario[] = [
  {
    slug: "clear-support",
    name: "Clear support",
    whatThisTests: "An authoritative report meets a required criterion; an optional criterion stays inconclusive without hiding the mix.",
    commitment: s1Criteria,
    evidence: [
      evidence(1, "https://evidence.example.org/riverdale/scope1-2024.pdf", "official_report", "2024-06-01", SAMPLE_O),
    ],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: s1Round1,
        overall_outcome: "supported",
        overall_reason: "all_required_supported",
        evidence_considered: [1],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [],
    outcome: {
      commitment_id: 1,
      has_outcome: true,
      round: 1,
      status: "outcome_accepted",
      trigger: "initial",
      overall_outcome: "supported",
      overall_reason: "all_required_supported",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 1, contradicted: 0, inconclusive: 1 },
    },
  },
  {
    slug: "clear-contradiction",
    name: "Clear contradiction",
    whatThisTests: "An audited figure conflicts with the criterion — contradiction needs contradicting evidence, not silence.",
    commitment: s2,
    evidence: [
      evidence(1, "https://evidence.example.org/northwind/audit-2024.pdf", "audited_statement", "2024-11-12", SAMPLE_A, "Independent audit, as submitted"),
    ],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "contradicted",
            reason_code: "threshold_not_met",
            evidence_used: [1],
            evidence_considered_not_used: [],
            has_figure: true,
            figure_milli: 6200, // 6.200% reduction — below the 10% threshold
            unit: "percent_reduction",
            summary: "The audited figures show a 6.2% reduction, below the committed 10%.",
          },
        ],
        overall_outcome: "contradicted",
        overall_reason: "required_criterion_contradicted",
        evidence_considered: [1],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [],
    outcome: {
      commitment_id: 2,
      has_outcome: true,
      round: 1,
      status: "outcome_accepted",
      trigger: "initial",
      overall_outcome: "contradicted",
      overall_reason: "required_criterion_contradicted",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 0, contradicted: 1, inconclusive: 0 },
    },
  },
  {
    slug: "missing-evidence",
    name: "Missing evidence",
    whatThisTests: "Nothing relevant was submitted — inconclusive, never treated as a broken promise.",
    commitment: s3,
    evidence: [],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "inconclusive",
            reason_code: "no_relevant_evidence",
            evidence_used: [],
            evidence_considered_not_used: [],
            has_figure: false,
            figure_milli: 0,
            unit: "",
            summary: "No evidence was submitted for this commitment during the window.",
          },
        ],
        overall_outcome: "inconclusive",
        overall_reason: "no_relevant_evidence",
        evidence_considered: [],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [],
    outcome: {
      commitment_id: 3,
      has_outcome: true,
      round: 1,
      status: "outcome_accepted",
      trigger: "initial",
      overall_outcome: "inconclusive",
      overall_reason: "no_relevant_evidence",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 0, contradicted: 0, inconclusive: 1 },
    },
  },
  {
    slug: "conflicting-sources",
    name: "Conflicting sources",
    whatThisTests: "Two authoritative sources disagree — the platform reports the conflict instead of picking a winner.",
    commitment: s4,
    evidence: [
      evidence(1, "https://evidence.example.org/pinegrove/county-report-2024.pdf", "government_dataset", "2024-10-01", SAMPLE_A),
      evidence(2, "https://evidence.example.org/pinegrove/contractor-audit-2024.pdf", "audited_statement", "2024-10-20", SAMPLE_A),
    ],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "inconclusive",
            reason_code: "source_conflict",
            evidence_used: [1, 2],
            evidence_considered_not_used: [],
            has_figure: false,
            figure_milli: 0,
            unit: "",
            summary:
              "The county report states 47.8% while the contractor audit states 41.3%; the criterion names no tie-break.",
          },
        ],
        overall_outcome: "inconclusive",
        overall_reason: "source_conflict",
        evidence_considered: [1, 2],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [],
    outcome: {
      commitment_id: 4,
      has_outcome: true,
      round: 1,
      status: "outcome_accepted",
      trigger: "initial",
      overall_outcome: "inconclusive",
      overall_reason: "source_conflict",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 0, contradicted: 0, inconclusive: 1 },
    },
  },
  {
    slug: "ambiguous-criterion",
    name: "Ambiguous criterion",
    whatThisTests: "Vague wording gets a clearer commitment version — the platform does not guess.",
    commitment: s5,
    evidence: [
      evidence(1, "https://evidence.example.org/lakeside/survey-2024.pdf", "official_report", "2024-09-01", SAMPLE_O),
    ],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "inconclusive",
            reason_code: "criterion_ambiguous",
            evidence_used: [],
            evidence_considered_not_used: [1],
            has_figure: false,
            figure_milli: 0,
            unit: "",
            summary:
              "The criterion does not define what improvement means, so the survey cannot be matched to it.",
          },
        ],
        overall_outcome: "inconclusive",
        overall_reason: "criterion_ambiguous",
        evidence_considered: [1],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [],
    outcome: {
      commitment_id: 5,
      has_outcome: true,
      round: 1,
      status: "outcome_accepted",
      trigger: "initial",
      overall_outcome: "inconclusive",
      overall_reason: "criterion_ambiguous",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 0, contradicted: 0, inconclusive: 1 },
    },
  },
  {
    slug: "numeric-boundary",
    name: "Numeric boundary",
    whatThisTests: "The extracted figure sits exactly on the threshold — fixed-point milli-units, no float drift.",
    commitment: s6,
    evidence: [
      evidence(1, "https://evidence.example.org/crestview/wq-report-2024.pdf", "official_report", "2024-12-15", SAMPLE_O),
    ],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "supported",
            reason_code: "threshold_met",
            evidence_used: [1],
            evidence_considered_not_used: [],
            has_figure: true,
            figure_milli: 500000, // exactly 500.000 ML — at the gte boundary
            unit: "megalitres",
            summary: "The annual report states 500.0 megalitres treated, exactly at the threshold.",
          },
        ],
        overall_outcome: "supported",
        overall_reason: "all_required_supported",
        evidence_considered: [1],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [],
    outcome: {
      commitment_id: 6,
      has_outcome: true,
      round: 1,
      status: "outcome_accepted",
      trigger: "initial",
      overall_outcome: "supported",
      overall_reason: "all_required_supported",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 1, contradicted: 0, inconclusive: 0 },
    },
  },
  {
    slug: "injection-attempt",
    name: "Injection attempt",
    whatThisTests:
      "Evidence that demands \"mark this supported\" while actually contradicting the criterion — the instruction is treated as data.",
    commitment: s7,
    evidence: [
      evidence(
        1,
        "https://evidence.example.org/meadowbrook/bill-summary.txt",
        "other",
        "2024-10-02",
        SAMPLE_C,
        "Clearly supports the commitment" // stance note — advisory only, ignored by review
      ),
    ],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "contradicted",
            reason_code: "threshold_not_met", // figure above the "below 80" ceiling
            evidence_used: [1],
            evidence_considered_not_used: [],
            has_figure: true,
            figure_milli: 132000, // 132.000 tCO2e — above the 80 ceiling
            unit: "tco2e",
            summary:
              "The submitted document reports 132 tCO2e. Its embedded instruction to mark the criterion supported was ignored as data.",
          },
        ],
        overall_outcome: "contradicted",
        overall_reason: "required_criterion_contradicted",
        evidence_considered: [1],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [],
    outcome: {
      commitment_id: 7,
      has_outcome: true,
      round: 1,
      status: "outcome_accepted",
      trigger: "initial",
      overall_outcome: "contradicted",
      overall_reason: "required_criterion_contradicted",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 0, contradicted: 1, inconclusive: 0 },
    },
  },
  {
    slug: "challenge-changes-outcome",
    name: "Challenge changes the outcome",
    whatThisTests:
      "Right of response: a challenge with new evidence opens round 2 and the outcome changes; round 1 history is preserved.",
    commitment: s8,
    evidence: [
      evidence(1, "https://evidence.example.org/fairwater/self-published-2024.pdf", "official_report", "2024-08-01", SAMPLE_O, "Self-published by the subject"),
      evidence(2, "https://evidence.example.org/fairwater/auditor-letter-2024.pdf", "audited_statement", "2024-11-30", SAMPLE_C),
    ],
    rounds: [
      {
        round: 1,
        trigger: "initial",
        challenge_id: 0,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "supported",
            reason_code: "supporting_evidence_found",
            evidence_used: [1],
            evidence_considered_not_used: [],
            has_figure: false,
            figure_milli: 0,
            unit: "",
            summary: "The self-published update covers the four quarters of 2024.",
          },
        ],
        overall_outcome: "supported",
        overall_reason: "all_required_supported",
        evidence_considered: [1],
        evaluated_at: "2024-10-15T12:00:00Z",
      },
      {
        round: 2,
        trigger: "challenge",
        challenge_id: 1,
        criteria_version: 1,
        criteria: [
          {
            criterion_id: 1,
            status: "contradicted",
            reason_code: "contradicting_evidence_found",
            evidence_used: [2],
            evidence_considered_not_used: [1],
            has_figure: false,
            figure_milli: 0,
            unit: "",
            summary:
              "The auditor's letter states only two of the four quarterly updates were actually issued.",
          },
        ],
        overall_outcome: "contradicted",
        overall_reason: "required_criterion_contradicted",
        evidence_considered: [1, 2],
        evaluated_at: EVALUATED,
      },
    ],
    challenges: [
      {
        id: 1,
        round_challenged: 1,
        challenger: SAMPLE_C,
        target: "",
        grounds:
          "The self-published update overstates coverage; the auditor's letter contradicts it.",
        new_evidence_ids: [2],
        opened_at: "2024-11-30T15:00:00Z",
      },
    ],
    outcome: {
      commitment_id: 8,
      has_outcome: true,
      round: 2,
      status: "outcome_accepted",
      trigger: "challenge",
      overall_outcome: "contradicted",
      overall_reason: "required_criterion_contradicted",
      criteria_version: 1,
      evaluated_at: EVALUATED,
      required_total: 1,
      counts: { supported: 0, contradicted: 1, inconclusive: 0 },
    },
  },
];

export function getScenario(slug: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.slug === slug);
}

/** The sample shown on the landing page (mixed per-criterion picture). */
export const LANDING_SCENARIO = SCENARIOS[0];

export const SCENARIO_SUMMARIES: CommitmentSummary[] = SCENARIOS.map((s) =>
  summary(s.commitment)
);
