/**
 * Tests for the contract's audit-trail and retrieval surfaces.
 *
 * These cover the UI added with the contract's second hardening pass:
 * the verbatim passage a verdict rests on, a figure that was NOT verified, a
 * criterion a challenge round kept from the prior round, and the difference
 * between "read and not cited" and "could not be read".
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CriterionLedger } from "@/components/CriterionLedger";
import { RETRIEVAL_IS_READ, RETRIEVAL_LABEL } from "@/domain/copy";
import type {
  Criterion,
  CriterionResult,
  EvidenceItem,
  RetrievalRecord,
  RetrievalStatus,
} from "@/domain/types";

const criterion = (over: Partial<Criterion> = {}): Criterion => ({
  id: 1,
  text: "Publishes an annual emissions report",
  measure: "An official report is filed",
  required: true,
  has_threshold: true,
  threshold_milli: 100_000,
  operator: "gte",
  unit: "co2e_tonnes",
  deadline: "",
  ...over,
});

const result = (over: Partial<CriterionResult> = {}): CriterionResult => ({
  criterion_id: 1,
  status: "supported",
  reason_code: "threshold_met",
  evidence_used: [1],
  evidence_considered_not_used: [],
  has_figure: true,
  figure_milli: 120_000,
  unit: "co2e_tonnes",
  summary: "",
  source_quote: "",
  source_evidence_id: 0,
  figure_verified: false,
  held_from_prior: false,
  ...over,
});

const evidence = (id: number, over: Partial<EvidenceItem> = {}): EvidenceItem => ({
  id,
  url: `https://evidence.example.org/report-${id}.pdf`,
  evidence_type: "official_report",
  declared_source_class: "primary",
  source_class_verified: false,
  published_date: "2024-06-01",
  published_date_verified: false,
  note: "",
  submitter: "0xabc0000000000000000000000000000000000001",
  submitted_at: "2024-06-02T09:00:00Z",
  ...over,
});

describe("verdict passage (source_quote)", () => {
  it("shows the verbatim passage and names the source it came from", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[
          result({
            source_quote: "Scope 1 emissions were 120 kt for the period.",
            source_evidence_id: 1,
            figure_verified: true,
          }),
        ]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    expect(
      screen.getByText("Scope 1 emissions were 120 kt for the period."),
    ).toBeInTheDocument();
    expect(screen.getByText(/copied verbatim from source #1/i)).toBeInTheDocument();
  });

  it("says plainly when the figure was NOT confirmed in the passage", () => {
    const { container } = render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[
          result({
            status: "inconclusive",
            reason_code: "figure_unverified",
            has_figure: false,
            source_quote: "The report was published.",
            source_evidence_id: 1,
            figure_verified: false,
          }),
        ]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    // The sentence is split across text and <strong>, so match the row text.
    expect(container.textContent).toMatch(/not confirmed in that passage/i);
    // And it is inconclusive, not supported.
    expect(screen.getByText("Inconclusive")).toBeInTheDocument();
  });

  it("shows no passage block when none was verified", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    expect(screen.queryByText("Passage this rests on")).not.toBeInTheDocument();
  });
});

describe("held_from_prior", () => {
  it("explains that a challenge did not overturn the earlier finding", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result({ held_from_prior: true })]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    expect(screen.getByText(/Kept from the previous round/i)).toBeInTheDocument();
    expect(screen.getByText(/cited no evidence added since that round/i)).toBeInTheDocument();
  });

  it("does not show it on a first-round verdict", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    expect(screen.queryByText(/Kept from the previous round/i)).not.toBeInTheDocument();
  });
});

describe("retrieval status copy", () => {
  it("treats only 'fetched' as read", () => {
    const read = (Object.keys(RETRIEVAL_IS_READ) as RetrievalStatus[]).filter(
      (s) => RETRIEVAL_IS_READ[s],
    );
    expect(read).toEqual(["fetched"]);
  });

  it("never describes an unreadable source as merely uncited", () => {
    // The wording must be about NOT BEING READ, not about the content.
    for (const status of ["unreachable", "http_error", "blocked", "unsupported_format", "empty"] as const) {
      const label = RETRIEVAL_LABEL[status].toLowerCase();
      expect(label).not.toMatch(/not cited|irrelevant|found no|no evidence/);
    }
  });

  it("has copy for every retrieval status the contract can emit", () => {
    for (const status of [
      "fetched",
      "unreachable",
      "http_error",
      "blocked",
      "unsupported_format",
      "empty",
      "unknown",
    ] as RetrievalStatus[]) {
      expect(RETRIEVAL_LABEL[status], `missing copy for ${status}`).toBeTruthy();
    }
  });

  it("models a retrieval record as the contract returns it", () => {
    const record: RetrievalRecord = {
      evidence_id: 1,
      source: "evidence",
      status: "unreachable",
      url: "https://evidence.example.org/report-1.pdf",
    };
    expect(RETRIEVAL_IS_READ[record.status]).toBe(false);
  });
});

describe("declared, unverified evidence facts", () => {
  it("marks the submitter's note as not used by the review", () => {
    const { container } = render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1, { note: "this looks damning" })]}
        defaultExpanded
      />,
    );
    expect(container.textContent).toMatch(/not used by the review/i);
    // And the ledger never presents an unverified fact as verified.
    expect(container.textContent).not.toMatch(/verified source/i);
  });
});