/**
 * Round-diff blocks on the round timeline.
 *
 * The base timeline already shows what changed between rounds. These pin the
 * three additions that complete the diff: results kept from the prior round,
 * evidence that was considered but no verdict cites, and the sources a round
 * could not actually read — recorded as exactly that, not as evidence.
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RoundTimeline } from "@/components/RoundTimeline";
import type { CriterionResult, EvidenceItem, RoundRecord } from "@/domain/types";

const EVIDENCE: EvidenceItem[] = [
  {
    id: 1,
    url: "https://example.org/one",
    evidence_type: "official_report",
    declared_source_class: "primary",
    source_class_verified: false,
    published_date: "2026-01-10",
    published_date_verified: false,
    note: "",
    submitter: "0xaa",
    submitted_at: "2026-01-11",
  },
  {
    id: 2,
    url: "https://example.org/two",
    evidence_type: "news_article",
    declared_source_class: "secondary",
    source_class_verified: false,
    published_date: "2026-02-10",
    published_date_verified: false,
    note: "",
    submitter: "0xbb",
    submitted_at: "2026-02-11",
  },
  {
    id: 3,
    url: "https://example.org/three",
    evidence_type: "official_report",
    declared_source_class: "primary",
    source_class_verified: false,
    published_date: "2026-03-10",
    published_date_verified: false,
    note: "",
    submitter: "0xcc",
    submitted_at: "2026-03-11",
  },
];

function result(over: Partial<CriterionResult> = {}): CriterionResult {
  return {
    criterion_id: 1,
    status: "supported",
    reason_code: "supporting_evidence_found",
    evidence_used: [1],
    evidence_considered_not_used: [],
    has_figure: false,
    figure_milli: 0,
    unit: "",
    summary: "",
    source_quote: "",
    source_evidence_id: 0,
    figure_verified: false,
    held_from_prior: false,
    ...over,
  };
}

const ROUND_1: RoundRecord = {
  round: 1,
  trigger: "initial",
  challenge_id: 0,
  criteria_version: 1,
  criteria: [result()],
  overall_outcome: "supported",
  overall_reason: "all_required_supported",
  evidence_considered: [1, 2],
  retrieval: [
    { evidence_id: 1, source: "evidence", status: "fetched", url: "https://example.org/one" },
    { evidence_id: 2, source: "evidence", status: "http_error", url: "https://example.org/two" },
  ],
  data_mode: "live",
  evaluated_at: "2026-04-01T00:00:00Z",
};

const ROUND_2: RoundRecord = {
  round: 2,
  trigger: "challenge",
  challenge_id: 1,
  criteria_version: 1,
  criteria: [
    result({ held_from_prior: true }),
    result({
      criterion_id: 2,
      status: "inconclusive",
      reason_code: "no_relevant_evidence",
      evidence_used: [],
    }),
  ],
  overall_outcome: "inconclusive",
  overall_reason: "no_relevant_evidence",
  evidence_considered: [1, 2, 3],
  retrieval: [
    { evidence_id: 3, source: "evidence", status: "fetched", url: "https://example.org/three" },
    { evidence_id: 2, source: "evidence", status: "http_error", url: "https://example.org/two" },
  ],
  data_mode: "live",
  evaluated_at: "2026-05-01T00:00:00Z",
};

function renderTimeline() {
  return render(
    <MemoryRouter>
      <RoundTimeline
        rounds={[ROUND_1, ROUND_2]}
        evidence={EVIDENCE}
        currentRound={2}
        commitmentId={4}
      />
    </MemoryRouter>,
  );
}

describe("round timeline diff", () => {
  it("shows what changed and what was kept from the prior round", () => {
    renderTimeline();

    expect(screen.getByText(/What changed since round 1:/)).toBeInTheDocument();
    expect(screen.getByText(/Criterion 2 changed from/)).toBeInTheDocument();

    expect(screen.getByText(/Kept from round 1:/)).toBeInTheDocument();
    expect(screen.getByText(/Criterion 1 — unchanged/)).toBeInTheDocument();
  });

  it("lists evidence that was considered but no verdict cites", () => {
    renderTimeline();

    // Round 1 considered [1, 2] and cited [1]; round 2 considered [1, 2, 3]
    // and cited [1]. Both rounds therefore have something to list.
    expect(screen.getAllByText("Considered, not used in this round")).toHaveLength(2);
  });

  it("lists the sources a round could not read, with their status", () => {
    renderTimeline();

    expect(screen.getAllByText("Sources that could not be read in this round")).toHaveLength(2);
    expect(screen.getAllByText(/The source returned an error/)).toHaveLength(2);
    expect(screen.getAllByText(/Evidence #2/).length).toBeGreaterThanOrEqual(2);
  });

  it("keeps the evidence-added list for the round after the first", () => {
    renderTimeline();
    expect(screen.getAllByText("Evidence added since the last round").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole("link", { name: "https://example.org/three" }).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
